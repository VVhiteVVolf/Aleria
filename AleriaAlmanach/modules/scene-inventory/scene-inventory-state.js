// Inventory transfer calculations shared by the scene dialog and persistence flow.
const SCENE_INVENTORY_EVENT_KIND = 'scene-inventory-transfer-event';
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

// The preview and server execute the same pure transfer model. The server
// resolves registerTemplate independently; this local record is only a preview.
async function prepareSceneInventoryTransfer(input = {}) {
  const giver = getSceneInventoryCharacter(input.giverId);
  const receiver = getSceneInventoryCharacter(input.receiverId);
  if (!giver || !receiver) throw new Error('Geber und Empfänger müssen gespeicherte Charaktere sein.');
  if (giver.id === receiver.id) throw new Error('Geber und Empfänger müssen verschieden sein.');
  const { applySceneInventoryTransfer } = await import('./scene-inventory-transfer-model.js');
  const transfer = input.kind === 'item'
    ? { kind: 'item', itemId: input.itemId, quantity: input.quantity }
    : input.kind === 'register-item'
      ? { kind: 'register-item', itemDbKey: input.registerItem?.id || input.registerItem?.canonicalKey || '', quantity: input.quantity,
        moduleId: input.registerItem?.moduleId || '', sourceRevision: input.registerItem?.sourceRevision || '' }
      : { kind: 'money', currency: input.currency, quantity: input.quantity };
  const result = applySceneInventoryTransfer(giver, receiver, transfer, {
    allowRegisterItem: true, registerTemplate: input.registerItem,
    transferItemId: `transfer-${crypto.randomUUID()}`, transferredAt: new Date().toISOString()
  });
  return { giver, receiver, ...result, transfer: { ...result.object,
    ...(input.kind === 'register-item' ? { moduleId: transfer.moduleId, sourceRevision: transfer.sourceRevision } : {}) } };
}

function isSceneInventoryTransferComment(comment = {}) {
  return !!(comment.sceneInventoryTransfer || comment.commentKind === SCENE_INVENTORY_EVENT_KIND || comment.commentMode === 'scene-inventory-transfer');
}
