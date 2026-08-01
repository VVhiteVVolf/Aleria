import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './map/default-icon-fix.js';
import './styles/map.css';
import './styles/controls.css';
import './styles/sidebar.css';
import './styles/responsive.css';

import { createEventBus } from './core/event-bus.js';
import { createMapRegistry } from './core/map-registry.js';
import { loadMaps, loadLayers, loadLocations, loadCategories, assetUrl } from './data/map-loader.js';
import { loadDraft } from './storage/draft-storage.js';
import { createLeafletMap, fitToMapImage } from './map/create-map.js';
import { addImageOverlays } from './map/image-layer.js';
import { createMarkerRenderer } from './map/marker-renderer.js';
import { createGeometryRenderer } from './map/geometry-renderer.js';
import { createLayerManager } from './map/layer-manager.js';
import { createMapNavigation } from './map/map-navigation.js';
import { createEditorController } from './editor/editor-controller.js';
import { buildExportPackage, downloadJson, parseJsonFile, validateImportPackage } from './editor/import-export.js';
import { renderMapToolbar } from './ui/map-toolbar.js';
import { renderMapSelector } from './ui/map-selector.js';
import { renderSearchPanel } from './ui/search-panel.js';
import { renderLayerPanel } from './ui/layer-panel.js';
import { createMapSidebar } from './ui/map-sidebar.js';

const registry = createMapRegistry(loadMaps());
const allLayers = loadLayers();
const categories = loadCategories();
const eventBus = createEventBus();

const appEl = document.getElementById('app');
const mapContainer = document.getElementById('map-container');
const toolbarEl = document.getElementById('toolbar');
const sidebarEl = document.getElementById('sidebar');
const layerPanelEl = document.getElementById('layer-panel');
const placeholderEl = document.getElementById('map-placeholder');

const sidebar = createMapSidebar(sidebarEl);

/** @type {{leafletMap: import('leaflet').Map, markerRenderer: any, geometryRenderer: any, layerManager: any, editorController: any, navigation: any, mapDefinition: any}|null} */
let current = null;

function categoryColor(categoryId) {
  return categories.find((c) => c.id === categoryId)?.color || '#8a6510';
}

function updateUrl(mapId, featureId) {
  const params = new URLSearchParams();
  params.set('map', mapId);
  if (featureId) params.set('feature', featureId);
  const url = `${window.location.pathname}?${params.toString()}`;
  window.history.pushState({ mapId, featureId }, '', url);
}

function teardownCurrentMap() {
  if (!current) return;
  current.leafletMap.off();
  current.leafletMap.remove();
  current = null;
}

function openFeatureDetails(featureId) {
  const { pointFeatures } = current.editorController.getFeatures();
  const feature = pointFeatures.find((f) => f.id === featureId);
  if (!feature) return;
  current.markerRenderer.highlight(featureId);
  sidebar.showDetails({
    feature,
    category: categories.find((c) => c.id === feature.categoryId) || null,
    onEdit: current.editorController.isEditMode() ? () => openFeatureForm(featureId) : null,
    onDelete: current.editorController.isEditMode()
      ? () => {
          current.editorController.removeFeature(featureId);
          sidebar.close();
        }
      : null,
    onOpenLinkedMap: feature.linkedMapId ? () => navigateTo(feature.linkedMapId) : null,
  });
}

function openFeatureForm(featureId, { isNew = false } = {}) {
  const { pointFeatures } = current.editorController.getFeatures();
  const feature = pointFeatures.find((f) => f.id === featureId);
  if (!feature) return;
  const childMaps = registry.children(current.mapDefinition.id);
  sidebar.showForm({
    feature,
    categories,
    childMaps,
    onSave: (patch) => {
      current.editorController.updatePointFeature(featureId, patch);
      openFeatureDetails(featureId);
    },
    onCancel: () => {
      if (isNew) current.editorController.removeFeature(featureId);
      sidebar.close();
    },
    onDelete: () => {
      current.editorController.removeFeature(featureId);
      sidebar.close();
    },
  });
}

function renderPlaceholder(mapDefinition, requestedId) {
  mapContainer.hidden = true;
  placeholderEl.hidden = false;
  const title = mapDefinition?.title || requestedId || 'Unbekannte Karte';
  const hierarchy = mapDefinition?.hierarchy?.map((h) => h.title).join(' / ') || '';
  const message = !mapDefinition
    ? 'Zu dieser Karten-ID gibt es keinen Registry-Eintrag.'
    : mapDefinition.status === 'planned'
      ? 'Diese Karte ist geplant. Der Link ist bereits stabil, aber es liegt noch kein Kartenbild vor.'
      : 'Diese Karte kann derzeit nicht angezeigt werden.';
  const crest = mapDefinition?.rulingHouseCrest;
  const banner = mapDefinition?.rulingHouseBanner;
  placeholderEl.innerHTML = `
    <div class="map-placeholder__card">
      ${crest ? `<div class="map-placeholder__crest"><img src="${assetUrl(crest)}" alt="Wappen ${mapDefinition.rulingHouse || ''}"/></div>` : ''}
      <div class="map-placeholder__title">${title}</div>
      ${hierarchy ? `<div class="map-placeholder__hierarchy">${hierarchy}</div>` : ''}
      ${
        mapDefinition?.rulingHouse || mapDefinition?.capital
          ? `<div class="map-placeholder__facts">
              ${mapDefinition.rulingHouse ? `<span>${mapDefinition.rulingHouse}</span>` : ''}
              ${mapDefinition.capital ? `<span>Hauptstadt: ${mapDefinition.capital}</span>` : ''}
            </div>`
          : ''
      }
      <div class="map-placeholder__message">${message}</div>
      ${banner ? `<div class="map-placeholder__banner"><img src="${assetUrl(banner)}" alt="Banner ${mapDefinition.rulingHouse || ''}"/></div>` : ''}
      ${mapDefinition?.parentMapId ? `<button class="map-placeholder__back" data-parent="${mapDefinition.parentMapId}">← Zurück zu ${registry.get(mapDefinition.parentMapId)?.title || ''}</button>` : ''}
    </div>
  `;
  placeholderEl.querySelector('[data-parent]')?.addEventListener('click', (event) => {
    navigateTo(event.target.dataset.parent);
  });
  toolbarEl.innerHTML = '';
  const toolbar = renderMapToolbar(toolbarEl, {
    title,
    onResetView: () => {},
    onFullscreen: () => appEl.requestFullscreen?.().catch(() => {}),
    onToggleEdit: () => {},
    onUndo: () => {},
    onOpenDataManager: () => {},
  });
  renderMapSelector(toolbar.breadcrumbMount, { registry, currentMapId: mapDefinition?.id || requestedId, onNavigate: navigateTo });
  layerPanelEl.innerHTML = '';
  document.title = `${title} - Aleria`;
}

function openDataManager() {
  const { pointFeatures, regionFeatures, routeFeatures } = current.editorController.getFeatures();
  const pkg = buildExportPackage(current.mapDefinition, { pointFeatures, regionFeatures, routeFeatures });

  const overlay = document.createElement('div');
  overlay.className = 'data-manager-overlay';
  overlay.innerHTML = `
    <div class="data-manager">
      <div class="data-manager__header">📦 Daten-Manager<button class="data-manager__close" data-action="close">✕</button></div>
      <div class="data-manager__body">
        <section>
          <h3>Exportieren</h3>
          <p>${pointFeatures.length} Orte, ${regionFeatures.length} Regionen, ${routeFeatures.length} Routen auf dieser Karte.</p>
          <button class="data-manager__btn" data-action="export-json">⬇ Kartenpaket (JSON)</button>
        </section>
        <section>
          <h3>Importieren</h3>
          <p>Zuvor exportierte JSON-Datei für <strong>${current.mapDefinition.title}</strong> laden. Ersetzt die aktuellen Orte/Regionen/Routen dieser Karte nach Bestätigung.</p>
          <input type="file" accept=".json" data-role="import-input"/>
          <div class="data-manager__warn" data-role="import-warning" hidden></div>
        </section>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  overlay.querySelector('[data-action="close"]').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) overlay.remove();
  });
  overlay.querySelector('[data-action="export-json"]').addEventListener('click', () => {
    downloadJson(`${current.mapDefinition.id}-export.json`, pkg);
  });
  overlay.querySelector('[data-role="import-input"]').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const warningEl = overlay.querySelector('[data-role="import-warning"]');
    const parsed = await parseJsonFile(file);
    if (!parsed.ok) {
      warningEl.hidden = false;
      warningEl.textContent = `Datei konnte nicht gelesen werden: ${parsed.error}`;
      return;
    }
    const result = validateImportPackage(parsed.data, current.mapDefinition.id);
    if (!result.valid) {
      warningEl.hidden = false;
      warningEl.textContent = `Import abgelehnt: ${result.errors.join(' | ')}`;
      return;
    }
    const proceed = window.confirm(
      `${result.pointFeatures.length} Orte werden importiert und ersetzen die aktuellen Orte auf "${current.mapDefinition.title}". Fortfahren?`,
    );
    if (!proceed) return;
    current.editorController.replaceFeatures(result);
    overlay.remove();
  });
}

function navigateTo(mapId, options = {}) {
  openMap(mapId, options);
}

function openMap(mapId, { featureId = null, pushState = true } = {}) {
  teardownCurrentMap();
  const mapDefinition = registry.get(mapId);

  if (!mapDefinition || mapDefinition.status !== 'active' || !mapDefinition.image) {
    renderPlaceholder(mapDefinition, mapId);
    if (pushState) updateUrl(mapId, null);
    return;
  }

  placeholderEl.hidden = true;
  mapContainer.hidden = false;

  const leafletMap = createLeafletMap(mapContainer, mapDefinition);
  fitToMapImage(leafletMap, mapDefinition);

  const mapLayers = allLayers.filter((layer) => layer.mapId === mapDefinition.id);
  const imageOverlays = addImageOverlays(leafletMap, mapDefinition, mapLayers);

  const markerRenderer = createMarkerRenderer({
    map: leafletMap,
    pane: 'marker-pane',
    eventBus,
    categories,
    mapDefinition,
  });
  const geometryRenderer = createGeometryRenderer({
    map: leafletMap,
    mapDefinition,
    eventBus,
    regionPane: 'region-pane',
    routePane: 'route-pane',
  });

  const vectorLayersByLayerId = new Map();
  const settlementsLayer = mapLayers.find((layer) => layer.type === 'marker');
  if (settlementsLayer) vectorLayersByLayerId.set(settlementsLayer.id, markerRenderer.layerGroup);
  const layerManager = createLayerManager({ map: leafletMap, layerDefinitions: mapLayers, imageOverlays, vectorLayersByLayerId });

  const publishedFeatures = loadLocations().filter((f) => f.mapId === mapDefinition.id);
  const draft = loadDraft(mapDefinition.id);
  const initialFeatures = {
    pointFeatures: draft.pointFeatures.length ? draft.pointFeatures : publishedFeatures,
    regionFeatures: draft.regionFeatures,
    routeFeatures: draft.routeFeatures,
  };

  function renderAll(features) {
    markerRenderer.render(features.pointFeatures);
    geometryRenderer.renderRegions(features.regionFeatures);
    geometryRenderer.renderRoutes(features.routeFeatures);
    layerManager.reapply?.();
  }
  renderAll(initialFeatures);

  const editorController = createEditorController({
    map: leafletMap,
    mapDefinition,
    eventBus,
    imageOverlaysToIgnore: [...imageOverlays.values()],
    initialFeatures,
    onFeaturesChanged: renderAll,
  });

  const navigation = createMapNavigation({ map: leafletMap, mapDefinition, container: appEl });

  current = { leafletMap, markerRenderer, geometryRenderer, layerManager, editorController, navigation, mapDefinition };

  eventBus.on('feature:select', ({ id }) => openFeatureDetails(id));
  eventBus.on('feature:created', ({ feature }) => openFeatureForm(feature.id, { isNew: true }));

  toolbarEl.innerHTML = '';
  const toolbar = renderMapToolbar(toolbarEl, {
    title: mapDefinition.title,
    onResetView: () => navigation.resetView(),
    onFullscreen: () => navigation.toggleFullscreen(),
    onToggleEdit: () => toggleEditMode(toolbar),
    onUndo: () => editorController.undo(),
    onOpenDataManager: () => openDataManager(),
  });
  renderMapSelector(toolbar.breadcrumbMount, { registry, currentMapId: mapDefinition.id, onNavigate: navigateTo });
  renderSearchPanel(toolbar.searchMount, {
    getFeatures: () => editorController.getFeatures().pointFeatures,
    getCategoryColor: categoryColor,
    onSelect: (featureId2) => {
      markerRenderer.panToFeature(featureId2);
      openFeatureDetails(featureId2);
    },
  });
  layerPanelEl.innerHTML = '';
  renderLayerPanel(layerPanelEl, { layerDefinitions: mapLayers, layerManager });

  document.title = mapDefinition.documentTitle || `${mapDefinition.title} - Aleria`;

  function toggleEditMode(toolbarHandle) {
    if (editorController.isEditMode()) {
      for (const marker of markerRenderer.markersByFeatureId.values()) editorController.makeLayerStatic(marker);
      for (const layer of geometryRenderer.layersByFeatureId.values()) editorController.makeLayerStatic(layer);
      editorController.exitEditMode();
    } else {
      editorController.enterEditMode();
      for (const marker of markerRenderer.markersByFeatureId.values()) editorController.makeLayerEditable(marker, 'point');
      for (const layer of geometryRenderer.layersByFeatureId.values()) {
        editorController.makeLayerEditable(layer, layer instanceof L.Polygon ? 'region' : 'route');
      }
    }
    toolbarHandle.setEditMode(editorController.isEditMode());
  }

  if (pushState) updateUrl(mapId, featureId);
  if (featureId) {
    requestAnimationFrame(() => {
      markerRenderer.panToFeature(featureId);
      openFeatureDetails(featureId);
    });
  }
}

function currentMapIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('map') || 'cenyr-celtigerns-wacht';
}

window.addEventListener('popstate', (event) => {
  const params = new URLSearchParams(window.location.search);
  openMap(params.get('map') || 'cenyr-celtigerns-wacht', { featureId: params.get('feature'), pushState: false });
});

window.addEventListener('resize', () => current?.navigation.invalidateSize());
document.addEventListener('fullscreenchange', () => current?.navigation.invalidateSize());
document.addEventListener('keydown', (event) => {
  if (['INPUT', 'SELECT', 'TEXTAREA'].includes(event.target.tagName)) return;
  if (event.key === 'f') current?.navigation.resetView();
});

const initialParams = new URLSearchParams(window.location.search);
openMap(currentMapIdFromUrl(), { featureId: initialParams.get('feature'), pushState: false });
