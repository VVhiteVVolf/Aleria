import { createTerritorialSourceFamily } from './territorial-source-family-builder.js';
import { FAELAORN_SOURCE_CATALOG } from './faelaorn-source-catalog.js';
import { FAELAORN_HOUSE_DEFINITIONS, FAELAORN_WAR_CONTEXT } from './faelaorn-territorial-catalog.js';
import { FAELAORN_HOUSE_PROFILES, FAELAORN_ADDITIONAL_PLACEMENTS } from './faelaorn-house-profiles.js';

export function createFaelaornSourceFamily(slug, source, {
  catalog = FAELAORN_SOURCE_CATALOG,
  sourceAudit = 'assets/data/source-inventories/faelaorn-families-audit-2026-10-08.json'
} = {}) {
  const family = createTerritorialSourceFamily(slug, source, {
    catalog, definitions: FAELAORN_HOUSE_DEFINITIONS,
    profiles: FAELAORN_HOUSE_PROFILES, principality: 'Faelaorn', sourceDate: '08.10.2026',
    sourceAudit
  });
  family.extensions.faelaornWarContext = FAELAORN_WAR_CONTEXT;
  family.extensions.registryAdditionalPlacements = FAELAORN_ADDITIONAL_PLACEMENTS[family.document.id];
  return family;
}
