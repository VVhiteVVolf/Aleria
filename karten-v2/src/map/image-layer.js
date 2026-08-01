import L from 'leaflet';
import { mapImageBounds } from '../core/coordinate-system.js';
import { assetUrl } from '../data/map-loader.js';

/**
 * Add every image-overlay LayerDefinition for a map as an L.imageOverlay,
 * placed in its declared pane so stacking order stays centrally controlled
 * (see pane-manager.js). Returns a Map<layerId, L.ImageOverlay> so
 * layer-manager.js can toggle visibility later.
 * @param {L.Map} map
 * @param {import('../data/schema.js').MapDefinition} mapDefinition
 * @param {import('../data/schema.js').LayerDefinition[]} layerDefinitions
 */
export function addImageOverlays(map, mapDefinition, layerDefinitions) {
  const overlays = new Map();
  if (!mapDefinition.image || !mapDefinition.width || !mapDefinition.height) {
    return overlays;
  }
  const bounds = mapImageBounds(mapDefinition);

  for (const layer of layerDefinitions) {
    if (layer.type !== 'image-overlay' || layer.mapId !== mapDefinition.id) continue;
    const overlay = L.imageOverlay(assetUrl(layer.image), bounds, {
      pane: layer.pane || 'base-map-pane',
      interactive: false,
      className: 'karten-image-overlay',
    });
    if (layer.defaultVisible) overlay.addTo(map);
    overlays.set(layer.id, overlay);
  }
  return overlays;
}
