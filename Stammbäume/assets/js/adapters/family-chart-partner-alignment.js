import {
  cardRectangle,
  cardStepForAxis,
  rectanglesOverlap,
  shiftedCollisionCount,
  shiftNodeAlongCrossAxis
} from './family-chart-collision-geometry.js';
import { createAutomaticFamilyChartMultiPartnerPlan } from './family-chart-multi-partner-policy.js';

const PARTNER_OVER_CHILDREN_EXTENSION = 'chartAlignPartnerOverChildrenPersonId';
const PARTNER_OVER_ADDITIONAL_CHILDREN_EXTENSION = 'chartAlignPartnerOverAdditionalChildrenIds';
const ARRANGE_LEAF_CHILDREN_EVENLY_EXTENSION = 'chartArrangeLeafChildrenEvenly';
const RESERVE_LEAF_CHILD_LANE_EXTENSION = 'chartReserveLeafChildLane';
const RESERVE_DESCENDANT_BRANCH_LANE_EXTENSION = 'chartReserveDescendantBranchLane';
const CENTER_BETWEEN_SPOUSES_EXTENSION = 'chartCenterBetweenSpousePersonIds';
const CENTER_BETWEEN_PARTNERS_EXTENSION = 'chartCenterBetweenPartnerPersonIds';
const KEEP_PARTNER_GROUP_TOGETHER_EXTENSION = 'chartKeepPartnerGroupTogether';
const PARTNER_GROUP_PERSON_ORDER_EXTENSION = 'chartPartnerGroupPersonOrder';
const ALIGN_LINEAGE_ORIGIN_EXTENSION = 'chartAlignLineageOriginOverPersonId';
const ALIGN_LINEAGE_ORIGIN_OVER_TREE_EXTENSION = 'chartAlignLineageOriginOverTree';
const LINEAGE_CREST_PARENT_EXTENSION = 'chartLineageCrestParentPersonId';
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
  const alignOverVisibleTree = family?.extensions?.[ALIGN_LINEAGE_ORIGIN_OVER_TREE_EXTENSION] === true;
  const configuredTarget = family?.extensions?.[ALIGN_LINEAGE_ORIGIN_EXTENSION];
  if (configuredTarget === undefined && !alignOverVisibleTree) return null;

  const configuredTargetPersonIds = [...new Set((Array.isArray(configuredTarget)
    ? configuredTarget
    : [configuredTarget])
    .filter(personId => typeof personId === 'string')
    .map(personId => personId.trim())
    .filter(Boolean))];
  const usesTargetGroup = Array.isArray(configuredTarget);
  const founderPartnership = (family?.partnerships || []).find(partnership => (
    partnership.id === family?.lineage?.founderPartnershipId
  ));
  const founderPersonIds = new Set(founderPartnership?.participantIds || []);
  const configuredLineageAnchorPersonId = typeof family?.extensions?.[LINEAGE_CREST_PARENT_EXTENSION] === 'string'
    ? family.extensions[LINEAGE_CREST_PARENT_EXTENSION].trim()
    : '';
  const lineageAnchorPersonId = founderPersonIds.has(configuredLineageAnchorPersonId)
    ? configuredLineageAnchorPersonId
    : '';
  const targetPersonIds = alignOverVisibleTree
    ? (family?.persons || [])
      .map(person => person.id)
      .filter(personId => !founderPersonIds.has(personId))
    : configuredTargetPersonIds;
  const founderDescendantIds = new Set((family?.parentages || [])
    .filter(parentage => parentage.partnershipId === founderPartnership?.id)
    .map(parentage => parentage.childId));
  const targetsAreValid = targetPersonIds.length > 0 && (
    alignOverVisibleTree
    || targetPersonIds.every(personId => founderDescendantIds.has(personId))
  );
  const directTimeJump = (family?.timeJumps || []).find(timeJump => (
    timeJump.parentPartnershipId === founderPartnership?.id
    && (
      alignOverVisibleTree
      || targetPersonIds.every(personId => timeJump.childIds?.includes(personId))
    )
  ));

  if (!founderPartnership || !targetsAreValid) {
    invalidRequests.push(Object.freeze({
      kind: 'lineage-origin-over-person',
      targetPersonIds: Object.freeze([...targetPersonIds]),
      founderPartnershipId: founderPartnership?.id || ''
    }));
    return null;
  }

  const crestNodeId = `__lineage-crest-${family.document.id}`;
  const lineageTimeGapNodeId = family?.lineage?.timeGap?.enabled
    ? `__lineage-gap-${family.document.id}`
    : '';
  const explicitTimeJumpNodeId = directTimeJump
    ? `__time-jump-${directTimeJump.id}`
    : '';
  const anchorNodeId = explicitTimeJumpNodeId || lineageTimeGapNodeId || crestNodeId;
  return Object.freeze({
    ...(alignOverVisibleTree
      ? {
          targetScope: 'visible-tree',
          targetPersonIds: Object.freeze([...targetPersonIds])
        }
      : usesTargetGroup
      ? { targetPersonIds: Object.freeze([...targetPersonIds]) }
      : { targetPersonId: targetPersonIds[0] }),
    anchorNodeId,
    originNodeIds: Object.freeze([
      ...founderPartnership.participantIds,
      crestNodeId,
      ...(lineageTimeGapNodeId ? [lineageTimeGapNodeId] : []),
      ...(explicitTimeJumpNodeId ? [explicitTimeJumpNodeId] : [])
    ]),
    ...(lineageAnchorPersonId
      ? {
          lineageAnchorPersonId,
          lineageNodeIds: Object.freeze([
            crestNodeId,
            ...(lineageTimeGapNodeId ? [lineageTimeGapNodeId] : []),
            ...(explicitTimeJumpNodeId ? [explicitTimeJumpNodeId] : [])
          ])
        }
      : {}),
    ...(explicitTimeJumpNodeId
      ? { optionalOriginNodeIds: Object.freeze([`${explicitTimeJumpNodeId}--layout-stage`]) }
      : {})
  });
}

function createPartnerOverChildrenRoutes(
  family,
  invalidRequests,
  automaticLaneRequests = []
) {
  const parentages = family?.parentages || [];
  const routes = [];
  const automaticRequestByPartnershipId = new Map(
    automaticLaneRequests.map(request => [request.partnershipId, request])
  );

  (family?.partnerships || []).forEach(partnership => {
    const automaticRequest = automaticRequestByPartnershipId.get(partnership.id);
    const configuredPersonId = configuredPartnerId(partnership);
    const partnerPersonId = configuredPersonId || automaticRequest?.partnerPersonId || '';
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
    const continuingChildIds = childIds.filter(childId => parentages.some(parentage => (
      parentage.parentIds?.includes(childId)
    )));
    const inferred = !configuredPersonId && Boolean(automaticRequest);
    const arrangeLeafChildrenEvenly = shouldArrangeLeafChildrenEvenly(partnership)
      || (inferred && childIds.length > 1 && continuingChildIds.length === 0);
    const reserveLeafChildLane = shouldReserveLeafChildLane(partnership)
      || (inferred && continuingChildIds.length === 0);
    const reserveDescendantBranchLane = shouldReserveDescendantBranchLane(partnership)
      || (inferred && continuingChildIds.length > 0)
      || undefined;
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
      descendantPartnerPersonIds: descendantBranch.descendantPartnerPersonIds,
      source: inferred ? automaticRequest.source : 'family-extension'
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
      partnershipIds: Object.freeze(marriages.map(partnership => partnership.id)),
      ...(person?.extensions?.[KEEP_PARTNER_GROUP_TOGETHER_EXTENSION] === true
        ? { keepTogether: true }
        : {})
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
      partnershipIds: Object.freeze(partnerPartnerships.map(partnership => partnership.id)),
      ...(person?.extensions?.[KEEP_PARTNER_GROUP_TOGETHER_EXTENSION] === true
        ? { keepTogether: true }
        : {})
    }));
  });

  return routes;
}

function configuredPartnerGroupPersonOrder(person) {
  const value = person?.extensions?.[PARTNER_GROUP_PERSON_ORDER_EXTENSION];
  if (value === undefined) return null;
  if (!Array.isArray(value)) return [];

  return value
    .filter(personId => typeof personId === 'string')
    .map(personId => personId.trim())
    .filter(Boolean);
}

function createOrderedPartnerGroupRoutes(family, invalidRequests) {
  const partnerships = family?.partnerships || [];
  const personIds = new Set((family?.persons || []).map(person => person.id));
  const routes = [];

  (family?.persons || []).forEach(person => {
    const orderedPersonIds = configuredPartnerGroupPersonOrder(person);
    if (orderedPersonIds === null) return;

    const uniquePersonIds = new Set(orderedPersonIds);
    const adjacentPartnerships = orderedPersonIds.slice(0, -1).map((personId, index) => (
      partnershipBetween(partnerships, personId, orderedPersonIds[index + 1])
    ));
    const invalidPersonIds = orderedPersonIds.filter(personId => !personIds.has(personId));
    const hasInvalidOrder = (
      orderedPersonIds.length < 3
      || uniquePersonIds.size !== orderedPersonIds.length
      || !uniquePersonIds.has(person.id)
      || invalidPersonIds.length > 0
      || adjacentPartnerships.some(partnership => !partnership)
    );

    if (hasInvalidOrder) {
      invalidRequests.push(Object.freeze({
        kind: 'ordered-partner-group',
        anchorPersonId: person.id,
        orderedPersonIds: Object.freeze([...orderedPersonIds]),
        invalidPersonIds: Object.freeze([...invalidPersonIds])
      }));
      return;
    }

    routes.push(Object.freeze({
      anchorPersonId: person.id,
      orderedPersonIds: Object.freeze([...orderedPersonIds]),
      partnershipIds: Object.freeze(adjacentPartnerships.map(partnership => partnership.id))
    }));
  });

  return routes;
}

export function createFamilyChartPartnerAlignmentPlan(family) {
  const invalidRequests = [];
  const automaticMultiPartnerPlan = createAutomaticFamilyChartMultiPartnerPlan(family);
  const partnerOverChildrenRoutes = createPartnerOverChildrenRoutes(
    family,
    invalidRequests,
    automaticMultiPartnerPlan.partnerLaneRequests
  );
  const centerBetweenSpousesRoutes = createCenterBetweenSpousesRoutes(family, invalidRequests);
  const centerBetweenPartnersRoutes = createCenterBetweenPartnersRoutes(family, invalidRequests);
  const orderedPartnerGroupRoutes = createOrderedPartnerGroupRoutes(family, invalidRequests);
  const explicitlyCenteredPersonIds = new Set([
    ...centerBetweenSpousesRoutes.map(route => route.centeredPersonId),
    ...centerBetweenPartnersRoutes.map(route => route.centeredPersonId)
  ]);
  automaticMultiPartnerPlan.hubs.forEach(hub => {
    if (explicitlyCenteredPersonIds.has(hub.centeredPersonId)) return;
    centerBetweenPartnersRoutes.push(Object.freeze({ ...hub }));
  });
  const lineageOriginRoute = createLineageOriginRoute(family, invalidRequests);

  return Object.freeze({
    partnerOverChildrenRoutes: Object.freeze(partnerOverChildrenRoutes),
    centerBetweenSpousesRoutes: Object.freeze(centerBetweenSpousesRoutes),
    centerBetweenPartnersRoutes: Object.freeze(centerBetweenPartnersRoutes),
    orderedPartnerGroupRoutes: Object.freeze(orderedPartnerGroupRoutes),
    automaticMultiPartnerPlan,
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

function displayedPartnerGroupNode(nodes, personId) {
  return displayedNodeById(nodes, personId, { partnerCard: true })
    || displayedNodeById(nodes, personId);
}

function nodeLiesBetweenRelationshipPartners(
  node,
  sharedNode,
  partnerNode,
  axis,
  excludedNodes = new Set()
) {
  if (!node || excludedNodes.has(node) || node === sharedNode || node === partnerNode) return false;
  const mainAxis = axis === 'x' ? 'y' : 'x';
  const coordinate = Number(node?.[axis]);
  const sharedCoordinate = Number(sharedNode?.[axis]);
  const partnerCoordinate = Number(partnerNode?.[axis]);
  const mainCoordinate = Number(node?.[mainAxis]);
  const sharedMainCoordinate = Number(sharedNode?.[mainAxis]);
  const partnerMainCoordinate = Number(partnerNode?.[mainAxis]);
  if ([
    coordinate,
    sharedCoordinate,
    partnerCoordinate,
    mainCoordinate,
    sharedMainCoordinate,
    partnerMainCoordinate
  ].some(value => !Number.isFinite(value))) return false;

  const minimum = Math.min(sharedCoordinate, partnerCoordinate);
  const maximum = Math.max(sharedCoordinate, partnerCoordinate);
  if (coordinate <= minimum || coordinate >= maximum) return false;

  // Nur Karten im selben sichtbaren Beziehungsband blockieren die direkte
  // Partnernähe. Tiefere Generationen dürfen unter dem Paar liegen.
  const bandPadding = cardStepForAxis(mainAxis) * 0.55;
  const bandMinimum = Math.min(sharedMainCoordinate, partnerMainCoordinate) - bandPadding;
  const bandMaximum = Math.max(sharedMainCoordinate, partnerMainCoordinate) + bandPadding;
  return mainCoordinate >= bandMinimum && mainCoordinate <= bandMaximum;
}

function relationshipHasInterveningCards(
  nodes,
  sharedNode,
  partnerNode,
  axis,
  excludedNodes = new Set()
) {
  return nodes.some(node => nodeLiesBetweenRelationshipPartners(
    node,
    sharedNode,
    partnerNode,
    axis,
    excludedNodes
  ));
}

function collisionCountAfterOpeningLane(
  movingNodes,
  movingDelta,
  stationaryNodes,
  shiftedStationaryNodes,
  stationaryDelta,
  axis
) {
  const shiftedSet = new Set(shiftedStationaryNodes);
  let collisions = 0;
  movingNodes.forEach(movingNode => {
    const movingRectangle = cardRectangle(movingNode, axis, movingDelta);
    stationaryNodes.forEach(stationaryNode => {
      const stationaryRectangle = cardRectangle(
        stationaryNode,
        axis,
        shiftedSet.has(stationaryNode) ? stationaryDelta : 0
      );
      if (rectanglesOverlap(movingRectangle, stationaryRectangle)) collisions += 1;
    });
  });
  return collisions;
}

/**
 * Inserts one complete card lane beside a relationship core. Every unrelated
 * card on that side moves by the same amount, so existing local spacing stays
 * intact. The insertion is only committed after a collision-free simulation.
 */
function openAdjacentRelationshipLane({
  nodes,
  movingNodes,
  sharedNode,
  axis,
  candidates
}) {
  const movingNodeSet = new Set(movingNodes);
  const stationaryNodes = nodes.filter(node => !movingNodeSet.has(node) && node !== sharedNode);
  const sharedCoordinate = Number(sharedNode?.[axis]);
  const step = cardStepForAxis(axis);
  if (!Number.isFinite(sharedCoordinate)) return null;

  const nearbyCandidates = candidates
    .filter(candidate => candidate.slot === 1)
    .sort((first, second) => first.collisionCount - second.collisionCount);
  for (const candidate of nearbyCandidates) {
    const direction = candidate.coordinate < sharedCoordinate ? -1 : 1;
    const shiftedStationaryNodes = stationaryNodes.filter(node => {
      const coordinate = Number(node?.[axis]);
      return Number.isFinite(coordinate)
        && ((coordinate - sharedCoordinate) * direction) > (step * 0.45);
    });
    const stationaryDelta = direction * step;
    const collisionCount = collisionCountAfterOpeningLane(
      movingNodes,
      candidate.delta,
      stationaryNodes,
      shiftedStationaryNodes,
      stationaryDelta,
      axis
    );
    if (collisionCount > 0) continue;

    shiftedStationaryNodes.forEach(node => (
      shiftNodeAlongCrossAxis(node, axis, stationaryDelta)
    ));
    return Object.freeze({
      ...candidate,
      collisionCount: 0,
      strategy: 'open-adjacent-partner-lane',
      openedLaneDelta: stationaryDelta,
      openedLaneNodeIds: Object.freeze(shiftedStationaryNodes
        .map(node => String(node?.data?.id || node?.id || ''))
        .filter(Boolean))
    });
  }
  return null;
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
    const continuingPartnerNode = displayedPartnerGroupNode(
      nodes,
      continuingRoute.partnerPersonId
    );
    const leafPartnerNode = displayedPartnerGroupNode(
      nodes,
      leafRoute.partnerPersonId
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
      || centeredRoute.partnerPersonIds.length < 2
    ) return;

    const centeredNode = displayedNodeById(nodes, centeredRoute.centeredPersonId);
    const partnerPlacements = centeredRoute.partnerPersonIds.map(partnerPersonId => {
      const partnerNode = displayedPartnerGroupNode(nodes, partnerPersonId);
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
      ...partnerPlacements.map(placement => placement.partnerNode),
      centeredNode
    ];
    const hasCurrentCollision = visibleCards.some((node, index) => (
      visibleCards.slice(index + 1).some(otherNode => (
        rectanglesOverlap(cardRectangle(node), cardRectangle(otherNode))
      ))
    ));

    // Eine Kernperson kann außerhalb zweier bereits kollisionsfreier
    // Partnerkarten liegen. Das bloße Mitteln weiter unten würde sie dann in
    // beide Karten hineinschieben. Deshalb wird auch die *künftige*
    // Mittelpunktposition geprüft und bei Bedarf als echte Mehrpartnerspur
    // gepackt. Bei einer ungeraden Partnerzahl darf der rechnerische Mittelpunkt
    // niemals auf der mittleren Partnerkarte landen: Die Kernperson erhält stets
    // einen eigenen Slot zwischen den beiden Partnerhälften.
    const centeredCoordinateNow = Number(centeredNode?.[axis]);
    const partnerCoordinates = partnerPlacements.map(placement => Number(placement.partnerNode?.[axis]));
    if (
      !Number.isFinite(centeredCoordinateNow)
      || partnerCoordinates.some(coordinate => !Number.isFinite(coordinate))
    ) return;

    const prospectiveCenteredCoordinate = centeredCoordinate(
      partnerPlacements.map(placement => placement.partnerNode),
      axis
    );
    if (prospectiveCenteredCoordinate === null) return;
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
    const movingNodeSet = new Set([
      centeredNode,
      ...partnerPlacements.flatMap(placement => placement.nodes)
    ]);
    const stationaryNodes = nodes.filter(node => !movingNodeSet.has(node));

    const centeredSlotIndex = Math.ceil(partnerPlacements.length / 2);
    const partnerSlotOffsets = partnerPlacements.map((placement, index) => {
      const slotIndex = index < centeredSlotIndex ? index : index + 1;
      return slotIndex - centeredSlotIndex;
    });
    const enforcesLocalProximity = centeredRoute.keepTogether === true
      || String(centeredRoute.source || '').startsWith('automatic-');
    const hasProximityViolation = enforcesLocalProximity && partnerPlacements.some((placement, index) => {
      const desiredCoordinate = centeredCoordinateNow + (partnerSlotOffsets[index] * step);
      return (
        Math.abs(partnerCoordinates[index] - desiredCoordinate) > (step * 0.35)
        || relationshipHasInterveningCards(
          nodes,
          centeredNode,
          placement.partnerNode,
          axis,
          movingNodeSet
        )
      );
    });
    if (!hasCurrentCollision && !hasProspectiveCollision && !hasProximityViolation) return;

    const baseCoordinates = [...new Set([
      centeredCoordinateNow,
      prospectiveCenteredCoordinate,
      ...partnerCoordinates.map((coordinate, index) => (
        coordinate - (partnerSlotOffsets[index] * step)
      ))
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
        ...partnerPlacements.map((placement, index) => ({
          nodes: placement.nodes,
          delta: (
            targetCoordinate + (partnerSlotOffsets[index] * step)
          ) - partnerCoordinates[index]
        })),
        {
          nodes: [centeredNode],
          delta: targetCoordinate - centeredCoordinateNow
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

function resolveOrderedPartnerGroupPlacement(nodes, routes, partnerRoutes, axis) {
  const resolutions = [];
  const step = cardStepForAxis(axis);

  (routes || []).forEach(route => {
    const orderedNodes = route.orderedPersonIds.map(personId => displayedNodeById(nodes, personId));
    const anchorIndex = route.orderedPersonIds.indexOf(route.anchorPersonId);
    const anchorNode = orderedNodes[anchorIndex];
    const anchorCoordinate = Number(anchorNode?.[axis]);
    const currentCoordinates = orderedNodes.map(node => Number(node?.[axis]));
    if (
      anchorIndex < 0
      || orderedNodes.some(node => !node)
      || currentCoordinates.some(coordinate => !Number.isFinite(coordinate))
      || !Number.isFinite(anchorCoordinate)
    ) return;

    const movingNodesByPerson = route.orderedPersonIds.map((personId, index) => {
      const partnerRoute = (partnerRoutes || []).find(candidate => (
        candidate.partnerPersonId === personId
      ));
      return partnerRoute
        ? movingNodesForRoute(nodes, partnerRoute, orderedNodes[index])
        : [orderedNodes[index]];
    });
    const movingNodeSet = new Set(movingNodesByPerson.flat());
    const stationaryNodes = nodes.filter(node => !movingNodeSet.has(node));
    const currentCenter = centeredCoordinate(orderedNodes, axis);
    const baseCoordinates = [...new Set([
      anchorCoordinate,
      ...(currentCenter === null ? [] : [currentCenter])
    ])];
    const maximumSlots = collisionSearchSlots(
      stationaryNodes,
      [...movingNodeSet],
      anchorCoordinate,
      axis
    );
    const candidateAnchorCoordinates = [...new Set(baseCoordinates.flatMap(baseCoordinate => [
      baseCoordinate,
      ...Array.from({ length: maximumSlots }, (_, index) => baseCoordinate - (step * (index + 1))),
      ...Array.from({ length: maximumSlots }, (_, index) => baseCoordinate + (step * (index + 1)))
    ]))];
    const candidates = candidateAnchorCoordinates.map(targetAnchorCoordinate => {
      const placements = orderedNodes.map((node, index) => ({
        nodes: movingNodesByPerson[index],
        targetCoordinate: targetAnchorCoordinate + ((index - anchorIndex) * step),
        delta: (
          targetAnchorCoordinate + ((index - anchorIndex) * step)
        ) - currentCoordinates[index]
      }));
      return {
        targetAnchorCoordinate,
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
    resolutions.push(Object.freeze({
      ...route,
      axis,
      targetAnchorCoordinate: selected.targetAnchorCoordinate,
      targetCoordinates: Object.freeze(selected.placements.map((placement, index) => Object.freeze({
        personId: route.orderedPersonIds[index],
        coordinate: placement.targetCoordinate
      }))),
      collisionCount: selected.collisionCount,
      strategy: 'place-ordered-partner-group'
    }));
  });

  return resolutions;
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
    const step = cardStepForAxis(axis);
    const enforcesAutomaticProximity = group.some(route => (
      String(route.source || '').startsWith('automatic-')
    ));
    const hasProximityViolation = enforcesAutomaticProximity && branches.some(branch => (
      Math.abs(Number(branch.partnerNode?.[axis]) - sharedCoordinate)
        > step * (branches.length + 0.25)
      || relationshipHasInterveningCards(
        nodes,
        sharedNode,
        branch.partnerNode,
        axis,
        new Set([sharedNode, ...allBranchNodes])
      )
    ));
    if (!hasCollision && !hasProximityViolation) return;

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
    const hasCollision = stationaryNodes.some(node => (
      rectanglesOverlap(partnerRectangle, cardRectangle(node))
    ));

    const sharedCoordinate = Number(sharedNode?.[axis]);
    const partnerCoordinate = Number(partnerNode?.[axis]);
    if (!Number.isFinite(sharedCoordinate) || !Number.isFinite(partnerCoordinate)) return;
    const maximumPartnerDistance = cardStepForAxis(axis) * 1.25;
    const enforcesAutomaticProximity = String(route.source || '').startsWith('automatic-');
    const hasProximityViolation = enforcesAutomaticProximity && (
      Math.abs(partnerCoordinate - sharedCoordinate) > maximumPartnerDistance
      || relationshipHasInterveningCards(
        nodes,
        sharedNode,
        partnerNode,
        axis,
        new Set([sharedNode, ...movingNodes])
      )
    );
    if (!hasCollision && !hasProximityViolation) return;

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
    const evaluatedCandidates = candidates.map(candidate => {
      const delta = candidate.coordinate - partnerCoordinate;
      const collisionCount = shiftedCollisionCount(movingNodes, stationaryNodes, axis, delta);
      return { ...candidate, delta, collisionCount };
    });
    const nearbyCandidates = evaluatedCandidates.filter(candidate => candidate.slot <= 2);
    const selectCandidate = candidateSet => [...candidateSet].sort((first, second) => (
      first.collisionCount - second.collisionCount
      || first.slot - second.slot
      || Math.abs(first.delta) - Math.abs(second.delta)
    ))[0] || null;
    let bestCandidate = selectCandidate(
      nearbyCandidates.filter(candidate => candidate.collisionCount === 0)
    );
    if (!bestCandidate && enforcesAutomaticProximity) {
      bestCandidate = openAdjacentRelationshipLane({
        nodes,
        movingNodes,
        sharedNode,
        axis,
        candidates: evaluatedCandidates
      });
    }
    if (!bestCandidate) {
      bestCandidate = selectCandidate(
        evaluatedCandidates.filter(candidate => candidate.collisionCount === 0)
      );
    }
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
      collisionCount: bestCandidate.collisionCount,
      ...(bestCandidate.strategy ? { strategy: bestCandidate.strategy } : {}),
      ...(bestCandidate.openedLaneDelta
        ? {
            openedLaneDelta: bestCandidate.openedLaneDelta,
            openedLaneNodeIds: bestCandidate.openedLaneNodeIds
          }
        : {})
    }));
  });
  return resolutions;
}

export function applyFamilyChartLineageOriginAlignment({
  tree,
  route,
  orientation = 'vertical'
}) {
  if (!route) return null;
  const nodes = tree?.data || [];
  const axis = orientation === 'horizontal' ? 'y' : 'x';
  const targetPersonIds = Array.isArray(route.targetPersonIds)
    ? route.targetPersonIds
    : [route.targetPersonId].filter(Boolean);
  const targetNodes = targetPersonIds
    .map(personId => displayedNodeById(nodes, personId))
    .filter(Boolean);
  const anchorNode = displayedNodeById(nodes, route.anchorNodeId);
  const originNodes = route.originNodeIds.flatMap(nodeId => (
    nodes.filter(node => node?.data?.id === nodeId)
  ));
  const optionalOriginNodes = (route.optionalOriginNodeIds || []).flatMap(nodeId => (
    nodes.filter(node => node?.data?.id === nodeId)
  ));
  const targetCoordinate = centeredCoordinate(targetNodes, axis);
  let anchorCoordinate = Number(anchorNode?.[axis]);
  let lineageAnchorDelta = 0;
  if (route.lineageAnchorPersonId) {
    const lineageAnchorPersonNode = displayedNodeById(nodes, route.lineageAnchorPersonId);
    const lineageNodes = (route.lineageNodeIds || [])
      .map(nodeId => displayedNodeById(nodes, nodeId))
      .filter(Boolean);
    const lineageAnchorPersonCoordinate = Number(lineageAnchorPersonNode?.[axis]);
    if (
      lineageAnchorPersonNode
      && lineageNodes.length === (route.lineageNodeIds || []).length
      && Number.isFinite(lineageAnchorPersonCoordinate)
      && Number.isFinite(anchorCoordinate)
    ) {
      lineageAnchorDelta = lineageAnchorPersonCoordinate - anchorCoordinate;
      lineageNodes.forEach(node => shiftNodeAlongCrossAxis(node, axis, lineageAnchorDelta));
      anchorCoordinate = Number(anchorNode?.[axis]);
    }
  }
  if (
    targetNodes.length !== targetPersonIds.length
    || !anchorNode
    || originNodes.length < route.originNodeIds.length
    || targetCoordinate === null
    || !Number.isFinite(anchorCoordinate)
  ) return null;

  const delta = targetCoordinate - anchorCoordinate;
  [...originNodes, ...optionalOriginNodes]
    .forEach(node => shiftNodeAlongCrossAxis(node, axis, delta));
  return Object.freeze({
    ...route,
    axis,
    targetCoordinate,
    delta,
    lineageAnchorDelta
  });
}

export function applyFamilyChartPartnerAlignmentPlan({
  tree,
  plan,
  orientation = 'vertical',
  alignLineageOrigin = true
}) {
  const nodes = tree?.data || [];
  const axis = orientation === 'horizontal' ? 'y' : 'x';
  const partnerOverChildren = [];
  const centeredPeople = [];
  const originalPartnerCoordinates = new Map();
  let collisionResolutions = [];
  let descendantAnchorResolutions = [];
  let orderedPartnerGroups = [];
  let alignedLineageOrigin = null;

  // Die fachlich engere Option "zwischen Ehefrauen" braucht dieselbe
  // Kollisionsbehandlung wie eine gemischte Mehrpartnergruppe. Das reine
  // Mitteln der beiden Ehefrauenkoordinaten konnte die Kernperson sonst genau
  // in eine Partnerkarte schieben. Für die Packlogik werden beide Varianten
  // lokal vereinheitlicht; am gespeicherten Familiendatensatz ändert sich
  // dadurch nichts.
  const centeredPartnerRoutes = new Map();
  (plan?.centerBetweenSpousesRoutes || []).forEach(route => {
    centeredPartnerRoutes.set(route.centeredPersonId, Object.freeze({
      centeredPersonId: route.centeredPersonId,
      partnerPersonIds: Object.freeze([...route.spousePersonIds]),
      partnershipIds: Object.freeze([...route.partnershipIds]),
      ...(route.keepTogether === true ? { keepTogether: true } : {})
    }));
  });
  (plan?.centerBetweenPartnersRoutes || []).forEach(route => {
    centeredPartnerRoutes.set(route.centeredPersonId, route);
  });
  const collisionAwareCenteredRoutes = [...centeredPartnerRoutes.values()];

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
    collisionAwareCenteredRoutes,
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
    collisionAwareCenteredRoutes,
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
      .map(partnerPersonId => displayedPartnerGroupNode(nodes, partnerPersonId))
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

  // Komplexe Beziehungsgruppen können mehrere Ehen und Affären in einer
  // gemeinsamen Generation verschachteln. Ihre explizite Reihenfolge ist die
  // letzte lokale Partnerregel; die anschließende Nachkommenausrichtung setzt
  // legitime und uneheliche Kinder danach unter die jeweils richtige Kante.
  orderedPartnerGroups = resolveOrderedPartnerGroupPlacement(
    nodes,
    plan?.orderedPartnerGroupRoutes || [],
    plan?.partnerOverChildrenRoutes || [],
    axis
  );

  if (alignLineageOrigin) {
    alignedLineageOrigin = applyFamilyChartLineageOriginAlignment({
      tree,
      route: plan?.lineageOriginRoute,
      orientation
    });
  }

  return Object.freeze({
    partnerOverChildren: Object.freeze(partnerOverChildren),
    centeredPeople: Object.freeze(centeredPeople),
    collisionResolutions: Object.freeze(collisionResolutions),
    descendantAnchorResolutions: Object.freeze(descendantAnchorResolutions),
    orderedPartnerGroups: Object.freeze(orderedPartnerGroups),
    alignedLineageOrigin
  });
}
