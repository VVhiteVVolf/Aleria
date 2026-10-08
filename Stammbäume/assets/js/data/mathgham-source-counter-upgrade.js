import { withSourcePortraitFieldUpgrade } from './source-portrait-field-upgrade.js';
import { MATHGHAM_SOURCE_COUNTER_PATCHES } from './mathgham-source-counter-patches.js';

export function withMathghamSourceCounterUpgrade(family) {
  return withSourcePortraitFieldUpgrade(family, MATHGHAM_SOURCE_COUNTER_PATCHES[family.document.id], {
    inventory: 'assets/data/source-inventories/mathgham-families-audit-2026-10-08.json',
    marker: 'mathghamSourceCounterInventory'
  });
}
