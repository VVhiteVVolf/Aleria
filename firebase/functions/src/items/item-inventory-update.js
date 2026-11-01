import { transferredEquipmentProfile } from './item-transfer-equipment.js';
import { withProtectedRecordRevisions } from '../mechanics/protected-record-revisions.js';

// An inventory editor may intentionally equip or unequip an existing item.
// Preserve the saved loadout for unchanged old flags, including missing=false.
export function applyExplicitInventoryLoadout(profile, previousInventory, inventory) {
  const previous = new Map((previousInventory?.items || []).map(item => [item.id, item]));
  const transitions = new Map((inventory?.items || []).filter(item => previous.has(item.id) && typeof item.equipped === 'boolean'
    && item.equipped !== (previous.get(item.id).equipped === true)).map(item => [item.id, item.equipped]));
  if (!transitions.size) return profile;
  const next = { ...(profile || {}) };
  for (const collection of ['weapons', 'armorItems']) {
    if (!Array.isArray(profile?.[collection])) continue;
    next[collection] = profile[collection].map(entry => transitions.has(entry.inventoryItemId)
      ? { ...entry, equipped: transitions.get(entry.inventoryItemId) } : entry);
  }
  return next;
}

// A purchase or grant owns only its explicitly affected possessions. Reuse the
// same binding projection as transfers, including multi-item quest rewards.
export function selectiveItemInventoryUpdate(record, reconciled, itemIds = [], options = {}) {
  let combatProfile = record.combatProfile, changesEquipment = false;
  for (const id of new Set(itemIds)) {
    const next = transferredEquipmentProfile(combatProfile, reconciled.combatProfile, id, options);
    if (next) { combatProfile = next; changesEquipment = true; }
  }
  return { inventory: reconciled.inventory, ...(changesEquipment ? { combatProfile } : {}) };
}

export function withItemInventoryRevisions(record, changes, now, requestedRevision) {
  const sections = ['inventory', ...(Object.hasOwn(changes, 'combatProfile') ? ['combatProfile'] : [])];
  return withProtectedRecordRevisions(record, { ...changes, updatedAt: now }, sections, requestedRevision);
}
