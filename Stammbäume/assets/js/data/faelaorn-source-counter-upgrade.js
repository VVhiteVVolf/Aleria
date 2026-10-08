import { withSourcePortraitFieldUpgrade } from './source-portrait-field-upgrade.js';
import { FAELAORN_SOURCE_COUNTER_PATCHES } from './faelaorn-source-counter-patches.js';

export function withFaelaornSourceCounterUpgrade(family) {
  return withSourcePortraitFieldUpgrade(family, FAELAORN_SOURCE_COUNTER_PATCHES[family.document.id], {
    inventory: 'assets/data/source-inventories/faelaorn-families-audit-2026-10-08.json',
    marker: 'faelaornSourceCounterInventory'
  });
}
