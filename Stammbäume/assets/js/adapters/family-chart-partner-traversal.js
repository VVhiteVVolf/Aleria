import { FAMILY_CHART_CARD_LAYOUT } from './family-chart-card-renderer.js';

function partnershipKey(firstId, secondId) {
  return [firstId, secondId].sort().join('\u001f');
}

function adjacentCoordinate(tree, anchor, crossAxis, generationAxis, spacing) {
  const previousPartner = anchor.spouse;
  const preferredDirection = previousPartner && previousPartner[crossAxis] > anchor[crossAxis] ? -1 : 1;
  const occupied = tree.data.filter(node => Math.abs(node[generationAxis] - anchor[generationAxis]) < 1);
  // There are finitely many occupied slots. Prefer the outside of the current
  // couple, then the nearest free slot; never move a partner to another generation.
  for (let distance = 1; distance <= occupied.length + 1; distance += 1) {
    for (const direction of [preferredDirection, -preferredDirection]) {
      const coordinate = anchor[crossAxis] + direction * distance * spacing;
      if (occupied.every(node => Math.abs(node[crossAxis] - coordinate) >= spacing - 1)) return coordinate;
    }
  }
  return anchor[crossAxis];
}

/**
 * Family Chart adds spouses after its descendant traversal, so a spouse's
 * further partner can be absent. Complete those real edges on the render tree,
 * retaining one card per already visible identity and the anchor's generation.
 * The persisted family and the library's parent/child hierarchy are untouched.
 */
export function completeFamilyChartPartnerTraversal({ tree, data = [], orientation = 'vertical' }) {
  if (!tree?.data?.length) return Object.freeze([]);
  const sourceById = new Map(data.map(node => [node.id, node]));
  const visibleById = new Map(tree.data.map(node => [node.data.id, node]));
  const renderedEdges = new Set();
  for (const node of tree.data) {
    for (const partner of [...(node.spouses || []), ...(node.coparent ? [node.coparent] : [])]) {
      renderedEdges.add(partnershipKey(node.data.id, partner.data.id));
    }
  }
  const crossAxis = orientation === 'horizontal' ? 'y' : 'x';
  const generationAxis = orientation === 'horizontal' ? 'x' : 'y';
  const spacing = orientation === 'horizontal'
    ? FAMILY_CHART_CARD_LAYOUT.verticalSpacing : FAMILY_CHART_CARD_LAYOUT.horizontalSpacing;
  const additions = [];
  // Appending to this finite queue also covers partner chains, without following
  // the anchor's back edge or generating duplicate cards in partnership cycles.
  for (const anchor of tree.data) {
    for (const partnerId of anchor.data.rels.spouses || []) {
      const source = sourceById.get(partnerId);
      if (!source) continue;
      const edgeKey = partnershipKey(anchor.data.id, partnerId);
      if (visibleById.has(partnerId)) {
        // A partnership cycle can reach an existing card through another edge.
        // Add its missing real line without replacing either card's native anchor.
        if (!renderedEdges.has(edgeKey)) (anchor.spouses ||= []).push(visibleById.get(partnerId));
        renderedEdges.add(edgeKey);
        continue;
      }
      const coordinate = adjacentCoordinate(tree, anchor, crossAxis, generationAxis, spacing);
      const partner = {
        data: source, added: true, depth: anchor.depth, spouse: anchor,
        x: anchor.x, y: anchor.y, tid: source.id,
        sx: (anchor[crossAxis] + coordinate) / 2, sy: anchor[generationAxis]
      };
      partner[crossAxis] = coordinate;
      (anchor.spouses ||= []).push(partner);
      tree.data.push(partner);
      visibleById.set(partnerId, partner);
      renderedEdges.add(edgeKey);
      additions.push(Object.freeze({ personId: source.id, anchorPersonId: anchor.data.id, generation: anchor[generationAxis] }));
    }
  }
  for (const node of tree.data) {
    node.all_rels_displayed = Object.values(node.data.rels || {}).flat().filter(Boolean)
      .every(id => visibleById.has(id));
  }
  return Object.freeze(additions);
}
