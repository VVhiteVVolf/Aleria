import L from 'leaflet';
import { toLeafletLatLng } from '../core/coordinate-system.js';

const DEFAULT_COLOR = '#8a6510';

function categoryFor(categories, categoryId) {
  return categories.find((category) => category.id === categoryId) || null;
}

/**
 * Build the divIcon for a point feature: a category-colored dot by default,
 * or the feature's/category's marker-catalog icon image when set - mirrors
 * the legacy module's category dot + optional pinMarker override.
 * @param {import('../data/schema.js').PointFeature} feature
 * @param {import('../data/schema.js').FeatureCategory|null} category
 * @param {number} dotSize
 */
function buildIcon(feature, category, dotSize) {
  const iconUrl = feature.iconId || category?.marker;
  const color = category?.color || DEFAULT_COLOR;
  if (iconUrl) {
    const size = dotSize * 1.6;
    return L.divIcon({
      className: 'karten-marker-icon karten-marker-icon--image',
      html: `<img src="${iconUrl}" alt="" loading="lazy" onerror="this.style.display='none'"/>`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size],
      tooltipAnchor: [0, -size * 0.9],
      popupAnchor: [0, -size],
    });
  }
  return L.divIcon({
    className: `karten-marker-icon karten-marker-icon--dot${feature.visibility === 'gm-only' || feature.visibility === 'hidden' ? ' karten-marker-icon--secret' : ''}`,
    html: `<span class="karten-marker-dot" style="--marker-color:${color}"></span>`,
    iconSize: [dotSize, dotSize],
    iconAnchor: [dotSize / 2, dotSize / 2],
    tooltipAnchor: [0, -dotSize * 0.7],
    popupAnchor: [0, -dotSize * 0.6],
  });
}

function tooltipHtml(feature, category) {
  const color = category?.color || DEFAULT_COLOR;
  const label = category?.label || 'Ohne Kategorie';
  return `
    <div class="karten-tooltip">
      <div class="karten-tooltip__title">${escapeHtml(feature.name)}</div>
      <div class="karten-tooltip__cat"><span class="karten-tooltip__dot" style="background:${color}"></span>${escapeHtml(label)}</div>
    </div>`;
}

function escapeHtml(value) {
  return String(value || '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

/**
 * Owns the Leaflet layer group of point-feature markers for the currently
 * open map: creating, updating and removing them as the feature list
 * changes, and translating clicks into event-bus notifications instead of
 * baking UI logic into this module.
 */
export function createMarkerRenderer({ map, pane, eventBus, categories, mapDefinition, dotSize = 18 }) {
  const layerGroup = L.layerGroup([], { pane }).addTo(map);
  const markersByFeatureId = new Map();

  function render(features) {
    layerGroup.clearLayers();
    markersByFeatureId.clear();
    for (const feature of features) {
      if (feature.mapId !== mapDefinition.id) continue;
      if (feature.geometry?.type !== 'Point') continue;
      const [x, y] = feature.geometry.coordinates;
      const latLng = toLeafletLatLng(mapDefinition, { x, y });
      const category = categoryFor(categories, feature.categoryId);
      const marker = L.marker(latLng, {
        icon: buildIcon(feature, category, dotSize),
        pane,
        title: feature.name,
        keyboard: true,
      });
      marker.bindTooltip(tooltipHtml(feature, category), {
        direction: 'top',
        opacity: 0.96,
        className: 'karten-tooltip-wrap',
      });
      marker.on('click', () => eventBus.emit('feature:select', { id: feature.id }));
      marker.featureId = feature.id;
      marker.addTo(layerGroup);
      markersByFeatureId.set(feature.id, marker);
    }
  }

  function setDotSize(nextSize) {
    dotSize = nextSize;
  }

  function highlight(featureId) {
    for (const [id, marker] of markersByFeatureId) {
      marker.getElement()?.classList.toggle('karten-marker--active', id === featureId);
    }
  }

  function panToFeature(featureId) {
    const marker = markersByFeatureId.get(featureId);
    if (marker) {
      map.panTo(marker.getLatLng(), { animate: true });
      marker.openTooltip();
    }
  }

  return { layerGroup, render, setDotSize, highlight, panToFeature, markersByFeatureId };
}
