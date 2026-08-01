import L from 'leaflet';
import { toLeafletLatLng } from '../core/coordinate-system.js';

function coordsToLatLngs(mapDefinition, coordinates) {
  return coordinates.map(([x, y]) => {
    const { lat, lng } = toLeafletLatLng(mapDefinition, { x, y });
    return [lat, lng];
  });
}

/**
 * Owns rendering of region (Polygon) and route (LineString) features for
 * the currently open map.
 */
export function createGeometryRenderer({ map, mapDefinition, eventBus, regionPane, routePane }) {
  const regionLayer = L.layerGroup([], { pane: regionPane }).addTo(map);
  const routeLayer = L.layerGroup([], { pane: routePane }).addTo(map);
  const layersByFeatureId = new Map();

  function renderRegions(features) {
    regionLayer.clearLayers();
    for (const feature of features) {
      if (feature.mapId !== mapDefinition.id || feature.geometry?.type !== 'Polygon') continue;
      const rings = feature.geometry.coordinates.map((ring) => coordsToLatLngs(mapDefinition, ring));
      const polygon = L.polygon(rings, {
        pane: regionPane,
        color: feature.color || '#8a6510',
        weight: 2,
        fillOpacity: 0.15,
      });
      polygon.featureId = feature.id;
      polygon.on('click', () => eventBus.emit('feature:select', { id: feature.id }));
      polygon.addTo(regionLayer);
      layersByFeatureId.set(feature.id, polygon);
    }
  }

  function renderRoutes(features) {
    routeLayer.clearLayers();
    for (const feature of features) {
      if (feature.mapId !== mapDefinition.id || feature.geometry?.type !== 'LineString') continue;
      const latLngs = coordsToLatLngs(mapDefinition, feature.geometry.coordinates);
      const polyline = L.polyline(latLngs, {
        pane: routePane,
        color: feature.color || '#3d2008',
        weight: 3,
        dashArray: feature.routeType === 'trade' ? '6 6' : null,
      });
      polyline.featureId = feature.id;
      polyline.on('click', () => eventBus.emit('feature:select', { id: feature.id }));
      polyline.addTo(routeLayer);
      layersByFeatureId.set(feature.id, polyline);
    }
  }

  return { regionLayer, routeLayer, renderRegions, renderRoutes, layersByFeatureId };
}
