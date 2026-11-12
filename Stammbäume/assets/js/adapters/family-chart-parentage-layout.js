// Family Chart discovers the second parent through its layout "spouses" edge.
// A confirmed two-parent ancestry does not itself prove a partnership. This
// explicit chart policy groups the cards and marks their shared parent rail;
// it must not create a partnership label or relationship reference.
export function applyUnpartneredParentLayoutPairs({ parentages, chartById, pairMetadata, pairKey, resolvePersonId, parentageColor }) {
  const selectedByChild = new Map(parentages.map(parentage => [parentage.childId, parentage]));
  const ancestorOf = (ancestorId, personId, seen = new Set()) => {
    if (seen.has(personId)) return false;
    seen.add(personId);
    return (selectedByChild.get(personId)?.parentIds || []).some(parentId => (
      parentId === ancestorId || ancestorOf(ancestorId, parentId, seen)
    ));
  };
  const diagnostics = [];
  for (const parentage of parentages) {
    if (parentage.extensions?.chartPairParentsWithoutPartnership !== true) continue;
    const ids = parentage.parentIds.map(id => resolvePersonId(id, parentage.partnershipId));
    if (parentage.partnershipId || ids.length !== 2 || ids[0] === ids[1]
      || ids.some(id => !chartById.has(id))
      || ancestorOf(parentage.parentIds[0], parentage.parentIds[1])
      || ancestorOf(parentage.parentIds[1], parentage.parentIds[0])) {
      diagnostics.push(Object.freeze({ severity: 'warning', code: 'INVALID_UNPARTNERED_PARENT_LAYOUT',
        message: 'Die reine Elternkartenpaarung benötigt zwei verschiedene, nicht voneinander abstammende Eltern ohne Herkunftspartnerschaft.',
        details: Object.freeze({ parentageId: parentage.id }) }));
      continue;
    }
    const key = pairKey(...ids);
    // A real partnership keeps its own metadata and presentation.
    if (pairMetadata.has(key)) continue;
    const [first, second] = ids.map(id => chartById.get(id));
    if (!first.rels.spouses.includes(ids[1])) first.rels.spouses.push(ids[1]);
    if (!second.rels.spouses.includes(ids[0])) second.rels.spouses.push(ids[0]);
    pairMetadata.set(key, Object.freeze({ type: parentage.type, hidden: false, layoutOnly: true,
      color: parentageColor(parentage.type), partnershipId: '' }));
  }
  return diagnostics;
}
