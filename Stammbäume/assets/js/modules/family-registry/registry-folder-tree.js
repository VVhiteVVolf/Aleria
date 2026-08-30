import { createHouseProfileFromFolderPath } from '../../domain/house-profile.js';

const FOLDER_ICON_LEVELS = Object.freeze(['kingdom', 'county', 'barony', 'seat']);

function createFolderNode(name = '', icon = '') {
  return { name, icon, folders: new Map(), records: [] };
}

export function getRegistryRecordHouseProfile(record) {
  return createHouseProfileFromFolderPath(record.folderPath, {
    ...(record.houseProfile || record.family?.document.houseProfile),
    rankId: record.rankId || record.family?.document.houseProfile?.rankId || record.houseProfile?.rankId
  });
}

function iconForPathLevel(record, levelIndex) {
  const profile = getRegistryRecordHouseProfile(record);
  const explicitFolderIcon = profile.folderIcons?.[levelIndex] || '';
  if (explicitFolderIcon) return explicitFolderIcon;
  return profile.regionEmblems[FOLDER_ICON_LEVELS[levelIndex]] || '';
}

function placementViewsFor(record) {
  const primaryPath = Array.isArray(record.folderPath) ? record.folderPath : [];
  const primaryKey = primaryPath.join('\u0000');
  const additional = Array.isArray(record.additionalPlacements)
    ? record.additionalPlacements
    : [];
  const seen = new Set([primaryKey]);
  return [
    record,
    ...additional.flatMap(placement => {
      const folderPath = Array.isArray(placement?.folderPath)
        ? placement.folderPath.map(String).filter(Boolean)
        : [];
      const key = folderPath.join('\u0000');
      if (!folderPath.length || seen.has(key)) return [];
      seen.add(key);
      return [{
        ...record,
        folderPath,
        houseProfile: placement.houseProfile || record.houseProfile,
        rankId: placement.rankId || placement.houseProfile?.rankId || record.rankId,
        registryPlacement: placement
      }];
    })
  ];
}

export function buildRegistryFolderTree(records) {
  const root = createFolderNode();
  records.forEach(record => {
    if (record.listing === 'linked-only') return;
    placementViewsFor(record).forEach(placementRecord => {
      const path = placementRecord.folderPath?.length
        ? placementRecord.folderPath
        : ['Nicht einsortiert'];
      let node = root;
      path.forEach((segment, levelIndex) => {
        const icon = iconForPathLevel(placementRecord, levelIndex);
        if (!node.folders.has(segment)) node.folders.set(segment, createFolderNode(segment, icon));
        node = node.folders.get(segment);
        if (!node.icon && icon) node.icon = icon;
      });
      node.records.push(placementRecord);
    });
  });
  return root;
}

export function countRegistryRecords(node) {
  return node.records.length
    + [...node.folders.values()].reduce((sum, child) => sum + countRegistryRecords(child), 0);
}
