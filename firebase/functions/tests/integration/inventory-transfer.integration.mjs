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
const character = id => ({ name: id, ownerUid: auth.uid, inventory: { revision: 1, items: [], moneyState: { totalCopper: 2 } },
  combatProfile: { hitPoints: { current: 7 }, resources: [{ id: 'mana', current: 2, maximum: 10 }] } });
const input = object => ({ giverId: 'giver', receiverId: 'receiver', entryId: 'isolated-transfer',
  sceneEvent: { transfer: { transferId: 'stable-operation', object } } });
beforeEach(async () => {
  const response = await fetch(`http://127.0.0.1:8182/emulator/v1/projects/${projectId}/databases/(default)/documents`, { method: 'DELETE' });
  assert.ok(response.ok);
  for (const id of ['giver', 'receiver']) await database.collection('characters').doc(id).set(character(id));
});
after(() => database.terminate());

test('real Firestore money transactions commit concurrent retries once without a scene event', async () => {
  const request = { ...input({ kind: 'money', currency: 'pfennig', quantity: 29 }), expectedRevisions: { 'character:giver': 1, 'character:receiver': 1 } };
  const [first, second] = await Promise.all([commitInventoryTransferOperation(database, auth, request), commitInventoryTransferOperation(database, auth, request)]);
  assert.equal(first.id, second.id);
  assert.equal((await database.doc('characters/giver').get()).data().inventory.moneyState.totalCopper, 1.71);
  assert.equal((await database.doc('characters/receiver').get()).data().inventory.moneyState.totalCopper, 2.29);
  assert.equal(first.id, null); assert.equal(first.silent, true);
  assert.equal((await database.collection('comments').get()).size, 0);
  assert.equal((await database.collection('inventory_transfer_transactions').get()).size, 1);
});

test('real sink expenditure needs no recipient and makes change while preserving all items and saved profiles', async () => {
  const giver = character('giver');
  delete giver.ownerUid;
  giver.inventory.moneyState = { copper: 1 };
  giver.inventory.items = [{ id: 'legacy', name: 'Unchanged possession', quantity: '1', definitionRef: { id: 'missing-definition', revision: 'v1' }, custom: { kept: true } }];
  giver.inventory.customArchive = { note: 'Unchanged' };
  await database.doc('characters/giver').set(giver);
  await database.doc('characters/receiver').delete();
  const request = { giverId: 'giver', operationId: 'sink-payment', expectedRevisions: { 'character:giver': 1 },
    sceneEvent: { transfer: { flavour: 'Never publish', object: { kind: 'money', targetKind: 'sink', currency: 'pfennig', quantity: 90 } } } };
  const player = { uid: 'independent-anonymous-uid', token: {} };
  const [first, second] = await Promise.all([commitInventoryTransferOperation(database, player, request), commitInventoryTransferOperation(database, player, request)]);
  assert.equal(first.id, null); assert.equal(second.silent, true); assert.equal(first.receiverInventory, null);
  const stored = (await database.doc('characters/giver').get()).data();
  assert.equal(stored.inventory.moneyState.totalCopper, 0.1); assert.equal(stored.inventory.moneyState.pfennig, 10);
  assert.deepEqual(stored.inventory.items, giver.inventory.items);
  assert.deepEqual(stored.inventory.customArchive, giver.inventory.customArchive);
  assert.deepEqual(stored.combatProfile, giver.combatProfile);
  assert.equal((await database.collection('comments').get()).size, 0);
  assert.equal((await database.collection('item_definition_versions').get()).size, 0);
  const receipts = (await database.collection('inventory_transfer_transactions').get()).docs;
  assert.equal(receipts.length, 1); assert.equal(receipts[0].data().targetKind, 'sink');
  assert.equal(receipts[0].data().commentId, undefined); assert.equal(receipts[0].data().flavour, undefined);
});

test('real player money transfer allows foreign owners and still rejects stale revisions and combat locks atomically', async () => {
  const player = { uid: 'unrelated-player', token: { aleriaRole: 'player' } };
  const request = { ...input({ kind: 'money', currency: 'pfennig', quantity: 29 }), expectedRevisions: { 'character:giver': 0, 'character:receiver': 1 } };
  await assert.rejects(commitInventoryTransferOperation(database, player, request), error => error.code === 'aborted');
  assert.equal((await database.doc('characters/giver').get()).data().inventory.moneyState.totalCopper, 2);
  assert.equal((await database.collection('inventory_transfer_transactions').get()).size, 0);
  request.expectedRevisions['character:giver'] = 1;
  await database.doc('combat_profile_locks/characters/records/receiver').set({ activeEncounterKeys: ['fight'] });
  await assert.rejects(commitInventoryTransferOperation(database, player, request), /Kampf/);
  assert.equal((await database.collection('inventory_transfer_transactions').get()).size, 0);
  await database.doc('combat_profile_locks/characters/records/receiver').delete();
  const response = await commitInventoryTransferOperation(database, player, request);
  assert.equal(response.silent, true);
  assert.equal((await database.doc('characters/giver').get()).data().inventory.moneyState.totalCopper, 1.71);
  assert.equal((await database.doc('characters/receiver').get()).data().inventory.moneyState.totalCopper, 2.29);
  assert.equal((await database.collection('comments').get()).size, 0);
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
