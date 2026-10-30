import { inventoryWithCreatureIdentity } from '../item-register/item-register-companions.js';
import { inferCreatureGenus } from './creature-classification.js?v=20261012-carreg-v1';

export function isUnassignedCompanionCard(card = {}) {
  return ['Reittier / Gefährte', 'Treuer Begleiter'].includes(card.name)
    && !card.image && !card.description && !card.creatureId && !card.inventoryItemId
    && ['Tier oder Begleiter', 'Tier / Person'].includes(card.species);
}

// Release a named companion without touching any other possession or live state.
export function detachCreatureFromInventory(character, creatureId) {
  if (!creatureId) throw new Error('Kreaturen-ID fehlt.');
  const inventory = structuredClone(character.inventory || {});
  const linkedItems = new Set((inventory.companions || []).filter(card => card.creatureId === creatureId)
    .map(card => card.inventoryItemId).filter(Boolean));
  if (inventory.companions) inventory.companions = inventory.companions.filter(card => card.creatureId !== creatureId);
  if (inventory.items) inventory.items = inventory.items.filter(item => {
    if (linkedItems.has(item.id) && item.creatureId && item.creatureId !== creatureId) {
      throw new Error('Widersprüchliche Gefährtenverknüpfung.');
    }
    return item.creatureId !== creatureId && !linkedItems.has(item.id);
  });
  return inventory;
}

// Add a named animal or reuse its existing card. Empty starter cards carry no ownership.
export function attachCreatureToInventory(character, creature, now = new Date().toISOString()) {
  const inventory = structuredClone(character.inventory || {});
  inventory.companions ||= [];
  const matches = inventory.companions.filter(card => card.creatureId === creature.id || card.name === creature.name);
  if (matches.length > 1) throw new Error(`Mehrdeutige Gefährtenkarte: ${creature.name}`);
  let card = matches[0];
  if (!card) {
    card = inventory.companions.find(isUnassignedCompanionCard);
    const data = { name: creature.name, species: creature.species, image: creature.portrait,
      description: creature.notes, summary: creature.biography?.summary || creature.notes,
      role: inferCreatureGenus(creature) === 'Pferde' ? 'Reittier' : 'Gefährte', status: 'Gesund',
      imageFormat: 'portrait', imageFit: 'contain', imagePosition: 'center', attributes: [], infoRows: [] };
    if (card) Object.assign(card, data);
    else { card = { id: `card-${creature.itemOrigin?.instanceId}`, ...data }; inventory.companions.push(card); }
  }
  const item = inventory.items?.find(item => item.id === creature.itemOrigin?.inventoryItemId);
  if (card.creatureId === creature.id && card.inventoryItemId === item?.id
    && item?.instanceId === creature.itemOrigin?.instanceId && item?.creatureId === creature.id
    && item.name === creature.name && item.image === creature.portrait && item.description === creature.notes
    && creature.itemOrigin?.ownerCharacterId === character.id) return inventory;
  return linkCreatureToInventoryCompanion({ ...character, inventory }, card.id, creature, now);
}

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
      type: creature.species, category: 'companion', registerCategory: inferCreatureGenus(creature) === 'Pferde' ? 'pferde' : 'vieh',
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
  return inventoryWithCreatureIdentity({ ...character, inventory }, creature, now);
}
