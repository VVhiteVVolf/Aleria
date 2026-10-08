import { withSourcePortraitFieldUpgrade } from './source-portrait-field-upgrade.js';
import { FAERNA_SOURCE_COUNTER_PATCHES } from './faerna-source-counter-patches.js';

export function withFaernaSourceCounterUpgrade(family) {
  return withSourcePortraitFieldUpgrade(family, FAERNA_SOURCE_COUNTER_PATCHES[family.document.id], {
    inventory: 'assets/data/source-inventories/faerna-families-audit-2026-10-08.json',
    marker: 'faernaSourceCounterInventory'
  });
}
