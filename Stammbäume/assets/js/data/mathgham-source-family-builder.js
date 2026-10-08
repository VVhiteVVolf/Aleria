import { createFaelaornSourceFamily } from './faelaorn-source-family-builder.js';
import { MATHGHAM_SOURCE_CATALOG } from './mathgham-source-catalog.js';

export function createMathghamSourceFamily(slug, source) {
  return createFaelaornSourceFamily(slug, source, {
    catalog: MATHGHAM_SOURCE_CATALOG,
    sourceAudit: 'assets/data/source-inventories/mathgham-families-audit-2026-10-08.json'
  });
}
