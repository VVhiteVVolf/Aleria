import { FAMILY_CHART_CARD_LAYOUT } from './family-chart-card-renderer.js';
import { collectFamilyChartCardPositions } from './family-chart-layout-dom.js';

const DEFAULT_CORNER_RADIUS = 18;
const ALIGNED_CARD_TOLERANCE = 1;

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

function parentageRoute(first, second, orientation) {
  if (orientation !== 'horizontal') {
    const firstEdge = second.y >= first.y ? first.y + FAMILY_CHART_CARD_LAYOUT.height : first.y;
    const secondEdge = second.y >= first.y ? second.y : second.y + FAMILY_CHART_CARD_LAYOUT.height;
    const middleY = firstEdge + ((secondEdge - firstEdge) / 2);
    return [first, { x: first.x, y: middleY }, { x: second.x, y: middleY }, second];
  }
  const firstEdge = second.x >= first.x ? first.x + FAMILY_CHART_CARD_LAYOUT.width : first.x;
  const secondEdge = second.x >= first.x ? second.x : second.x + FAMILY_CHART_CARD_LAYOUT.width;
  const middleX = firstEdge + ((secondEdge - firstEdge) / 2);
  return [first, { x: middleX, y: first.y }, { x: middleX, y: second.y }, second];
}

function partnershipRoute(first, second, orientation, routeSide = 'after') {
  if (orientation !== 'horizontal') {
    const generationGap = Math.max(
      24,
      FAMILY_CHART_CARD_LAYOUT.verticalSpacing - FAMILY_CHART_CARD_LAYOUT.height
    );
    const laneY = routeSide === 'before'
      ? Math.min(first.y, second.y) - (generationGap / 2)
      : Math.max(first.y, second.y) + FAMILY_CHART_CARD_LAYOUT.height + (generationGap / 2);
    return [first, { x: first.x, y: laneY }, { x: second.x, y: laneY }, second];
  }
  const generationGap = Math.max(
    24,
    FAMILY_CHART_CARD_LAYOUT.horizontalSpacing - FAMILY_CHART_CARD_LAYOUT.width
  );
  const laneX = routeSide === 'before'
    ? Math.min(first.x, second.x) - (generationGap / 2)
    : Math.max(first.x, second.x) + FAMILY_CHART_CARD_LAYOUT.width + (generationGap / 2);
  return [first, { x: laneX, y: first.y }, { x: laneX, y: second.y }, second];
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

export function createFamilyChartExtraLinkRoute(extraLink, cardPositions, orientation = 'vertical') {
  if (extraLink.kind === 'parentage') {
    const parentPoints = (extraLink.parentIds || []).map(parentId => cardPositions.get(parentId)).filter(Boolean);
    const childPoint = cardPositions.get(extraLink.childId);
    const parentPoint = midpoint(parentPoints);
    return parentPoint && childPoint ? parentageRoute(parentPoint, childPoint, orientation) : [];
  }

  const first = cardPositions.get(extraLink.firstId);
  const second = cardPositions.get(extraLink.secondId);
  if (!first || !second) return [];
  const directCenteredRoute = extraLink.routeMode === 'centered'
    || extraLink.type === 'engagement'
    ? alignedPartnershipRoute(first, second, orientation)
    : [];
  return directCenteredRoute.length
    ? directCenteredRoute
    : partnershipRoute(first, second, orientation, extraLink.routeSide);
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

  function renderExtraLinks() {
    container.querySelectorAll('.links_view path.aleria-extra-link').forEach(element => element.remove());
    const extraLinks = typeof resolveExtraLinks === 'function' ? resolveExtraLinks() || [] : [];
    if (!extraLinks.length) return;
    const linksView = container.querySelector('.links_view');
    if (!linksView) return;
    const cardPositions = collectFamilyChartCardPositions(container);
    const orientation = typeof resolveOrientation === 'function' ? resolveOrientation() : 'vertical';
    extraLinks.forEach(extraLink => {
      if (extraLink.kind === 'parentage-group') {
        const parentPoint = cardPositions.get(extraLink.parentId);
        const childPoints = (extraLink.childIds || [])
          .map(childId => cardPositions.get(childId))
          .filter(Boolean);
        if (!parentPoint || childPoints.length !== extraLink.childIds.length) return;

        const childAxisValues = childPoints.map(point => (
          orientation === 'horizontal' ? point.y : point.x
        ));
        const childGeneration = childPoints.reduce((sum, point) => (
          sum + (orientation === 'horizontal' ? point.x : point.y)
        ), 0) / childPoints.length;
        const parentGeneration = orientation === 'horizontal' ? parentPoint.x : parentPoint.y;
        const railGeneration = parentGeneration + ((childGeneration - parentGeneration) / 2);
        const firstCrossAxis = Math.min(...childAxisValues);
        const lastCrossAxis = Math.max(...childAxisValues);
        const routes = orientation === 'horizontal'
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

        routes.forEach(route => {
          const path = container.ownerDocument.createElementNS(SVG_NAMESPACE, 'path');
          path.setAttribute('class', 'link aleria-link--routed aleria-extra-link');
          path.setAttribute('fill', 'none');
          path.setAttribute('d', createRoundedOrthogonalPath(route, 0));
          path.dataset.extraLinkKind = extraLink.kind;
          applyLineStyle(path, extraLink);
          linksView.appendChild(path);
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
      applyLineStyle(path, extraLink);
      linksView.appendChild(path);
    });
  }

  function render() {
    if (destroyed) return;
    container.querySelectorAll('.link-text').forEach(element => element.remove());
    container.querySelectorAll('.links_view path.link:not(.aleria-extra-link)').forEach(path => {
      const link = path.__data__;
      const metadata = resolveMetadata(link);
      const routedPath = createRoundedOrthogonalPath(link?.d);
      if (routedPath) path.setAttribute('d', routedPath);
      path.classList.add('aleria-link--routed');
      if (!metadata) return;
      applyLineStyle(path, metadata);
    });
    renderExtraLinks();
  }

  function refresh(transitionTime = 0) {
    if (destroyed) return;
    if (pendingRender !== null && cancel) cancel(pendingRender);
    pendingRender = null;
    render();

    const delay = Math.max(0, Number(transitionTime) || 0);
    if (delay && schedule) {
      pendingRender = schedule(() => {
        pendingRender = null;
        render();
      }, delay + 20);
    }
  }

  function destroy() {
    destroyed = true;
    if (pendingRender !== null && cancel) cancel(pendingRender);
    pendingRender = null;
  }

  return Object.freeze({ refresh, destroy });
}
