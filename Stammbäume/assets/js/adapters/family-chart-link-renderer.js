import { FAMILY_CHART_CARD_LAYOUT } from './family-chart-card-renderer.js';
import {
  collectFamilyChartCardPositions,
  familyChartHierarchyNodeCenter
} from './family-chart-layout-dom.js';
import {
  countOrthogonalRouteCardIntersections,
  selectCollisionAwarePartnershipRoute,
  selectCollisionAwareRail
} from './family-chart-route-geometry.js';
import {
  applyFamilyChartLineCrossingBridges,
  clearFamilyChartLineCrossingBridges
} from './family-chart-line-crossings.js';

const DEFAULT_CORNER_RADIUS = 18;
const ALIGNED_CARD_TOLERANCE = 1;
const LIBRARY_RENDER_SETTLE_MS = 34;

function asPoint(value) {
  if (Array.isArray(value) && value.length >= 2) {
    const x = Number(value[0]);
    const y = Number(value[1]);
    return Number.isFinite(x) && Number.isFinite(y) ? { x, y } : null;
  }
  if (value && typeof value === 'object') {
    const x = Number(value.x);
    const y = Number(value.y);
    return Number.isFinite(x) && Number.isFinite(y) ? { x, y } : null;
  }
  return null;
}

function samePoint(first, second) {
  return first.x === second.x && first.y === second.y;
}

function isCollinear(first, middle, last) {
  const crossProduct = (middle.x - first.x) * (last.y - middle.y)
    - (middle.y - first.y) * (last.x - middle.x);
  return Math.abs(crossProduct) < 0.001;
}

function compactPoints(points) {
  const unique = [];
  points.map(asPoint).filter(Boolean).forEach(point => {
    if (!unique.length || !samePoint(unique.at(-1), point)) unique.push(point);
  });
  if (unique.length < 3) return unique;

  return unique.filter((point, index) => (
    index === 0
    || index === unique.length - 1
    || !isCollinear(unique[index - 1], point, unique[index + 1])
  ));
}

function distance(first, second) {
  return Math.hypot(second.x - first.x, second.y - first.y);
}

function pointTowards(from, to, amount) {
  const length = distance(from, to);
  if (!length) return { ...from };
  const ratio = amount / length;
  return {
    x: from.x + ((to.x - from.x) * ratio),
    y: from.y + ((to.y - from.y) * ratio)
  };
}

function coordinate(value) {
  const rounded = Math.round(value * 1000) / 1000;
  return String(Object.is(rounded, -0) ? 0 : rounded);
}

function pathPoint(point) {
  return `${coordinate(point.x)} ${coordinate(point.y)}`;
}

export function createRoundedOrthogonalPath(points, cornerRadius = DEFAULT_CORNER_RADIUS) {
  const route = compactPoints(Array.isArray(points) ? points : []);
  if (!route.length) return '';
  if (route.length === 1) return `M ${pathPoint(route[0])}`;

  const preferredRadius = Math.max(0, Number(cornerRadius) || 0);
  let path = `M ${pathPoint(route[0])}`;

  for (let index = 1; index < route.length - 1; index += 1) {
    const previous = route[index - 1];
    const corner = route[index];
    const next = route[index + 1];
    const radius = Math.min(
      preferredRadius,
      distance(previous, corner) / 2,
      distance(corner, next) / 2
    );

    if (radius < 0.01) {
      path += ` L ${pathPoint(corner)}`;
      continue;
    }

    const cornerStart = pointTowards(corner, previous, radius);
    const cornerEnd = pointTowards(corner, next, radius);
    path += ` L ${pathPoint(cornerStart)} Q ${pathPoint(corner)} ${pathPoint(cornerEnd)}`;
  }

  return `${path} L ${pathPoint(route.at(-1))}`;
}

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

function midpoint(points) {
  if (!points.length) return null;
  const total = points.reduce((sum, point) => ({ x: sum.x + point.x, y: sum.y + point.y }), { x: 0, y: 0 });
  return { x: total.x / points.length, y: total.y / points.length };
}

function parentageRoute(
  first,
  second,
  orientation,
  { cardPositions = new Map(), relatedCardIds = [] } = {}
) {
  const parentGeneration = orientation === 'horizontal' ? first.x : first.y;
  const childGeneration = orientation === 'horizontal' ? second.x : second.y;
  const buildRoutes = railGeneration => [orientation === 'horizontal'
    ? [first, { x: railGeneration, y: first.y }, { x: railGeneration, y: second.y }, second]
    : [first, { x: first.x, y: railGeneration }, { x: second.x, y: railGeneration }, second]];
  const selected = selectCollisionAwareRail({
    parentGeneration,
    childGeneration,
    cardPositions,
    relatedCardIds,
    orientation,
    buildRoutes
  });
  return selected?.routes?.[0] || buildRoutes(
    parentGeneration + ((childGeneration - parentGeneration) / 2)
  )[0];
}

function alignedPartnershipRoute(first, second, orientation) {
  if (orientation !== 'horizontal') {
    if (Math.abs(first.y - second.y) > ALIGNED_CARD_TOLERANCE) return [];
    const left = first.x <= second.x ? first : second;
    const right = left === first ? second : first;
    // FamilyChart positioniert Karten über ihren Mittelpunkt. Die gerade
    // Verlobungslinie liegt deshalb auf der gemeinsamen y-Achse und beginnt
    // beziehungsweise endet nur um die halbe Kartenbreite versetzt.
    const lineY = (left.y + right.y) / 2;
    return [
      { x: left.x + (FAMILY_CHART_CARD_LAYOUT.width / 2), y: lineY },
      { x: right.x - (FAMILY_CHART_CARD_LAYOUT.width / 2), y: lineY }
    ];
  }

  if (Math.abs(first.x - second.x) > ALIGNED_CARD_TOLERANCE) return [];
  const top = first.y <= second.y ? first : second;
  const bottom = top === first ? second : first;
  const lineX = (top.x + bottom.x) / 2;
  return [
    { x: lineX, y: top.y + (FAMILY_CHART_CARD_LAYOUT.height / 2) },
    { x: lineX, y: bottom.y - (FAMILY_CHART_CARD_LAYOUT.height / 2) }
  ];
}

function hierarchyNodeId(node) {
  return node?.data?.id || node?.data?.data?.id || node?.id || '';
}

function hierarchyNodeIds(value) {
  return (Array.isArray(value) ? value : [value])
    .map(hierarchyNodeId)
    .filter(Boolean);
}

function hierarchyNodes(value) {
  return (Array.isArray(value) ? value : [value]).filter(Boolean);
}

function hierarchyNodePoints(value, cardPositions) {
  return hierarchyNodes(value).map(node => (
    familyChartHierarchyNodeCenter(node)
      || cardPositions.get(hierarchyNodeId(node))
      || null
  )).filter(Boolean);
}

function relatedIdsForExtraLink(extraLink) {
  return [...new Set([
    extraLink.firstId,
    extraLink.secondId,
    extraLink.parentId,
    ...(extraLink.parentIds || []),
    extraLink.childId,
    ...(extraLink.childIds || [])
  ].filter(Boolean))];
}

function setRelatedCardIds(path, cardIds) {
  path.dataset.relatedCardIds = [...new Set(cardIds || [])].filter(Boolean).join(',');
}

function sortedRouteIds(ids) {
  return [...new Set(ids || [])].filter(Boolean).sort((first, second) => (
    String(first).localeCompare(String(second), 'de')
  ));
}

function nativeRouteGroupId(link) {
  const sourceIds = hierarchyNodeIds(link?.source);
  const targetIds = hierarchyNodeIds(link?.target);
  if (link?.spouse) {
    return `partnership:${sortedRouteIds([...sourceIds, ...targetIds]).join('|')}`;
  }
  const parentIds = Array.isArray(link?.source)
    ? sourceIds
    : Array.isArray(link?.target)
      ? targetIds
      : sourceIds;
  return `parentage:${sortedRouteIds(parentIds).join('|')}`;
}

function extraRouteGroupId(extraLink, fallbackIndex) {
  if (extraLink.kind === 'parentage-group' || extraLink.kind === 'parentage') {
    const parentIds = extraLink.parentIds?.length
      ? extraLink.parentIds
      : [extraLink.parentId];
    return `extra-parentage:${extraLink.id || sortedRouteIds(parentIds).join('|') || fallbackIndex}`;
  }
  return `extra-partnership:${extraLink.id || sortedRouteIds([
    extraLink.firstId,
    extraLink.secondId
  ]).join('|') || fallbackIndex}`;
}

function registerRoute(routeRecords, {
  id,
  groupId,
  path,
  points,
  type,
  relatedCardIds,
  hidden = false
}) {
  if (hidden || !path || compactPoints(points).length < 2) return;
  path.dataset.routeId = id;
  path.dataset.routeGroupId = groupId;
  routeRecords.push(Object.freeze({
    id,
    groupId,
    path,
    points: Object.freeze(compactPoints(points)),
    type: type || 'unknown',
    relatedCardIds: Object.freeze(sortedRouteIds(relatedCardIds))
  }));
}

/**
 * Family Chart calculates native SVG waypoints before Aleria's alignment
 * passes move cards. Reusing those stale points is the root cause of long
 * dog-legs and lines crossing unrelated branches. Native routes are therefore
 * rebuilt exclusively from the final card coordinates.
 */
export function createFamilyChartNativeLinkRoute(
  link,
  cardPositions,
  orientation = 'vertical'
) {
  const sourceIds = hierarchyNodeIds(link?.source);
  const targetIds = hierarchyNodeIds(link?.target);
  // A person can intentionally occur more than once (internal marriage,
  // partner mirror, origin card). A Map keyed only by the canonical person ID
  // necessarily points at one arbitrary occurrence and previously connected
  // marriages across the whole tree. Native links already carry the exact
  // hierarchy-node occurrences, so their final coordinates take precedence;
  // the ID map remains only a defensive fallback for synthetic test links.
  const sourcePoints = hierarchyNodePoints(link?.source, cardPositions);
  const targetPoints = hierarchyNodePoints(link?.target, cardPositions);
  if (
    sourcePoints.length !== sourceIds.length
    || targetPoints.length !== targetIds.length
    || !sourcePoints.length
    || !targetPoints.length
  ) return Object.freeze({ route: Object.freeze([]), relatedCardIds: Object.freeze([]) });

  const relatedCardIds = Object.freeze([...new Set([...sourceIds, ...targetIds])]);
  if (link?.spouse) {
    const first = sourcePoints[0];
    const second = targetPoints[0];
    const alignedRoute = alignedPartnershipRoute(first, second, orientation);
    return Object.freeze({
      route: selectCollisionAwarePartnershipRoute({
        first,
        second,
        directRoute: alignedRoute,
        cardPositions,
        relatedCardIds,
        orientation
      }),
      relatedCardIds
    });
  }

  const sourceIsParentGroup = Array.isArray(link?.source);
  const targetIsParentGroup = Array.isArray(link?.target);
  const parentPoint = sourceIsParentGroup
    ? midpoint(sourcePoints)
    : targetIsParentGroup
      ? midpoint(targetPoints)
      : sourcePoints[0];
  const childPoint = sourceIsParentGroup
    ? targetPoints[0]
    : targetIsParentGroup
      ? sourcePoints[0]
      : targetPoints[0];
  return Object.freeze({
    route: Object.freeze(parentageRoute(parentPoint, childPoint, orientation, {
      cardPositions,
      relatedCardIds
    })),
    relatedCardIds
  });
}

function endpointDistance(firstRoute, secondRoute) {
  if (firstRoute.length < 2 || secondRoute.length < 2) return Number.POSITIVE_INFINITY;
  const direct = distance(firstRoute[0], secondRoute[0])
    + distance(firstRoute.at(-1), secondRoute.at(-1));
  const reversed = distance(firstRoute[0], secondRoute.at(-1))
    + distance(firstRoute.at(-1), secondRoute[0]);
  return Math.min(direct, reversed);
}

/**
 * Keeps Family Chart's native route while it is still valid. A route is
 * replaced only when a final alignment pass moved one of its endpoints or
 * when it visibly crosses an unrelated card and the rebuilt route improves
 * that situation. This narrow ownership avoids the earlier global rerouting
 * side effect that spread otherwise healthy trees across the canvas.
 */
export function selectFamilyChartNativeLinkRoute(
  link,
  cardPositions,
  orientation = 'vertical'
) {
  const nativeRoute = compactPoints(Array.isArray(link?.d) ? link.d : []);
  const rebuilt = createFamilyChartNativeLinkRoute(link, cardPositions, orientation);
  if (rebuilt.route.length < 2) {
    return Object.freeze({
      route: Object.freeze(nativeRoute),
      relatedCardIds: rebuilt.relatedCardIds,
      strategy: 'native-fallback',
      nativeHitCardIds: Object.freeze([]),
      rebuiltHitCardIds: Object.freeze([])
    });
  }

  const nativeHitCardIds = countOrthogonalRouteCardIntersections(
    [nativeRoute],
    cardPositions,
    rebuilt.relatedCardIds
  );
  const rebuiltHitCardIds = countOrthogonalRouteCardIntersections(
    [rebuilt.route],
    cardPositions,
    rebuilt.relatedCardIds
  );
  const endpointsMoved = endpointDistance(nativeRoute, rebuilt.route) > 1;
  const rebuiltImprovesCollision = rebuiltHitCardIds.length < nativeHitCardIds.length;
  const rebuiltRestoresMovedAnchors = endpointsMoved
    && rebuiltHitCardIds.length <= nativeHitCardIds.length;
  const useRebuiltRoute = rebuiltImprovesCollision || rebuiltRestoresMovedAnchors;

  return Object.freeze({
    route: useRebuiltRoute ? rebuilt.route : Object.freeze(nativeRoute),
    relatedCardIds: rebuilt.relatedCardIds,
    strategy: useRebuiltRoute
      ? rebuiltImprovesCollision ? 'rebuilt-collision-free' : 'rebuilt-final-anchors'
      : 'native-valid',
    nativeHitCardIds,
    rebuiltHitCardIds
  });
}

export function createFamilyChartParentageGroupRoutes(
  extraLink,
  cardPositions,
  orientation = 'vertical'
) {
  const parentPoints = (extraLink.parentIds || [])
    .map(parentId => cardPositions.get(parentId))
    .filter(Boolean);
  const parentPoint = parentPoints.length
    ? midpoint(parentPoints)
    : cardPositions.get(extraLink.parentId);
  const childPoints = (extraLink.childIds || [])
    .map(childId => cardPositions.get(childId))
    .filter(Boolean);
  if (
    !parentPoint
    || (extraLink.parentIds?.length && parentPoints.length !== extraLink.parentIds.length)
    || childPoints.length !== extraLink.childIds.length
  ) return [];

  const childAxisValues = childPoints.map(point => (
    orientation === 'horizontal' ? point.y : point.x
  ));
  const parentCrossAxis = orientation === 'horizontal' ? parentPoint.y : parentPoint.x;
  const childGeneration = childPoints.reduce((sum, point) => (
    sum + (orientation === 'horizontal' ? point.x : point.y)
  ), 0) / childPoints.length;
  const parentGeneration = orientation === 'horizontal' ? parentPoint.x : parentPoint.y;
  // The rail must span the parent anchor as well as every child. Previously a
  // one-child group produced two disconnected vertical stubs whenever a later
  // layout pass had shifted the child away from its parent.
  const firstCrossAxis = Math.min(parentCrossAxis, ...childAxisValues);
  const lastCrossAxis = Math.max(parentCrossAxis, ...childAxisValues);

  const buildRoutes = railGeneration => orientation === 'horizontal'
    ? [
        [parentPoint, { x: railGeneration, y: parentPoint.y }],
        [{ x: railGeneration, y: firstCrossAxis }, { x: railGeneration, y: lastCrossAxis }],
        ...childPoints.map(point => [{ x: railGeneration, y: point.y }, point])
      ]
    : [
        [parentPoint, { x: parentPoint.x, y: railGeneration }],
        [{ x: firstCrossAxis, y: railGeneration }, { x: lastCrossAxis, y: railGeneration }],
        ...childPoints.map(point => [{ x: point.x, y: railGeneration }, point])
      ];
  const relatedCardIds = relatedIdsForExtraLink(extraLink);
  const selected = selectCollisionAwareRail({
    parentGeneration,
    childGeneration,
    cardPositions,
    relatedCardIds,
    orientation,
    buildRoutes
  });
  return selected?.routes || buildRoutes(
    parentGeneration + ((childGeneration - parentGeneration) / 2)
  );
}

export function createFamilyChartExtraLinkRoute(extraLink, cardPositions, orientation = 'vertical') {
  if (extraLink.kind === 'parentage') {
    const parentPoints = (extraLink.parentIds || []).map(parentId => cardPositions.get(parentId)).filter(Boolean);
    const childPoint = cardPositions.get(extraLink.childId);
    const parentPoint = midpoint(parentPoints);
    return parentPoint && childPoint ? parentageRoute(parentPoint, childPoint, orientation, {
      cardPositions,
      relatedCardIds: relatedIdsForExtraLink(extraLink)
    }) : [];
  }

  const first = cardPositions.get(extraLink.firstId);
  const second = cardPositions.get(extraLink.secondId);
  if (!first || !second) return [];
  const directCenteredRoute = extraLink.routeMode === 'centered'
    || extraLink.type === 'engagement'
    ? alignedPartnershipRoute(first, second, orientation)
    : [];
  return selectCollisionAwarePartnershipRoute({
    first,
    second,
    directRoute: directCenteredRoute,
    cardPositions,
    relatedCardIds: relatedIdsForExtraLink(extraLink),
    orientation,
    preferredSide: extraLink.routeSide
  });
}

export function createFamilyChartLinkRenderer({
  container,
  resolveMetadata,
  resolveExtraLinks,
  resolveOrientation,
  schedule = globalThis.setTimeout?.bind(globalThis),
  cancel = globalThis.clearTimeout?.bind(globalThis)
}) {
  if (!container) throw new Error('Für die Liniengestaltung fehlt der Chart-Container.');
  if (typeof resolveMetadata !== 'function') throw new Error('Für die Liniengestaltung fehlt die Metadatenauflösung.');

  let pendingRender = null;
  let destroyed = false;

  function applyLineStyle(path, metadata) {
    path.style.display = metadata.hidden ? 'none' : '';
    path.style.stroke = metadata.color;
    path.style.strokeWidth = '3.25px';
    path.style.strokeDasharray = metadata.dashed ? '8 6' : '';
    path.dataset.relationshipType = metadata.type;
  }

  function renderExtraLinks(routeRecords) {
    container.querySelectorAll('.links_view path.aleria-extra-link').forEach(element => element.remove());
    const extraLinks = typeof resolveExtraLinks === 'function' ? resolveExtraLinks() || [] : [];
    if (!extraLinks.length) return;
    const linksView = container.querySelector('.links_view');
    if (!linksView) return;
    const cardPositions = collectFamilyChartCardPositions(container);
    const orientation = typeof resolveOrientation === 'function' ? resolveOrientation() : 'vertical';
    extraLinks.forEach((extraLink, extraLinkIndex) => {
      const groupId = extraRouteGroupId(extraLink, extraLinkIndex);
      if (extraLink.kind === 'parentage-group') {
        const routes = createFamilyChartParentageGroupRoutes(
          extraLink,
          cardPositions,
          orientation
        );

        routes.forEach((route, routeIndex) => {
          const path = container.ownerDocument.createElementNS(SVG_NAMESPACE, 'path');
          path.setAttribute('class', 'link aleria-link--routed aleria-extra-link');
          path.setAttribute('fill', 'none');
          path.setAttribute('d', createRoundedOrthogonalPath(route, 0));
          path.dataset.extraLinkKind = extraLink.kind;
          setRelatedCardIds(path, relatedIdsForExtraLink(extraLink));
          applyLineStyle(path, extraLink);
          linksView.appendChild(path);
          registerRoute(routeRecords, {
            id: `${groupId}:segment:${routeIndex}`,
            groupId,
            path,
            points: route,
            type: extraLink.type,
            relatedCardIds: relatedIdsForExtraLink(extraLink),
            hidden: extraLink.hidden
          });
        });
        return;
      }
      const route = createFamilyChartExtraLinkRoute(extraLink, cardPositions, orientation);
      if (route.length < 2) return;
      const path = container.ownerDocument.createElementNS(SVG_NAMESPACE, 'path');
      path.setAttribute('class', 'link aleria-link--routed aleria-extra-link');
      path.setAttribute('fill', 'none');
      path.setAttribute('d', createRoundedOrthogonalPath(route));
      path.dataset.extraLinkKind = extraLink.kind || 'partnership';
      setRelatedCardIds(path, relatedIdsForExtraLink(extraLink));
      applyLineStyle(path, extraLink);
      linksView.appendChild(path);
      registerRoute(routeRecords, {
        id: `${groupId}:route`,
        groupId,
        path,
        points: route,
        type: extraLink.type,
        relatedCardIds: relatedIdsForExtraLink(extraLink),
        hidden: extraLink.hidden
      });
    });
  }

  function render() {
    if (destroyed) return;
    clearFamilyChartLineCrossingBridges(container);
    container.querySelectorAll('.link-text').forEach(element => element.remove());
    const cardPositions = collectFamilyChartCardPositions(container);
    const orientation = typeof resolveOrientation === 'function' ? resolveOrientation() : 'vertical';
    const routeRecords = [];
    container.querySelectorAll('.links_view path.link:not(.aleria-extra-link):not(.aleria-line-crossing-overlay)').forEach((path, pathIndex) => {
      const link = path.__data__;
      const metadata = resolveMetadata(link);
      const selectedRoute = selectFamilyChartNativeLinkRoute(
        link,
        cardPositions,
        orientation
      );
      const routedPath = createRoundedOrthogonalPath(selectedRoute.route);
      if (routedPath) path.setAttribute('d', routedPath);
      path.classList.add('aleria-link--routed');
      path.dataset.routeStrategy = selectedRoute.strategy;
      setRelatedCardIds(path, selectedRoute.relatedCardIds);
      const resolvedMetadata = metadata || Object.freeze({
        type: link?.spouse ? 'marriage' : 'biological',
        hidden: false,
        color: path.style.stroke || '#9f1f25',
        dashed: false
      });
      applyLineStyle(path, resolvedMetadata);
      const groupId = nativeRouteGroupId(link);
      registerRoute(routeRecords, {
        id: `${groupId}:native:${pathIndex}`,
        groupId,
        path,
        points: selectedRoute.route,
        type: resolvedMetadata.type,
        relatedCardIds: selectedRoute.relatedCardIds,
        hidden: resolvedMetadata.hidden
      });
    });
    renderExtraLinks(routeRecords);
    applyFamilyChartLineCrossingBridges(container, routeRecords);
  }

  function refresh(transitionTime = 0) {
    if (destroyed) return;
    if (pendingRender !== null && cancel) cancel(pendingRender);
    pendingRender = null;
    render();

    const delay = Math.max(0, Number(transitionTime) || 0);
    if (schedule) {
      // Family Chart commits its D3 path transition in the next animation
      // frame even when transition_time is zero. An immediate Aleria render
      // would therefore be overwritten with the library's stale waypoints.
      // One bounded settling pass after the transition owns the final paths
      // without observing the DOM indefinitely or coupling this module to D3.
      pendingRender = schedule(() => {
        pendingRender = null;
        render();
      }, delay + LIBRARY_RENDER_SETTLE_MS);
    }
  }

  function destroy() {
    destroyed = true;
    if (pendingRender !== null && cancel) cancel(pendingRender);
    pendingRender = null;
  }

  return Object.freeze({ refresh, destroy });
}
