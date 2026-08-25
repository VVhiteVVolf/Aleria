const CADET_NODE_PREFIX = '__cadet-';

function nodeId(node) {
  return String(node?.data?.id || node?.id || '');
}

function nodeRelationIds(node, relationName) {
  const values = node?.data?.rels?.[relationName];
  return Array.isArray(values) ? values.filter(Boolean) : [];
}

/**
 * Returns the concrete rendered relationship block belonging to a cadet or
 * married-away house knot. This deliberately works with rendered node IDs,
 * not canonical person IDs: an internally married person can have more than
 * one card and only the occurrence attached to this knot may be moved.
 */
export function familyChartCadetRelationshipBlock(nodes, family, houseNodeId) {
  if (!String(houseNodeId || '').startsWith(CADET_NODE_PREFIX)) return Object.freeze([]);
  const branchId = String(houseNodeId).slice(CADET_NODE_PREFIX.length);
  const branch = (family?.cadetBranches || []).find(candidate => candidate.id === branchId);
  if (!branch?.parentPartnershipId) return Object.freeze([]);

  const houseNode = (nodes || []).find(node => nodeId(node) === houseNodeId);
  const partnership = (family?.partnerships || [])
    .find(candidate => candidate.id === branch.parentPartnershipId);
  const configuredParentIds = houseNode?.data?.data?.aleria?.relationshipParentIds;
  const renderedParentIds = Array.isArray(configuredParentIds)
    ? configuredParentIds.filter(Boolean)
    : nodeRelationIds(houseNode, 'parents');
  const parentIds = renderedParentIds.length >= 2
    ? renderedParentIds
    : (partnership?.participantIds || []).filter(Boolean);
  if (!houseNode || parentIds.length < 2) return Object.freeze([]);

  const includedIds = new Set([...parentIds, houseNodeId]);
  let changed = true;
  while (changed) {
    changed = false;
    (nodes || []).forEach(node => {
      const id = nodeId(node);
      if (!id || includedIds.has(id)) return;
      const parents = nodeRelationIds(node, 'parents');
      const spouses = nodeRelationIds(node, 'spouses');
      if (
        parents.some(parentId => includedIds.has(parentId))
        || spouses.some(spouseId => includedIds.has(spouseId))
      ) {
        includedIds.add(id);
        changed = true;
      }
    });
  }

  return Object.freeze((nodes || []).filter(node => includedIds.has(nodeId(node))));
}
