import { itemDefinitionRegistry } from './item-definition-registry.js';
import { itemDefinitionKey, normalizeItemDefinitionRef } from './item-definition-model.js';

export function resolveItemDefinition(item = {}, definitions = itemDefinitionRegistry) {
  const reference = normalizeItemDefinitionRef(item.definitionRef);
  if (!reference) return null;
  if (definitions instanceof Map) return definitions.get(itemDefinitionKey(reference)) || null;
  return definitions?.get?.(reference) || null;
}
export function materializeInventoryItem(item = {}, definitions) {
  const definition = resolveItemDefinition(item, definitions);
  if (!definition) return item;
  return { ...item, combatDefinition: structuredClone(definition.combatDefinition),
    ...(definition.category === 'waffen' && definition.weight != null && (item.weight == null || item.weight === '')
      ? { weight: String(definition.weight) } : {}),
    passiveEffects: structuredClone(definition.passiveEffects || []),
    inventoryUseMode: definition.inventoryUseMode, useDefinition: structuredClone(definition.useDefinition),
    registerCategory: definition.category, mechanicsStatus: definition.mechanicsStatus,
    definitionTitle: definition.title,
    definitionKind: definition.kind };
}
export function storeInventoryItem(item = {}) {
  if (!normalizeItemDefinitionRef(item.definitionRef)) return item;
  const { combatDefinition, passiveEffects, useDefinition, inventoryUseMode, mechanicsStatus, definitionKind, definitionTitle, ...stored } = item;
  return stored;
}
export function storeDefinitionInventory(inventory = {}) {
  return { ...inventory, ...((inventory.items || []).some(item => normalizeItemDefinitionRef(item.definitionRef)) ? { definitionSchemaVersion: 1 } : {}), items: (inventory.items || []).map(storeInventoryItem) };
}
