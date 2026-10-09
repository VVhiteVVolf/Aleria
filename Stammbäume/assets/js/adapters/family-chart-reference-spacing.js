import { FAMILY_CHART_CARD_LAYOUT } from './family-chart-card-renderer.js';
import { familyChartPairKey, planFamilyChartConnectionReferences } from './family-chart-connection-references.js';
import { planFamilyChartPartnershipNodes } from './family-chart-partnership-nodes.js';
import { cardRectangle } from './family-chart-collision-geometry.js';

function nodeId(node) {
  return node?.data?.id || '';
}

function displayedPartnerships(nodes, family) {
  const nativePairs = new Map();
  nodes.forEach(node => {
    [...(node.spouses || []), node.coparent].filter(Boolean).forEach(partner => {
      const key = familyChartPairKey([nodeId(node), nodeId(partner)]);
      if (!nativePairs.has(key)) nativePairs.set(key, []);
      nativePairs.get(key).push([node, partner]);
    });
  });
  return (family?.partnerships || []).flatMap(partnership => {
    const ids = partnership.participantIds || [];
    if (ids.length !== 2) return [];
    const pairs = nativePairs.get(familyChartPairKey(ids)) || [[
      nodes.find(node => nodeId(node) === ids[0]),
      nodes.find(node => nodeId(node) === ids[1])
    ]];
    return pairs.filter(pair => pair.every(Boolean)).map(([first, second]) => ({
      firstId: nodeId(first), secondId: nodeId(second), first, second,
      ...partnership, type: partnership.type
    }));
  });
}

/** Reserve a generation gap only where several named references need it. */
export function applyFamilyChartReferenceSpacing({ tree, family, orientation = 'vertical' }) {
  const nodes = (tree?.data || []).filter(node => Number.isFinite(node.x) && Number.isFinite(node.y));
  const generation = orientation === 'horizontal' ? 'x' : 'y';
  const halfCard = FAMILY_CHART_CARD_LAYOUT[orientation === 'horizontal' ? 'width' : 'height'] / 2;
  const cardPositions = new Map(nodes.map(node => [nodeId(node), node]));
  const partnerships = displayedPartnerships(nodes, family);
  const references = planFamilyChartConnectionReferences({
    partnerships, cardPositions, orientation
  });
  const unions = planFamilyChartPartnershipNodes({ partnerships, cardPositions, references, orientation });
  const rows = [...new Set(nodes.map(node => node[generation]))].sort((a, b) => a - b);
  const reservations = [];
  for (const row of rows) {
    const nextRow = rows.find(value => value > row);
    if (nextRow === undefined) continue;
    const badgeBottom = Math.max(row, ...references.flatMap(reference => reference.badges)
      .filter(badge => Math.abs(badge.cardEdge.y - FAMILY_CHART_CARD_LAYOUT.height / 2 - row) < 1)
      .map(badge => badge.exit[generation]), ...unions.filter(union => Math.abs(union.row - row) < 1).map(union => union.exit[generation]));
    const nextRowExtent = Math.max(halfCard, ...nodes.filter(node => node[generation] === nextRow).map(node => (
      nextRow - cardRectangle(node)[generation === 'x' ? 'left' : 'top']
    )));
    const delta = Math.max(0, badgeBottom + 32 + nextRowExtent - nextRow);
    if (delta > 0) reservations.push({ afterRow: row, delta });
  }
  nodes.forEach(node => {
    const delta = reservations.filter(reservation => node[generation] > reservation.afterRow)
      .reduce((sum, reservation) => sum + reservation.delta, 0);
    node[generation] += delta;
    const spouseAxis = generation === 'x' ? 'sx' : 'sy';
    if (Number.isFinite(node[spouseAxis])) node[spouseAxis] += delta;
  });
  return Object.freeze(reservations.map(Object.freeze));
}
