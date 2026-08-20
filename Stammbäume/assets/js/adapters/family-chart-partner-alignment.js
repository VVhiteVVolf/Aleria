import { FAMILY_CHART_CARD_LAYOUT } from './family-chart-card-renderer.js';

const PARTNER_OVER_CHILDREN_EXTENSION = 'chartAlignPartnerOverChildrenPersonId';
const PARTNER_OVER_ADDITIONAL_CHILDREN_EXTENSION = 'chartAlignPartnerOverAdditionalChildrenIds';
const ARRANGE_LEAF_CHILDREN_EVENLY_EXTENSION = 'chartArrangeLeafChildrenEvenly';
const RESERVE_LEAF_CHILD_LANE_EXTENSION = 'chartReserveLeafChildLane';
const RESERVE_DESCENDANT_BRANCH_LANE_EXTENSION = 'chartReserveDescendantBranchLane';
const CENTER_BETWEEN_SPOUSES_EXTENSION = 'chartCenterBetweenSpousePersonIds';
const CENTER_BETWEEN_PARTNERS_EXTENSION = 'chartCenterBetweenPartnerPersonIds';
const ALIGN_LINEAGE_ORIGIN_EXTENSION = 'chartAlignLineageOriginOverPersonId';
const PARTNER_COLLISION_GAP = 32;
const MAX_NEARBY_RESTORE_SLOTS = 2;

function configuredPartnerId(partnership) {
  const value = partnership?.extensions?.[PARTNER_OVER_CHILDREN_EXTENSION];
  return typeof value === 'string' ? value.trim() : '';
}

function configuredAdditionalChildIds(partnership) {
  const value = partnership?.extensions?.[PARTNER_OVER_ADDITIONAL_CHILDREN_EXTENSION];
  if (value === undefined) return null;
  if (!Array.isArray(value)) return [];

  return [...new Set(value
    .filter(childId => typeof childId === 'string')
    .map(childId => childId.trim())
    .filter(Boolean))];
}

function shouldArrangeLeafChildrenEvenly(partnership) {
  return partnership?.extensions?.[ARRANGE_LEAF_CHILDREN_EVENLY_EXTENSION] === true;
}

function shouldReserveLeafChildLane(partnership) {
  return partnership?.extensions?.[RESERVE_LEAF_CHILD_LANE_EXTENSION] === true;
}

function shouldReserveDescendantBranchLane(partnership) {
  return partnership?.extensions?.[RESERVE_DESCENDANT_BRANCH_LANE_EXTENSION] === true
    ? true
    : undefined;
}

function collectDescendantBranchAppearances(family, rootChildIds) {
  const descendantPersonIds = new Set(rootChildIds);
  const partnerPersonIds = new Set();
  const queuedPersonIds = [...rootChildIds];

  while (queuedPersonIds.length) {
    const personId = queuedPersonIds.shift();
    (family?.partnerships || [])
      .filter(partnership => partnership.participantIds?.includes(personId))
      .forEach(partnership => {
        partnership.participantIds
          .filter(participantId => participantId !== personId)
          .forEach(partnerPersonId => partnerPersonIds.add(partnerPersonId));
        (family?.parentages || [])
          .filter(parentage => parentage.partnershipId === partnership.id)
          .forEach(parentage => {
            if (descendantPersonIds.has(parentage.childId)) return;
            descendantPersonIds.add(parentage.childId);
            queuedPersonIds.push(parentage.childId);
          });
      });
  }

  descendantPersonIds.forEach(personId => partnerPersonIds.delete(personId));
  return Object.freeze({
    descendantPersonIds: Object.freeze([...descendantPersonIds]),
    descendantPartnerPersonIds: Object.freeze([...partnerPersonIds])
  });
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

function partnershipBetween(partnerships, firstPersonId, secondPersonId) {
  return partnerships.find(partnership => (
    partnership.participantIds?.includes(firstPersonId)
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

    const directChildIds = parentages
      .filter(parentage => parentage.partnershipId === partnership.id)
      .map(parentage => parentage.childId);
    const additionalChildIds = configuredAdditionalChildIds(partnership);
    const invalidAdditionalChildIds = (additionalChildIds || []).filter(childId => (
      !parentages.some(parentage => (
        parentage.childId === childId
        && parentage.parentIds?.includes(partnerPersonId)
      ))
    ));
    const childIds = [...new Set([
      ...directChildIds,
      ...(additionalChildIds || [])
    ])];
    const sharedPersonIds = (partnership.participantIds || [])
      .filter(personId => personId !== partnerPersonId);
    const arrangeLeafChildrenEvenly = shouldArrangeLeafChildrenEvenly(partnership);
    const reserveLeafChildLane = shouldReserveLeafChildLane(partnership);
    const reserveDescendantBranchLane = shouldReserveDescendantBranchLane(partnership);
    const continuingChildIds = childIds.filter(childId => parentages.some(parentage => (
      parentage.parentIds?.includes(childId)
    )));
    const nonLeafChildIds = (
      arrangeLeafChildrenEvenly
      || (reserveLeafChildLane && !reserveDescendantBranchLane)
    )
      ? continuingChildIds
      : [];
    if (
      !partnership.participantIds?.includes(partnerPersonId)
      || sharedPersonIds.length !== 1
      || !childIds.length
      || additionalChildIds?.length === 0
      || invalidAdditionalChildIds.length
      || (reserveLeafChildLane && reserveDescendantBranchLane)
      || nonLeafChildIds.length
    ) {
      invalidRequests.push(Object.freeze({
        kind: 'partner-over-children',
        partnershipId: partnership.id,
        partnerPersonId,
        childIds: Object.freeze([...childIds]),
        invalidAdditionalChildIds: Object.freeze([...invalidAdditionalChildIds]),
        nonLeafChildIds: Object.freeze([...nonLeafChildIds]),
        reserveLeafChildLane,
        reserveDescendantBranchLane
      }));
      return;
    }

    const descendantBranch = reserveDescendantBranchLane
      ? collectDescendantBranchAppearances(family, childIds)
      : Object.freeze({
          descendantPersonIds: Object.freeze([]),
          descendantPartnerPersonIds: Object.freeze([])
        });

    routes.push(Object.freeze({
      partnershipId: partnership.id,
      partnershipType: partnership.type || 'marriage',
      sharedPersonId: sharedPersonIds[0],
      partnerPersonId,
      childIds: Object.freeze(childIds),
      continuingChildIds: Object.freeze(continuingChildIds),
      additionalChildIds: Object.freeze([...(additionalChildIds || [])]),
      arrangeLeafChildrenEvenly,
      reserveLeafChildLane,
      reserveDescendantBranchLane,
      descendantPersonIds: descendantBranch.descendantPersonIds,
      descendantPartnerPersonIds: descendantBranch.descendantPartnerPersonIds
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

function createCenterBetweenPartnersRoutes(family, invalidRequests) {
  const partnerships = family?.partnerships || [];
  const personIds = new Set((family?.persons || []).map(person => person.id));
  const routes = [];

  (family?.persons || []).forEach(person => {
    const partnerPersonIds = configuredPartnerIds(person);
    if (partnerPersonIds === null) return;

    const partnerPartnerships = partnerPersonIds.map(partnerPersonId => (
      partnershipBetween(partnerships, person.id, partnerPersonId)
    ));
    const invalidPartnerPersonIds = partnerPersonIds.filter((partnerPersonId, index) => (
      !personIds.has(partnerPersonId) || !partnerPartnerships[index]
    ));

    if (partnerPersonIds.length < 2 || invalidPartnerPersonIds.length) {
      invalidRequests.push(Object.freeze({
        kind: 'center-between-partners',
        centeredPersonId: person.id,
        partnerPersonIds: Object.freeze([...partnerPersonIds]),
        invalidPartnerPersonIds: Object.freeze([...invalidPartnerPersonIds])
      }));
      return;
    }

    routes.push(Object.freeze({
      centeredPersonId: person.id,
      partnerPersonIds: Object.freeze([...partnerPersonIds]),
      partnershipIds: Object.freeze(partnerPartnerships.map(partnership => partnership.id))
    }));
  });

  return routes;
}

export function createFamilyChartPartnerAlignmentPlan(family) {
  const invalidRequests = [];
  const partnerOverChildrenRoutes = createPartnerOverChildrenRoutes(family, invalidRequests);
  const centerBetweenSpousesRoutes = createCenterBetweenSpousesRoutes(family, invalidRequests);
  const centerBetweenPartnersRoutes = createCenterBetweenPartnersRoutes(family, invalidRequests);
  const lineageOriginRoute = createLineageOriginRoute(family, invalidRequests);

  return Object.freeze({
    partnerOverChildrenRoutes: Object.freeze(partnerOverChildrenRoutes),
    centerBetweenSpousesRoutes: Object.freeze(centerBetweenSpousesRoutes),
    centerBetweenPartnersRoutes: Object.freeze(centerBetweenPartnersRoutes),
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

function configuredPartnerIds(person) {
  const value = person?.extensions?.[CENTER_BETWEEN_PARTNERS_EXTENSION];
  if (value === undefined) return null;
  if (!Array.isArray(value)) return [];

  return [...new Set(value
    .filter(personId => typeof personId === 'string')
    .map(personId => personId.trim())
    .filter(Boolean))];
}

function arrangeNodesEvenly(nodes, axis) {
  const center = centeredCoordinate(nodes, axis);
  if (center === null || nodes.length < 2) return;
  const step = cardStepForAxis(axis);
  const midpointIndex = (nodes.length - 1) / 2;
  nodes.forEach((node, index) => {
    moveNodeAlongCrossAxis(node, axis, center + ((index - midpointIndex) * step));
  });
}

function shiftNodeAlongCrossAxis(node, axis, delta) {
  const coordinate = Number(node?.[axis]);
  if (Number.isFinite(coordinate)) node[axis] = coordinate + delta;
  const sourceCoordinate = Number(node?.sx);
  if (Number.isFinite(sourceCoordinate)) node.sx = sourceCoordinate + delta;
}

function cardRectangle(node, deltaAxis = '', delta = 0) {
  const x = Number(node?.x) + (deltaAxis === 'x' ? delta : 0);
  const y = Number(node?.y) + (deltaAxis === 'y' ? delta : 0);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  return {
    left: x,
    right: x + FAMILY_CHART_CARD_LAYOUT.width,
    top: y,
    bottom: y + FAMILY_CHART_CARD_LAYOUT.height
  };
}

function rectanglesOverlap(first, second, padding = 8) {
  if (!first || !second) return false;
  return !(
    first.right + padding <= second.left
    || second.right + padding <= first.left
    || first.bottom + padding <= second.top
    || second.bottom + padding <= first.top
  );
}

function shiftedCollisionCount(movingNodes, stationaryNodes, axis, delta) {
  let collisions = 0;
  movingNodes.forEach(movingNode => {
    const movingRectangle = cardRectangle(movingNode, axis, delta);
    stationaryNodes.forEach(stationaryNode => {
      if (rectanglesOverlap(movingRectangle, cardRectangle(stationaryNode))) collisions += 1;
    });
  });
  return collisions;
}

function partnerSideCounts(nodes, routes, sharedPersonId, sharedCoordinate, axis, excludedPartnerId) {
  return routes.reduce((counts, route) => {
    if (route.sharedPersonId !== sharedPersonId || route.partnerPersonId === excludedPartnerId) return counts;
    const partnerNode = displayedNodeById(nodes, route.partnerPersonId, { partnerCard: true });
    const coordinate = Number(partnerNode?.[axis]);
    if (!Number.isFinite(coordinate)) return counts;
    if (coordinate < sharedCoordinate) counts.before += 1;
    else counts.after += 1;
    return counts;
  }, { before: 0, after: 0 });
}

function collisionCandidates(sharedCoordinate, axis, sideCounts, maximumSlots) {
  const step = cardStepForAxis(axis);
  const preferredSide = sideCounts.before <= sideCounts.after ? 'before' : 'after';
  const secondarySide = preferredSide === 'before' ? 'after' : 'before';
  const candidates = [];
  for (let slot = 1; slot <= maximumSlots; slot += 1) {
    [preferredSide, secondarySide].forEach(side => {
      candidates.push({
        side,
        slot,
        coordinate: side === 'before'
          ? sharedCoordinate - (step * slot)
          : sharedCoordinate + (step * slot)
      });
    });
  }
  return candidates;
}

function cardStepForAxis(axis) {
  const cardSize = axis === 'x'
    ? FAMILY_CHART_CARD_LAYOUT.width
    : FAMILY_CHART_CARD_LAYOUT.height;
  return cardSize + PARTNER_COLLISION_GAP;
}

function collisionSearchSlots(nodes, movingNodes, sharedCoordinate, axis) {
  const step = cardStepForAxis(axis);
  const coordinates = [...nodes, ...movingNodes]
    .map(node => Number(node?.[axis]))
    .filter(Number.isFinite);
  if (!coordinates.length) return 3;

  const furthestDistance = Math.max(
    ...coordinates.map(coordinate => Math.abs(coordinate - sharedCoordinate))
  );
  const movingSpan = Math.max(0, ...coordinates) - Math.min(...coordinates);
  return Math.max(3, Math.ceil((furthestDistance + movingSpan) / step) + 2);
}

function shiftedBranchPairCollisions(firstBranch, firstDelta, secondBranch, secondDelta, axis) {
  let collisions = 0;
  firstBranch.forEach(firstNode => {
    const firstRectangle = cardRectangle(firstNode, axis, firstDelta);
    secondBranch.forEach(secondNode => {
      if (rectanglesOverlap(firstRectangle, cardRectangle(secondNode, axis, secondDelta))) {
        collisions += 1;
      }
    });
  });
  return collisions;
}

function movingNodesForRoute(nodes, route, partnerNode) {
  if (route.reserveDescendantBranchLane) {
    return [...new Set([
      partnerNode,
      ...(route.descendantPersonIds || [])
        .map(personId => displayedNodeById(nodes, personId))
        .filter(Boolean),
      ...(route.descendantPartnerPersonIds || [])
        .map(personId => displayedNodeById(nodes, personId, { partnerCard: true }))
        .filter(Boolean)
    ])];
  }
  if (!route.reserveLeafChildLane) return [partnerNode];
  return [
    partnerNode,
    ...route.childIds
      .map(childId => displayedNodeById(nodes, childId))
      .filter(Boolean)
  ];
}

function descendantRouteDepth(route, routes, visiting = new Set()) {
  if (visiting.has(route.partnershipId)) return 0;
  const nextVisiting = new Set(visiting).add(route.partnershipId);
  const ancestorRoutes = routes.filter(candidate => (
    candidate.partnershipId !== route.partnershipId
    && candidate.reserveDescendantBranchLane
    && candidate.descendantPersonIds?.includes(route.sharedPersonId)
  ));
  if (!ancestorRoutes.length) return 0;
  return 1 + Math.max(...ancestorRoutes.map(candidate => (
    descendantRouteDepth(candidate, routes, nextVisiting)
  )));
}

/**
 * A nested multi-partner layout can move a continuing child after its own
 * parent partner was aligned. Re-anchor complete opted-in descendant branches
 * from the outside in so every direct parent-child lane remains vertical while
 * all already packed partners and descendants keep their relative positions.
 */
function reconcileDescendantBranchAnchors(nodes, routes, axis) {
  const resolutions = [];
  const orderedRoutes = (routes || [])
    .filter(route => route.reserveDescendantBranchLane)
    .sort((first, second) => (
      descendantRouteDepth(first, routes) - descendantRouteDepth(second, routes)
    ));

  orderedRoutes.forEach(route => {
    const partnerNode = displayedNodeById(nodes, route.partnerPersonId, { partnerCard: true });
    const childNodes = route.childIds
      .map(childId => displayedNodeById(nodes, childId))
      .filter(Boolean);
    const partnerCoordinate = Number(partnerNode?.[axis]);
    const childCoordinate = centeredCoordinate(childNodes, axis);
    if (
      !partnerNode
      || childNodes.length !== route.childIds.length
      || !Number.isFinite(partnerCoordinate)
      || childCoordinate === null
    ) return;

    const delta = partnerCoordinate - childCoordinate;
    if (!delta) return;
    const descendantNodes = movingNodesForRoute(nodes, route, partnerNode)
      .filter(node => node !== partnerNode);
    descendantNodes.forEach(node => shiftNodeAlongCrossAxis(node, axis, delta));
    resolutions.push(Object.freeze({
      partnershipId: route.partnershipId,
      partnerPersonId: route.partnerPersonId,
      childIds: route.childIds,
      axis,
      targetCoordinate: partnerCoordinate,
      delta,
      strategy: 'reanchor-descendant-branch'
    }));
  });

  return resolutions;
}

function placementCollisionCount(placements, stationaryNodes, axis) {
  let collisions = 0;
  placements.forEach(placement => {
    placement.nodes.forEach(node => {
      const rectangle = cardRectangle(node, axis, placement.delta);
      stationaryNodes.forEach(stationaryNode => {
        if (rectanglesOverlap(rectangle, cardRectangle(stationaryNode))) collisions += 1;
      });
    });
  });
  for (let firstIndex = 0; firstIndex < placements.length; firstIndex += 1) {
    for (let secondIndex = firstIndex + 1; secondIndex < placements.length; secondIndex += 1) {
      placements[firstIndex].nodes.forEach(firstNode => {
        const firstRectangle = cardRectangle(firstNode, axis, placements[firstIndex].delta);
        placements[secondIndex].nodes.forEach(secondNode => {
          const secondRectangle = cardRectangle(secondNode, axis, placements[secondIndex].delta);
          if (rectanglesOverlap(firstRectangle, secondRectangle)) collisions += 1;
        });
      });
    }
  }
  return collisions;
}

function resolveCenteredLeafPartnerPacking(nodes, centeredRoutes, partnerRoutes, axis) {
  const resolutions = [];
  const packedCenteredPersonIds = new Set();
  const step = cardStepForAxis(axis);

  centeredRoutes.forEach(centeredRoute => {
    if (centeredRoute.partnerPersonIds.length !== 2) return;
    const localRoutes = centeredRoute.partnerPersonIds.map(partnerPersonId => (
      partnerRoutes.find(route => (
        route.sharedPersonId === centeredRoute.centeredPersonId
        && route.partnerPersonId === partnerPersonId
      ))
    ));
    if (localRoutes.some(route => !route)) return;

    const continuingRoutes = localRoutes.filter(route => route.continuingChildIds.length > 0);
    const leafRoutes = localRoutes.filter(route => (
      route.reserveLeafChildLane
      && route.continuingChildIds.length === 0
    ));
    if (continuingRoutes.length !== 1 || leafRoutes.length !== 1) return;

    const continuingRoute = continuingRoutes[0];
    const leafRoute = leafRoutes[0];
    const centeredNode = displayedNodeById(nodes, centeredRoute.centeredPersonId);
    const continuingPartnerNode = displayedNodeById(
      nodes,
      continuingRoute.partnerPersonId,
      { partnerCard: true }
    );
    const leafPartnerNode = displayedNodeById(
      nodes,
      leafRoute.partnerPersonId,
      { partnerCard: true }
    );
    const anchorCoordinate = Number(continuingPartnerNode?.[axis]);
    const centeredNodeCoordinate = Number(centeredNode?.[axis]);
    const leafCoordinate = Number(leafPartnerNode?.[axis]);
    if (
      !centeredNode
      || !continuingPartnerNode
      || !leafPartnerNode
      || !Number.isFinite(anchorCoordinate)
      || !Number.isFinite(centeredNodeCoordinate)
      || !Number.isFinite(leafCoordinate)
    ) return;

    const leafNodes = movingNodesForRoute(nodes, leafRoute, leafPartnerNode);
    const continuingNodes = movingNodesForRoute(nodes, continuingRoute, continuingPartnerNode);
    const movingNodeSet = new Set([centeredNode, ...continuingNodes, ...leafNodes]);
    const stationaryNodes = nodes.filter(node => !movingNodeSet.has(node));
    const continuingIndex = centeredRoute.partnerPersonIds.indexOf(continuingRoute.partnerPersonId);
    const leafIndex = centeredRoute.partnerPersonIds.indexOf(leafRoute.partnerPersonId);
    const preferredLeafFirst = leafIndex < continuingIndex;
    const orderCandidates = preferredLeafFirst
      ? [true, false]
      : [false, true];
    const candidates = orderCandidates.flatMap(leafFirst => (
      [anchorCoordinate, anchorCoordinate - (step * 2)].map(startCoordinate => {
        const leafTarget = leafFirst ? startCoordinate : startCoordinate + (step * 2);
        const continuingTarget = leafFirst ? startCoordinate + (step * 2) : startCoordinate;
        const centeredTarget = startCoordinate + step;
        const placements = [
          {
            nodes: continuingNodes,
            delta: continuingTarget - anchorCoordinate
          },
          {
            nodes: [centeredNode],
            delta: centeredTarget - centeredNodeCoordinate
          },
          {
            nodes: leafNodes,
            delta: leafTarget - leafCoordinate
          }
        ];
        return {
          leafFirst,
          centeredTarget,
          continuingTarget,
          leafTarget,
          placements,
          collisionCount: placementCollisionCount(placements, stationaryNodes, axis)
        };
      })
    ));
    const selected = candidates.find(candidate => candidate.collisionCount === 0);
    if (!selected) return;

    selected.placements.forEach(placement => {
      if (!placement.delta) return;
      placement.nodes.forEach(node => shiftNodeAlongCrossAxis(node, axis, placement.delta));
    });
    packedCenteredPersonIds.add(centeredRoute.centeredPersonId);
    resolutions.push(Object.freeze({
      ...centeredRoute,
      axis,
      targetCoordinate: selected.centeredTarget,
      continuingPartnerPersonId: continuingRoute.partnerPersonId,
      continuingPartnerTargetCoordinate: selected.continuingTarget,
      leafPartnerPersonId: leafRoute.partnerPersonId,
      leafTargetCoordinate: selected.leafTarget,
      side: selected.leafFirst ? 'before' : 'after',
      collisionCount: selected.collisionCount,
      strategy: 'pack-centered-leaf-partner-lane'
    }));
  });

  return { resolutions, packedCenteredPersonIds };
}

function resolveCenteredPartnerCardPacking(
  nodes,
  centeredRoutes,
  partnerRoutes,
  axis,
  alreadyPackedPersonIds = new Set()
) {
  const resolutions = [];
  const packedCenteredPersonIds = new Set();
  const step = cardStepForAxis(axis);

  centeredRoutes.forEach(centeredRoute => {
    if (
      alreadyPackedPersonIds.has(centeredRoute.centeredPersonId)
      || centeredRoute.partnerPersonIds.length !== 2
    ) return;

    const centeredNode = displayedNodeById(nodes, centeredRoute.centeredPersonId);
    const partnerPlacements = centeredRoute.partnerPersonIds.map(partnerPersonId => {
      const partnerNode = displayedNodeById(nodes, partnerPersonId, { partnerCard: true });
      const partnerRoute = partnerRoutes.find(route => (
        route.sharedPersonId === centeredRoute.centeredPersonId
        && route.partnerPersonId === partnerPersonId
      ));
      return partnerNode
        ? {
            partnerPersonId,
            partnerNode,
            nodes: partnerRoute
              ? movingNodesForRoute(nodes, partnerRoute, partnerNode)
              : [partnerNode]
          }
        : null;
    });
    if (!centeredNode || partnerPlacements.some(placement => !placement)) return;

    const visibleCards = [
      partnerPlacements[0].partnerNode,
      centeredNode,
      partnerPlacements[1].partnerNode
    ];
    const hasCurrentCollision = visibleCards.some((node, index) => (
      visibleCards.slice(index + 1).some(otherNode => (
        rectanglesOverlap(cardRectangle(node), cardRectangle(otherNode))
      ))
    ));

    // Eine Kernperson kann außerhalb zweier bereits kollisionsfreier
    // Partnerkarten liegen. Das bloße Mitteln weiter unten würde sie dann in
    // beide Karten hineinschieben. Deshalb wird auch die *künftige*
    // Mittelpunktposition geprüft und bei Bedarf als echte Dreierspur gepackt.
    const centeredCoordinateNow = Number(centeredNode?.[axis]);
    const firstPartnerCoordinate = Number(partnerPlacements[0].partnerNode?.[axis]);
    const secondPartnerCoordinate = Number(partnerPlacements[1].partnerNode?.[axis]);
    if (
      !Number.isFinite(centeredCoordinateNow)
      || !Number.isFinite(firstPartnerCoordinate)
      || !Number.isFinite(secondPartnerCoordinate)
    ) return;

    const prospectiveCenteredCoordinate = (
      firstPartnerCoordinate + secondPartnerCoordinate
    ) / 2;
    const prospectiveCenteredRectangle = cardRectangle(
      centeredNode,
      axis,
      prospectiveCenteredCoordinate - centeredCoordinateNow
    );
    const hasProspectiveCollision = partnerPlacements.some(placement => (
      rectanglesOverlap(
        prospectiveCenteredRectangle,
        cardRectangle(placement.partnerNode)
      )
    ));
    if (!hasCurrentCollision && !hasProspectiveCollision) return;

    const movingNodeSet = new Set([
      centeredNode,
      ...partnerPlacements.flatMap(placement => placement.nodes)
    ]);
    const stationaryNodes = nodes.filter(node => !movingNodeSet.has(node));

    const baseCoordinates = [...new Set([
      centeredCoordinateNow,
      (firstPartnerCoordinate + secondPartnerCoordinate) / 2,
      firstPartnerCoordinate + step,
      secondPartnerCoordinate - step
    ])];
    const maximumSlots = collisionSearchSlots(
      stationaryNodes,
      [...movingNodeSet],
      centeredCoordinateNow,
      axis
    );
    const candidateCoordinates = [...new Set(baseCoordinates.flatMap(baseCoordinate => [
      baseCoordinate,
      ...Array.from({ length: maximumSlots }, (_, index) => baseCoordinate - (step * (index + 1))),
      ...Array.from({ length: maximumSlots }, (_, index) => baseCoordinate + (step * (index + 1)))
    ]))];
    const candidates = candidateCoordinates.map(targetCoordinate => {
      const placements = [
        {
          nodes: partnerPlacements[0].nodes,
          delta: (targetCoordinate - step) - firstPartnerCoordinate
        },
        {
          nodes: [centeredNode],
          delta: targetCoordinate - centeredCoordinateNow
        },
        {
          nodes: partnerPlacements[1].nodes,
          delta: (targetCoordinate + step) - secondPartnerCoordinate
        }
      ];
      return {
        targetCoordinate,
        placements,
        collisionCount: placementCollisionCount(placements, stationaryNodes, axis),
        movement: placements.reduce((sum, placement) => sum + Math.abs(placement.delta), 0)
      };
    });
    const selected = candidates
      .filter(candidate => candidate.collisionCount === 0)
      .sort((first, second) => first.movement - second.movement)[0];
    if (!selected) return;

    selected.placements.forEach(placement => {
      if (!placement.delta) return;
      placement.nodes.forEach(node => shiftNodeAlongCrossAxis(node, axis, placement.delta));
    });
    packedCenteredPersonIds.add(centeredRoute.centeredPersonId);
    resolutions.push(Object.freeze({
      ...centeredRoute,
      axis,
      targetCoordinate: selected.targetCoordinate,
      collisionCount: selected.collisionCount,
      strategy: 'pack-centered-partner-cards'
    }));
  });

  return { resolutions, packedCenteredPersonIds };
}

function resolvePartnerGroupCollisions(nodes, routes, axis) {
  const resolutions = [];
  const resolvedPartnershipIds = new Set();
  const routesBySharedPerson = new Map();
  routes.forEach(route => {
    const group = routesBySharedPerson.get(route.sharedPersonId) || [];
    group.push(route);
    routesBySharedPerson.set(route.sharedPersonId, group);
  });

  routesBySharedPerson.forEach(group => {
    if (group.length < 2) return;
    const sharedNode = displayedNodeById(nodes, group[0].sharedPersonId);
    const sharedCoordinate = Number(sharedNode?.[axis]);
    if (!sharedNode || !Number.isFinite(sharedCoordinate)) return;

    const branches = group.map(route => {
      const partnerNode = displayedNodeById(nodes, route.partnerPersonId, { partnerCard: true });
      return partnerNode
        ? { route, partnerNode, nodes: movingNodesForRoute(nodes, route, partnerNode) }
        : null;
    }).filter(Boolean).sort((first, second) => (
      Number(first.partnerNode?.[axis]) - Number(second.partnerNode?.[axis])
    ));
    if (branches.length !== group.length) return;

    const allBranchNodes = new Set(branches.flatMap(branch => branch.nodes));
    const fixedNodes = nodes.filter(node => !allBranchNodes.has(node));
    const hasCollision = branches.some(branch => {
      const partnerRectangle = cardRectangle(branch.partnerNode);
      return nodes.some(node => (
        !branch.nodes.includes(node)
        && rectanglesOverlap(partnerRectangle, cardRectangle(node))
      ));
    });
    if (!hasCollision) return;

    const step = cardStepForAxis(axis);
    let bestLayout = null;
    for (let leftCount = 0; leftCount <= branches.length; leftCount += 1) {
      const placements = branches.map((branch, index) => {
        const targetCoordinate = index < leftCount
          ? sharedCoordinate - (step * (leftCount - index))
          : sharedCoordinate + (step * (index - leftCount + 1));
        return {
          branch,
          targetCoordinate,
          delta: targetCoordinate - Number(branch.partnerNode?.[axis])
        };
      });
      let collisionCount = placements.reduce((count, placement) => (
        count + shiftedCollisionCount(placement.branch.nodes, fixedNodes, axis, placement.delta)
      ), 0);
      for (let firstIndex = 0; firstIndex < placements.length; firstIndex += 1) {
        for (let secondIndex = firstIndex + 1; secondIndex < placements.length; secondIndex += 1) {
          collisionCount += shiftedBranchPairCollisions(
            placements[firstIndex].branch.nodes,
            placements[firstIndex].delta,
            placements[secondIndex].branch.nodes,
            placements[secondIndex].delta,
            axis
          );
        }
      }
      const movement = placements.reduce((sum, placement) => sum + Math.abs(placement.delta), 0);
      if (
        !bestLayout
        || collisionCount < bestLayout.collisionCount
        || (collisionCount === bestLayout.collisionCount && movement < bestLayout.movement)
      ) {
        bestLayout = { placements, collisionCount, movement };
      }
    }
    if (!bestLayout || bestLayout.collisionCount > 0) return;

    bestLayout.placements.forEach(placement => {
      if (placement.delta) {
        placement.branch.nodes.forEach(node => shiftNodeAlongCrossAxis(node, axis, placement.delta));
      }
      const side = placement.targetCoordinate < sharedCoordinate ? 'before' : 'after';
      resolutions.push(Object.freeze({
        partnershipId: placement.branch.route.partnershipId,
        sharedPersonId: placement.branch.route.sharedPersonId,
        partnerPersonId: placement.branch.route.partnerPersonId,
        childIds: placement.branch.route.childIds,
        axis,
        side,
        slot: Math.round(Math.abs(placement.targetCoordinate - sharedCoordinate) / step),
        delta: placement.delta,
        collisionCount: 0,
        strategy: 'pack-partner-lanes'
      }));
      resolvedPartnershipIds.add(placement.branch.route.partnershipId);
    });
  });

  return { resolutions, resolvedPartnershipIds };
}

function resolvePartnerCardCollisions(
  nodes,
  routes,
  axis,
  originalPartnerCoordinates
) {
  const groupedResolution = resolvePartnerGroupCollisions(nodes, routes, axis);
  const resolutions = [...groupedResolution.resolutions];
  routes.forEach(route => {
    if (groupedResolution.resolvedPartnershipIds.has(route.partnershipId)) return;
    const partnerNode = displayedNodeById(nodes, route.partnerPersonId, { partnerCard: true });
    const sharedNode = displayedNodeById(nodes, route.sharedPersonId);
    if (!partnerNode || !sharedNode) return;

    const movingNodes = movingNodesForRoute(nodes, route, partnerNode);
    const movingNodeSet = new Set(movingNodes);
    const stationaryNodes = nodes.filter(node => !movingNodeSet.has(node));
    const partnerRectangle = cardRectangle(partnerNode);
    if (!stationaryNodes.some(node => rectanglesOverlap(partnerRectangle, cardRectangle(node)))) return;

    const sharedCoordinate = Number(sharedNode?.[axis]);
    const partnerCoordinate = Number(partnerNode?.[axis]);
    if (!Number.isFinite(sharedCoordinate) || !Number.isFinite(partnerCoordinate)) return;

    // Die Diagrammbibliothek hat Partner bereits kollisionsfrei links oder
    // rechts der Kernperson eingeplant. Falls das zusätzliche Ausrichten über
    // einem Kind eine Karte überdeckt, ist diese ursprüngliche Position nur
    // dann ein sinnvoller Rückfall, wenn sie noch nahe an der Kernperson liegt.
    // Weiter entfernte Bibliothekspositionen erzeugen sonst extrem lange Linien.
    const originalCoordinate = Number(originalPartnerCoordinates?.get(route.partnershipId));
    const originalDistanceFromShared = Math.abs(originalCoordinate - sharedCoordinate);
    const maximumNearbyRestoreDistance = cardStepForAxis(axis) * MAX_NEARBY_RESTORE_SLOTS;
    if (
      Number.isFinite(originalCoordinate)
      && originalCoordinate !== partnerCoordinate
      && originalDistanceFromShared <= maximumNearbyRestoreDistance
    ) {
      const originalDelta = originalCoordinate - partnerCoordinate;
      const otherNodes = nodes.filter(node => !movingNodeSet.has(node));
      const originalCollisions = shiftedCollisionCount(movingNodes, otherNodes, axis, originalDelta);
      if (originalCollisions === 0) {
        movingNodes.forEach(node => shiftNodeAlongCrossAxis(node, axis, originalDelta));
        resolutions.push(Object.freeze({
          partnershipId: route.partnershipId,
          sharedPersonId: route.sharedPersonId,
          partnerPersonId: route.partnerPersonId,
          childIds: route.childIds,
          axis,
          side: originalCoordinate < sharedCoordinate ? 'before' : 'after',
          slot: 0,
          delta: originalDelta,
          collisionCount: 0,
          strategy: 'restore-chart-position'
        }));
        return;
      }
    }

    const sideCounts = partnerSideCounts(
      nodes,
      routes,
      route.sharedPersonId,
      sharedCoordinate,
      axis,
      route.partnerPersonId
    );
    const candidates = collisionCandidates(
      sharedCoordinate,
      axis,
      sideCounts,
      collisionSearchSlots(stationaryNodes, movingNodes, sharedCoordinate, axis)
    );
    let bestCandidate = null;
    candidates.forEach(candidate => {
      const delta = candidate.coordinate - partnerCoordinate;
      const collisionCount = shiftedCollisionCount(movingNodes, stationaryNodes, axis, delta);
      if (
        !bestCandidate
        || collisionCount < bestCandidate.collisionCount
        || (
          collisionCount === bestCandidate.collisionCount
          && Math.abs(delta) < Math.abs(bestCandidate.delta)
        )
      ) {
        bestCandidate = { ...candidate, delta, collisionCount };
      }
    });
    if (!bestCandidate || !bestCandidate.delta) return;

    movingNodes.forEach(node => shiftNodeAlongCrossAxis(node, axis, bestCandidate.delta));
    resolutions.push(Object.freeze({
      partnershipId: route.partnershipId,
      sharedPersonId: route.sharedPersonId,
      partnerPersonId: route.partnerPersonId,
      childIds: route.childIds,
      axis,
      side: bestCandidate.side,
      slot: bestCandidate.slot,
      delta: bestCandidate.delta,
      collisionCount: bestCandidate.collisionCount
    }));
  });
  return resolutions;
}

export function applyFamilyChartPartnerAlignmentPlan({ tree, plan, orientation = 'vertical' }) {
  const nodes = tree?.data || [];
  const axis = orientation === 'horizontal' ? 'y' : 'x';
  const partnerOverChildren = [];
  const centeredPeople = [];
  const originalPartnerCoordinates = new Map();
  let collisionResolutions = [];
  let descendantAnchorResolutions = [];
  let alignedLineageOrigin = null;

  // Zuerst stehen die Ehefrauen beziehungsweise Affären über ihren eigenen
  // Kinderblöcken. Erst danach wird die gemeinsame Person zwischen den
  // ausdrücklich gewählten legitimen Ehepartnern ausgerichtet.
  (plan?.partnerOverChildrenRoutes || []).forEach(route => {
    const partnerNode = displayedNodeById(nodes, route.partnerPersonId, { partnerCard: true });
    const childNodes = route.childIds
      .map(childId => displayedNodeById(nodes, childId))
      .filter(Boolean);
    if (route.arrangeLeafChildrenEvenly && childNodes.length === route.childIds.length) {
      arrangeNodesEvenly(childNodes, axis);
    }
    const targetCoordinate = centeredCoordinate(childNodes, axis);
    if (!partnerNode || childNodes.length !== route.childIds.length || targetCoordinate === null) return;

    originalPartnerCoordinates.set(route.partnershipId, Number(partnerNode?.[axis]));
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

  // Bei gemischten Partnergruppen (zum Beispiel Ehefrau und Affäre) bleiben
  // Partner und Kinder in ihren bereits berechneten lokalen Blöcken. Nur die
  // einmal vorhandene gemeinsame Person wird zwischen den Partnerkarten gesetzt.
  const packedPartnerGroups = resolveCenteredLeafPartnerPacking(
    nodes,
    plan?.centerBetweenPartnersRoutes || [],
    plan?.partnerOverChildrenRoutes || [],
    axis
  );
  centeredPeople.push(...packedPartnerGroups.resolutions);

  // Falls Family Chart zwei Partnerkarten zu dicht nebeneinander anlegt, reicht
  // das bloße Mitteln ihrer Koordinaten nicht: Die Kernperson würde eine der
  // Karten überdecken. Solche Gruppen werden als drei lokale Spuren gepackt.
  // Opt-in-Seitenzweige (Partner samt Blattkindern) bleiben dabei zusammen.
  const packedPartnerCards = resolveCenteredPartnerCardPacking(
    nodes,
    plan?.centerBetweenPartnersRoutes || [],
    plan?.partnerOverChildrenRoutes || [],
    axis,
    packedPartnerGroups.packedCenteredPersonIds
  );
  centeredPeople.push(...packedPartnerCards.resolutions);

  (plan?.centerBetweenPartnersRoutes || []).forEach(route => {
    if (
      packedPartnerGroups.packedCenteredPersonIds.has(route.centeredPersonId)
      || packedPartnerCards.packedCenteredPersonIds.has(route.centeredPersonId)
    ) return;
    const centeredNode = displayedNodeById(nodes, route.centeredPersonId);
    const partnerNodes = route.partnerPersonIds
      .map(partnerPersonId => displayedNodeById(nodes, partnerPersonId, { partnerCard: true }))
      .filter(Boolean);
    const targetCoordinate = centeredCoordinate(partnerNodes, axis);
    if (!centeredNode || partnerNodes.length !== route.partnerPersonIds.length || targetCoordinate === null) return;
    moveNodeAlongCrossAxis(centeredNode, axis, targetCoordinate);
    centeredPeople.push(Object.freeze({
      ...route,
      axis,
      targetCoordinate,
      strategy: 'center-between-partners'
    }));
  });

  // Das Ausrichten einer Partnerkarte über ihrem Kinderblock darf weder die
  // gemeinsame Kernperson noch eine weitere Partnerkarte überdecken. Standardmäßig
  // weicht nur die Partnerkarte aus. Opt-in-Routen mit reservierter Blattspur
  // verschieben Partner und direkte Blattkinder als zusammengehörigen Seitenblock.
  collisionResolutions = resolvePartnerCardCollisions(
    nodes,
    plan?.partnerOverChildrenRoutes || [],
    axis,
    originalPartnerCoordinates
  );

  // Eine tiefere Mehrpartnergruppe darf den bereits ausgerichteten
  // Elternanschluss ihres gesamten Zweigs nicht wieder auseinanderziehen.
  descendantAnchorResolutions = reconcileDescendantBranchAnchors(
    nodes,
    plan?.partnerOverChildrenRoutes || [],
    axis
  );

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
    collisionResolutions: Object.freeze(collisionResolutions),
    descendantAnchorResolutions: Object.freeze(descendantAnchorResolutions),
    alignedLineageOrigin
  });
}
