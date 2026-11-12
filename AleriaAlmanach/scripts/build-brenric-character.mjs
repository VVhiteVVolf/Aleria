import assert from 'node:assert/strict';
import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { getRegisteredFamily } from '../../Stammbäume/assets/js/data/families.registry.js';
import { getPersonBiographyModule, sanitizeBiographyStatsForFirestore } from '../../Stammbäume/assets/js/modules/person-biography/person-biography-model.js';
import { createFamilyPersonCandidate, buildImportedCharacter } from '../modules/character-genealogy/genealogy-mapping.js';
import '../modules/image-library/image-library-model.js';
import { buildAuthoredCharacterImport } from '../../CharakterDatenbank/lib/authored-character-import.mjs';
import { importAuthoredCharacters } from '../../CharakterDatenbank/scripts/import-authored-characters.mjs';

const root = new URL('../../', import.meta.url);
export const BRENRIC_CHARACTER_FEATURE = 'brenric-kriegswart';
export const BRENRIC_CHARACTER_ID = 'person--haus-coeddu--brenric-coeddu';
export const BRENRIC_CHARACTER_SOURCE = 'Charakter Archiv Exporte/brenric-kriegswart-2026-11-07/brenric-coeddu.json';
const authoredAt = '2026-11-07T00:00:00.000Z';
const defaultPortrait = '../Stammbäume/assets/images/portraits/haus-coeddu/brenric-coeddu.png';

export function buildBrenricCharacterExport(artwork) {
  const portrait = artwork.portrait || defaultPortrait;
  const family = getRegisteredFamily('haus-coeddu');
  const person = family.family.persons.find(person => person.id === 'brenric-coeddu');
  const candidate = createFamilyPersonCandidate(family, person);
  assert.equal(candidate.worldPersonId, BRENRIC_CHARACTER_ID);
  assert.equal(candidate.birth, '1682');
  assert.equal(candidate.relationships.partners.length, 1);
  assert.equal(candidate.relationships.children.length, 4);
  assert.equal(artwork.emotes.length, 9);
  assert.equal(new Set(artwork.emotes.map(emote => emote.img)).size, 9);
  const biography = getPersonBiographyModule(person);
  assert(biography?.biography?.historyText, 'Registrierte Brenric-Biografie fehlt.');
  biography.stats = sanitizeBiographyStatsForFirestore(biography.stats);
  const media = globalThis.AleriaCharacterImageSets.prepareStorage({ imageSets: [{
    id: 'standard', name: 'Standard', portrait, emotes: artwork.emotes,
    createdAt: authoredAt, updatedAt: authoredAt
  }], activeImageSetId: 'standard' });
  assert.equal(media.imageSets.length, 1);
  assert.equal(media.imageSets[0].emotes.length, 9);
  const character = { ...buildImportedCharacter(candidate, null, authoredAt), ...media,
    id: BRENRIC_CHARACTER_ID, name: 'Brenric Coeddu',
    title: 'Kriegswart der Aufklärung · Ritter im Dienst von Haus Draig',
    role: 'Kriegswart der Aufklärung', fraktion: 'Haus Draig · Haus Coeddu',
    race: 'Mensch', age: 58, currentLocation: 'Gwynthor · Llamreis Ankunft · Celtigerns Wacht',
    origin: 'Rheunwaith · Cenyr', portrait,
    bio: 'Brenric Coeddu, geboren 1682, ist ein achtundfünfzigjähriger Ritter im Dienst von Haus Draig und Kriegswart der Aufklärung unter Feldmarschall Maredudd Draig. Der Veteran des Großen Krieges zog sich wegen wiederkehrender Gelenk- und Fußbeschwerden aus dem Felddienst zurück. Heute bündelt er Lageauswertung, Karten, militärische Boten und Signale und gleicht Hinweise mit Efael Gwyllachs Aufklärungsnetz ab. Er ist mit Gweneth verheiratet und Vater von Rhydian, Llywelyn, Maelwen und Thalor. Sein persönlicher Ritterstand ändert den bürgerlichen Rang des Hauses Coeddu nicht.',
    biography
  };
  delete character.inventory;
  delete character.playerOwner;
  assert(!Object.hasOwn(character, 'combatProfile'));
  return { type: 'aleria-character', version: 3, exportedAt: authoredAt,
    mergeStrategy: 'replace-exported-fields', assignedTab: 'Gwynthor',
    sourcePath: BRENRIC_CHARACTER_SOURCE,
    sourceNote: 'Bestehende Weltperson aus Haus Coeddu. Amtsbesetzung und persönlicher Ritterstand nach Benutzerentscheidung vom 07.11.2026; 453 Onlineakten vor der Neuanlage ohne Brenric-Gegenprofil geprüft. Kein Inventar, Besitzer oder Kampfprofil enthalten.',
    character };
}

export async function buildBrenricCharacter({ mode = '--plan' } = {}) {
  assert(['--plan', '--write', '--check'].includes(mode));
  const readJson = async path => JSON.parse(await readFile(new URL(path, root), 'utf8'));
  const artwork = await readJson('AleriaAlmanach/modules/brenric-kriegswart/brenric-artwork.json');
  const entry = buildBrenricCharacterExport(artwork);
  const family = getRegisteredFamily('haus-coeddu');
  const candidates = [createFamilyPersonCandidate(family, family.family.persons.find(person => person.id === 'brenric-coeddu'))];
  for (const image of [entry.character.portrait, ...entry.character.imageSets[0].emotes.map(emote => emote.img)]) {
    if (!/^https:\/\//.test(image)) await access(new URL(image, new URL('AleriaAlmanach/', root)));
  }
  const paths = ['CharakterDatenbank/registry.json', 'CharakterDatenbank/generated/characters.snapshot.json', 'CharakterDatenbank/generated/sync-report.json'];
  const stateBytes = await Promise.all(paths.map(path => readFile(new URL(path, root))));
  const [registry, snapshot, report] = stateBytes.map(bytes => JSON.parse(bytes.toString('utf8')));
  const selectedRows = registry.records.filter(row => row.firestoreDocumentId === BRENRIC_CHARACTER_ID);
  const existingRecords = await Promise.all(selectedRows.map(row => readJson(`CharakterDatenbank/${row.path}`)));
  const result = buildAuthoredCharacterImport({ registry, snapshot, report, existingRecords }, [entry], BRENRIC_CHARACTER_FEATURE, candidates);
  assert.equal(result.records.length, 1);
  const selected = result.records[0];
  assert.equal(selected.record.identity.worldPersonId, BRENRIC_CHARACTER_ID);
  assert.equal(selected.record.classification.familyStatus, 'linked');
  assert.equal(selected.record.classification.families[0].familyId, 'haus-coeddu');
  assert.deepEqual(result.snapshot.characters.filter(character => character.id !== BRENRIC_CHARACTER_ID), snapshot.characters.filter(character => character.id !== BRENRIC_CHARACTER_ID));
  assert.deepEqual(result.registry.records.filter(row => row.recordId !== selected.record.recordId), registry.records.filter(row => row.recordId !== selected.record.recordId));
  const hash = value => createHash('sha256').update(value).digest('hex');
  const plan = { feature: BRENRIC_CHARACTER_FEATURE, productionWrites: 0, imported: 1,
    newIdentities: selectedRows.length ? 0 : 1, runtimeId: BRENRIC_CHARACTER_ID,
    worldPersonId: selected.record.identity.worldPersonId,
    sourcePath: BRENRIC_CHARACTER_SOURCE, recordPath: `CharakterDatenbank/${selected.path}`,
    imageSets: 1, emotes: 9, previousCharacters: snapshot.characters.length,
    resultingCharacters: result.snapshot.characters.length,
    unrelatedCharactersPreserved: snapshot.characters.filter(character => character.id !== BRENRIC_CHARACTER_ID).length,
    baseline: paths.map((path, i) => ({ path, sha256: hash(stateBytes[i]) })),
    sourceSha256: hash(JSON.stringify(entry, null, 2) + '\n') };
  const diagnosis = new URL('diagnostics/brenric-kriegswart-20261107/', root);
  if (mode === '--plan') {
    await mkdir(diagnosis, { recursive: true });
    await writeFile(new URL('character-import-plan.json', diagnosis), JSON.stringify(plan, null, 2) + '\n');
  } else {
    if (mode === '--write') {
      const previous = await readJson('diagnostics/brenric-kriegswart-20261107/character-import-plan.json');
      assert.deepEqual(previous.baseline, plan.baseline, 'Datenbank seit Planung geändert.');
      assert.equal(previous.sourceSha256, plan.sourceSha256, 'Figurenquelle seit Planung geändert.');
      const backup = new URL('before/character-import/', diagnosis);
      await mkdir(backup, { recursive: true });
      for (const [i, path] of paths.entries()) {
        assert((await readFile(new URL(path, root))).equals(stateBytes[i]), `Zeitstand verändert: ${path}`);
        await writeFile(new URL(`${i}-${path.split('/').at(-1)}`, backup), stateBytes[i], { flag: 'wx' }).catch(error => { if (error.code !== 'EEXIST') throw error; });
      }
    }
    const protectedFiles = await Promise.all(registry.records.filter(row => row.recordId !== selected.record.recordId).map(async row => ({ path: `CharakterDatenbank/${row.path}`, sha256: hash(await readFile(new URL(`CharakterDatenbank/${row.path}`, root))) })));
    const sourceUrl = new URL(BRENRIC_CHARACTER_SOURCE, root), content = JSON.stringify(entry, null, 2) + '\n';
    if (mode === '--check') assert.equal(await readFile(sourceUrl, 'utf8'), content);
    else { await mkdir(new URL('.', sourceUrl), { recursive: true }); await writeFile(sourceUrl, content); }
    await importAuthoredCharacters({ sources: [BRENRIC_CHARACTER_SOURCE], feature: BRENRIC_CHARACTER_FEATURE, familyCandidates: candidates, check: mode === '--check' });
    for (const item of protectedFiles) assert.equal(hash(await readFile(new URL(item.path, root))), item.sha256, `Fremde Akte verändert: ${item.path}`);
    if (mode === '--write') await writeFile(new URL('character-import-complete.json', diagnosis), JSON.stringify({ ...plan, unrelatedRecordFilesPreserved: protectedFiles.length }, null, 2) + '\n');
  }
  return plan;
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  assert(process.argv.length <= 3, 'Verwendung: build-brenric-character.mjs [--plan|--write|--check]');
  console.log(JSON.stringify(await buildBrenricCharacter({ mode: process.argv[2] || '--plan' })));
}
