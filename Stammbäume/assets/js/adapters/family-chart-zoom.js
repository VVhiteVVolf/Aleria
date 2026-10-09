/** Isolates the viewport bridge to Family Chart 0.9; it never changes the root. */
export function changeFamilyChartZoom(container, runtime, factor) {
  const canvas = container.querySelector('#f3Canvas');
  const zoom = canvas?.__zoomObj;
  const d3 = runtime?.d3;
  if (!zoom || !d3?.select || !Number.isFinite(factor) || factor <= 0) return false;
  const current = d3.zoomTransform(canvas).k;
  const target = Math.max(0.025, Math.min(2.5, current * factor));
  d3.select(canvas).interrupt().call(zoom.scaleBy, target / current);
  return true;
}
