import { createTerritorialSourceFamily } from './territorial-source-family-builder.js';
import { AISLEARNEACH_SOURCE_CATALOG } from './aislearneach-source-catalog.js';
import { AISLEARNEACH_HOUSE_DEFINITIONS } from './aislearneach-territorial-catalog.js';
import { AISLEARNEACH_HOUSE_PROFILES } from './aislearneach-house-profiles.js';

export function createAislearneachSourceFamily(slug, source) {
  const family = createTerritorialSourceFamily(slug, source, {
    catalog: AISLEARNEACH_SOURCE_CATALOG, definitions: AISLEARNEACH_HOUSE_DEFINITIONS,
    profiles: AISLEARNEACH_HOUSE_PROFILES, principality: 'Aislearneach', sourceDate: '08.10.2026',
    sourceAudit: 'assets/data/source-inventories/aislearneach-families-audit-2026-10-08.json'
  });
  if (slug === 'techtmar') family.lineage.crestFrame = 'iron';
  return family;
}
