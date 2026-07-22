function collectPersonIds(persons) {
  return new Set((Array.isArray(persons) ? persons : [])
    .map(person => person?.id)
    .filter(id => typeof id === 'string' && id));
}

// Veröffentlichungsvalidierung läuft in einem getrennten Deployment-Paket.
// Diese fachliche Berechnung bleibt deshalb DOM- und Frontend-unabhängig.
export function resolvePublishedFamilyGenerationDepths(collections = {}) {
  const personIds = collectPersonIds(collections.persons);
  const componentParents = new Map([...personIds].map(personId => [personId, personId]));

  function find(personId) {
    const parentId = componentParents.get(personId);
    if (!parentId || parentId === personId) return parentId || '';
    const rootId = find(parentId);
    componentParents.set(personId, rootId);
    return rootId;
  }

  function union(firstId, secondId) {
    if (!personIds.has(firstId) || !personIds.has(secondId)) return;
    const firstRoot = find(firstId);
    const secondRoot = find(secondId);
    if (firstRoot !== secondRoot) componentParents.set(secondRoot, firstRoot);
  }

  (Array.isArray(collections.partnerships) ? collections.partnerships : []).forEach(partnership => {
    const participants = (Array.isArray(partnership?.participantIds) ? partnership.participantIds : [])
      .filter(personId => personIds.has(personId));
    participants.slice(1).forEach(personId => union(participants[0], personId));
  });

  const componentDepths = new Map([...personIds].map(find).filter(Boolean).map(rootId => [rootId, 0]));
  const componentEdges = [];
  (Array.isArray(collections.parentages) ? collections.parentages : []).forEach(parentage => {
    if (!personIds.has(parentage?.childId)) return;
    const childRoot = find(parentage.childId);
    (Array.isArray(parentage.parentIds) ? parentage.parentIds : []).forEach(parentId => {
      if (!personIds.has(parentId)) return;
      const parentRoot = find(parentId);
      if (parentRoot && childRoot && parentRoot !== childRoot) componentEdges.push([parentRoot, childRoot]);
    });
  });

  const maximumPasses = Math.max(1, componentDepths.size);
  for (let pass = 0; pass < maximumPasses; pass += 1) {
    let changed = false;
    componentEdges.forEach(([parentRoot, childRoot]) => {
      const nextDepth = (componentDepths.get(parentRoot) || 0) + 1;
      if (nextDepth > (componentDepths.get(childRoot) || 0)) {
        componentDepths.set(childRoot, nextDepth);
        changed = true;
      }
    });
    if (!changed) break;
  }

  return new Map([...personIds].map(personId => [
    personId,
    componentDepths.get(find(personId)) || 0
  ]));
}

export function resolvePublishedAnchorGenerationDepth(anchorPersonIds, generationDepths) {
  const depths = (Array.isArray(anchorPersonIds) ? anchorPersonIds : [])
    .filter(personId => generationDepths.has(personId))
    .map(personId => generationDepths.get(personId));
  return depths.length ? Math.max(...depths) : null;
}
