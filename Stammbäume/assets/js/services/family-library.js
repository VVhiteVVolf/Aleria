import {
  FAMILY_REGISTRY,
  getRegisteredFamily,
  RETIRED_FAMILY_IDS
} from '../data/families.registry.js';
import { normalizeFamily } from '../domain/family-schema.js';
import { createHouseProfileFromFolderPath } from '../domain/house-profile.js';
import {
  applyHousePlacementToProfile,
  assertValidHousePlacement
} from '../modules/family-registry/house-placement-policy.js';
import { loadSavedFamilyRecords, saveFamilyRecord } from './family-persistence.js';
import { createFamilyViewLink } from './family-links.js';
import {
  isUntouchedBlankFamily,
  needsRegisteredFamilyUpgrade,
  resolveRegisteredFamilyUpgrade
} from './family-registry-upgrade.js';
import { resolveCanonicalFamilyId } from '../modules/family-registry/family-id-aliases.js';

export function normalizeFamilyId(value) {
  return resolveCanonicalFamilyId(value);
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
  const upgradedFamily = needsUpgrade
    ? resolveRegisteredFamilyUpgrade(registered.family, local.family)
    : local.family;
  const registryManagedRecordFields = Array.isArray(
    registered.family?.extensions?.registryManagedRecordFields
  )
    ? registered.family.extensions.registryManagedRecordFields
    : [];
  const usesRegisteredFolderPath = needsUpgrade
    && registryManagedRecordFields.includes('folderPath');
  return {
    ...local,
    listing: registered.listing,
    folderPath: usesRegisteredFolderPath ? registered.folderPath : local.folderPath,
    additionalPlacements: registered.additionalPlacements,
    family: upgradedFamily,
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
  return [...byId.values()]
    .filter(record => record.listing !== 'linked-only')
    .sort((first, second) => first.title.localeCompare(second.title, 'de'));
}

export function loadFamilyById(familyId, storage = globalThis.localStorage) {
  const normalizedId = normalizeFamilyId(familyId);
  if (RETIRED_FAMILY_IDS.includes(normalizedId)) return null;
  const local = loadSavedFamilyRecords(storage).find(record => record.id === normalizedId);
  const registered = getRegisteredFamily(normalizedId);
  return resolveFamilyRecord(registered, local);
}

export function saveFamilyToLibrary({
  family,
  id,
  title,
  folderPath,
  folderIcons,
  rankId,
  unclassified
}, storage = globalThis.localStorage) {
  const normalizedId = normalizeFamilyId(id || title);
  if (!normalizedId) throw new Error('Die Familie benötigt eine gültige ID.');
  const usesStructuredPlacement = unclassified !== undefined || folderIcons !== undefined;
  const placement = usesStructuredPlacement
    ? assertValidHousePlacement({ unclassified, folderPath, folderIcons, rankId })
    : null;
  const normalizedFolderPath = placement
    ? [...placement.folderPath]
    : Array.isArray(folderPath)
      ? folderPath.map(String).filter(Boolean)
      : parseFolderPath(folderPath);
  const nextHouseProfile = placement
    ? applyHousePlacementToProfile(family.document.houseProfile, placement)
    : createHouseProfileFromFolderPath(normalizedFolderPath, {
      ...family.document.houseProfile,
      rankId: rankId || family.document.houseProfile?.rankId
    });
  const nextFamily = normalizeFamily({
    ...family,
    document: {
      ...family.document,
      id: normalizedId,
      title: String(title || family.document.title).trim(),
      houseProfile: nextHouseProfile
    },
    extensions: {
      ...family.extensions,
      registry: {
        ...(family.extensions?.registry || {}),
        folderPath: normalizedFolderPath,
        ...(placement ? { unclassified: placement.unclassified } : {})
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
