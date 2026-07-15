const DEFAULT_CORNER_RADIUS = 18;

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

export function createFamilyChartLinkRenderer({
  container,
  resolveMetadata,
  schedule = globalThis.setTimeout?.bind(globalThis),
  cancel = globalThis.clearTimeout?.bind(globalThis)
}) {
  if (!container) throw new Error('Für die Liniengestaltung fehlt der Chart-Container.');
  if (typeof resolveMetadata !== 'function') throw new Error('Für die Liniengestaltung fehlt die Metadatenauflösung.');

  let pendingRender = null;
  let destroyed = false;

  function render() {
    if (destroyed) return;
    container.querySelectorAll('.link-text').forEach(element => element.remove());
    container.querySelectorAll('.links_view path.link').forEach(path => {
      const link = path.__data__;
      const metadata = resolveMetadata(link);
      const routedPath = createRoundedOrthogonalPath(link?.d);
      if (routedPath) path.setAttribute('d', routedPath);
      path.classList.add('aleria-link--routed');
      if (!metadata) return;

      path.style.stroke = metadata.color;
      path.style.strokeWidth = '3.25px';
      path.style.strokeDasharray = metadata.dashed ? '8 6' : '';
      path.dataset.relationshipType = metadata.type;
    });
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
