function normalizeRequestedDepth(value) {
  return Number.isInteger(value) ? Math.max(0, value) : 0;
}

function isVirtualNode(node) {
  return Boolean(node?.data?.aleria?.virtualType);
}

function calculateExpandedDepth(data, mainId, relationName, requestedPersonDepth) {
  const personDepthLimit = normalizeRequestedDepth(requestedPersonDepth);
  if (personDepthLimit === 0) return 0;

  const nodes = Array.isArray(data) ? data : [];
  const nodeById = new Map(nodes.map(node => [node.id, node]));
  if (!nodeById.has(mainId)) return personDepthLimit;

  let maximumChartDepth = 0;

  function visit(nodeId, personDepth, chartDepth, path) {
    const node = nodeById.get(nodeId);
    if (!node) return;

    maximumChartDepth = Math.max(maximumChartDepth, chartDepth);
    const relativeIds = Array.isArray(node.rels?.[relationName]) ? node.rels[relationName] : [];

    relativeIds.forEach(relativeId => {
      if (path.has(relativeId)) return;
      const relative = nodeById.get(relativeId);
      if (!relative) return;

      const nextPersonDepth = personDepth + (isVirtualNode(relative) ? 0 : 1);
      if (nextPersonDepth > personDepthLimit) return;

      const nextPath = new Set(path);
      nextPath.add(relativeId);
      visit(relativeId, nextPersonDepth, chartDepth + 1, nextPath);
    });
  }

  visit(mainId, 0, 0, new Set([mainId]));
  return maximumChartDepth;
}

export function resolveFamilyChartViewDepths(data, mainId, view = {}) {
  if (view.limitGenerations !== true) {
    return Object.freeze({ ancestorDepth: undefined, descendantDepth: undefined });
  }
  // Aleria zählt Personengenerationen; Family Chart zählt zusätzlich Wappen und Zeitsprünge.
  return Object.freeze({
    ancestorDepth: calculateExpandedDepth(data, mainId, 'parents', view.ancestorDepth),
    descendantDepth: calculateExpandedDepth(data, mainId, 'children', view.descendantDepth)
  });
}
