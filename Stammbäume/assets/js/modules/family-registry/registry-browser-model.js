import { getHouseProfileSearchTerms, getHouseRank } from '../../domain/house-profile.js';
import { buildRegistryFolderTree, getRegistryRecordHouseProfile } from './registry-folder-tree.js';

export const registryPathKey = path => JSON.stringify(path);
const normalizeSearch = value => String(value || '').normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase('de');

// Count each house once, retaining its individual territorial placements.
export function createRegistryBrowserIndex(records) {
  const uniqueRecords = [...new Map(records.filter(record => record.listing !== 'linked-only')
    .map(record => [record.id, record])).values()];
  const nodes = new Map();
  const families = new Map(uniqueRecords.map(record => [record.id, { record, placements: [] }]));
  function visit(folder, path) {
    const node = {
      key: registryPathKey(path), path, name: folder.name || 'Alle Gebiete', icon: folder.icon,
      records: folder.records, children: [], familyIds: new Set()
    };
    nodes.set(node.key, node);
    folder.records.forEach(record => {
      node.familyIds.add(record.id);
      families.get(record.id).placements.push({ record, node });
    });
    node.children = [...folder.folders.values()].sort((a, b) => a.name.localeCompare(b.name, 'de'))
      .map(child => visit(child, [...path, child.name]));
    node.children.forEach(child => child.familyIds.forEach(id => node.familyIds.add(id)));
    node.directCount = new Set(node.records.map(record => record.id)).size;
    node.totalCount = node.familyIds.size;
    return node;
  }
  const root = visit(buildRegistryFolderTree(uniqueRecords), []);
  return { root, nodes, families };
}

export function resolveRegistryLocation(index, path) {
  const remaining = [...path];
  while (!index.nodes.has(registryPathKey(remaining)) && remaining.length) remaining.pop();
  return index.nodes.get(registryPathKey(remaining)) || index.root;
}

export function searchRegistry(index, query) {
  const terms = normalizeSearch(query).trim().split(/\s+/u).filter(Boolean);
  if (!terms.length) return { folders: [], families: [] };
  const matches = values => {
    const haystack = normalizeSearch(values.join(' '));
    return terms.every(term => haystack.includes(term));
  };
  const folders = [...index.nodes.values()].filter(node => node.path.length && matches(node.path));
  const families = [...index.families.values()].filter(entry => matches([
    entry.record.title, entry.record.id,
    ...entry.placements.flatMap(({ record, node }) => [
      ...node.path, record.registryPlacement?.title || '',
      ...getHouseProfileSearchTerms(getRegistryRecordHouseProfile(record))
    ])
  ]));
  return { folders, families };
}

export function groupRegistryFamilies(entries) {
  const groups = new Map();
  entries.forEach(entry => {
    const rank = getHouseRank(getRegistryRecordHouseProfile(entry.record).rankId);
    if (!groups.has(rank.id)) groups.set(rank.id, { rank, entries: [] });
    groups.get(rank.id).entries.push(entry);
  });
  return [...groups.values()].sort((a, b) => a.rank.order - b.rank.order || a.rank.label.localeCompare(b.rank.label, 'de'))
    .map(group => ({ ...group, entries: group.entries.sort((a, b) => a.record.title.localeCompare(b.record.title, 'de')) }));
}
