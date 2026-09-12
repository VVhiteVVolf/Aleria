import { characterEquipmentSyncInternals } from './character-equipment-sync.js';

export function attachInventoryEquipment(combatProfile, item) {
  const kind = item.combatDefinition?.kind;
  if (!['weapon', 'armor'].includes(kind)) return;
  if (kind === 'weapon' && !item.combatDefinition.damageFormula) return;
  if (kind === 'armor' && item.combatDefinition.baseArmorClass == null && !item.combatDefinition.armorClassBonus) return;
  const collection = kind === 'weapon' ? 'weapons' : 'armorItems';
  if ((combatProfile[collection] || []).some(entry => entry.inventoryItemId === item.id)) return;
  const id = `equipment-${item.id}`;
  combatProfile[collection] = [...(combatProfile[collection] || []),
    characterEquipmentSyncInternals.combatEntryFromInventory(item, { id, equipped: false }, kind)];
  item.equipmentLink = { schemaVersion: 1, kind, combatEntryId: id };
}
