const tab = 'Völker & Kulturen';
const region = ['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft'];
export const GWYNTHOR_BANNKREIS_PATH = [...region, 'Bannkreis Gwynthor'];
export const GWYNTHOR_CITY_PATH = [...GWYNTHOR_BANNKREIS_PATH, 'Gwynthor-Stadt'];
const owainPath = [...GWYNTHOR_BANNKREIS_PATH, 'Owains Anwesen & Gestüt'];
const redGatePath = [...GWYNTHOR_BANNKREIS_PATH, 'Zum Roten Tor'];
const owainIds = new Set(['modul-1781813764249', 'herberge-bei-owains-anwesen', 'owains-anwesen']);
const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
const pathKey = path => path.map(normalize).join('/');
const isBannkreis = label => /^(?:gwynthor\s*-?\s*bannkreis|bannkreis\s+gwynthor)$/i.test(label || '');
const samePath = (a, b) => pathKey(a) === pathKey(b);
const slug = value => normalize(value).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const nodeId = path => `node:volker-kulturen:${path.map(slug).join('/')}`;
const iconRoot = '../IconOrdner/Länder und Häuser Icons/Haus Draig/';
export const GWYNTHOR_AREA_ICONS = Object.freeze({
  Cenyr: `${iconRoot}Königreich Cenyr.png`,
  'Celtigerns Wacht': `${iconRoot}Celtigerns Wacht Grafschaft.png`,
  'Llamreis Ankunft': `${iconRoot}Llamreis Ankunft.png`,
  'Bannkreis Gwynthor': '../IconOrdner/Welt Pins/Bauernsiedlung.png',
  'Gwynthor-Stadt': `${iconRoot}Gwynthor.png`,
  'Owains Anwesen & Gestüt': '../IconOrdner/Welt Pins/Gestüt.png',
  'Zum Roten Tor': '../IconOrdner/Welt Pins/Gasthof.png',
  'Castell Draig': `${iconRoot}Haus Draig.png`,
  'Castell Gafyr': '../Stammbäume/assets/images/houses/Llamreis Ankunft/haus-gafyr.png',
  'Castell Saethwyr': '../Stammbäume/assets/images/houses/Llamreis Ankunft/haus-saethwyr.png',
  'Castell Wyrm': '../Stammbäume/assets/images/houses/Llamreis Ankunft/haus-wyrm.png',
  'Zum Roten Drachen': '../IconOrdner/Welt Pins/Taverne.png',
  'Bräuche und Riten': '../IconOrdner/ReiterIcons/Weltpfade/sitte-etiquette.png'
});

export function projectGwynthorPath(path, sectionTab = tab) {
  if (sectionTab !== tab || !Array.isArray(path) || !region.every((part, i) => normalize(path[i]) === normalize(part))) return path;
  const [first, ...tail] = path.slice(region.length);
  if (normalize(first) === 'gwynthor') {
    if (isBannkreis(tail[0])) return [...GWYNTHOR_BANNKREIS_PATH, ...tail.slice(1)];
    return [...GWYNTHOR_CITY_PATH, ...tail];
  }
  if (isBannkreis(first)) return [...GWYNTHOR_BANNKREIS_PATH, ...tail];
  if (normalize(first) === 'gwynthor-stadt') return [...GWYNTHOR_CITY_PATH, ...tail];
  if (/^(?:owains anwesen|zum roten tor)/i.test(first || '')) return [...GWYNTHOR_BANNKREIS_PATH, first, ...tail];
  return path;
}

function nodePaths(nodes) {
  const byId = new Map(nodes.map(node => [node.id, node])), paths = new Map();
  const resolve = (id, seen = new Set()) => {
    if (paths.has(id)) return paths.get(id);
    const node = byId.get(id);
    if (!node || seen.has(id)) return [];
    const next = new Set(seen).add(id);
    const path = node.parentId ? [...resolve(node.parentId, next), node.title] : [];
    paths.set(id, path); return path;
  };
  nodes.forEach(node => resolve(node.id));
  return paths;
}

function pathForEntry(entry, path, sectionTab) {
  if (sectionTab !== tab || !region.every((part, i) => normalize(path[i]) === normalize(part))) return path;
  if (owainIds.has(entry?.id)) return owainPath;
  if (/^(?:gasthof\s*[-–·]?\s*)?zum roten tor$/i.test(entry?.title || '') || entry?.id === 'zum-roten-tor') return redGatePath;
  return path;
}

// Entries remain the same objects. This function only projects their section
// descriptors and may split a legacy section containing both urban/rural places.
export function projectGwynthorSections(sections, { nodes = [] } = {}) {
  const paths = nodePaths(nodes), nodeByPath = new Map();
  nodes.filter(node => node.tab === tab).forEach(node => nodeByPath.set(pathKey(paths.get(node.id) || []), node.id));
  return sections.flatMap(section => {
    if (section.tab !== tab) return [section];
    const rawPath = section.path || paths.get(section.nodeId) || [];
    if (!Array.isArray(rawPath)) return [section];
    const projected = projectGwynthorPath(rawPath, section.tab);
    const groups = new Map();
    for (const entry of section.entries || []) {
      const path = pathForEntry(entry, projected, section.tab), key = pathKey(path);
      if (!groups.has(key)) groups.set(key, { path, entries: [] });
      groups.get(key).entries.push(entry);
    }
    if (!groups.size) groups.set(pathKey(projected), { path: projected, entries: section.entries || [] });
    return [...groups.values()].map(({ path, entries }) => {
      const originalNodeMatches = section.nodeId && samePath(paths.get(section.nodeId) || [], path);
      const targetNodeId = originalNodeMatches ? section.nodeId : nodeByPath.get(pathKey(path));
      const ownIcon = GWYNTHOR_AREA_ICONS[path.at(-1)];
      const result = { ...section, key: path.at(-1) || section.key, path, entries,
        ...(ownIcon ? { iconUrl: ownIcon } : {}) };
      if (targetNodeId) result.nodeId = targetNodeId;
      else if (section.nodeId && !samePath(projected, path)) delete result.nodeId;
      return result;
    });
  });
}

// Node IDs and entry identities are stable references. Existing nodes are
// reparented; duplicate legacy aliases remain valid instead of being deleted.
export function migrateGwynthorModuleStore(payload, builtinSections = []) {
  if (!payload || typeof payload !== 'object') return payload;
  const originalNodes = payload.moduleSectionNodes || [], oldPaths = nodePaths(originalNodes);
  const nodes = originalNodes.map(node => ({ ...node }));
  const byPath = new Map(), desired = new Map(), usedIds = new Set(nodes.map(node => node.id));
  for (const node of nodes) {
    const oldPath = oldPaths.get(node.id) || [];
    if (node.tab !== tab || !oldPath.length) continue;
    const path = projectGwynthorPath(oldPath, tab);
    desired.set(node.id, path);
    if (!byPath.has(pathKey(path))) byPath.set(pathKey(path), node.id);
  }
  const root = nodes.find(node => node.tab === tab && !node.parentId);
  const rootId = root?.id || 'root:volker-kulturen';
  if (!root) { nodes.push({ id: rootId, tab, title: tab, parentId: '', desc: '', sortOrder: 0 }); usedIds.add(rootId); }
  const ensurePath = (path, preferredId) => {
    if (!path.length) return rootId;
    const key = pathKey(path);
    if (byPath.has(key)) return byPath.get(key);
    const parentId = ensurePath(path.slice(0, -1));
    const candidate = preferredId && !usedIds.has(preferredId) ? preferredId : nodeId(path);
    let id = candidate, suffix = 2;
    while (usedIds.has(id)) id = `${candidate}-${suffix++}`;
    const node = { id, parentId, tab, title: path.at(-1), desc: '', sortOrder: 0 };
    nodes.push(node); usedIds.add(id); byPath.set(key, id); desired.set(id, path); return id;
  };
  const requests = [...projectGwynthorSections(builtinSections), ...projectGwynthorSections(payload.customSections || [], { nodes: originalNodes }),
    ...Object.values(payload.moduleSectionMoves || {}).flatMap(section => projectGwynthorSections([{ ...section, entries: [] }], { nodes: originalNodes }))];
  for (const path of [region.slice(0, 1), region.slice(0, 2), region, GWYNTHOR_BANNKREIS_PATH, GWYNTHOR_CITY_PATH, owainPath, redGatePath]) ensurePath(path);
  for (const section of requests) if (section.tab === tab && section.path?.length) ensurePath(section.path, section.nodeId);
  // Resolve parents after every path has been registered, so moving the former
  // child Bannkreis above the city cannot produce a parent cycle.
  for (const node of nodes) {
    const path = desired.get(node.id); if (!path?.length) continue;
    node.parentId = ensurePath(path.slice(0, -1)); node.title = path.at(-1);
    if (GWYNTHOR_AREA_ICONS[node.title]) node.iconUrl = GWYNTHOR_AREA_ICONS[node.title];
    if (Array.isArray(node.path)) node.path = path;
  }
  const customSections = projectGwynthorSections(payload.customSections || [], { nodes });
  const moduleSectionMoves = Object.fromEntries(Object.entries(payload.moduleSectionMoves || {}).map(([id, section]) => {
    const path = pathForEntry({ id }, projectGwynthorPath(section.path || oldPaths.get(section.nodeId) || [], section.tab), section.tab);
    return [id, projectGwynthorSections([{ ...section, path, entries: [] }], { nodes })[0]];
  }));
  const assignments = { ...(payload.moduleNodeAssignments || {}) };
  for (const section of customSections) for (const entry of section.entries || []) {
    if (owainIds.has(entry.id) && section.nodeId) assignments[entry.id] = section.nodeId;
  }
  return { ...payload, moduleSectionNodes: nodes, customSections, moduleSectionMoves, moduleNodeAssignments: assignments };
}
