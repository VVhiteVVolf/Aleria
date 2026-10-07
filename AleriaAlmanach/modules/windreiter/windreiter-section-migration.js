// Repair only the two category paths introduced by the first Windreiter release.
// The existing online tree, module contents and IDs remain authoritative.
function migrateWindreiterModuleSections(payload) {
  const oldRoot = 'node:soldner:windreiter';
  const root = 'node:soldner:die-windreiter';
  const regional = `${root}/estryll-banden`;
  const oldBand = `${oldRoot}/schwarzfische`;
  const band = `${regional}/die-schwarzen-fische`;
  const aliases = new Map([[oldRoot, root], [oldBand, band]]);
  const nodeId = value => aliases.get(value) || value;
  const migratePath = path => {
    if (!Array.isArray(path) || path[0] !== 'Windreiter') return path;
    return path[1] === 'Schwarzfische'
      ? ['Die Windreiter', 'Estryll Banden', 'Die Schwarzen Fische', ...path.slice(2)]
      : ['Die Windreiter', ...path.slice(1)];
  };
  const migrateSection = section => {
    if (section.tab !== 'Söldner') return section;
    const path = migratePath(section.path);
    return { ...section, ...(path ? { path, key: path.at(-1) || section.key } : {}),
      ...(section.nodeId ? { nodeId: nodeId(section.nodeId) } : {}) };
  };
  const nodes = payload.moduleSectionNodes || [];
  const mergedNodes = new Map();
  // Prefer metadata from the existing online category over the added duplicate.
  for (const node of [...nodes.filter(node => !aliases.has(node.id)), ...nodes.filter(node => aliases.has(node.id))]) {
    if (node.tab !== 'Söldner') { mergedNodes.set(node.id, node); continue; }
    const id = nodeId(node.id);
    const migrated = { ...node, id, parentId: node.id === oldBand ? regional : nodeId(node.parentId),
      title: node.id === oldRoot ? 'Die Windreiter' : node.id === oldBand ? 'Die Schwarzen Fische' : node.title };
    mergedNodes.set(id, { ...migrated, ...mergedNodes.get(id) });
  }
  if (nodes.some(node => node.id === oldBand && node.tab === 'Söldner') && !mergedNodes.has(regional)) {
    mergedNodes.set(regional, { id: regional, parentId: root, tab: 'Söldner', title: 'Estryll Banden', desc: '', sortOrder: 0 });
  }
  return {
    ...payload,
    moduleSectionNodes: [...mergedNodes.values()],
    moduleNodeAssignments: Object.fromEntries(Object.entries(payload.moduleNodeAssignments || {}).map(([id, target]) => [id, nodeId(target)])),
    moduleSectionMoves: Object.fromEntries(Object.entries(payload.moduleSectionMoves || {}).map(([id, section]) => [id, migrateSection(section)])),
    customSections: (payload.customSections || []).map(migrateSection)
  };
}
