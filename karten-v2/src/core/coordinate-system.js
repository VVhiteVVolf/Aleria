// Central coordinate adapter between application map coordinates {x, y}
// (pixels in the source image, x right, y as defined by coordinateOrigin)
// and Leaflet's [lat, lng] space under L.CRS.Simple.
//
// This module is pure (no Leaflet/DOM dependency) so it can be unit tested
// with plain Node and reused by both the browser app and the migration/
// validation CLI tools.
//
// Convention (matches the legacy Karten module's fractional 0..1 origin,
// scaled up to real pixels): x grows right, y grows DOWN for
// coordinateOrigin "top-left" (the common case for a scanned/painted map
// image), or y grows UP for coordinateOrigin "bottom-left" (Cartesian-style
// source data).
//
// top-left origin:    lat = -y,          lng = x
// bottom-left origin: lat =  y,          lng = x
//
// This is the standard trick used in Leaflet's own CRS.Simple examples: it
// keeps "north = up" (higher lat = higher on screen) without needing a
// height-dependent flip, and bounds become [[-height, 0], [0, width]] /
// [[0, 0], [height, width]] respectively.

/** @typedef {{width:number, height:number, coordinateOrigin?: 'top-left'|'bottom-left'}} MapDefinitionLike */

function assertOrigin(origin) {
  if (origin !== 'top-left' && origin !== 'bottom-left') {
    throw new Error(`Unbekannter coordinateOrigin: "${origin}". Erlaubt sind "top-left" oder "bottom-left".`);
  }
}

// Avoid returning -0 (e.g. -y when y is 0) - it is numerically equal to 0
// but trips strict-equality assertions and looks wrong in the UI ("-0 mi").
function normalizeZero(n) {
  return n === 0 ? 0 : n;
}

/**
 * Convert an application map point {x, y} (pixels) to a Leaflet-shaped
 * {lat, lng} pair under CRS.Simple for the given map definition.
 * @param {MapDefinitionLike} mapDefinition
 * @param {{x:number, y:number}} point
 * @returns {{lat:number, lng:number}}
 */
export function toLeafletLatLng(mapDefinition, point) {
  const origin = mapDefinition.coordinateOrigin || 'top-left';
  assertOrigin(origin);
  const x = Number(point.x);
  const y = Number(point.y);
  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    throw new Error(`Ungueltiger Kartenpunkt: ${JSON.stringify(point)}`);
  }
  const lat = origin === 'top-left' ? -y : y;
  return { lat: normalizeZero(lat), lng: normalizeZero(x) };
}

/**
 * Inverse of toLeafletLatLng: convert a Leaflet {lat, lng} (or [lat, lng])
 * back to an application map point {x, y} in image pixels.
 * @param {MapDefinitionLike} mapDefinition
 * @param {{lat:number, lng:number}|[number, number]} latLng
 * @returns {{x:number, y:number}}
 */
export function fromLeafletLatLng(mapDefinition, latLng) {
  const origin = mapDefinition.coordinateOrigin || 'top-left';
  assertOrigin(origin);
  const lat = Array.isArray(latLng) ? latLng[0] : latLng.lat;
  const lng = Array.isArray(latLng) ? latLng[1] : latLng.lng;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw new Error(`Ungueltige Leaflet-Koordinate: ${JSON.stringify(latLng)}`);
  }
  const y = origin === 'top-left' ? -lat : lat;
  return { x: normalizeZero(lng), y: normalizeZero(y) };
}

/**
 * The Leaflet bounds [[latMin,lngMin],[latMax,lngMax]] that exactly cover
 * the source image for this map definition (used for imageOverlay bounds
 * and maxBounds).
 * @param {MapDefinitionLike} mapDefinition
 * @returns {[[number,number],[number,number]]}
 */
export function mapImageBounds(mapDefinition) {
  const origin = mapDefinition.coordinateOrigin || 'top-left';
  assertOrigin(origin);
  const { width, height } = mapDefinition;
  if (!(width > 0) || !(height > 0)) {
    throw new Error(`Ungueltige Kartenabmessungen: width=${width}, height=${height}`);
  }
  if (origin === 'top-left') {
    return [[-height, 0], [0, width]];
  }
  return [[0, 0], [height, width]];
}

/**
 * Whether a map point lies within the source image's pixel bounds
 * (inclusive). Does not throw; used for soft validation/warnings.
 * @param {MapDefinitionLike} mapDefinition
 * @param {{x:number, y:number}} point
 */
export function isWithinMapBounds(mapDefinition, point) {
  const { width, height } = mapDefinition;
  return point.x >= 0 && point.x <= width && point.y >= 0 && point.y <= height;
}

/**
 * Round a map point to whole pixels for UI display. Never mutates the
 * stored/original point - callers keep full internal precision and only
 * use this for labels/inputs.
 * @param {{x:number, y:number}} point
 * @param {number} [decimals=0]
 */
export function roundMapPoint(point, decimals = 0) {
  const factor = 10 ** decimals;
  return {
    x: Math.round(point.x * factor) / factor,
    y: Math.round(point.y * factor) / factor,
  };
}
