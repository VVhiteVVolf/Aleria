import {
  cardStepForAxis,
  shiftedCollisionCount,
  shiftNodeAlongCrossAxis
} from './family-chart-collision-geometry.js';

function nodeId(node) {
  return String(node?.data?.id || node?.id || '');
}

function originalPersonId(node) {
  return String(node?.data?.data?.aleria?.personId || nodeId(node));
}

function relationshipParentIds(houseNode, fallbackIds) {
  const configured = houseNode?.data?.data?.aleria?.relationshipParentIds;
  return Array.isArray(configured) && configured.length >= 2
    ? configured.filter(Boolean).slice(0, 2)
    : [...(fallbackIds || [])].filter(Boolean).slice(0, 2);
}

function displayedNodeById(nodes, id) {
  return nodes.find(node => nodeId(node) === id && !node.spouse)
    || nodes.find(node => nodeId(node) === id)
    || null;
}

function treeCenter(nodes, axis) {
  const coordinates = nodes.map(node => Number(node?.[axis])).filter(Number.isFinite);
  if (!coordinates.length) return 0;
  return (Math.min(...coordinates) + Math.max(...coordinates)) / 2;
}

function hasCardBetween(nodes, firstNode, secondNode, crossAxis, mainAxis) {
  const firstCoordinate = Number(firstNode?.[crossAxis]);
  const secondCoordinate = Number(secondNode?.[crossAxis]);
  const generation = Number(firstNode?.[mainAxis]);
  if (![firstCoordinate, secondCoordinate, generation].every(Number.isFinite)) return false;
  const minimum = Math.min(firstCoordinate, secondCoordinate);
  const maximum = Math.max(firstCoordinate, secondCoordinate);
  const excluded = new Set([firstNode, secondNode]);

  return nodes.some(node => (
    !excluded.has(node)
    && Math.abs(Number(node?.[mainAxis]) - generation) < 1
    && Number(node?.[crossAxis]) > minimum
    && Number(node?.[crossAxis]) < maximum
  ));
}

function chooseAnchorAndMovable(firstNode, secondNode, family) {
  const personById = new Map((family?.persons || []).map(person => [person.id, person]));
  const lineageHouseId = family?.lineage?.houseId || '';
  const firstIsCore = personById.get(originalPersonId(firstNode))?.houseId === lineageHouseId;
  const secondIsCore = personById.get(originalPersonId(secondNode))?.houseId === lineageHouseId;
  if (firstIsCore !== secondIsCore) {
    return firstIsCore
      ? { anchorNode: firstNode, movableNode: secondNode }
      : { anchorNode: secondNode, movableNode: firstNode };
  }
  return { anchorNode: firstNode, movableNode: secondNode };
}

function openGenerationLane(nodes, anchorNode, movableNode, crossAxis, mainAxis, step) {
  const generation = Number(anchorNode?.[mainAxis]);
  const generationCoordinates = nodes
    .filter(node => (
      node !== anchorNode
      && node !== movableNode
      && Math.abs(Number(node?.[mainAxis]) - generation) < 1
    ))
    .map(node => Number(node?.[crossAxis]))
    .filter(Number.isFinite);
  if (!generationCoordinates.length) return null;

  const minimum = Math.min(...generationCoordinates);
  const maximum = Math.max(...generationCoordinates);
  const anchorCoordinate = Number(anchorNode?.[crossAxis]);
  const movableCoordinate = Number(movableNode?.[crossAxis]);
  const candidates = [
    {
      side: 'before',
      anchorTarget: minimum - step,
      movableTarget: minimum - (step * 2)
    },
    {
      side: 'after',
      anchorTarget: maximum + step,
      movableTarget: maximum + (step * 2)
    }
  ].map(candidate => ({
    ...candidate,
    anchorDelta: candidate.anchorTarget - anchorCoordinate,
    movableDelta: candidate.movableTarget - movableCoordinate,
    movement: Math.abs(candidate.anchorTarget - anchorCoordinate)
      + Math.abs(candidate.movableTarget - movableCoordinate)
  }));
  return candidates.sort((first, second) => first.movement - second.movement)[0] || null;
}

/**
 * Keeps a pair-bound house knot readable when the two people are not a native
 * Family Chart spouse pair (engagements, internal links, married-away ends).
 * If an unrelated sibling lies between them, the foreign/secondary card is
 * moved into the immediately adjacent free slot. The house knot itself is
 * centered by the following house-link pass.
 */
export function applyFamilyChartPairCompaction({
  tree,
  family,
  plan,
  orientation = 'vertical'
}) {
  const nodes = tree?.data || [];
  const crossAxis = orientation === 'horizontal' ? 'y' : 'x';
  const mainAxis = crossAxis === 'x' ? 'y' : 'x';
  const step = cardStepForAxis(crossAxis);
  const center = treeCenter(nodes, crossAxis);
  const resolutions = [];

  (plan?.partnershipRoutes || []).forEach(route => {
    const houseNode = displayedNodeById(nodes, route.houseNodeId);
    const parentIds = relationshipParentIds(houseNode, route.parentPersonIds);
    const parentNodes = parentIds.map(id => displayedNodeById(nodes, id)).filter(Boolean);
    if (!houseNode || parentNodes.length !== 2) return;

    const firstMain = Number(parentNodes[0]?.[mainAxis]);
    const secondMain = Number(parentNodes[1]?.[mainAxis]);
    if (!Number.isFinite(firstMain) || !Number.isFinite(secondMain) || Math.abs(firstMain - secondMain) >= 1) {
      return;
    }
    const distance = Math.abs(Number(parentNodes[0][crossAxis]) - Number(parentNodes[1][crossAxis]));
    if (distance <= step * 1.25 && !hasCardBetween(nodes, ...parentNodes, crossAxis, mainAxis)) return;

    const { anchorNode, movableNode } = chooseAnchorAndMovable(parentNodes[0], parentNodes[1], family);
    const anchorCoordinate = Number(anchorNode?.[crossAxis]);
    const movableCoordinate = Number(movableNode?.[crossAxis]);
    if (!Number.isFinite(anchorCoordinate) || !Number.isFinite(movableCoordinate)) return;
    const outsideDirection = anchorCoordinate < center ? -1 : 1;
    const directions = [outsideDirection, -outsideDirection];
    const stationaryNodes = nodes.filter(node => node !== movableNode && node !== houseNode);
    const candidate = directions
      .map((direction, preference) => {
        const targetCoordinate = anchorCoordinate + (direction * step);
        const delta = targetCoordinate - movableCoordinate;
        return {
          direction,
          preference,
          targetCoordinate,
          delta,
          collisionCount: shiftedCollisionCount(
            [movableNode],
            stationaryNodes,
            crossAxis,
            delta
          )
        };
      })
      .sort((first, second) => (
        first.collisionCount - second.collisionCount
        || first.preference - second.preference
        || Math.abs(first.delta) - Math.abs(second.delta)
      ))[0];
    if (candidate && candidate.collisionCount === 0) {
      if (candidate.delta !== 0) shiftNodeAlongCrossAxis(movableNode, crossAxis, candidate.delta);
      resolutions.push(Object.freeze({
        branchId: route.branchId,
        partnershipId: route.partnershipId,
        anchorNodeId: nodeId(anchorNode),
        movedNodeId: nodeId(movableNode),
        axis: crossAxis,
        targetCoordinate: candidate.targetCoordinate,
        delta: candidate.delta,
        side: candidate.direction < 0 ? 'before' : 'after',
        mode: 'move-secondary-to-adjacent-slot'
      }));
      return;
    }

    // Sind beide Nachbarslots belegt, wird nicht mit einer Verbindung durch
    // fremde Karten ausgewichen. Stattdessen erhält das ganze Paar am Rand
    // derselben Generation zwei neue, direkt benachbarte Plätze.
    const openLane = openGenerationLane(
      nodes,
      anchorNode,
      movableNode,
      crossAxis,
      mainAxis,
      step
    );
    if (!openLane) return;
    shiftNodeAlongCrossAxis(anchorNode, crossAxis, openLane.anchorDelta);
    shiftNodeAlongCrossAxis(movableNode, crossAxis, openLane.movableDelta);
    resolutions.push(Object.freeze({
      branchId: route.branchId,
      partnershipId: route.partnershipId,
      anchorNodeId: nodeId(anchorNode),
      movedNodeId: nodeId(movableNode),
      axis: crossAxis,
      targetCoordinate: openLane.movableTarget,
      delta: openLane.movableDelta,
      anchorDelta: openLane.anchorDelta,
      side: openLane.side,
      mode: 'move-pair-to-open-generation-lane'
    }));
  });

  return Object.freeze({ resolutions: Object.freeze(resolutions) });
}
