const CURRENCY_VALUES = Object.freeze({ gold: 1000, silver: 100, copper: 1 });

function clone(value) {
  if (value == null || typeof value !== 'object') return value;
  if (typeof structuredClone === 'function') return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

function quantity(value, fallback = 1) {
  const parsed = Math.trunc(Number(value));
  return Number.isFinite(parsed) ? Math.max(0, parsed) : fallback;
}

function moneyTotal(value = {}) {
  if (!value || typeof value !== 'object') return 0;
  if (value.totalCopper != null) return quantity(value.totalCopper, 0);
  return quantity(value.gold, 0) * 1000 + quantity(value.silver, 0) * 100 + quantity(value.copper, 0);
}

function splitMoney(totalCopper) {
  let rest = quantity(totalCopper, 0);
  const gold = Math.floor(rest / 1000);
  rest %= 1000;
  const silver = Math.floor(rest / 100);
  const copper = rest % 100;
  return { gold, silver, copper, totalCopper: gold * 1000 + silver * 100 + copper };
}

function setMoney(inventory, totalCopper) {
  inventory.moneyState = splitMoney(totalCopper);
  inventory.money = `${inventory.moneyState.gold} Gold, ${inventory.moneyState.silver} Silber, ${inventory.moneyState.copper} Kupfer`;
}

function normalizedInventory(record = {}) {
  const inventory = clone(record.inventory && typeof record.inventory === 'object' ? record.inventory : {});
  inventory.items = Array.isArray(inventory.items) ? inventory.items : [];
  return inventory;
}

function sameInventoryItem(first = {}, second = {}) {
  return (first.itemDbKey && first.itemDbKey === second.itemDbKey)
    || (!first.itemDbKey && !second.itemDbKey && first.name === second.name && first.type === second.type);
}

export function applySceneInventoryTransfer(giverRecord = {}, receiverRecord = {}, transfer = {}, options = {}) {
  const giverInventory = normalizedInventory(giverRecord);
  const receiverInventory = normalizedInventory(receiverRecord);
  const kind = String(transfer.kind || '');
  const requestedQuantity = Math.max(1, quantity(transfer.quantity, 1));
  let canonicalObject;

  if (kind === 'money') {
    const currency = String(transfer.currency || '');
    const currencyValue = CURRENCY_VALUES[currency];
    if (!currencyValue) throw new Error('Unbekannte WÃ¤hrung.');
    const copper = requestedQuantity * currencyValue;
    const giverCopper = moneyTotal(giverInventory.moneyState || giverInventory.money);
    if (giverCopper < copper) throw new Error(`${giverRecord.name || 'Der Geber'} besitzt nicht genug Geld.`);
    setMoney(giverInventory, giverCopper - copper);
    setMoney(receiverInventory, moneyTotal(receiverInventory.moneyState || receiverInventory.money) + copper);
    const labels = { gold: 'Gold', silver: 'Silber', copper: 'Kupfer' };
    canonicalObject = { kind, currency, quantity: requestedQuantity, totalCopper: copper, name: `${requestedQuantity} ${labels[currency]}`, description: `${requestedQuantity} ${labels[currency]}` };
  } else if (kind === 'item') {
    const itemId = String(transfer.itemId || '');
    const index = giverInventory.items.findIndex((item, itemIndex) => String(item?.id || itemIndex) === itemId);
    if (index < 0) throw new Error('Der Gegenstand wurde im Inventar nicht gefunden.');
    const source = giverInventory.items[index];
    const available = Math.max(0, quantity(source.quantity, 1));
    if (requestedQuantity > available) throw new Error(`Nur ${available} StÃ¼ck verfÃ¼gbar.`);
    if (requestedQuantity === available) giverInventory.items.splice(index, 1);
    else giverInventory.items[index] = { ...source, quantity: String(available - requestedQuantity) };
    const receiverMatch = receiverInventory.items.find(item => sameInventoryItem(item, source));
    if (receiverMatch) receiverMatch.quantity = String(quantity(receiverMatch.quantity, 1) + requestedQuantity);
    else receiverInventory.items.push({
      ...clone(source),
      id: String(options.transferItemId || `transfer-${Date.now()}`),
      quantity: String(requestedQuantity),
      ownerCharacterId: String(receiverRecord.id || ''),
      ownerCharacterName: String(receiverRecord.name || ''),
      acquiredAt: String(options.transferredAt || new Date().toISOString())
    });
    canonicalObject = {
      kind,
      itemId: String(source.id || ''),
      quantity: requestedQuantity,
      name: String(source.name || 'Gegenstand'),
      description: String(source.description || ''),
      image: String(source.image || ''),
      icon: String(source.icon || ''),
      type: String(source.type || '')
    };
  } else if (kind === 'register-item' && options.allowRegisterItem === true) {
    const source = transfer && typeof transfer === 'object' ? clone(transfer) : {};
    if (!String(source.itemDbKey || '').trim()) throw new Error('Das Registeritem besitzt keinen DatenbankschlÃ¼ssel.');
    const receiverMatch = receiverInventory.items.find(item => item.itemDbKey === source.itemDbKey);
    if (receiverMatch) receiverMatch.quantity = String(quantity(receiverMatch.quantity, 1) + requestedQuantity);
    else receiverInventory.items.push({
      id: String(options.transferItemId || `register-${Date.now()}`),
      itemDbKey: String(source.itemDbKey),
      name: String(source.name || 'Registeritem'),
      description: String(source.description || ''),
      image: String(source.image || ''),
      icon: String(source.icon || ''),
      type: String(source.type || ''),
      quantity: String(requestedQuantity),
      ownerCharacterId: String(receiverRecord.id || ''),
      ownerCharacterName: String(receiverRecord.name || ''),
      acquiredAt: String(options.transferredAt || new Date().toISOString())
    });
    canonicalObject = { ...source, kind, quantity: requestedQuantity, sourceLabel: 'Item-Register' };
  } else {
    throw new Error('Unbekannte oder nicht erlaubte InventarÃ¼bergabe.');
  }

  return { giverInventory, receiverInventory, object: canonicalObject };
}

export const sceneInventoryTransferInternals = Object.freeze({ moneyTotal, splitMoney, sameInventoryItem });
