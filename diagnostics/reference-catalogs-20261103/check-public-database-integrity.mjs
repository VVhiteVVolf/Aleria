// Read-only consistency check of stored public projections. This does not
// replace newer confirmed character records with historical export material.
import assert from 'node:assert/strict';
import { readFile, access, writeFile } from 'node:fs/promises';
import { resolve, relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import { characterDatabaseContentHash } from '../../CharakterDatenbank/lib/character-database-model.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url)), databaseRoot = resolve(root, 'CharakterDatenbank');
const read = async path => JSON.parse(await readFile(resolve(databaseRoot, path), 'utf8'));
const registry = await read('registry.json'), snapshot = await read('generated/characters.snapshot.json'), report = await read('generated/sync-report.json');
const findings = [];
const check = (valid, kind, path = '', fields = []) => { if (!valid) findings.push({ kind, path, ...(fields.length ? { fields } : {}) }); };
assert.equal(new Set(registry.records.map(row => row.recordId)).size, registry.records.length);
assert.equal(new Set(registry.records.map(row => row.path)).size, registry.records.length);
assert.equal(new Set(snapshot.characters.map(person => person.id)).size, snapshot.characters.length);
assert.equal(registry.count, registry.records.length);
assert.equal(snapshot.characters.length, registry.records.length);
const people = new Map(snapshot.characters.map(person => [person.id, person]));
for (const row of registry.records) {
  const absolute = resolve(databaseRoot, row.path), inside = relative(resolve(databaseRoot, 'records'), absolute);
  assert.ok(inside && !inside.startsWith('..') && !isAbsolute(inside));
  const record = await read(row.path), person = people.get(record.character.id);
  assert.ok(person, row.path);
  assert.equal(record.recordId, row.recordId, row.path);
  assert.equal(person.localRecord.recordId, row.recordId, row.path);
  assert.equal(person.localRecord.path, row.path, row.path);
  const hash = characterDatabaseContentHash(record.character, record.classification, record.sync.sourceDocumentIds);
  check(record.sync.contentHash === hash, 'record-hash', row.path);
  check(row.contentHash === hash, 'registry-hash', row.path);
  check(person.localRecord.contentHash === hash, 'snapshot-hash', row.path);
  check(isDeepStrictEqual(row.primary, record.classification.primary), 'classification', row.path);
  assert.equal(row.familyStatus, record.classification.familyStatus, row.path);
  check(isDeepStrictEqual(row.firestoreDocumentIds, record.links.firestore.documentIds), 'document-ids', row.path);
  const { localRecord: snapshotMetadata, ...character } = person;
  const { localRecord: exportedMetadata, ...recordCharacter } = record.character;
  const changedFields = [...new Set([...Object.keys(character), ...Object.keys(recordCharacter)])].filter(key => !isDeepStrictEqual(character[key], recordCharacter[key]));
  check(changedFields.length === 0, 'snapshot-character', row.path, changedFields);
  assert.ok(record.sync.sourceArchive.startsWith('Charakter Archiv Exporte/') && !record.sync.sourceArchive.includes('..'));
  await access(resolve(root, record.sync.sourceArchive));
}
assert.equal(report.summary.total, registry.records.length);
assert.equal(report.summary.familyLinked, registry.records.filter(row => row.familyStatus === 'linked').length);
for (const [field, kind] of Object.entries({ primaryFamily: 'family', primaryGroup: 'group', primaryPlace: 'place', primaryUnassigned: 'unassigned' })) {
  assert.equal(report.summary[field], registry.records.filter(row => row.primary.kind === kind).length, field);
}
check(isDeepStrictEqual(new Set(report.pending.map(row => row.recordId)), new Set(registry.records.filter(row => row.familyStatus !== 'linked').map(row => row.recordId))), 'report-pending');
await writeFile(new URL('./public-database-integrity.json', import.meta.url), JSON.stringify({ records: registry.records.length, findings }, null, 2) + '\n');
console.log(JSON.stringify({ records: registry.records.length, uniqueIds: true, safePaths: true, reportCounts: 'consistent', sourceReceipts: 'present',
  findings: findings.length, kinds: Object.fromEntries([...new Set(findings.map(finding => finding.kind))].map(kind => [kind, findings.filter(finding => finding.kind === kind).length])) }));
if (findings.length) process.exitCode = 1;
