import { inventoryWithCreatureIdentity } from '../item-register/item-register-companions.js';

// Convert an existing narrative companion card into a linked inventory instance.
// The caller persists inventory and creature atomically; no writes occur here.
export function linkCreatureToInventoryCompanion(character, companionId, creature, now = new Date().toISOString()) {
  const inventory = structuredClone(character.inventory || {});
  const matches = (inventory.companions || []).filter(entry => entry.id === companionId);
  if (matches.length !== 1) throw new Error('Die bestehende Gefährtenkarte ist nicht eindeutig.');
  const companion = matches[0];
  const origin = creature.itemOrigin;
  if (!creature.id || origin?.ownerCharacterId !== character.id || !origin.inventoryItemId || !origin.instanceId) {
    throw new Error('Kreatur und Inventar haben keine übereinstimmende Besitzerzuordnung.');
  }
  if (companion.creatureId && companion.creatureId !== creature.id) throw new Error('Die Gefährtenkarte ist bereits mit einer anderen Kreatur verknüpft.');
  if (companion.inventoryItemId && companion.inventoryItemId !== origin.inventoryItemId) throw new Error('Die Gefährtenkarte gehört bereits zu einem anderen Inventareintrag.');
  inventory.items ||= [];
  const existing = inventory.items.filter(item => item.id === origin.inventoryItemId || item.instanceId === origin.instanceId || item.creatureId === creature.id);
  if (existing.length > 1 || (existing.length === 1 && (existing[0].id !== origin.inventoryItemId || existing[0].creatureId !== creature.id
    || (existing[0].instanceId || existing[0].id) !== origin.instanceId))) {
    throw new Error('Die Kreatur oder das Einzelstück ist bereits anders verknüpft.');
  }
  if (!existing.length) {
    inventory.items.push({
      id: origin.inventoryItemId, instanceId: origin.instanceId, creatureId: creature.id,
      name: creature.name, image: creature.portrait, description: creature.notes,
      type: creature.species, category: 'companion', registerCategory: /Pferd|Hengst|Stute/i.test(creature.species) ? 'pferde' : 'vieh',
      templateId: origin.templateId || '', templateName: creature.species,
      quantity: '1', itemStorageMode: 'character', itemDbKey: '', originItemDbKey: '',
      ownerCharacterId: character.id, ownerCharacterName: character.name,
      imageFormat: companion.imageFormat || 'portrait', imageFit: companion.imageFit || 'cover', imagePosition: companion.imagePosition || 'top',
      attributes: [], infoRows: [], individualizedAt: now
    });
  }
  companion.creatureId = creature.id;
  companion.inventoryItemId = origin.inventoryItemId;
  // Reuse the same identity mapping as ordinary edits to a linked creature.
  return inventoryWithCreatureIdentity({ ...character, inventory }, creature);
}
