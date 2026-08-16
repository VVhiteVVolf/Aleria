import { createHouseProfileFromFolderPath } from '../../domain/house-profile.js';

const FOLDER_ICON_LEVELS = Object.freeze(['kingdom', 'county', 'barony', 'seat']);

function createFolderNode(name = '', icon = '') {
  return { name, icon, folders: new Map(), records: [] };
}

export function getRegistryRecordHouseProfile(record) {
  return createHouseProfileFromFolderPath(record.folderPath, {
    ...(record.family?.document.houseProfile || record.houseProfile),
    rankId: record.rankId || record.family?.document.houseProfile?.rankId || record.houseProfile?.rankId
  });
}

function iconForPathLevel(record, levelIndex) {
  const profile = getRegistryRecordHouseProfile(record);
  const explicitFolderIcon = profile.folderIcons?.[levelIndex] || '';
  if (explicitFolderIcon) return explicitFolderIcon;
  return profile.regionEmblems[FOLDER_ICON_LEVELS[levelIndex]] || '';
}

export function buildRegistryFolderTree(records) {
  const root = createFolderNode();
  records.forEach(record => {
    if (record.listing === 'linked-only') return;
    const path = record.folderPath?.length ? record.folderPath : ['Nicht einsortiert'];
    let node = root;
    path.forEach((segment, levelIndex) => {
      const icon = iconForPathLevel(record, levelIndex);
      if (!node.folders.has(segment)) node.folders.set(segment, createFolderNode(segment, icon));
      node = node.folders.get(segment);
      if (!node.icon && icon) node.icon = icon;
    });
    node.records.push(record);
  });
  return root;
}

export function countRegistryRecords(node) {
  return node.records.length
    + [...node.folders.values()].reduce((sum, child) => sum + countRegistryRecords(child), 0);
}
