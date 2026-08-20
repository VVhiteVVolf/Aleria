const PARENT_PAIR_OVER_CHILD_EXTENSION = 'chartAlignParentPairOverChildPersonId';
const CHILD_GROUP_BELOW_PARENT_PAIR_EXTENSION = 'chartAlignChildGroupBelowParentPair';

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
  const childGroupRoutes = [];
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

  (family?.partnerships || []).forEach(partnership => {
    if (partnership?.extensions?.[CHILD_GROUP_BELOW_PARENT_PAIR_EXTENSION] !== true) return;

    const parentPersonIds = Array.isArray(partnership.participantIds)
      ? [...partnership.participantIds]
      : [];
    const childPersonIds = [...new Set((family?.parentages || [])
      .filter(parentage => (
        parentage.partnershipId === partnership.id
        && !parentage.extensions?.timeJumpId
      ))
      .map(parentage => parentage.childId))];
    const adjacentFosterChildPersonIds = [...new Set((family?.parentages || [])
      .filter(parentage => (
        parentage.type === 'foster'
        && !parentage.partnershipId
        && !parentage.extensions?.timeJumpId
        && parentage.parentIds?.length === 1
        && parentPersonIds.includes(parentage.parentIds[0])
        && !childPersonIds.includes(parentage.childId)
        && personIds.has(parentage.childId)
        && !(family?.parentages || []).some(candidate => (
          candidate.parentIds?.includes(parentage.childId)
        ))
      ))
      .map(parentage => parentage.childId))];
    const continuingChildPersonIds = childPersonIds.filter(childPersonId => (
      (family?.parentages || []).some(parentage => parentage.parentIds?.includes(childPersonId))
    ));

    if (
      parentPersonIds.length !== 2
      || !parentPersonIds.every(parentId => personIds.has(parentId))
      || !childPersonIds.length
      || !childPersonIds.every(childPersonId => personIds.has(childPersonId))
      || continuingChildPersonIds.length
    ) {
      invalidRequests.push(Object.freeze({
        kind: 'child-group-below-parent-pair',
        partnershipId: partnership.id,
        parentPersonIds: Object.freeze(parentPersonIds),
        childPersonIds: Object.freeze(childPersonIds),
        continuingChildPersonIds: Object.freeze(continuingChildPersonIds)
      }));
      return;
    }

    childGroupRoutes.push(Object.freeze({
      partnershipId: partnership.id,
      parentPersonIds: Object.freeze(parentPersonIds),
      childPersonIds: Object.freeze(childPersonIds),
      adjacentFosterChildPersonIds: Object.freeze(adjacentFosterChildPersonIds)
    }));
  });

  const orderedRoutes = [...routes].sort((first, second) => (
    downstreamDepth(first, routes) - downstreamDepth(second, routes)
  ));

  return Object.freeze({
    routes: Object.freeze(orderedRoutes),
    childGroupRoutes: Object.freeze(childGroupRoutes),
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
  const appliedChildGroupRoutes = [];

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

  // In Mehrpartnergruppen darf die Diagrammbibliothek einen legitimen
  // Geschwisterblock nicht unter nur einen Elternteil ziehen. Diese bewusst
  // gesetzte Route verschiebt ausschließlich blattförmige Kinder als lokalen
  // Block unter die Mitte ihres Elternpaares. Andere Zweige bleiben unberührt.
  (plan?.childGroupRoutes || []).forEach(route => {
    const firstParentNode = displayedMainNode(nodes, route.parentPersonIds[0]);
    const secondParentNode = displayedPartnerNode(nodes, route.parentPersonIds[1])
      || displayedMainNode(nodes, route.parentPersonIds[1]);
    const childNodes = route.childPersonIds
      .map(childPersonId => displayedMainNode(nodes, childPersonId))
      .filter(Boolean);
    const adjacentFosterChildNodes = (route.adjacentFosterChildPersonIds || [])
      .map(childPersonId => displayedMainNode(nodes, childPersonId))
      .filter(Boolean);
    const firstParentCoordinate = Number(firstParentNode?.[axis]);
    const secondParentCoordinate = Number(secondParentNode?.[axis]);
    const childCoordinates = childNodes
      .map(childNode => Number(childNode?.[axis]))
      .filter(Number.isFinite);

    if (
      !firstParentNode
      || !secondParentNode
      || childNodes.length !== route.childPersonIds.length
      || !Number.isFinite(firstParentCoordinate)
      || !Number.isFinite(secondParentCoordinate)
      || childCoordinates.length !== childNodes.length
    ) return;

    const parentCenter = (firstParentCoordinate + secondParentCoordinate) / 2;
    const childCenter = (Math.min(...childCoordinates) + Math.max(...childCoordinates)) / 2;
    const delta = parentCenter - childCenter;
    if (delta) {
      [...childNodes, ...adjacentFosterChildNodes]
        .forEach(childNode => shiftNodeAlongCrossAxis(childNode, axis, delta));
    }

    appliedChildGroupRoutes.push(Object.freeze({
      ...route,
      axis,
      targetCoordinate: parentCenter,
      delta
    }));
  });

  return Object.freeze({
    appliedRoutes: Object.freeze(appliedRoutes),
    appliedChildGroupRoutes: Object.freeze(appliedChildGroupRoutes)
  });
}
