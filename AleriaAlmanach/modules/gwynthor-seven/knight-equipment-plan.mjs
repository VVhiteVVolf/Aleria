import { GWYNTHOR_SEVEN_LOADOUTS } from './equipment.mjs';
import { createGrantedItem } from '../item-register/item-register-model.js';
import { isInventoryPlaceholder } from '../character-inventory/inventory-placeholders.js';
import { getInventoryEquipmentKind, synchronizeEquipmentFromInventory } from '../character-equipment/character-equipment-sync.js';
import { itemDefinitionKey } from '../item-definitions/item-definition-model.js';

export const KNIGHT_EQUIPMENT_TARGETS = Object.freeze([
  ['caralyn-chwedlonol', 'Caralyn Chwedonol', 'haus-chwedlonol', 'Eka4z7TWpzEgx8KjhIzy'],
  ['rianna-wyrm', 'Rianna Wyrm', 'haus-wyrm'],
  ['lefraye-gafyr', 'Lefraye Gafyr', 'haus-gafyr'],
  ['oweta-draig', 'Oweta Draig', 'haus-draig', 'vk0xAa3ZcEhVvGC1CzNq']
].map(([key, name, familyId, onlineId]) => {
  const worldPersonId = `person--${familyId}--${key}`;
  return Object.freeze({ key, name, familyId, worldPersonId,
    knownIds: Object.freeze([...new Set([onlineId, worldPersonId].filter(Boolean))]) });
}));

const copy = value => structuredClone(value);
const text = value => String(value ?? '').trim();
const nameKey = value => text(value).normalize('NFC').toLocaleLowerCase('de');

function worldIds(character) {
  return [...new Set([character.worldPersonId, character.identity?.worldPersonId,
    character.genealogy?.worldPersonId, text(character.id).startsWith('person--') ? character.id : '']
    .map(text).filter(Boolean))];
}

function matchesTarget(character, target) {
  return target.knownIds.includes(text(character.id)) || worldIds(character).includes(target.worldPersonId)
    || (character.genealogy?.sources || []).some(source => source.familyId === target.familyId && source.personId === target.key);
}

function resolveTarget(records, target, label) {
  const matches = records.filter(character => matchesTarget(character, target));
  if (matches.length > 1) throw Error(`${target.name}: mehrdeutige ${label}-Identität (${matches.map(c => c.id).join(', ')}).`);
  const character = matches[0];
  if (!character) {
    if (records.some(c => nameKey(c.name) === nameKey(target.name))) {
      throw Error(`${target.name}: vorhandene ${label}-Akte ohne eindeutige passende Weltidentität.`);
    }
    return null;
  }
  const conflicts = worldIds(character).filter(id => id !== target.worldPersonId);
  if (!text(character.id) || conflicts.length || KNIGHT_EQUIPMENT_TARGETS.some(other => other !== target && matchesTarget(character, other))) {
    throw Error(`${target.name}: widersprüchliche ${label}-Identität.`);
  }
  return character;
}

function templateIndex(templates) {
  if (!Array.isArray(templates)) throw TypeError('Itemvorlagen müssen als Array übergeben werden.');
  const index = new Map();
  const definitions = new Map();
  for (const template of templates) {
    if (index.has(template.id)) throw Error(`Doppelte Itemvorlage: ${template.id}`);
    index.set(template.id, template);
    const refKey = itemDefinitionKey(template.definitionRef);
    if (refKey) definitions.set(refKey, template);
  }
  return { index, definitions };
}

function loadoutSlots(target, index) {
  const loadout = GWYNTHOR_SEVEN_LOADOUTS[target.key];
  if (!loadout) throw Error(`Besitzliste fehlt: ${target.key}`);
  return loadout.flatMap(([key, quantity, equipped]) => {
    const template = index.get(`gwynthor-seven:${key}`);
    if (!template) throw Error(`Itemvorlage fehlt: gwynthor-seven:${key}`);
    const individual = ['weapon', 'armor'].includes(template.combatDefinition?.kind);
    return Array.from({ length: individual ? quantity : 1 }, () => ({ key, template, quantity: individual ? 1 : quantity, equipped }));
  });
}

function matchesTemplate(item, template) {
  return item.templateId === (template.templateId || template.id)
    || Boolean(item.definitionRef?.id && item.definitionRef.id === (template.definitionRef?.id || template.id));
}

function occupiedKinds(items, profile) {
  const kinds = new Set(items.filter(item => item.equipped === true).map(getInventoryEquipmentKind));
  if ((profile.weapons || []).some(entry => entry.equipped === true && entry.weaponType !== 'unarmed' && entry.id !== 'default-unarmed-melee')) kinds.add('weapon');
  if ((profile.armorItems || []).some(entry => entry.equipped === true)) kinds.add('armor');
  return kinds;
}

function addMissingItems(character, target, slots, now) {
  const inventory = character.inventory || {};
  if (inventory.items != null && !Array.isArray(inventory.items)) throw Error(`${target.name}: ungültige Inventarliste.`);
  const originalItems = inventory.items || [];
  const removedPlaceholderIds = originalItems.filter(isInventoryPlaceholder).map(item => item.id);
  const items = originalItems.filter(item => !isInventoryPlaceholder(item));
  const ids = items.map(item => text(item.id));
  if (ids.some(id => !id) || new Set(ids).size !== ids.length) throw Error(`${target.name}: fehlende oder doppelte Besitz-ID.`);
  const used = new Set();
  const occupied = occupiedKinds(items, character.combatProfile || {});
  const addedItemIds = [];
  const targetItems = [];
  const templates = [...new Set(slots.map(slot => slot.template))];
  const slotIds = new Set(slots.map((slot, index) => `${target.key}-${slot.key}-${index + 1}`));
  for (const item of items) {
    if (templates.filter(template => matchesTemplate(item, template)).length > 1) throw Error(`${target.name}: widersprüchliche Itemreferenz ${item.id}.`);
  }
  slots.forEach((slot, index) => {
    const deterministicId = `${target.key}-${slot.key}-${index + 1}`;
    const candidates = items.filter(item => !used.has(item.id) && matchesTemplate(item, slot.template));
    const existing = candidates.find(item => item.id === deterministicId)
      || candidates.find(item => !slotIds.has(item.id) && !slotIds.has(item.instanceId));
    if (existing) {
      used.add(existing.id);
      targetItems.push(existing);
      return;
    }
    if (items.some(item => item.id === deterministicId || item.instanceId === deterministicId)) {
      throw Error(`${target.name}: Besitz-ID ${deterministicId} ist bereits anders belegt.`);
    }
    const item = createGrantedItem(slot.template, { id: deterministicId, characterId: character.id,
      characterName: character.name || target.name, quantity: slot.quantity, now });
    const kind = slot.template.combatDefinition?.kind;
    item.equipped = slot.equipped === true && !occupied.has(kind);
    if (item.equipped && kind) occupied.add(kind);
    items.push(item);
    used.add(item.id);
    targetItems.push(item);
    addedItemIds.push(item.id);
  });
  // Include any extra existing pieces of the same templates without granting or
  // reconfiguring them. Consumed stack amounts and customized pieces stay intact.
  for (const item of items) {
    if (!used.has(item.id) && templates.some(template => matchesTemplate(item, template))) targetItems.push(item);
  }
  return { inventory: { ...inventory, items }, targetItems, addedItemIds, removedPlaceholderIds };
}

function linkMissingAmmunition(targetItems) {
  const arrows = targetItems.find(item => item.templateId === 'gwynthor-seven:standardpfeil'
    || item.definitionRef?.id === 'gwynthor-seven:standardpfeil');
  if (!arrows) return;
  const bows = ['gwynthor-seven:helwyr-langbogen', 'gwynthor-seven:helwyr-kurzbogen'];
  for (const item of targetItems) {
    if (bows.includes(item.templateId) || bows.includes(item.definitionRef?.id)) {
      if (!text(item.itemState?.ammunitionItemId)) item.itemState = { ...item.itemState, ammunitionItemId: arrows.id };
    }
  }
}

function appendMissingCombatLinks(character, targetItems, definitions) {
  const profile = character.combatProfile || {};
  for (const collection of ['weapons', 'armorItems']) {
    if (profile[collection] != null && !Array.isArray(profile[collection])) throw Error(`${character.name}: ungültige Ausrüstungsliste ${collection}.`);
  }
  const linkedIds = new Set(['weapons', 'armorItems'].flatMap(key => profile[key] || []).map(entry => entry.inventoryItemId).filter(Boolean));
  const unlinked = targetItems.filter(item => !linkedIds.has(item.id) && getInventoryEquipmentKind(item));
  for (const item of unlinked) {
    if (item.definitionRef && !definitions.has(itemDefinitionKey(item.definitionRef))) {
      throw Error(`${character.name}: gebundene Itemversion fehlt für ${item.id}.`);
    }
  }
  const generated = synchronizeEquipmentFromInventory({ inventory: { items: unlinked }, combatProfile: {},
    addMissingEquipment: true, definitions }).combatProfile;
  for (const collection of ['weapons', 'armorItems']) {
    const additions = generated[collection] || [];
    if (!additions.length) continue;
    const existing = profile[collection] || [];
    if (additions.some(entry => existing.some(prior => prior.id === entry.id))) throw Error(`${character.name}: kollidierende Kampf-Ausrüstungs-ID.`);
    profile[collection] = [...existing, ...additions];
  }
  character.combatProfile = profile;
}

/** Pure, additive publication plan. Existing characters are never normalized. */
export function planKnightEquipment({ characters, seeds = [], templates, now = '' } = {}) {
  if (!Array.isArray(characters) || !Array.isArray(seeds)) throw TypeError('Charaktere und Startakten müssen Arrays sein.');
  const { index, definitions } = templateIndex(templates);
  const entries = KNIGHT_EQUIPMENT_TARGETS.map(target => {
    const before = resolveTarget(characters, target, 'Online');
    const source = before || resolveTarget(seeds, target, 'Start');
    if (!source) throw Error(`${target.name}: keine bestehende Akte und keine eindeutige Startakte.`);
    const character = copy(source);
    if (before && character.combatProfile == null) {
      const seed = resolveTarget(seeds, target, 'Start');
      const { weapons, armorItems, ...initialProfile } = copy(seed?.combatProfile || {});
      character.combatProfile = initialProfile;
    }
    const { inventory, targetItems, addedItemIds, removedPlaceholderIds } = addMissingItems(character, target, loadoutSlots(target, index), now);
    character.inventory = inventory;
    linkMissingAmmunition(targetItems);
    appendMissingCombatLinks(character, targetItems, definitions);
    if (JSON.stringify(source.inventory || {}) !== JSON.stringify(character.inventory)) {
      const priorRevision = Number(source.inventory?.revision);
      character.inventory.revision = (Number.isSafeInteger(priorRevision) && priorRevision >= 0 ? priorRevision : 0) + 1;
    }
    return { key: target.key, before: before ? copy(before) : null, character, create: !before,
      changed: !before || JSON.stringify(before) !== JSON.stringify(character), addedItemIds, removedPlaceholderIds };
  });
  return { entries, targetCount: entries.length, createdCount: entries.filter(entry => entry.create).length,
    changedCount: entries.filter(entry => entry.changed).length,
    addedItemCount: entries.reduce((sum, entry) => sum + entry.addedItemIds.length, 0),
    removedPlaceholderCount: entries.reduce((sum, entry) => sum + entry.removedPlaceholderIds.length, 0) };
}
