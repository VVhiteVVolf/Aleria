import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { decodeFirestoreFields, encodeFirestoreFields } from '../../firebase/scripts/backup/firestore-value-codec.mjs';
import { SUPPLIED_GUARD_AVATAR_PEOPLE, buildSuppliedGuardAvatarPatch, buildSuppliedGuardAvatarWrite,
  assertSuppliedGuardAvatarReadBack } from '../modules/draig-leibgarde/supplied-avatar-plan.mjs';

const NOW = '2026-11-12T15:00:00.000Z';
const LATER = '2026-11-12T16:00:00.000Z';
const OLD = '2026-09-22T03:45:19.986Z';

function supplied(person) {
  return { id: person.id, name: person.name, slug: person.slug, portrait: `https://example.test/new/${person.slug}.png`,
    sets: person.numbers.map(number => ({ id: number === 1 ? 'standard' : `set-0${number}`, workshopSetId: `set-0${number}`,
      catalogNumber: number, name: `Dokument-Set ${number}`, outputs: Array.from({ length: 9 }, (_, index) => ({
        index: index + 1, label: `Reaktion ${index + 1}`, sha256: createHash('sha256').update(`${person.id}/${number}/${index}`).digest('hex'),
        localPath: `AleriaAlmanach/AvatarWerkstatt/Charaktere/Einzelcharaktere/${person.name}/Output/set-${number}-${index}.png`,
        url: `https://example.test/new/${person.slug}/${number}/${index}.png`
      })) })) };
}

function existing(person, count) {
  const portrait = `https://example.test/old/${person.slug}.png`;
  const emotes = Array.from({ length: count }, (_, index) => ({ img: `https://example.test/old/${person.slug}/${index}.png`, label: `alt ${index}` }));
  return { id: person.id, name: person.name, portrait, emotes, emotesOverride: true,
    imageSetSchemaVersion: 1, imageSetsOverride: true, activeImageSetId: 'standard',
    imageSets: [{ id: 'standard', name: 'Standard', portrait, emotes, createdAt: OLD, updatedAt: OLD, authorNote: 'erhalten' }],
    biography: { schema: 'aleria.biography-module', revision: 72, stats: [{ label: 'Alter', value: '32 Jahre' }],
      biography: { portrait, biographyText: '<p>Alle belegten Lebensdaten erhalten.</p>',
        extraSections: [{ title: 'Familie', text: 'Alle Angehörigen erhalten.' }],
        connections: [{ name: 'Familienangehöriger', portrait: 'https://example.test/relative.png' }] } },
    bio: 'Vorhandene Kurzbiografie', inventory: { revision: 13, items: [{ id: 'original-item' }] },
    combatProfile: { revision: 77, hp: 31 }, playerOwner: 'bestehender-owner', updatedAt: OLD };
}

for (const [index, person] of SUPPLIED_GUARD_AVATAR_PEOPLE.entries()) {
  const oldCount = [17, 18, 1][index];
  test(`${person.name}: old ${oldCount} avatars retained with old portrait; all supplied sets activate`, () => {
    const before = existing(person, oldCount);
    const original = structuredClone(before);
    const source = supplied(person);
    const patch = buildSuppliedGuardAvatarPatch(before, source, NOW);
    assert.deepEqual(before, original, 'Pure builder cannot mutate current profile');
    assert.equal(({ ...before, ...patch }).activeImageSetId, 'standard');
    assert.equal(patch.emotes.length, 9);
    assert.equal(patch.portrait, source.portrait);
    const archived = patch.imageSets.find(set => set.id === 'draig-garde-bisher-standard');
    assert.deepEqual(archived, { ...original.imageSets[0], id: 'draig-garde-bisher-standard', name: 'Bisherige Avatare' });
    assert.equal(patch.imageSets.length, person.numbers.length + 1);
    assert.deepEqual(patch.imageSets.map(set => set.id), ['standard', 'draig-garde-bisher-standard', ...person.numbers.filter(n => n !== 1).map(n => `set-0${n}`)]);
    const after = { ...before, ...patch };
    assert.deepEqual(after.inventory, original.inventory);
    assert.deepEqual(after.combatProfile, original.combatProfile);
    assert.equal(after.playerOwner, original.playerOwner);
    assert.equal(after.bio, original.bio);
    assert.deepEqual(after.biography, { ...original.biography, biography: { ...original.biography.biography, portrait: source.portrait } });
    assert.deepEqual(buildSuppliedGuardAvatarPatch(after, source, LATER), {}, 'Repeat does not stamp or duplicate sets');
  });
}

test('independent current image sets remain byte-for-byte JSON equal', () => {
  const person = SUPPLIED_GUARD_AVATAR_PEOPLE[0];
  const before = existing(person, 17);
  const separate = { id: 'festgewand', name: 'Festgewand', portrait: 'https://example.test/feast.png', emotes: [], extraMetadata: { note: 'preserve' } };
  before.imageSets.push(separate);
  const patch = buildSuppliedGuardAvatarPatch(before, supplied(person), NOW);
  assert.deepEqual(patch.imageSets.find(set => set.id === separate.id), separate);
});

test('a differing old legacy emote list is retained separately', () => {
  const person = SUPPLIED_GUARD_AVATAR_PEOPLE[0];
  const before = existing(person, 17);
  before.emotes = [{ img: 'https://example.test/legacy-exclusive.png', label: 'legacy' }];
  const patch = buildSuppliedGuardAvatarPatch(before, supplied(person), NOW);
  const archived = patch.imageSets.find(set => set.id === 'draig-garde-bisher-legacy');
  assert.equal(archived.portrait, before.portrait);
  assert.deepEqual(archived.emotes, before.emotes);
});

test('existing foreign set-ID collision fails without overwrite', () => {
  const person = SUPPLIED_GUARD_AVATAR_PEOPLE[0];
  const before = existing(person, 17);
  before.imageSets.push({ id: 'set-02', name: 'Fremde Variante', portrait: before.portrait, emotes: [] });
  assert.throws(() => buildSuppliedGuardAvatarPatch(before, supplied(person), NOW), /kollidiert/);
});

test('wrong profile, incomplete supplied set, duplicate bytes and absent CAS are rejected', () => {
  const person = SUPPLIED_GUARD_AVATAR_PEOPLE[0];
  const before = existing(person, 17), source = supplied(person);
  assert.throws(() => buildSuppliedGuardAvatarPatch({ ...before, id: 'other' }, source, NOW), /Zieldokument/);
  const missing = structuredClone(source); missing.sets.pop();
  assert.throws(() => buildSuppliedGuardAvatarPatch(before, missing, NOW), /Setnummern/);
  const duplicate = structuredClone(source); duplicate.sets[0].outputs[1].sha256 = duplicate.sets[0].outputs[0].sha256;
  assert.throws(() => buildSuppliedGuardAvatarPatch(before, duplicate, NOW), /Quellenhash/);
  assert.throws(() => buildSuppliedGuardAvatarWrite({}, before, source, NOW), /CAS/);
});

test('unmatched biography main portrait needs explicit identity resolution', () => {
  const person = SUPPLIED_GUARD_AVATAR_PEOPLE[0], before = existing(person, 17);
  before.biography.biography.portrait = 'https://example.test/unidentified.png';
  assert.throws(() => buildSuppliedGuardAvatarPatch(before, supplied(person), NOW), /Hauptbioporträt/);
});

test('CAS write and readback preserve unchanged REST values including nested biography types', () => {
  const person = SUPPLIED_GUARD_AVATAR_PEOPLE[0];
  const plain = existing(person, 17);
  const raw = { name: `projects/test/databases/(default)/documents/characters/${person.id}`,
    updateTime: '2026-11-12T14:00:00.123456Z', fields: encodeFirestoreFields(plain) };
  raw.fields.inventory.mapValue.fields.proof = { bytesValue: 'cHJlc2VydmU=' };
  raw.fields.biography.mapValue.fields.lastConfirmed = { timestampValue: '2026-11-08T16:10:00.123456Z' };
  raw.fields.biography.mapValue.fields.reference = { referenceValue: 'projects/test/databases/(default)/documents/sources/biography' };
  raw.fields.imageSets.arrayValue.values[0].mapValue.fields.createdAt = { timestampValue: '2026-09-22T03:45:19.123456Z' };
  const character = decodeFirestoreFields(raw.fields);
  const { patch, write } = buildSuppliedGuardAvatarWrite(raw, character, supplied(person), NOW);
  assert.deepEqual(write.currentDocument, { updateTime: raw.updateTime });
  const fields = write.update.fields;
  assert.deepEqual(fields.biography.mapValue.fields.lastConfirmed, raw.fields.biography.mapValue.fields.lastConfirmed);
  assert.deepEqual(fields.biography.mapValue.fields.reference, raw.fields.biography.mapValue.fields.reference);
  const archive = fields.imageSets.arrayValue.values.find(value => value.mapValue.fields.id.stringValue === 'draig-garde-bisher-standard');
  assert.deepEqual(archive.mapValue.fields.createdAt, raw.fields.imageSets.arrayValue.values[0].mapValue.fields.createdAt);
  const after = { ...raw, fields: { ...raw.fields, ...fields } };
  assert.equal(assertSuppliedGuardAvatarReadBack(raw, after, patch), true);
  const changed = structuredClone(after); changed.fields.inventory.mapValue.fields.proof.bytesValue = 'Y2hhbmdlZA==';
  assert.throws(() => assertSuppliedGuardAvatarReadBack(raw, changed, patch), /Unbeteiligtes/);
});
