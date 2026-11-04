// Preserve the user's actual published Perllan ID and immutable revision 1,
// then enrich only that record from the reviewed local source.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
import { assertValidFamily } from '../../Stammbäume/assets/js/domain/family-schema.js';

const remoteCommit = 'ec32389e89f88bd9b754da93862d933344b03066';
const root = new URL('../../Stammbäume/assets/data/published-families/', import.meta.url);
const remotePath = 'Stammbäume/assets/data/published-families/perllan.json';
const remoteBytes = execFileSync('git', ['show', `${remoteCommit}:${remotePath}`], { cwd: new URL('../../', import.meta.url), maxBuffer: 2 * 1024 * 1024 });
const previous = JSON.parse(remoteBytes);
assert.equal(previous.familyId, 'perllan'); assert.equal(previous.revision, 1);
const record = FAMILY_REGISTRY.find(record => record.id === 'perllan');
assert(record);
const family = assertValidFamily(record.family).family;
assert.equal(family.document.id, 'perllan'); assert.equal(family.persons.length, 44);
for (const person of previous.family.persons) {
  const next = family.persons.find(row => row.id === person.id);
  for (const field of ['id', 'worldPersonId', 'name', 'title', 'birth', 'death', 'status', 'sex', 'houseId', 'familyRole', 'lineageRole', 'tags', 'notes']) {
    assert.deepEqual(next[field], person[field], `${person.id}/${field}`);
  }
}
for (const key of ['partnerships', 'parentages', 'cadetBranches', 'timeJumps', 'lineage', 'presentation', 'view']) assert.deepEqual(family[key], previous.family[key], key);
assert.match(family.document.emblem, /\/perllan-emblem\.png$/);
assert.equal(family.houses[0].id, previous.family.houses[0].id);
assert.equal(family.houses[0].emblem, family.document.emblem);
assert(!/\/(?:document-emblem|house-house-perllan)\.jpg/.test(JSON.stringify(family)));
const target = new URL('perllan.json', root);
const existing = await readFile(target, 'utf8').then(JSON.parse).catch(error => { if (error.code !== 'ENOENT') throw error; });
if (existing?.revision > 1) {
  assert.equal(existing.revision, 2);
  assert.deepEqual(existing.family, family);
  console.log(JSON.stringify({ alreadyIntegrated: true, familyId: 'perllan', revision: 2 }));
  process.exit(0);
}
const backupRoot = new URL('backups/perllan/', root);
await mkdir(backupRoot, { recursive: true });
const originalBackup = `r00000001-${previous.updatedAt.replace(/[^0-9A-Z]/gi, '')}.json`;
const originalBackupUrl = new URL(originalBackup, backupRoot);
const retained = await readFile(originalBackupUrl).catch(error => { if (error.code !== 'ENOENT') throw error; });
if (retained) assert(retained.equals(remoteBytes));
else await writeFile(originalBackupUrl, remoteBytes, { flag: 'wx' });
const next = { ...previous, revision: 2, updatedAt: new Date().toISOString(), family };
const text = JSON.stringify(next, null, 2) + '\n';
const nextBackup = `r00000002-${next.updatedAt.replace(/[^0-9A-Z]/gi, '')}.json`;
await writeFile(new URL(nextBackup, backupRoot), text, { flag: 'wx' });
await writeFile(target, text);
const registryUrl = new URL('registry.json', root);
const registry = JSON.parse(await readFile(registryUrl, 'utf8'));
const foreign = registry.families.filter(row => !['perllan', 'haus-perllan'].includes(row.id));
const entry = { id: 'perllan', familyId: 'perllan', title: family.document.title, motto: family.document.motto || '',
  emblem: family.document.emblem, folderPath: record.folderPath, houseProfile: family.document.houseProfile,
  personCount: 44, revision: 2, updatedAt: next.updatedAt, link: 'Stammbaum.html?family=perllan&mode=view', source: 'github' };
registry.families = [...foreign, entry];
await writeFile(registryUrl, JSON.stringify(registry, null, 2) + '\n');
const report = { remoteCommit, familyId: 'perllan', revision: 2, originalRemoteBytes: remoteBytes.length,
  originalRemoteSha256: createHash('sha256').update(remoteBytes).digest('hex'), originalBackup, nextBackup,
  preservedPeople: 44, preservedPartnerships: 16, preservedParentages: 27, worldIdsUnchanged: true,
  unpublishedAlternateIdExcluded: 'haus-perllan', foreignMainRegistryRowsPreserved: foreign.length, firestoreWrites: 0 };
await writeFile(new URL('remote-perllan-integration.json', import.meta.url), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report));
