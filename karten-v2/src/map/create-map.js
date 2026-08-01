import L from 'leaflet';
import { createPanes } from './pane-manager.js';
import { mapImageBounds } from '../core/coordinate-system.js';
import { addDistanceScaleControl } from './distance-scale-control.js';

/**
 * Create a Leaflet map configured for a non-geographic, pixel-based
 * fantasy map image under L.CRS.Simple.
 * @param {HTMLElement} container
 * @param {import('../data/schema.js').MapDefinition} mapDefinition
 * @returns {L.Map}
 */
export function createLeafletMap(container, mapDefinition) {
  const map = L.map(container, {
    crs: L.CRS.Simple,
    minZoom: mapDefinition.minZoom ?? -4,
    maxZoom: mapDefinition.maxZoom ?? 4,
    zoomSnap: mapDefinition.zoomSnap ?? 0.25,
    zoomDelta: 0.5,
    wheelPxPerZoomLevel: 120,
    attributionControl: false,
    zoomControl: false,
    fadeAnimation: false,
  });

  createPanes(map);

  if (mapDefinition.image && mapDefinition.width && mapDefinition.height) {
    const bounds = mapImageBounds(mapDefinition);
    map.setMaxBounds(bounds);
    map.options.maxBoundsViscosity = 0.6;
  }

  L.control.zoom({ position: 'bottomright' }).addTo(map);
  addDistanceScaleControl(map, mapDefinition);

  return map;
}

/**
 * Fit the view to show the whole map image, or fall back to a neutral
 * view for maps that don't have an image yet.
 * @param {L.Map} map
 * @param {import('../data/schema.js').MapDefinition} mapDefinition
 */
export function fitToMapImage(map, mapDefinition) {
  if (mapDefinition.image && mapDefinition.width && mapDefinition.height) {
    const bounds = mapImageBounds(mapDefinition);
    map.fitBounds(bounds, { padding: [16, 16] });
  } else {
    map.setView([0, 0], mapDefinition.minZoom ?? -4);
  }
}
