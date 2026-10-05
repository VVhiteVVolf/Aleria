// Layout ownership only: no inferred relatives and no changes to persisted genealogy.
export function completeFamilyChartView(view = {}) {
  return { ...view, focusPersonId: '', limitGenerations: false, showSiblings: true };
}

function connectedComponents(data) {
  const neighbours = new Map(data.map(node => [node.id, new Set()]));
  for (const node of data) for (const id of Object.values(node.rels || {}).flat()) {
    if (!neighbours.has(id)) continue;
    neighbours.get(node.id).add(id); neighbours.get(id).add(node.id);
  }
  const unseen = new Set(neighbours.keys()), components = [];
  while (unseen.size) {
    const component = new Set([unseen.values().next().value]);
    for (const id of component) neighbours.get(id).forEach(other => component.add(other));
    component.forEach(id => unseen.delete(id));
    components.push(component);
  }
  return components;
}

function componentRoot(family, data, component) {
  const nodes = data.filter(node => component.has(node.id));
  const origin = nodes.find(node => node.data?.aleria?.virtualType === 'house-origin');
  if (origin) return origin.id;
  const founder = family.partnerships.find(edge => edge.id === family.lineage?.founderPartnershipId);
  const founderId = founder?.participantIds.find(id => component.has(id));
  const roots = nodes.filter(node => !(node.rels?.parents || []).some(id => component.has(id)));
  if (roots.some(node => node.id === founderId)) return founderId;
  const coreIds = new Set(family.persons.filter(person => person.houseId === family.lineage?.houseId).map(person => person.id));
  return roots.find(node => coreIds.has(node.id))?.id || roots[0]?.id || founderId || nodes[0]?.id || '';
}

export function createFamilyChartOverview(family, inputData) {
  const components = connectedComponents(inputData);
  const roots = components.map(component => componentRoot(family, inputData, component));
  if (roots.length <= 1) return { data: inputData, rootId: roots[0] || '', componentCount: roots.length };
  const rootId = `__family-overview-${family.document.id}`;
  const data = inputData.map(node => ({ ...node, rels: {
    ...node.rels, parents: roots.includes(node.id) ? [rootId] : [...(node.rels?.parents || [])]
  } }));
  // A presentation node groups separate components. It is neither a person nor an ancestor.
  data.push({ id: rootId, data: {
    gender: 'M', name: family.document.title, title: 'Gesamtübersicht · unverbundene Zweige',
    nodeKind: 'house-crest', portrait: family.document.emblem, role: 'core',
    aleria: { personId: '', virtualType: 'overview-root' }
  }, rels: { parents: [], spouses: [], children: roots } });
  return { data, rootId, componentCount: roots.length };
}
