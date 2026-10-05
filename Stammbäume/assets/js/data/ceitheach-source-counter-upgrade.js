import { CEITHEACH_SOURCE_COUNTER_PATCHES } from './ceitheach-source-counter-patches.js';
import { withSourceFamilyFieldUpgrade } from './source-family-field-upgrade.js';

export function withCeitheachSourceCounterUpgrade(family) {
  return withSourceFamilyFieldUpgrade(family, CEITHEACH_SOURCE_COUNTER_PATCHES[family.document.id], {
    inventory: 'assets/data/source-inventories/ceitheach-families-2026-10-05.json',
    marker: 'ceitheachSourceCounterInventory'
  });
}
