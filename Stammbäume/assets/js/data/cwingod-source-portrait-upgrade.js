import { withSourceFamilyFieldUpgrade } from './source-family-field-upgrade.js';
import { withCwingodHouseNameUpgrade } from './cwingod-house-name-upgrade.js';
import { CWINGOD_SOURCE_PORTRAITS, CWINGOD_PORTRAIT_REVISIONS } from './cwingod-source-portraits.js';

const INVENTORY = 'assets/data/source-inventories/cwingod-portraits-2026-10-08.json';

/** Apply the approved portraits to every existing copy of the same person. */
export function withCwingodSourcePortraitUpgrade(family) {
  const revision = CWINGOD_PORTRAIT_REVISIONS[family.document.id];
  if (!revision || family.extensions.cwingodSourcePortraitInventory === INVENTORY) return family;
  // Freeze the earlier name correction before introducing a portrait revision.
  const previous = withCwingodHouseNameUpgrade(family);
  return withSourceFamilyFieldUpgrade(previous, {
    revision,
    collections: {
      persons: Object.fromEntries(family.persons
        .filter(person => Object.hasOwn(CWINGOD_SOURCE_PORTRAITS, person.id))
        .map(person => [person.id, { portrait: CWINGOD_SOURCE_PORTRAITS[person.id] }]))
    }
  }, {
    inventory: INVENTORY,
    marker: 'cwingodSourcePortraitInventory'
  });
}
