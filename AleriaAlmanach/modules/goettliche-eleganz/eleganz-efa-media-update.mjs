import assert from 'node:assert/strict';
import {isDeepStrictEqual} from 'node:util';
import '../image-library/image-library-model.js';
import {confirmCharacterRecordProjection} from '../../../CharakterDatenbank/lib/character-record-confirmation.mjs';
import {ELEGANZ_EFA_AVATARS_AUTHORED_AT} from './eleganz-sales-artwork.mjs';

export const ELEGANZ_EFA_ID = 'person--haus-gwernant--efa-gwernant';
export const ELEGANZ_EFA_MEDIA_FIELDS = Object.freeze(['imageSetSchemaVersion', 'imageSets', 'activeImageSetId', 'emotes', 'emotesOverride', 'imageSetsOverride', 'updatedAt']);
export function withoutEfaMediaFields(character) {
  return Object.fromEntries(Object.entries(character).filter(([key]) => !ELEGANZ_EFA_MEDIA_FIELDS.includes(key)));
}

/** Only the existing Efa image library is owned by this follow-up. */
export function buildEfaMediaFields(current, library) {
  assert.equal(current.id, ELEGANZ_EFA_ID); assert.equal(current.name, 'Efa Gwernant');
  assert.equal(current.identity?.worldPersonId, ELEGANZ_EFA_ID);
  assert.equal(current.portrait, library.portrait, 'The existing portrait must remain unchanged.');
  const model = globalThis.AleriaCharacterImageSets;
  const prior = model.normalize(current), next = model.normalize(library);
  assert.deepEqual(next.map(set => [set.id, set.name, set.emotes.length]), [['standard', 'Standard', 9], ['hausdienst-set-02', 'Hausdienst', 9]]);
  assert(prior.every(set => next.some(target => set.id === target.id)), 'A different existing set cannot be replaced.');
  for (const set of prior) {
    const target = next.find(target => target.id === set.id);
    assert.equal(set.portrait, current.portrait);
    assert(!set.emotes.length || isDeepStrictEqual(set.emotes, target.emotes), 'Different existing emotes cannot be overwritten.');
  }
  const storage = model.prepareStorage({ imageSets: next.map(set => ({ ...set,
    createdAt: prior.find(old => old.id === set.id)?.createdAt || set.createdAt,
    updatedAt: ELEGANZ_EFA_AVATARS_AUTHORED_AT })), activeImageSetId: current.activeImageSetId || 'standard' });
  assert.equal(storage.portrait, current.portrait);
  assert(Date.parse(current.updatedAt) <= Date.parse(ELEGANZ_EFA_AVATARS_AUTHORED_AT), 'A newer Efa profile requires a fresh reviewed timestamp.');
  return Object.fromEntries(ELEGANZ_EFA_MEDIA_FIELDS.map(key => [key, key === 'updatedAt' ? ELEGANZ_EFA_AVATARS_AUTHORED_AT : storage[key]]));
}

/** Confirm one existing record while retaining local notes, history and all other profile fields. */
export function projectEfaMediaRecordUpdate(prior, source) {
  const record = prior.existingRecords?.find(record => record.character.id === ELEGANZ_EFA_ID);
  if (!record) return null;
  const person = prior.snapshot.characters.find(person => person.id === ELEGANZ_EFA_ID);
  const row = prior.registry.records.find(row => row.firestoreDocumentId === ELEGANZ_EFA_ID);
  assert(person && row);
  const previousSource = record.sources.firestoreExports.at(-1);
  assert.deepEqual(withoutEfaMediaFields(source.character), withoutEfaMediaFields(previousSource), 'This confirmation only owns Efa media.');
  const patch = buildEfaMediaFields(record.character, source.character);
  if (ELEGANZ_EFA_MEDIA_FIELDS.every(key => isDeepStrictEqual(record.character[key], patch[key]))) {
    return {record, path:row.path, snapshotCharacter:person};
  }
  return confirmCharacterRecordProjection({record, snapshotCharacter:person, path:row.path,
    character:{...record.character, ...patch}, person:{...person, ...patch}, exportedCharacter:source.character,
    sourcePath:source.sourcePath, now:source.exportedAt}).projection;
}
