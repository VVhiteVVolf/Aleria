import test from 'node:test';
import assert from 'node:assert/strict';
import { SCENE_MONEY_UNITS, sceneMoneyAmountMinor, sceneMoneyMinor, sceneMoneyBreakdown,
  previewSceneMoneyTransfer, applySceneMoneyTransfer } from '../modules/scene-inventory/scene-inventory-money.js';
import { applySceneInventoryTransfer } from '../modules/scene-inventory/scene-inventory-transfer-model.js';

const record = (id, money, extra = {}) => ({ id, name: id, inventory: { moneyState: money, ...extra } });

test('the coin calculator uses the existing Aleria denominations and whole Pfennige', () => {
  assert.deepEqual(SCENE_MONEY_UNITS.map(unit => [unit.id, unit.minorValue]), [
    ['gold', 100000], ['silver', 10000], ['copper', 100], ['pfennig', 1]
  ]);
  assert.equal(sceneMoneyAmountMinor({ currency: 'copper', quantity: '1' }), sceneMoneyAmountMinor({ currency: 'pfennig', quantity: 100 }));
  assert.equal(sceneMoneyAmountMinor({ currency: 'silver', quantity: 1 }), sceneMoneyAmountMinor({ currency: 'copper', quantity: 100 }));
  assert.equal(sceneMoneyAmountMinor({ currency: 'gold', quantity: 1 }), sceneMoneyAmountMinor({ currency: 'silver', quantity: 10 }));
  assert.deepEqual(sceneMoneyBreakdown(123456), { gold: 1, silver: 2, copper: 34, pfennig: 56, totalCopper: 1234.56 });
});

test('amounts reject fractions, negative counts, unknown currencies and safe-integer overflow', () => {
  for (const quantity of [undefined, null, '', 0, -1, 0.1, '1.5', '1,5', '1e3', '1.000', true, Infinity, '9007199254740992']) {
    assert.throws(() => sceneMoneyAmountMinor({ currency: 'pfennig', quantity }));
  }
  assert.throws(() => sceneMoneyAmountMinor({ currency: 'gold', quantity: Number.MAX_SAFE_INTEGER }), /zu groß/);
  assert.throws(() => sceneMoneyAmountMinor({ currency: 'unknown', quantity: 1 }), /Unbekannte Währung/);
  assert.equal(sceneMoneyAmountMinor({ currency: 'pfennig', quantity: ' 090 ' }), 90);
});

test('existing mixed coin balances and legacy text are read exactly with totalCopper authoritative', () => {
  const expected = 123456;
  assert.equal(sceneMoneyMinor({ gold: 1, silver: 2, copper: 34, pfennig: 56 }), expected);
  assert.equal(sceneMoneyMinor('1 Gold, 2 Silber, 34 Kupfer, 56 Eisenpfennig'), expected);
  assert.equal(sceneMoneyMinor('1 Goldtaler und 2 Silbertaler + 34 Kupfertaler & 56 Pfennig'), expected);
  assert.equal(sceneMoneyMinor({ totalCopper: '1.234,56', gold: 999 }), expected);
  assert.equal(sceneMoneyMinor({ copper: '0,90' }), 90);
  assert.equal(sceneMoneyMinor('1.000 Eisenpfennig'), 1000);
  assert.equal(sceneMoneyMinor(undefined), 0);
  assert.equal(sceneMoneyMinor(''), 0);
});

test('invalid saved balances cannot silently round, become zero or overflow', () => {
  for (const money of [{ totalCopper: '0.001' }, { pfennig: 0.5 }, { totalCopper: -1 }, { gold: 'kein Geld' },
    { totalCopper: '90071992547409.92' }, '1 Kupfer - 2 Pfennig', '0,5 Pfennig', '1 Gold und unbekannt', [], 5]) {
    assert.throws(() => sceneMoneyMinor(money));
  }
  for (const minor of [-1, 1.5, Infinity, Number.MAX_SAFE_INTEGER + 1]) assert.throws(() => sceneMoneyBreakdown(minor));
});

test('spending 90 Pfennig from one Kupfer produces exactly ten Pfennig in change', () => {
  const giver = record('giver', { copper: 1 }, { revision: 8, notes: 'unchanged' });
  const before = structuredClone(giver);
  const transfer = { currency: 'pfennig', quantity: 90, targetKind: 'sink' };
  const preview = previewSceneMoneyTransfer(giver, null, transfer);
  const result = applySceneMoneyTransfer(giver, null, transfer);
  assert.deepEqual(preview, { targetKind: 'sink', amountMinor: 90, giverBeforeMinor: 100, giverAfterMinor: 10,
    receiverBeforeMinor: null, receiverAfterMinor: null });
  assert.deepEqual(result.preview, preview);
  assert.deepEqual(result.giverInventory.moneyState, { gold: 0, silver: 0, copper: 0, pfennig: 10, totalCopper: 0.1 });
  assert.equal(result.giverInventory.revision, 8);
  assert.equal(result.giverInventory.notes, 'unchanged');
  assert.equal('items' in result.giverInventory, false);
  assert.equal(result.receiverInventory, null);
  assert.equal(result.object.targetKind, 'sink');
  assert.deepEqual(giver, before);
});

test('a character transfer keeps every Pfennig, converts change and preserves all inventory metadata', () => {
  const giver = record('giver', { copper: 1 }, { revision: 5, custom: { kept: true },
    items: [{ id: 'legacy', strangeField: ['old', 'data'], equipped: true, quantity: 'invalid' }] });
  const receiver = record('receiver', { pfennig: 5 }, { extra: 'legacy-field', items: [{ id: 'other', itemState: 'retain' }] });
  const before = structuredClone([giver, receiver]);
  const result = applySceneMoneyTransfer(giver, receiver, { currency: 'pfennig', quantity: 90 });
  assert.equal(result.object.targetKind, 'character');
  assert.equal(result.object.totalCopper, 0.9);
  assert.equal(result.preview.giverAfterMinor, 10);
  assert.equal(result.preview.receiverAfterMinor, 95);
  assert.equal(sceneMoneyMinor(result.giverInventory.moneyState) + sceneMoneyMinor(result.receiverInventory.moneyState), 105);
  assert.deepEqual(result.giverInventory.items, giver.inventory.items);
  assert.deepEqual(result.receiverInventory.items, receiver.inventory.items);
  assert.deepEqual(result.giverInventory.custom, giver.inventory.custom);
  assert.equal(result.receiverInventory.extra, 'legacy-field');
  assert.deepEqual([giver, receiver], before);
});

test('money transfers reject overspending, missing/self recipients and recipient overflow', () => {
  const giver = record('giver', { copper: 10 });
  assert.throws(() => applySceneMoneyTransfer(giver, null, { currency: 'copper', quantity: 11, targetKind: 'sink' }), /nicht genug Geld/);
  assert.throws(() => applySceneMoneyTransfer(giver, null, { currency: 'copper', quantity: 1 }), /Empfänger/);
  assert.throws(() => applySceneMoneyTransfer(giver, giver, { currency: 'copper', quantity: 1 }), /verschieden/);
  assert.throws(() => applySceneMoneyTransfer(giver, null, { currency: 'copper', quantity: 1, targetKind: 'other' }), /Unbekanntes Ziel/);
  const receiver = record('receiver', { totalCopper: 90071992547400 });
  assert.throws(() => applySceneMoneyTransfer(giver, receiver, { currency: 'pfennig', quantity: 1000 }), /zu groß/);
});

test('the legacy transfer API delegates money without changing any equipment or combat profile', () => {
  const giver = record('giver', { copper: 1 }, { items: [{ id: 'invalid-item', equipped: true, quantity: 'legacy' }], old: true });
  giver.combatProfile = { revision: 12, customProfile: { stamina: 'retain' }, weapons: [{ id: 'unmatched-weapon', equipped: true }] };
  const receiver = record('receiver', { pfennig: 1 });
  receiver.combatProfile = { revision: 7, resources: [{ id: 'legacy-mana', current: 8 }] };
  const before = structuredClone([giver, receiver]);
  const result = applySceneInventoryTransfer(giver, receiver, { kind: 'money', currency: 'pfennig', quantity: 90 });
  assert.deepEqual(result.giverCombatProfile, giver.combatProfile);
  assert.deepEqual(result.receiverCombatProfile, receiver.combatProfile);
  assert.deepEqual(result.giverInventory.items, giver.inventory.items);
  assert.equal('items' in result.receiverInventory, false);
  assert.equal(result.giverInventory.moneyState.pfennig, 10);
  assert.deepEqual([giver, receiver], before);
});
