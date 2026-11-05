import test, { beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { commitSceneTradeOperation, readMerchantSoldOperation } from '../../src/scene-trade/commit-scene-trade.js';
import { readMerchantAvailabilityOperation } from '../../src/scene-trade/scene-trade-availability.js';
import { commitItemDefinitionOperation } from '../../src/items/commit-item-definition.js';
import { undoMechanicalCommentOperation } from '../../src/mechanics/commit-undo-mechanical-comment.js';
import { STANDARD_ITEMS } from '../../src/generated/item-register/item-register-standard.js';
import { commitItemRecordOperation } from '../../src/items/commit-item-record.js';

const projectId = 'demo-aleria-scene-trade';
if (process.env.FIRESTORE_EMULATOR_HOST !== '127.0.0.1:8187') throw Error('Only the isolated local Firestore emulator at 127.0.0.1:8187 is allowed.');
const db = getFirestore(initializeApp({ projectId }, 'scene-trade-integration'));
const owner = { uid: 'owner', token: {} }, gm = { uid: 'gm', token: { aleriaRole: 'moderator' } };
const player = { uid: 'independent-player', token: { aleriaRole: 'player' } };
const food = STANDARD_ITEMS.find(item => item.category === 'speisen' && item.priceRange);
const record = (id, ownerUid = 'owner') => ({ id, name: id, ownerUid, inventory: { revision: 1, items: [], moneyState: { totalCopper: 100 } },
  combatProfile: { revision: 1, hitPoints: { current: 7 }, resources: [{ id: 'mana', current: 2, maximum: 10 }], weapons: [{ id: 'held', name: 'Persönliche Klinge', equipped: true }] } });
const product = () => ({ ...food, id: 'offer:food', listId: 'shop', listName: 'Arkanist', section: 'offer', revision: 1, stock: 1, priceRange: { minCopper: 10, maxCopper: 10 } });
const line = (extra = {}) => ({ id: 'one', direction: 'buy', productId: 'offer:food', offerRevision: 1, quantity: 2, payerKey: 'character:gawain', recipientKey: 'character:ylva', priceMode: 'standard', expectedTotalMinor: Number(extra.quantity ?? 2) * 1000, ...extra });
const request = (extra = {}) => ({ action: 'checkout', operationId: 'order', actorCharacterId: 'gawain', merchantId: 'shop', entryId: 'adventure::session:shop',
  expectedRevisions: { 'character:gawain': 1, 'character:ylva': 1 }, lines: [line()], ...extra });
const read = async path => (await db.doc(path).get()).data();
const state = async () => ({ gawain: await read('characters/gawain'), ylva: await read('characters/ylva'),
  receipts: (await db.collection('scene_trade_transactions').get()).size, comments: (await db.collection('comments').get()).size,
  sold: (await db.collection('item_merchant_sold').get()).size, wallets: (await db.collection('item_vendor_wallets').get()).docs.map(row => row.data()) });
beforeEach(async () => {
  const response = await fetch(`http://127.0.0.1:8187/emulator/v1/projects/${projectId}/databases/(default)/documents`, { method: 'DELETE' });
  assert.ok(response.ok);
  const batch = db.batch();
  batch.set(db.doc('characters/gawain'), record('gawain'));
  batch.set(db.doc('characters/ylva'), record('ylva', 'ylva-owner'));
  batch.set(db.doc('module_store_entries/adventure'), { entryJson: JSON.stringify({ id: 'adventure', title: 'Abenteuer', pages: [{ sessionPage: true, commentThreadKey: 'shop' }] }) });
  batch.set(db.doc('char_tabs/config'), { moduleStoreManifest: { customSections: [{ tab: 'Abenteuer', entryIds: ['adventure'] }], hiddenModuleIds: {}, entryOverrideIds: [] } });
  batch.set(db.doc('item_register_offers/offer:food'), product());
  await batch.commit();
});
after(() => db.terminate());

test('real player checkout buys, gifts and sells for unowned and foreign figures without ownership changes', async () => {
  const unowned = record('gawain'); delete unowned.ownerUid;
  await db.doc('characters/gawain').set(unowned);
  await commitSceneTradeOperation(db, player, request({ lines: [line({ payerKey: 'character:ylva', recipientKey: 'character:gawain' })] }));
  const bought = await state(), itemId = bought.gawain.inventory.items[0].id;
  assert.equal(bought.gawain.inventory.moneyState.totalCopper, 100);
  assert.equal(bought.ylva.inventory.moneyState.totalCopper, 80);
  assert.equal(bought.gawain.inventory.items[0].quantity, '2');
  await commitSceneTradeOperation(db, player, request({ operationId: 'open-sale', actorCharacterId: 'ylva',
    expectedRevisions: { 'character:gawain': bought.gawain.inventory.revision },
    lines: [{ id: 'sale', direction: 'sell', sellerKey: 'character:gawain', itemId, quantity: 2, priceMode: 'agreed', agreedTotalMinor: 300 }] }));
  const sold = await state();
  assert.equal(sold.gawain.inventory.moneyState.totalCopper, 103);
  assert.equal(sold.gawain.inventory.items.length, 0);
  assert.equal(sold.ylva.inventory.moneyState.totalCopper, 80);
  assert.equal(sold.gawain.ownerUid, undefined);
  assert.equal(sold.ylva.ownerUid, 'ylva-owner');
  assert.equal(sold.receipts, 2); assert.equal(sold.comments, 2); assert.equal(sold.sold, 1);
  assert.deepEqual(sold.gawain.combatProfile, unowned.combatProfile);
});

test('real player uses a linked group treasury and stock without manager authority', async () => {
  const group = { id: 'crew', title: 'Gruppe', pages: [
    { hierarchyPage: true, hierarchy: { trees: [{ label: 'Aktive', levels: [{ nodes: [{ title: 'Ritter', subtitle: 'gawain' }] }] }] } },
    { landingPage: true, landing: { group: { members: [{ id: 'hierarchy:gawain', characterId: 'gawain' }], guests: [], sceneThreads: ['adventure::session:shop'] } } }
  ] };
  await db.doc('module_store_entries/crew').set({ entryJson: JSON.stringify(group) });
  await db.doc('group_quest_accounts/crew').set({ id: 'crew', name: 'Gruppe', managerUids: ['other-manager'], revision: 1,
    inventory: { revision: 1, items: [{ id: 'supplies', name: 'Vorräte', quantity: '2', purchase: { unitCopper: 4 } }], moneyState: { totalCopper: 50 } } });
  const input = request({ expectedRevisions: { 'group:crew': 1, 'character:ylva': 1 }, lines: [line({ payerKey: 'group:crew' }),
    { id: 'sale', direction: 'sell', sellerKey: 'group:crew', itemId: 'supplies', quantity: 1, priceMode: 'standard', expectedTotalMinor: 200 }] });
  await commitSceneTradeOperation(db, player, input);
  const treasury = await read('group_quest_accounts/crew'), after = await state();
  assert.equal(treasury.inventory.moneyState.totalCopper, 32);
  assert.equal(treasury.inventory.items[0].quantity, '1');
  assert.equal(treasury.revision, 2);
  assert.deepEqual(treasury.managerUids, ['other-manager']);
  assert.equal(after.gawain.inventory.moneyState.totalCopper, 100);
  assert.equal(after.ylva.inventory.items[0].quantity, '2');
  assert.equal(after.receipts, 1); assert.equal(after.comments, 1); assert.equal(after.sold, 1);
});

test('real concurrent response-loss retries charge once and gift exact items while retaining saved profiles', async () => {
  const beforeGawain = await read('characters/gawain'), beforeYlva = await read('characters/ylva');
  const [first, retry] = await Promise.all([commitSceneTradeOperation(db, owner, request()), commitSceneTradeOperation(db, owner, request())]);
  assert.equal(first.commentId, retry.commentId);
  const after = await state(); assert.equal(after.receipts, 1); assert.equal(after.comments, 1);
  assert.equal(after.gawain.inventory.moneyState.totalCopper, 80); assert.equal(after.ylva.inventory.items[0].quantity, '2');
  assert.deepEqual(after.gawain.combatProfile, beforeGawain.combatProfile); assert.deepEqual(after.ylva.combatProfile, beforeYlva.combatProfile);
  await db.doc('characters/ylva').update({ 'inventory.items': [...after.ylva.inventory.items, { id: 'later', name: 'Späterer Fund' }] });
  assert.equal((await commitSceneTradeOperation(db, owner, request())).characters.find(person => person.id === 'ylva').inventory.items.at(-1).id, 'later');
  assert.equal((await read('item_register_offers/offer:food')).stock, 1);
  await assert.rejects(undoMechanicalCommentOperation({ auth: gm, data: { entryId: request().entryId, commentId: first.commentId, force: true } }, { database: db }), /Gegenbuchung/);
});

test('real competing checkouts grant an explicit unique to at most one buyer', async () => {
  const definition = (await commitItemDefinitionOperation(db, gm, { action: 'save', operationId: 'define', definition: { id: 'unique:crystal', kind: 'unique', title: 'Einziger Kristall', category: 'arkanes' } })).definition;
  await db.doc('item_register_offers/offer:food').set({ ...product(), title: definition.title, category: 'arkanes', definitionRef: { id: definition.id, revision: definition.revision }, stock: null });
  const results = await Promise.allSettled(['gawain', 'ylva'].map(id => commitSceneTradeOperation(db, gm, request({ operationId: `buy-${id}`, actorCharacterId: id,
    expectedRevisions: { [`character:${id}`]: 1 }, lines: [line({ quantity: 1, payerKey: `character:${id}`, recipientKey: `character:${id}` })] }))));
  assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
  const after = await state(); assert.equal(after.gawain.inventory.items.length + after.ylva.inventory.items.length, 1); assert.equal(after.receipts, 1);
  assert.equal((await readMerchantAvailabilityOperation(db, owner, { merchantId: 'shop' })).products[0].status, 'owned');
  assert.ok((await read('item_unique_claims/unique:crystal')).instanceId);
});

test('real horse sale retains original identity, exact sold pile and creature linkage without a merchant purse limit', async () => {
  const horse = { id: 'horse-item', instanceId: 'horse-instance', creatureId: 'horse', name: 'Morgenwind', quantity: '1', image: 'horse.webp' };
  await db.doc('characters/gawain').update({ 'inventory.items': [horse] });
  const creature = { name: 'Morgenwind', combatProfile: { hitPoints: { current: 6 } }, itemOrigin: { instanceId: horse.instanceId, inventoryItemId: horse.id, ownerCharacterId: 'gawain', disposition: 'owned' } };
  await db.doc('creatures/horse').set(creature);
  const input = request({ expectedRevisions: { 'character:gawain': 1 }, lines: [{ id: 'sale', direction: 'sell', sellerKey: 'character:gawain', itemId: horse.id, quantity: 1, priceMode: 'agreed', agreedTotalMinor: 50000 }] });
  await commitSceneTradeOperation(db, owner, input);
  const after = await state(), sold = (await readMerchantSoldOperation(db, owner, { merchantId: 'shop' })).items[0];
  assert.equal(after.gawain.inventory.moneyState.totalCopper, 600); assert.equal(after.wallets[0].netMinor, -50000);
  assert.equal(sold.item.instanceId, horse.instanceId); assert.equal(sold.item.name, horse.name); assert.equal(sold.item.creatureId, undefined); assert.equal(sold.quantity, 1);
  assert.deepEqual((await db.collection('item_merchant_sold').get()).docs[0].data().item, horse);
  const animal = await read('creatures/horse'); assert.equal(animal.itemOrigin.ownerMerchantId, 'shop'); assert.equal(animal.itemOrigin.ownerCharacterId, '');
  assert.deepEqual(animal.combatProfile, creature.combatProfile);
  await assert.rejects(commitItemRecordOperation(db, owner, { kind: 'creatures', id: 'horse', operationId: 'former-owner-edit', data: { name: 'Zurückgeholt' } }), /verkauftes Tier/);
  const retried = await commitSceneTradeOperation(db, owner, input); assert.ok(retried.receipt); assert.equal((await state()).sold, 1);
});

test('real failed mixed cart leaves no partial wallet, possession, definition, receipt or scene change', async () => {
  const before = await state();
  await assert.rejects(commitSceneTradeOperation(db, owner, request({ lines: [line(), line({ id: 'too-expensive', priceMode: 'agreed', agreedTotalMinor: 100000 })] })), /genug Geld/);
  assert.deepEqual(await state(), before);
  assert.equal((await db.collection('item_definition_versions').get()).size, 0);
  await db.doc('comment_turns/adventure::session:shop').set({ current: 'ended' });
  await assert.rejects(commitSceneTradeOperation(db, owner, request()), /abgeschlossen/);
  assert.deepEqual(await state(), before);
});

test('real duplicate item lines prepare and create one new definition version only', async () => {
  await db.doc('item_register_offers/offer:food').set({ ...product(), definitionRef: null, title: 'Eigenes Hausgebäck' });
  const before = await state();
  await readMerchantAvailabilityOperation(db, owner, { merchantId: 'shop' });
  assert.deepEqual(await state(), before); assert.equal((await db.collection('item_definition_versions').get()).size, 0);
  await commitSceneTradeOperation(db, owner, request({ lines: [line({ quantity: 1 }), line({ id: 'two', quantity: 1, recipientKey: 'character:gawain' })] }));
  assert.equal((await db.collection('item_definition_versions').get()).size, 1);
  assert.equal((await state()).receipts, 1);
});

test('real sold-pile pagination orders equal timestamps by document identity without skipping old items', async () => {
  const at = '2026-11-04T12:00:00.000Z', batch = db.batch();
  for (let index = 0; index < 103; index++) batch.set(db.doc(`item_merchant_sold/sold-${String(index).padStart(3, '0')}`), {
    merchantId: 'shop', item: { id: `item-${index}`, name: `Fund ${index}` }, quantity: 1, totalMinor: 1, status: 'sold', at
  });
  await batch.commit();
  const first = await readMerchantSoldOperation(db, owner, { merchantId: 'shop' });
  const second = await readMerchantSoldOperation(db, owner, { merchantId: 'shop', cursor: first.nextCursor });
  assert.equal(first.items.length, 100); assert.equal(second.items.length, 3); assert.equal(second.nextCursor, null);
  assert.equal(new Set([...first.items, ...second.items].map(item => item.id)).size, 103);
  assert.equal(first.items[0].id, 'sold-102'); assert.equal(second.items.at(-1).id, 'sold-000');
});
