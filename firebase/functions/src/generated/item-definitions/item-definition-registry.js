import { STANDARD_ITEMS } from '../item-register/item-register-standard.js';
import { AUTHORED_ITEMS } from './authored-item-catalog.js';
import { itemDefinitionFromTemplate, itemDefinitionKey, itemDefinitionContent, normalizeItemDefinition, normalizeItemDefinitionRef } from './item-definition-model.js';
import { ARCHIVED_ITEM_DEFINITIONS } from './item-definition-versions.js';

// The only mutable state here is a cache of immutable, publicly readable rule
// versions. No owner, inventory, money or live combat state is held in it.
export function createItemDefinitionRegistry(templates = [...STANDARD_ITEMS, ...AUTHORED_ITEMS]) {
  const builtinIds = new Set(templates.map(template=>template.id));
  const versions = new Map();
  const heads = new Map();
  function add(definitions, { current = true } = {}) {
    for (const definition of definitions) {
      if (!normalizeItemDefinitionRef(definition)) continue;
      const key = itemDefinitionKey(definition);
      const previous = versions.get(key);
      const normalized = normalizeItemDefinition(definition);
      if (previous && itemDefinitionContent(previous) !== itemDefinitionContent(normalized)) throw Error('Eine veröffentlichte Itemversion darf nicht verändert werden.');
      versions.set(key, normalized);
      if (current) heads.set(definition.id, key);
    }
  }
  add(ARCHIVED_ITEM_DEFINITIONS, { current: false });
  add(templates.map(itemDefinitionFromTemplate).filter(Boolean));
  return Object.freeze({
    add,
    isBuiltin(id) { return builtinIds.has(String(id || '')); },
    get(reference) { const value = versions.get(itemDefinitionKey(reference)); return value ? structuredClone(value) : null; },
    current(id) { const value = versions.get(heads.get(id)); return value ? structuredClone(value) : null; },
    values() { return [...heads.values()].map(key => structuredClone(versions.get(key))); }
  });
}
export const itemDefinitionRegistry = createItemDefinitionRegistry();
