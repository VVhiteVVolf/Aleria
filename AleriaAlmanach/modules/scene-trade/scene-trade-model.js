import { createGrantedItem } from '../item-register/item-register-model.js';
import { resalePrice } from '../item-register/item-register-trade.js';
import { formatMoney, moneyState, moneyTotal, toMinor } from '../item-register/item-register-money.js';
import { isInventoryPlaceholder } from '../character-inventory/inventory-placeholders.js';
import { attachInventoryEquipment } from '../character-equipment/character-equipment-registration.js';
import { isItemDefinitionStackable } from '../item-definitions/item-definition-model.js';

// This model operates on authoritative records supplied by the transaction
// service. It owns no persistence, permissions, global state or random IDs.
const copy = value => structuredClone(value);
const MAX_QUANTITY = 9999;
const MAX_ITEMS = 80;

function quantity(value = 1) {
  const result = Number(value);
  if (!Number.isSafeInteger(result) || result < 1 || result > MAX_QUANTITY) {
    throw Error('Die Menge muss zwischen 1 und 9.999 liegen.');
  }
  return result;
}

function minor(value) {
  if (!Number.isSafeInteger(value) || value < 0) throw Error('Der vereinbarte Preis muss ein ganzer Betrag ab null Eisenpfennig sein.');
  return value;
}

function add(first, second) {
  const result = first + second;
  if (!Number.isSafeInteger(result)) throw Error('Der Gesamtbetrag ist zu groß.');
  return result;
}

function multiply(first, second) {
  const result = first * second;
  if (!Number.isSafeInteger(result)) throw Error('Der Gesamtbetrag ist zu groß.');
  return result;
}

/** Standard prices are suggestions; an explicitly agreed price may differ. */
export function sceneTradeLinePrice({ direction, product = {}, item = null, quantity: count = 1,
  priceMode = 'standard', agreedTotalMinor } = {}) {
  count = quantity(count);
  if (!['buy', 'sell'].includes(direction)) throw Error('Unbekannte Handelsrichtung.');
  if (!['standard', 'agreed'].includes(priceMode)) throw Error('Unbekannte Preisvereinbarung.');
  let unitMinor = null;
  if (direction === 'buy' && product.priceRange?.minCopper != null) unitMinor = toMinor(product.priceRange.minCopper);
  if (direction === 'sell') {
    const resale = resalePrice(item, product);
    if (resale != null) unitMinor = toMinor(resale);
    else if (item?.valuation?.minCopper != null) unitMinor = Math.floor(toMinor(item.valuation.minCopper) / 2);
  }
  const baselineTotalMinor = unitMinor == null ? null : multiply(unitMinor, count);
  if (priceMode === 'standard' && baselineTotalMinor == null) {
    throw Error('Für diesen Gegenstand fehlt ein Standardpreis. Bitte einen Preis vereinbaren.');
  }
  return { baselineTotalMinor, totalMinor: priceMode === 'agreed' ? minor(agreedTotalMinor) : baselineTotalMinor, priceMode };
}

function recordsByKey(records) {
  if (!Array.isArray(records)) throw Error('Die gespeicherten Handelsteilnehmer fehlen.');
  const result = new Map();
  for (const original of records) {
    if (!['character', 'group'].includes(original.kind) || !original.id || original.key !== `${original.kind}:${original.id}` || result.has(original.key)) {
      throw Error('Ein Handelsteilnehmer besitzt keine eindeutige Kennung.');
    }
    const record = copy(original);
    record.inventory ||= {};
    record.inventory.items ||= [];
    if (!Array.isArray(record.inventory.items)) throw Error('Das gespeicherte Inventar ist ungültig.');
    result.set(record.key, record);
  }
  return result;
}

function resolveRecord(records, key) {
  const record = records.get(key);
  if (!record) throw Error('Zahler, Verkäufer oder Empfänger wurde nicht gefunden.');
  return record;
}

function identity(line, operationId) {
  const result = String(line.instanceId || `trade:${operationId}:${line.id}`);
  if (!result || result.length > 220) throw Error('Die Besitzkennung ist ungültig.');
  return result;
}

function holder(record, itemId) {
  return { kind: record.kind === 'group' ? 'groups' : 'characters', recordId: record.id, itemId };
}

function reserveIdentity(records, id) {
  for (const record of records.values()) {
    if (record.inventory.items.some(item => item.id === id || item.instanceId === id)) {
      throw Error('Diese Besitzinstanz ist bereits vorhanden.');
    }
  }
}

function addAccount(accounts, record, kind, amount) {
  const account = accounts.get(record.key) || { key: record.key, debitMinor: 0, creditMinor: 0, netMinor: 0 };
  account[kind] = add(account[kind], amount);
  account.netMinor = add(account.creditMinor, -account.debitMinor);
  accounts.set(record.key, account);
}

function purchaseMetadata(product, count, totalMinor, priceMode, now) {
  return { sourceId: product.id || '', quantity: count, totalMinor, totalCopper: totalMinor / 100, priceMode, at: now,
    ...(totalMinor % count === 0 ? { unitCopper: totalMinor / count / 100 } : {}),
    ...(product.moduleId ? { moduleId: product.moduleId } : {}) };
}

function buyLine({ records, accounts, claims, usedUnique, line, merchant, operationId, now }) {
  const payer = resolveRecord(records, line.payerKey), recipient = resolveRecord(records, line.recipientKey);
  const product = line.product;
  if (!product || product.archived || product.available === false || ['planned', 'unavailable'].includes(product.status)) {
    throw Error('Dieses Angebot ist nicht mehr verfügbar.');
  }
  const count = quantity(line.quantity), definition = line.definition || product;
  const unique = definition.kind === 'unique' || product.definitionKind === 'unique';
  if (unique && count !== 1) throw Error('Ein Unikat kann nur einmal gekauft werden.');
  if (unique) {
    if (!definition.id || usedUnique.has(definition.id)) throw Error('Dasselbe Unikat darf nur einmal in einer Bestellung vorkommen.');
    usedUnique.add(definition.id);
  }
  const price = sceneTradeLinePrice({ ...line, product });
  const stackable = isItemDefinitionStackable(definition);
  const possessions = stackable ? 1 : count;
  // The final capacity is checked after sales as well; cap work for an invalid
  // oversized non-stackable order before constructing thousands of objects.
  if (possessions > MAX_ITEMS) throw Error('Diese Bestellung überschreitet die 80 Inventareinträge.');
  const itemIds = [], instanceIds = [];
  const baseId = identity(line, operationId);
  for (let index = 0; index < possessions; index++) {
    const id = possessions === 1 ? baseId : `${baseId}:${index + 1}`;
    if (id.length > 220) throw Error('Die Besitzkennung ist zu lang.');
    reserveIdentity(records, id);
    const itemCount = stackable ? count : 1;
    const itemTotal = stackable ? price.totalMinor : Math.floor(price.totalMinor / count) + (index < price.totalMinor % count ? 1 : 0);
    const item = createGrantedItem(product, { id, characterId: recipient.kind === 'character' ? recipient.id : '',
      characterName: recipient.kind === 'character' ? recipient.name || '' : '', quantity: itemCount, now });
    if (recipient.kind === 'group') item.ownerGroupId = recipient.id;
    item.purchase = purchaseMetadata(product, itemCount, itemTotal, price.priceMode, now);
    if (Number(definition.useDefinition?.chargesMaximum) > 0) item.itemState = { chargesCurrent: definition.useDefinition.chargesMaximum };
    if (recipient.kind === 'character') {
      recipient.combatProfile ||= {};
      attachInventoryEquipment(recipient.combatProfile, item, { definition });
    }
    recipient.inventory.items.push(item);
    // The rules protect canonical inventories using this marker. Adding a
    // referenced possession must activate that protection even for a legacy
    // inventory, without reserializing its unrelated historical items.
    if (item.definitionRef) recipient.inventory.definitionSchemaVersion = 1;
    itemIds.push(id); instanceIds.push(id);
    if (unique) claims.push({ definition, instanceId: id, quantity: 1, holder: holder(recipient, id) });
  }
  addAccount(accounts, payer, 'debitMinor', price.totalMinor);
  return { id: line.id, direction: 'buy', productId: line.productId || product.id || '', name: product.title || product.name || 'Gegenstand',
    quantity: count, ...price, payerKey: payer.key, recipientKey: recipient.key, itemIds, instanceIds };
}

function assertSellable(record, item, definition, count) {
  if (isInventoryPlaceholder(item)) throw Error('Dieser unveränderte Editor-Platzhalter ist noch kein Gegenstand.');
  if (item.definitionRef && (!definition || definition.id !== item.definitionRef.id || definition.revision !== item.definitionRef.revision)) {
    throw Error('Die gespeicherte Itemversion muss vor dem Verkauf geprüft werden.');
  }
  const equipped = item.equipped || ['weapons', 'armorItems'].some(collection => (record.combatProfile?.[collection] || [])
    .some(entry => entry.inventoryItemId === item.id && entry.equipped));
  if (equipped) throw Error('Bitte den Gegenstand vor dem Verkauf ablegen.');
  const available = quantity(item.quantity ?? 1);
  if (count > available) throw Error(`Nur ${available} Stück im Inventar verfügbar.`);
  if ((definition?.kind === 'unique' || item.definitionKind === 'unique') && (available !== 1 || count !== 1)) throw Error('Ein Unikat kann nicht geteilt werden.');
  if (item.creatureId && (available !== 1 || count !== 1)) throw Error('Ein verknüpftes Tier kann nicht geteilt werden.');
  if (definition && !isItemDefinitionStackable(definition) && available !== 1) throw Error('Nicht stapelbare Gegenstände müssen einzeln geführt werden.');
  return available;
}

function sellLine({ records, accounts, claims, soldItems, usedUnique, line, merchant, operationId, now }) {
  const seller = resolveRecord(records, line.sellerKey);
  const index = seller.inventory.items.findIndex(item => item.id === line.itemId);
  if (index < 0) throw Error('Dieser Gegenstand ist nicht mehr im Inventar.');
  const source = seller.inventory.items[index], count = quantity(line.quantity);
  const available = assertSellable(seller, source, line.definition, count);
  const price = sceneTradeLinePrice({ ...line, product: line.product || {}, item: source });
  const sold = copy(source);
  sold.quantity = String(count);
  if (count === available) {
    seller.inventory.items.splice(index, 1);
    for (const collection of ['weapons', 'armorItems']) {
      if (Array.isArray(seller.combatProfile?.[collection])) {
        seller.combatProfile[collection] = seller.combatProfile[collection].filter(entry => entry.inventoryItemId !== source.id);
      }
    }
  } else {
    const id = identity(line, operationId);
    reserveIdentity(records, id);
    seller.inventory.items[index] = { ...source, quantity: String(available - count) };
    sold.id = id; sold.instanceId = id;
  }
  if (line.definition?.kind === 'unique' || source.definitionKind === 'unique') {
    const definition = line.definition;
    if (!definition?.id || usedUnique.has(definition.id)) throw Error('Dasselbe Unikat darf nur einmal in einer Bestellung vorkommen.');
    usedUnique.add(definition.id);
    const instanceId = source.instanceId || source.id;
    claims.push({ definition, instanceId, quantity: 1, holder: { kind: 'vendor', recordId: merchant.id, itemId: sold.id },
      previousHolder: holder(seller, source.id) });
  }
  soldItems.push({ lineId: line.id, sellerKey: seller.key, item: sold, quantity: count, totalMinor: price.totalMinor });
  addAccount(accounts, seller, 'creditMinor', price.totalMinor);
  return { id: line.id, direction: 'sell', productId: line.productId || line.product?.id || '', itemId: source.id,
    name: source.name || 'Gegenstand', quantity: count, ...price, sellerKey: seller.key,
    itemIds: [source.id], instanceIds: [sold.instanceId || sold.id] };
}

/** Apply a whole cart or throw without changing any input record. */
export function applySceneTradeOrder({ records: originalRecords, lines, merchant, operationId, now = '' } = {}) {
  if (!Array.isArray(lines) || !lines.length) throw Error('Die Bestellung enthält keine Waren.');
  if (lines.length > 20) throw Error('Eine Bestellung darf höchstens 20 Warenpositionen enthalten.');
  if (!merchant?.id || !merchant?.name || !operationId) throw Error('Händler und Vorgangskennung müssen eindeutig sein.');
  const records = recordsByKey(originalRecords), accounts = new Map(), claims = [], soldItems = [], usedUnique = new Set(), ids = new Set();
  const receiptLines = [], totals = { buyMinor: 0, sellMinor: 0, netMinor: 0 };
  for (const line of lines) {
    if (!line.id || ids.has(line.id)) throw Error('Jede Warenposition benötigt eine eindeutige Kennung.');
    ids.add(line.id);
    const context = { records, accounts, claims, soldItems, usedUnique, line, merchant, operationId, now };
    if (line.direction === 'buy') receiptLines.push(buyLine(context));
    else if (line.direction === 'sell') receiptLines.push(sellLine(context));
    else throw Error('Unbekannte Handelsrichtung.');
    const totalKey = line.direction === 'buy' ? 'buyMinor' : 'sellMinor';
    totals[totalKey] = add(totals[totalKey], receiptLines.at(-1).totalMinor);
  }
  totals.netMinor = add(totals.buyMinor, -totals.sellMinor);
  for (const record of records.values()) {
    if (record.inventory.items.length > MAX_ITEMS) throw Error('Das Empfängerinventar überschreitet die 80 Inventareinträge.');
    const account = accounts.get(record.key);
    if (!account) continue;
    const balance = add(toMinor(moneyTotal(record.inventory.moneyState || record.inventory.money)), account.netMinor);
    if (balance < 0) throw Error(`${record.name || 'Die Figur'} besitzt nicht genug Geld.`);
    if (toMinor(balance / 100) !== balance) throw Error('Der Geldbetrag ist zu groß, um ihn genau zu speichern.');
    record.inventory.moneyState = moneyState(balance / 100);
    record.inventory.money = formatMoney(record.inventory.moneyState);
  }
  return { records: [...records.values()], soldItems, claims,
    receipt: { schemaVersion: 1, merchant: { id: merchant.id, name: merchant.name }, lines: receiptLines, totals, accounts: [...accounts.values()] } };
}
