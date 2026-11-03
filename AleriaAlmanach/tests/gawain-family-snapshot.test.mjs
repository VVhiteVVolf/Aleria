import test from 'node:test';
import assert from 'node:assert/strict';
import { projectGawainFamilySnapshot } from '../modules/gawain-duncan/gawain-family-snapshot.mjs';
import { gawainFamilyBackupPath } from '../modules/gawain-duncan/gawain-family-backup.mjs';
import { GAWAIN_WORLD_ID, GAWAIN_PUBLIC_SUMMARY, GAWAIN_PUBLIC_BIOGRAPHY } from '../modules/gawain-duncan/gawain-public-biography.mjs';

const input = () => ({
  envelope: { schemaVersion: 1, familyId: 'haus-draig', revision: 2, updatedAt: '2026-09-28T15:05:59.250Z', family: {
    document: { id: 'haus-draig', title: 'Haus Draig' }, persons: [
      { id: 'gawain-draig', worldPersonId: GAWAIN_WORLD_ID, birth: '1722', death: '', houseId: 'house-draig', name: 'Gawain', title: '', notes: '', attributes: { kept: 7 }, extensions: { personal: 'kept' } },
      { id: 'neighbour', worldPersonId: 'world:neighbour', houseId: 'house-duibhne', notes: 'Eigenständiger Stand' }
    ], partnerships: [{ id: 'bond', partners: ['gawain-draig', 'other'] }], parentages: [{ id: 'parentage', childId: 'gawain-draig' }],
    extensions: { sourceRevision: 11, houseBiographyModule: { text: 'Bestehender Hausstand' } }
  } },
  registry: { schemaVersion: 1, families: [{ id: 'other', revision: 19 }, { id: 'haus-draig', personCount: 177, revision: 2, updatedAt: '2026-09-28T15:05:59.250Z', houseProfile: { kept: true } }] },
  sourceFamily: { document: { id: 'haus-draig' }, extensions: { sourceRevision: 15 }, persons: [
    { id: 'gawain-draig', worldPersonId: GAWAIN_WORLD_ID, title: 'Sir', notes: GAWAIN_PUBLIC_SUMMARY, extensions: {
      biographyModule: GAWAIN_PUBLIC_BIOGRAPHY, registryManagedSourceRevision: 12,
      registryManagedFields: ['title', 'notes'], registryManagedFieldRevisions: { title: 12, notes: 12 }, registryManagedExtensionFields: ['biographyModule']
    } }, { id: 'neighbour', worldPersonId: 'world:neighbour', houseId: 'house-foreign-change' }
  ] }, now: '2026-11-01T15:00:00.000Z'
});

test('Gawain-only snapshot updates public biography metadata and preserves every other identity, attribute and relationship', () => {
  const data = input(), before = structuredClone(data), result = projectGawainFamilySnapshot(data);
  assert.deepEqual(data, before);
  const [person, neighbour] = result.envelope.family.persons;
  assert.equal(person.title, 'Sir'); assert.equal(person.notes, GAWAIN_PUBLIC_SUMMARY);
  assert.deepEqual(person.extensions.biographyModule, GAWAIN_PUBLIC_BIOGRAPHY);
  assert.equal(person.extensions.registryManagedSourceRevision, 12);
  assert.equal(person.extensions.personal, 'kept');
  for (const field of ['id', 'worldPersonId', 'birth', 'death', 'houseId', 'name', 'attributes']) assert.deepEqual(person[field], before.envelope.family.persons[0][field]);
  assert.deepEqual(neighbour, before.envelope.family.persons[1]);
  for (const field of ['document', 'partnerships', 'parentages']) assert.deepEqual(result.envelope.family[field], before.envelope.family[field]);
  assert.deepEqual(result.envelope.family.extensions.houseBiographyModule, before.envelope.family.extensions.houseBiographyModule);
  assert.equal(result.envelope.family.extensions.sourceRevision, 12);
  assert.equal(result.envelope.revision, 3);
  assert.deepEqual(result.registry.families[0], before.registry.families[0]);
  assert.deepEqual(result.registry.families[1], { ...before.registry.families[1], revision: 3, updatedAt: data.now });
});

test('repeated Gawain projections do not create new revisions, timestamps or pending changes', () => {
  const data = input(), first = projectGawainFamilySnapshot(data);
  const next = projectGawainFamilySnapshot({ ...data, envelope: first.envelope, registry: first.registry, now: '2027-01-01T00:00:00.000Z' });
  assert.equal(next.changed, false); assert.equal(next.registryChanged, false);
  assert.strictEqual(next.envelope, first.envelope);
  assert.equal(next.envelope.revision, 3); assert.equal(next.envelope.updatedAt, data.now);
});

test('immutable backups distinguish reused historical revisions and exact line endings without overwriting archives', () => {
  const envelope = input().envelope, first = JSON.stringify(envelope) + '\n';
  assert.equal(gawainFamilyBackupPath(envelope, first), gawainFamilyBackupPath(envelope, first));
  assert.notEqual(gawainFamilyBackupPath(envelope, first), gawainFamilyBackupPath(envelope, first.replace(/\n/g, '\r\n')));
  assert.notEqual(gawainFamilyBackupPath(envelope, first), gawainFamilyBackupPath(envelope, first + ' '));
  assert.throws(() => gawainFamilyBackupPath({ ...envelope, familyId: '../other' }, first));
});

test('wrong or duplicated Gawain identity and unrelated source content are rejected rather than reconciled', () => {
  const duplicate = input(); duplicate.envelope.family.persons.push(structuredClone(duplicate.envelope.family.persons[0]));
  assert.throws(() => projectGawainFamilySnapshot(duplicate), /eindeutig/);
  const wrong = input(); wrong.sourceFamily.persons[0].id = 'another-gawain';
  assert.throws(() => projectGawainFamilySnapshot(wrong));
  const changedSource = input(); changedSource.sourceFamily.persons[0].notes = 'Ungeprüfter Text';
  assert.throws(() => projectGawainFamilySnapshot(changedSource));
});
