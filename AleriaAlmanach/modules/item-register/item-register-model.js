import { parsePrice, formatPrice, moneyState } from './item-register-money.js';

export const REGISTER_SECTIONS = Object.freeze([
  { id: 'standard', label: 'Standardgüter', text: 'Verbindliche Vorlagen und Preismaßstäbe.' },
  { id: 'offer', label: 'Anbieter & Sortimente', text: 'Besondere Waren, eigene Preise und verfügbare Bestände.' },
  { id: 'owned', label: 'Individuelle Listen', text: 'Besitz, Ausrüstung und Begleiter deiner Figuren.' }
]);
export const REGISTER_CATEGORIES = Object.freeze([
  ['waffen', 'Waffen', '⚔'], ['ruestungen', 'Rüstungen', '◇'], ['pferde', 'Pferde', '♞'],
  ['vieh', 'Vieh', '♧'], ['speisen', 'Speisen', '◒'], ['getraenke', 'Getränke', '♜'],
  ['alchemie', 'Alchemie', '⚗'], ['arkanes', 'Arkanes', '✧'], ['werkzeuge', 'Werkzeuge', '⚒'], ['sonstiges', 'Sonstiges', '◈']
].map(([id, label, icon]) => Object.freeze({ id, label, icon })));

export function searchText(value) {
  return String(value ?? '').toLocaleLowerCase('de').replace(/ae/g, 'ä').replace(/oe/g, 'ö').replace(/ue/g, 'ü')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ß/g, 'ss');
}
export function categoryLabel(id) { return REGISTER_CATEGORIES.find(category => category.id === id)?.label || 'Sonstiges'; }
export function inventoryCategory(id) {
  return ({ waffen: 'weapon', ruestungen: 'armor', alchemie: 'potions', getraenke: 'potions', werkzeuge: 'equipment' })[id] || 'other';
}
export function registerCategory(item) {
  return item.registerCategory || ({ weapon: 'waffen', armor: 'ruestungen', potions: 'alchemie', equipment: 'werkzeuge' })[item.category] || 'sonstiges';
}
export function canManageCharacter(character, access = {}) {
  return !!access.authenticated && (access.canModerate === true || character?.ownerUid === access.uid);
}
export function normalizeOffer(input = {}, baseline = []) {
  const standard = baseline.find(item => item.id === input.templateId);
  const price = input.priceRange || parsePrice(input.price, input.currency);
  if (!String(input.id || '').trim() || !String(input.title || '').trim()) throw new Error('Ein Angebot braucht eine ID und einen Namen.');
  if (!String(input.listId || '').trim() || !String(input.listName || '').trim()) throw new Error('Bitte ein Sortiment benennen.');
  if (input.templateId && !standard) throw new Error('Die Standardvorlage wurde nicht gefunden.');
  const stock = input.stock == null || input.stock === '' ? null : Number(input.stock);
  if (stock != null && (!Number.isSafeInteger(stock) || stock < 0)) throw new Error('Der Bestand muss eine ganze Zahl ab 0 sein.');
  return { ...standard, ...input, section: 'offer', canonicalKey: input.id,
    aliases: [],
    templateId: standard?.id || '', title: String(input.title).trim().slice(0, 180),
    listId: String(input.listId).trim().slice(0, 180), listName: String(input.listName).trim().slice(0, 180),
    category: input.category || standard?.category || 'sonstiges',
    priceRange: price, stock, archived: input.archived === true,
    buybackCopper: input.buybackCopper == null || input.buybackCopper === '' ? null : Number(input.buybackCopper),
    revision: Number(input.revision) || 0 };
}

export function buildOwnedItems(characters = [], templates = [], creatures = []) {
  const byKey = new Map(templates.flatMap(item => [item.id, item.canonicalKey, ...(item.aliases || [])].filter(Boolean).map(key => [key, item])));
  const creatureByItem = new Map(creatures.filter(creature => creature.itemOrigin?.instanceId).map(creature => [creature.itemOrigin.instanceId, creature]));
  return characters.flatMap(character => (character.inventory?.items || []).map(item => {
    const reference = item.templateId || item.originItemDbKey || item.itemDbKey;
    const template = byKey.get(reference);
    const instanceId = item.instanceId || item.id;
    const linkedCreature = creatureByItem.get(instanceId);
    const creature = linkedCreature?.itemOrigin?.ownerCharacterId === character.id && linkedCreature.id === item.creatureId ? linkedCreature : null;
    const category = template?.category || registerCategory(item);
    return { ...template, id: `owned:${character.id}:${item.id}`, canonicalKey: `owned:${character.id}:${item.id}`,
      section: 'owned', title: creature?.name || item.name, category, categoryLabel: categoryLabel(category),
      type: creature?.species || item.type || template?.type || '',
      description: item.description || '', details: '', image: creature?.portrait || item.image || item.icon || template?.image || '',
      templateId: template?.templateId || template?.id || reference || '', templateName: template?.title || item.templateName || '',
      instanceId, inventoryItemId: item.id, ownerCharacterId: character.id, ownerCharacterName: character.name,
      listId: character.id, listName: character.name, priceRange: item.valuation || template?.priceRange || null,
      quantity: Number(item.quantity ?? 1), equipped: item.equipped === true ||
        (character.combatProfile?.weapons || []).some(weapon => weapon.inventoryItemId === item.id && weapon.equipped) ||
        (character.combatProfile?.armorItems || []).some(armor => armor.inventoryItemId === item.id && armor.equipped),
      combatDefinition: item.combatDefinition || template?.combatDefinition || null,
      creatureId: creature?.id || item.creatureId || '', revision: character.inventory?.revision || 0,
      tags: Array.isArray(item.tags) ? item.tags : String(item.tags || '').split(',').filter(Boolean),
      sourceRefs: [{ kind: 'character-inventory', moduleTitle: character.name, characterId: character.id }], rawItem: item };
  }));
}

export function toLegacyItem(item) {
  return { ...item, canonicalKey: item.id, categoryLabel: categoryLabel(item.category),
    price: formatPrice(item.priceRange).replace(/ KT/g, ''), currency: 'K',
    hiddenMeta: { ...item.hiddenMeta, stock: item.stock, origin: item.listName || 'Standardgüter',
      ownerCharacterId: item.ownerCharacterId || '', ownerCharacterName: item.ownerCharacterName || '' } };
}

export function createOwnedItem(template, { id, characterId, characterName, quantity = 1, unitCopper, now }) {
  return { id, instanceId: id, templateId: template.templateId || template.id, templateName: template.title,
    offerId: template.section === 'offer' ? template.id : '', registerCategory: template.category,
    itemDbKey: '', originItemDbKey: template.templateId || template.id, itemStorageMode: 'character',
    ownerCharacterId: characterId, ownerCharacterName: characterName, acquiredAt: now,
    name: template.title, type: template.type || categoryLabel(template.category),
    category: inventoryCategory(template.category), description: [template.description, template.details].filter(Boolean).join('\n\n'),
    image: template.image || '', quantity: String(quantity), weight: String(template.hiddenMeta?.weight || ''),
    tags: (template.tags || []).join(', '), combatDefinition: template.combatDefinition || null, equipped: false,
    value: moneyState(unitCopper), valuation: template.priceRange || null,
    purchase: { unitCopper, quantity, sourceId: template.id, at: now },
    infoRows: [], attributes: template.attributes || [] };
}

export function queryRegister(items, { section = 'standard', category = '', listId = '', search = '', sort = 'name', equippedOnly = false } = {}) {
  const needle = searchText(search.trim());
  if (!category && !listId && !needle) return [];
  return items.filter(item => item.section === section && !item.archived &&
    (!category || item.category === category) && (!listId || item.listId === listId) && (!equippedOnly || item.equipped) &&
    (!needle || searchText([item.title, item.type, item.description, item.listName, item.templateName, ...(item.tags || [])].join(' ')).includes(needle)))
    .sort((a, b) => (sort === 'price' ? (a.priceRange?.minCopper ?? Infinity) - (b.priceRange?.minCopper ?? Infinity) : 0)
      || String(a.title).localeCompare(String(b.title), 'de'));
}
