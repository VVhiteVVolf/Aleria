function normalizeModuleTreeLabel(value, fallback = 'Bereich') {
  const label = String(value || '').trim();
  return label || fallback;
}

function getModuleRootNodeId(tab) {
  return `root:${slugify(tab || 'archiv', 'archiv')}`;
}

function getModulePathNodeId(tab, path = []) {
  const parts = Array.isArray(path) ? path : [];
  if (!parts.length) return getModuleRootNodeId(tab);
  return `node:${slugify(tab || 'archiv', 'archiv')}:${parts.map(part => slugify(part, 'bereich')).join('/')}`;
}

function cleanModuleSectionNode(node = {}) {
  const tab = normalizeModuleTreeLabel(node.tab || node.title || node.key, 'Archiv');
  const title = normalizeModuleTreeLabel(node.title || node.key || tab, tab);
  const parentId = String(node.parentId || '').trim();
  const iconUrl = String(node.iconUrl || '').trim().slice(0, 900);
  const path = Array.isArray(node.path)
    ? node.path.map(part => String(part || '').trim()).filter(Boolean)
    : [];
  const id = String(node.id || '').trim()
    || (path.length ? getModulePathNodeId(tab, path) : getModuleRootNodeId(tab));
  const clean = {
    id,
    parentId,
    tab,
    title,
    desc: String(node.desc || '').trim(),
    sortOrder: Number.isFinite(Number(node.sortOrder)) ? Number(node.sortOrder) : 0
  };
  if (iconUrl) clean.iconUrl = iconUrl;
  return clean;
}

function findModuleSectionNodeById(nodeId) {
  const id = String(nodeId || '').trim();
  return id ? _moduleSectionNodes.find(node => node.id === id) || null : null;
}

function getModuleSectionNodeChildren(parentId) {
  const id = String(parentId || '').trim();
  return _moduleSectionNodes
    .filter(node => String(node.parentId || '') === id)
    .sort((a, b) => {
      const orderCompare = (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0);
      if (orderCompare) return orderCompare;
      return String(a.title || '').localeCompare(String(b.title || ''), 'de');
    });
}

function getModuleNodeAncestors(nodeId) {
  const ancestors = [];
  const seen = new Set();
  let current = findModuleSectionNodeById(nodeId);
  while (current?.parentId && !seen.has(current.parentId)) {
    seen.add(current.parentId);
    const parent = findModuleSectionNodeById(current.parentId);
    if (!parent) break;
    ancestors.unshift(parent);
    current = parent;
  }
  return ancestors;
}

function getModuleNodePathParts(nodeId) {
  const node = findModuleSectionNodeById(nodeId);
  if (!node) return [];
  return [...getModuleNodeAncestors(nodeId), node]
    .filter(item => item.parentId)
    .map(item => item.title)
    .filter(Boolean);
}

function getModuleSectionFromNode(node, entries = []) {
  const clean = cleanModuleSectionNode(node);
  const path = getModuleNodePathParts(clean.id);
  return cleanCustomSection({
    key: path[path.length - 1] || clean.title,
    tab: clean.tab,
    desc: clean.desc,
    iconUrl: clean.iconUrl || '',
    path,
    nodeId: clean.id,
    entries
  });
}

function findModuleNodeByPath(tab, path = []) {
  const normalizedTab = normalizeSearchText(tab || '');
  const normalizedPath = (Array.isArray(path) ? path : []).map(normalizeSearchText).filter(Boolean);
  return _moduleSectionNodes.find(node => {
    if (normalizeSearchText(node.tab) !== normalizedTab) return false;
    const nodePath = getModuleNodePathParts(node.id).map(normalizeSearchText);
    if (nodePath.length !== normalizedPath.length) return false;
    return nodePath.every((part, index) => part === normalizedPath[index]);
  }) || null;
}

function upsertModuleSectionNode(nodeInput) {
  const node = cleanModuleSectionNode(nodeInput);
  const existingIndex = _moduleSectionNodes.findIndex(item => item.id === node.id);
  if (existingIndex >= 0) {
    _moduleSectionNodes[existingIndex] = { ..._moduleSectionNodes[existingIndex], ...node };
    return _moduleSectionNodes[existingIndex];
  }
  _moduleSectionNodes.push(node);
  return node;
}

function ensureModuleNodeForSection(sectionInput, options = {}) {
  const section = cleanCustomSection({ ...(sectionInput || {}), entries: [] });
  const explicitNodeId = String(sectionInput?.nodeId || section.nodeId || '').trim();
  if (explicitNodeId) {
    const existing = findModuleSectionNodeById(explicitNodeId);
    const path = getSectionPathParts(section);
    const node = upsertModuleSectionNode({
      id: explicitNodeId,
      parentId: options.parentId || existing?.parentId || '',
      tab: section.tab || section.key,
      title: getSectionLeafLabel({ ...section, nodeId: '' }),
      desc: section.desc,
      iconUrl: section.iconUrl || existing?.iconUrl || '',
      path
    });
    return node.id;
  }

  const tab = section.tab || section.key;
  const rootId = getModuleRootNodeId(tab);
  const rootTitle = !getSectionPathParts(section).length ? section.key || tab : tab;
  upsertModuleSectionNode({
    id: rootId,
    parentId: '',
    tab,
    title: findModuleSectionNodeById(rootId)?.title || rootTitle,
    desc: findModuleSectionNodeById(rootId)?.desc || (!getSectionPathParts(section).length ? section.desc : ''),
    iconUrl: findModuleSectionNodeById(rootId)?.iconUrl || (!getSectionPathParts(section).length ? section.iconUrl : '')
  });

  let parentId = rootId;
  const path = getSectionPathParts(section);
  path.forEach((part, index) => {
    const prefix = path.slice(0, index + 1);
    const id = getModulePathNodeId(tab, prefix);
    const existing = findModuleSectionNodeById(id);
    upsertModuleSectionNode({
      id,
      parentId: existing?.parentId || parentId,
      tab,
      title: existing?.title || part,
      desc: existing?.desc || (index === path.length - 1 ? section.desc : ''),
      iconUrl: existing?.iconUrl || (index === path.length - 1 ? section.iconUrl : ''),
      path: existing?.path?.length ? existing.path : prefix
    });
    parentId = id;
  });

  return path.length ? getModulePathNodeId(tab, path) : rootId;
}

function normalizeModuleTreeState(payload = {}) {
  const nodes = Array.isArray(payload.moduleSectionNodes)
    ? payload.moduleSectionNodes.map(cleanModuleSectionNode)
    : [];
  const assignments = {};
  Object.entries(payload.moduleNodeAssignments || {}).forEach(([entryId, nodeId]) => {
    const id = String(entryId || '').trim();
    const target = String(nodeId || '').trim();
    if (id && target) assignments[id] = target;
  });
  return { nodes, assignments };
}

function ensureKnownModuleSectionNodes() {
  let changed = false;
  const before = _moduleSectionNodes.length;
  [...(Array.isArray(SECTIONS) ? SECTIONS : []), ..._customSections].forEach(section => {
    const nodeId = ensureModuleNodeForSection(section);
    if (section && !section.nodeId) section.nodeId = nodeId;
  });
  Object.entries(_moduleSectionMoves || {}).forEach(([entryId, section]) => {
    const nodeId = ensureModuleNodeForSection(section);
    if (entryId && nodeId) _moduleNodeAssignments[entryId] = nodeId;
    if (section && !section.nodeId) section.nodeId = nodeId;
  });
  changed = before !== _moduleSectionNodes.length;
  return changed;
}

function removeModuleSectionNodes(nodeIds = []) {
  const ids = new Set(Array.from(nodeIds).map(id => String(id || '').trim()).filter(Boolean));
  if (!ids.size) return false;
  const before = _moduleSectionNodes.length;
  _moduleSectionNodes = _moduleSectionNodes.filter(node => !ids.has(node.id));
  Object.entries(_moduleNodeAssignments || {}).forEach(([entryId, nodeId]) => {
    if (ids.has(String(nodeId || '').trim())) delete _moduleNodeAssignments[entryId];
  });
  return _moduleSectionNodes.length !== before;
}

function getModuleSectionNodeDescendantIds(nodeId) {
  const rootId = String(nodeId || '').trim();
  const ids = new Set();
  const visit = id => {
    if (!id || ids.has(id)) return;
    ids.add(id);
    getModuleSectionNodeChildren(id).forEach(child => visit(child.id));
  };
  visit(rootId);
  return ids;
}
