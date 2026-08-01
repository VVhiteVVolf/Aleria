// Pure field-mapping functions from the legacy Karten data shapes (see
// karten-v2/docs/LEGACY_AUDIT.md section 5) to the normalized karten-v2
// schema. Used by tools/migrate-legacy-data.js (Node CLI) and kept
// framework/DOM-free so it is unit testable on its own.
import { generateId } from './schema.js';

/**
 * Convert one legacy pin object (0..1 fractional x/y) into a PointFeature
 * in real map-pixel coordinates.
 * @param {object} legacyPin
 * @param {{id:string, width:number, height:number}} targetMap
 */
export function legacyPinToPointFeature(legacyPin, targetMap) {
  if (typeof legacyPin.x !== 'number' || typeof legacyPin.y !== 'number') {
    throw new Error(`Pin "${legacyPin.title || legacyPin.id}" hat keine gueltigen x/y-Koordinaten.`);
  }
  return {
    schemaVersion: 1,
    id: legacyPin.id || generateId(),
    mapId: targetMap.id,
    kind: 'PointFeature',
    type: 'settlement',
    name: legacyPin.title || 'Unbekannter Ort',
    geometry: {
      type: 'Point',
      coordinates: [legacyPin.x * targetMap.width, legacyPin.y * targetMap.height],
    },
    categoryId: legacyPin.cat || undefined,
    iconId: legacyPin.pinMarker || undefined,
    visibility: legacyPin.secret ? 'gm-only' : 'public',
    tags: [],
    table: Array.isArray(legacyPin.table) ? legacyPin.table.map((row) => ({ k: row.k || '', v: row.v || '' })) : [],
    description: legacyPin.text || '',
    region: legacyPin.region || '',
    house: legacyPin.house || '',
    faction: legacyPin.faction || '',
    image: legacyPin.img || '',
    imageLink: legacyPin.imgLink || '',
    crest: legacyPin.crest || '',
    crestLink: legacyPin.crestLink || '',
    banner: legacyPin.banner || '',
    bannerLink: legacyPin.bannerLink || '',
  };
}

/**
 * @param {object} legacyCategory {id,label,color,marker?}
 */
export function legacyCategoryToFeatureCategory(legacyCategory) {
  return {
    id: legacyCategory.id,
    label: legacyCategory.label,
    color: legacyCategory.color,
    ...(legacyCategory.marker ? { marker: legacyCategory.marker } : {}),
  };
}

/**
 * @param {object} legacyMarker {id,url,name,group?}
 */
export function legacyMarkerToMarkerCatalogItem(legacyMarker) {
  return {
    id: legacyMarker.id,
    url: legacyMarker.url,
    name: legacyMarker.name,
    ...(legacyMarker.group ? { group: legacyMarker.group } : {}),
  };
}

/**
 * Migrate an entire legacy "karten" Firestore-shaped export (as produced
 * by the old app's Daten-Manager JSON export, or a raw Firestore document
 * dump) into the new schema. Never throws on a single bad entry - problems
 * are collected into the report so the whole run doesn't fail.
 * @param {object} legacyExport - parsed JSON with pins[]/cats[]/markerCatalog[]
 * @param {{id:string, width:number, height:number}} targetMap
 */
export function migrateLegacyExport(legacyExport, targetMap) {
  const report = { pointFeatures: [], categories: [], markerCatalog: [], failed: [], skipped: [] };

  for (const pin of legacyExport.pins || []) {
    try {
      report.pointFeatures.push(legacyPinToPointFeature(pin, targetMap));
    } catch (error) {
      report.failed.push({ id: pin?.id, reason: error.message });
    }
  }
  for (const category of legacyExport.cats || []) {
    if (!category.id || !category.label || !category.color) {
      report.skipped.push({ id: category?.id, reason: 'Kategorie ohne id/label/color.' });
      continue;
    }
    report.categories.push(legacyCategoryToFeatureCategory(category));
  }
  for (const marker of legacyExport.markerCatalog || []) {
    if (!marker.id || !marker.url || !marker.name) {
      report.skipped.push({ id: marker?.id, reason: 'Marker-Katalog-Eintrag ohne id/url/name.' });
      continue;
    }
    report.markerCatalog.push(legacyMarkerToMarkerCatalogItem(marker));
  }
  return report;
}
