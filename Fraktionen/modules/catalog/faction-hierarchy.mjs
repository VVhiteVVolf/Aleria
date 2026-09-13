/** Build the display tree from existing parent links, retaining each group's order. */
export function buildFactionHierarchy(category) {
  const ids = new Set(category.entries.map(entry => entry.id));
  const childrenByParent = new Map();
  for (const entry of category.entries) {
    const parentId = ids.has(entry.parentId) ? entry.parentId : null;
    if (!childrenByParent.has(parentId)) childrenByParent.set(parentId, new Map());
    const groups = childrenByParent.get(parentId);
    if (!groups.has(entry.groupId)) groups.set(entry.groupId, []);
    groups.get(entry.groupId).push(entry);
  }

  function buildGroups(ownerId) {
    const groups = childrenByParent.get(ownerId);
    if (!groups) return [];
    return category.groups.filter(group => groups.has(group.id)).map(group => {
      const nodes = groups.get(group.id).map(entry => {
        const children = buildGroups(entry.id);
        return {
          entry, groups: children,
          directChildCount: children.reduce((sum, child) => sum + child.nodes.length, 0),
          size: 1 + children.reduce((sum, child) => sum + child.size, 0),
        };
      });
      return { ...group, ownerId, nodes, size: nodes.reduce((sum, node) => sum + node.size, 0) };
    });
  }

  return buildGroups(null);
}
