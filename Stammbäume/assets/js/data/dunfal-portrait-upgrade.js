import { withSourceFamilyFieldUpgrade } from './source-family-field-upgrade.js';

export const DUNFAL_PORTRAIT_REVISIONS = Object.freeze({ 'haus-chulainn': 7, 'haus-nuadat': 5 });
export const TADG_NUADAT_PORTRAIT = 'assets/images/portraits/haus-nuadat/tadg-1663-nuadat-20261022.png';
const inventory = 'assets/data/source-inventories/dunfal-portrait-2026-10-22.json';

// The same person appears in his Nuadat origin and his Chulainn marriage family.
export function withDunfalPortraitUpgrade(family) {
  const revision = DUNFAL_PORTRAIT_REVISIONS[family.document.id];
  if (!revision) return family;
  return withSourceFamilyFieldUpgrade(family, {
    revision,
    collections: { persons: { 'tadg-1663-nuadat': { portrait: TADG_NUADAT_PORTRAIT } } },
  }, { inventory, marker: 'dunfalPortraitInventory' });
}
