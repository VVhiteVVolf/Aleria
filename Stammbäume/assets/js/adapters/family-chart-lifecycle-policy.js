const FULL_FAMILY_REPLACEMENT_EVENTS = new Set([
  'family-replaced',
  'family-synchronized'
]);

function changesPortrait(event) {
  return event?.type === 'person-updated'
    && event.details?.changedFields?.includes('portrait') === true;
}

/**
 * Family Chart 0.9.0 can update records inside an existing topology, but its
 * internal D3 joins are not safe when a complete family snapshot replaces the
 * graph (for example after the asynchronous GitHub/project reconciliation).
 * Rebuilding for explicit full-snapshot events and portrait changes keeps
 * ordinary editor mutations fast while avoiding stale virtual nodes and broken
 * link joins. Family Chart 0.9.0 can otherwise dereference an obsolete duplicate
 * node while its card image is replaced.
 */
export function requiresFamilyChartRebuild(event) {
  return event?.affectsFamily === true
    && (
      FULL_FAMILY_REPLACEMENT_EVENTS.has(String(event.type || ''))
      || changesPortrait(event)
    );
}
