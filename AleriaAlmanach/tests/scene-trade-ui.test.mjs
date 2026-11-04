import test from 'node:test';
import assert from 'node:assert/strict';
import { createSceneTradeState, initializeSceneTradeDefaults, sceneTradeAccounts, addSceneTradeBuy,
  addSceneTradeSell, updateSceneTradeLine, sceneTradeSummary, buildSceneTradeCheckout,
  refreshSceneTradeLines } from '../modules/scene-trade/scene-trade-state.js';
import { renderSceneTradeDialog } from '../modules/scene-trade/scene-trade-view.js';
import { createSceneTradeSubmission } from '../modules/scene-trade/scene-trade-submission.js';

function setup() {
  const product = { id: 'offer:potion', listId: 'module:arkaneum', title: 'Heiltrank', section: 'offer',
    moduleId: 'arkaneum', category: 'alchemie', priceRange: { minCopper: 10, maxCopper: 20 }, sourceRevision: 'first', stock: 0 };
  const data = { access: { uid: 'u1', role: 'player' }, providers: [{ id: 'module:arkaneum', title: 'Arkaneum' }], offers: [product],
    characters: [{ id: 'gawain', name: 'Gawain', ownerUid: 'u1', inventory: { revision: 2, moneyState: { totalCopper: 100 }, items: [] } },
      { id: 'ylva', name: 'Ylva', ownerUid: 'u2', inventory: { revision: 5, moneyState: { totalCopper: 30 }, items: [] } }],
    groups: [{ id: 'companions', name: 'Reisegruppe', managerUids: ['u1'], revision: 8,
      tradeContext: { moduleId: 'group-page', sceneThreads: ['entry::scene-exact'], memberCharacterIds: ['gawain'] }, inventory: { moneyState: { totalCopper: 500 }, items: [] } },
      { id: 'foreign', name: 'Fremde Gruppe', managerUids: ['u2'], inventory: { items: [] } }] };
  const state = createSceneTradeState('entry::scene-exact'); state.merchantId = product.listId;
  initializeSceneTradeDefaults(state, data, 'gawain');
  let count = 0;
  return { state, data, product, makeId: () => `line-${++count}` };
}

test('group order keeps payer, recipient, scene and authoritative revision guards separate', () => {
  const { state, data, product, makeId } = setup();
  state.recipientKey = 'character:ylva'; addSceneTradeBuy(state, product, makeId);
  state.payerKey = 'group:companions'; state.recipientKey = 'character:gawain'; addSceneTradeBuy(state, product, makeId);
  const request = buildSceneTradeCheckout(state, data), summary = sceneTradeSummary(state, data);
  assert.equal(request.entryId, 'entry::scene-exact'); assert.equal(request.actorCharacterId, 'gawain');
  assert.deepEqual(request.expectedRevisions, { 'character:gawain': 2, 'character:ylva': 5, 'group:companions': 8 });
  assert.equal(request.lines[0].payerKey, 'character:gawain'); assert.equal(request.lines[0].recipientKey, 'character:ylva');
  assert.equal(request.lines[1].payerKey, 'group:companions');
  assert.equal(request.lines[0].expectedTotalMinor, 1000);
  assert.equal(summary.rows.find(account => account.id === 'ylva').pays, 0);
  assert.equal(summary.buys, 2000);
  assert.equal('title' in request.lines[0], false);
});

test('repeatable wares remain purchasable after legacy stock reaches zero; explicit unavailable blocks', () => {
  const { state, data, product, makeId } = setup();
  addSceneTradeBuy(state, product, makeId); addSceneTradeBuy(state, product, makeId);
  assert.equal(state.lines[0].quantity, 2);
  assert.equal(state.lines[0].maxQuantity, 9999);
  assert.deepEqual(sceneTradeSummary(state, data).errors, []);
  assert.throws(() => addSceneTradeBuy(state, { ...product, available: false }, makeId), /nicht verfügbar/);
});

test('only explicit uniqueness locks quantity and prevents a second copy in the cart', () => {
  const { state, product, makeId } = setup();
  const named = { ...product, title: 'Benannte Serienklinge' };
  addSceneTradeBuy(state, named, makeId); addSceneTradeBuy(state, named, makeId);
  assert.equal(state.lines[0].quantity, 2);
  state.lines = [];
  const unique = { ...named, definitionKind: 'unique' };
  addSceneTradeBuy(state, unique, makeId);
  assert.equal(state.lines[0].maxQuantity, 1);
  assert.throws(() => addSceneTradeBuy(state, unique, makeId), /Einzelstück/);
});

test('a negotiated position total survives quantity changes until explicitly checked', () => {
  const { state, data, product, makeId } = setup(); addSceneTradeBuy(state, product, makeId);
  const line = state.lines[0], accounts = sceneTradeAccounts(data);
  updateSceneTradeLine(line, 'agreedTotalMinor', '7.77', accounts);
  updateSceneTradeLine(line, 'quantity', '3', accounts);
  assert.equal(line.agreedTotalMinor, 777); assert.equal(line.priceNeedsReview, true);
  assert.throws(() => buildSceneTradeCheckout(state, data), /erneut prüfen/);
  updateSceneTradeLine(line, 'agreedTotalMinor', '7.77', accounts);
  assert.equal(buildSceneTradeCheckout(state, data).lines[0].agreedTotalMinor, 777);
});

test('agreed price rejects fractions of one Pfennig and aggregate overflow before checkout', () => {
  const { state, data, product, makeId } = setup(); addSceneTradeBuy(state, product, makeId);
  const accounts = sceneTradeAccounts(data);
  assert.throws(() => updateSceneTradeLine(state.lines[0], 'agreedTotalMinor', '0.001', accounts), /Nachkommastellen/);
  assert.equal(state.lines[0].priceMode, 'standard');
  updateSceneTradeLine(state.lines[0], 'agreedTotalMinor', '60000000000000', accounts);
  addSceneTradeBuy(state, product, makeId);
  updateSceneTradeLine(state.lines[1], 'agreedTotalMinor', '60000000000000', accounts);
  assert.ok(sceneTradeSummary(state, data).errors.some(message => /Gesamtbetrag/.test(message)));
});

test('foreign wallets are readable recipients but cannot be selected as payer', () => {
  const { state, data, product, makeId } = setup(); addSceneTradeBuy(state, product, makeId);
  const accounts = sceneTradeAccounts(data);
  assert.equal(accounts.some(account => account.key === 'group:foreign'), false);
  assert.throws(() => updateSceneTradeLine(state.lines[0], 'payerKey', 'character:ylva', accounts), /nicht berechtigt/);
  updateSceneTradeLine(state.lines[0], 'recipientKey', 'character:ylva', accounts);
  assert.equal(sceneTradeSummary(state, data).errors.length, 0);
});

test('managed group requires the exact scene link and actor membership; unknown metadata stays unavailable', () => {
  const { state, data } = setup();
  assert.ok(sceneTradeAccounts(data).some(account => account.key === 'group:companions'));
  data.groups[0].tradeContext.sceneThreads = ['entry::another-scene'];
  assert.equal(sceneTradeAccounts(data).some(account => account.key === 'group:companions'), false);
  assert.ok(renderSceneTradeDialog({ state, data }).includes('mit dieser Szene nicht verknüpft'));
  data.groups[0].tradeContext.sceneThreads = [state.threadId]; data.groups[0].tradeContext.memberCharacterIds = ['someone-else'];
  assert.equal(sceneTradeAccounts(data).some(account => account.key === 'group:companions'), false);
  delete data.groups[0].tradeContext;
  assert.ok(renderSceneTradeDialog({ state, data }).includes('Szenenverknüpfung ist nicht bestätigt'));
});

test('unknown legacy sale needs an agreed price and preserves the source inventory identity', () => {
  const { state, data, makeId } = setup();
  const item = { id: 'legacy-horse', instanceId: 'horse-exact', creatureId: 'horse-profile', name: 'Stern', quantity: '1' };
  data.characters[0].inventory.items.push(item);
  addSceneTradeSell(state, item, sceneTradeAccounts(data)[0], data.offers, makeId);
  assert.equal(state.lines[0].priceMode, 'agreed'); assert.equal(state.lines[0].agreedTotalMinor, null);
  assert.throws(() => buildSceneTradeCheckout(state, data), /fehlt/);
  updateSceneTradeLine(state.lines[0], 'agreedTotalMinor', '120', sceneTradeAccounts(data));
  const request = buildSceneTradeCheckout(state, data);
  assert.equal(request.lines[0].itemId, 'legacy-horse'); assert.equal(request.lines[0].sellerKey, 'character:gawain');
  assert.equal(request.lines[0].recipientKey, 'character:gawain');
  assert.deepEqual(data.characters[0].inventory.items[0], item);
});

test('sale preview uses valuation fallback and never another merchant buyback offer', () => {
  const { state, data, makeId } = setup();
  const item = { id: 'old', name: 'Alter Stein', templateId: 'stone', quantity: '1', valuation: { minCopper: 19 } };
  data.characters[0].inventory.items.push(item);
  data.offers.push({ id: 'offer:foreign', section: 'offer', listId: 'foreign', templateId: 'stone', buybackCopper: 1000 });
  addSceneTradeSell(state, item, sceneTradeAccounts(data)[0], data.offers, makeId);
  assert.equal(state.lines[0].referenceUnitMinor, 950);
});

test('refresh updates standard baseline and product revision without changing negotiated total', () => {
  const { state, data, product, makeId } = setup(); addSceneTradeBuy(state, product, makeId);
  updateSceneTradeLine(state.lines[0], 'agreedTotalMinor', '8', sceneTradeAccounts(data));
  data.offers[0] = { ...product, sourceRevision: 'second', priceRange: { minCopper: 15, maxCopper: 20 } };
  refreshSceneTradeLines(state, data);
  assert.equal(state.lines[0].sourceRevision, 'second'); assert.equal(state.lines[0].referenceUnitMinor, 1500);
  assert.equal(buildSceneTradeCheckout(state, data).lines[0].agreedTotalMinor, 800);
});

test('lost response freezes exact checkout for one retry and prevents parallel double-submit', async () => {
  const calls = []; let release;
  const operations = createSceneTradeSubmission(async input => {
    calls.push(input);
    if (calls.length === 1) { await new Promise(resolve => { release = resolve; }); throw Error('lost response'); }
    return { commentId: 'receipt' };
  }, () => 'operation-fixed');
  const input = { action: 'checkout', lines: [{ id: 'one', agreedTotalMinor: 123 }] };
  const first = operations.submit(input);
  assert.equal(operations.running(), true);
  assert.throws(() => operations.submit({ lines: [] }), /offenen Handel/);
  await assert.rejects(operations.retry(), /bereits bestätigt/);
  input.lines[0].agreedTotalMinor = 999;
  release(); await assert.rejects(first, /lost response/);
  assert.equal(operations.pending().lines[0].agreedTotalMinor, 123);
  await operations.retry(); assert.deepEqual(calls[1], calls[0]); assert.equal(operations.pending(), null);
});

test('definitive backend rejection releases request lock without claiming a purchase', async () => {
  const operations = createSceneTradeSubmission(async () => { const error = Error('revision changed'); error.code = 'functions/aborted'; throw error; });
  await assert.rejects(operations.submit({ lines: [] }), /revision changed/);
  assert.equal(operations.pending(), null); assert.equal(operations.running(), false);
});

function fakeStorage() {
  const values = new Map();
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key), size: () => values.size };
}
function validPersistentRequest(thread = 'scene:one') {
  return { action: 'checkout', entryId: thread, merchantId: 'merchant', actorCharacterId: 'gawain', expectedRevisions: { 'character:gawain': 1 }, lines: [{ id: 'one', quantity: 1, productId: 'potion' }] };
}
test('browser reload restores exact unresolved request per signed-in user and exact thread', async () => {
  const storage = fakeStorage(), input = validPersistentRequest(); let firstCalls = 0;
  const first = createSceneTradeSubmission(async () => { firstCalls++; throw Error('reply lost'); }, () => 'stable-operation', { requirePersistence: true });
  first.bindPersistence({ storage, uid: 'u1', threadId: input.entryId });
  await assert.rejects(first.submit(input), /reply lost/); assert.equal(firstCalls, 1); assert.equal(storage.size(), 1);
  const restoredCalls = [], restored = createSceneTradeSubmission(async request => { restoredCalls.push(request); return { commentId: 'confirmed' }; }, undefined, { requirePersistence: true });
  restored.bindPersistence({ storage, uid: 'u1', threadId: input.entryId });
  assert.equal(restoredCalls.length, 0, 'restore never resubmits automatically');
  assert.deepEqual(restored.pending(), { ...input, operationId: 'stable-operation' });
  const otherUser = createSceneTradeSubmission(async () => {}), otherThread = createSceneTradeSubmission(async () => {});
  otherUser.bindPersistence({ storage, uid: 'u2', threadId: input.entryId });
  otherThread.bindPersistence({ storage, uid: 'u1', threadId: 'scene:two' });
  assert.equal(otherUser.pending(), null); assert.equal(otherThread.pending(), null);
  await restored.retry(); assert.deepEqual(restoredCalls[0], first.pending()); assert.equal(storage.size(), 0);
  assert.equal(restored.pending(), null);
});

test('unavailable browser storage prevents any checkout and definitive rejection clears its request', async () => {
  let calls = 0;
  const unavailable = createSceneTradeSubmission(async () => { calls++; }, undefined, { requirePersistence: true });
  unavailable.bindPersistence({ uid: 'u1', threadId: 'scene:one', storage: { getItem: () => null, setItem: () => { throw Error('blocked'); }, removeItem() {} } });
  assert.throws(() => unavailable.submit(validPersistentRequest()), /Sitzungsspeicher/); assert.equal(calls, 0); assert.equal(unavailable.pending(), null);
  const storage = fakeStorage(), rejected = createSceneTradeSubmission(async () => { const error = Error('no permission'); error.code = 'functions/permission-denied'; throw error; }, undefined, { requirePersistence: true });
  rejected.bindPersistence({ storage, uid: 'u1', threadId: 'scene:one' });
  await assert.rejects(rejected.submit(validPersistentRequest()), /no permission/);
  assert.equal(storage.size(), 0); assert.equal(rejected.pending(), null);
});

test('view confines offers to merchant, escapes content and labels unavailable foreign payers', () => {
  const { state, data, product, makeId } = setup();
  data.offers.push({ ...product, id: 'other', listId: 'other-provider', title: 'Fremdes Sortiment' });
  data.offers[0].title = '<img src=x onerror=alert(1)>';
  addSceneTradeBuy(state, data.offers[0], makeId);
  const markup = renderSceneTradeDialog({ state, data });
  assert.ok(markup.includes('&lt;img src=x onerror=alert(1)&gt;'));
  assert.equal(markup.includes('<img src=x'), false);
  assert.equal(markup.includes('Fremdes Sortiment'), false);
  assert.match(markup, /value="character:ylva"\s+disabled/);
  assert.ok(markup.includes('Bestellung prüfen'));
});

test('sold pile displays exact item snapshot without offering a buyback action', () => {
  const { state, data } = setup(); state.mode = 'sold';
  const markup = renderSceneTradeDialog({ state, data, sold: [{ id: 'sale', quantity: 1, totalMinor: 2700,
    item: { id: 'original-horse', instanceId: 'horse', name: 'Stern', quantity: '1' } }] });
  assert.ok(markup.includes('Stern')); assert.ok(markup.includes('Verkauft für 27 KT'));
  assert.equal(markup.includes('Rückkauf'), false); assert.equal(markup.includes('data-trade-action="add-buy"'), false);
  const paged = renderSceneTradeDialog({ state, data, sold: [{ id: 'sale', item: { name: 'Stern' } }], soldNextCursor: { at: '2026-11-04', id: 'sale' } });
  assert.ok(paged.includes('Weitere Verkäufe laden'));
});

test('restored pending receipt shows exact retry alone and cannot edit a fresh purchase', () => {
  const { state, data } = setup();
  const request = { ...validPersistentRequest(state.threadId), operationId: 'same', merchantId: state.merchantId,
    lines: [{ id: 'one', productId: 'offer:potion', direction: 'buy', quantity: 2, priceMode: 'agreed', agreedTotalMinor: 333 }] };
  const markup = renderSceneTradeDialog({ state, data, pending: true, pendingRequest: request });
  assert.ok(markup.includes('Offener Handel')); assert.ok(markup.includes('2 × Heiltrank')); assert.ok(markup.includes('3,33 KT'));
  assert.ok(markup.includes('data-trade-action="retry"'));
  assert.equal(markup.includes('data-trade-action="checkout"'), false);
  assert.equal(markup.includes('data-trade-field="merchantId"'), false);
});

test('availability status distinguishes owned and sold unique goods from unconfirmed stock', () => {
  const { state, data, product } = setup();
  data.offers = [{ ...product, available: false, definitionKind: 'unique', availabilityStatus: 'owned' }];
  assert.ok(renderSceneTradeDialog({ state, data }).includes('Bereits vergeben'));
  data.offers[0].availabilityStatus = 'sold';
  assert.ok(renderSceneTradeDialog({ state, data }).includes('Beim Händler verwahrt'));
  data.offers[0].availabilityStatus = 'checking';
  assert.ok(renderSceneTradeDialog({ state, data }).includes('Verfügbarkeit wird geprüft'));
  assert.throws(() => addSceneTradeBuy(state, data.offers[0]), /nicht verfügbar/);
});
