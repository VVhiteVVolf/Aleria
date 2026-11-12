import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { database } from './fixtures/combat-transaction-database.js';
import { catalogEntry, catalogRequest, catalogGroup } from './fixtures/catalog-trade.js';
import { commitSceneTradeOperation } from '../src/scene-trade/commit-scene-trade.js';
import { publicTradeSourceRefs, readMerchantAvailabilityOperation } from '../src/scene-trade/scene-trade-availability.js';
import { buildModuleOffers } from '../src/generated/item-register/item-register-module-catalog.js';
import { STANDARD_ITEMS } from '../src/generated/item-register/item-register-standard.js';
import { findBuiltinTradeModule } from '../src/generated/scene-trade/scene-trade-builtins.js';

const auth = { uid: 'signed-in-player', token: { aleriaRole: 'player' } };
const person = id => ({ id, name: id, ownerUid: `${id}-foreign-owner`, inventory: { revision: 1, items: [], moneyState: { gold: 1 } },
  combatProfile: { revision: 5, hitPoints: { current: 3 }, resources: [{ id: 'mana', current: 2, maximum: 9 }], weapons: [{ id: 'legacy', equipped: true }] } });
function seed(entry = catalogEntry()) {
  return database({ 'characters/gawain': person('gawain'), 'characters/ylva': person('ylva'),
    'characters/merchant': person('merchant'), [`module_store_entries/${entry.id}`]: { entryJson: JSON.stringify(entry) },
    'char_tabs/config': { moduleStoreManifest: { customSections: [{ tab: 'Abenteuer', entryIds: [entry.id] }], hiddenModuleIds: {}, entryOverrideIds: [] } } });
}
const rows = (db, prefix) => [...db.data].filter(([key]) => key.startsWith(prefix + '/'));
async function rejectsWithoutWrites(db, input, pattern) {
  const before = structuredClone([...db.data]);
  await assert.rejects(commitSceneTradeOperation(db, auth, input), pattern);
  assert.deepEqual([...db.data], before);
}

test('catalog gift converts gold change exactly, preserves all profiles and merchant purse, and creates no scene event', async () => {
  const db = seed(), before = structuredClone([...db.data]);
  const response = await commitSceneTradeOperation(db, auth, catalogRequest());
  assert.equal(response.commentId, null);
  assert.deepEqual(response.receipt.context, { kind: 'catalog', moduleId: 'catalog' });
  assert.equal(response.receipt.lines[0].totalMinor, 101);
  assert.deepEqual(db.data.get('characters/gawain').inventory.moneyState, { gold: 0, silver: 9, copper: 98, pfennig: 99, totalCopper: 998.99 });
  assert.equal(db.data.get('characters/gawain').ownerUid, 'gawain-foreign-owner');
  assert.equal(db.data.get('characters/ylva').inventory.items[0].name, 'Arkane Kreide');
  assert.equal(db.data.get('characters/ylva').inventory.items[0].ownerCharacterId, 'ylva');
  assert.equal(db.data.get('characters/ylva').inventory.definitionSchemaVersion, 1);
  for (const id of ['gawain', 'ylva']) assert.deepEqual(db.data.get(`characters/${id}`).combatProfile, new Map(before).get(`characters/${id}`).combatProfile);
  assert.deepEqual(db.data.get('characters/merchant'), new Map(before).get('characters/merchant'));
  assert.deepEqual(db.data.get('module_store_entries/catalog'), new Map(before).get('module_store_entries/catalog'));
  assert.deepEqual(rows(db, 'comments'), []); assert.deepEqual(rows(db, 'comment_turns'), []);
  assert.equal(rows(db, 'scene_trade_transactions').length, 1);
  assert.equal(rows(db, 'item_vendor_wallets')[0][1].mode, 'unlimited');
});

test('catalog response-loss retries return the current inventory without duplicate charge or possession', async () => {
  const db = seed(), input = catalogRequest();
  const [first, retry] = await Promise.all([commitSceneTradeOperation(db, auth, input), commitSceneTradeOperation(db, auth, input)]);
  assert.deepEqual(first.receipt, retry.receipt);
  assert.equal(retry.commentId, null);
  db.data.get('characters/ylva').inventory.items.push({ id: 'later', name: 'Späterer Fund' });
  assert.equal((await commitSceneTradeOperation(db, auth, input)).characters.find(record => record.id === 'ylva').inventory.items.at(-1).id, 'later');
  assert.equal(db.data.get('characters/gawain').inventory.moneyState.totalCopper, 998.99);
  assert.equal(rows(db, 'scene_trade_transactions').length, 1);
  await rejectsWithoutWrites(db, { ...input, lines: [{ ...input.lines[0], quantity: 2, expectedTotalMinor: 202 }] }, /andere Bestellung/);
});

test('catalog buys use a member group treasury without a scene link, retaining manager and personal metadata', async () => {
  const db = seed();
  db.data.set('module_store_entries/crew', { entryJson: JSON.stringify(catalogGroup()) });
  db.data.set('group_quest_accounts/crew', { id: 'crew', name: 'Reisegruppe', managerUids: ['different-account'], revision: 1,
    inventory: { revision: 1, items: [], moneyState: { silver: 1 } } });
  const input = catalogRequest(); input.lines[0].payerKey = 'group:crew';
  input.expectedRevisions = { 'group:crew': 1, 'character:ylva': 1 };
  const response = await commitSceneTradeOperation(db, auth, input);
  assert.equal(response.groups[0].revision, 2);
  assert.deepEqual(response.groups[0].inventory.moneyState, { gold: 0, silver: 0, copper: 98, pfennig: 99, totalCopper: 98.99 });
  assert.deepEqual(response.groups[0].managerUids, ['different-account']);
  assert.deepEqual(db.data.get('characters/gawain').inventory.moneyState, { gold: 1 });
  assert.equal(db.data.get('characters/ylva').inventory.items.length, 1);
  assert.equal(rows(db, 'comments').length, 0);
});

test('catalog group payer still rejects nonmembers, missing groups, stale treasuries and combat locks atomically', async () => {
  for (const mutate of [
    (db, input) => { input.actorCharacterId = 'ylva'; },
    db => { db.data.delete('module_store_entries/crew'); },
    (db, input) => { input.expectedRevisions['group:crew'] = 0; },
    db => { db.data.set('combat_profile_locks/groups/records/crew', { activeEncounterKeys: ['fight'] }); },
  ]) {
    const db = seed();
    db.data.set('module_store_entries/crew', { entryJson: JSON.stringify(catalogGroup()) });
    db.data.set('group_quest_accounts/crew', { revision: 1, inventory: { items: [], moneyState: { totalCopper: 5 } } });
    const input = catalogRequest(); input.lines[0].payerKey = 'group:crew'; input.expectedRevisions = { 'group:crew': 1, 'character:ylva': 1 };
    mutate(db, input); await rejectsWithoutWrites(db, input);
  }
});

test('catalog context cannot become a manual provider, sale, cart, negotiated price, group recipient or invented scene', async () => {
  for (const change of [
    input => { input.merchantId = 'manual-shop'; }, input => { input.entryId = 'catalog::session:invented'; },
    input => { delete input.entryId; }, input => { input.lines.push({ ...input.lines[0], id: 'second' }); },
    input => { input.lines[0].direction = 'sell'; input.lines[0].sellerKey = 'character:gawain'; },
    input => { input.lines[0].priceMode = 'agreed'; input.lines[0].agreedTotalMinor = 0; },
    input => { input.lines[0].recipientKey = 'group:crew'; }, input => { input.action = 'invented'; },
  ]) {
    const db = seed(), input = catalogRequest(); change(input); await rejectsWithoutWrites(db, input);
  }
});

test('catalog rejects unauthenticated, unknown actor, changed accounts, missing money and character combat locks without writes', async () => {
  const unauthenticated = seed(), before = structuredClone([...unauthenticated.data]);
  await assert.rejects(commitSceneTradeOperation(unauthenticated, null, catalogRequest()), /Anmeldung/);
  assert.deepEqual([...unauthenticated.data], before);
  for (const change of [
    (db, input) => { input.actorCharacterId = 'missing'; },
    (db, input) => { input.expectedRevisions['character:ylva'] = 0; },
    db => { db.data.get('characters/gawain').inventory.moneyState = { pfennig: 100 }; },
    db => { db.data.set('combat_profile_locks/characters/records/ylva', { activeEncounterKeys: ['fight'] }); },
    db => { db.data.get('characters/ylva').inventory.items = Array.from({ length: 80 }, (_, id) => ({ id: `occupied-${id}`, name: `Besitz ${id}` })); },
  ]) {
    const db = seed(), input = catalogRequest(); change(db, input); await rejectsWithoutWrites(db, input);
  }
});

test('catalog source, price and visibility remain authoritative and stale review never changes a wallet', async () => {
  for (const change of [
    (db, input) => { input.lines[0].sourceRevision = 'old'; },
    (db, input) => { input.lines[0].moduleId = 'different'; },
    (db, input) => { input.lines[0].productId = 'standard:invented'; },
    (db, input) => { input.lines[0].expectedTotalMinor = 100; },
    db => { db.data.get('char_tabs/config').moduleStoreManifest.hiddenModuleIds.catalog = true; },
    db => { db.data.get('char_tabs/config').moduleStoreManifest.customSections[0].tab = 'Test'; },
    db => { const source = catalogEntry(); source.archived = true; db.data.set('module_store_entries/catalog', { entryJson: JSON.stringify(source) }); },
    db => { db.data.delete('module_store_entries/catalog'); },
  ]) {
    const db = seed(), input = catalogRequest(); change(db, input); await rejectsWithoutWrites(db, input);
  }
});

test('ordinary catalog goods remain available after repeated purchases and never modify source quantities', async () => {
  const db = seed(), source = structuredClone(db.data.get('module_store_entries/catalog'));
  const first = await commitSceneTradeOperation(db, auth, catalogRequest());
  const revisions = Object.fromEntries(first.characters.map(record => [`character:${record.id}`, record.inventory.revision]));
  await commitSceneTradeOperation(db, auth, catalogRequest(catalogEntry(), { operationId: 'second', expectedRevisions: revisions }));
  const availability = await readMerchantAvailabilityOperation(db, auth, { merchantId: 'module:catalog' });
  assert.equal(availability.products[0].unique, false); assert.equal(availability.products[0].available, true);
  assert.equal(db.data.get('characters/ylva').inventory.items.length, 2);
  assert.deepEqual(db.data.get('module_store_entries/catalog'), source);
  assert.equal(rows(db, 'item_unique_claims').length, 0);
});

test('competing catalog buyers cannot duplicate a unique and availability follows its claim after catalogue revisions', async () => {
  const source = catalogEntry({ definitionKind: 'unique' }), db = seed(source), input = catalogRequest(source);
  const first = input, second = { ...input, operationId: 'second', actorCharacterId: 'ylva', lines: [{ ...input.lines[0], payerKey: 'character:ylva', recipientKey: 'character:gawain' }] };
  const attempts = await Promise.allSettled([commitSceneTradeOperation(db, auth, first), commitSceneTradeOperation(db, auth, second)]);
  assert.equal(attempts.filter(result => result.status === 'fulfilled').length, 1);
  assert.equal(db.data.get('characters/gawain').inventory.items.length + db.data.get('characters/ylva').inventory.items.length, 1);
  assert.equal(rows(db, 'item_unique_claims').length, 1);
  assert.equal(rows(db, 'scene_trade_transactions').length, 1);
  const revised = catalogEntry({ definitionKind: 'unique', title: 'Benannte Kreide', priceMin: '7', priceMax: '7' });
  db.data.set('module_store_entries/catalog', { entryJson: JSON.stringify(revised) });
  const state = await readMerchantAvailabilityOperation(db, auth, { merchantId: 'module:catalog' });
  assert.equal(state.products[0].unique, true); assert.equal(state.products[0].available, false); assert.equal(state.products[0].status, 'owned');
});

test('the canonical Arkaneum supports direct purchases with no stored override or scene thread', async () => {
  const entry = findBuiltinTradeModule('lothaires-arkaneum').entry;
  const product = buildModuleOffers([entry], STANDARD_ITEMS).find(product => product.priceRange?.minCopper > 0 && product.priceRange.minCopper < 1000);
  assert.ok(product);
  const db = seed(); db.data.delete('module_store_entries/catalog');
  db.data.get('char_tabs/config').moduleStoreManifest.customSections = [];
  const input = catalogRequest(entry); input.lines[0] = { ...input.lines[0], productId: product.id, sourceRevision: product.sourceRevision, expectedTotalMinor: Math.round(product.priceRange.minCopper * 100) };
  await commitSceneTradeOperation(db, auth, input);
  assert.equal(db.data.get('characters/ylva').inventory.items[0].name, product.title);
  assert.equal(db.data.has('module_store_entries/lothaires-arkaneum'), false);
  assert.equal(rows(db, 'comments').length, 0);
  assert.ok(db.data.has(`item_vendor_wallets/${createHash('sha256').update('module:lothaires-arkaneum').digest('hex')}`));
});

test('availability exposes only bounded public source locators and never catalogue descriptions or module titles', async () => {
  const source = catalogEntry({ description: 'secret-from-description' });
  source.pages = Array.from({ length: 3 }, () => structuredClone(source.pages[0]));
  const db = seed(source), before = structuredClone([...db.data]);
  const response = await readMerchantAvailabilityOperation(db, auth, { merchantId: 'module:catalog' });
  assert.equal(response.products.length, 1);
  assert.equal(response.products[0].sourceRefs.length, 3);
  assert.deepEqual(response.products[0].sourceRefs[0], { kind: 'trade-catalog', pageIndex: 0, itemIndex: 0, itemId: 'chalk' });
  assert.equal(response.products[0].sourceRefs.at(-1).pageIndex, 2);
  const allowed = new Set(['kind', 'pageIndex', 'itemId', 'itemIndex', 'tableId', 'rowId', 'rowIndex', 'priceOption', 'unit']);
  for (const ref of response.products[0].sourceRefs) assert.ok(Object.keys(ref).every(key => allowed.has(key)));
  assert.equal(JSON.stringify(response).includes('secret-from-description'), false);
  assert.equal(JSON.stringify(response).includes(source.title), false);
  assert.deepEqual([...db.data], before);
});

test('availability source projection bounds excessive references and strips arbitrary or malformed legacy fields', () => {
  const source = { kind: 'trade-catalog', pageIndex: 3, itemId: 'row', itemIndex: -1, rowIndex: 1.5,
    priceOption: 'x'.repeat(300), unit: 'Stück', moduleTitle: 'Not returned', ownerUid: 'private' };
  const result = publicTradeSourceRefs({ moduleId: 'catalog', sourceRefs: Array.from({ length: 101 }, () => source) });
  assert.equal(result.length, 100);
  assert.deepEqual(result[0], { kind: 'trade-catalog', pageIndex: 3, itemId: 'row', priceOption: 'x'.repeat(220), unit: 'Stück' });
  assert.deepEqual(publicTradeSourceRefs({ sourceRefs: [source] }), []);
  assert.deepEqual(publicTradeSourceRefs({ moduleId: 'catalog', sourceRefs: [null, { kind: 'private' }] }), []);
});

test('availability source locators retain exact goods row identity and trade price-option units', async () => {
  const source = catalogEntry({ priceOptions: [{ label: 'Klein', unit: 'Flasche', price: '1 KT' }, { label: 'Groß', unit: 'Kanne', price: '2 KT' }] });
  source.pages.push({ goodsTablePage: true, goodsTable: { tables: [{ id: 'table', columns: [], rows: [
    { id: 'unique-row', definitionKind: 'unique', values: { name: 'Benannter Kristall', kind: 'Werkzeug', price: '3 KT' } },
  ] }] } });
  const response = await readMerchantAvailabilityOperation(seed(source), auth, { merchantId: 'module:catalog' });
  assert.ok(response.products.some(product => product.sourceRefs.some(ref => ref.kind === 'goods-register' && ref.pageIndex === 1 && ref.tableId === 'table' && ref.rowId === 'unique-row' && ref.rowIndex === 0)));
  assert.ok(response.products.some(product => product.sourceRefs.some(ref => ref.kind === 'trade-catalog' && ref.itemId === 'chalk' && ref.priceOption === 'Groß' && ref.unit === 'Kanne')));
});
