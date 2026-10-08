import { withSourceFamilyFieldUpgrade } from './source-family-field-upgrade.js';
import { AISLEARNEACH_SOURCE_COUNTER_PATCHES } from './aislearneach-source-counter-patches.js';

export function withAislearneachSourceCounterUpgrade(family) {
  const patch = AISLEARNEACH_SOURCE_COUNTER_PATCHES[family.document.id];
  return patch ? withSourceFamilyFieldUpgrade(family, patch, {
    inventory: 'assets/data/source-inventories/aislearneach-families-audit-2026-10-08.json',
    marker: 'aislearneachSourceCounterInventory'
  }) : family;
}
