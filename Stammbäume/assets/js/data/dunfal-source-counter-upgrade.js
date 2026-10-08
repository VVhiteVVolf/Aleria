import { withSourceFamilyFieldUpgrade, sourceManagedFields } from './source-family-field-upgrade.js';
import { createWardAwayBranch } from './family-record-builders.js';
import { DUNFAL_SOURCE_COUNTER_PATCHES } from './dunfal-source-counter-patches.js';
import { DUNFAL_HOUSE_DEFINITIONS } from './dunfal-territorial-catalog.js';

const INVENTORY = 'assets/data/source-inventories/dunfal-families-audit-2026-10-07.json';
const MARKER = 'dunfalSourceCounterInventory';

function separateDocumentedIdentity(family, patch) {
  const correction = patch.identityCorrection;
  if (!correction) return family;
  const person = family.persons.find(entry => entry.id === correction.personId);
  if (!person || person.worldPersonId === correction.to) return family;
  if (person.worldPersonId !== correction.from || !family.partnerships.some(pair =>
    pair.id === 'marriage-tarrant-emer-ciarog' && pair.participantIds.includes(person.id))) {
    throw new Error('Die belegte Trennung der beiden Emer Ailella passt nicht zur Gegenakte.');
  }
  return {
    ...family,
    persons: family.persons.map(entry => entry.id !== person.id ? entry : {
      ...entry, worldPersonId: correction.to,
      extensions: sourceManagedFields(entry.extensions, ['worldPersonId'], patch.revision)
    })
  };
}

export function withDunfalSourceCounterUpgrade(family) {
  const patch = DUNFAL_SOURCE_COUNTER_PATCHES[family.document.id];
  if (!patch || family.extensions[MARKER] === INVENTORY && family.extensions.sourceRevision >= patch.revision) return family;
  const prepared = separateDocumentedIdentity(family, patch);
  const upgraded = withSourceFamilyFieldUpgrade(prepared, patch, { inventory: INVENTORY, marker: MARKER });
  if (!patch.wardAway) return upgraded;
  const ward = patch.wardAway;
  const branchId = `ward-away-${ward.personId}-dunfal`;
  if (upgraded.cadetBranches.some(branch => branch.id === branchId)) return upgraded;
  const target = DUNFAL_HOUSE_DEFINITIONS.find(entry => entry.familyId === ward.targetFamilyId);
  return {
    ...upgraded,
    houses: upgraded.houses.some(house => house.id === ward.houseId) ? upgraded.houses : [...upgraded.houses, {
      id: ward.houseId, name: target.title, emblem: target.emblem, motto: '', status: 'active',
      extensions: { registryManagedSourceRevision: patch.revision }
    }],
    cadetBranches: [...upgraded.cadetBranches, createWardAwayBranch({
      id: branchId, name: target.title, parentPersonId: ward.personId,
      houseId: ward.houseId, targetFamilyId: ward.targetFamilyId, emblem: target.emblem,
      notes: 'Shan wird laut Anbhair-Quelle bei Vionnadh als Mündel aufgenommen.',
      extensions: { registryManagedSourceRevision: patch.revision }
    })]
  };
}
