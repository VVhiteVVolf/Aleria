// Bounded local repair: derive one public family projection with the shared
// generator. Never invokes its broad write/prune CLI and never reads root data.
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir, unlink, stat } from 'node:fs/promises';
import { dirname, resolve, relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildCharacterDatabase } from '../../CharakterDatenbank/lib/character-database-model.mjs';
import { mergeCharacterRecordProjections } from '../../CharakterDatenbank/lib/character-record-projections.mjs';
import { createFamilyCandidates, buildFamilyPersonViewUrl } from '../../AleriaAlmanach/modules/character-genealogy/genealogy-mapping.js';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';

const root = fileURLToPath(new URL('../../', import.meta.url));
const databaseRoot = resolve(root, 'CharakterDatenbank');
const recordsRoot = resolve(databaseRoot, 'records');
const recordId = 'character--glendower-o-cenyr';
const read = async path => JSON.parse(await readFile(resolve(databaseRoot, path), 'utf8'));
const registry = await read('registry.json'), snapshot = await read('generated/characters.snapshot.json'), report = await read('generated/sync-report.json');
const rows = registry.records.filter(row => row.recordId === recordId);
assert.equal(rows.length, 1, 'Exactly one existing public record');
const beforeRow = rows[0], previous = await read(beforeRow.path);
const beforePerson = snapshot.characters.find(person => person.id === previous.character.id);
assert.ok(beforePerson);
assert.equal(previous.recordId, recordId);
assert.equal(previous.character.id, 'glendower-o-cenyr');
const familyCandidates = FAMILY_REGISTRY.flatMap(family => createFamilyCandidates(family).map(candidate => ({ ...candidate, url: buildFamilyPersonViewUrl(candidate) })));
const generated = buildCharacterDatabase({ characters: previous.sources.firestoreExports,
  exportedAt: previous.sync.sourceExportedAt, charTabs: snapshot.charTabs }, familyCandidates,
  { sourcePath: previous.sync.sourceArchive }).records;
assert.equal(generated.length, 1);
const item = generated[0];
assert.equal(item.record.recordId, previous.recordId);
assert.equal(item.record.character.id, previous.character.id);
assert.equal(item.record.classification.primary.id, 'haus-twyllod');
assert.equal(item.record.classification.familyStatus, 'linked');
assert.deepEqual(item.record.sources, previous.sources, 'Original source receipts stay intact');
const linkageFields = new Set(['identity', 'genealogy', 'taxonomyPath']);
for (const field of new Set([...Object.keys(previous.character), ...Object.keys(item.record.character)])) {
  if (!linkageFields.has(field)) assert.deepEqual(item.record.character[field], previous.character[field], `Existing character field preserved: ${field}`);
}
assert.deepEqual(item.record.character.inventory, previous.character.inventory);
assert.deepEqual(item.record.character.combatProfile, previous.character.combatProfile);
item.record.local = structuredClone(previous.local);
if (previous.local?.authoredFeature) item.snapshotCharacter.localRecord.authoredFeature = previous.local.authoredFeature;
const merged = mergeCharacterRecordProjections({ registry, snapshot, report }, [item], [], snapshot.charTabs);
for (const row of registry.records.filter(row => row.recordId !== recordId)) {
  assert.deepEqual(merged.registry.records.find(candidate => candidate.recordId === row.recordId), row, 'Unselected registry row unchanged');
}
for (const person of snapshot.characters.filter(person => person.id !== previous.character.id)) {
  assert.deepEqual(merged.snapshot.characters.find(candidate => candidate.id === person.id), person, 'Unselected snapshot unchanged');
}
// A moved row follows the generator's existing index order; other rows keep
// their contents and relative order. No other record files are regenerated.
const compare = (a, b) => {
  const order = { family: 0, group: 1, place: 2, unassigned: 3 };
  return order[a.primary.kind] - order[b.primary.kind]
    || a.primary.label.localeCompare(b.primary.label, 'de', { sensitivity: 'base' })
    || a.name.localeCompare(b.name, 'de', { sensitivity: 'base' })
    || a.recordId.localeCompare(b.recordId);
};
merged.registry.records.sort(compare);
const rank = new Map(merged.registry.records.map((row, index) => [row.recordId, index]));
merged.snapshot.characters.sort((a, b) => rank.get(a.localRecord.recordId) - rank.get(b.localRecord.recordId));
function recordPath(path) {
  const absolute = resolve(databaseRoot, path), inside = relative(recordsRoot, absolute);
  assert.ok(inside && !inside.startsWith('..') && !isAbsolute(inside), 'Record path remains inside the public records directory');
  return absolute;
}
const oldPath = recordPath(beforeRow.path), newPath = recordPath(item.path);
assert.notEqual(oldPath, newPath);
const newFile = await stat(newPath).catch(error => { if (error.code !== 'ENOENT') throw error; return null; });
assert.equal(newFile, null, 'Never overwrite a second existing record');
if (process.argv.includes('--apply')) {
  assert.deepEqual(await read(beforeRow.path), previous, 'Selected source is unchanged since validation');
  for (const [path, content] of [['registry.json', registry], ['generated/characters.snapshot.json', snapshot], ['generated/sync-report.json', report]]) {
    assert.deepEqual(await read(path), content, 'Projection source has not changed during validation');
  }
  await mkdir(dirname(newPath), { recursive: true });
  await writeFile(newPath, JSON.stringify(item.record, null, 2) + '\n');
  for (const [path, content] of [['registry.json', merged.registry], ['generated/characters.snapshot.json', merged.snapshot], ['generated/sync-report.json', merged.report]]) {
    await writeFile(resolve(databaseRoot, path), JSON.stringify(content, null, 2) + '\n');
  }
  assert.deepEqual(await read(item.path), item.record);
  await unlink(oldPath);
}
console.log(JSON.stringify({ applied: process.argv.includes('--apply'), recordId, oldPath: beforeRow.path, newPath: item.path,
  preservedOnlineId: previous.character.id, untouchedOtherRecords: registry.records.length - 1, inventoryPreserved: true, combatProfilePreserved: true }));
