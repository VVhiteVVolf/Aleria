import { createTerritorialSourceFamily } from './territorial-source-family-builder.js';
import { DUNFAL_SOURCE_CATALOG } from './dunfal-source-catalog.js';
import { DUNFAL_HOUSE_DEFINITIONS } from './dunfal-territorial-catalog.js';
import { DUNFAL_HOUSE_PROFILES } from './dunfal-house-profiles.js';

export function createDunfalSourceFamily(slug, source) {
  return createTerritorialSourceFamily(slug, source, {
    catalog: DUNFAL_SOURCE_CATALOG, definitions: DUNFAL_HOUSE_DEFINITIONS,
    profiles: DUNFAL_HOUSE_PROFILES, principality: 'Dunfal', sourceDate: '07.10.2026',
    sourceAudit: 'assets/data/source-inventories/dunfal-families-audit-2026-10-07.json'
  });
}
