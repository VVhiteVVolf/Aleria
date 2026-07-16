import {
  FAMILY_REGISTRY,
  getRegisteredFamily,
  RETIRED_FAMILY_IDS
} from '../data/families.registry.js';
import { normalizeFamily } from '../domain/family-schema.js';
import { createHouseProfileFromFolderPath } from '../domain/house-profile.js';
import { loadSavedFamilyRecords, saveFamilyRecord } from './family-persistence.js';
import { createFamilyViewLink } from './family-links.js';

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
      link: createFamilyViewLink(record.id)
    });
  });
  return [...byId.values()].sort((first, second) => first.title.localeCompare(second.title, 'de'));
}

function isUntouchedBlankFamily(record) {
  const family = record?.family;
  return family?.extensions?.blankFamily === true
    && (family.persons || []).length === 0
    && (family.partnerships || []).length === 0
    && (family.parentages || []).length === 0;
}

export function loadFamilyById(familyId, storage = globalThis.localStorage) {
  const normalizedId = normalizeFamilyId(familyId);
  if (RETIRED_FAMILY_IDS.includes(normalizedId)) return null;
  const local = loadSavedFamilyRecords(storage).find(record => record.id === normalizedId);
  const registered = getRegisteredFamily(normalizedId);
  if (local && !(registered && isUntouchedBlankFamily(local) && registered.family.persons.length)) return local;
  return registered ? { ...registered, source: 'registry' } : null;
}

export function saveFamilyToLibrary({ family, id, title, folderPath, rankId }, storage = globalThis.localStorage) {
  const normalizedId = normalizeFamilyId(id || title);
  if (!normalizedId) throw new Error('Die Familie benötigt eine gültige ID.');
  const normalizedFolderPath = Array.isArray(folderPath) ? folderPath.map(String).filter(Boolean) : parseFolderPath(folderPath);
  const nextFamily = normalizeFamily({
    ...family,
    document: {
      ...family.document,
      id: normalizedId,
      title: String(title || family.document.title).trim(),
      houseProfile: createHouseProfileFromFolderPath(normalizedFolderPath, {
        ...family.document.houseProfile,
        rankId: rankId || family.document.houseProfile?.rankId
      })
    },
    extensions: {
      ...family.extensions,
      registry: {
        ...(family.extensions?.registry || {}),
        folderPath: normalizedFolderPath
      }
    }
  });
  return saveFamilyRecord({
    id: normalizedId,
    title: nextFamily.document.title,
    folderPath: normalizedFolderPath,
    family: nextFamily
  }, storage);
}
