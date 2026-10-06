import { assignHouseArmor } from './house-armor-assignment.js?v=20261006-house-armor-v1';
import { findArmorHouse, characterArmorLevel } from './house-armor-model.js?v=20261006-house-armor-v1';
import { resolveEquipmentImage } from '../character-equipment/equipment-artwork.js?v=20260928-equipment-art-v4';

const torso = item => item.kind !== 'shield' && !/schild|shield|helm|stiefel|handschuh/i.test(item.name || '');
/** A bounded administrative migration, never applied as a read projection. */
export function prepareHouseArmorRelease(character, { verifiedHouseId = '' } = {}) {
  if (characterArmorLevel(character) <= 1) return { patch: {}, status: 'level-one' };
  const context = character.genealogy?.houseId || !verifiedHouseId ? character
    : { ...character, genealogy: { ...character.genealogy, houseId: verifiedHouseId } };
  const house = findArmorHouse(context);
  const previousItems = character.inventory?.items || [];
  const previousArmor = character.combatProfile?.armorItems || [];
  const items = previousItems.map(item => {
    if (item.category !== 'armor' || !torso(item)) return item;
    const entry = previousArmor.find(armor => armor.inventoryItemId === item.id || armor.id === item.equipmentLink?.combatEntryId);
    const image = resolveEquipmentImage(item, { characterId: character.id, combatEntryId: entry?.id, fallback: entry?.image }) || house?.image || '';
    return image && image !== item.image ? { ...item, image } : item;
  });
  const armorItems = previousArmor.map(entry => {
    if (!torso(entry)) return entry;
    const item = items.find(item => item.id === entry.inventoryItemId || item.equipmentLink?.combatEntryId === entry.id);
    const image = resolveEquipmentImage(entry, { characterId: character.id, fallback: item?.image }) || house?.image || '';
    return image && image !== entry.image ? { ...entry, image } : entry;
  });
  const illustrated = { ...context, inventory: { ...character.inventory, items }, combatProfile: { ...character.combatProfile, armorItems } };
  const assigned = assignHouseArmor(illustrated);
  const patch = {};
  if (JSON.stringify(assigned.inventory.items) !== JSON.stringify(previousItems)) patch.inventory = assigned.inventory;
  if (JSON.stringify(armorItems) !== JSON.stringify(previousArmor)) patch.combatProfile = { ...character.combatProfile, armorItems };
  if (JSON.stringify(assigned.houseArmorAssignment) !== JSON.stringify(character.houseArmorAssignment)) patch.houseArmorAssignment = assigned.houseArmorAssignment;
  return { patch, status: Object.keys(patch).length ? 'updated' : house ? 'already-current' : 'outside-region-or-unassigned',
    houseId: house?.id || '', addedItems: assigned.inventory.items.length - previousItems.length,
    inventoryImages: items.filter((item, i) => item.image !== previousItems[i].image).length,
    armorImages: armorItems.filter((item, i) => item.image !== previousArmor[i].image).length };
}
