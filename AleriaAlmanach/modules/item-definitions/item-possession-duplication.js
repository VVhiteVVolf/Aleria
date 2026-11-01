import { resolveItemDefinition } from './item-definition-resolver.js';
export function duplicateItemPossessions(inventory, combatProfile, ownerName = '') {
  if (!inventory) return {};
  const copy = structuredClone(inventory), profile = structuredClone(combatProfile), ids = new Map();
  for (const item of copy.items || []) {
    const definition = resolveItemDefinition(item);
    if (item.definitionRef && !definition) throw Error('Vor dem Kopieren muss die Regelversion der Ausrüstung geladen sein.');
    if (definition?.kind === 'unique') throw Error('Ein Bogen mit einem Unikat kann nicht samt diesem Gegenstand kopiert werden. Lege für die neue Figur eine eigene Ausrüstung an.');
    const old = item.id, id = `possession-${crypto.randomUUID()}`;
    ids.set(old, id); item.id = id; item.instanceId = id; item.creatureId = ''; item.purchase = null;
    item.ownerCharacterId = ''; item.ownerCharacterName = ownerName;
  }
  for (const collection of ['weapons', 'armorItems']) for (const entry of profile[collection] || []) {
    if (ids.has(entry.inventoryItemId)) entry.inventoryItemId = ids.get(entry.inventoryItemId);
    if (entry.ammunition && ids.has(entry.ammunition.inventoryItemId)) entry.ammunition.inventoryItemId = ids.get(entry.ammunition.inventoryItemId);
  }
  return { inventory: copy, combatProfile: profile };
}
