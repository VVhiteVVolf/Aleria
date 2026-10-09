import { FAMILY_CHART_CARD_LAYOUT } from './family-chart-card-renderer.js';
import { familyChartPairKey, planFamilyChartConnectionReferences } from './family-chart-connection-references.js';

function nodeId(node) {
  return node?.data?.id || '';
}

function personId(node) {
  return node?.data?.data?.aleria?.personId || nodeId(node);
}

function displayedPartnerships(nodes, family) {
  const nativePairs = new Map();
  nodes.forEach(node => {
    [...(node.spouses || []), node.coparent].filter(Boolean).forEach(partner => {
      const key = familyChartPairKey([personId(node), personId(partner)]);
      if (!nativePairs.has(key)) nativePairs.set(key, []);
      nativePairs.get(key).push([node, partner]);
    });
  });
  return (family?.partnerships || []).flatMap(partnership => {
    const ids = partnership.participantIds || [];
    if (ids.length !== 2) return [];
    const pairs = nativePairs.get(familyChartPairKey(ids)) || [[
      nodes.find(node => personId(node) === ids[0]),
      nodes.find(node => personId(node) === ids[1])
    ]];
    return pairs.filter(pair => pair.every(Boolean)).map(([first, second]) => ({
      firstId: nodeId(first), secondId: nodeId(second), first, second,
      type: partnership.type
    }));
  });
}

/** Reserve a generation gap only where several named references need it. */
export function applyFamilyChartReferenceSpacing({ tree, family, orientation = 'vertical' }) {
  if (orientation !== 'vertical') return Object.freeze([]);
  const nodes = (tree?.data || []).filter(node => Number.isFinite(node.x) && Number.isFinite(node.y));
  const references = planFamilyChartConnectionReferences({
    partnerships: displayedPartnerships(nodes, family),
    cardPositions: new Map(nodes.map(node => [nodeId(node), node]))
  });
  const rows = [...new Set(nodes.map(node => node.y))].sort((a, b) => a - b);
  const reservations = [];
  for (const row of rows) {
    const nextRow = rows.find(value => value > row);
    if (nextRow === undefined) continue;
    const badgeBottom = Math.max(row, ...references.flatMap(reference => reference.badges)
      .filter(badge => Math.abs(badge.cardEdge.y - FAMILY_CHART_CARD_LAYOUT.height / 2 - row) < 1)
      .map(badge => badge.exit.y));
    const delta = Math.max(0, badgeBottom + 16 + FAMILY_CHART_CARD_LAYOUT.height / 2 - nextRow);
    if (delta > 0) reservations.push({ afterRow: row, delta });
  }
  nodes.forEach(node => {
    const delta = reservations.filter(reservation => node.y > reservation.afterRow)
      .reduce((sum, reservation) => sum + reservation.delta, 0);
    node.y += delta;
    if (Number.isFinite(node.sy)) node.sy += delta;
  });
  return Object.freeze(reservations.map(Object.freeze));
}
