// Shared schema constants and lightweight type guards for the normalized
// karten-v2 data model. Kept dependency-free (no Leaflet/DOM) so it can be
// used from the browser app, the migration CLI and the validator CLI.

export const SCHEMA_VERSION = 1;

export const MAP_STATUS = Object.freeze({
  ACTIVE: 'active',
  PLANNED: 'planned',
  ARCHIVED: 'archived',
});

export const MAP_TYPES = Object.freeze({
  KINGDOM: 'kingdom',
  COUNTY: 'county',
  BARONY: 'barony',
  CITY: 'city',
  REGION: 'region',
  LOCAL: 'local',
});

export const FEATURE_VISIBILITY = Object.freeze({
  PUBLIC: 'public',
  DISCOVERED: 'discovered',
  HIDDEN: 'hidden',
  GM_ONLY: 'gm-only',
});

export const GEOMETRY_TYPES = Object.freeze({
  POINT: 'Point',
  LINE_STRING: 'LineString',
  POLYGON: 'Polygon',
});

export const LAYER_TYPES = Object.freeze({
  IMAGE_OVERLAY: 'image-overlay',
  MARKER: 'marker',
  REGION: 'region',
  ROUTE: 'route',
});

/**
 * @typedef {object} MapDefinition
 * @property {number} schemaVersion
 * @property {string} id
 * @property {string} title
 * @property {string} [documentTitle]
 * @property {string} status - one of MAP_STATUS
 * @property {string} type - one of MAP_TYPES
 * @property {string|null} image - path under public/, relative to BASE_URL, or null if not yet available
 * @property {number|null} width - real pixel width of `image`, or null if unknown
 * @property {number|null} height - real pixel height of `image`, or null if unknown
 * @property {'top-left'|'bottom-left'} coordinateOrigin
 * @property {number} minZoom
 * @property {number} maxZoom
 * @property {number} zoomSnap
 * @property {number} unitsPerPixel
 * @property {string} unitName
 * @property {string|null} parentMapId
 * @property {string[]} childMapIds
 * @property {{x:number,y:number,zoom:number}|null} initialView
 * @property {{level:string,slug:string,title:string}[]} hierarchy
 * @property {string} [rulingHouse]
 * @property {string} [rulingHouseCrest] - path under public/ to the ruling house's crest image
 * @property {string} [rulingHouseBanner] - path under public/ to a pennant/banner image, where one exists
 * @property {string} [capital] - name of the map's capital settlement, metadata only (no fabricated pin placement)
 * @property {string} [legacyId] - id of the corresponding entry in the old karten.registry.js, if any
 * @property {string} [notes]
 */

/**
 * @typedef {object} LayerDefinition
 * @property {string} id
 * @property {string} mapId
 * @property {string} name
 * @property {string} type - one of LAYER_TYPES
 * @property {boolean} defaultVisible
 * @property {boolean} editable
 * @property {number} [minZoom]
 * @property {number} [maxZoom]
 * @property {string} pane
 * @property {string} [image] - only for type "image-overlay"
 */

/**
 * @typedef {object} FeatureCategory
 * @property {string} id
 * @property {string} label
 * @property {string} color
 * @property {string} [marker] - URL of a marker-catalog icon
 */

/**
 * @typedef {object} MarkerCatalogItem
 * @property {string} id
 * @property {string} url
 * @property {string} name
 * @property {string} [group]
 */

/**
 * @typedef {object} PointFeature
 * @property {number} schemaVersion
 * @property {string} id
 * @property {string} mapId
 * @property {'PointFeature'} kind
 * @property {string} type - free-text feature type, e.g. "settlement"
 * @property {string} name
 * @property {string} [description]
 * @property {{type:'Point', coordinates:[number,number]}} geometry - [x, y] in map pixels
 * @property {string} [categoryId]
 * @property {string} [layerId]
 * @property {string} [iconId] - marker-catalog id/url override
 * @property {string} [linkedEntityId] - external lore page reference
 * @property {string|null} [linkedMapId] - child map this feature opens
 * @property {number} [minZoom]
 * @property {number} [maxZoom]
 * @property {string} visibility - one of FEATURE_VISIBILITY
 * @property {string[]} tags
 * @property {{k:string,v:string}[]} table
 * @property {string} [region]
 * @property {string} [house]
 * @property {string} [faction]
 * @property {string} [image]
 * @property {string} [imageLink]
 * @property {string} [crest]
 * @property {string} [crestLink]
 * @property {string} [banner]
 * @property {string} [bannerLink]
 */

/** Same shape as the legacy uid() (timestamp + random base36) - short, sortable, collision-safe enough for this data volume. */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}
