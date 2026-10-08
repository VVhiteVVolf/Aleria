import { withSourcePortraitFieldUpgrade } from './source-portrait-field-upgrade.js';
import { BRANN_SOURCE_COUNTER_PATCHES } from './brann-source-counter-patches.js';

export function withBrannSourceCounterUpgrade(family) {
  return withSourcePortraitFieldUpgrade(family, BRANN_SOURCE_COUNTER_PATCHES[family.document.id], {
    inventory: 'assets/data/source-inventories/brann-families-audit-2026-10-08.json',
    marker: 'brannSourceCounterInventory'
  });
}
