import { generateId } from '../data/schema.js';
import { fromLeafletLatLng } from '../core/coordinate-system.js';
import { validatePointFeature } from '../core/validation.js';
import { saveDraft } from '../storage/draft-storage.js';
import { createUndoHistory } from './undo-history.js';
import { initGeoman, destroyGeoman, enableLayerEditing, disableLayerEditing } from './geometry-editor.js';

const SAVE_DEBOUNCE_MS = 800;

function ringToPolygonCoordinates(latLngs, mapDefinition) {
  const ring = latLngs.map((latLng) => {
    const { x, y } = fromLeafletLatLng(mapDefinition, latLng);
    return [x, y];
  });
  const first = ring[0];
  const last = ring[ring.length - 1];
  if (first && last && (first[0] !== last[0] || first[1] !== last[1])) {
    ring.push([first[0], first[1]]);
  }
  return [ring];
}

/**
 * Owns the editable feature store for the currently open map: entering/
 * leaving edit mode, wiring Geoman draw/edit/remove events into feature
 * CRUD, undo, and debounced local-draft persistence. UI (feature-form)
 * asks this controller to create/update/delete features; it never talks
 * to Leaflet/Geoman directly.
 */
export function createEditorController({
  map,
  mapDefinition,
  eventBus,
  imageOverlaysToIgnore,
  initialFeatures,
  onFeaturesChanged,
}) {
  const store = {
    pointFeatures: [...(initialFeatures.pointFeatures || [])],
    regionFeatures: [...(initialFeatures.regionFeatures || [])],
    routeFeatures: [...(initialFeatures.routeFeatures || [])],
  };
  const undoHistory = createUndoHistory();
  let editMode = false;
  let saveTimer = null;

  function snapshotForUndo() {
    return { pointFeatures: store.pointFeatures, regionFeatures: store.regionFeatures, routeFeatures: store.routeFeatures };
  }

  function scheduleSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      saveDraft(mapDefinition.id, {
        pointFeatures: store.pointFeatures,
        regionFeatures: store.regionFeatures,
        routeFeatures: store.routeFeatures,
      });
    }, SAVE_DEBOUNCE_MS);
  }

  function notifyChanged() {
    onFeaturesChanged({ ...store });
    scheduleSave();
  }

  function withUndo(mutate) {
    undoHistory.push(snapshotForUndo());
    mutate();
    notifyChanged();
  }

  function addPointFeature(partial) {
    const feature = {
      schemaVersion: 1,
      id: generateId(),
      mapId: mapDefinition.id,
      kind: 'PointFeature',
      type: 'settlement',
      name: 'Neuer Ort',
      visibility: 'public',
      tags: [],
      table: [],
      ...partial,
    };
    const { valid, errors } = validatePointFeature(feature);
    if (!valid) {
      console.warn('[editor-controller] Ungueltiges Feature verworfen:', errors);
      return null;
    }
    withUndo(() => store.pointFeatures.push(feature));
    return feature;
  }

  function updatePointFeature(id, patch) {
    const index = store.pointFeatures.findIndex((f) => f.id === id);
    if (index === -1) return;
    withUndo(() => {
      store.pointFeatures[index] = { ...store.pointFeatures[index], ...patch };
    });
  }

  function removeFeature(id) {
    withUndo(() => {
      store.pointFeatures = store.pointFeatures.filter((f) => f.id !== id);
      store.regionFeatures = store.regionFeatures.filter((f) => f.id !== id);
      store.routeFeatures = store.routeFeatures.filter((f) => f.id !== id);
    });
  }

  function addRegionFeature(coordinates, partial = {}) {
    const feature = {
      schemaVersion: 1,
      id: generateId(),
      mapId: mapDefinition.id,
      kind: 'RegionFeature',
      name: 'Neue Region',
      geometry: { type: 'Polygon', coordinates },
      visibility: 'public',
      tags: [],
      ...partial,
    };
    withUndo(() => store.regionFeatures.push(feature));
    return feature;
  }

  function addRouteFeature(coordinates, partial = {}) {
    const feature = {
      schemaVersion: 1,
      id: generateId(),
      mapId: mapDefinition.id,
      kind: 'RouteFeature',
      name: 'Neue Route',
      geometry: { type: 'LineString', coordinates },
      visibility: 'public',
      tags: [],
      ...partial,
    };
    withUndo(() => store.routeFeatures.push(feature));
    return feature;
  }

  function undo() {
    const previous = undoHistory.undo();
    if (!previous) return false;
    store.pointFeatures = previous.pointFeatures;
    store.regionFeatures = previous.regionFeatures;
    store.routeFeatures = previous.routeFeatures;
    notifyChanged();
    return true;
  }

  function handlePmCreate(event) {
    const { shape, layer } = event;
    map.removeLayer(layer); // renderers own the persistent representation

    if (shape === 'Marker') {
      const point = fromLeafletLatLng(mapDefinition, layer.getLatLng());
      const feature = addPointFeature({ geometry: { type: 'Point', coordinates: [point.x, point.y] } });
      if (feature) eventBus.emit('feature:created', { feature });
      return;
    }
    if (shape === 'Line') {
      const coordinates = layer.getLatLngs().map((latLng) => {
        const { x, y } = fromLeafletLatLng(mapDefinition, latLng);
        return [x, y];
      });
      const feature = addRouteFeature(coordinates);
      eventBus.emit('feature:created', { feature });
      return;
    }
    if (shape === 'Polygon' || shape === 'Rectangle') {
      const rawRing = (layer.getLatLngs()[0] || []).map((latLng) => latLng);
      const coordinates = ringToPolygonCoordinates(rawRing, mapDefinition);
      const feature = addRegionFeature(coordinates);
      eventBus.emit('feature:created', { feature });
    }
  }

  function handlePmRemove(event) {
    const id = event.layer?.featureId;
    if (id) removeFeature(id);
  }

  map.on('pm:create', handlePmCreate);
  map.on('pm:remove', handlePmRemove);

  /**
   * Persist a drag/vertex-edit on an EXISTING rendered layer (marker,
   * polygon or polyline that already has a .featureId, set by
   * marker-renderer.js/geometry-renderer.js) straight into the store
   * without a full re-render - the layer already shows its new position
   * on screen, so re-rendering would only cost a Geoman edit-handle reset.
   * @param {L.Layer} layer
   * @param {'point'|'route'|'region'} kind
   */
  function persistLayerGeometry(layer, kind) {
    const id = layer.featureId;
    if (!id) return;
    if (kind === 'point') {
      const point = fromLeafletLatLng(mapDefinition, layer.getLatLng());
      const feature = store.pointFeatures.find((f) => f.id === id);
      if (feature) feature.geometry = { type: 'Point', coordinates: [point.x, point.y] };
    } else if (kind === 'route') {
      const coordinates = layer.getLatLngs().map((latLng) => {
        const { x, y } = fromLeafletLatLng(mapDefinition, latLng);
        return [x, y];
      });
      const feature = store.routeFeatures.find((f) => f.id === id);
      if (feature) feature.geometry = { type: 'LineString', coordinates };
    } else if (kind === 'region') {
      const rawRing = layer.getLatLngs()[0] || [];
      const coordinates = ringToPolygonCoordinates(rawRing, mapDefinition);
      const feature = store.regionFeatures.find((f) => f.id === id);
      if (feature) feature.geometry = { type: 'Polygon', coordinates };
    }
    scheduleSave();
  }

  /**
   * Enable Geoman edit handles on an already-rendered layer and keep its
   * feature's geometry in sync while the user drags/reshapes it. Called
   * by main.js for every rendered marker/polygon/polyline when edit mode
   * is entered.
   * @param {L.Layer} layer
   * @param {'point'|'route'|'region'} kind
   */
  function makeLayerEditable(layer, kind) {
    enableLayerEditing(layer);
    layer.on('pm:dragend pm:edit pm:markerdragend', () => persistLayerGeometry(layer, kind));
  }

  function makeLayerStatic(layer) {
    disableLayerEditing(layer);
    layer.off('pm:dragend pm:edit pm:markerdragend');
  }

  function enterEditMode() {
    if (editMode) return;
    editMode = true;
    initGeoman(map, imageOverlaysToIgnore);
  }

  function exitEditMode() {
    if (!editMode) return;
    editMode = false;
    destroyGeoman(map);
  }

  function isEditMode() {
    return editMode;
  }

  function getFeatures() {
    return { ...store };
  }

  function replaceFeatures(next) {
    store.pointFeatures = next.pointFeatures || [];
    store.regionFeatures = next.regionFeatures || [];
    store.routeFeatures = next.routeFeatures || [];
    undoHistory.clear();
    notifyChanged();
  }

  return {
    enterEditMode,
    exitEditMode,
    isEditMode,
    addPointFeature,
    updatePointFeature,
    removeFeature,
    addRegionFeature,
    addRouteFeature,
    undo,
    canUndo: undoHistory.canUndo,
    getFeatures,
    replaceFeatures,
    makeLayerEditable,
    makeLayerStatic,
  };
}
