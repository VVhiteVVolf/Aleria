import { moneyTotal, moneyState as splitMoney, formatMoney, toMinor } from '../item-register/item-register-money.js';
import { createGrantedItem } from '../item-register/item-register-model.js';
import { isInventoryPlaceholder } from '../character-inventory/inventory-placeholders.js';
import { attachInventoryEquipment } from '../character-equipment/character-equipment-registration.js';
import { synchronizeEquipmentFromInventory } from '../character-equipment/character-equipment-sync.js';
import { resolveEquipmentImage } from '../character-equipment/equipment-artwork.js?v=20260928-equipment-art-v4';
import { assertItemQuantity, itemDefinitionFromTemplate } from '../item-definitions/item-definition-model.js';
import { resolveItemDefinition } from '../item-definitions/item-definition-resolver.js';
const CURRENCY_VALUES = Object.freeze({ gold: 1000, silver: 100, copper: 1, pfennig: 0.01 });

function clone(value) {
  if (value == null || typeof value !== 'object') return value;
  if (typeof structuredClone === 'function') return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

function quantity(value, fallback = 1) {
  const parsed = value == null ? fallback : Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1) throw new Error('Die Menge muss eine positive ganze Zahl sein.');
  return parsed;
}

function setMoney(inventory, totalCopper) {
  inventory.moneyState = splitMoney(totalCopper);
  inventory.money = formatMoney(inventory.moneyState);
}

function normalizedInventory(record = {}) {
  const inventory = clone(record.inventory && typeof record.inventory === 'object' ? record.inventory : {});
  inventory.items = Array.isArray(inventory.items) ? inventory.items : [];
  return inventory;
}

function sameInventoryItem(first = {}, second = {}) {
  // Only identical, explicitly linked legacy stacks may merge. A common name
  // does not prove identical rules, value, image, provenance or quality.
  if (first.instanceId || second.instanceId || first.creatureId || second.creatureId
    || first.combatDefinition || second.combatDefinition || first.equipmentLink || second.equipmentLink) return false;
  if (!first.itemDbKey || first.itemDbKey !== second.itemDbKey) return false;
  const ignored = new Set(['id', 'quantity', 'ownerCharacterId', 'ownerCharacterName', 'acquiredAt']);
  const ordered = value => Array.isArray(value) ? value.map(ordered) : value && typeof value === 'object'
    ? Object.fromEntries(Object.keys(value).sort().map(key => [key, ordered(value[key])])) : value;
  const signature = item => JSON.stringify(ordered(Object.fromEntries(Object.entries(item).filter(([key]) => !ignored.has(key)))));
  return signature(first) === signature(second);
}

export function applySceneInventoryTransfer(giverRecord = {}, receiverRecord = {}, transfer = {}, options = {}) {
  const giverInventory = normalizedInventory(giverRecord);
  const receiverInventory = normalizedInventory(receiverRecord);
  const kind = String(transfer.kind || '');
  const requestedQuantity = quantity(transfer.quantity, 1);
  let canonicalObject;

  if (kind === 'money') {
    const currency = String(transfer.currency || '');
    const currencyValue = CURRENCY_VALUES[currency];
    if (!currencyValue) throw new Error('Unbekannte Währung.');
    const minor = requestedQuantity * toMinor(currencyValue);
    const giverMinor = toMinor(moneyTotal(giverInventory.moneyState || giverInventory.money));
    const receiverMinor = toMinor(moneyTotal(receiverInventory.moneyState || receiverInventory.money));
    if (!Number.isSafeInteger(minor) || !Number.isSafeInteger(receiverMinor + minor)) throw new Error('Der Geldbetrag ist zu groß.');
    if (giverMinor < minor) throw new Error(`${giverRecord.name || 'Der Geber'} besitzt nicht genug Geld.`);
    const copper = minor / 100;
    setMoney(giverInventory, (giverMinor - minor) / 100);
    setMoney(receiverInventory, (receiverMinor + minor) / 100);
    const labels = { gold: 'Gold', silver: 'Silber', copper: 'Kupfer', pfennig: 'Eisenpfennig' };
    canonicalObject = { kind, currency, quantity: requestedQuantity, totalCopper: copper, name: `${requestedQuantity} ${labels[currency]}`, description: `${requestedQuantity} ${labels[currency]}` };
  } else if (kind === 'item') {
    const itemId = String(transfer.itemId || '');
    const index = giverInventory.items.findIndex((item, itemIndex) => String(item?.id || itemIndex) === itemId);
    if (index < 0) throw new Error('Der Gegenstand wurde im Inventar nicht gefunden.');
    const storedSource = giverInventory.items[index];
    if (isInventoryPlaceholder(storedSource)) throw new Error('Dieser unveränderte Editor-Platzhalter ist noch kein Gegenstand.');
    // Materialize the displayed art when ownership changes, so the receiving
    // character keeps the same item image without depending on the former owner.
    const source = { ...storedSource, image: resolveEquipmentImage(storedSource, { characterId: giverRecord.id }) };
    if (source.equipped || ['weapons', 'armorItems'].some(key => (giverRecord.combatProfile?.[key] || []).some(entry => entry.inventoryItemId === source.id && entry.equipped))) throw new Error('Bitte die Ausrüstung vor der Übergabe ablegen.');
    const available = quantity(source.quantity, 1);
    const definition = resolveItemDefinition(source, options.definitions);
    if (definition) assertItemQuantity(definition, available);
    if (requestedQuantity > available) throw new Error(`Nur ${available} Stück verfügbar.`);
    if (source.creatureId && requestedQuantity !== available) throw new Error('Ein verknüpfter Begleiter kann nicht aufgeteilt werden.');
    if (requestedQuantity === available) giverInventory.items.splice(index, 1);
    else giverInventory.items[index] = { ...source, quantity: String(available - requestedQuantity) };
    const receiverMatch = receiverInventory.items.find(item => sameInventoryItem(item, source));
    let receivedItem = receiverMatch;
    if (receiverMatch) {
      const combined = quantity(receiverMatch.quantity, 1) + requestedQuantity;
      if (!Number.isSafeInteger(combined)) throw new Error('Der Bestand ist zu groß.');
      receiverMatch.quantity = String(combined);
    } else {
      if (receiverInventory.items.length >= 80) throw new Error('Das Empfängerinventar hat bereits 80 Einträge. Bitte zuerst Platz schaffen.');
      if (source.instanceId && receiverInventory.items.some(item => item.instanceId === source.instanceId)) throw new Error('Diese Besitzinstanz ist beim Empfänger bereits vorhanden.');
      const keepIdentity = requestedQuantity === available;
      const nextId = keepIdentity && !receiverInventory.items.some(item => item.id === source.id)
        ? source.id : String(options.transferItemId || `transfer-${crypto.randomUUID()}`);
      if (!nextId || receiverInventory.items.some(item => item.id === nextId)) throw new Error('Die Gegenstands-ID ist beim Empfänger bereits vorhanden.');
      receivedItem = {
      ...clone(source),
      id: nextId,
      instanceId: keepIdentity ? source.instanceId || nextId : nextId,
      quantity: String(requestedQuantity),
      ownerCharacterId: String(receiverRecord.id || ''),
      ownerCharacterName: String(receiverRecord.name || ''),
      acquiredAt: String(options.transferredAt || new Date().toISOString())
      };
      receiverInventory.items.push(receivedItem);
    }
    canonicalObject = {
      kind,
      itemId: String(source.id || ''),
      receiverItemId: receivedItem.id,
      quantity: requestedQuantity,
      name: String(source.name || 'Gegenstand'),
      description: String(source.description || ''),
      image: String(source.image || ''),
      icon: String(source.icon || ''),
      type: String(source.type || '')
    };
  } else if (kind === 'register-item' && options.allowRegisterItem === true) {
    const source = transfer && typeof transfer === 'object' ? clone(transfer) : {};
    if (!String(source.itemDbKey || '').trim()) throw new Error('Das Registeritem besitzt keinen Datenbankschlüssel.');
    const template = options.registerTemplate;
    if (!template || (template.id !== source.itemDbKey && !template.aliases?.includes(source.itemDbKey))) throw new Error('Die verbindliche Registervorlage fehlt.');
    assertItemQuantity(resolveItemDefinition(template, options.definitions) || itemDefinitionFromTemplate(template) || template, requestedQuantity);
    if (receiverInventory.items.length >= 80) throw new Error('Das Empfängerinventar hat bereits 80 Einträge. Bitte zuerst Platz schaffen.');
    const id = String(options.transferItemId || `register-${crypto.randomUUID()}`);
    if (receiverInventory.items.some(item => item.id === id || item.instanceId === id)) throw new Error('Diese Besitzinstanz ist bereits vorhanden.');
    const item = createGrantedItem(template, { id, characterId: receiverRecord.id, characterName: receiverRecord.name || '',
      quantity: requestedQuantity, now: String(options.transferredAt || new Date().toISOString()) });
    receiverInventory.items.push(item);
    canonicalObject = { kind, itemDbKey: template.id, receiverItemId: id, name: item.name, description: item.description,
      image: item.image, type: item.type, quantity: requestedQuantity, sourceLabel: 'Item-Register' };
  } else {
    throw new Error('Unbekannte oder nicht erlaubte Inventarübergabe.');
  }

  const receiverProfile = clone(receiverRecord.combatProfile || {});
  for (const item of receiverInventory.items) {
    if (!(receiverRecord.inventory?.items || []).some(previous => previous.id === item.id)) attachInventoryEquipment(receiverProfile, item, { definitions: options.definitions });
  }
  return { giverInventory, receiverInventory, object: canonicalObject,
    giverCombatProfile: synchronizeEquipmentFromInventory({ inventory: giverInventory, combatProfile: giverRecord.combatProfile, definitions: options.definitions }).combatProfile,
    receiverCombatProfile: synchronizeEquipmentFromInventory({ inventory: receiverInventory, combatProfile: receiverProfile, definitions: options.definitions }).combatProfile };
}

export const sceneInventoryTransferInternals = Object.freeze({ moneyTotal, splitMoney, sameInventoryItem });
