import { assertValidFamily } from '../domain/family-schema.js';

const STORAGE_KEY = 'aleria.family-tree.workspace.v2';
const SAVED_FAMILIES_KEY = 'aleria.family-tree.saved-families.v1';

export function loadPersistedFamily(storage = globalThis.localStorage) {
  try {
    const serialized = storage?.getItem(STORAGE_KEY);
    if (!serialized) return null;
    return assertValidFamily(JSON.parse(serialized)).family;
  } catch (error) {
    console.warn('Der lokal gespeicherte Stammbaum konnte nicht geladen werden.', error);
    return null;
  }
}

export function persistFamily(family, storage = globalThis.localStorage) {
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify(family));
    return true;
  } catch (error) {
    console.warn('Der Stammbaum konnte nicht lokal gespeichert werden.', error);
    return false;
  }
}

export function clearPersistedFamily(storage = globalThis.localStorage) {
  try {
    storage?.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    return false;
  }
}

export function loadSavedFamilyRecords(storage = globalThis.localStorage) {
  try {
    const serialized = storage?.getItem(SAVED_FAMILIES_KEY);
    const records = serialized ? JSON.parse(serialized) : [];
    if (!Array.isArray(records)) return [];
    return records.flatMap(record => {
      try {
        const family = assertValidFamily(record.family).family;
        return [{
          id: String(record.id || family.document.id),
          title: String(record.title || family.document.title),
          folderPath: Array.isArray(record.folderPath) ? record.folderPath.map(String).filter(Boolean) : [],
          updatedAt: String(record.updatedAt || ''),
          source: 'local',
          family
        }];
      } catch (error) {
        return [];
      }
    });
  } catch (error) {
    return [];
  }
}

export function saveFamilyRecord(record, storage = globalThis.localStorage) {
  const family = assertValidFamily(record.family).family;
  const records = loadSavedFamilyRecords(storage);
  const nextRecord = {
    id: String(record.id || family.document.id),
    title: String(record.title || family.document.title),
    folderPath: Array.isArray(record.folderPath) ? record.folderPath.map(String).filter(Boolean) : [],
    updatedAt: new Date().toISOString(),
    family
  };
  const nextRecords = records
    .filter(item => item.id !== nextRecord.id)
    .map(({ source, ...item }) => item);
  nextRecords.push(nextRecord);
  storage?.setItem(SAVED_FAMILIES_KEY, JSON.stringify(nextRecords));
  return Object.freeze({ ...nextRecord, source: 'local' });
}

export function saveFamilyRecordsAtomically(recordsToSave, storage = globalThis.localStorage) {
  const timestamp = new Date().toISOString();
  const incoming = recordsToSave.map(record => {
    const family = assertValidFamily(record.family).family;
    return {
      id: String(record.id || family.document.id),
      title: String(record.title || family.document.title),
      folderPath: Array.isArray(record.folderPath) ? record.folderPath.map(String).filter(Boolean) : [],
      updatedAt: timestamp,
      family
    };
  });
  const incomingIds = new Set(incoming.map(record => record.id));
  if (incomingIds.size !== incoming.length) throw new Error('Eine Familienakte wurde beim Spiegeln doppelt angegeben.');
  const retained = loadSavedFamilyRecords(storage)
    .filter(record => !incomingIds.has(record.id))
    .map(({ source, ...record }) => record);
  const next = [...retained, ...incoming];
  storage?.setItem(SAVED_FAMILIES_KEY, JSON.stringify(next));
  return Object.freeze(incoming.map(record => Object.freeze({ ...record, source: 'local' })));
}

export function deleteSavedFamilyRecord(familyId, storage = globalThis.localStorage) {
  const records = loadSavedFamilyRecords(storage).filter(record => record.id !== familyId);
  storage?.setItem(SAVED_FAMILIES_KEY, JSON.stringify(records.map(({ source, ...record }) => record)));
}
