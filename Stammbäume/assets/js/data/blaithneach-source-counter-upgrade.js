import { withSourceFamilyFieldUpgrade } from './source-family-field-upgrade.js';
import { BLAITHNEACH_SOURCE_COUNTER_PATCHES } from './blaithneach-source-counter-patches.js';

export function withBlaithneachSourceCounterUpgrade(family) {
  const patch = BLAITHNEACH_SOURCE_COUNTER_PATCHES[family.document.id];
  return patch ? withSourceFamilyFieldUpgrade(family, patch, {
    inventory: 'assets/data/source-inventories/blaithneach-families-audit-2026-10-08.json',
    marker: 'blaithneachSourceCounterInventory'
  }) : family;
}
