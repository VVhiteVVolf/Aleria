import { characterEquipmentSyncInternals } from './character-equipment-sync.js';
import { materializeInventoryItem } from '../item-definitions/item-definition-resolver.js';

export function attachInventoryEquipment(combatProfile, item, { definitions, definition } = {}) {
  const projected = definition ? { ...item, definitionTitle: definition.title, combatDefinition: definition.combatDefinition } : materializeInventoryItem(item, definitions);
  const kind = projected.combatDefinition?.kind;
  if (!['weapon', 'armor'].includes(kind)) return;
  if (kind === 'weapon' && !projected.combatDefinition.damageFormula) return;
  if (kind === 'armor' && projected.combatDefinition.armorKind !== 'shield'
    && projected.combatDefinition.baseArmorClass == null && !projected.combatDefinition.armorClassBonus) return;
  const collection = kind === 'weapon' ? 'weapons' : 'armorItems';
  if ((combatProfile[collection] || []).some(entry => entry.inventoryItemId === item.id)) return;
  const id = `equipment-${item.id}`;
  combatProfile[collection] = [...(combatProfile[collection] || []),
    characterEquipmentSyncInternals.combatEntryFromInventory(projected, { id, equipped: false }, kind)];
  item.equipmentLink = { schemaVersion: 1, kind, combatEntryId: id };
}
