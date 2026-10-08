import { createFaelaornSourceFamily } from './faelaorn-source-family-builder.js';
import { FAERNA_SOURCE_CATALOG } from './faerna-source-catalog.js';

export function createFaernaSourceFamily(slug, source) {
  const family = createFaelaornSourceFamily(slug, source, {
    catalog: FAERNA_SOURCE_CATALOG,
    sourceAudit: 'assets/data/source-inventories/faerna-families-audit-2026-10-08.json'
  });
  if (slug === 'boyd') {
    family.extensions.registryManagedHouseProfileFields = ['liegeHouseId', 'liegeHouseName'];
  }
  return family;
}
