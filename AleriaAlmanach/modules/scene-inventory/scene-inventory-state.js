// Inventory transfer calculations shared by the scene dialog and persistence flow.
const SCENE_INVENTORY_EVENT_KIND = 'scene-inventory-transfer-event';
const SCENE_INVENTORY_CURRENCY_VALUES = { gold: 1000, silver: 100, copper: 1 };
let _sceneInventoryRegisterItem = null;

function setSceneInventoryRegisterItem(item = null) {
  _sceneInventoryRegisterItem = item?.canonicalKey ? item : null;
}

function getSceneInventoryRegisterItem() {
  return _sceneInventoryRegisterItem;
}

function getSceneInventoryCharacters() {
  return (Array.isArray(_characters) ? _characters : []).filter(character => character?.id && character?.name);
}

function getSceneInventoryCharacter(id) {
  return getSceneInventoryCharacters().find(character => String(character.id) === String(id)) || null;
}

function getSceneInventoryData(character = {}) {
  return sanitizeCharacterInventoryData(character.inventory || createCharacterInventoryDataFromCharacter(character));
}

function getSceneInventoryItemQuantity(item = {}) {
  const value = Number.parseInt(String(item.quantity || '1'), 10);
  return Number.isFinite(value) ? Math.max(0, value) : 1;
}

function buildSceneMoneyTransfer(giver, receiver, currency, amount) {
  const value = SCENE_INVENTORY_CURRENCY_VALUES[currency];
  const quantity = Math.max(0, Math.floor(Number(amount) || 0));
  if (!value || quantity < 1) throw new Error('Bitte einen gültigen Geldbetrag eingeben.');
  const giverInventory = getSceneInventoryData(giver);
  const receiverInventory = getSceneInventoryData(receiver);
  const transferCopper = value * quantity;
  const giverTotal = CharacterInventoryMoney.getTotalCopper(giverInventory.moneyState);
  if (giverTotal < transferCopper) throw new Error(`${giver.name} besitzt nicht genug Geld.`);
  giverInventory.moneyState = CharacterInventoryMoney.splitCopper(giverTotal - transferCopper);
  giverInventory.money = CharacterInventoryMoney.format(giverInventory.moneyState);
  receiverInventory.moneyState = CharacterInventoryMoney.splitCopper(CharacterInventoryMoney.getTotalCopper(receiverInventory.moneyState) + transferCopper);
  receiverInventory.money = CharacterInventoryMoney.format(receiverInventory.moneyState);
  const labels = { gold: 'Gold', silver: 'Silber', copper: 'Kupfer' };
  return {
    giverInventory,
    receiverInventory,
    transfer: { kind: 'money', currency, quantity, totalCopper: transferCopper, name: `${quantity} ${labels[currency]}`, description: `${quantity} ${labels[currency]}` }
  };
}

function buildSceneItemTransfer(giver, receiver, itemId, amount) {
  const giverInventory = getSceneInventoryData(giver);
  const receiverInventory = getSceneInventoryData(receiver);
  const index = giverInventory.items.findIndex((item, itemIndex) => String(item.id || itemIndex) === String(itemId));
  if (index < 0) throw new Error('Der Gegenstand wurde im Inventar nicht gefunden.');
  const source = giverInventory.items[index];
  const available = getSceneInventoryItemQuantity(source);
  const quantity = Math.max(1, Math.floor(Number(amount) || 1));
  if (quantity > available) throw new Error(`Nur ${available} Stück verfügbar.`);
  if (quantity === available) giverInventory.items.splice(index, 1);
  else giverInventory.items[index] = { ...source, quantity: String(available - quantity) };
  const receiverMatch = receiverInventory.items.find(item => (
    (item.itemDbKey && item.itemDbKey === source.itemDbKey)
    || (!item.itemDbKey && item.name === source.name && item.type === source.type)
  ));
  if (receiverMatch) receiverMatch.quantity = String(getSceneInventoryItemQuantity(receiverMatch) + quantity);
  else {
    const transferredItem = sanitizeCharacterInventoryItems([{ ...source, id: `transfer-${Date.now()}`, quantity: String(quantity), ownerCharacterId: receiver.id, ownerCharacterName: receiver.name, acquiredAt: new Date().toISOString() }])[0];
    if (!transferredItem) throw new Error('Der Gegenstand konnte nicht übertragen werden.');
    receiverInventory.items.push(transferredItem);
  }
  return {
    giverInventory,
    receiverInventory,
    transfer: { kind: 'item', itemId: source.id || '', quantity, name: source.name || 'Gegenstand', description: source.description || '', image: source.image || '', icon: source.icon || '', type: source.type || '' }
  };
}

function buildSceneRegisterItemTransfer(giver, receiver, registerItem, amount) {
  if (!registerItem?.canonicalKey) throw new Error('Bitte zuerst ein Item aus dem Register auswählen.');
  if (typeof buildCharacterInventoryItemFromDbItem !== 'function') throw new Error('Das Item-Register ist derzeit nicht verfügbar.');
  const quantity = Math.max(1, Math.floor(Number(amount) || 1));
  const giverInventory = getSceneInventoryData(giver);
  const receiverInventory = getSceneInventoryData(receiver);
  const source = buildCharacterInventoryItemFromDbItem(registerItem, {
    characterId: receiver.id,
    name: receiver.name
  });
  if (!source) throw new Error('Das Registeritem konnte nicht in ein Inventaritem umgewandelt werden.');
  const receiverMatch = receiverInventory.items.find(item => item.itemDbKey === source.itemDbKey);
  if (receiverMatch) receiverMatch.quantity = String(getSceneInventoryItemQuantity(receiverMatch) + quantity);
  else receiverInventory.items.push({ ...source, quantity: String(quantity) });
  return {
    giverInventory,
    receiverInventory,
    transfer: {
      kind: 'register-item',
      itemDbKey: registerItem.canonicalKey,
      quantity,
      name: source.name || registerItem.title || 'Registeritem',
      description: source.description || registerItem.description || registerItem.details || '',
      image: source.image || registerItem.image || '',
      icon: source.icon || '',
      type: source.type || registerItem.categoryLabel || '',
      sourceLabel: 'Item-Register'
    }
  };
}

function prepareSceneInventoryTransfer(input = {}) {
  const giver = getSceneInventoryCharacter(input.giverId);
  const receiver = getSceneInventoryCharacter(input.receiverId);
  if (!giver || !receiver) throw new Error('Geber und Empfänger müssen gespeicherte Charaktere sein.');
  if (giver.id === receiver.id) throw new Error('Geber und Empfänger müssen verschieden sein.');
  const result = input.kind === 'item'
    ? buildSceneItemTransfer(giver, receiver, input.itemId, input.quantity)
    : input.kind === 'register-item'
      ? buildSceneRegisterItemTransfer(giver, receiver, input.registerItem, input.quantity)
      : buildSceneMoneyTransfer(giver, receiver, input.currency, input.quantity);
  return { giver, receiver, ...result };
}

function isSceneInventoryTransferComment(comment = {}) {
  return !!(comment.sceneInventoryTransfer || comment.commentKind === SCENE_INVENTORY_EVENT_KIND || comment.commentMode === 'scene-inventory-transfer');
}
