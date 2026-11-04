import { applyReviewedHouseCorrections } from './apply-reviewed-house-corrections.js?v=20261104-content-lore-v1';
import { HOUSE_LIFE_STATUS_CORRECTION_FIELDS } from './house-life-status-correction-fields.js?v=20261104-life-status-v1';

const INVENTORY = 'assets/data/source-inventories/house-life-status-corrections-20261104.json';
const MARKER = 'houseLifeStatusCorrectionInventory';

/** Resolve reviewed life-status counterparts using the canonical source fields. */
export function withHouseLifeStatusCorrections(family) {
  return applyReviewedHouseCorrections(family, HOUSE_LIFE_STATUS_CORRECTION_FIELDS[family.document.id], {
    inventory: INVENTORY, marker: MARKER
  });
}
