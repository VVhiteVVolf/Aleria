// Existing, verified public records own their projections. Historical exports
// are intentionally not inputs to this bounded snapshot/registry repair.
import assert from 'node:assert/strict';
import { readFile, writeFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import { mergeCharacterRecordProjections } from '../../CharakterDatenbank/lib/character-record-projections.mjs';
import { characterDatabaseContentHash } from '../../CharakterDatenbank/lib/character-database-model.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url)), databaseRoot = resolve(root, 'CharakterDatenbank');
const read = async path => JSON.parse(await readFile(path, 'utf8'));
const auditPath = new URL('./public-database-full-privacy-audit.json', import.meta.url);
const privacy = await read(auditPath), auditTime = (await stat(auditPath)).mtimeMs;
assert.equal(privacy.verified, true);
assert.equal(privacy.findings.length, 0);
assert.ok(privacy.parentDeltas.every(delta => delta.privateMatches === 0));
const integrity = await read(new URL('./public-database-integrity.json', import.meta.url));
assert.ok(integrity.findings.every(finding => finding.kind === 'snapshot-character' && finding.fields.every(field => field === 'genealogy')));
const projectionFiles = ['registry.json', 'generated/characters.snapshot.json', 'generated/sync-report.json'];
const originals = new Map(await Promise.all(projectionFiles.map(async file => {
  const absolute = resolve(databaseRoot, file);
  assert.ok((await stat(absolute)).mtimeMs <= auditTime, 'Privacy-scanned projection has not changed');
  return [file, await read(absolute)];
})));
const registry = originals.get('registry.json'), snapshot = originals.get('generated/characters.snapshot.json'), report = originals.get('generated/sync-report.json');
const selected = [];
for (const finding of integrity.findings) {
  const row = registry.records.find(row => row.path === finding.path);
  assert.ok(row);
  const path = resolve(databaseRoot, row.path);
  assert.ok((await stat(path)).mtimeMs <= auditTime, 'Privacy-scanned record has not changed');
  const record = await read(path), person = snapshot.characters.find(person => person.id === record.character.id);
  assert.ok(person);
  const expectedHash = characterDatabaseContentHash(record.character, record.classification, record.sync.sourceDocumentIds);
  assert.equal(record.sync.contentHash, expectedHash);
  assert.equal(row.contentHash, expectedHash);
  for (const key of new Set([...Object.keys(person), ...Object.keys(record.character)])) {
    if (key !== 'localRecord' && key !== 'genealogy') assert.ok(isDeepStrictEqual(person[key], record.character[key]), `Protected field remains unchanged: ${key}`);
  }
  const localRecord = { ...person.localRecord, recordId: record.recordId, path: row.path,
    schemaVersion: record.schemaVersion, contentHash: expectedHash, firestoreDocumentIds: record.sync.sourceDocumentIds,
    classification: { primary: record.classification.primary, familyStatus: record.classification.familyStatus,
      families: record.classification.families, groups: record.classification.groups, places: record.classification.places } };
  selected.push({ path: row.path, record, snapshotCharacter: { ...record.character, localRecord } });
}
const merged = mergeCharacterRecordProjections({ registry, snapshot, report }, selected, [], snapshot.charTabs);
const next = new Map([['registry.json', merged.registry], ['generated/characters.snapshot.json', merged.snapshot], ['generated/sync-report.json', merged.report]]);
const changed = [];
for (const [file, value] of next) {
  if (isDeepStrictEqual(value, originals.get(file))) continue;
  changed.push(`CharakterDatenbank/${file}`);
  if (process.argv.includes('--apply')) {
    assert.ok(isDeepStrictEqual(await read(resolve(databaseRoot, file)), originals.get(file)), 'Projection unchanged during validation');
    await writeFile(resolve(databaseRoot, file), JSON.stringify(value, null, 2) + '\n');
  }
}
console.log(JSON.stringify({ applied: process.argv.includes('--apply'), selectedRecords: selected.length, recordFilesRewritten: 0,
  changedFiles: changed, protectedFieldsPreserved: true, privateAudit: 'full-scan-clear' }));
