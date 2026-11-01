import { synchronizeEquipmentFromInventory, getInventoryEquipmentKind } from '../character-equipment/character-equipment-sync.js';
import { sanitizeCharacterCombatProfile } from '../combat/combat-profile-model.js';
import { storeInventoryItem } from '../item-definitions/item-definition-resolver.js';

// Only the newly owned possession is reconciled. Existing equipped choices and
// personal entries belong to the actor, not to an unrelated scene pickup.
export function appendPickedUpEquipment(actor, item, definitions) {
  if (!getInventoryEquipmentKind(item)) return { item: storeInventoryItem(item), combatProfile: null };
  const synced = synchronizeEquipmentFromInventory({ inventory: { items: [item] }, combatProfile: {}, addMissingEquipment: true, definitions });
  const incoming = sanitizeCharacterCombatProfile(synced.combatProfile);
  const additions = Object.fromEntries(['weapons', 'armorItems'].map(collection => [collection,
    (incoming[collection] || []).filter(entry => entry.inventoryItemId === item.id)
  ]));
  if (!additions.weapons.length && !additions.armorItems.length) return { item: storeInventoryItem(item), combatProfile: null };
  const profile = { ...actor };
  for (const collection of ['weapons', 'armorItems']) {
    if (additions[collection].length) profile[collection] = [...(actor[collection] || []), ...additions[collection]];
  }
  return { item: synced.inventory.items[0], combatProfile: profile };
}

// A dropped weapon may be a legacy unbound entry or have several combat modes
// bound to one possession. Ownership removal invalidates every such binding.
export function removeTransferredSceneEquipment(profile = {}, { weaponId, inventoryItemId = '' }) {
  const next = { ...profile };
  for (const collection of ['weapons', 'armorItems']) {
    const before = profile[collection];
    if (!Array.isArray(before)) continue;
    const entries = before.filter(entry => !(inventoryItemId && entry.inventoryItemId === inventoryItemId)
      && !(collection === 'weapons' && entry.id === weaponId));
    if (entries.length !== before.length) next[collection] = entries;
  }
  return next;
}
