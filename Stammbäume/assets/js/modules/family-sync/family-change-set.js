import { assertValidFamily } from '../../domain/family-schema.js';

export const FAMILY_ENTITY_COLLECTIONS = Object.freeze([
  'persons',
  'partnerships',
  'parentages',
  'houses',
  'cadetBranches',
  'timeJumps'
]);

const FIRESTORE_RECORD_ID = /^[A-Za-z0-9][A-Za-z0-9._-]{0,159}$/;

export function isValidFirestoreRecordId(value) {
  return FIRESTORE_RECORD_ID.test(String(value || ''));
}

function assertSafeRecordIds(family) {
  FAMILY_ENTITY_COLLECTIONS.forEach(collectionName => family[collectionName].forEach(record => {
    if (!isValidFirestoreRecordId(record.id)) {
      throw new Error(`${collectionName}: Die ID „${record.id}“ ist nicht für Firebase geeignet.`);
    }
  }));
}

function recordsById(records = []) {
  return new Map(records.map(record => [record.id, record]));
}

function sameValue(first, second) {
  return JSON.stringify(first) === JSON.stringify(second);
}

export function familyRootRecord(family) {
  return Object.freeze({
    schema: family.schema,
    schemaVersion: family.schemaVersion,
    document: family.document,
    lineage: family.lineage,
    presentation: family.presentation,
    view: family.view,
    extensions: family.extensions
  });
}

export function createFamilyChangeSet(previousFamily, nextFamily) {
  const next = assertValidFamily(nextFamily).family;
  const previous = previousFamily ? assertValidFamily(previousFamily).family : null;
  assertSafeRecordIds(next);
  const collections = Object.fromEntries(FAMILY_ENTITY_COLLECTIONS.map(collectionName => {
    const before = recordsById(previous?.[collectionName]);
    const after = recordsById(next[collectionName]);
    const upsert = [...after.values()].filter(record => !sameValue(before.get(record.id), record));
    const remove = [...before.keys()].filter(recordId => !after.has(recordId));
    return [collectionName, Object.freeze({ upsert: Object.freeze(upsert), remove: Object.freeze(remove) })];
  }));
  const root = familyRootRecord(next);
  return Object.freeze({
    family: next,
    root,
    rootChanged: !previous || !sameValue(familyRootRecord(previous), root),
    collections: Object.freeze(collections),
    operationCount: 2 + FAMILY_ENTITY_COLLECTIONS.reduce((sum, collectionName) => {
      const change = collections[collectionName];
      return sum + change.upsert.length + change.remove.length;
    }, 0)
  });
}

export function familyFromRepositoryRecords(root, collections = {}) {
  return assertValidFamily({
    ...root,
    ...Object.fromEntries(FAMILY_ENTITY_COLLECTIONS.map(collectionName => [
      collectionName,
      collections[collectionName] || []
    ]))
  }).family;
}

export function summarizeFamilyChangeSet(changeSet) {
  return Object.fromEntries(FAMILY_ENTITY_COLLECTIONS.map(collectionName => {
    const change = changeSet.collections[collectionName];
    return [collectionName, Object.freeze({
      upsertedIds: change.upsert.map(record => record.id),
      removedIds: [...change.remove]
    })];
  }));
}
