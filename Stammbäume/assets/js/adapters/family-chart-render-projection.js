function relationshipParentIds(entry) {
  const configured = entry?.data?.aleria?.relationshipParentIds;
  return Array.isArray(configured)
    ? configured.filter(Boolean).slice(0, 2)
    : [];
}

/**
 * Builds the graph handed to Family Chart without changing the canonical
 * adapter result. Family Chart 0.9.0 can materialise one virtual child twice
 * when its two semantic parents are not a native spouse pair. The custom link
 * renderer already owns that pair-to-house connection, so the library only
 * needs one structural anchor for the virtual node.
 *
 * Canonical `rels.parents` deliberately remains untouched. This projection is
 * a rendering concern and must never weaken the family record or exports.
 */
export function createFamilyChartRenderProjection(data) {
  const structuralAnchorByChildId = new Map();

  (data || []).forEach(entry => {
    const parentIds = relationshipParentIds(entry);
    if (parentIds.length === 2) structuralAnchorByChildId.set(entry.id, parentIds[0]);
  });

  if (!structuralAnchorByChildId.size) return data || [];

  return (data || []).map(entry => {
    const anchorParentId = structuralAnchorByChildId.get(entry.id);
    const rels = entry.rels || {};
    const parents = anchorParentId ? [anchorParentId] : [...(rels.parents || [])];
    const children = (rels.children || []).filter(childId => (
      !structuralAnchorByChildId.has(childId)
      || structuralAnchorByChildId.get(childId) === entry.id
    ));

    return {
      ...entry,
      rels: {
        ...rels,
        parents,
        children,
        spouses: [...(rels.spouses || [])]
      }
    };
  });
}
