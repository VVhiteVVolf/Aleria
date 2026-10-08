import { createFaelaornSourceFamily } from './faelaorn-source-family-builder.js';
import { BRANN_SOURCE_CATALOG } from './brann-source-catalog.js';

export function createBrannSourceFamily(slug, source) {
  return createFaelaornSourceFamily(slug, source, {
    catalog: BRANN_SOURCE_CATALOG,
    sourceAudit: 'assets/data/source-inventories/brann-families-audit-2026-10-08.json'
  });
}
