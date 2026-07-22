import {
  FAMILY_REGISTRY,
  getRegisteredFamily,
  RETIRED_FAMILY_IDS
} from '../data/families.registry.js';
import { normalizeFamily } from '../domain/family-schema.js';
import { createHouseProfileFromFolderPath } from '../domain/house-profile.js';
import { loadSavedFamilyRecords, saveFamilyRecord } from './family-persistence.js';
import { createFamilyViewLink } from './family-links.js';
import {
  isUntouchedBlankFamily,
  needsRegisteredFamilyUpgrade,
  resolveRegisteredFamilyUpgrade
} from './family-registry-upgrade.js';

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

function resolveFamilyRecord(registered, local) {
  if (!local) return registered ? { ...registered, source: 'registry' } : null;
  if (!registered) {
    return {
      ...local,
      link: createFamilyViewLink(local.id)
    };
  }

  const registeredHasFamily = (registered.family?.persons || []).length > 0;
  if (registeredHasFamily && isUntouchedBlankFamily(local)) {
    return { ...registered, source: 'registry' };
  }

  const needsUpgrade = needsRegisteredFamilyUpgrade(registered.family, local.family);
  return {
    ...local,
    family: needsUpgrade
      ? resolveRegisteredFamilyUpgrade(registered.family, local.family)
      : local.family,
    source: needsUpgrade ? 'registry-upgrade' : local.source,
    link: createFamilyViewLink(local.id)
  };
}

export function listFamilyRecords(storage = globalThis.localStorage) {
  const retiredIds = new Set(RETIRED_FAMILY_IDS);
  const byId = new Map(FAMILY_REGISTRY.map(record => [record.id, { ...record, source: 'registry' }]));
  loadSavedFamilyRecords(storage).forEach(record => {
    if (retiredIds.has(record.id)) return;
    const registered = getRegisteredFamily(record.id);
    byId.set(record.id, resolveFamilyRecord(registered, record));
  });
  return [...byId.values()].sort((first, second) => first.title.localeCompare(second.title, 'de'));
}

export function loadFamilyById(familyId, storage = globalThis.localStorage) {
  const normalizedId = normalizeFamilyId(familyId);
  if (RETIRED_FAMILY_IDS.includes(normalizedId)) return null;
  const local = loadSavedFamilyRecords(storage).find(record => record.id === normalizedId);
  const registered = getRegisteredFamily(normalizedId);
  return resolveFamilyRecord(registered, local);
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
