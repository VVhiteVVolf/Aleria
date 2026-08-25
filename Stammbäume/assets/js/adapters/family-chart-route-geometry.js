import { FAMILY_CHART_CARD_LAYOUT } from './family-chart-card-renderer.js';

const DEFAULT_ROUTE_CLEARANCE = 10;

function finitePoint(point) {
  return point
    && Number.isFinite(Number(point.x))
    && Number.isFinite(Number(point.y));
}

function cardRectangle(point, clearance = 0) {
  const halfWidth = (FAMILY_CHART_CARD_LAYOUT.width / 2) + clearance;
  const halfHeight = (FAMILY_CHART_CARD_LAYOUT.height / 2) + clearance;
  return {
    left: Number(point.x) - halfWidth,
    right: Number(point.x) + halfWidth,
    top: Number(point.y) - halfHeight,
    bottom: Number(point.y) + halfHeight
  };
}

function rangesOverlap(firstStart, firstEnd, secondStart, secondEnd) {
  const firstMinimum = Math.min(firstStart, firstEnd);
  const firstMaximum = Math.max(firstStart, firstEnd);
  const secondMinimum = Math.min(secondStart, secondEnd);
  const secondMaximum = Math.max(secondStart, secondEnd);
  return firstMaximum > secondMinimum && secondMaximum > firstMinimum;
}

function segmentIntersectsRectangle(first, second, rectangle) {
  if (!finitePoint(first) || !finitePoint(second)) return false;
  if (Math.abs(Number(first.x) - Number(second.x)) < 0.001) {
    return Number(first.x) > rectangle.left
      && Number(first.x) < rectangle.right
      && rangesOverlap(first.y, second.y, rectangle.top, rectangle.bottom);
  }
  if (Math.abs(Number(first.y) - Number(second.y)) < 0.001) {
    return Number(first.y) > rectangle.top
      && Number(first.y) < rectangle.bottom
      && rangesOverlap(first.x, second.x, rectangle.left, rectangle.right);
  }
  return false;
}

export function countOrthogonalRouteCardIntersections(
  routes,
  cardPositions,
  excludedCardIds = [],
  clearance = DEFAULT_ROUTE_CLEARANCE
) {
  const excludedIds = new Set(excludedCardIds || []);
  const obstacles = [...(cardPositions || new Map()).entries()]
    .filter(([cardId, point]) => !excludedIds.has(cardId) && finitePoint(point))
    .map(([cardId, point]) => ({ cardId, rectangle: cardRectangle(point, clearance) }));
  const hitIds = new Set();

  (routes || []).forEach(route => {
    for (let index = 1; index < (route || []).length; index += 1) {
      const first = route[index - 1];
      const second = route[index];
      obstacles.forEach(obstacle => {
        if (segmentIntersectsRectangle(first, second, obstacle.rectangle)) {
          hitIds.add(obstacle.cardId);
        }
      });
    }
  });

  return Object.freeze([...hitIds]);
}

function candidateRailCoordinates({
  parentGeneration,
  childGeneration,
  cardPositions,
  orientation,
  clearance
}) {
  const parentHalfSize = orientation === 'horizontal'
    ? FAMILY_CHART_CARD_LAYOUT.width / 2
    : FAMILY_CHART_CARD_LAYOUT.height / 2;
  const childHalfSize = parentHalfSize;
  const direction = childGeneration >= parentGeneration ? 1 : -1;
  const parentEdge = parentGeneration + (direction * (parentHalfSize + clearance));
  const childEdge = childGeneration - (direction * (childHalfSize + clearance));
  const minimum = Math.min(parentEdge, childEdge);
  const maximum = Math.max(parentEdge, childEdge);
  const midpoint = parentGeneration + ((childGeneration - parentGeneration) / 2);
  const candidates = new Set([midpoint, parentEdge, childEdge]);

  (cardPositions || new Map()).forEach(point => {
    if (!finitePoint(point)) return;
    const coordinate = orientation === 'horizontal' ? Number(point.x) : Number(point.y);
    const halfSize = orientation === 'horizontal'
      ? FAMILY_CHART_CARD_LAYOUT.width / 2
      : FAMILY_CHART_CARD_LAYOUT.height / 2;
    [coordinate - halfSize - clearance, coordinate + halfSize + clearance]
      .filter(value => value >= minimum && value <= maximum)
      .forEach(value => candidates.add(value));
  });

  return [...candidates]
    .filter(Number.isFinite)
    .filter(value => value >= minimum && value <= maximum)
    .sort((first, second) => Math.abs(first - midpoint) - Math.abs(second - midpoint));
}

/**
 * Chooses a generation rail only from the open gap between parent and child
 * rows. The chosen route never introduces an additional side detour: it keeps
 * the normal vertical-horizontal-vertical genealogy shape and merely avoids a
 * rail being drawn through an unrelated card.
 */
export function selectCollisionAwareRail({
  parentGeneration,
  childGeneration,
  cardPositions,
  relatedCardIds,
  orientation = 'vertical',
  buildRoutes,
  clearance = DEFAULT_ROUTE_CLEARANCE
}) {
  if (typeof buildRoutes !== 'function') return null;
  const midpoint = parentGeneration + ((childGeneration - parentGeneration) / 2);
  const candidates = candidateRailCoordinates({
    parentGeneration,
    childGeneration,
    cardPositions,
    orientation,
    clearance
  });
  const evaluated = candidates.map(railCoordinate => {
    const routes = buildRoutes(railCoordinate);
    const hitCardIds = countOrthogonalRouteCardIntersections(
      routes,
      cardPositions,
      relatedCardIds,
      clearance
    );
    return { railCoordinate, routes, hitCardIds };
  });

  const selected = evaluated.sort((first, second) => (
    first.hitCardIds.length - second.hitCardIds.length
    || Math.abs(first.railCoordinate - midpoint) - Math.abs(second.railCoordinate - midpoint)
  ))[0];
  return selected ? Object.freeze({
    railCoordinate: selected.railCoordinate,
    routes: Object.freeze(selected.routes.map(route => Object.freeze(route))),
    hitCardIds: Object.freeze(selected.hitCardIds)
  }) : null;
}

function orthogonalRouteLength(route) {
  return (route || []).slice(1).reduce((sum, point, index) => {
    const previous = route[index];
    return sum
      + Math.abs(Number(point.x) - Number(previous.x))
      + Math.abs(Number(point.y) - Number(previous.y));
  }, 0);
}

function partnershipLaneRoute(first, second, orientation, laneCoordinate) {
  return orientation === 'horizontal'
    ? [first, { x: laneCoordinate, y: first.y }, { x: laneCoordinate, y: second.y }, second]
    : [first, { x: first.x, y: laneCoordinate }, { x: second.x, y: laneCoordinate }, second];
}

/**
 * Keeps a partnership straight whenever the direct card-edge connection is
 * clear. With three or more partners in one row, however, the outer
 * relationship would necessarily run through the inner partner card. Only in
 * that case is a compact lane immediately above or below the cards selected.
 * This is intentionally a local U-route, never a remote generation-spanning
 * detour.
 */
export function selectCollisionAwarePartnershipRoute({
  first,
  second,
  directRoute = [],
  cardPositions,
  relatedCardIds,
  orientation = 'vertical',
  preferredSide = 'after',
  clearance = DEFAULT_ROUTE_CLEARANCE
}) {
  if (!finitePoint(first) || !finitePoint(second)) return Object.freeze([]);
  const halfSize = orientation === 'horizontal'
    ? FAMILY_CHART_CARD_LAYOUT.width / 2
    : FAMILY_CHART_CARD_LAYOUT.height / 2;
  const firstGeneration = orientation === 'horizontal' ? Number(first.x) : Number(first.y);
  const secondGeneration = orientation === 'horizontal' ? Number(second.x) : Number(second.y);
  const beforeLane = Math.min(firstGeneration, secondGeneration) - halfSize - clearance;
  const afterLane = Math.max(firstGeneration, secondGeneration) + halfSize + clearance;
  const laneCandidates = preferredSide === 'before'
    ? [['before', beforeLane], ['after', afterLane]]
    : [['after', afterLane], ['before', beforeLane]];
  const candidates = [
    ...(directRoute.length >= 2 ? [{ kind: 'direct', route: directRoute, preference: 0 }] : []),
    ...laneCandidates.map(([kind, coordinate], index) => ({
      kind,
      route: partnershipLaneRoute(first, second, orientation, coordinate),
      preference: index + 1
    }))
  ].map(candidate => ({
    ...candidate,
    hitCardIds: countOrthogonalRouteCardIntersections(
      [candidate.route],
      cardPositions,
      relatedCardIds,
      clearance
    ),
    length: orthogonalRouteLength(candidate.route)
  }));

  const selected = candidates.sort((firstCandidate, secondCandidate) => (
    firstCandidate.hitCardIds.length - secondCandidate.hitCardIds.length
    || firstCandidate.length - secondCandidate.length
    || firstCandidate.preference - secondCandidate.preference
  ))[0];
  return Object.freeze(selected?.route || []);
}
