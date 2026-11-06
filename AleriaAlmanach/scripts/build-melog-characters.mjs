import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { buildMelogCharacterExports, MELOG_CHARACTER_FEATURE } from '../modules/zum-honigtoertchen/honigtoertchen-characters.mjs';
import { MELOG_FAMILY_CANDIDATES } from '../modules/zum-honigtoertchen/honigtoertchen-people.mjs';
import { buildAuthoredCharacterImport } from '../../CharakterDatenbank/lib/authored-character-import.mjs';
import { importAuthoredCharacters } from '../../CharakterDatenbank/scripts/import-authored-characters.mjs';

const argumentsAllowed = new Set(['--check']);
if (process.argv.slice(2).some(argument => !argumentsAllowed.has(argument))) throw new Error('Verwendung: build-melog-characters.mjs [--check]');
const check = process.argv.includes('--check');
const root = new URL('../../', import.meta.url);
const readJson = async path => JSON.parse(await readFile(new URL(path, root), 'utf8'));
const digest = data => createHash('sha256').update(JSON.stringify(data)).digest('hex');
const exports = buildMelogCharacterExports();
const ids = new Set(exports.map(entry => entry.character.id));
const [registry, snapshot, report] = await Promise.all([
  'CharakterDatenbank/registry.json', 'CharakterDatenbank/generated/characters.snapshot.json', 'CharakterDatenbank/generated/sync-report.json'
].map(readJson));
const existingRecords = await Promise.all(registry.records.filter(row => ids.has(row.firestoreDocumentId))
  .map(row => readJson(`CharakterDatenbank/${row.path}`)));
const previous = { registry, snapshot, report, existingRecords };
const preview = buildAuthoredCharacterImport(previous, exports, MELOG_CHARACTER_FEATURE, MELOG_FAMILY_CANDIDATES);
assert.equal(preview.records.length, 16);
for (const { record } of preview.records) {
  assert.equal(record.identity.worldPersonId, record.character.id);
  assert.equal(record.classification.familyStatus, 'linked');
  assert(record.links.familyTree.length > 0);
  assert(record.links.familyTree.every(link => link.familyId === 'melog' && link.worldPersonId === record.character.id
    && link.url.includes('family=melog') && link.url.includes(`person=${link.personId}`)));
  assert.equal(record.character.inventory, null);
  assert(!record.character.combatProfile);
}
const foreign = rows => rows.filter(row => !ids.has(row.id));
assert.deepEqual(foreign(preview.snapshot.characters), foreign(snapshot.characters));
const priorForeignRows = registry.records.filter(row => !ids.has(row.firestoreDocumentId));
assert.deepEqual(preview.registry.records.filter(row => !ids.has(row.firestoreDocumentId)), priorForeignRows);
const protectedRecords = await Promise.all(priorForeignRows.map(async row => ({ path: row.path,
  sha256: createHash('sha256').update(await readFile(new URL(`CharakterDatenbank/${row.path}`, root))).digest('hex') })));
for (const entry of exports) {
  const url = new URL(entry.sourcePath, root), text = JSON.stringify(entry, null, 2) + '\n';
  if (check) assert.equal(await readFile(url, 'utf8'), text, entry.sourcePath);
  else { await mkdir(new URL('.', url), { recursive: true }); await writeFile(url, text); }
}
const result = await importAuthoredCharacters({ sources: exports.map(entry => entry.sourcePath),
  feature: MELOG_CHARACTER_FEATURE, familyCandidates: MELOG_FAMILY_CANDIDATES, check });
const after = await readJson('CharakterDatenbank/generated/characters.snapshot.json');
assert.equal(digest(foreign(after.characters)), digest(foreign(snapshot.characters)));
for (const record of protectedRecords) assert.equal(createHash('sha256')
  .update(await readFile(new URL(`CharakterDatenbank/${record.path}`, root))).digest('hex'), record.sha256, record.path);
const evidence = { ...result, check, identities: exports.map(entry => ({ id: entry.character.id,
  name: entry.character.name, worldPersonId: entry.character.identity.worldPersonId })),
  foreignCharactersPreserved: priorForeignRows.length, foreignSnapshotDigest: digest(foreign(after.characters)),
  foreignRecordHashes: protectedRecords, productOrRuntimeWrites: false };
if (!check) {
  const output = new URL('diagnostics/melog-20261105/shop/character-import.json', root);
  await mkdir(new URL('.', output), { recursive: true });
  await writeFile(output, JSON.stringify(evidence, null, 2) + '\n');
}
console.log(JSON.stringify({ ...result, identitiesChecked: exports.length, foreignRecordsPreserved: priorForeignRows.length }));
