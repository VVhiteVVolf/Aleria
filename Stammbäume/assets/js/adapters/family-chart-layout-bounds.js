import { FAMILY_CHART_CARD_LAYOUT } from './family-chart-card-renderer.js';

/** Family Chart measures before Aleria's layout passes; fit needs the final extents. */
export function updateFamilyChartLayoutBounds(tree, padding = 64) {
  const nodes = (tree?.data || []).filter(node => (
    Number.isFinite(node.x) && Number.isFinite(node.y)
    && node.data?.data?.aleria?.virtualType !== 'overview-root'
  ));
  if (!nodes.length) return null;
  const left = Math.min(...nodes.map(node => node.x)) - FAMILY_CHART_CARD_LAYOUT.width / 2 - padding;
  const right = Math.max(...nodes.map(node => node.x)) + FAMILY_CHART_CARD_LAYOUT.width / 2 + padding;
  const top = Math.min(...nodes.map(node => node.y)) - FAMILY_CHART_CARD_LAYOUT.height / 2 - padding;
  const bottom = Math.max(...nodes.map(node => node.y)) + FAMILY_CHART_CARD_LAYOUT.height / 2 + padding;
  // getTree() returns a shallow wrapper in Family Chart 0.9. Preserve the
  // shared dimension object so the subsequent library fit sees this update.
  Object.assign(tree.dim || (tree.dim = {}), { width: right - left, height: bottom - top, x_off: -left, y_off: -top });
  return Object.freeze({ ...tree.dim });
}
