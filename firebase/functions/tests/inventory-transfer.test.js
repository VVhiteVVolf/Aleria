import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { commitInventoryTransferOperation } from '../src/mechanics/commit-inventory-transfer.js';
import { STANDARD_ITEMS } from '../src/generated/item-register/item-register-standard.js';
import { database } from './fixtures/combat-transaction-database.js';

const auth = { uid: 'owner', token: { aleriaRole: 'player' } };
const character = id => ({ id, name: id, ownerUid: 'owner', inventory: { revision: 1, items: [], moneyState: { totalCopper: 2 } },
  combatProfile: { hitPoints: { current: 7 }, resources: [{ id: 'mana', current: 2, maximum: 10 }] } });
const store = () => database({ 'characters/giver': character('giver'), 'characters/receiver': character('receiver') });
const input = object => ({ giverId: 'giver', receiverId: 'receiver', entryId: 'scene',
  sceneEvent: { transfer: { transferId: 'transfer-one', object: object || { kind: 'money', currency: 'pfennig', quantity: 29 } } } });
const rows = (db, collection) => [...db.data].filter(([key]) => key.startsWith(`${collection}/`));

function linkedSword(record, itemId, { held = true } = {}) {
  const template = STANDARD_ITEMS.find(item => item.id === 'standard:waffen-rustungen:stahlschwert');
  record.inventory.items.push({ id: itemId, name: itemId, category: 'weapon', definitionRef: template.definitionRef, quantity: '1', equipped: false });
  record.combatProfile.weapons = [{ id: `${itemId}-entry`, inventoryItemId: itemId, name: 'Bewusst geführte Altwaffe',
    weaponType: 'sword', damageFormula: '1d8', equipped: held, notes: 'Unabhängiger gespeicherter Profilstand' }];
}

test('a money transfer preserves both exact saved profiles and held loadouts without combat revision writes', async () => {
  const db = store();
  linkedSword(db.data.get('characters/giver'), 'giver-held');
  linkedSword(db.data.get('characters/receiver'), 'receiver-held');
  const before = ['giver', 'receiver'].map(id => structuredClone(db.data.get(`characters/${id}`).combatProfile));
  await commitInventoryTransferOperation(db, auth, input());
  for (const [index, id] of ['giver', 'receiver'].entries()) assert.deepEqual(db.data.get(`characters/${id}`).combatProfile, before[index]);
});

test('money writes only wallet fields and never allocates a scene comment or reads item definitions', async () => {
  const db = store(), allowedCollections = new Set(['characters', 'inventory_transfer_transactions']);
  for (const id of ['giver', 'receiver']) {
    const record = db.data.get(`characters/${id}`);
    linkedSword(record, `${id}-held`);
    record.inventory.customArchive = { unchanged: true };
    record.inventory.definitionSchemaVersion = 0;
  }
  db.data.set('comment_thread_activity/scene', { lastActivity: 'unchanged' });
  const originalCollection = db.collection;
  db.collection = name => { assert(allowedCollections.has(name), `Unexpected money collection: ${name}`); return originalCollection(name); };
  const writes = [], transaction = db.runTransaction.bind(db);
  db.runTransaction = work => transaction(tx => work({ ...tx, update(reference, updates) {
    writes.push({ path: reference.path, fields: Object.keys(updates).sort() }); tx.update(reference, updates);
  } }));
  const before = ['giver', 'receiver'].map(id => structuredClone(db.data.get(`characters/${id}`)));
  const response = await commitInventoryTransferOperation(db, { uid: 'another-player', token: {} }, { ...input(),
    expectedRevisions: { 'character:giver': 1, 'character:receiver': 1 } });
  assert.equal(response.id, null); assert.equal(response.silent, true);
  for (const [index, id] of ['giver', 'receiver'].entries()) {
    const after = db.data.get(`characters/${id}`);
    assert.deepEqual(after.combatProfile, before[index].combatProfile);
    assert.deepEqual(after.inventory.items, before[index].inventory.items);
    assert.deepEqual(after.inventory.customArchive, before[index].inventory.customArchive);
    assert.equal(after.inventory.definitionSchemaVersion, 0);
    assert.equal(after.ownerUid, before[index].ownerUid);
  }
  assert.equal(writes.length, 2);
  for (const write of writes) assert.deepEqual(write.fields, ['inventory.money', 'inventory.moneyState', 'inventory.revision', 'updatedAt']);
  assert.equal(rows(db, 'comments').length, 0);
  assert.deepEqual(db.data.get('comment_thread_activity/scene'), { lastActivity: 'unchanged' });
  const receipt = rows(db, 'inventory_transfer_transactions')[0][1];
  assert.equal(receipt.kind, 'money'); assert.equal(receipt.targetKind, 'character');
  for (const field of ['commentId', 'entryId', 'flavour', 'visualIcon', 'sceneEvent']) assert.equal(Object.hasOwn(receipt, field), false);
});

test('a sink expenditure changes one wallet, makes change automatically and needs neither recipient nor scene', async () => {
  const db = store();
  db.data.get('characters/giver').inventory.moneyState = { copper: 1 };
  delete db.data.get('characters/giver').ownerUid;
  db.data.delete('characters/receiver');
  const response = await commitInventoryTransferOperation(db, { uid: 'anonymous-firebase-uid', token: {} }, {
    giverId: 'giver', operationId: 'sink-payment', expectedRevisions: { 'character:giver': 1 },
    sceneEvent: { transfer: { flavour: 'Not a scene message', object: { kind: 'money', targetKind: 'sink', currency: 'pfennig', quantity: 90, visualIcon: 'not-rendered.png' } } }
  });
  assert.equal(response.id, null); assert.equal(response.silent, true); assert.equal(response.receiverInventory, null);
  assert.equal(response.giverInventory.moneyState.copper, 0);
  assert.equal(response.giverInventory.moneyState.pfennig, 10);
  assert.equal(response.giverInventory.moneyState.totalCopper, 0.1);
  assert.equal(rows(db, 'characters').length, 1);
  assert.equal(rows(db, 'comments').length, 0);
  assert.equal(rows(db, 'inventory_transfer_transactions').length, 1);
  assert.equal(rows(db, 'inventory_transfer_transactions')[0][1].targetKind, 'sink');
});

test('a held profile weapon cannot be transferred by reconciling its older unequipped inventory flag first', async () => {
  const db = store();
  linkedSword(db.data.get('characters/giver'), 'giver-held');
  const before = structuredClone([...db.data]);
  await assert.rejects(commitInventoryTransferOperation(db, auth, input({ kind: 'item', itemId: 'giver-held', quantity: 1 })), /ablegen/);
  assert.deepEqual([...db.data], before);
});

test('a consumable handoff preserves unrelated gear and does not invent a receiver combat profile', async () => {
  const db = store();
  linkedSword(db.data.get('characters/giver'), 'giver-held');
  const food = STANDARD_ITEMS.find(item => item.id === 'standard:gemischtwarenhandler:rationen');
  db.data.get('characters/giver').inventory.items.push({ id: 'food', name: 'Rationen', category: 'food', quantity: '2', definitionRef: food.definitionRef });
  delete db.data.get('characters/receiver').combatProfile;
  const before = structuredClone(db.data.get('characters/giver').combatProfile);
  await commitInventoryTransferOperation(db, auth, input({ kind: 'item', itemId: 'food', quantity: 1 }));
  assert.deepEqual(db.data.get('characters/giver').combatProfile, before);
  assert.equal(Object.hasOwn(db.data.get('characters/receiver'), 'combatProfile'), false);
});

test('merging an identical legacy weapon into an existing stack preserves its held personal entry and profile revision', async () => {
  const db = store();
  for (const [id, held] of [['giver', false], ['receiver', true]]) {
    const record = db.data.get(`characters/${id}`);
    record.inventory.items.push({ id: `${id}-item`, name: 'Legacy sword', itemDbKey: 'legacy:sword', category: 'weapon', image: '', quantity: '1', equipped: false });
    record.combatProfile.weapons = [{ id: `${id}-entry`, inventoryItemId: `${id}-item`, name: 'Personal sword', weaponType: 'sword', damageFormula: '1d8', equipped: held }];
  }
  const before = structuredClone(db.data.get('characters/receiver').combatProfile);
  await commitInventoryTransferOperation(db, auth, input({ kind: 'item', itemId: 'giver-item', quantity: 1 }));
  assert.equal(db.data.get('characters/receiver').inventory.items[0].quantity, '2');
  assert.deepEqual(db.data.get('characters/receiver').combatProfile, before);
});

test('a real unequipped gear handoff changes only the moved item bindings on either saved profile', async () => {
  const db = store();
  linkedSword(db.data.get('characters/giver'), 'moved', { held: false });
  linkedSword(db.data.get('characters/receiver'), 'receiver-held');
  const receiverBefore = structuredClone(db.data.get('characters/receiver').combatProfile);
  const result = await commitInventoryTransferOperation(db, auth, input({ kind: 'item', itemId: 'moved', quantity: 1 }));
  const after = db.data.get('characters/receiver').combatProfile;
  assert.deepEqual(after.weapons.find(entry => entry.inventoryItemId === 'receiver-held'), receiverBefore.weapons[0]);
  assert.deepEqual(after.hitPoints, receiverBefore.hitPoints);
  assert.deepEqual(after.resources, receiverBefore.resources);
  assert.equal(after.weapons.filter(entry => entry.inventoryItemId === result.receiverInventory.items.find(item => item.id === 'moved').id).length, 1);
  assert.equal(db.data.get('characters/giver').combatProfile.weapons.length, 0);
});

test('repeated and simultaneous money transfers book wallets once without a scene event', async () => {
  const db = store();
  const [first, second] = await Promise.all([commitInventoryTransferOperation(db, auth, input()), commitInventoryTransferOperation(db, auth, input())]);
  assert.equal(first.id, second.id);
  assert.equal(first.giverInventory.revision, db.data.get('characters/giver').inventory.revision);
  assert.equal(first.receiverInventory.revision, db.data.get('characters/receiver').inventory.revision);
  assert.equal(db.data.get('characters/giver').inventory.moneyState.totalCopper, 1.71);
  assert.equal(db.data.get('characters/receiver').inventory.moneyState.totalCopper, 2.29);
  assert.equal(first.id, null); assert.equal(first.silent, true);
  assert.equal(rows(db, 'comments').length, 0);
  assert.equal(rows(db, 'inventory_transfer_transactions').length, 1);
  assert.equal(db.data.get('characters/giver').combatProfile.hitPoints.current, 7);
  assert.equal(db.data.get('characters/giver').combatProfile.resources[0].current, 2);
  const before = structuredClone([...db.data]);
  await assert.rejects(commitInventoryTransferOperation(db, auth, input({ kind: 'money', currency: 'gold', quantity: 1 })), /Vorgangs-ID/);
  assert.deepEqual([...db.data], before);
});

test('a replay returns current inventories instead of restoring an old receipt snapshot', async () => {
  const db = store();
  await commitInventoryTransferOperation(db, auth, input());
  db.data.get('characters/receiver').inventory.items.push({ id: 'later', name: 'Later' });
  const replay = await commitInventoryTransferOperation(db, auth, input());
  assert.equal(replay.receiverInventory.items[0].id, 'later');
  assert.equal(replay.receiverInventory.moneyState.totalCopper, 2.29);
});

test('missing authentication, invalid quantities and insufficient funds leave all records untouched', async () => {
  const db = store(), before = structuredClone([...db.data]);
  await assert.rejects(commitInventoryTransferOperation(db, null, input()), /Anmeldung/);
  for (const quantity of [0, -1, 1.5, Number.MAX_SAFE_INTEGER]) {
    await assert.rejects(commitInventoryTransferOperation(db, auth, input({ kind: 'money', currency: 'gold', quantity })));
  }
  assert.deepEqual([...db.data], before);
});

test('money checks all first-use revisions and combat locks but exact retries return current inventories', async () => {
  for (const mutate of [
    request => { request.expectedRevisions['character:giver'] = 0; },
    request => { request.expectedRevisions['character:receiver'] = 2; },
    request => { delete request.expectedRevisions['character:receiver']; }
  ]) {
    const db = store(), before = structuredClone([...db.data]);
    const request = { ...input(), expectedRevisions: { 'character:giver': 1, 'character:receiver': 1 } };
    mutate(request);
    await assert.rejects(commitInventoryTransferOperation(db, auth, request), /revision|geändert/i);
    assert.deepEqual([...db.data], before);
  }
  for (const id of ['giver', 'receiver']) {
    const db = store(); db.data.set(`combat_profile_locks/characters/records/${id}`, { activeEncounterKeys: ['fight'] });
    const before = structuredClone([...db.data]);
    await assert.rejects(commitInventoryTransferOperation(db, auth, input()), /Kampf/);
    assert.deepEqual([...db.data], before);
  }
  const db = store(), request = { ...input(), expectedRevisions: { 'character:giver': 1, 'character:receiver': 1 } };
  await commitInventoryTransferOperation(db, auth, request);
  db.data.get('characters/giver').inventory.moneyState.totalCopper = 7;
  const replay = await commitInventoryTransferOperation(db, auth, request);
  assert.equal(replay.giverInventory.moneyState.totalCopper, 7);
  assert.equal(rows(db, 'inventory_transfer_transactions').length, 1);
  const before = structuredClone([...db.data]);
  await assert.rejects(commitInventoryTransferOperation(db, auth, { ...request, expectedRevisions: { 'character:giver': 0, 'character:receiver': 1 } }), /Vorgangs-ID/);
  assert.deepEqual([...db.data], before);
});

test('historical money receipts and their comments remain unchanged when an old request is replayed', async () => {
  const db = store(), request = input();
  const identity = { giverId: request.giverId, receiverId: request.receiverId, entryId: request.entryId, transfer: request.sceneEvent.transfer };
  const receipt = { fingerprint: createHash('sha256').update(JSON.stringify(identity)).digest('hex'), commentId: 'historic', legacy: true };
  db.data.set('inventory_transfer_transactions/owner-transfer-one', receipt);
  db.data.set('comments/historic', { text: 'Historical receipt', sceneInventoryTransfer: { old: true } });
  const before = structuredClone([...db.data]);
  const response = await commitInventoryTransferOperation(db, auth, request);
  assert.equal(response.id, null); assert.equal(response.silent, true);
  assert.deepEqual([...db.data], before);
});

test('money sink rejects a recipient, unknown targets and invalid character identities without writes', async () => {
  for (const change of [
    request => { request.sceneEvent.transfer.object.targetKind = 'sink'; },
    request => { request.sceneEvent.transfer.object.targetKind = 'invented'; },
    request => { request.giverId = 'nested/character'; },
    request => { request.receiverId = 'giver'; }
  ]) {
    const db = store(), request = input(), before = structuredClone([...db.data]); change(request);
    await assert.rejects(commitInventoryTransferOperation(db, auth, request));
    assert.deepEqual([...db.data], before);
  }
});

test('item handoffs keep their existing ownership restriction and create their existing scene receipt', async () => {
  const db = store();
  db.data.get('characters/giver').inventory.items.push({ id: 'keepsake', name: 'Andenken', quantity: '1' });
  const request = input({ kind: 'item', itemId: 'keepsake', quantity: 1 }), before = structuredClone([...db.data]);
  await assert.rejects(commitInventoryTransferOperation(db, { uid: 'other-player', token: {} }, request), /Besitzer/);
  assert.deepEqual([...db.data], before);
  const result = await commitInventoryTransferOperation(db, auth, request);
  assert.ok(result.id); assert.equal(result.silent, undefined); assert.equal(rows(db, 'comments').length, 1);
});

test('free register grants use server mechanics and identity, without inventing a paid purchase', async () => {
  const db = store();
  const template = STANDARD_ITEMS.find(item => item.id === 'standard:waffen-rustungen:langschwert');
  const forged = input({ kind: 'register-item', itemDbKey: template.id, quantity: 1, name: 'Forged',
    combatDefinition: { kind: 'weapon', damageFormula: '99d100' } });
  await assert.rejects(commitInventoryTransferOperation(db, auth, forged), /Spielleitung/);
  const result = await commitInventoryTransferOperation(db, { ...auth, token: { aleriaRole: 'moderator' } }, forged);
  const item = result.receiverInventory.items[0];
  assert.equal(item.name, template.title);
  assert.equal(item.templateId, template.id);
  assert.equal(item.combatDefinition, undefined);
  assert.deepEqual(item.definitionRef, template.definitionRef);
  assert.equal(db.data.get('characters/receiver').combatProfile.weapons[0].damageFormula, '1d8');
  assert.equal(item.purchase, undefined);
  assert.equal(db.data.get('characters/receiver').combatProfile.weapons[0].inventoryItemId, item.id);
  assert.equal(result.receiverInventory.moneyState.totalCopper, 2);
});

test('unresolvable free grants cannot write a partial comment or possession', async () => {
  const db = store(), before = structuredClone([...db.data]);
  await assert.rejects(commitInventoryTransferOperation(db, { ...auth, token: { aleriaRole: 'moderator' } },
    input({ kind: 'register-item', itemDbKey: 'standard:invented', quantity: 1 })), /Registervorlage/);
  assert.deepEqual([...db.data], before);
});
