// Isolates all Leaflet-Geoman-Free specifics (control toolbar config, which
// draw modes are enabled) so editor-controller.js only deals with feature
// objects, not Geoman API details. Only features confirmed to exist in the
// FREE version are enabled here: marker/line/polygon/rectangle drawing,
// edit (drag/reshape) and removal. No Pro-only options are referenced.
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';

const GEOMAN_LOCALE = {
  tooltips: {
    placeMarker: 'Klicken zum Platzieren',
    firstVertex: 'Ersten Punkt klicken',
    continueLine: 'Klicken um fortzufahren',
    finishLine: 'Letzten Punkt klicken oder Doppelklick zum Beenden',
    finishPoly: 'Erste Ecke erneut klicken zum Schliessen',
    finishRect: 'Klicken zum Platzieren',
  },
  actions: {
    finish: 'Fertig',
    cancel: 'Abbrechen',
    removeLastVertex: 'Letzten Punkt entfernen',
  },
  buttonTitles: {
    drawMarkerButton: 'Marker setzen',
    drawLineButton: 'Linie/Route zeichnen',
    drawPolyButton: 'Fläche zeichnen',
    drawRectButton: 'Rechteck zeichnen',
    editButton: 'Objekte bearbeiten',
    dragButton: 'Objekte verschieben',
    deleteButton: 'Objekte löschen',
  },
};

/**
 * Attach the Geoman toolbar to a map, restricted to the draw modes the
 * product spec asks for, and mark the given non-editable layers (the base
 * image overlays) so Geoman never tries to select/edit them.
 * @param {L.Map} map
 * @param {L.Layer[]} ignoredLayers
 */
export function initGeoman(map, ignoredLayers = []) {
  if (map.pm.__aleriaLocaleRegistered !== true) {
    map.pm.setLang('de-aleria', GEOMAN_LOCALE, 'de-aleria');
    map.pm.__aleriaLocaleRegistered = true;
  }

  for (const layer of ignoredLayers) {
    layer.pmIgnore = true;
    layer.options = layer.options || {};
    layer.options.pmIgnore = true;
  }

  map.pm.addControls({
    position: 'topleft',
    drawMarker: true,
    drawPolyline: true,
    drawPolygon: true,
    drawRectangle: true,
    drawCircle: false,
    drawCircleMarker: false,
    drawText: false,
    editMode: true,
    dragMode: true,
    cutPolygon: false,
    removalMode: true,
    rotateMode: false,
  });

  map.pm.setPathOptions({ color: '#8a6510', fillOpacity: 0.15 });
}

export function destroyGeoman(map) {
  map.pm.removeControls();
}

export function enableLayerEditing(layer) {
  layer.pm?.enable({ allowSelfIntersection: false });
}

export function disableLayerEditing(layer) {
  layer.pm?.disable();
}
