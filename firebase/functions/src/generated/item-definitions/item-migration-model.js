import { STANDARD_ITEMS } from '../item-register/item-register-standard.js';
import { isInventoryPlaceholder } from '../character-inventory/inventory-placeholders.js';
import { normalizeItemCombatDefinition, assertItemQuantity, itemDefinitionFromTemplate } from './item-definition-model.js';

const physical = entry => entry.id !== 'default-unarmed-melee' && !['unarmed', 'natural'].includes(entry.weaponType);
export function planItemMigration(record, templates = STANDARD_ITEMS) {
  const byKey = new Map(templates.flatMap(template => [template.id, ...(template.aliases || [])].map(key => [key, template])));
  const safe = [], review = [], ignored = [];
  for (const item of record.inventory?.items || []) {
    if (item.definitionRef) { ignored.push({ itemId: item.id, reason: 'already-linked' }); continue; }
    if (isInventoryPlaceholder(item)) { ignored.push({ itemId: item.id, reason: 'placeholder' }); continue; }
    const reference = item.templateId || item.originItemDbKey || item.itemDbKey;
    const template = byKey.get(reference);
    if (!template?.definitionRef) { review.push({ itemId: item.id, name: item.name, reason: reference ? 'unknown-template' : 'no-explicit-template' }); continue; }
    try { assertItemQuantity(itemDefinitionFromTemplate(template) || template, item.quantity ?? 1); }
    catch { review.push({ itemId: item.id, name: item.name, reason: 'incompatible-quantity', templateId: template.id }); continue; }
    const equipment = [...(record.combatProfile?.weapons || []), ...(record.combatProfile?.armorItems || [])].find(entry => entry.inventoryItemId === item.id);
    const rules = item.combatDefinition || (equipment ? { ...equipment, kind: item.category === 'armor' ? 'armor' : 'weapon' } : null);
    const baseline = normalizeItemCombatDefinition(template.combatDefinition, template.category);
    if (rules && JSON.stringify(normalizeItemCombatDefinition(rules, template.category)) !== JSON.stringify(baseline)) {
      review.push({ itemId: item.id, name: item.name, reason: 'different-rules', templateId: template.id }); continue;
    }
    safe.push({ itemId: item.id, name: item.name, definitionRef: template.definitionRef });
  }
  for (const [collection, entries] of [['weapons', record.combatProfile?.weapons], ['armorItems', record.combatProfile?.armorItems]]) {
    for (const entry of entries || []) if (physical(entry) && !(record.inventory?.items || []).some(item => item.id === entry.inventoryItemId))
      review.push({ equipmentId: entry.id, collection, name: entry.name, reason: 'sheet-only' });
  }
  return { recordId: record.id, revision: record.inventory?.revision || 0, safe, review, ignored };
}
