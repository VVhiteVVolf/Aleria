// Shared selection semantics for alternative, ranked trait expressions.
export function effectiveGroupedTraits(entries = [], getOrigin) {
  const active = entries.filter(entry => entry.active !== false);
  const strongest = new Map();
  for (const entry of active) {
    const origin = getOrigin(entry);
    if (origin?.exclusiveGroup && (!strongest.has(origin.exclusiveGroup)
      || origin.rank > getOrigin(strongest.get(origin.exclusiveGroup)).rank)) strongest.set(origin.exclusiveGroup, entry);
  }
  return active.filter(entry => {
    const origin = getOrigin(entry);
    return !origin?.exclusiveGroup || strongest.get(origin.exclusiveGroup) === entry;
  });
}
export function selectGroupedTrait(ids = [], id, getOrigin) {
  const origin = getOrigin(id);
  return [...ids.filter(value => value !== id && (!origin?.exclusiveGroup || getOrigin(value)?.exclusiveGroup !== origin.exclusiveGroup)), id];
}
export function conflictingTraitGroups(entries = [], getOrigin) {
  const groups = new Map();
  for (const entry of entries) {
    const origin = getOrigin(entry);
    if (origin?.exclusiveGroup) groups.set(origin.exclusiveGroup, [...(groups.get(origin.exclusiveGroup) || []), entry]);
  }
  return [...groups.values()].filter(group => group.length > 1);
}
