import { createFaelaornSourceFamily } from './faelaorn-source-family-builder.js';
import { BRAIGH_SOURCE_CATALOG } from './braigh-source-catalog.js';

export function createBraighSourceFamily(slug, source) {
  const family = createFaelaornSourceFamily(slug, source, {
    catalog: BRAIGH_SOURCE_CATALOG,
    sourceAudit: 'assets/data/source-inventories/braigh-families-audit-2026-10-08.json'
  });
  if (slug === 'grannd') {
    family.extensions.registryManagedHouseProfileFields = ['liegeHouseId', 'liegeHouseName'];
  }
  return family;
}
