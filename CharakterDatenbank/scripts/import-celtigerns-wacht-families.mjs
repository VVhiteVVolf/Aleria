import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { buildAuthoredCharacterImport } from '../lib/authored-character-import.mjs';
import { importAuthoredCharacters } from './import-authored-characters.mjs';
import { sanitizeCharacterBiographyForFirestore } from '../../AleriaAlmanach/modules/characters/character-save-guard.js';
import { buildFamilyPersonViewUrl, createFamilyCandidates } from '../../AleriaAlmanach/modules/character-genealogy/genealogy-mapping.js';
import { CELTIGERNS_WACHT_SERVICE_FAMILIES } from '../../Stammbäume/assets/js/data/celtigerns-wacht-families/family-records.js';
import { CELTIGERNS_WACHT_FAMILY_SOURCE } from '../../Stammbäume/assets/js/data/celtigerns-wacht-families/family-sources.js';

const [mode, ...extra] = process.argv.slice(2);
if (extra.length || !['--write', '--check'].includes(mode)) {
  throw new Error('Verwendung: import-celtigerns-wacht-families.mjs --write oder --check');
}
const root = new URL('../../', import.meta.url);
const exportedAt = '2026-11-27T18:12:03Z';
const feature = CELTIGERNS_WACHT_FAMILY_SOURCE;
const readJson = async path => JSON.parse(await readFile(new URL(path, root), 'utf8'));

const candidates = CELTIGERNS_WACHT_SERVICE_FAMILIES.flatMap(family =>
  createFamilyCandidates({
    id: family.document.id,
    title: family.document.title,
    folderPath: family.document.houseProfile.folderPath,
    family,
  }).filter(candidate => family.persons.some(person =>
    person.id === candidate.personId && person.extensions.authoredSource === feature)));

const exports = CELTIGERNS_WACHT_SERVICE_FAMILIES.flatMap(family =>
  family.persons.filter(person => person.extensions.authoredSource === feature).map(person => {
    const portrait = `../Stammbäume/${person.portrait}`;
    const age = person.extensions.portraitAge;
    const ageLabel = age === undefined ? person.extensions.ageEstimate : `${age} Jahre`;
    const biography = sanitizeCharacterBiographyForFirestore({ biography: {
      schema: 'aleria.biography-module',
      schemaVersion: 1,
      pageTitle: person.name,
      stats: [['Name', person.name], ['Familie', family.document.title],
        ...(person.title ? [['Einordnung', person.title]] : []),
        ...(ageLabel ? [['Alter', ageLabel]] : [])],
      biography: {
        portrait,
        biographyTitle: person.title || 'Biografie',
        biographyText: person.notes,
        documentsTitle: 'Stammbaum',
        documents: [{
          title: family.document.title,
          text: 'Personenkarte und belegte Familienverbindungen',
          link: buildFamilyPersonViewUrl({ familyId: family.document.id, personId: person.id }),
        }],
      },
    } }).biography;
    return {
      type: 'aleria-character',
      version: 1,
      exportedAt,
      sourcePath: `Charakter Archiv Exporte/Celtigerns Wacht Familien/${person.id}.json`,
      character: {
        id: person.worldPersonId,
        name: person.name,
        title: person.title,
        gender: person.sex,
        portrait,
        bio: person.notes,
        biography,
        identity: { worldPersonId: person.worldPersonId },
        genealogy: { worldPersonId: person.worldPersonId },
        ...(age !== undefined ? { age } : {}),
        archived: false,
      },
    };
  }));

const ids = new Set(exports.map(entry => entry.character.id));
const [registry, snapshot, report] = await Promise.all(
  ['registry.json', 'generated/characters.snapshot.json', 'generated/sync-report.json']
    .map(path => readJson(`CharakterDatenbank/${path}`)));
const existingRecords = await Promise.all(registry.records.filter(row => ids.has(row.firestoreDocumentId))
  .map(row => readJson(`CharakterDatenbank/${row.path}`)));
const projected = buildAuthoredCharacterImport({ registry, snapshot, report, existingRecords }, exports, feature, candidates);
const untouched = snapshot.characters.filter(character => !ids.has(character.id));
assert.deepEqual(projected.snapshot.characters.filter(character => !ids.has(character.id)), untouched);
for (const item of projected.records) {
  const candidate = candidates.find(candidate => candidate.worldPersonId === item.record.identity.worldPersonId);
  assert.equal(item.record.classification.primary.id, candidate.familyId);
  assert.equal(item.record.classification.familyStatus, 'linked');
  assert.deepEqual(item.record.classification.places, []);
  assert.match(item.record.character.taxonomyPath, /^Cenyr > Celtigerns Wacht >/);
}
assert.equal(projected.records.length, exports.length);

for (const entry of exports) {
  const target = new URL(entry.sourcePath, root);
  const text = JSON.stringify(entry, null, 2) + '\n';
  if (mode === '--check') assert.equal(await readFile(target, 'utf8'), text, entry.sourcePath);
  else {
    await mkdir(new URL('.', target), { recursive: true });
    await writeFile(target, text, 'utf8');
  }
}

const result = await importAuthoredCharacters({
  sources: exports.map(entry => entry.sourcePath),
  feature,
  check: mode === '--check',
  familyCandidates: candidates,
});
const after = await readJson('CharakterDatenbank/generated/characters.snapshot.json');
assert.deepEqual(after.characters.filter(character => !ids.has(character.id)), untouched);
console.log(JSON.stringify({ ...result, check: mode === '--check' }));
