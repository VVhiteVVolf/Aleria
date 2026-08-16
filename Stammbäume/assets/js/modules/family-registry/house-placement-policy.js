import {
  createFolderPathFromHouseProfile,
  createHouseProfileFromFolderPath,
  getHouseRank,
  normalizeHouseProfile
} from '../../domain/house-profile.js';

export const REQUIRED_HOUSE_PLACEMENT_LEVELS = Object.freeze([
  Object.freeze({ label: 'Königreich / Reich', shortLabel: 'Reich' }),
  Object.freeze({ label: 'Großregion / Grafschaft / Jarltum', shortLabel: 'Region' }),
  Object.freeze({ label: 'Herrschaft / Baronie / Thaintum', shortLabel: 'Herrschaft' }),
  Object.freeze({ label: 'Ortschaft / Stammsitz', shortLabel: 'Ort' })
]);

const REGION_ICON_LEVELS = Object.freeze(['kingdom', 'county', 'barony', 'seat']);

function cleanText(value) {
  return String(value || '').trim();
}

function normalizePath(value) {
  return (Array.isArray(value) ? value : []).map(cleanText);
}

function trimTrailingEmptyLevels(path, icons) {
  const nextPath = [...path];
  const nextIcons = [...icons];
  while (
    nextPath.length > REQUIRED_HOUSE_PLACEMENT_LEVELS.length
    && !nextPath.at(-1)
    && !nextIcons.at(-1)
  ) {
    nextPath.pop();
    nextIcons.pop();
  }
  return { path: nextPath, icons: nextIcons };
}

export function folderIconsFromHouseProfile(profile = {}, folderPath = []) {
  const normalized = normalizeHouseProfile(profile);
  const path = folderPath.length ? normalizePath(folderPath) : createFolderPathFromHouseProfile(normalized);
  return path.map((unused, index) => (
    cleanText(normalized.folderIcons?.[index])
      || cleanText(normalized.regionEmblems?.[REGION_ICON_LEVELS[index]])
      || ''
  ));
}

export function normalizeHousePlacement(value = {}) {
  const unclassified = value.unclassified === true;
  const rankId = getHouseRank(cleanText(value.rankId)).id;
  if (unclassified) {
    return Object.freeze({ unclassified: true, rankId, folderPath: [], folderIcons: [] });
  }
  const path = normalizePath(value.folderPath);
  const icons = normalizePath(value.folderIcons);
  const size = Math.max(path.length, icons.length, REQUIRED_HOUSE_PLACEMENT_LEVELS.length);
  while (path.length < size) path.push('');
  while (icons.length < size) icons.push('');
  const trimmed = trimTrailingEmptyLevels(path, icons);
  return Object.freeze({
    unclassified: false,
    rankId,
    folderPath: Object.freeze(trimmed.path),
    folderIcons: Object.freeze(trimmed.icons)
  });
}

export function assertValidHousePlacement(value = {}) {
  const placement = normalizeHousePlacement(value);
  if (placement.rankId === 'unknown') {
    throw new Error('Bitte das Rang-Tier des Hauses auswählen.');
  }
  if (placement.unclassified) return placement;
  if (placement.folderPath.length < REQUIRED_HOUSE_PLACEMENT_LEVELS.length) {
    throw new Error('Der Registerpfad muss vom Reich bis zur Ortschaft vollständig sein.');
  }
  placement.folderPath.forEach((segment, index) => {
    if (!segment) {
      const level = REQUIRED_HOUSE_PLACEMENT_LEVELS[index]?.label || `Pfadstufe ${index + 1}`;
      throw new Error(`Bitte die Pfadstufe „${level}“ ausfüllen.`);
    }
    if (!placement.folderIcons[index]) {
      throw new Error(`Bitte ein Icon für „${segment}“ angeben.`);
    }
  });
  return placement;
}

export function createHousePlacementFromProfile(profile = {}, options = {}) {
  const normalized = normalizeHouseProfile(profile);
  const folderPath = Array.isArray(options.folderPath) && options.folderPath.length
    ? normalizePath(options.folderPath)
    : createFolderPathFromHouseProfile(normalized);
  return normalizeHousePlacement({
    unclassified: options.unclassified === true,
    rankId: normalized.rankId,
    folderPath,
    folderIcons: folderIconsFromHouseProfile(normalized, folderPath)
  });
}

export function applyHousePlacementToProfile(profile = {}, value = {}) {
  const placement = normalizeHousePlacement(value);
  const current = normalizeHouseProfile(profile);
  if (placement.unclassified) {
    return normalizeHouseProfile({
      ...current,
      rankId: placement.rankId,
      kingdom: '',
      county: '',
      barony: '',
      seat: '',
      folderPath: [],
      folderIcons: [],
      regionEmblems: { kingdom: '', county: '', barony: '', seat: '' }
    });
  }
  return createHouseProfileFromFolderPath(placement.folderPath, {
    ...current,
    rankId: placement.rankId,
    folderPath: placement.folderPath,
    folderIcons: placement.folderIcons,
    regionEmblems: {
      kingdom: placement.folderIcons[0] || '',
      county: placement.folderIcons[1] || '',
      barony: placement.folderIcons[2] || '',
      seat: placement.folderIcons.at(-1) || ''
    }
  });
}
