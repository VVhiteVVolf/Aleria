import { withSourcePortraitFieldUpgrade } from './source-portrait-field-upgrade.js';
import { createWardAwayBranch } from './family-record-builders.js';
import { BRAIGH_SOURCE_COUNTER_PATCHES } from './braigh-source-counter-patches.js';

export function withBraighSourceCounterUpgrade(family) {
  const patch = BRAIGH_SOURCE_COUNTER_PATCHES[family.document.id];
  if (!patch) return family;
  const additionalCadetBranches = (patch.wardLinks || []).map(link => createWardAwayBranch({
    id: `ward-away-${link.personId}`,
    name: link.name, parentPersonId: link.personId, houseId: link.houseId,
    targetFamilyId: link.familyId, emblem: link.emblem,
    notes: 'Mündelverbindung nach der Braigh-Quelle vom 08.10.2026; biologische Elternschaft bleibt erhalten.'
  }));
  return withSourcePortraitFieldUpgrade(family, { ...patch, additionalCadetBranches }, {
    inventory: 'assets/data/source-inventories/braigh-families-audit-2026-10-08.json',
    marker: 'braighSourceCounterInventory'
  });
}
