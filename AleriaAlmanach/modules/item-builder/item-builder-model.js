import { normalizeItemDefinition, itemDefinitionFromTemplate } from '../item-definitions/item-definition-model.js';
import { itemDefinitionRegistry } from '../item-definitions/item-definition-registry.js';

export function itemBuilderDraft(source = null, { intent = source ? 'existing' : 'variant' } = {}) {
  const definition = source?.definitionRef ? itemDefinitionRegistry.get(source.definitionRef) || itemDefinitionFromTemplate(source) : null;
  const draft = definition || normalizeItemDefinition({ id: 'item:preview', revision: 'draft', title: source?.title || source?.name || 'Neuer Gegenstand',
    category: source?.registerCategory || ({ weapon: 'waffen', armor: 'ruestungen', food: 'speisen', potions: 'alchemie' }[source?.category]) || source?.category || 'sonstiges', description: source?.description || '',
    image: source?.image || '', combatDefinition: source?.combatDefinition, inventoryUseMode: source?.inventoryUseMode });
  return { ...structuredClone(draft), intent, sourceId: source?.id || '',
    id: intent === 'edit' ? definition?.id : '', revision: intent === 'edit' ? definition?.revision : '',
    baseRef: source?.definitionRef ? { ...source.definitionRef } : null };
}
export function definitionFromBuilderDraft(draft) {
  if (draft.intent === 'existing') throw Error('Vorhandene Definitionen werden direkt ausgewählt.');
  const kind = draft.intent === 'unique' ? 'unique' : draft.kind === 'unique' && draft.intent === 'edit' ? 'unique' : 'shared';
  return normalizeItemDefinition({ ...draft, kind,
    ...(draft.category === 'ruestungen' ? { combatDefinition: { ...draft.combatDefinition, armorRuleVersion: 2 } } : {})
  }, { id: draft.id || `${kind === 'unique' ? 'unique' : 'item'}:preview`, revision: 'draft' });
}
