import { withSourcePortraitFieldUpgrade } from './source-portrait-field-upgrade.js';
import { DAMH_SOURCE_COUNTER_PATCHES } from './damh-source-counter-patches.js';

export function withDamhSourceCounterUpgrade(family) {
  return withSourcePortraitFieldUpgrade(family, DAMH_SOURCE_COUNTER_PATCHES[family.document.id], {
    inventory: 'assets/data/source-inventories/damh-families-audit-2026-10-08.json',
    marker: 'damhSourceCounterInventory'
  });
}
