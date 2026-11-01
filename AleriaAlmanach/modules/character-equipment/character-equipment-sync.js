// Bidirektionale Verknüpfung zwischen Besitz (Inventar) und regelwirksamer
// Ausrüstung (Kampfprofil). Das Inventar bleibt der Besitzdatensatz; Waffen und
// Rüstungen im Kampfprofil sind eine editierbare, synchronisierte Ansicht.

export const CHARACTER_EQUIPMENT_LINK_SCHEMA_VERSION = 1;
import { normalizeEquipmentDamageProtection } from './equipment-damage-protection.js';
import { applyArmorBalance, balanceArmorInventoryItem } from './equipment-armor-rules.js';
import { materializeInventoryItem, storeInventoryItem, storeDefinitionInventory, resolveItemDefinition } from '../item-definitions/item-definition-resolver.js';

const EQUIPMENT_KINDS = Object.freeze({ weapon: 'weapons', armor: 'armorItems' });

function clone(value) {
  if (value == null || typeof value !== 'object') return value;
  if (typeof structuredClone === 'function') return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

function text(value, fallback = '') {
  const result = String(value ?? '').trim();
  return result || fallback;
}

function equipmentId(kind, entryId, usedIds = new Set()) {
  const stem = `equipment-${kind}-${text(entryId, 'item')}`
    .toLocaleLowerCase('de')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100) || `equipment-${kind}`;
  let candidate = stem;
  let suffix = 2;
  while (usedIds.has(candidate)) candidate = `${stem}-${suffix++}`;
  usedIds.add(candidate);
  return candidate;
}

function equipmentKindFromInventoryItem(item = {}) {
  if (item.definitionRef && item.combatDefinition) return item.combatDefinition.kind;
  const category = text(item.category || item.type).toLocaleLowerCase('de');
  const linkedKind = text(item.equipmentLink?.kind || item.combatDefinition?.kind).toLocaleLowerCase('de');
  if (linkedKind === 'weapon' || category === 'weapon' || /waffe|schwert|dolch|bogen|speer|axt|keule/.test(category)) return 'weapon';
  if (linkedKind === 'armor' || category === 'armor' || /r[uü]stung|schild|schutz/.test(category)) return 'armor';
  return '';
}

function weaponCombatDefinition(entry = {}) {
  return {
    kind: 'weapon',
    triggerRules: clone(entry.triggerRules || []),
    weaponType: text(entry.weaponType, 'other'),
    weaponProfileId: text(entry.weaponProfileId),
    training: text(entry.training, 'simple'),
    damageFormula: text(entry.damageFormula),
    versatileDamageFormula: text(entry.versatileDamageFormula),
    damageType: text(entry.damageType, 'physisch'),
    attackAttribute: text(entry.attackAttribute, 'strength'),
    proficient: entry.proficient !== false,
    attackBonus: Number(entry.attackBonus) || 0,
    damageBonus: Number(entry.damageBonus) || 0,
    range: text(entry.range, 'Nahkampf'),
    properties: text(entry.properties),
    notes: text(entry.notes),
    requirements: text(entry.requirements),
    aiInstructions: text(entry.aiInstructions)
  };
}

function armorCombatDefinition(entry = {}) {
  entry = applyArmorBalance(entry);
  return {
    kind: 'armor',
    ...(entry.armorRuleVersion === 2 ? { armorRuleVersion: 2 } : {}),
    ...(entry.equipCosts?.length ? { equipCosts: clone(entry.equipCosts) } : {}),
    mechanics: clone(entry.mechanics || {}),
    damageProtection: normalizeEquipmentDamageProtection(entry.damageProtection),
    triggerRules: clone(entry.triggerRules || []),
    armorKind: text(entry.kind, 'armor'),
    armorCategory: text(entry.armorCategory),
    baseArmorClass: entry.baseArmorClass == null || entry.baseArmorClass === '' ? null : Number(entry.baseArmorClass),
    armorClassBonus: Number(entry.armorClassBonus) || 0,
    dexterityMode: text(entry.dexterityMode, 'full'),
    dexterityCap: Number(entry.dexterityCap) || 0,
    dexterityUnlockLevel: Math.max(0, Number(entry.dexterityUnlockLevel) || 0),
    properties: text(entry.properties),
    notes: text(entry.notes)
  };
}

function inventoryItemFromCombat(entry, kind, context, usedIds) {
  const id = text(entry.inventoryItemId) || equipmentId(kind, entry.id, usedIds);
  const definition = kind === 'weapon' ? weaponCombatDefinition(entry) : armorCombatDefinition(entry);
  return {
    id,
    itemDbKey: '',
    originItemDbKey: '',
    itemStorageMode: 'character',
    ownerCharacterId: text(context.characterId),
    ownerCharacterName: text(context.characterName),
    acquiredAt: text(context.now, new Date().toISOString()),
    individualizedAt: '',
    category: kind,
    icon: '',
    image: text(entry.image),
    imageFormat: 'square',
    imageFit: 'contain',
    imagePosition: 'center',
    name: text(entry.name, kind === 'weapon' ? 'Unbenannte Waffe' : 'Unbenannte Rüstung'),
    type: kind === 'weapon' ? 'Waffe' : 'Rüstung',
    description: text(entry.notes || entry.properties),
    weight: '',
    quantity: '1',
    tags: text(entry.properties),
    equipped: entry.equipped === true,
    combatDefinition: definition,
    equipmentLink: {
      schemaVersion: CHARACTER_EQUIPMENT_LINK_SCHEMA_VERSION,
      kind,
      combatEntryId: text(entry.id)
    },
    infoRows: [],
    attributes: []
  };
}

function mergeInventoryItemFromCombat(item, entry, kind) {
  if (item.definitionRef) return storeInventoryItem({ ...item,
    name: text(entry.name, item.name), image: text(entry.image, item.image), equipped: entry.equipped === true,
    equipmentLink: { schemaVersion: CHARACTER_EQUIPMENT_LINK_SCHEMA_VERSION, kind, combatEntryId: text(entry.id) } });
  const definition = kind === 'weapon' ? weaponCombatDefinition(entry) : armorCombatDefinition(entry);
  return {
    ...item,
    category: kind,
    name: text(entry.name, item.name),
    image: text(entry.image, item.image),
    type: text(item.type, kind === 'weapon' ? 'Waffe' : 'Rüstung'),
    description: text(item.description, entry.notes || entry.properties),
    tags: text(entry.properties, item.tags),
    equipped: entry.equipped === true,
    combatDefinition: definition,
    equipmentLink: {
      schemaVersion: CHARACTER_EQUIPMENT_LINK_SCHEMA_VERSION,
      kind,
      combatEntryId: text(entry.id)
    }
  };
}

function combatEntryFromInventory(item, entry, kind) {
  const definition = item.combatDefinition && typeof item.combatDefinition === 'object'
    ? item.combatDefinition
    : {};
  const ruleText = (key, previous, fallback = '') => item.definitionRef && Object.hasOwn(definition, key)
    ? String(definition[key] ?? '').trim() : text(definition[key], previous || fallback);
  if (kind === 'weapon') {
    return {
      ...entry,
      ...(item.definitionRef ? {
        effects: clone(definition.effects || []), activationType: definition.activationType || 'action',
        costs: clone(definition.costs || []), auraBypass: clone(definition.auraBypass || { allowed: true, resourceId: '', cost: 1 }),
        spendAllRegularActions: definition.spendAllRegularActions === true,
        ammunition: definition.ammunition ? { ...clone(definition.ammunition), inventoryItemId: text(item.itemState?.ammunitionItemId || entry.ammunition?.inventoryItemId) } : null
      } : {}),
      inventoryItemId: text(item.id),
      equipped: typeof item.equipped === 'boolean' ? item.equipped : entry.equipped === true,
      name: text(item.name, entry.name),
      image: text(item.image || item.icon, entry.image),
      weaponType: text(definition.weaponType, entry.weaponType),
      weaponProfileId: ruleText('weaponProfileId', entry.weaponProfileId),
      triggerRules: clone(definition.triggerRules ?? entry.triggerRules ?? []),
      training: text(definition.training, entry.training),
      damageFormula: text(definition.damageFormula, entry.damageFormula),
      versatileDamageFormula: ruleText('versatileDamageFormula', entry.versatileDamageFormula),
      damageType: text(definition.damageType, entry.damageType),
      attackAttribute: text(definition.attackAttribute, entry.attackAttribute),
      proficient: definition.proficient == null ? entry.proficient !== false : definition.proficient !== false,
      attackBonus: Number(definition.attackBonus ?? entry.attackBonus) || 0,
      damageBonus: Number(definition.damageBonus ?? entry.damageBonus) || 0,
      range: text(definition.range, entry.range),
      properties: ruleText('properties', entry.properties),
      notes: text(definition.notes || item.description, entry.notes),
      requirements: ruleText('requirements', entry.requirements),
      aiInstructions: ruleText('aiInstructions', entry.aiInstructions)
    };
  }
  const { armorRuleVersion, equipCosts, ...unversionedEntry } = entry;
  return applyArmorBalance({
    ...(item.definitionRef ? unversionedEntry : entry),
    ...(definition.armorRuleVersion === 2 ? { armorRuleVersion: 2 } : {}),
    ...(definition.equipCosts?.length ? { equipCosts: clone(definition.equipCosts) } : {}),
    ...(item.definitionRef ? { definitionRef: clone(item.definitionRef), definitionTitle: text(item.definitionTitle) } : {}),
    inventoryItemId: text(item.id),
    equipped: typeof item.equipped === 'boolean' ? item.equipped : entry.equipped === true,
    name: text(item.name, entry.name),
    image: text(item.image || item.icon, entry.image),
    kind: text(definition.armorKind, entry.kind),
    armorCategory: ruleText('armorCategory', entry.armorCategory),
    mechanics: clone(definition.mechanics ?? entry.mechanics ?? {}),
    damageProtection: normalizeEquipmentDamageProtection(definition.damageProtection === undefined ? entry.damageProtection : definition.damageProtection),
    triggerRules: clone(definition.triggerRules ?? entry.triggerRules ?? []),
    baseArmorClass: definition.baseArmorClass === undefined ? entry.baseArmorClass ?? null
      : definition.baseArmorClass === null ? null : Number(definition.baseArmorClass),
    armorClassBonus: Number(definition.armorClassBonus ?? entry.armorClassBonus) || 0,
    dexterityMode: text(definition.dexterityMode, entry.dexterityMode || 'full'),
    dexterityCap: Number(definition.dexterityCap ?? entry.dexterityCap) || 0,
    dexterityUnlockLevel: definition.dexterityUnlockLevel == null
      ? Math.max(0, Number(entry.dexterityUnlockLevel) || 0)
      : Math.max(0, Number(definition.dexterityUnlockLevel) || 0),
    properties: ruleText('properties', entry.properties),
    notes: text(definition.notes || item.description, entry.notes)
  });
}

export function synchronizeEquipmentFromCombat({ inventory = {}, combatProfile = {}, characterId = '', characterName = '', now = '' } = {}) {
  const nextInventory = clone(inventory && typeof inventory === 'object' ? inventory : {});
  const nextProfile = clone(combatProfile && typeof combatProfile === 'object' ? combatProfile : {});
  nextInventory.items = Array.isArray(nextInventory.items) ? nextInventory.items.map(balanceArmorInventoryItem) : [];
  const usedIds = new Set(nextInventory.items.map(item => text(item?.id)).filter(Boolean));
  const context = { characterId, characterName, now };

  Object.entries(EQUIPMENT_KINDS).forEach(([kind, collectionName]) => {
    const entries = Array.isArray(nextProfile[collectionName]) ? nextProfile[collectionName] : [];
    entries.forEach(entry => {
      if (kind === 'weapon' && entry.id === 'default-unarmed-melee' && !entry.inventoryItemId) return;
      let inventoryItemId = text(entry.inventoryItemId);
      let itemIndex = nextInventory.items.findIndex(item => text(item?.id) === inventoryItemId);
      if (itemIndex < 0) {
        const item = inventoryItemFromCombat(entry, kind, context, usedIds);
        inventoryItemId = item.id;
        nextInventory.items.push(item);
        itemIndex = nextInventory.items.length - 1;
      } else {
        nextInventory.items[itemIndex] = mergeInventoryItemFromCombat(nextInventory.items[itemIndex], entry, kind);
      }
      entry.inventoryItemId = inventoryItemId;
      nextInventory.items[itemIndex] = mergeInventoryItemFromCombat(nextInventory.items[itemIndex], entry, kind);
    });
  });

  return { inventory: nextInventory, combatProfile: nextProfile };
}

export function synchronizeEquipmentFromInventory({ inventory = {}, combatProfile = {}, addMissingEquipment = false, definitions, preserveLoadout = false } = {}) {
  const nextInventory = clone(inventory && typeof inventory === 'object' ? inventory : {});
  const nextProfile = clone(combatProfile && typeof combatProfile === 'object' ? combatProfile : {});
  nextInventory.items = Array.isArray(nextInventory.items) ? nextInventory.items.map(balanceArmorInventoryItem) : [];
  const itemsById = new Map(nextInventory.items.map(item => [text(item?.id), item]));

  Object.entries(EQUIPMENT_KINDS).forEach(([kind, collectionName]) => {
    const entries = Array.isArray(nextProfile[collectionName]) ? nextProfile[collectionName] : [];
    nextProfile[collectionName] = entries
      .filter(entry => !entry.inventoryItemId || itemsById.has(text(entry.inventoryItemId)))
      .map(entry => {
        const source = itemsById.get(text(entry.inventoryItemId));
        const definition = source?.definitionRef ? resolveItemDefinition(source, definitions) : null;
        if (source?.definitionRef && !definition) return entry;
        if (definition && definition.combatDefinition?.kind !== kind) return null;
        const item = source ? materializeInventoryItem(source, definitions) : null;
        if (!item || equipmentKindFromInventoryItem(item) !== kind) return entry;
        return combatEntryFromInventory(preserveLoadout ? { ...item, equipped: entry.equipped === true } : item, entry, kind);
      }).filter(Boolean);
    if (addMissingEquipment) {
      for (const source of nextInventory.items) {
        const item = materializeInventoryItem(source, definitions);
        if (!item.combatDefinition || equipmentKindFromInventoryItem(item) !== kind) continue;
        if (nextProfile[collectionName].some(entry => text(entry.inventoryItemId) === text(item.id))) continue;
        const id = text(item.equipmentLink?.combatEntryId || item.id);
        if (!id || nextProfile[collectionName].some(entry => entry.id === id)) continue;
        nextProfile[collectionName].push(combatEntryFromInventory(item, { id, inventoryItemId: item.id }, kind));
      }
    }
  });

  return { inventory: storeDefinitionInventory(nextInventory), combatProfile: nextProfile };
}

export function getInventoryEquipmentKind(item = {}) {
  return equipmentKindFromInventoryItem(item);
}

export const characterEquipmentSyncInternals = Object.freeze({
  weaponCombatDefinition,
  armorCombatDefinition,
  combatEntryFromInventory,
  inventoryItemFromCombat
});

// Klassische Charakter-Editor-Skripte können dieses ES-Modul nicht direkt importieren. Die
// schmale, featurebezogene Brücke hält die Synchronisationslogik trotzdem an genau einer Stelle.
globalThis.AleriaCharacterEquipmentSync = Object.freeze({
  synchronizeFromCombat: synchronizeEquipmentFromCombat,
  synchronizeFromInventory: synchronizeEquipmentFromInventory
});
