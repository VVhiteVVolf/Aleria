const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
const EPSILON = 0.01;

/** Only a real branch junction gets a dot; unrelated crossings never do. */
export function collectFamilyChartJunctions(records) {
  const groups = new Map();
  for (const record of records || []) {
    if (!groups.has(record.groupId)) groups.set(record.groupId, []);
    groups.get(record.groupId).push(record);
  }
  const junctions = [];
  groups.forEach(routes => {
    const candidates = new Map(routes.flatMap(route => route.points).map(point => [`${point.x}:${point.y}`, point]));
    candidates.forEach(point => {
      const directions = new Set();
      for (const route of routes) {
        for (let index = 1; index < route.points.length; index += 1) {
          const a = route.points[index - 1], b = route.points[index];
          if (Math.abs(a.x - b.x) < EPSILON && Math.abs(a.x - point.x) < EPSILON && point.y >= Math.min(a.y, b.y) && point.y <= Math.max(a.y, b.y)) {
            if (Math.min(a.y, b.y) < point.y - EPSILON) directions.add('up');
            if (Math.max(a.y, b.y) > point.y + EPSILON) directions.add('down');
          }
          if (Math.abs(a.y - b.y) < EPSILON && Math.abs(a.y - point.y) < EPSILON && point.x >= Math.min(a.x, b.x) && point.x <= Math.max(a.x, b.x)) {
            if (Math.min(a.x, b.x) < point.x - EPSILON) directions.add('left');
            if (Math.max(a.x, b.x) > point.x + EPSILON) directions.add('right');
          }
        }
      }
      if (directions.size >= 3) junctions.push({ point, routes });
    });
  });
  return junctions;
}

export function renderFamilyChartJunctions(container, records) {
  container.querySelectorAll('.aleria-line-junction').forEach(element => element.remove());
  const linksView = container.querySelector('.links_view');
  if (!linksView) return;
  for (const { point, routes } of collectFamilyChartJunctions(records)) {
    const circle = container.ownerDocument.createElementNS(SVG_NAMESPACE, 'circle');
    circle.setAttribute('class', 'aleria-line-junction');
    circle.setAttribute('cx', point.x);
    circle.setAttribute('cy', point.y);
    circle.setAttribute('r', '4.5');
    circle.setAttribute('aria-hidden', 'true');
    circle.style.fill = routes[0].path.style.stroke;
    circle.dataset.relatedCardIds = [...new Set(routes.flatMap(route => route.relatedCardIds))].join(',');
    linksView.appendChild(circle);
  }
}
