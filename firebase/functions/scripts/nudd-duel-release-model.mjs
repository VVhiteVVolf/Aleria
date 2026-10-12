import { isDeepStrictEqual } from 'node:util';
import { applyNuddPersonalTraining, NUDD_CHARACTER_ID } from '../../../AleriaAlmanach/modules/classes/cenyr/nudd-personal-training.js';
import { synchronizeEquipmentFromCombat } from '../../../AleriaAlmanach/modules/character-equipment/character-equipment-sync.js';
import { applyNuddEquipment, NUDD_EQUIPMENT_IDS } from '../../../AleriaAlmanach/modules/classes/cenyr/nudd-equipment.js';

// This release changes authored training, existing equipment and the requested sword.
// It never changes health, ability uses, resource balances or encounter history.
export function planNuddDuelRelease(character = {}) {
  if (character.id !== NUDD_CHARACTER_ID || !character.combatProfile) return null;
  const before = character.combatProfile;
  const weapon = before.weapons?.find(entry => entry.id === 'starter-cantref-spear');
  if (!weapon) throw new Error('Nudds vorhandene, besitzverknüpfte Waffe fehlt.');
  const after = applyNuddEquipment(applyNuddPersonalTraining(before));
  const linkedItem = character.inventory?.items?.find(item => item.id === weapon.inventoryItemId);
  if (!linkedItem) throw new Error('Nudds vorhandener Waffenbesitz fehlt; kein neuer Gegenstand wird erzeugt.');
  const synced = synchronizeEquipmentFromCombat({ inventory: character.inventory, combatProfile: after,
    characterId: character.id, characterName: character.name }).inventory;
  const equipment = [...after.weapons, ...after.armorItems].filter(entry => [NUDD_EQUIPMENT_IDS.trident, NUDD_EQUIPMENT_IDS.sword, NUDD_EQUIPMENT_IDS.armor].includes(entry.id));
  const updateItem = item => {
    const entry = equipment.find(entry => entry.inventoryItemId === item.id);
    if (!entry) return item;
    const updated = synced.items.find(candidate => candidate.id === item.id);
    return { ...updated, description: entry.notes,
      infoRows: [...(item.infoRows || []).filter(row => row.label !== 'Verzauberung'), { label: 'Verzauberung', value: entry.notes }] };
  };
  const items = character.inventory.items.map(updateItem);
  if (!items.some(item => item.id === NUDD_EQUIPMENT_IDS.swordItem)) items.push(updateItem(synced.items.find(item => item.id === NUDD_EQUIPMENT_IDS.swordItem)));
  const inventory = { ...character.inventory, items };
  const patch = {};
  for (const key of ['weapons', 'armorItems', 'techniques']) if (!isDeepStrictEqual(before[key], after[key])) patch[`combatProfile.${key}`] = after[key];
  if (!isDeepStrictEqual(character.inventory, inventory)) patch.inventory = inventory;
  return Object.keys(patch).length ? patch : null;
}
