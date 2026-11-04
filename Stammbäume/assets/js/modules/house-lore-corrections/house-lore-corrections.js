import { applyReviewedHouseCorrections } from './apply-reviewed-house-corrections.js?v=20261104-content-lore-v1';
import { HOUSE_LORE_CORRECTION_FIELDS } from './house-lore-correction-fields.js';

const INVENTORY = 'assets/data/source-inventories/house-lore-corrections-20261104.json';
const MARKER = 'houseLoreCorrectionInventory';

/** Apply the user's reviewed corrections to saved source records, field by field. */
export function withHouseLoreCorrections(family) {
  return applyReviewedHouseCorrections(family, HOUSE_LORE_CORRECTION_FIELDS[family.document.id], {
    inventory: INVENTORY, marker: MARKER
  });
}
