/** Displayed descendants, their partners, wards and attached virtual knots. */
export function createFamilyChartBranchGraph(family) {
  const persons = family?.persons || [], partnerships = family?.partnerships || [];
  return {
    personById: new Map(persons.map(person => [person.id, person])),
    partnershipById: new Map(partnerships.map(pair => [pair.id, pair])),
    partnerships, parentages: family?.parentages || []
  };
}

export function collectFamilyChartBranchPersonIds(graph, rootPersonId) {
  const ids = new Set([rootPersonId]), queue = [rootPersonId];
  while (queue.length) {
    const id = queue.shift();
    for (const pair of graph.partnerships.filter(pair => pair.participantIds?.includes(id))) {
      pair.participantIds.filter(partner => partner !== id && graph.personById.has(partner)).forEach(partner => ids.add(partner));
      for (const link of graph.parentages.filter(link => link.partnershipId === pair.id)) {
        if (!ids.has(link.childId)) { ids.add(link.childId); queue.push(link.childId); }
      }
    }
    for (const link of graph.parentages.filter(link => link.type === 'foster' && !link.partnershipId
      && !link.extensions?.timeJumpId && link.parentIds?.includes(id))) {
      if (!ids.has(link.childId)) { ids.add(link.childId); queue.push(link.childId); }
    }
  }
  return ids;
}

export function collectFamilyChartBranchNodes(nodes, graph, rootPersonId, { closed = false } = {}) {
  const ids = collectFamilyChartBranchPersonIds(graph, rootPersonId);
  let changed = true;
  while (changed) {
    changed = false;
    for (const node of nodes) {
      const id = String(node?.data?.id || node?.id || '');
      if (!id || ids.has(id)) continue;
      const parents = Array.isArray(node?.data?.rels?.parents) ? node.data.rels.parents.filter(Boolean) : [];
      const spouses = Array.isArray(node?.data?.rels?.spouses) ? node.data.rels.spouses.filter(Boolean) : [];
      // Collision repair retains its original inclusive traversal. Compaction
      // must not swallow an unrelated biological branch through a shared knot.
      const belongs = closed
        ? !graph.personById.has(id) && parents.length > 0 && parents.every(parent => ids.has(parent))
        : parents.some(parent => ids.has(parent)) || spouses.some(spouse => ids.has(spouse));
      if (belongs) { ids.add(id); changed = true; }
    }
  }
  return nodes.filter(node => ids.has(String(node?.data?.id || node?.id || '')));
}
