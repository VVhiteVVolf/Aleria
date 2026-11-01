import test, { beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { commitGroupInventoryOperation } from '../../src/groups/commit-group-inventory.js';
import { commitItemDefinitionOperation } from '../../src/items/commit-item-definition.js';
import { undoMechanicalCommentOperation } from '../../src/mechanics/commit-undo-mechanical-comment.js';
import { buildGroupAccountRequest } from '../../../../AleriaAlmanach/modules/landing/group-account-operations.js';

const projectId = 'demo-aleria-group-inventory';
if (process.env.FIRESTORE_EMULATOR_HOST !== '127.0.0.1:8187') throw Error('Only the isolated Firestore emulator at 127.0.0.1:8187 is allowed.');
const app = initializeApp({ projectId }, 'group-inventory-integration');
const db = getFirestore(app);
const gm = { uid: 'gm', token: { aleriaRole: 'moderator' } }, owner = { uid: 'owner', token: {} };
const record = id => ({ id, name: id, ownerUid: 'owner', inventory: { revision: 1, items: [], moneyState: { totalCopper: 10 } },
  combatProfile: { revision: 1, hitPoints: { current: 7 }, resources: [{ id: 'mana', current: 2, maximum: 10 }] } });
const entry = () => ({ id: 'crew', title: 'Testgruppe', pages: [
  { landingPage: true, landing: { group: { guests: ['one', 'two'].map(id => ({ id, kind: 'character', characterId: id, name: id })) } } },
  { sessionPage: true, commentThreadKey: 'camp' }
] });
const request = (extra = {}) => ({ operationId: 'withdraw', groupId: 'crew', action: 'withdraw', member: { kind: 'character', recordId: 'one' },
  object: { kind: 'money', currency: 'pfennig', quantity: 29 }, expectedGroupRevision: 1, expectedMemberRevision: 1, ...extra });
const read = async path => (await db.doc(path).get()).data();
const transferState = async () => ({ group: await read('group_quest_accounts/crew'), one: await read('characters/one'), two: await read('characters/two'),
  comments: (await db.collection('comments').get()).docs.map(doc => ({ id: doc.id, ...doc.data() })),
  receipts: (await db.collection('group_inventory_transactions').get()).docs.map(doc => ({ id: doc.id, ...doc.data() })) });
beforeEach(async () => {
  const response = await fetch(`http://127.0.0.1:8187/emulator/v1/projects/${projectId}/databases/(default)/documents`, { method: 'DELETE' });
  assert.ok(response.ok);
  await db.doc('module_store_entries/crew').set({ entryJson: JSON.stringify(entry()) });
  await db.doc('group_quest_accounts/crew').set({ id: 'crew', name: 'Testgruppe', revision: 1, inventory: { revision: 1, items: [], moneyState: { totalCopper: 30 } } });
  for (const id of ['one', 'two']) await db.doc(`characters/${id}`).set(record(id));
});
after(() => db.terminate());

test('concurrent identical group withdrawals commit one debit, credit, receipt and scene event', async () => {
  const input = request({ entryId: 'crew::session:camp' });
  const [first, retry] = await Promise.all([commitGroupInventoryOperation(db, gm, input), commitGroupInventoryOperation(db, gm, input)]);
  assert.equal(first.receiptId, retry.receiptId); assert.equal(first.commentId, retry.commentId);
  assert.equal((await read('group_quest_accounts/crew')).inventory.moneyState.totalCopper, 29.71);
  assert.equal((await read('characters/one')).inventory.moneyState.totalCopper, 10.29);
  assert.equal((await db.collection('comments').get()).size, 1);
  assert.equal((await db.collection('group_inventory_transactions').get()).size, 1);
  const character = await read('characters/one');
  assert.deepEqual(character.combatProfile, record('one').combatProfile);
  const beforeUndo = await transferState(), comment = await read(`comments/${first.commentId}`);
  assert.equal(comment.inventoryTransaction.group, true);
  for (const [auth, force] of [[owner, false], [gm, false], [gm, true], [{ uid: 'admin', token: { aleriaRole: 'admin' } }, true]]) {
    await assert.rejects(undoMechanicalCommentOperation({ auth, data: { entryId: input.entryId, commentId: first.commentId, force } }, { database: db }),
      error => error.code === 'failed-precondition' && /Gegenbuchung/.test(error.message));
    assert.deepEqual(await transferState(), beforeUndo, 'Rejected undo preserves both wallets, inventories, scene audit and operation receipt.');
  }
});

test('competing withdrawals cannot duplicate a globally unique group possession', async () => {
  const definition = (await commitItemDefinitionOperation(db, gm, { action: 'save', operationId: 'define', definition: { id: 'unique:group-test', title: 'Einziges Siegel', kind: 'unique' } })).definition;
  const given = await commitGroupInventoryOperation(db, gm, { operationId: 'grant', groupId: 'crew', action: 'grant', expectedGroupRevision: 1, product: { definitionRef: definition }, quantity: 1 });
  const input = request({ expectedGroupRevision: given.groupRevision, object: { kind: 'item', itemId: given.groupInventory.items[0].id, quantity: 1 } });
  const results = await Promise.allSettled(['one', 'two'].map(id => commitGroupInventoryOperation(db, gm, { ...input, operationId: `to-${id}`, member: { kind: 'character', recordId: id } })));
  assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
  assert.equal((await read('group_quest_accounts/crew')).inventory.items.length, 0);
  const one = await read('characters/one'), two = await read('characters/two');
  assert.equal(one.inventory.items.length + two.inventory.items.length, 1);
  const claim = await read('item_unique_claims/unique:group-test');
  assert.equal(claim.holder.kind, 'characters'); assert.ok(['one', 'two'].includes(claim.holder.recordId));
});

test('linked animals move between canonical group stock and personal ownership; closed scenes roll back', async () => {
  const animal = { ...record('horse'), itemOrigin: { instanceId: 'horse-instance', inventoryItemId: 'horse-item', ownerCharacterId: 'one', ownerCharacterName: 'one', disposition: 'owned' } };
  await db.doc('creatures/horse').set(animal);
  const person = record('one'); person.inventory.items.push({ id: 'horse-item', instanceId: 'horse-instance', creatureId: 'horse', name: 'Pferd', quantity: '1' });
  await db.doc('characters/one').set(person);
  const deposited = await commitGroupInventoryOperation(db, owner, request({ action: 'deposit', operationId: 'deposit', object: { kind: 'item', itemId: 'horse-item', quantity: 1 } }));
  assert.equal((await read('creatures/horse')).itemOrigin.ownerGroupId, 'crew');
  const input = request({ expectedGroupRevision: deposited.groupRevision, expectedMemberRevision: deposited.memberRevision,
    object: { kind: 'item', itemId: deposited.groupInventory.items[0].id, quantity: 1 }, entryId: 'crew::session:camp' });
  await db.doc('comment_turns/crew::session:camp').set({ current: 'ended' });
  const before = await transferState(), animalBefore = await read('creatures/horse');
  await assert.rejects(commitGroupInventoryOperation(db, gm, input), /abgeschlossen/);
  assert.deepEqual(await transferState(), before);
  assert.deepEqual(await read('creatures/horse'), animalBefore);
  await commitGroupInventoryOperation(db, gm, { ...input, entryId: undefined });
  const after = await read('creatures/horse');
  assert.equal(after.itemOrigin.ownerCharacterId, 'one'); assert.equal(after.itemOrigin.ownerGroupId, '');
  assert.deepEqual(after.combatProfile, animal.combatProfile);
});

test('browser currency requests, canonical actor IDs and scene receipts agree for every coin denomination', async () => {
  await db.doc('group_quest_accounts/crew').update({ id: 'forged-group-id', 'inventory.moneyState.totalCopper': 3000 });
  await db.doc('characters/one').update({ id: 'forged-character-id' });
  const original = await read('characters/one');
  for (const [currency, copper] of [['gold', 1000], ['silver', 100], ['copper', 1], ['pfennig', 0.01]]) {
    const account = await read('group_quest_accounts/crew'), member = await read('characters/one');
    const fields = new Map([['kind', 'money'], ['currency', currency], ['moneyQuantity', '1'], ['scene', 'on']]);
    const built = buildGroupAccountRequest({ groupId: 'crew', action: 'withdraw', groupRevision: account.revision,
      member: { kind: 'character', characterId: 'one' }, record: member, access: { uid: gm.uid, role: 'moderator' }, fields, sceneThread: 'crew::session:camp' });
    const input = { ...built, operationId: `coin-${currency}`, actorUid: 'forged-actor-id' };
    const result = await commitGroupInventoryOperation(db, gm, input);
    const receipt = await read(`group_inventory_transactions/${result.receiptId}`), comment = await read(`comments/${result.commentId}`);
    assert.equal(receipt.actorUid, gm.uid); assert.equal(comment.createdBy, gm.uid);
    assert.equal(receipt.groupId, 'crew'); assert.deepEqual(receipt.member, { kind: 'character', recordId: 'one' });
    assert.equal(comment.sceneInventoryTransfer.giver.id, 'crew'); assert.equal(comment.sceneInventoryTransfer.receiver.id, 'one');
    assert.equal(receipt.object.currency, currency); assert.equal(receipt.object.quantity, 1); assert.equal(receipt.object.totalCopper, copper);
    assert.deepEqual(comment.sceneInventoryTransfer.object, receipt.object);
    const groupAfter = await read('group_quest_accounts/crew'), memberAfter = await read('characters/one');
    assert.equal(Math.round(groupAfter.inventory.moneyState.totalCopper * 100), Math.round(account.inventory.moneyState.totalCopper * 100) - Math.round(copper * 100));
    assert.equal(Math.round(memberAfter.inventory.moneyState.totalCopper * 100), Math.round(member.inventory.moneyState.totalCopper * 100) + Math.round(copper * 100));
    assert.equal(Math.round(groupAfter.inventory.moneyState.totalCopper * 100) + Math.round(memberAfter.inventory.moneyState.totalCopper * 100), 301000);
    assert.equal((await commitGroupInventoryOperation(db, gm, input)).receiptId, result.receiptId);
  }
  const after = await read('characters/one');
  assert.deepEqual(after.combatProfile, original.combatProfile);
  assert.equal((await db.collection('comments').get()).size, 4);
  assert.equal((await db.collection('group_inventory_transactions').get()).size, 4);
});

test('invalid denominations, fractional quantities and unauthorized actors never leave partial group transfers', async () => {
  const before = await transferState();
  for (const [auth, changes] of [[null, {}], [owner, { actorUid: 'gm' }], [{ uid: 'outsider', token: {} }, { action: 'deposit', actorUid: 'owner' }],
    [gm, { object: { kind: 'money', currency: 'unknown', quantity: 1 } }],
    ...['gold', 'silver', 'copper', 'pfennig'].map(currency => [gm, { object: { kind: 'money', currency, quantity: 0.5 } }])]) {
    await assert.rejects(commitGroupInventoryOperation(db, auth, request(changes)));
    assert.deepEqual(await transferState(), before);
  }
});

test('ended and unavailable scene variants reject the whole booking while an explicitly linked open scene succeeds', async () => {
  for (const closed of ['page-ended', 'turn-ended', 'hidden', 'archived', 'template', 'missing', 'unlinked']) {
    const module = entry(); module.pages[0].landing.group.sceneThreads = ['outside::session:camp'];
    const external = { id: 'outside', pages: [{ sessionPage: true, commentThreadKey: 'camp' }] };
    if (closed === 'page-ended') external.pages[0].sessionStatus = 'ended';
    if (closed === 'hidden') external.hidden = true;
    if (closed === 'archived') external.archived = true;
    if (closed === 'template') external.isTemplate = true;
    if (closed === 'unlinked') module.pages[0].landing.group.sceneThreads = [];
    await db.doc('module_store_entries/crew').set({ entryJson: JSON.stringify(module) });
    if (closed === 'missing') await db.doc('module_store_entries/outside').delete();
    else await db.doc('module_store_entries/outside').set({ entryJson: JSON.stringify(external) });
    if (closed === 'turn-ended') await db.doc('comment_turns/outside::session:camp').set({ current: 'ended' });
    else await db.doc('comment_turns/outside::session:camp').delete();
    const before = await transferState();
    await assert.rejects(commitGroupInventoryOperation(db, gm, request({ operationId: closed, entryId: 'outside::session:camp' })), /verknüpft|abgeschlossen/, closed);
    assert.deepEqual(await transferState(), before);
  }
  const module = entry(); module.pages[0].landing.group.sceneThreads = ['outside::session:camp'];
  await db.doc('module_store_entries/crew').set({ entryJson: JSON.stringify(module) });
  await db.doc('module_store_entries/outside').set({ entryJson: JSON.stringify({ id: 'outside', pages: [{ sessionPage: true, commentThreadKey: 'camp' }] }) });
  const result = await commitGroupInventoryOperation(db, gm, request({ entryId: 'outside::session:camp' }));
  assert.equal((await read(`comments/${result.commentId}`)).entryId, 'outside::session:camp');
});
