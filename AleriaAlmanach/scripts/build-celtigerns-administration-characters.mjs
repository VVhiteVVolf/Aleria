import assert from 'node:assert/strict';
import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { buildAdministrationCharacterExports, administrationFamilyCandidate, ADMINISTRATION_CHARACTER_FEATURE } from '../modules/celtigerns-administration-characters/administration-characters.mjs';
import { buildAuthoredCharacterImport } from '../../CharakterDatenbank/lib/authored-character-import.mjs';
import { importAuthoredCharacters } from '../../CharakterDatenbank/scripts/import-authored-characters.mjs';

const mode = process.argv[2] || '--plan';
assert(['--plan', '--write', '--check'].includes(mode) && process.argv.length <= 3,
  'Verwendung: build-celtigerns-administration-characters.mjs [--plan|--write|--check]');
const root = new URL('../../', import.meta.url);
const featurePath = 'AleriaAlmanach/modules/celtigerns-administration-characters/';
const readJson = async path => JSON.parse(await readFile(new URL(path, root), 'utf8'));
const [roster, artwork] = await Promise.all(['administration-roster.json', 'administration-artwork.json'].map(path => readJson(featurePath + path)));
const candidates = roster.people.map(administrationFamilyCandidate).filter(Boolean);
const paths = ['CharakterDatenbank/registry.json', 'CharakterDatenbank/generated/characters.snapshot.json', 'CharakterDatenbank/generated/sync-report.json'];
const stateBytes = await Promise.all(paths.map(path => readFile(new URL(path, root))));
const [registry, snapshot, report] = stateBytes.map(bytes => JSON.parse(bytes.toString('utf8')));
const exports = buildAdministrationCharacterExports(roster, artwork, snapshot.characters);
const ids = new Set(exports.map(entry => entry.character.id));
const locallyProtected = snapshot.characters.filter(character => ids.has(character.id) && character.localRecord?.authoredFeature !== ADMINISTRATION_CHARACTER_FEATURE);
assert(locallyProtected.every(character => character.id === 'person--gwynthor-formlingssache--euddogwy'), 'Weitere lokal bestehende Fremdfigur benötigt eigenen Quellenabgleich.');
const importedExports = exports.filter(entry => !locallyProtected.some(character => character.id === entry.character.id));
const importedIds = new Set(importedExports.map(entry => entry.character.id));
const selectedRows = registry.records.filter(row => importedIds.has(row.firestoreDocumentId));
const existingRecords = await Promise.all(selectedRows.map(row => readJson(`CharakterDatenbank/${row.path}`)));
const result = buildAuthoredCharacterImport({ registry, snapshot, report, existingRecords }, importedExports, ADMINISTRATION_CHARACTER_FEATURE, candidates);
assert.equal(result.records.length, 18);
assert.deepEqual(result.snapshot.characters.filter(character => !importedIds.has(character.id)), snapshot.characters.filter(character => !importedIds.has(character.id)));
assert.deepEqual(result.registry.records.filter(row => !importedIds.has(row.firestoreDocumentId)), registry.records.filter(row => !importedIds.has(row.firestoreDocumentId)));
for (const item of result.records) {
  assert.equal(item.record.character.id, item.record.identity.worldPersonId);
  assert.equal(item.record.links.firestore.documentIds.length, 1);
  assert(!Object.hasOwn(item.record.character, 'inventory'));
  assert(!Object.hasOwn(item.record.character, 'combatProfile'));
  if (roster.people.find(person => person.worldPersonId === item.record.character.id).familyId) assert.equal(item.record.classification.familyStatus, 'linked');
}
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const sourceManifest = { schema: 'aleria.administration-character-sources', schemaVersion: 1,
  feature: ADMINISTRATION_CHARACTER_FEATURE,
  identityAuditPath: 'diagnostics/brenric-kriegswart-20261107/administration-identity-audit.json',
  mediaManifestPath: `${featurePath}administration-artwork.json`,
  sources: exports.map(entry => ({ path: entry.sourcePath, worldPersonId: entry.character.id,
    knownNames: roster.people.find(person => person.worldPersonId === entry.character.id).aliases,
    sha256: hash(JSON.stringify(entry, null, 2) + '\n') })) };
const plan = { feature: ADMINISTRATION_CHARACTER_FEATURE, productionWrites: 0, exports: 19, imported: importedExports.length,
  locallyExistingPreserved: locallyProtected.map(character => character.id),
  newIdentities: importedExports.filter(entry => !snapshot.characters.some(character => character.id === entry.character.id)).length,
  previousCharacters: snapshot.characters.length, resultingCharacters: result.snapshot.characters.length,
  unrelatedCharactersPreserved: snapshot.characters.filter(character => !importedIds.has(character.id)).length,
  linkedFamilies: result.records.filter(item => item.record.classification.familyStatus === 'linked').length,
  independentInstitutionalPeople: roster.people.filter(person => !person.familyId).map(person => ({ name: person.name, worldPersonId: person.worldPersonId })),
  baseline: paths.map((path, i) => ({ path, sha256: hash(stateBytes[i]) })), sources: sourceManifest.sources,
  records: result.records.map(item => ({ path: `CharakterDatenbank/${item.path}`, worldPersonId: item.record.identity.worldPersonId })) };
const diagnosis = new URL('diagnostics/brenric-kriegswart-20261107/', root);
if (mode === '--plan') {
  await mkdir(diagnosis, { recursive: true });
  await writeFile(new URL('administration-import-plan.json', diagnosis), JSON.stringify(plan, null, 2) + '\n');
} else {
  if (mode === '--write') {
    const previous = await readJson('diagnostics/brenric-kriegswart-20261107/administration-import-plan.json');
    assert.deepEqual(previous.baseline, plan.baseline, 'Datenbank seit Planung geändert.');
    assert.deepEqual(previous.sources, plan.sources, 'Quellen seit Planung geändert.');
    const backup = new URL(`before/administration-import-${Date.now()}/`, diagnosis);
    await mkdir(backup, { recursive: true });
    for (const [i, path] of paths.entries()) {
      assert((await readFile(new URL(path, root))).equals(stateBytes[i]), `Zeitstand verändert: ${path}`);
      await writeFile(new URL(`${i}-${path.split('/').at(-1)}`, backup), stateBytes[i], { flag: 'wx' });
    }
    for (const item of result.records.filter(item => !selectedRows.some(row => row.path === item.path))) {
      await access(new URL(`CharakterDatenbank/${item.path}`, root)).then(() => { throw Error(`Unregistrierte Fremdakte am Ziel: ${item.path}`); }, error => { if (error.code !== 'ENOENT') throw error; });
    }
  }
  const protectedFiles = await Promise.all(registry.records.filter(row => !importedIds.has(row.firestoreDocumentId)).map(async row => ({ path: `CharakterDatenbank/${row.path}`, sha256: hash(await readFile(new URL(`CharakterDatenbank/${row.path}`, root))) })));
  const outputs = [...exports.map(entry => [entry.sourcePath, entry]), [`${featurePath}administration-sources.json`, sourceManifest]];
  for (const [path, data] of outputs) {
    const url = new URL(path, root), content = JSON.stringify(data, null, 2) + '\n';
    if (mode === '--check') assert.equal(await readFile(url, 'utf8'), content, `Veraltete Autorenquelle: ${path}`);
    else { await mkdir(new URL('.', url), { recursive: true }); await writeFile(url, content); }
  }
  await importAuthoredCharacters({ sources: importedExports.map(entry => entry.sourcePath), feature: ADMINISTRATION_CHARACTER_FEATURE, familyCandidates: candidates, check: mode === '--check' });
  for (const item of protectedFiles) assert.equal(hash(await readFile(new URL(item.path, root))), item.sha256, `Fremde Akte verändert: ${item.path}`);
  if (mode === '--write') {
    await writeFile(new URL(`administration-import-complete-${Date.now()}.json`, diagnosis), JSON.stringify({ ...plan, unrelatedRecordFilesPreserved: protectedFiles.length }, null, 2) + '\n');
    await writeFile(new URL('administration-import-complete.json', diagnosis), JSON.stringify({ ...plan, unrelatedRecordFilesPreserved: protectedFiles.length }, null, 2) + '\n');
  }
}
console.log(JSON.stringify({ ...plan, sources: undefined, records: undefined }));
