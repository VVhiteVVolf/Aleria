import test from 'node:test';
import assert from 'node:assert/strict';
import { projectGawainFamilySnapshot } from '../modules/gawain-duncan/gawain-family-snapshot.mjs';
import { gawainFamilyBackupPath } from '../modules/gawain-duncan/gawain-family-backup.mjs';
import { GAWAIN_ID, GAWAIN_WORLD_ID, GAWAIN_PUBLIC_SUMMARY, GAWAIN_PUBLIC_BIOGRAPHY } from '../modules/gawain-duncan/gawain-public-biography.mjs';
import { reviewedCharacterTraitAssignment } from '../modules/character-trait-review/reviewed-character-traits.js';
import { PREVIOUS_DEVELOPMENT_TRAITS } from '../modules/character-development/development-trait-revision-source.js';

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

test('exact current, historical and mixed published cards never create a new family revision', () => {
  const previousCards = reviewedCharacterTraitAssignment(GAWAIN_ID).traits.map(id => {
    const trait = PREVIOUS_DEVELOPMENT_TRAITS.find(row => row.id === `development-trait-${id}`);
    return { title: trait.name, detail: trait.description, icon: trait.icon };
  });
  assert.notDeepEqual(previousCards, GAWAIN_PUBLIC_BIOGRAPHY.biography.abilities);
  for (const mask of [0, 1, 2, 3]) {
    const data = structuredClone(input()), first = projectGawainFamilySnapshot(data);
    const envelope = structuredClone(first.envelope), body = envelope.family.persons[0].extensions.biographyModule.biography;
    body.abilities = body.abilities.map((card, index) => structuredClone(mask & (1 << index) ? card : previousCards[index]));
    const current = { ...data, envelope, registry: first.registry, now: '2027-01-01T00:00:00.000Z' };
    const before = structuredClone(current), result = projectGawainFamilySnapshot(current);
    assert.deepEqual(current, before);
    assert.equal(result.changed, false);
    assert.equal(result.registryChanged, false);
    assert.strictEqual(result.envelope, envelope);
    assert.deepEqual(result.envelope.family.persons[0].extensions.biographyModule.biography.abilities, body.abilities);
  }
});

test('card preservation never exempts changed source biography, icon, cost or modifier fields', () => {
  for (const mutate of [
    biography => { biography.biography.abilities[0].title += ' Unapproved'; },
    biography => { biography.biography.abilities[0].detail += ' Unapproved'; },
    biography => { biography.biography.abilities[0].icon = 'unapproved.png'; },
    biography => { biography.biography.abilities[0].cost = 0; },
    biography => { biography.biography.abilities[0].mechanics = { skillModifiers: { sword: 1 } }; },
    biography => { biography.biography.abilities.reverse(); },
    biography => { biography.biography.abilities.pop(); },
    biography => { biography.biography.abilitiesTitle += ' Unapproved'; },
    biography => { biography.biography.biographyText += '<p>Unapproved source</p>'; },
    biography => { biography.quote += ' Unapproved'; },
  ]) {
    const data = structuredClone(input());
    mutate(data.sourceFamily.persons[0].extensions.biographyModule);
    const before = structuredClone(data);
    assert.throws(() => projectGawainFamilySnapshot(data));
    assert.deepEqual(data, before);
  }
});

test('an unapproved saved card is replaced by the exact canonical source rather than preserved', () => {
  for (const mutate of [
    cards => { cards[0].title += ' Unapproved'; },
    cards => { cards[0].detail += ' Unapproved'; },
    cards => { cards[0].icon = 'unapproved.png'; },
    cards => { cards[0].cost = 0; },
    cards => { cards[0].mechanics = { skillModifiers: { sword: 1 } }; },
    cards => { cards.reverse(); },
    cards => { cards.pop(); },
  ]) {
    const data = structuredClone(input()), first = projectGawainFamilySnapshot(data);
    const envelope = structuredClone(first.envelope);
    mutate(envelope.family.persons[0].extensions.biographyModule.biography.abilities);
    const current = { ...data, envelope, registry: first.registry }, before = structuredClone(current);
    const result = projectGawainFamilySnapshot(current);
    assert.deepEqual(current, before);
    assert.equal(result.changed, true);
    assert.deepEqual(result.envelope.family.persons[0].extensions.biographyModule, GAWAIN_PUBLIC_BIOGRAPHY);
  }
});

test('wrong or duplicated Gawain identity and unrelated source content are rejected rather than reconciled', () => {
  const duplicate = input(); duplicate.envelope.family.persons.push(structuredClone(duplicate.envelope.family.persons[0]));
  assert.throws(() => projectGawainFamilySnapshot(duplicate), /eindeutig/);
  const wrong = input(); wrong.sourceFamily.persons[0].id = 'another-gawain';
  assert.throws(() => projectGawainFamilySnapshot(wrong));
  const changedSource = input(); changedSource.sourceFamily.persons[0].notes = 'Ungeprüfter Text';
  assert.throws(() => projectGawainFamilySnapshot(changedSource));
});
