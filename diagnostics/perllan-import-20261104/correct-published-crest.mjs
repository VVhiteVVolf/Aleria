// Explicit author-approved Perllan media migration. Reconciliation normally
// protects editable emblems, so migrate only these exact old asset references.
import assert from 'node:assert/strict';
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { HOUSE_PERLLAN_FAMILY } from '../../Stammbäume/assets/js/data/house-perllan-family.js';
import { assertValidFamily } from '../../Stammbäume/assets/js/domain/family-schema.js';

const root = new URL('../../Stammbäume/assets/data/published-families/', import.meta.url);
const target = new URL('haus-perllan.json', root);
const originalBytes = await readFile(target);
const previous = JSON.parse(originalBytes);
const registryUrl = new URL('registry.json', root);
const registry = JSON.parse(await readFile(registryUrl, 'utf8'));
const otherRegistryRows = registry.families.filter(row => row.id !== 'haus-perllan');
const source = HOUSE_PERLLAN_FAMILY;
const emblem = source.document.emblem;
assert(emblem.endsWith('/perllan-emblem.png'));
assert.equal(previous.familyId, source.document.id);
assert.equal(previous.family.persons.length, 44);
const directory = emblem.slice(0, emblem.lastIndexOf('/') + 1);
const oldPaths = [directory + 'document-emblem.jpg', directory + 'house-house-perllan.jpg'];
const replacements = new Map(oldPaths.flatMap(old => [
  [old, emblem], [`../Stammbäume/${old}`, `../Stammbäume/${emblem}`]
]));
const changes = [];
function migrate(value, location = []) {
  if (Array.isArray(value)) return value.map((entry, index) => migrate(entry, [...location, index]));
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, migrate(entry, [...location, key])]));
  if (typeof value !== 'string' || !replacements.has(value)) return value;
  changes.push({ path: location, from: value, to: replacements.get(value) });
  return replacements.get(value);
}
const family = migrate(previous.family);
if (!changes.length) {
  assert.equal(previous.revision, 2);
  assert.equal(registry.families.find(row => row.id === 'haus-perllan')?.revision, 2);
  console.log(JSON.stringify({ alreadyCorrected: true, revision: 2, changedReferences: 0 }));
  process.exit(0);
}
assert.equal(previous.revision, 1, 'Only the retained first Perllan snapshot is authorized by this migration.');
assert.equal(changes.length, 31, 'Expected two headers, 27 person icons and two house-biography icons.');
const restored = structuredClone(family);
for (const change of changes) {
  let parent = restored;
  for (const key of change.path.slice(0, -1)) parent = parent[key];
  parent[change.path.at(-1)] = change.from;
}
assert.deepEqual(restored, previous.family, 'No non-media snapshot fields may change.');
for (const key of ['partnerships', 'parentages', 'cadetBranches', 'timeJumps', 'lineage', 'presentation', 'view']) {
  assert.deepEqual(family[key], previous.family[key]);
}
assert.deepEqual(assertValidFamily(family).diagnostics, []);
assert.equal(family.document.emblem, emblem);
assert.equal(family.houses.find(house => house.id === 'house-perllan').emblem, emblem);
assert(!oldPaths.some(old => JSON.stringify(family).includes(old)));
const backupDirectory = new URL('backups/haus-perllan/', root);
const oldBackups = (await readdir(backupDirectory)).filter(name => name.startsWith('r00000001-'));
assert.equal(oldBackups.length, 1);
assert((await readFile(new URL(oldBackups[0], backupDirectory))).equals(originalBytes), 'Revision 1 backup must preserve the exact original snapshot.');
const next = { ...previous, revision: 2, updatedAt: new Date().toISOString(), family };
const text = JSON.stringify(next, null, 2) + '\n';
const backup = `r00000002-${next.updatedAt.replace(/[^0-9A-Z]/gi, '')}.json`;
const rows = registry.families.filter(row => row.id === 'haus-perllan');
assert.equal(rows.length, 1);
Object.assign(rows[0], { emblem, revision: next.revision, updatedAt: next.updatedAt });
assert.deepEqual(registry.families.filter(row => row.id !== 'haus-perllan'), otherRegistryRows);
await writeFile(new URL(backup, backupDirectory), text, { flag: 'wx' });
await writeFile(target, text);
await writeFile(registryUrl, JSON.stringify(registry, null, 2) + '\n');
const report = { schema: 'aleria.perllan-published-crest-correction', revision: 2,
  oldSnapshotSha256: createHash('sha256').update(originalBytes).digest('hex'),
  preservedOriginalBackup: oldBackups[0], newBackup: backup,
  changedReferences: changes.length, changes, identitiesAndRelationshipsPreserved: true,
  otherFamilyRegistryEntriesPreserved: otherRegistryRows.length, firestoreWrites: 0 };
await writeFile(new URL('published-crest-correction.json', import.meta.url), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ revision: 2, changedReferences: changes.length, preservedPersons: 44,
  preservedOriginalBackup: oldBackups[0], newBackup: backup, firestoreWrites: 0 }));
