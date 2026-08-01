// Central visibility switchboard for a map's layers - both raster
// image-overlay layers and the vector marker/region/route layer groups.
// UI components call toggle()/isVisible(); they never touch Leaflet layers
// directly.
export function createLayerManager({ map, layerDefinitions, imageOverlays, vectorLayersByLayerId }) {
  const visibility = new Map(layerDefinitions.map((layer) => [layer.id, layer.defaultVisible]));

  function isVisible(layerId) {
    return visibility.get(layerId) ?? false;
  }

  function applyVisibility(layerId) {
    const visible = isVisible(layerId);
    const imageLayer = imageOverlays.get(layerId);
    if (imageLayer) {
      if (visible && !map.hasLayer(imageLayer)) imageLayer.addTo(map);
      if (!visible && map.hasLayer(imageLayer)) map.removeLayer(imageLayer);
      return;
    }
    const vectorLayer = vectorLayersByLayerId?.get(layerId);
    if (vectorLayer) {
      vectorLayer.eachLayer?.((child) => {
        const element = child.getElement?.();
        if (element) element.style.display = visible ? '' : 'none';
      });
    }
  }

  function toggle(layerId, forceVisible) {
    const next = forceVisible ?? !isVisible(layerId);
    visibility.set(layerId, next);
    applyVisibility(layerId);
    return next;
  }

  function setAll() {
    for (const layer of layerDefinitions) applyVisibility(layer.id);
  }

  setAll();

  return { isVisible, toggle, layerDefinitions, reapply: setAll };
}
