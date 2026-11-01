import test, { after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { commitInventoryTransferOperation } from '../../src/mechanics/commit-inventory-transfer.js';

const projectId = 'demo-aleria-item-duels';
if (process.env.FIRESTORE_EMULATOR_HOST !== '127.0.0.1:8182') throw Error('Only the dedicated local Firestore emulator at 127.0.0.1:8182 is allowed.');
initializeApp({ projectId });
const database = getFirestore();
const auth = { uid: 'local-transfer-test', token: { aleriaRole: 'moderator' } };
const character = id => ({ name: id, ownerUid: auth.uid, inventory: { items: [], moneyState: { totalCopper: 2 } },
  combatProfile: { hitPoints: { current: 7 }, resources: [{ id: 'mana', current: 2, maximum: 10 }] } });
const input = object => ({ giverId: 'giver', receiverId: 'receiver', entryId: 'isolated-transfer',
  sceneEvent: { transfer: { transferId: 'stable-operation', object } } });
beforeEach(async () => {
  const response = await fetch(`http://127.0.0.1:8182/emulator/v1/projects/${projectId}/databases/(default)/documents`, { method: 'DELETE' });
  assert.ok(response.ok);
  for (const id of ['giver', 'receiver']) await database.collection('characters').doc(id).set(character(id));
});
after(() => database.terminate());

test('real Firestore transactions commit concurrent retries exactly once', async () => {
  const request = input({ kind: 'money', currency: 'pfennig', quantity: 29 });
  const [first, second] = await Promise.all([commitInventoryTransferOperation(database, auth, request), commitInventoryTransferOperation(database, auth, request)]);
  assert.equal(first.id, second.id);
  assert.equal((await database.doc('characters/giver').get()).data().inventory.moneyState.totalCopper, 1.71);
  assert.equal((await database.doc('characters/receiver').get()).data().inventory.moneyState.totalCopper, 2.29);
  assert.equal((await database.collection('comments').get()).size, 1);
  assert.equal((await database.collection('inventory_transfer_transactions').get()).size, 1);
});

for (const [sourceId, kind, value] of [['langschwert', 'weapons', '1d8'], ['ritterplatte', 'armorItems', 15], ['rundschild', 'armorItems', null]]) {
test(`authoritative ${sourceId} grants persist their template, combat view and live resources`, async () => {
  const result = await commitInventoryTransferOperation(database, auth, input({ kind: 'register-item',
    itemDbKey: `standard:waffen-rustungen:${sourceId}`, quantity: 1, name: 'Untrusted name' }));
  const stored = (await database.doc('characters/receiver').get()).data();
  assert.notEqual(stored.inventory.items[0].name, 'Untrusted name');
  assert.equal(stored.inventory.items[0].combatDefinition, undefined);
  assert.ok(stored.inventory.items[0].definitionRef);
  assert.equal(stored.combatProfile[kind][0][kind === 'weapons' ? 'damageFormula' : 'baseArmorClass'], value);
  assert.equal(stored.inventory.items[0].purchase, undefined);
  assert.equal(stored.combatProfile[kind][0].inventoryItemId, result.receiverInventory.items[0].id);
  assert.equal(stored.combatProfile.hitPoints.current, 7);
  assert.equal(stored.combatProfile.resources[0].current, 2);
});
}
