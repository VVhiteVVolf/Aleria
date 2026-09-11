// A per-map browser preference; does not change or publish the map draft.
(function () {
  const checkbox = document.querySelector('[data-role="show-view-markers"]');
  const layer = window.KartoRuntime?.pinLayer();
  if (!checkbox || !layer) return;
  const key = `karto.view-markers.${window.KARTO_CONFIG?.mapId || 'template-map'}`;
  try { checkbox.checked = localStorage.getItem(key) === 'true'; } catch { /* Default: hidden. */ }

  function render() { layer.classList.toggle('show-view-markers', checkbox.checked); }
  checkbox.addEventListener('change', () => {
    render();
    try { localStorage.setItem(key, String(checkbox.checked)); } catch { /* Still works for this visit. */ }
  });
  render();
})();
