const INVENTORY_USE_MODES = new Set(['auto', 'consume', 'use']);
const CONSUMABLE_CATEGORIES = new Set(['potions', 'consumable', 'consumables', 'food', 'ammunition']);
const REUSABLE_CATEGORIES = new Set(['weapon', 'armor']);
const CONSUMABLE_PATTERN = /(?:trank|trinktur|elixier|nahrung|proviant|ration|getr[aä]nk|heilmittel|verband|salbe|gift|munition|pfeil|bolzen|wurfgeschoss|schriftrolle|verbrauch|einweg|zutat|reagenz|pulver|kapsel|pastille|bombe|granate)/i;
const REUSABLE_PATTERN = /(?:waffe|r[uü]stung|schild|werkzeug|instrument|buch|schl[uü]ssel|amulet|ring|kleidung|beh[aä]lter|fokus|stab|dolch|schwert|bogen|speer)/i;

function clone(value) {
  if (value == null || typeof value !== 'object') return value;
  if (typeof structuredClone === 'function') return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

function cleanText(value, maximum = 500) {
  return String(value ?? '').trim().slice(0, maximum);
}

export function getInventoryItemQuantity(item = {}) {
  const parsed = Number.parseInt(String(item.quantity ?? '1'), 10);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 1;
}

export function getCharacterInventoryItems(character = {}) {
  return (Array.isArray(character?.inventory?.items) ? character.inventory.items : [])
    .filter(item => item && cleanText(item.id || item.name));
}

export function inferInventoryUseMode(item = {}) {
  const explicit = cleanText(item.inventoryUseMode || item.useMode || item.usageMode).toLowerCase();
  if (['consume', 'consumable', 'verbrauch', 'verbrauchen'].includes(explicit)) return 'consume';
  if (['use', 'reusable', 'benutzen', 'wiederverwendbar'].includes(explicit)) return 'use';
  if (item.consumable === true) return 'consume';
  if (item.consumable === false) return 'use';
  const category = cleanText(item.category).toLowerCase();
  const identityText = [item.name, item.type, item.tags, category].map(value => cleanText(value, 600)).join(' ');
  if (CONSUMABLE_CATEGORIES.has(category) || CONSUMABLE_PATTERN.test(identityText)) return 'consume';
  if (REUSABLE_CATEGORIES.has(category) || REUSABLE_PATTERN.test(identityText)) return 'use';
  if (/(?:wird|bei benutzung|nach einsatz).{0,40}(?:verbraucht|aufgebraucht)|einmalig/i.test(cleanText(item.description, 1200))) return 'consume';
  return 'use';
}

export function resolveInventoryUseMode(item = {}, requestedMode = 'auto') {
  const normalized = INVENTORY_USE_MODES.has(String(requestedMode || '').toLowerCase())
    ? String(requestedMode || '').toLowerCase()
    : 'auto';
  return normalized === 'auto' ? inferInventoryUseMode(item) : normalized;
}

export function getInventoryUsePersistence(character = {}) {
  const actorId = cleanText(character.id, 240);
  if (!actorId || actorId.startsWith('builtin:') || character.entityType === 'creature' || character.sourceCreatureId) {
    return { kind: 'scene-actor', actorId };
  }
  return { kind: 'character', recordId: actorId };
}

function normalizeItemSnapshot(item = {}) {
  return {
    id: cleanText(item.id, 240),
    name: cleanText(item.name || 'Gegenstand', 160),
    type: cleanText(item.type, 120),
    category: cleanText(item.category, 100),
    tags: cleanText(item.tags, 500),
    description: cleanText(item.description, 1200),
    icon: cleanText(item.icon, 1000),
    image: cleanText(item.image, 2000)
  };
}

export function normalizeInventoryUse(value = {}) {
  const source = value && typeof value === 'object' ? value : {};
  const requestedMode = INVENTORY_USE_MODES.has(String(source.requestedMode || '').toLowerCase())
    ? String(source.requestedMode).toLowerCase()
    : 'auto';
  const mode = ['consume', 'use'].includes(String(source.mode || '').toLowerCase())
    ? String(source.mode).toLowerCase()
    : resolveInventoryUseMode(source.item, requestedMode);
  const quantity = Math.max(1, Math.min(99, Math.trunc(Number(source.quantity) || 1)));
  const persistence = source.actorPersistence && typeof source.actorPersistence === 'object'
    ? {
        kind: cleanText(source.actorPersistence.kind, 40),
        recordId: cleanText(source.actorPersistence.recordId, 240),
        actorId: cleanText(source.actorPersistence.actorId, 240)
      }
    : { kind: 'scene-actor', actorId: cleanText(source.actorId, 240) };
  return {
    schemaVersion: 1,
    usageId: cleanText(source.usageId, 240),
    actorId: cleanText(source.actorId, 240),
    actorName: cleanText(source.actorName || 'Unbekannt', 160),
    item: normalizeItemSnapshot(source.item),
    requestedMode,
    mode,
    quantity,
    quantityBefore: source.quantityBefore != null && Number.isFinite(Number(source.quantityBefore)) ? Math.max(0, Number(source.quantityBefore)) : null,
    quantityAfter: source.quantityAfter != null && Number.isFinite(Number(source.quantityAfter)) ? Math.max(0, Number(source.quantityAfter)) : null,
    abilityEffects: (Array.isArray(source.abilityEffects) ? source.abilityEffects : []).map(effect => ({
      abilityId: cleanText(effect?.abilityId, 240),
      abilityName: cleanText(effect?.abilityName, 160),
      resourceId: cleanText(effect?.resourceId, 160),
      resourceName: cleanText(effect?.resourceName, 160),
      before: Math.max(0, Number(effect?.before) || 0),
      after: Math.max(0, Number(effect?.after) || 0),
      amount: Math.max(0, Number(effect?.amount) || 0)
    })).filter(effect => effect.abilityId && effect.resourceId).slice(0, 20),
    actorPersistence: persistence
  };
}

function lookupText(value) {
  return cleanText(value, 2000)
    .toLocaleLowerCase('de')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function itemMatchesTrigger(item = {}, trigger = {}) {
  const tags = Array.isArray(trigger.itemTags) ? trigger.itemTags.map(lookupText).filter(Boolean) : [];
  if (!tags.length) return false;
  const itemText = lookupText([item.name, item.type, item.category, item.tags, item.description].join(' '));
  return tags.some(tag => itemText.includes(tag));
}

export function applyInventoryUseAbilityEffects(combatProfile = {}, value = {}, recoveryDayKey = '') {
  const inventoryUse = normalizeInventoryUse(value);
  const resources = clone(Array.isArray(combatProfile?.resources) ? combatProfile.resources : []);
  const abilities = clone(Array.isArray(combatProfile?.abilities) ? combatProfile.abilities : []);
  const dayKey = cleanText(recoveryDayKey, 160);
  const effects = [];

  abilities.forEach(ability => {
    const trigger = ability?.inventoryUseTrigger;
    if (trigger?.enabled !== true || !itemMatchesTrigger(inventoryUse.item, trigger)) return;
    const maximum = Math.max(0, Number(ability.usesMaximum) || 0);
    if (ability.recovery === 'day' && dayKey && String(ability.recoveryDayKey || '') !== dayKey) {
      ability.usesCurrent = maximum;
      ability.recoveryDayKey = dayKey;
    }
    if (maximum > 0 && Math.max(0, Number(ability.usesCurrent) || 0) < 1) return;

    const pending = (Array.isArray(trigger.restoreResources) ? trigger.restoreResources : []).flatMap(restoration => {
      const resource = resources.find(candidate => String(candidate?.id || '') === String(restoration?.resourceId || ''));
      if (!resource) return [];
      const before = Math.max(0, Number(resource.current) || 0);
      const maximumValue = Math.max(0, Number(resource.maximum) || 0);
      const after = Math.min(maximumValue, before + Math.max(1, Number(restoration.amount) || 1));
      if (after <= before) return [];
      return [{ ability, resource, before, after }];
    });
    if (!pending.length && trigger.requireActualRecovery !== false) return;
    if (maximum > 0) ability.usesCurrent = Math.max(0, Number(ability.usesCurrent) - 1);
    pending.forEach(change => {
      change.resource.current = change.after;
      effects.push({
        abilityId: cleanText(ability.id, 240),
        abilityName: cleanText(ability.name, 160),
        resourceId: cleanText(change.resource.id, 160),
        resourceName: cleanText(change.resource.name, 160),
        before: change.before,
        after: change.after,
        amount: change.after - change.before
      });
    });
  });

  return {
    changed: effects.length > 0,
    resources,
    abilities,
    inventoryUse: normalizeInventoryUse({ ...inventoryUse, abilityEffects: effects })
  };
}

export function prepareInventoryUse({ character = {}, itemId = '', requestedMode = 'auto', quantity = 1 } = {}) {
  const item = getCharacterInventoryItems(character).find(candidate => String(candidate.id || '') === String(itemId || ''));
  if (!item) throw new Error('Der ausgewählte Gegenstand ist nicht mehr im Inventar vorhanden.');
  const available = getInventoryItemQuantity(item);
  if (available < 1) throw new Error(`${item.name || 'Der Gegenstand'} ist nicht mehr verfügbar.`);
  return normalizeInventoryUse({
    usageId: `inventory-use-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`,
    actorId: character.id,
    actorName: character.name,
    item,
    requestedMode,
    mode: resolveInventoryUseMode(item, requestedMode),
    quantity,
    quantityBefore: available,
    quantityAfter: available,
    actorPersistence: getInventoryUsePersistence(character)
  });
}

export function applyInventoryUseToInventory(inventory = {}, value = {}) {
  const inventoryUse = normalizeInventoryUse(value);
  const nextInventory = clone(inventory && typeof inventory === 'object' ? inventory : {});
  const items = Array.isArray(nextInventory.items) ? nextInventory.items : [];
  nextInventory.items = items;
  const index = items.findIndex(item => String(item?.id || '') === String(inventoryUse.item.id || ''));
  if (index < 0) throw new Error(`${inventoryUse.item.name || 'Der Gegenstand'} ist online nicht mehr im Inventar vorhanden.`);
  const item = items[index];
  const available = getInventoryItemQuantity(item);
  if (available < inventoryUse.quantity) {
    throw new Error(`Von ${item.name || 'diesem Gegenstand'} sind nur noch ${available} verfügbar.`);
  }
  const quantityAfter = inventoryUse.mode === 'consume'
    ? available - inventoryUse.quantity
    : available;
  if (inventoryUse.mode === 'consume') {
    if (quantityAfter <= 0) items.splice(index, 1);
    else items[index] = { ...item, quantity: String(quantityAfter) };
  }
  return {
    inventory: nextInventory,
    inventoryUse: {
      ...inventoryUse,
      item: normalizeItemSnapshot(item),
      quantityBefore: available,
      quantityAfter
    }
  };
}

export const inventoryUseModelInternals = Object.freeze({ CONSUMABLE_CATEGORIES, REUSABLE_CATEGORIES, CONSUMABLE_PATTERN, REUSABLE_PATTERN });
