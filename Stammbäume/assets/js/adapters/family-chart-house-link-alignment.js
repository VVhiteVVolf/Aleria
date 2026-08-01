const SINGLE_FOUNDER_HOUSE_LINK_TYPE = 'single-founder-house';

export function createFamilyChartHouseLinkAlignmentPlan(family) {
  const personIds = new Set((family?.persons || []).map(person => person.id));
  const routes = [];
  const invalidRequests = [];

  (family?.cadetBranches || []).forEach(branch => {
    if (branch.linkType !== SINGLE_FOUNDER_HOUSE_LINK_TYPE) return;
    const anchorPersonId = String(branch.parentPersonId || '').trim();
    if (!anchorPersonId || !personIds.has(anchorPersonId)) {
      invalidRequests.push(Object.freeze({
        branchId: branch.id,
        anchorPersonId
      }));
      return;
    }

    routes.push(Object.freeze({
      branchId: branch.id,
      anchorPersonId,
      houseNodeId: `__cadet-${branch.id}`
    }));
  });

  return Object.freeze({
    routes: Object.freeze(routes),
    invalidRequests: Object.freeze(invalidRequests)
  });
}

function displayedNodeById(nodes, nodeId) {
  return nodes.find(node => node?.data?.id === nodeId && !node.spouse)
    || nodes.find(node => node?.data?.id === nodeId)
    || null;
}

export function applyFamilyChartHouseLinkAlignmentPlan({ tree, plan, orientation = 'vertical' }) {
  const nodes = tree?.data || [];
  const axis = orientation === 'horizontal' ? 'y' : 'x';
  const alignedRoutes = [];

  (plan?.routes || []).forEach(route => {
    const anchorNode = displayedNodeById(nodes, route.anchorPersonId);
    const houseNode = displayedNodeById(nodes, route.houseNodeId);
    const targetCoordinate = Number(anchorNode?.[axis]);
    if (!anchorNode || !houseNode || !Number.isFinite(targetCoordinate)) return;

    houseNode[axis] = targetCoordinate;
    houseNode.sx = targetCoordinate;
    alignedRoutes.push(Object.freeze({
      ...route,
      axis,
      targetCoordinate
    }));
  });

  return Object.freeze({
    alignedRoutes: Object.freeze(alignedRoutes)
  });
}
