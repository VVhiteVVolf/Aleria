const PARENT_PAIR_OVER_CHILD_EXTENSION = 'chartAlignParentPairOverChildPersonId';

function configuredChildId(partnership) {
  const value = partnership?.extensions?.[PARENT_PAIR_OVER_CHILD_EXTENSION];
  return typeof value === 'string' ? value.trim() : '';
}

function displayedMainNode(nodes, personId) {
  const candidates = nodes.filter(node => node?.data?.id === personId);
  return candidates.find(node => !node.spouse) || candidates[0] || null;
}

function displayedPartnerNode(nodes, personId) {
  return nodes.find(node => node?.data?.id === personId && node.spouse) || null;
}

function shiftNodeAlongCrossAxis(node, axis, delta) {
  const coordinate = Number(node?.[axis]);
  if (Number.isFinite(coordinate)) node[axis] = coordinate + delta;
  const sourceCoordinate = Number(node?.sx);
  if (Number.isFinite(sourceCoordinate)) node.sx = sourceCoordinate + delta;
}

function downstreamDepth(route, routes, visiting = new Set()) {
  if (visiting.has(route.partnershipId)) return 0;
  const nextVisiting = new Set(visiting).add(route.partnershipId);
  const downstreamRoutes = routes.filter(candidate => (
    candidate.partnershipId !== route.partnershipId
    && candidate.parentPersonIds.includes(route.childPersonId)
  ));
  if (!downstreamRoutes.length) return 0;
  return 1 + Math.max(...downstreamRoutes.map(candidate => (
    downstreamDepth(candidate, routes, nextVisiting)
  )));
}

export function createFamilyChartDescendantAlignmentPlan(family) {
  const routes = [];
  const invalidRequests = [];
  const personIds = new Set((family?.persons || []).map(person => person.id));

  (family?.partnerships || []).forEach(partnership => {
    const childPersonId = configuredChildId(partnership);
    if (!childPersonId) return;

    const parentPersonIds = Array.isArray(partnership.participantIds)
      ? [...partnership.participantIds]
      : [];
    const isDirectChild = (family?.parentages || []).some(parentage => (
      parentage.partnershipId === partnership.id
      && parentage.childId === childPersonId
      && parentPersonIds.every(parentId => parentage.parentIds?.includes(parentId))
    ));

    if (
      parentPersonIds.length !== 2
      || !parentPersonIds.every(parentId => personIds.has(parentId))
      || !personIds.has(childPersonId)
      || !isDirectChild
    ) {
      invalidRequests.push(Object.freeze({
        partnershipId: partnership.id,
        parentPersonIds: Object.freeze(parentPersonIds),
        childPersonId
      }));
      return;
    }

    routes.push(Object.freeze({
      partnershipId: partnership.id,
      parentPersonIds: Object.freeze(parentPersonIds),
      childPersonId
    }));
  });

  const orderedRoutes = [...routes].sort((first, second) => (
    downstreamDepth(first, routes) - downstreamDepth(second, routes)
  ));

  return Object.freeze({
    routes: Object.freeze(orderedRoutes),
    invalidRequests: Object.freeze(invalidRequests)
  });
}

export function applyFamilyChartDescendantAlignmentPlan({
  tree,
  plan,
  orientation = 'vertical'
}) {
  const nodes = tree?.data || [];
  const axis = orientation === 'horizontal' ? 'y' : 'x';
  const appliedRoutes = [];

  (plan?.routes || []).forEach(route => {
    const childNode = displayedMainNode(nodes, route.childPersonId);
    const firstParentNode = displayedMainNode(nodes, route.parentPersonIds[0]);
    const secondParentNode = displayedPartnerNode(nodes, route.parentPersonIds[1])
      || displayedMainNode(nodes, route.parentPersonIds[1]);
    const childCoordinate = Number(childNode?.[axis]);
    const firstParentCoordinate = Number(firstParentNode?.[axis]);
    const secondParentCoordinate = Number(secondParentNode?.[axis]);

    if (
      !childNode
      || !firstParentNode
      || !secondParentNode
      || !Number.isFinite(childCoordinate)
      || !Number.isFinite(firstParentCoordinate)
      || !Number.isFinite(secondParentCoordinate)
    ) return;

    const parentCenter = (firstParentCoordinate + secondParentCoordinate) / 2;
    const delta = childCoordinate - parentCenter;
    if (delta) {
      shiftNodeAlongCrossAxis(firstParentNode, axis, delta);
      shiftNodeAlongCrossAxis(secondParentNode, axis, delta);
    }

    appliedRoutes.push(Object.freeze({
      ...route,
      axis,
      targetCoordinate: childCoordinate,
      delta
    }));
  });

  return Object.freeze({ appliedRoutes: Object.freeze(appliedRoutes) });
}
