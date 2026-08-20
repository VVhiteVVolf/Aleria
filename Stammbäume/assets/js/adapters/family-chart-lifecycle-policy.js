const FULL_FAMILY_REPLACEMENT_EVENTS = new Set([
  'family-replaced',
  'family-synchronized'
]);

/**
 * Family Chart 0.9.0 can update records inside an existing topology, but its
 * internal D3 joins are not safe when a complete family snapshot replaces the
 * graph (for example after the asynchronous GitHub/project reconciliation).
 * Rebuilding only for explicit full-snapshot events keeps ordinary editor
 * mutations fast while avoiding stale virtual nodes and broken link joins.
 */
export function requiresFamilyChartRebuild(event) {
  return event?.affectsFamily === true
    && FULL_FAMILY_REPLACEMENT_EVENTS.has(String(event.type || ''));
}
