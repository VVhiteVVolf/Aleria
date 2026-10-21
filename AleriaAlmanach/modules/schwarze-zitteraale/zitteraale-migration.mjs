// Explicitly retire every pre-overhaul page, including the legacy pages that
// v1 appended by mistake. Keep edits to the nine new, stably keyed pages.
// After this one-time cleanup the editor owns later changes again.
export function upgradeZitteraaleEntry(entry, canonical) {
  if (entry?.id !== canonical.id || entry.zitteraaleRevision === canonical.zitteraaleRevision) return entry;
  const pages = canonical.pages.map(page => structuredClone(
    (entry.pages || []).find(existing => existing.commentThreadKey === page.commentThreadKey) || page
  ));
  return { ...entry, ...structuredClone(canonical), pages };
}
