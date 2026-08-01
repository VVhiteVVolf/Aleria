// Soft, per-entry data validation. A single invalid map/layer/feature must
// never take the whole application down - callers collect { valid, errors }
// per entry, log/skip the bad one, and keep rendering everything else.
import { MAP_STATUS, MAP_TYPES, FEATURE_VISIBILITY, GEOMETRY_TYPES, isPlainObject, isFiniteNumber } from '../data/schema.js';

function fail(errors, message) {
  errors.push(message);
}

/**
 * @param {import('../data/schema.js').MapDefinition} map
 * @returns {{valid:boolean, errors:string[]}}
 */
export function validateMapDefinition(map) {
  const errors = [];
  if (!isPlainObject(map)) {
    return { valid: false, errors: ['Kartendefinition ist kein Objekt.'] };
  }
  if (!map.id || typeof map.id !== 'string') fail(errors, 'id fehlt oder ist kein String.');
  if (!map.title || typeof map.title !== 'string') fail(errors, 'title fehlt oder ist kein String.');
  if (!Object.values(MAP_STATUS).includes(map.status)) fail(errors, `status "${map.status}" ist ungueltig.`);
  if (!Object.values(MAP_TYPES).includes(map.type)) fail(errors, `type "${map.type}" ist ungueltig.`);
  if (map.status === MAP_STATUS.ACTIVE) {
    if (!map.image) fail(errors, 'Aktive Karte ohne image.');
    if (!isFiniteNumber(map.width) || map.width <= 0) fail(errors, 'Aktive Karte ohne gueltige width.');
    if (!isFiniteNumber(map.height) || map.height <= 0) fail(errors, 'Aktive Karte ohne gueltige height.');
  }
  if (map.coordinateOrigin && !['top-left', 'bottom-left'].includes(map.coordinateOrigin)) {
    fail(errors, `coordinateOrigin "${map.coordinateOrigin}" ist ungueltig.`);
  }
  if (!Array.isArray(map.hierarchy)) fail(errors, 'hierarchy fehlt oder ist kein Array.');
  return { valid: errors.length === 0, errors };
}

/**
 * @param {import('../data/schema.js').PointFeature} feature
 */
export function validatePointFeature(feature) {
  const errors = [];
  if (!isPlainObject(feature)) {
    return { valid: false, errors: ['Feature ist kein Objekt.'] };
  }
  if (!feature.id || typeof feature.id !== 'string') fail(errors, 'id fehlt oder ist kein String.');
  if (!feature.mapId || typeof feature.mapId !== 'string') fail(errors, 'mapId fehlt oder ist kein String.');
  if (!feature.name || typeof feature.name !== 'string') fail(errors, 'name fehlt oder ist kein String.');
  if (!isPlainObject(feature.geometry) || feature.geometry.type !== GEOMETRY_TYPES.POINT) {
    fail(errors, 'geometry.type muss "Point" sein.');
  } else {
    const coords = feature.geometry.coordinates;
    if (!Array.isArray(coords) || coords.length !== 2 || !isFiniteNumber(coords[0]) || !isFiniteNumber(coords[1])) {
      fail(errors, 'geometry.coordinates muss [x, y] mit endlichen Zahlen sein.');
    }
  }
  if (feature.visibility && !Object.values(FEATURE_VISIBILITY).includes(feature.visibility)) {
    fail(errors, `visibility "${feature.visibility}" ist ungueltig.`);
  }
  if (feature.table && !Array.isArray(feature.table)) fail(errors, 'table muss ein Array sein.');
  if (feature.tags && !Array.isArray(feature.tags)) fail(errors, 'tags muss ein Array sein.');
  return { valid: errors.length === 0, errors };
}

/**
 * @param {import('../data/schema.js').FeatureCategory} category
 */
export function validateCategory(category) {
  const errors = [];
  if (!isPlainObject(category)) return { valid: false, errors: ['Kategorie ist kein Objekt.'] };
  if (!category.id) fail(errors, 'id fehlt.');
  if (!category.label) fail(errors, 'label fehlt.');
  if (!category.color || typeof category.color !== 'string') fail(errors, 'color fehlt oder ist kein String.');
  return { valid: errors.length === 0, errors };
}

/**
 * Validate a list of entries with a validator function, splitting the
 * result into valid entries and a parallel list of {entry, errors}
 * failures. Never throws.
 * @template T
 * @param {T[]} entries
 * @param {(entry:T)=>{valid:boolean, errors:string[]}} validator
 */
export function validateAll(entries, validator) {
  const valid = [];
  const invalid = [];
  for (const entry of entries || []) {
    const result = validator(entry);
    if (result.valid) valid.push(entry);
    else invalid.push({ entry, errors: result.errors });
  }
  return { valid, invalid };
}
