const PARTNER_OVER_CHILDREN_EXTENSION = 'chartAlignPartnerOverChildrenPersonId';
const CENTER_BETWEEN_SPOUSES_EXTENSION = 'chartCenterBetweenSpousePersonIds';
const ALIGN_LINEAGE_ORIGIN_EXTENSION = 'chartAlignLineageOriginOverPersonId';

function configuredPartnerId(partnership) {
  const value = partnership?.extensions?.[PARTNER_OVER_CHILDREN_EXTENSION];
  return typeof value === 'string' ? value.trim() : '';
}

function configuredSpouseIds(person) {
  const value = person?.extensions?.[CENTER_BETWEEN_SPOUSES_EXTENSION];
  if (value === undefined) return null;
  if (!Array.isArray(value)) return [];

  return [...new Set(value
    .filter(personId => typeof personId === 'string')
    .map(personId => personId.trim())
    .filter(Boolean))];
}

function marriageBetween(partnerships, firstPersonId, secondPersonId) {
  return partnerships.find(partnership => (
    partnership.type === 'marriage'
    && partnership.participantIds?.includes(firstPersonId)
    && partnership.participantIds?.includes(secondPersonId)
  ));
}

function createLineageOriginRoute(family, invalidRequests) {
  const configuredPersonId = family?.extensions?.[ALIGN_LINEAGE_ORIGIN_EXTENSION];
  if (configuredPersonId === undefined) return null;

  const targetPersonId = typeof configuredPersonId === 'string' ? configuredPersonId.trim() : '';
  const founderPartnership = (family?.partnerships || []).find(partnership => (
    partnership.id === family?.lineage?.founderPartnershipId
  ));
  const targetIsFounderDescendant = (family?.parentages || []).some(parentage => (
    parentage.partnershipId === founderPartnership?.id
    && parentage.childId === targetPersonId
  ));

  if (!targetPersonId || !founderPartnership || !targetIsFounderDescendant) {
    invalidRequests.push(Object.freeze({
      kind: 'lineage-origin-over-person',
      targetPersonId,
      founderPartnershipId: founderPartnership?.id || ''
    }));
    return null;
  }

  const crestNodeId = `__lineage-crest-${family.document.id}`;
  const timeGapNodeId = family?.lineage?.timeGap?.enabled
    ? `__lineage-gap-${family.document.id}`
    : '';
  return Object.freeze({
    targetPersonId,
    anchorNodeId: timeGapNodeId || crestNodeId,
    originNodeIds: Object.freeze([
      ...founderPartnership.participantIds,
      crestNodeId,
      ...(timeGapNodeId ? [timeGapNodeId] : [])
    ])
  });
}

function createPartnerOverChildrenRoutes(family, invalidRequests) {
  const parentages = family?.parentages || [];
  const routes = [];

  (family?.partnerships || []).forEach(partnership => {
    const partnerPersonId = configuredPartnerId(partnership);
    if (!partnerPersonId) return;

    const childIds = parentages
      .filter(parentage => parentage.partnershipId === partnership.id)
      .map(parentage => parentage.childId);
    if (!partnership.participantIds?.includes(partnerPersonId) || !childIds.length) {
      invalidRequests.push(Object.freeze({
        kind: 'partner-over-children',
        partnershipId: partnership.id,
        partnerPersonId,
        childIds: Object.freeze([...childIds])
      }));
      return;
    }

    routes.push(Object.freeze({
      partnershipId: partnership.id,
      partnerPersonId,
      childIds: Object.freeze([...new Set(childIds)])
    }));
  });

  return routes;
}

function createCenterBetweenSpousesRoutes(family, invalidRequests) {
  const partnerships = family?.partnerships || [];
  const personIds = new Set((family?.persons || []).map(person => person.id));
  const routes = [];

  (family?.persons || []).forEach(person => {
    const spousePersonIds = configuredSpouseIds(person);
    if (spousePersonIds === null) return;

    const marriages = spousePersonIds.map(spousePersonId => (
      marriageBetween(partnerships, person.id, spousePersonId)
    ));
    const invalidSpousePersonIds = spousePersonIds.filter((spousePersonId, index) => (
      !personIds.has(spousePersonId) || !marriages[index]
    ));

    if (spousePersonIds.length < 2 || invalidSpousePersonIds.length) {
      invalidRequests.push(Object.freeze({
        kind: 'center-between-spouses',
        centeredPersonId: person.id,
        spousePersonIds: Object.freeze([...spousePersonIds]),
        invalidSpousePersonIds: Object.freeze([...invalidSpousePersonIds])
      }));
      return;
    }

    routes.push(Object.freeze({
      centeredPersonId: person.id,
      spousePersonIds: Object.freeze([...spousePersonIds]),
      partnershipIds: Object.freeze(marriages.map(partnership => partnership.id))
    }));
  });

  return routes;
}

export function createFamilyChartPartnerAlignmentPlan(family) {
  const invalidRequests = [];
  const partnerOverChildrenRoutes = createPartnerOverChildrenRoutes(family, invalidRequests);
  const centerBetweenSpousesRoutes = createCenterBetweenSpousesRoutes(family, invalidRequests);
  const lineageOriginRoute = createLineageOriginRoute(family, invalidRequests);

  return Object.freeze({
    partnerOverChildrenRoutes: Object.freeze(partnerOverChildrenRoutes),
    centerBetweenSpousesRoutes: Object.freeze(centerBetweenSpousesRoutes),
    lineageOriginRoute,
    invalidRequests: Object.freeze(invalidRequests)
  });
}

function displayedNodeById(nodes, personId, { partnerCard = false } = {}) {
  const candidates = nodes.filter(node => node?.data?.id === personId);
  if (partnerCard) return candidates.find(node => node.spouse) || null;
  return candidates.find(node => !node.spouse) || candidates[0] || null;
}

function centeredCoordinate(nodes, axis) {
  const coordinates = nodes
    .map(node => Number(node?.[axis]))
    .filter(Number.isFinite);
  if (!coordinates.length) return null;
  return (Math.min(...coordinates) + Math.max(...coordinates)) / 2;
}

function moveNodeAlongCrossAxis(node, axis, targetCoordinate) {
  node[axis] = targetCoordinate;
  // Family Chart verwendet `sx` als Ansatzpunkt der Nachkommenlinie – in
  // vertikaler wie horizontaler Ausrichtung entlang derselben Querachse.
  node.sx = targetCoordinate;
}

function shiftNodeAlongCrossAxis(node, axis, delta) {
  const coordinate = Number(node?.[axis]);
  if (Number.isFinite(coordinate)) node[axis] = coordinate + delta;
  const sourceCoordinate = Number(node?.sx);
  if (Number.isFinite(sourceCoordinate)) node.sx = sourceCoordinate + delta;
}

export function applyFamilyChartPartnerAlignmentPlan({ tree, plan, orientation = 'vertical' }) {
  const nodes = tree?.data || [];
  const axis = orientation === 'horizontal' ? 'y' : 'x';
  const partnerOverChildren = [];
  const centeredPeople = [];
  let alignedLineageOrigin = null;

  // Zuerst stehen die Ehefrauen beziehungsweise Affären über ihren eigenen
  // Kinderblöcken. Erst danach wird die gemeinsame Person zwischen den
  // ausdrücklich gewählten legitimen Ehepartnern ausgerichtet.
  (plan?.partnerOverChildrenRoutes || []).forEach(route => {
    const partnerNode = displayedNodeById(nodes, route.partnerPersonId, { partnerCard: true });
    const childNodes = route.childIds
      .map(childId => displayedNodeById(nodes, childId))
      .filter(Boolean);
    const targetCoordinate = centeredCoordinate(childNodes, axis);
    if (!partnerNode || childNodes.length !== route.childIds.length || targetCoordinate === null) return;

    moveNodeAlongCrossAxis(partnerNode, axis, targetCoordinate);
    partnerOverChildren.push(Object.freeze({
      ...route,
      axis,
      targetCoordinate
    }));
  });

  (plan?.centerBetweenSpousesRoutes || []).forEach(route => {
    const centeredNode = displayedNodeById(nodes, route.centeredPersonId);
    const spouseNodes = route.spousePersonIds
      .map(spousePersonId => displayedNodeById(nodes, spousePersonId, { partnerCard: true }))
      .filter(Boolean);
    const targetCoordinate = centeredCoordinate(spouseNodes, axis);
    if (!centeredNode || spouseNodes.length !== route.spousePersonIds.length || targetCoordinate === null) return;

    moveNodeAlongCrossAxis(centeredNode, axis, targetCoordinate);
    centeredPeople.push(Object.freeze({
      ...route,
      axis,
      targetCoordinate
    }));
  });

  if (plan?.lineageOriginRoute) {
    const route = plan.lineageOriginRoute;
    const targetNode = displayedNodeById(nodes, route.targetPersonId);
    const anchorNode = displayedNodeById(nodes, route.anchorNodeId);
    const originNodes = route.originNodeIds.flatMap(nodeId => (
      nodes.filter(node => node?.data?.id === nodeId)
    ));
    const targetCoordinate = Number(targetNode?.[axis]);
    const anchorCoordinate = Number(anchorNode?.[axis]);
    if (
      targetNode
      && anchorNode
      && originNodes.length >= route.originNodeIds.length
      && Number.isFinite(targetCoordinate)
      && Number.isFinite(anchorCoordinate)
    ) {
      const delta = targetCoordinate - anchorCoordinate;
      originNodes.forEach(node => shiftNodeAlongCrossAxis(node, axis, delta));
      alignedLineageOrigin = Object.freeze({
        ...route,
        axis,
        targetCoordinate,
        delta
      });
    }
  }

  return Object.freeze({
    partnerOverChildren: Object.freeze(partnerOverChildren),
    centeredPeople: Object.freeze(centeredPeople),
    alignedLineageOrigin
  });
}
