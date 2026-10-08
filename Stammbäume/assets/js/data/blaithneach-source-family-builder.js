import { createTerritorialSourceFamily } from './territorial-source-family-builder.js';
import { BLAITHNEACH_SOURCE_CATALOG } from './blaithneach-source-catalog.js';
import { BLAITHNEACH_HOUSE_DEFINITIONS } from './blaithneach-territorial-catalog.js';
import { BLAITHNEACH_HOUSE_PROFILES } from './blaithneach-house-profiles.js';

export function createBlaithneachSourceFamily(slug, source) {
  return createTerritorialSourceFamily(slug, source, {
    catalog: BLAITHNEACH_SOURCE_CATALOG, definitions: BLAITHNEACH_HOUSE_DEFINITIONS,
    profiles: BLAITHNEACH_HOUSE_PROFILES, principality: 'Blaithneach', sourceDate: '08.10.2026',
    sourceAudit: 'assets/data/source-inventories/blaithneach-families-audit-2026-10-08.json'
  });
}
