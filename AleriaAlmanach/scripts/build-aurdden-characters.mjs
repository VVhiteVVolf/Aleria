import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { access, copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
import { buildAuthoredCharacterImport } from '../../CharakterDatenbank/lib/authored-character-import.mjs';
import { importAuthoredCharacters } from '../../CharakterDatenbank/scripts/import-authored-characters.mjs';
import { AURDDEN_CHARACTER_FEATURE, buildAurddenCharacterCandidates, buildAurddenCharacterExports } from '../modules/loer-hofjuwelier/aurdden-characters.mjs';

const args = process.argv.slice(2), mode = args[0] || '--plan';
if (args.length > 1 || !['--plan', '--write', '--check'].includes(mode)) throw new Error('Verwendung: build-aurdden-characters.mjs [--plan|--write|--check]');
const root = new URL('../../', import.meta.url);
const readJson = async path => JSON.parse(await readFile(new URL(path, root), 'utf8'));
const hash = value => createHash('sha256').update(typeof value === 'string' || Buffer.isBuffer(value) ? value : JSON.stringify(value)).digest('hex');
const diagnostic = new URL('diagnostics/loer-hofjuwelier-20261109/family/', root);
const paths = ['CharakterDatenbank/registry.json', 'CharakterDatenbank/generated/characters.snapshot.json', 'CharakterDatenbank/generated/sync-report.json'];
const beforeBytes = await Promise.all(paths.map(path => readFile(new URL(path, root))));
const [registry, snapshot, report] = beforeBytes.map(bytes => JSON.parse(bytes));
const exports = buildAurddenCharacterExports(FAMILY_REGISTRY), candidates = buildAurddenCharacterCandidates(FAMILY_REGISTRY);
const ids = new Set(exports.map(entry => entry.character.id));
assert.equal(exports.length, 35); assert.equal(ids.size, 35); assert.equal(candidates.length, 33);
const existingRecords = await Promise.all(registry.records.filter(row => ids.has(row.firestoreDocumentId)).map(row => readJson(`CharakterDatenbank/${row.path}`)));
const preview = buildAuthoredCharacterImport({ registry, snapshot, report, existingRecords }, exports, AURDDEN_CHARACTER_FEATURE, candidates);
assert.equal(preview.records.length, 35);
const selectedRecordIds = new Set(preview.records.map(item => item.record.recordId));
const foreignCharacters = source => source.characters.filter(character => !ids.has(character.id));
assert.deepEqual(foreignCharacters(preview.snapshot), foreignCharacters(snapshot));
assert.deepEqual(preview.registry.records.filter(row => !selectedRecordIds.has(row.recordId)), registry.records.filter(row => !selectedRecordIds.has(row.recordId)));
assert.deepEqual(preview.report.pending.filter(row => !selectedRecordIds.has(row.recordId)), report.pending.filter(row => !selectedRecordIds.has(row.recordId)));
for (const item of preview.records) {
  const source = exports.find(entry => entry.character.id === item.record.character.id).character;
  assert.equal(item.record.identity.worldPersonId, source.id);
  assert.deepEqual(item.record.links.firestore.documentIds, [source.id]);
  assert.equal(item.record.character.inventory, null);
  assert.ok(!item.record.character.combatProfile);
  assert.ok(!item.record.character.playerOwner);
  assert.equal(item.record.classification.familyStatus, source.id.startsWith('person--aurdden-wachen--') ? 'pending' : 'linked');
  assert.ok(item.record.links.familyTree.every(link => link.familyId === 'haus-aurdden' && link.worldPersonId === source.id));
  assert.ok(!source.id.includes('aeron-loer'));
}
const baseline = paths.map((path, index) => ({ path, sha256: hash(beforeBytes[index]) }));
const sourceHashes = exports.map(entry => ({ path: entry.sourcePath, sha256: hash(JSON.stringify(entry, null, 2) + '\n') }));
const foreignRecordHashes = await Promise.all(registry.records.filter(row => !selectedRecordIds.has(row.recordId)).map(async row => ({
  path: `CharakterDatenbank/${row.path}`, sha256: hash(await readFile(new URL(`CharakterDatenbank/${row.path}`, root)))
})));
const plan = { feature: AURDDEN_CHARACTER_FEATURE, imported: 35, familyProfiles: 33, guardProfiles: 2,
  previousCharacters: snapshot.characters.length, resultingCharacters: preview.snapshot.characters.length,
  explicitWorldIds: true, noNameMerging: true, noInventoriesOrCombatValues: true, noAeronImport: true,
  foreignCharactersPreserved: foreignCharacters(snapshot).length, foreignRecordHashes, baseline, sourceHashes,
  records: preview.records.map(item => ({ id: item.record.character.id, worldPersonId: item.record.identity.worldPersonId, name: item.record.identity.name, path: item.path })) };
await mkdir(diagnostic, { recursive: true });
if (mode === '--plan') {
  await writeFile(new URL('character-import-plan.json', diagnostic), JSON.stringify(plan, null, 2) + '\n');
} else {
  if (mode === '--write') {
    const accepted = JSON.parse(await readFile(new URL('character-import-plan.json', diagnostic), 'utf8'));
    assert.deepEqual(accepted.baseline, baseline, 'Datenbank seit Planung geändert.');
    assert.deepEqual(accepted.sourceHashes, sourceHashes, 'Figurenquelle seit Planung geändert.');
    assert.deepEqual(accepted.records, plan.records, 'Identitäten seit Planung geändert.');
    const backup = new URL('character-database-before/', diagnostic); await mkdir(backup, { recursive: true });
    for (const [index, path] of paths.entries()) {
      const target = new URL(`${index}-${path.split('/').at(-1)}`, backup);
      try { await access(target); } catch (error) { if (error.code !== 'ENOENT') throw error; await copyFile(new URL(path, root), target); }
    }
  }
  for (const entry of exports) {
    const target = new URL(entry.sourcePath, root), content = JSON.stringify(entry, null, 2) + '\n';
    if (mode === '--check') assert.equal(await readFile(target, 'utf8'), content, entry.sourcePath);
    else { await mkdir(new URL('.', target), { recursive: true }); await writeFile(target, content); }
  }
  await importAuthoredCharacters({ sources: exports.map(entry => entry.sourcePath), feature: AURDDEN_CHARACTER_FEATURE, familyCandidates: candidates, check: mode === '--check' });
  assert.deepEqual(foreignCharacters(await readJson(paths[1])), foreignCharacters(snapshot));
  for (const protectedFile of foreignRecordHashes) assert.equal(hash(await readFile(new URL(protectedFile.path, root))), protectedFile.sha256, protectedFile.path);
  if (mode === '--write') await writeFile(new URL('character-import-complete.json', diagnostic), JSON.stringify({ ...plan, completedAt: new Date().toISOString(), externalWrites: false }, null, 2) + '\n');
}
console.log(JSON.stringify({ mode, imported: 35, explicitWorldIds: true, previousCharacters: snapshot.characters.length,
  resultingCharacters: preview.snapshot.characters.length, foreignRecordsPreserved: foreignRecordHashes.length, externalWrites: false }));
