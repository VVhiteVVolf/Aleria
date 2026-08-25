import { FAMILY_CHART_CARD_LAYOUT } from './family-chart-card-renderer.js';

export const FAMILY_CHART_CARD_GAP = 32;

export function shiftNodeAlongCrossAxis(node, axis, delta) {
  const coordinate = Number(node?.[axis]);
  if (Number.isFinite(coordinate)) node[axis] = coordinate + delta;
  const sourceCoordinate = Number(node?.sx);
  if (Number.isFinite(sourceCoordinate)) node.sx = sourceCoordinate + delta;
}

export function cardRectangle(node, deltaAxis = '', delta = 0) {
  const x = Number(node?.x) + (deltaAxis === 'x' ? delta : 0);
  const y = Number(node?.y) + (deltaAxis === 'y' ? delta : 0);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  const halfWidth = FAMILY_CHART_CARD_LAYOUT.width / 2;
  const halfHeight = FAMILY_CHART_CARD_LAYOUT.height / 2;
  return {
    left: x - halfWidth,
    right: x + halfWidth,
    top: y - halfHeight,
    bottom: y + halfHeight
  };
}

export function rectanglesOverlap(first, second, padding = 8) {
  if (!first || !second) return false;
  return !(
    first.right + padding <= second.left
    || second.right + padding <= first.left
    || first.bottom + padding <= second.top
    || second.bottom + padding <= first.top
  );
}

export function shiftedCollisionCount(movingNodes, stationaryNodes, axis, delta) {
  let collisions = 0;
  movingNodes.forEach(movingNode => {
    const movingRectangle = cardRectangle(movingNode, axis, delta);
    stationaryNodes.forEach(stationaryNode => {
      if (rectanglesOverlap(movingRectangle, cardRectangle(stationaryNode))) collisions += 1;
    });
  });
  return collisions;
}

export function cardStepForAxis(axis) {
  const cardSize = axis === 'x'
    ? FAMILY_CHART_CARD_LAYOUT.width
    : FAMILY_CHART_CARD_LAYOUT.height;
  return cardSize + FAMILY_CHART_CARD_GAP;
}

export function findCollisionFreeGroupShift(
  movingNodes,
  stationaryNodes,
  axis,
  {
    preferredDirection = 0,
    maximumSlots = stationaryNodes.length + 2,
    allowOpposite = true
  } = {}
) {
  const movable = [...new Set((movingNodes || []).filter(Boolean))];
  const stationary = [...new Set((stationaryNodes || []).filter(Boolean))];
  if (!movable.length || !stationary.length) return null;
  if (shiftedCollisionCount(movable, stationary, axis, 0) === 0) return 0;

  const movingCoordinates = movable
    .map(node => Number(node?.[axis]))
    .filter(Number.isFinite);
  const stationaryCoordinates = stationary
    .map(node => Number(node?.[axis]))
    .filter(Number.isFinite);
  if (!movingCoordinates.length || !stationaryCoordinates.length) return null;

  const movingCenter = (Math.min(...movingCoordinates) + Math.max(...movingCoordinates)) / 2;
  const stationaryCenter = (
    Math.min(...stationaryCoordinates) + Math.max(...stationaryCoordinates)
  ) / 2;
  const direction = preferredDirection === 1 || preferredDirection === -1
    ? preferredDirection
    : movingCenter >= stationaryCenter ? 1 : -1;
  const step = cardStepForAxis(axis);

  for (let slot = 1; slot <= maximumSlots; slot += 1) {
    const preferredDelta = direction * step * slot;
    if (shiftedCollisionCount(movable, stationary, axis, preferredDelta) === 0) {
      return preferredDelta;
    }
    if (allowOpposite) {
      const oppositeDelta = -preferredDelta;
      if (shiftedCollisionCount(movable, stationary, axis, oppositeDelta) === 0) {
        return oppositeDelta;
      }
    }
  }

  return null;
}
