import {
  FAMILY_REGISTRY,
  getRegisteredFamily,
  RETIRED_FAMILY_IDS
} from '../data/families.registry.js';
import { normalizeFamily } from '../domain/family-schema.js';
import { loadSavedFamilyRecords, saveFamilyRecord } from './family-persistence.js';

export function normalizeFamilyId(value) {
  return String(value || '')
    .trim()
    .toLocaleLowerCase('de')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function parseFolderPath(value) {
  return String(value || '')
    .split(/\s*(?:>|\/|\\)\s*/)
    .map(segment => segment.trim())
    .filter(Boolean);
}

export function listFamilyRecords(storage = globalThis.localStorage) {
  const retiredIds = new Set(RETIRED_FAMILY_IDS);
  const byId = new Map(FAMILY_REGISTRY.map(record => [record.id, { ...record, source: 'registry' }]));
  loadSavedFamilyRecords(storage).forEach(record => {
    if (retiredIds.has(record.id)) return;
    byId.set(record.id, {
      ...record,
      link: `index.html?family=${encodeURIComponent(record.id)}&mode=view`
    });
  });
  return [...byId.values()].sort((first, second) => first.title.localeCompare(second.title, 'de'));
}

export function loadFamilyById(familyId, storage = globalThis.localStorage) {
  const normalizedId = normalizeFamilyId(familyId);
  if (RETIRED_FAMILY_IDS.includes(normalizedId)) return null;
  const local = loadSavedFamilyRecords(storage).find(record => record.id === normalizedId);
  if (local) return local;
  const registered = getRegisteredFamily(normalizedId);
  return registered ? { ...registered, source: 'registry' } : null;
}

export function saveFamilyToLibrary({ family, id, title, folderPath }, storage = globalThis.localStorage) {
  const normalizedId = normalizeFamilyId(id || title);
  if (!normalizedId) throw new Error('Die Familie benötigt eine gültige ID.');
  const nextFamily = normalizeFamily({
    ...family,
    document: {
      ...family.document,
      id: normalizedId,
      title: String(title || family.document.title).trim()
    }
  });
  return saveFamilyRecord({
    id: normalizedId,
    title: nextFamily.document.title,
    folderPath: Array.isArray(folderPath) ? folderPath : parseFolderPath(folderPath),
    family: nextFamily
  }, storage);
}
