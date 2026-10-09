// Person cards deliberately lift two chart pixels on hover.
const TOLERANCE = 3;

function contains(rect, point, tolerance = TOLERANCE) {
  return point.x >= rect.left - tolerance && point.x <= rect.right + tolerance
    && point.y >= rect.top - tolerance && point.y <= rect.bottom + tolerance;
}

function overlap(a, b) {
  return Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1
    && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1;
}

function segmentDistance(point, first, second) {
  const dx = second.x - first.x, dy = second.y - first.y;
  const lengthSquared = dx * dx + dy * dy;
  const progress = lengthSquared ? Math.max(0, Math.min(1, ((point.x - first.x) * dx + (point.y - first.y) * dy) / lengthSquared)) : 0;
  return Math.hypot(point.x - first.x - progress * dx, point.y - first.y - progress * dy);
}

function touchesRoute(point, route) {
  return route.points.some((end, index) => index && segmentDistance(point, route.points[index - 1], end) <= TOLERANCE);
}

function crossesRect(first, second, rect) {
  // Liang–Barsky clipping, with a small inset so touching a frame is allowed.
  let lower = 0, upper = 1;
  const dx = second.x - first.x, dy = second.y - first.y;
  const pairs = [[-dx, first.x - rect.left - 1], [dx, rect.right - 1 - first.x], [-dy, first.y - rect.top - 1], [dy, rect.bottom - 1 - first.y]];
  for (const [direction, margin] of pairs) {
    if (Math.abs(direction) < 1e-9) { if (margin < 0) return false; continue; }
    const progress = margin / direction;
    if (direction < 0) lower = Math.max(lower, progress);
    else upper = Math.min(upper, progress);
    if (lower > upper) return false;
  }
  return true;
}

function routeTouchesRect(route, rect) {
  return route.points.some((end, index) => index && crossesRect(route.points[index - 1], end, rect));
}

export function auditChartGeometrySnapshot({ cards = [], labels = [], routes = [] }) {
  const issues = [];
  cards.forEach((card, index) => cards.slice(index + 1).filter(other => overlap(card, other)).forEach(other => issues.push({ code: 'CARD_OVERLAP', ids: [card.id, other.id] })));
  labels.forEach((label, index) => {
    cards.filter(card => overlap(label, card)).forEach(card => issues.push({ code: 'LABEL_CARD_OVERLAP', ids: [label.id, card.id] }));
    labels.slice(index + 1).filter(other => overlap(label, other)).forEach(other => issues.push({ code: 'LABEL_OVERLAP', ids: [label.id, other.id] }));
    if (!routes.some(route => route.relatedIds.some(id => label.relatedIds.includes(id)) && (routeTouchesRect(route, label) || route.points.some(point => contains(label, point))))) {
      issues.push({ code: 'DETACHED_LABEL', ids: [label.id] });
    }
  });
  const referenceCodes = new Set(labels.filter(label => label.referenceCode).map(label => label.referenceCode));
  referenceCodes.forEach(code => {
    const pair = labels.filter(label => label.referenceCode === code);
    if (pair.length !== 2 || pair[0].personId !== pair[1].targetId || pair[1].personId !== pair[0].targetId
      || [...pair[0].relatedIds].sort().join('|') !== [...pair[1].relatedIds].sort().join('|')) {
      issues.push({ code: 'INCOMPLETE_REFERENCE_PAIR', ids: [code] });
    }
  });
  routes.forEach(route => {
    cards.filter(card => !route.relatedIds.includes(card.id) && routeTouchesRect(route, card)).forEach(card => issues.push({ code: 'ROUTE_THROUGH_CARD', ids: [route.id, card.id] }));
    [route.points[0], route.points.at(-1)].filter(Boolean).forEach((point, endpoint) => {
      const attachedCard = cards.some(card => route.relatedIds.includes(card.id) && contains(card, point));
      const attachedLabel = labels.some(label => label.relatedIds.some(id => route.relatedIds.includes(id)) && contains(label, point));
      const attachedRoute = routes.some(other => other !== route
        && ((route.groupId && route.groupId === other.groupId) || route.relatedIds.filter(id => other.relatedIds.includes(id)).length >= 2
          || (route.relatedIds.some(id => other.relatedIds.includes(id)) && [other.points[0], other.points.at(-1)].some(endpoint => Math.hypot(point.x - endpoint.x, point.y - endpoint.y) <= TOLERANCE)))
        && touchesRoute(point, other));
      if (!attachedCard && !attachedLabel && !attachedRoute) issues.push({ code: 'FLOATING_ENDPOINT', ids: [route.id], endpoint, point });
    });
  });
  cards.filter(card => card.appearanceRole === 'partnership-participant').forEach(card => {
    if (labels.some(label => label.referenceCode && label.relatedIds.includes(card.id))) {
      issues.push({ code: 'SEPARATED_PARTNERSHIP_APPEARANCE', ids: [card.id, card.partnershipId] });
    }
  });
  return Object.freeze({ cardCount: cards.length, labelCount: labels.length, routeCount: routes.length, issues: Object.freeze(issues), passed: issues.length === 0 });
}

/** Measures rendered geometry in chart units, independent of viewport zoom. */
export function collectChartGeometrySnapshot(container) {
  const canvas = container.querySelector('#f3Canvas');
  const scale = Number(canvas?.__zoom?.k || 1);
  const bounds = canvas?.getBoundingClientRect() || { left: 0, top: 0 };
  const point = value => ({ x: (value.x - bounds.left) / scale, y: (value.y - bounds.top) / scale });
  const rect = element => {
    const value = element.getBoundingClientRect();
    return { left: (value.left - bounds.left) / scale, right: (value.right - bounds.left) / scale, top: (value.top - bounds.top) / scale, bottom: (value.bottom - bounds.top) / scale };
  };
  const relatedIds = element => (element.dataset.relatedCardIds || '').split(',').filter(Boolean);
  const cards = [...container.querySelectorAll('.card_cont')].flatMap(element => {
    const card = element.querySelector('.aleria-chart-card');
    if (!card || card.classList.contains('aleria-time-jump-stage') || !card.getBoundingClientRect().width) return [];
    const metadata = element.__data__?.data?.data?.aleria || {};
    return [{ id: element.__data__?.data?.id || '', ...rect(card), appearanceRole: metadata.chartAppearanceRole, partnershipId: metadata.sourcePartnershipId }];
  });
  const labels = [...container.querySelectorAll('.aleria-connection-reference, .aleria-partnership-node')].map((element, index) => ({
    id: `label:${element.dataset.referenceCode || element.dataset.partnershipId || index}:${element.dataset.personId}`,
    ...rect(element), relatedIds: relatedIds(element), referenceCode: element.dataset.referenceCode || '',
    personId: element.dataset.personId, targetId: element.dataset.targetPersonId
  }));
  const routes = [...container.querySelectorAll('.links_view path.link:not(.aleria-line-crossing-overlay), .aleria-reference-stem')].flatMap((element, index) => {
    if (getComputedStyle(element).display === 'none') return [];
    const length = element.getTotalLength(), matrix = element.getScreenCTM();
    if (length < 0.1 || !matrix) return [];
    const count = Math.min(4000, Math.max(2, Math.ceil(length / 12)));
    const points = Array.from({ length: count + 1 }, (_, step) => {
      const local = element.getPointAtLength(length * step / count);
      return point(new DOMPoint(local.x, local.y).matrixTransform(matrix));
    });
    return [{ id: element.dataset.routeId || `stem:${index}`, groupId: element.dataset.routeGroupId || '', relatedIds: relatedIds(element), points }];
  });
  return { cards, labels, routes };
}

export function auditRenderedFamilyChart(container) {
  return auditChartGeometrySnapshot(collectChartGeometrySnapshot(container));
}
