const GROUPS_TAB = 'Gruppen';
const GROUPS_ROOT_ID = 'root:gruppen';
const CENYR_NODE_ID = 'node:gruppen:cenyr';
const isIslandLabel = value => /^klaueninseln?$/i.test(String(value || '').trim());
const isGroupNode = node => node?.tab === GROUPS_TAB;

function migrateIslandSection(section) {
  if (section?.tab !== GROUPS_TAB || !Array.isArray(section.path) || !isIslandLabel(section.path[0])) return section;
  return { ...section, path: ['Cenyr', ...section.path] };
}

function migrateIslandNodes(nodes) {
  const root = nodes.find(node => isGroupNode(node) && node.id === GROUPS_ROOT_ID)
    || nodes.find(node => isGroupNode(node) && !node.parentId && node.title === GROUPS_TAB);
  const rootId = root?.id || GROUPS_ROOT_ID;
  const islands = nodes.filter(node => isGroupNode(node) && isIslandLabel(node.title)
    && (!node.parentId || node.parentId === rootId));
  if (!islands.length) return nodes;
  const cenyr = nodes.find(node => isGroupNode(node) && node.title === 'Cenyr' && node.parentId === rootId);
  // IDs are stable references, not paths. Reparent the existing island branch;
  // descendants and module assignments continue to reference their original IDs.
  const cenyrId = cenyr?.id || CENYR_NODE_ID;
  if (!cenyr && nodes.some(node => node.id === cenyrId)) return nodes;
  const movedIds = new Set(islands.map(node => node.id));
  const result = nodes.map(node => movedIds.has(node.id) ? { ...node, parentId: cenyrId } : node);
  if (!root) result.push({ id: rootId, parentId: '', tab: GROUPS_TAB, title: GROUPS_TAB, desc: '', sortOrder: 0 });
  if (!cenyr) result.push({ id: cenyrId, parentId: rootId, tab: GROUPS_TAB, title: 'Cenyr', desc: '', sortOrder: 0 });
  return result;
}

// A pure presentation/classification repair, shared with bounded publication.
// It accepts both full store payloads and split manifests (entryIds descriptors).
// Entry objects, IDs, assignments, revisions and unrelated nodes remain intact.
export function migrateCenyrGroupSections(payload) {
  if (!payload || typeof payload !== 'object') return payload;
  let result = payload;
  const replace = (key, value) => {
    if (value !== payload[key]) result = { ...result, [key]: value };
  };
  if (Array.isArray(payload.moduleSectionNodes)) replace('moduleSectionNodes', migrateIslandNodes(payload.moduleSectionNodes));
  if (Array.isArray(payload.customSections)) {
    const sections = payload.customSections.map(migrateIslandSection);
    if (sections.some((section, index) => section !== payload.customSections[index])) replace('customSections', sections);
  }
  if (payload.moduleSectionMoves && typeof payload.moduleSectionMoves === 'object') {
    const moves = Object.entries(payload.moduleSectionMoves).map(([id, section]) => [id, migrateIslandSection(section)]);
    if (moves.some(([id, section]) => section !== payload.moduleSectionMoves[id])) replace('moduleSectionMoves', Object.fromEntries(moves));
  }
  return result;
}

// Apply the same repair to char_tabs/config's split manifest and legacy mirrors.
// Callers retain responsibility for revision preconditions, backups and writes.
export function migrateCenyrGroupConfig(config) {
  const result = migrateCenyrGroupSections(config);
  if (!config?.moduleStoreManifest || typeof config.moduleStoreManifest !== 'object') return result;
  const manifest = migrateCenyrGroupSections(config.moduleStoreManifest);
  return manifest === config.moduleStoreManifest ? result : { ...result, moduleStoreManifest: manifest };
}
