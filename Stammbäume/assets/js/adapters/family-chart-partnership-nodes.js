import { FAMILY_CHART_CARD_LAYOUT } from './family-chart-card-renderer.js';
import { familyChartPairKey, findFamilyChartConnectionReference } from './family-chart-connection-references.js';
import { presentPartnership } from '../domain/partnership-presentation.js';
import { cardRectangle } from './family-chart-collision-geometry.js';

export const PARTNERSHIP_NODE_SIZE = Object.freeze({ width: 200, height: 32, gap: 12 });

function rectangle(point, width, height) {
  return { left: point.x - width / 2, right: point.x + width / 2, top: point.y - height / 2, bottom: point.y + height / 2 };
}

function overlaps(a, b) {
  return a.left < b.right + 6 && b.left < a.right + 6 && a.top < b.bottom + 6 && b.top < a.bottom + 6;
}

/** One local union per concrete pair occurrence, without adding genealogical people. */
export function planFamilyChartPartnershipNodes({ partnerships, cardPositions, references = [], orientation = 'vertical' }) {
  const horizontal = orientation === 'horizontal';
  const generation = horizontal ? 'x' : 'y';
  const halfCard = FAMILY_CHART_CARD_LAYOUT[horizontal ? 'width' : 'height'] / 2;
  const halfLabel = PARTNERSHIP_NODE_SIZE[horizontal ? 'width' : 'height'] / 2;
  const occupied = references.flatMap(reference => reference.badges.map(badge => rectangle(badge.center, 284, 28)));
  const seen = new Set();
  const nodes = [];
  for (const pair of [...(partnerships || [])].sort((a, b) => familyChartPairKey([a.firstId, a.secondId]).localeCompare(familyChartPairKey([b.firstId, b.secondId])))) {
    if (pair.hidden || !pair.first || !pair.second || pair.firstId === pair.secondId) continue;
    if (findFamilyChartConnectionReference(references, [pair.firstId, pair.secondId], [pair.first, pair.second])) continue;
    const key = [pair.firstId, pair.first.x, pair.first.y, pair.secondId, pair.second.x, pair.second.y].join('|');
    const reverseKey = [pair.secondId, pair.second.x, pair.second.y, pair.firstId, pair.first.x, pair.first.y].join('|');
    if (seen.has(key) || seen.has(reverseKey)) continue;
    seen.add(key);
    const row = Math.max(pair.first[generation], pair.second[generation]);
    // Partners on different generation rows retain their routed connection.
    // A label on that route must not pretend they form a same-row couple.
    if (Math.abs(pair.first[generation] - pair.second[generation]) > 1) continue;
    const center = { x: (pair.first.x + pair.second.x) / 2, y: (pair.first.y + pair.second.y) / 2 };
    center[generation] = row + halfCard + PARTNERSHIP_NODE_SIZE.gap + halfLabel;
    const cardObstacles = [...cardPositions.values()].filter(point => point[generation] <= row + 1)
      .map(point => cardRectangle(point));
    while ([...occupied, ...cardObstacles].some(other => overlaps(rectangle(center, PARTNERSHIP_NODE_SIZE.width, PARTNERSHIP_NODE_SIZE.height), other))) {
      center[generation] += 2 * halfLabel + PARTNERSHIP_NODE_SIZE.gap;
    }
    occupied.push(rectangle(center, PARTNERSHIP_NODE_SIZE.width, PARTNERSHIP_NODE_SIZE.height));
    const edge = point => ({ ...point, [generation]: point[generation] + halfCard });
    const route = [edge(pair.first), { ...edge(pair.first), [generation]: center[generation] }, { ...edge(pair.second), [generation]: center[generation] }, edge(pair.second)];
    nodes.push(Object.freeze({ ...pair, pairKey: familyChartPairKey([pair.firstId, pair.secondId]), center, exit: { ...center, [generation]: center[generation] + halfLabel }, route, row }));
  }
  return Object.freeze(nodes);
}

export function clearFamilyChartPartnershipNodes(container) {
  container.querySelectorAll('.aleria-partnership-node').forEach(element => element.remove());
}

export function renderFamilyChartPartnershipNodes(container, nodes) {
  clearFamilyChartPartnershipNodes(container);
  const cards = container.querySelector('#htmlSvg .cards_view');
  if (!cards) return;
  nodes.forEach(node => {
    const button = container.ownerDocument.createElement('button');
    const presentation = presentPartnership(node);
    button.type = 'button';
    button.className = 'aleria-partnership-node';
    button.dataset.action = 'open-relationship-reference';
    button.dataset.personId = node.firstId;
    button.dataset.partnershipId = node.partnershipId || '';
    button.dataset.relatedCardIds = [node.firstId, node.secondId].join(',');
    button.style.transform = `translate(${node.center.x}px, ${node.center.y}px) translate(-50%, -50%)`;
    button.style.setProperty('--reference-color', node.color || '#326c4a');
    const label = container.ownerDocument.createElement('strong');
    label.textContent = presentation.label;
    const detail = container.ownerDocument.createElement('span');
    detail.textContent = [presentation.period, presentation.status].filter(Boolean).join(' · ');
    button.append(label, detail);
    button.title = `${presentation.label}: ${node.firstName || node.firstId} & ${node.secondName || node.secondId}. ${detail.textContent}. Beziehungen öffnen.`;
    button.setAttribute('aria-label', button.title);
    cards.appendChild(button);
  });
}
