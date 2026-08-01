// Application data is authored as JSON under karten-v2/data/ (edited by
// hand or by tools/migrate-legacy-data.js). Each map owns its own folder
// under data/maps/<mapId>/ (registry.json required, layers.json/
// locations.json only for maps that have real content) - so a map (and
// everything about it) can be added, moved, or handed to someone else as
// one self-contained unit, "jede Karte hat ihre eigene Registry + Marker".
// Only truly cross-map vocabularies (categories, the shared marker-catalog
// icon library, pin templates) stay as single shared files.
//
// import.meta.glob with eager:true is Vite's supported way to statically
// import "every file matching this pattern" at build time - still no
// runtime fetch, still works identically in dev and in a sub-path build.
//
// Binary assets (map images, crests) are NOT imported this way - they live
// under public/ and are referenced via assetUrl()/BASE_URL at runtime, per
// Vite's public-asset convention.
import categoriesDoc from '../../data/categories.json';
import markerCatalogDoc from '../../data/marker-catalog.json';
import pinTemplatesDoc from '../../data/pin-templates.json';
// .geojson isn't recognized as JSON by Vite's bundler by default (only
// .json is) - import as raw text and parse explicitly instead of renaming
// the source files away from the conventional .geojson extension.
import regionsRaw from '../../data/regions.geojson?raw';
import routesRaw from '../../data/routes.geojson?raw';

const regionsDoc = JSON.parse(regionsRaw);
const routesDoc = JSON.parse(routesRaw);

const registryModules = import.meta.glob('../../data/maps/*/registry.json', { eager: true });
const layerModules = import.meta.glob('../../data/maps/*/layers.json', { eager: true });
const locationModules = import.meta.glob('../../data/maps/*/locations.json', { eager: true });

export function loadMaps() {
  return Object.values(registryModules).map((mod) => mod.default ?? mod);
}

export function loadLayers() {
  return Object.values(layerModules).flatMap((mod) => (mod.default ?? mod).layers || []);
}

export function loadLocations() {
  return Object.values(locationModules).flatMap((mod) => (mod.default ?? mod).features || []);
}

export function loadCategories() {
  return categoriesDoc.categories || [];
}

export function loadMarkerCatalog() {
  return markerCatalogDoc.markers || [];
}

export function loadPinTemplates() {
  return pinTemplatesDoc.templates || [];
}

export function loadRegions() {
  return regionsDoc.features || [];
}

export function loadRoutes() {
  return routesDoc.features || [];
}

export function assetUrl(relativePath) {
  return `${import.meta.env.BASE_URL}${relativePath}`;
}
