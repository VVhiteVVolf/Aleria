import { FAMILY_CHART_CARD_LAYOUT } from './family-chart-card-renderer.js';
import { countOrthogonalRouteCardIntersections } from './family-chart-route-geometry.js';
import { PARTNERSHIP_LABELS } from '../config/family-colors.js';

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
const REFERENCE_WIDTH = 284;
const REFERENCE_HEIGHT = 28;
const REFERENCE_GAP = 6;

export function familyChartPairKey(ids) {
  return [...new Set(ids)].sort().join('\u001f');
}

function occurrenceKey(id, point) {
  return `${id}:${point.x}:${point.y}`;
}

function referenceBadge(id, point, slot, orientation) {
  const horizontal = orientation === 'horizontal';
  const halfSize = horizontal ? FAMILY_CHART_CARD_LAYOUT.width / 2 : FAMILY_CHART_CARD_LAYOUT.height / 2;
  const offset = halfSize + REFERENCE_GAP + (REFERENCE_HEIGHT / 2)
    + slot * (REFERENCE_HEIGHT + REFERENCE_GAP);
  const center = horizontal
    ? { x: point.x + offset + (REFERENCE_WIDTH - REFERENCE_HEIGHT) / 2, y: point.y }
    : { x: point.x, y: point.y + offset };
  return Object.freeze({
    personId: id, center,
    entry: horizontal ? { x: center.x - REFERENCE_WIDTH / 2, y: center.y } : { x: center.x, y: center.y - REFERENCE_HEIGHT / 2 },
    exit: horizontal ? { x: center.x + REFERENCE_WIDTH / 2, y: center.y } : { x: center.x, y: center.y + REFERENCE_HEIGHT / 2 },
    cardEdge: horizontal ? { x: point.x + halfSize, y: point.y } : { x: point.x, y: point.y + halfSize }
  });
}

/** Display-only references: the canonical people and their relationships stay intact. */
export function planFamilyChartConnectionReferences({ partnerships, cardPositions, orientation = 'vertical' }) {
  // A horizontal generation gap is narrower than a name capsule. Keep the
  // ordinary routed presentation there; references are a vertical-view aid.
  if (orientation === 'horizontal') return Object.freeze([]);
  const selected = new Map();
  for (const partnership of partnerships || []) {
    if (partnership.hidden || !partnership.first || !partnership.second) continue;
    const { first, second, firstId, secondId } = partnership;
    if (firstId === secondId) continue;
    const span = Math.abs(first.x - second.x);
    const blockers = countOrthogonalRouteCardIntersections(
      [[first, second]], cardPositions, [firstId, secondId]
    );
    if (span <= FAMILY_CHART_CARD_LAYOUT.width * 4 && blockers.length < 2) continue;
    const key = [occurrenceKey(firstId, first), occurrenceKey(secondId, second)].sort().join('|');
    if (!selected.has(key)) selected.set(key, partnership);
  }
  const slots = new Map();
  return Object.freeze([...selected.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, pair], index) => {
    const badges = [[pair.firstId, pair.first], [pair.secondId, pair.second]].map(([id, point]) => {
      const key = occurrenceKey(id, point);
      const slot = slots.get(key) || 0;
      slots.set(key, slot + 1);
      return referenceBadge(id, point, slot, orientation);
    });
    return Object.freeze({ ...pair, code: `V${index + 1}`, pairKey: familyChartPairKey([pair.firstId, pair.secondId]), badges: Object.freeze(badges) });
  }));
}

export function findFamilyChartConnectionReference(references, ids, points) {
  const key = familyChartPairKey(ids);
  return (references || []).find(reference => reference.pairKey === key && points.every(point => (
    [reference.first, reference.second].some(other => Math.hypot(point.x - other.x, point.y - other.y) < 1)
  )));
}

export function familyChartReferenceParentAnchor(reference, childPoint, orientation = 'vertical') {
  const axis = orientation === 'horizontal' ? 'y' : 'x';
  return [...reference.badges].sort((a, b) => (
    Math.abs(a.center[axis] - childPoint[axis]) - Math.abs(b.center[axis] - childPoint[axis])
  ))[0].exit;
}

export function clearFamilyChartConnectionReferences(container) {
  container.querySelectorAll('.aleria-connection-reference, .aleria-reference-stem').forEach(element => element.remove());
}

export function renderFamilyChartConnectionReferences(container, references) {
  clearFamilyChartConnectionReferences(container);
  const cardsView = container.querySelector('#htmlSvg .cards_view');
  const linksView = container.querySelector('.links_view');
  if (!cardsView || !linksView) return;
  const documentRef = container.ownerDocument;
  for (const reference of references) {
    const label = PARTNERSHIP_LABELS[reference.type] || 'Beziehung';
    reference.badges.forEach((badge, index) => {
      const otherId = index === 0 ? reference.secondId : reference.firstId;
      const otherName = index === 0 ? reference.secondName : reference.firstName;
      const button = documentRef.createElement('button');
      button.type = 'button';
      button.className = 'aleria-connection-reference';
      button.dataset.action = 'open-relationship-reference';
      button.dataset.personId = badge.personId;
      button.dataset.targetPersonId = otherId;
      button.dataset.relatedCardIds = [reference.firstId, reference.secondId].join(',');
      button.dataset.referenceCode = reference.code;
      button.style.transform = `translate(${badge.center.x}px, ${badge.center.y}px) translate(-50%, -50%)`;
      button.style.setProperty('--reference-color', reference.color || '#704485');
      button.textContent = `${reference.code} · ${label} · ${otherName || otherId} ↗`;
      button.title = `${label} mit ${otherName || otherId}. Gleicher Verweis ${reference.code} an beiden Karten. Beziehungen öffnen.`;
      button.setAttribute('aria-label', button.title);
      cardsView.appendChild(button);
      const stem = documentRef.createElementNS(SVG_NAMESPACE, 'path');
      stem.setAttribute('class', 'aleria-reference-stem');
      stem.setAttribute('d', `M ${badge.cardEdge.x} ${badge.cardEdge.y} L ${badge.entry.x} ${badge.entry.y}`);
      stem.setAttribute('fill', 'none');
      stem.style.stroke = reference.color || '#704485';
      stem.dataset.relatedCardIds = [reference.firstId, reference.secondId].join(',');
      linksView.appendChild(stem);
    });
  }
  container.dataset.connectionReferenceCount = String(references.length);
}
