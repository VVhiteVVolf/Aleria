const AXIS_EPSILON = 0.01;

/**
 * Higher values remain visually uninterrupted at a pure line crossing.
 * Card collisions are deliberately absent here: a line may never be made to
 * look valid by tunnelling through a person card.
 */
export const FAMILY_CHART_LINE_PRIORITY = Object.freeze({
  'cadet-house': 900,
  'married-away': 900,
  'ward-away': 900,
  'migration-offshoot': 900,
  'line-extinct': 900,
  'time-jump': 850,
  biological: 750,
  adoptive: 740,
  magical: 730,
  claimed: 720,
  foster: 710,
  step: 700,
  marriage: 600,
  engagement: 520,
  affair: 420,
  forced: 410,
  unknown: 300,
  native: 300
});

function finitePoint(point) {
  return point
    && Number.isFinite(Number(point.x))
    && Number.isFinite(Number(point.y));
}

function normalizedPoints(points) {
  const normalized = [];
  (points || []).filter(finitePoint).forEach(point => {
    const next = { x: Number(point.x), y: Number(point.y) };
    const previous = normalized.at(-1);
    if (!previous || previous.x !== next.x || previous.y !== next.y) normalized.push(next);
  });
  return normalized;
}

function segmentOrientation(first, second) {
  if (Math.abs(first.x - second.x) <= AXIS_EPSILON) return 'vertical';
  if (Math.abs(first.y - second.y) <= AXIS_EPSILON) return 'horizontal';
  return 'diagonal';
}

function routeSegments(points) {
  const route = normalizedPoints(points);
  return route.slice(1).map((second, index) => {
    const first = route[index];
    return Object.freeze({
      first,
      second,
      orientation: segmentOrientation(first, second),
      index
    });
  }).filter(segment => segment.orientation !== 'diagonal');
}

function between(value, first, second) {
  return value >= Math.min(first, second) - AXIS_EPSILON
    && value <= Math.max(first, second) + AXIS_EPSILON;
}

function perpendicularIntersection(first, second) {
  if (first.orientation === second.orientation) return null;
  const vertical = first.orientation === 'vertical' ? first : second;
  const horizontal = vertical === first ? second : first;
  const point = { x: vertical.first.x, y: horizontal.first.y };
  return between(point.y, vertical.first.y, vertical.second.y)
    && between(point.x, horizontal.first.x, horizontal.second.x)
    ? point
    : null;
}

function sharedCardIds(first, second) {
  const firstIds = new Set(first.relatedCardIds || []);
  return (second.relatedCardIds || []).filter(cardId => firstIds.has(cardId));
}

function routePriority(route) {
  const configured = Number(route.priority);
  if (Number.isFinite(configured)) return configured;
  return FAMILY_CHART_LINE_PRIORITY[route.type]
    ?? FAMILY_CHART_LINE_PRIORITY.unknown;
}

function routeWinsCrossing(firstRoute, firstSegment, secondRoute, secondSegment) {
  const firstPriority = routePriority(firstRoute);
  const secondPriority = routePriority(secondRoute);
  if (firstPriority !== secondPriority) return firstPriority > secondPriority;
  if (firstSegment.orientation !== secondSegment.orientation) {
    return firstSegment.orientation === 'vertical';
  }
  return String(firstRoute.id).localeCompare(String(secondRoute.id), 'de') <= 0;
}

function sameRouteGroup(first, second) {
  return Boolean(first.groupId && second.groupId && first.groupId === second.groupId);
}

/**
 * Finds only perpendicular line-to-line crossings. Collinear overlaps need a
 * different lane and are intentionally reported separately instead of being
 * hidden by a tunnel marker.
 */
export function collectFamilyChartLineCrossings(routes) {
  const candidates = (routes || [])
    .filter(route => route?.id && normalizedPoints(route.points).length >= 2)
    .map(route => ({ ...route, segments: routeSegments(route.points) }));
  const crossings = [];

  for (let firstIndex = 0; firstIndex < candidates.length; firstIndex += 1) {
    for (let secondIndex = firstIndex + 1; secondIndex < candidates.length; secondIndex += 1) {
      const firstRoute = candidates[firstIndex];
      const secondRoute = candidates[secondIndex];
      if (sameRouteGroup(firstRoute, secondRoute)) continue;

      firstRoute.segments.forEach(firstSegment => {
        secondRoute.segments.forEach(secondSegment => {
          const point = perpendicularIntersection(firstSegment, secondSegment);
          if (!point) return;
          const sharedIds = sharedCardIds(firstRoute, secondRoute);
          // Routes touching the same person/house card belong to one semantic
          // relationship junction. Their intersection is intentional even if
          // one route meets the middle of the other (pair midpoint -> child).
          // Crossing markers are reserved for independent routes only.
          if (sharedIds.length > 0) return;

          const firstWins = routeWinsCrossing(
            firstRoute,
            firstSegment,
            secondRoute,
            secondSegment
          );
          const overRoute = firstWins ? firstRoute : secondRoute;
          const underRoute = firstWins ? secondRoute : firstRoute;
          const overSegment = firstWins ? firstSegment : secondSegment;
          const underSegment = firstWins ? secondSegment : firstSegment;
          crossings.push(Object.freeze({
            point: Object.freeze(point),
            overRouteId: overRoute.id,
            underRouteId: underRoute.id,
            overType: overRoute.type || 'unknown',
            underType: underRoute.type || 'unknown',
            overOrientation: overSegment.orientation,
            underOrientation: underSegment.orientation,
            sharedCardIds: Object.freeze(sharedIds)
          }));
        });
      });
    }
  }

  const unique = new Map();
  crossings.forEach(crossing => {
    const key = [
      crossing.overRouteId,
      crossing.underRouteId,
      Math.round(crossing.point.x * 10),
      Math.round(crossing.point.y * 10)
    ].join('|');
    if (!unique.has(key)) unique.set(key, crossing);
  });
  return Object.freeze([...unique.values()]);
}

function bridgePathData(crossing) {
  const { x, y } = crossing.point;
  return `M ${x} ${y} L ${x} ${y}`;
}

function crossingOverlay(path, className, crossing) {
  const clone = path.cloneNode(false);
  clone.removeAttribute('id');
  clone.removeAttribute('mask');
  clone.removeAttribute('data-related-card-ids');
  clone.removeAttribute('data-route-strategy');
  clone.setAttribute('class', `link ${className}`);
  clone.setAttribute('d', bridgePathData(crossing));
  clone.setAttribute('aria-hidden', 'true');
  clone.dataset.crossingSourceRouteId = crossing.overRouteId;
  clone.dataset.crossingUnderRouteId = crossing.underRouteId;
  clone.dataset.crossingX = String(crossing.point.x);
  clone.dataset.crossingY = String(crossing.point.y);
  clone.style.pointerEvents = 'none';
  return clone;
}

export function clearFamilyChartLineCrossingBridges(container) {
  container?.querySelectorAll?.('.aleria-line-crossing-overlay').forEach(element => element.remove());
  container?.querySelectorAll?.('.links_view path.link:not(.aleria-line-crossing-overlay)')
    .forEach(path => {
      delete path.dataset.lineCrossingCount;
      delete path.dataset.lineCrossingRole;
    });
  if (container?.dataset) container.dataset.layoutLineCrossingCount = '0';
}

/**
 * Paints a small parchment-ringed point only where independent routes really
 * cross. It marks which route owns the crossing without introducing another
 * short line fragment or changing either route's geometry.
 */
export function applyFamilyChartLineCrossingBridges(container, routeRecords) {
  clearFamilyChartLineCrossingBridges(container);
  const crossings = collectFamilyChartLineCrossings(routeRecords);
  if (!crossings.length) return Object.freeze({ crossings, bridgedRouteIds: Object.freeze([]) });

  const linksView = container?.querySelector?.('.links_view');
  if (!linksView) return Object.freeze({ crossings, bridgedRouteIds: Object.freeze([]) });
  const recordById = new Map((routeRecords || []).map(record => [record.id, record]));
  const orderedCrossings = [...crossings]
    .filter(crossing => recordById.get(crossing.overRouteId)?.path)
    .sort((first, second) => (
      routePriority(recordById.get(first.overRouteId))
      - routePriority(recordById.get(second.overRouteId))
    ));

  orderedCrossings.forEach(crossing => {
    const record = recordById.get(crossing.overRouteId);
    const casing = crossingOverlay(
      record.path,
      'aleria-line-crossing-overlay aleria-line-crossing-overlay--casing',
      crossing
    );
    const foreground = crossingOverlay(
      record.path,
      'aleria-line-crossing-overlay aleria-line-crossing-overlay--foreground',
      crossing
    );
    linksView.append(casing, foreground);
    const nextCount = Number(record.path.dataset.lineCrossingCount || 0) + 1;
    record.path.dataset.lineCrossingCount = String(nextCount);
    record.path.dataset.lineCrossingRole = 'over';
  });

  const underCounts = new Map();
  crossings.forEach(crossing => {
    underCounts.set(crossing.underRouteId, (underCounts.get(crossing.underRouteId) || 0) + 1);
  });
  underCounts.forEach((count, routeId) => {
    const path = recordById.get(routeId)?.path;
    if (!path) return;
    path.dataset.lineCrossingCount = String(count);
    path.dataset.lineCrossingRole = 'under';
  });
  container.dataset.layoutLineCrossingCount = String(crossings.length);

  return Object.freeze({
    crossings,
    bridgedRouteIds: Object.freeze([...new Set(
      orderedCrossings.map(crossing => crossing.overRouteId)
    )])
  });
}
