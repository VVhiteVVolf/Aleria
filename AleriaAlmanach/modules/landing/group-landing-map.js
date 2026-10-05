export function mountGroupMap(root) {
  const abort = new AbortController();
  function loadVisibleMap() {
    if (root.dataset.groupActiveTab !== 'map') return;
    const frame = root.querySelector('[data-landing-map-src]');
    if (frame && frame.src.endsWith('about:blank')) frame.src = frame.dataset.landingMapSrc;
  }
  root.addEventListener('aleria:group-tab-changed', loadVisibleMap, { signal: abort.signal });
  loadVisibleMap();
  return () => abort.abort();
}
