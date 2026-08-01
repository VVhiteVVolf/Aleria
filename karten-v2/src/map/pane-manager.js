// Centralised Leaflet pane z-index order. Every overlay type gets its own
// pane so stacking order is a single declarative list instead of scattered
// z-index tweaks, and decorative panes can be made click-through.
import L from 'leaflet';

/** Pane name -> z-index, low to high. Mirrors the layering the spec asks for. */
export const PANE_ORDER = [
  'base-map-pane',
  'terrain-overlay-pane',
  'region-pane',
  'border-pane',
  'route-pane',
  'marker-pane',
  'label-pane',
  'selection-pane',
  'editor-pane',
];

const CLICK_THROUGH_PANES = new Set(['terrain-overlay-pane', 'region-pane', 'border-pane', 'label-pane']);

/**
 * Create every named pane on the map with a strictly increasing z-index,
 * and make purely decorative panes non-interactive so they never block
 * clicks on markers underneath.
 * @param {L.Map} map
 */
export function createPanes(map) {
  PANE_ORDER.forEach((name, index) => {
    const pane = map.createPane(name);
    pane.style.zIndex = String(400 + index * 10);
    if (CLICK_THROUGH_PANES.has(name)) {
      pane.style.pointerEvents = 'none';
    }
  });
}
