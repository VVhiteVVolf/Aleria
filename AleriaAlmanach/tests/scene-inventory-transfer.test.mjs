import assert from 'node:assert/strict';
import test from 'node:test';
import { applySceneInventoryTransfer } from '../modules/scene-inventory/scene-inventory-transfer-model.js';

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
