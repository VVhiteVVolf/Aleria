import L from 'leaflet';

// Leaflet's built-in L.Control.Scale always labels its bar "m"/"km"/"mi" -
// wrong for a fantasy map with a per-map unitsPerPixel/unitName (see
// docs/DATA_SCHEMA.md and Aufgabenstellung Abschnitt 21). This is the same
// "round to a nice number" approach as the built-in control, but converts
// CRS.Simple pixel-units through the map's own unitsPerPixel/unitName
// instead of assuming metres.
const ScaleControl = L.Control.extend({
  options: { position: 'bottomleft', maxWidth: 100 },

  onAdd(map) {
    this._map = map;
    const container = L.DomUtil.create('div', 'karten-scale-control');
    this._bar = L.DomUtil.create('div', 'karten-scale-control__bar', container);
    this._label = L.DomUtil.create('div', 'karten-scale-control__label', container);
    map.on('move zoomend load', this._update, this);
    this._update();
    return container;
  },

  onRemove(map) {
    map.off('move zoomend load', this._update, this);
  },

  _update() {
    const map = this._map;
    // The map has no center/zoom yet on the very first onAdd (that happens
    // before create-map.js's caller calls fitBounds/setView) - Leaflet
    // throws on any pixel<->latlng conversion until then. The 'load'
    // listener above re-triggers this once a view exists.
    if (!map._loaded) return;
    const centerY = map.getSize().y / 2;
    const maxMeters = map.distance(map.containerPointToLatLng([0, centerY]), map.containerPointToLatLng([this.options.maxWidth, centerY]));
    this._updateBar(maxMeters);
  },

  _updateBar(maxCrsDistance) {
    const realDistance = maxCrsDistance * (this._map.__unitsPerPixel ?? 1);
    const nice = niceRoundNumber(realDistance);
    const ratio = nice / realDistance;
    this._bar.style.width = `${Math.round(this.options.maxWidth * ratio)}px`;
    this._label.textContent = `${formatNumber(nice)} ${this._map.__unitName || ''}`;
  },
});

function niceRoundNumber(value) {
  const pow10 = 10 ** Math.floor(Math.log10(value || 1));
  const fraction = value / pow10;
  const nice = fraction >= 5 ? 5 : fraction >= 2 ? 2 : 1;
  return nice * pow10;
}

function formatNumber(value) {
  return value >= 1 ? value.toLocaleString('de-DE') : value.toString();
}

/**
 * @param {L.Map} map
 * @param {import('../data/schema.js').MapDefinition} mapDefinition
 */
export function addDistanceScaleControl(map, mapDefinition) {
  map.__unitsPerPixel = mapDefinition.unitsPerPixel ?? 1;
  map.__unitName = mapDefinition.unitName ?? '';
  new ScaleControl().addTo(map);
}
