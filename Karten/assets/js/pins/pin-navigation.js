// Shared navigation for search results and embedded place links.
(function () {
  const runtime = window.KartoRuntime;

  function focus(id) {
    const pin = runtime.visiblePins().find(item => item.id === id);
    if (!pin) return false;

    if (runtime.activeFilter() !== 'all' && runtime.activeFilter() !== pin.cat) {
      window.setFilter('all');
    }
    window.activateLayer('pins');
    const image = runtime.mapImageSize();
    if (image.width && image.height) {
      const viewport = runtime.mapViewportSize();
      const { z } = runtime.mapTransform();
      runtime.setMapTransform(viewport.width / 2 - pin.x * image.width * z,
        viewport.height / 2 - pin.y * image.height * z, z);
    }
    for (const element of runtime.pinLayer().children) {
      element.classList.toggle('navigation-target', element.dataset.id === id);
    }
    return true;
  }

  window.KartoPinNavigation = { focus };
})();
