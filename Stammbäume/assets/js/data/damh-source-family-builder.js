import { createFaelaornSourceFamily } from './faelaorn-source-family-builder.js';
import { DAMH_SOURCE_CATALOG } from './damh-source-catalog.js';

export function createDamhSourceFamily(slug, source) {
  return createFaelaornSourceFamily(slug, source, {
    catalog: DAMH_SOURCE_CATALOG,
    sourceAudit: 'assets/data/source-inventories/damh-families-audit-2026-10-08.json'
  });
}
