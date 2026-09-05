// Bidirektionale Verknüpfung zwischen Besitz (Inventar) und regelwirksamer
// Ausrüstung (Kampfprofil). Das Inventar bleibt der Besitzdatensatz; Waffen und
// Rüstungen im Kampfprofil sind eine editierbare, synchronisierte Ansicht.

export const CHARACTER_EQUIPMENT_LINK_SCHEMA_VERSION = 1;

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
  const category = text(item.category || item.type).toLocaleLowerCase('de');
  const linkedKind = text(item.equipmentLink?.kind || item.combatDefinition?.kind).toLocaleLowerCase('de');
  if (linkedKind === 'weapon' || category === 'weapon' || /waffe|schwert|dolch|bogen|speer|axt|keule/.test(category)) return 'weapon';
  if (linkedKind === 'armor' || category === 'armor' || /r[uü]stung|schild|schutz/.test(category)) return 'armor';
  return '';
}

function weaponCombatDefinition(entry = {}) {
  return {
    kind: 'weapon',
    weaponType: text(entry.weaponType, 'other'),
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
  return {
    kind: 'armor',
    armorKind: text(entry.kind, 'armor'),
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
  const definition = kind === 'weapon' ? weaponCombatDefinition(entry) : armorCombatDefinition(entry);
  return {
    ...item,
    category: kind,
    name: text(entry.name, item.name),
    image: text(entry.image, item.image),
    type: text(item.type, kind === 'weapon' ? 'Waffe' : 'Rüstung'),
    description: text(entry.notes || entry.properties, item.description),
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
  if (kind === 'weapon') {
    return {
      ...entry,
      inventoryItemId: text(item.id),
      name: text(item.name, entry.name),
      image: text(item.image || item.icon, entry.image),
      weaponType: text(definition.weaponType, entry.weaponType),
      training: text(definition.training, entry.training),
      damageFormula: text(definition.damageFormula, entry.damageFormula),
      versatileDamageFormula: text(definition.versatileDamageFormula, entry.versatileDamageFormula),
      damageType: text(definition.damageType, entry.damageType),
      attackAttribute: text(definition.attackAttribute, entry.attackAttribute),
      proficient: definition.proficient == null ? entry.proficient : definition.proficient !== false,
      attackBonus: definition.attackBonus == null ? entry.attackBonus : Number(definition.attackBonus) || 0,
      damageBonus: definition.damageBonus == null ? entry.damageBonus : Number(definition.damageBonus) || 0,
      range: text(definition.range, entry.range),
      properties: text(definition.properties, entry.properties),
      notes: text(definition.notes || item.description, entry.notes),
      requirements: text(definition.requirements, entry.requirements),
      aiInstructions: text(definition.aiInstructions, entry.aiInstructions)
    };
  }
  return {
    ...entry,
    inventoryItemId: text(item.id),
    name: text(item.name, entry.name),
    image: text(item.image || item.icon, entry.image),
    kind: text(definition.armorKind, entry.kind),
    baseArmorClass: definition.baseArmorClass == null ? entry.baseArmorClass : Number(definition.baseArmorClass),
    armorClassBonus: definition.armorClassBonus == null ? entry.armorClassBonus : Number(definition.armorClassBonus) || 0,
    dexterityMode: text(definition.dexterityMode, entry.dexterityMode),
    dexterityCap: definition.dexterityCap == null ? entry.dexterityCap : Number(definition.dexterityCap) || 0,
    dexterityUnlockLevel: definition.dexterityUnlockLevel == null
      ? entry.dexterityUnlockLevel
      : Math.max(0, Number(definition.dexterityUnlockLevel) || 0),
    properties: text(definition.properties, entry.properties),
    notes: text(definition.notes || item.description, entry.notes)
  };
}

export function synchronizeEquipmentFromCombat({ inventory = {}, combatProfile = {}, characterId = '', characterName = '', now = '' } = {}) {
  const nextInventory = clone(inventory && typeof inventory === 'object' ? inventory : {});
  const nextProfile = clone(combatProfile && typeof combatProfile === 'object' ? combatProfile : {});
  nextInventory.items = Array.isArray(nextInventory.items) ? nextInventory.items : [];
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

export function synchronizeEquipmentFromInventory({ inventory = {}, combatProfile = {} } = {}) {
  const nextInventory = clone(inventory && typeof inventory === 'object' ? inventory : {});
  const nextProfile = clone(combatProfile && typeof combatProfile === 'object' ? combatProfile : {});
  nextInventory.items = Array.isArray(nextInventory.items) ? nextInventory.items : [];
  const itemsById = new Map(nextInventory.items.map(item => [text(item?.id), item]));

  Object.entries(EQUIPMENT_KINDS).forEach(([kind, collectionName]) => {
    const entries = Array.isArray(nextProfile[collectionName]) ? nextProfile[collectionName] : [];
    nextProfile[collectionName] = entries
      .filter(entry => !entry.inventoryItemId || itemsById.has(text(entry.inventoryItemId)))
      .map(entry => {
        const item = itemsById.get(text(entry.inventoryItemId));
        if (!item || equipmentKindFromInventoryItem(item) !== kind) return entry;
        return combatEntryFromInventory(item, entry, kind);
      });
  });

  return { inventory: nextInventory, combatProfile: nextProfile };
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
