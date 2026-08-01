import { toLeafletLatLng } from '../core/coordinate-system.js';
import { fitToMapImage } from './create-map.js';

/**
 * Camera controls shared by the toolbar (reset/fullscreen buttons) and
 * deep-link handling (jump to a specific feature/coordinate on load).
 */
export function createMapNavigation({ map, mapDefinition, container }) {
  function resetView() {
    fitToMapImage(map, mapDefinition);
  }

  function centerOnMapPoint(point, zoom) {
    const latLng = toLeafletLatLng(mapDefinition, point);
    map.setView(latLng, zoom ?? map.getZoom(), { animate: true });
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      container.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  }

  function invalidateSize() {
    map.invalidateSize();
  }

  return { resetView, centerOnMapPoint, toggleFullscreen, invalidateSize };
}
