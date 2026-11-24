import { createFamilyChartBranchGraph, collectFamilyChartBranchNodes } from './family-chart-branch-membership.js';
import { cardRectangle, cardStepForAxis, FAMILY_CHART_CARD_GAP, shiftNodeAlongCrossAxis } from './family-chart-collision-geometry.js';

const idOf = node => String(node?.data?.id || node?.id || '');

function primaryCards(nodes) {
  const byId = new Map();
  for (const node of nodes) {
    const id = idOf(node);
    if (!byId.has(id) || (byId.get(id).spouse && !node.spouse)) byId.set(id, node);
  }
  return byId;
}

function isClosedBranch(moving, graph, rootId) {
  const ids = new Set(moving.map(idOf));
  for (const link of graph.parentages) {
    if (ids.has(link.childId) && link.childId !== rootId
      && link.parentIds.some(id => !ids.has(id))) return false;
    if (!ids.has(link.childId) && link.parentIds.some(id => ids.has(id))) return false;
  }
  for (const node of moving) {
    if (idOf(node) !== rootId && (node?.data?.rels?.parents || []).some(id => !ids.has(id))) return false;
  }
  // Explicit generation-edge placements and cross-family appearance anchors
  // remain authoritative. Such blocks are not spare whitespace.
  return !graph.partnerships.some(pair => pair.extensions?.chartPlacePairAtGenerationEdge
    && pair.participantIds.some(id => ids.has(id)));
}

function originCenter(cardsById, root, origin, axis) {
  const jumpId = origin.extensions?.timeJumpId;
  const jump = jumpId && cardsById.get(`__time-jump-${jumpId}`);
  if (jump) return Number(jump[axis]);
  const nativeParents = (root?.data?.rels?.parents || []).map(id => cardsById.get(id)).filter(Boolean);
  const parents = nativeParents.length ? nativeParents : origin.parentIds.map(id => cardsById.get(id)).filter(Boolean);
  if (!parents.length) return NaN;
  return parents.reduce((sum, node) => sum + Number(node[axis]), 0) / parents.length;
}

function movementBounds(nodes, moving, graph, origin, root, axis, step) {
  const movingSet = new Set(moving), rootCoordinate = Number(root[axis]);
  const coordinates = nodes.map(node => Number(node[axis]));
  const branchCoordinates = moving.map(node => Number(node[axis]));
  let minimum = Math.min(...coordinates) - Math.min(...branchCoordinates);
  let maximum = Math.max(...coordinates) - Math.max(...branchCoordinates);
  const withinChart = { minimum, maximum };
  const siblingIds = new Set(graph.parentages.filter(link => link.childId !== origin.childId && (
    origin.partnershipId ? link.partnershipId === origin.partnershipId
      : link.parentIds.length === origin.parentIds.length && link.parentIds.every(id => origin.parentIds.includes(id))
  )).map(link => link.childId));
  for (const node of nodes.filter(node => siblingIds.has(idOf(node)) && !movingSet.has(node))) {
    const coordinate = Number(node[axis]);
    if (coordinate < rootCoordinate) minimum = Math.max(minimum, coordinate + step - rootCoordinate);
    if (coordinate > rootCoordinate) maximum = Math.min(maximum, coordinate - step - rootCoordinate);
  }
  return { withinChart, sameSiblingOrder: { minimum, maximum } };
}

function forbiddenShifts(moving, stationary, axis) {
  const intervals = [], horizontal = axis === 'x';
  const movingCards = moving.map(node => cardRectangle(node)).filter(Boolean);
  const obstacles = stationary.map(node => cardRectangle(node)).filter(Boolean);
  for (const a of movingCards) for (const b of obstacles) {
    const mainOverlaps = horizontal
      ? a.bottom + FAMILY_CHART_CARD_GAP > b.top && b.bottom + FAMILY_CHART_CARD_GAP > a.top
      : a.right + FAMILY_CHART_CARD_GAP > b.left && b.right + FAMILY_CHART_CARD_GAP > a.left;
    if (!mainOverlaps) continue;
    intervals.push(horizontal
      ? [b.left - FAMILY_CHART_CARD_GAP - a.right, b.right + FAMILY_CHART_CARD_GAP - a.left]
      : [b.top - FAMILY_CHART_CARD_GAP - a.bottom, b.bottom + FAMILY_CHART_CARD_GAP - a.top]);
  }
  // A large branch can produce thousands of overlapping constraints. Merge
  // their open intervals once instead of testing every candidate against every
  // individual card pair. Touching endpoints remain valid free positions.
  const merged = [];
  for (const interval of intervals.sort((a, b) => a[0] - b[0])) {
    const previous = merged.at(-1);
    if (previous && interval[0] < previous[1]) previous[1] = Math.max(previous[1], interval[1]);
    else merged.push([...interval]);
  }
  return merged;
}

function nearestFreeShift(ideal, intervals, { minimum, maximum }) {
  if (minimum > maximum) return 0;
  const desired = Math.max(minimum, Math.min(maximum, ideal));
  const candidates = [0, desired, minimum, maximum, ...intervals.flat()];
  return candidates.filter(delta => Number.isFinite(delta) && delta >= minimum && delta <= maximum
    && !intervals.some(([left, right]) => delta > left + 0.001 && delta < right - 0.001))
    .sort((a, b) => Math.abs(a - ideal) - Math.abs(b - ideal) || Math.abs(a) - Math.abs(b))[0] ?? 0;
}

/**
 * Repairs excess distance left by collision/alignment passes. Only a closed
 * descendant block moves, as one rigid unit. A free slot across a sibling
 * branch is eligible when it removes at least a full card's worth of detour.
 * Generations, local pair/child alignment, and the chart bounds are preserved.
 */
export function applyFamilyChartBranchCompaction({ tree, family, orientation = 'vertical' }) {
  const nodes = (tree?.data || []).filter(node => Number.isFinite(Number(node.x)) && Number.isFinite(Number(node.y)));
  const graph = createFamilyChartBranchGraph(family), axis = orientation === 'horizontal' ? 'y' : 'x';
  const mainAxis = axis === 'x' ? 'y' : 'x', step = cardStepForAxis(axis), resolutions = [];
  const cardsById = primaryCards(nodes);
  const originCount = new Map();
  for (const link of graph.parentages) originCount.set(link.childId, (originCount.get(link.childId) || 0) + 1);
  const origins = graph.parentages.filter(origin => originCount.get(origin.childId) === 1)
    .map(origin => ({ origin, root: cardsById.get(origin.childId) })).filter(entry => entry.root)
    .sort((a, b) => Number(b.root[mainAxis]) - Number(a.root[mainAxis]));
  for (let pass = 0; pass < 3; pass++) {
    const previousCount = resolutions.length;
    for (const { origin, root } of origins) {
      const target = originCenter(cardsById, root, origin, axis), ideal = target - Number(root[axis]);
      if (!Number.isFinite(ideal) || Math.abs(ideal) <= step * 2) continue;
      const moving = collectFamilyChartBranchNodes(nodes, graph, origin.childId, { closed: true });
      if (!moving.length || !isClosedBranch(moving, graph, origin.childId)) continue;
      const movingSet = new Set(moving), stationary = nodes.filter(node => !movingSet.has(node));
      const intervals = forbiddenShifts(moving, stationary, axis);
      const bounds = movementBounds(nodes, moving, graph, origin, root, axis, step);
      const orderedShift = nearestFreeShift(ideal, intervals, bounds.sameSiblingOrder);
      const flexibleShift = nearestFreeShift(ideal, intervals, bounds.withinChart);
      const reordered = !origin.extensions?.timeJumpId
        && Math.abs(ideal - orderedShift) - Math.abs(ideal - flexibleShift) >= step;
      const delta = reordered ? flexibleShift : orderedShift;
      if (Math.abs(ideal) - Math.abs(ideal - delta) < step / 2) continue;
      moving.forEach(node => shiftNodeAlongCrossAxis(node, axis, delta));
      resolutions.push(Object.freeze({ rootPersonId: origin.childId, axis, delta,
        reordered,
        distanceBefore: Math.abs(ideal), distanceAfter: Math.abs(ideal - delta),
        movedNodeIds: Object.freeze(moving.map(idOf)) }));
    }
    if (resolutions.length === previousCount) break;
  }
  return Object.freeze({ resolutions: Object.freeze(resolutions) });
}
