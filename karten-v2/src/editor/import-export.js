import { validateAll, validatePointFeature } from '../core/validation.js';
import { SCHEMA_VERSION } from '../data/schema.js';

const PACKAGE_TYPE = 'aleria-karten-v2-export';

/**
 * Build a self-describing export package for one map's editable features.
 * Pure function - easy to unit test independent of the download mechanism.
 * @param {import('../data/schema.js').MapDefinition} mapDefinition
 * @param {{pointFeatures:object[], regionFeatures:object[], routeFeatures:object[]}} features
 */
export function buildExportPackage(mapDefinition, features) {
  return {
    type: PACKAGE_TYPE,
    schemaVersion: SCHEMA_VERSION,
    mapId: mapDefinition.id,
    mapTitle: mapDefinition.title,
    exportedAt: new Date().toISOString(),
    features: {
      pointFeatures: features.pointFeatures || [],
      regionFeatures: features.regionFeatures || [],
      routeFeatures: features.routeFeatures || [],
    },
  };
}

/**
 * Convert point features to a standard GeoJSON FeatureCollection
 * (coordinates in map pixels, per the app's coordinate-system convention -
 * NOT geographic lon/lat).
 * @param {object[]} pointFeatures
 */
export function toGeoJson(pointFeatures) {
  return {
    type: 'FeatureCollection',
    schemaVersion: SCHEMA_VERSION,
    features: pointFeatures.map((feature) => ({
      type: 'Feature',
      id: feature.id,
      geometry: feature.geometry,
      properties: { ...feature, geometry: undefined },
    })),
  };
}

/**
 * Validate a parsed import package: correct envelope type/schema version,
 * mapId match, and per-feature validity. Never throws - returns a report
 * so the UI can warn before overwriting anything.
 * @param {unknown} data
 * @param {string} expectedMapId
 */
export function validateImportPackage(data, expectedMapId) {
  const errors = [];
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Datei ist kein gueltiges JSON-Objekt.'], pointFeatures: [], regionFeatures: [], routeFeatures: [] };
  }
  if (data.type !== PACKAGE_TYPE) {
    errors.push(`Unbekannter Dateityp "${data.type}" - erwartet "${PACKAGE_TYPE}".`);
  }
  if (data.schemaVersion !== SCHEMA_VERSION) {
    errors.push(`Schema-Version ${data.schemaVersion} wird nicht unterstuetzt (erwartet ${SCHEMA_VERSION}).`);
  }
  if (expectedMapId && data.mapId && data.mapId !== expectedMapId) {
    errors.push(`Datei gehoert zu Karte "${data.mapId}", aktuell geoeffnet ist "${expectedMapId}".`);
  }
  const pointResult = validateAll(data.features?.pointFeatures || [], validatePointFeature);
  for (const { entry, errors: featureErrors } of pointResult.invalid) {
    errors.push(`Feature "${entry?.name || entry?.id || '?'}" uebersprungen: ${featureErrors.join('; ')}`);
  }
  return {
    valid: errors.length === 0 || (pointResult.valid.length > 0 && data.type === PACKAGE_TYPE),
    errors,
    pointFeatures: pointResult.valid,
    regionFeatures: data.features?.regionFeatures || [],
    routeFeatures: data.features?.routeFeatures || [],
  };
}

/** Browser-only: trigger a JSON file download. */
export function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/** Browser-only: parse a File's text content as JSON, never throws. */
export async function parseJsonFile(file) {
  try {
    const text = await file.text();
    return { ok: true, data: JSON.parse(text) };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}
