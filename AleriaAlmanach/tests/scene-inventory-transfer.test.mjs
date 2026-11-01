import assert from 'node:assert/strict';
import test from 'node:test';
import { applySceneInventoryTransfer } from '../modules/scene-inventory/scene-inventory-transfer-model.js';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

test('money transfers are recalculated from the stored inventory', () => {
  const result = applySceneInventoryTransfer(
    { id: 'giver', name: 'Geber', inventory: { moneyState: { totalCopper: 1500 }, items: [] } },
    { id: 'receiver', name: 'Empfaenger', inventory: { moneyState: { totalCopper: 200 }, items: [] } },
    { kind: 'money', currency: 'gold', quantity: 1 }
  );
  assert.equal(result.giverInventory.moneyState.totalCopper, 500);
  assert.equal(result.receiverInventory.moneyState.totalCopper, 1200);
});

test('item transfers cannot spend an outdated client quantity', () => {
  assert.throws(() => applySceneInventoryTransfer(
    { id: 'giver', inventory: { items: [{ id: 'potion', name: 'Trank', type: 'Trank', quantity: '1' }] } },
    { id: 'receiver', inventory: { items: [] } },
    { kind: 'item', itemId: 'potion', quantity: 2 }
  ), /Nur 1/);
});

test('same-name legacy items with different rules are separate possessions after transfer', () => {
  const giver = { id: 'giver', inventory: { items: [{ id: 'blade', name: 'Schwert', type: 'Waffe', quantity: '1', combatDefinition: { kind: 'weapon', damageFormula: '1d8' } }] } };
  const receiver = { id: 'receiver', inventory: { items: [{ id: 'blade', name: 'Schwert', type: 'Waffe', quantity: '1', combatDefinition: { kind: 'weapon', damageFormula: '1d8', damageBonus: 1 } }] } };
  const before = structuredClone([giver, receiver]);
  const result = applySceneInventoryTransfer(giver, receiver, { kind: 'item', itemId: 'blade', quantity: 1 }, { transferItemId: 'new-local-id' });
  assert.deepEqual([giver, receiver], before);
  assert.equal(result.receiverInventory.items.length, 2);
  assert.deepEqual(result.receiverInventory.items[0], receiver.inventory.items[0]);
  assert.equal(result.receiverInventory.items[1].id, 'new-local-id');
  assert.equal(result.receiverInventory.items[1].combatDefinition.damageBonus, undefined);
});

test('splitting a stack gives the moved part a new identity and preserves its rules and paid price', () => {
  const original = { id: 'stack', instanceId: 'instance', name: 'Trank', quantity: '3', templateId: 'potion',
    inventoryUseMode: 'consume', purchase: { unitCopper: 7 }, description: 'Verlässliche Charge' };
  const result = applySceneInventoryTransfer({ id: 'giver', inventory: { items: [original] } }, { id: 'receiver' },
    { kind: 'item', itemId: 'stack', quantity: 1 }, { transferItemId: 'split' });
  assert.equal(result.giverInventory.items[0].instanceId, 'instance');
  assert.equal(result.giverInventory.items[0].quantity, '2');
  assert.equal(result.receiverInventory.items[0].instanceId, 'split');
  assert.equal(result.receiverInventory.items[0].purchase.unitCopper, 7);
  assert.equal(result.receiverInventory.items[0].templateId, 'potion');
  assert.equal(result.receiverInventory.items[0].inventoryUseMode, 'consume');
});

test('dialog retries the same operation after a lost response even if the live source already changed', async () => {
  const source = await readFile(new URL('../modules/scene-inventory/scene-inventory-events.js', import.meta.url), 'utf8');
  const listeners = new Map(), calls = [];
  let preparedCount = 0;
  const button = { disabled: false }, elements = Object.fromEntries(Object.entries({
    'scene-transfer-kind': 'item', 'scene-transfer-giver': 'giver', 'scene-transfer-receiver': 'receiver',
    'scene-transfer-item': 'blade', 'scene-transfer-item-amount': '1', 'scene-transfer-flavour': '', 'scene-transfer-icon': ''
  }).map(([id, value]) => [id, { value }]));
  const context = vm.createContext({
    crypto, console,
    document: { getElementById: id => elements[id], querySelector: () => button,
      addEventListener: (name, callback) => listeners.set(name, callback) },
    window: { _fb: { async transferCharacterInventories(...args) {
      calls.push(structuredClone(args[5]));
      if (calls.length === 1) throw Error('response lost after commit');
      return { id: 'receipt', giverInventory: { items: [] }, receiverInventory: { items: [{ id: 'blade' }] } };
    } } },
    _characters: [{ id: 'giver' }, { id: 'receiver' }], COMMENT_DELETE_CODE: '',
    getCurrentCommentThreadId: () => 'scene', getSceneInventoryRegisterItem: () => null,
    prepareSceneInventoryTransfer: async () => {
      if (++preparedCount > 1) throw Error('source has already moved');
      return { giver: { id: 'giver', name: 'Giver' }, receiver: { id: 'receiver', name: 'Receiver' }, transfer: { kind: 'item', itemId: 'blade', quantity: 1 } };
    },
    getNextCommentOrderKey: () => 1, setSceneInventoryStatus() {}, closeSceneInventoryDialog() {},
    requestCommentAutoScroll() {}, loadCommentsIntoPage: async () => {}, renderCharGrid() {}
  });
  vm.runInContext(source, context);
  const event = { preventDefault() {}, target: { closest: () => ({ dataset: { sceneInventoryAction: 'submit' } }) } };
  await listeners.get('click')(event);
  assert.equal(button.disabled, false);
  await listeners.get('click')(event);
  assert.equal(preparedCount, 1);
  assert.equal(calls.length, 2);
  assert.deepEqual(calls[1], calls[0]);
});
