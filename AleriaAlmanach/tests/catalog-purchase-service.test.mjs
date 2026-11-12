import test from 'node:test';
import assert from 'node:assert/strict';
import { createCatalogPurchaseService } from '../modules/catalog-purchase/catalog-purchase-service.js';

const offer = (id, moduleId = 'eleganz', pageIndex = 1) => ({ id, moduleId, listId: `module:${moduleId}`,
  sourceRefs: [{ kind: 'trade-catalog', moduleId, pageIndex, itemId: id }] });
function setup(overrides = {}) {
  const calls = [], published = [], source = { characters: [{ id: 'gawain', inventory: { revision: 1 } }],
    groups: [{ id: 'companions', revision: 2, tradeContext: { memberCharacterIds: ['gawain'] } }], access: { uid: 'u1' },
    offers: [offer('here'), offer('other-page', 'eleganz', 0), offer('other-shop', 'arkaneum')] };
  const response = { characters: [{ id: 'gawain', inventory: { revision: 2 } }], groups: [{ id: 'companions', revision: 3 }], receipt: { id: 'receipt' } };
  const trade = { async load(input) { calls.push(['load', input]); return source; },
    async availability(id) { calls.push(['availability', id]); return [{ productId: 'here', sourceRefs: source.offers[0].sourceRefs }]; },
    async ensureAccountsVersions(records) { calls.push(['versions', records]); },
    async checkout(input) { calls.push(['checkout', input]); return response; }, ...overrides };
  const service = createCatalogPurchaseService({ createTradeService: () => trade, publish: records => published.push(...records) });
  return { service, source, response, calls, published };
}

test('availability decorates goods cards without loading characters, groups or historical item definitions', async () => {
  const { service, calls } = setup();
  const products = await service.availability({ moduleId: 'eleganz' });
  assert.deepEqual(calls, [['availability', 'module:eleganz']]);
  assert.equal(products[0].sourceRefs[0].itemId, 'here');
});

test('load reuses the light scene repository but returns only the authoritative exact-page module offers', async () => {
  const { service, source, calls } = setup(), data = await service.load({ moduleId: 'eleganz', pageIndex: 1 });
  assert.deepEqual(calls, [['load', { moduleId: 'eleganz' }]]);
  assert.deepEqual(data.offers.map(product => product.id), ['here']);
  assert.equal(data.characters, source.characters); assert.equal(data.groups, source.groups);
  assert.equal(data.moduleId, 'eleganz'); assert.equal(data.merchantId, 'module:eleganz'); assert.equal(data.pageIndex, 1);
  await service.ensureAccountsVersions([data.characters[0]]);
  assert.deepEqual(calls[1], ['versions', [source.characters[0]]]);
});

test('checkout is module-bound and patches committed wallet records while retaining group roster context', async () => {
  const { service, source, response, calls, published } = setup();
  await assert.rejects(service.checkout({ action: 'catalog-checkout' }), /vor dem Kauf laden/);
  const data = await service.load({ moduleId: 'eleganz', pageIndex: 1 });
  for (const request of [{ action: 'checkout', entryId: 'eleganz', merchantId: 'module:eleganz' },
    { action: 'catalog-checkout', entryId: 'arkaneum', merchantId: 'module:arkaneum' }]) await assert.rejects(service.checkout(request), /geöffneten Warenregister/);
  const request = { action: 'catalog-checkout', entryId: 'eleganz', merchantId: 'module:eleganz', operationId: 'captured-op' };
  const checkout = service.checkout, result = await checkout(request);
  assert.equal(result, response); assert.equal(calls.filter(call => call[0] === 'checkout').length, 1);
  assert.equal(calls.at(-1)[1], request); assert.equal(data.characters[0].inventory.revision, 2); assert.equal(data.groups[0].revision, 3);
  assert.deepEqual(data.groups[0].tradeContext, { memberCharacterIds: ['gawain'] });
  assert.equal(source.characters[0].inventory.revision, 1, 'Repository snapshots remain immutable.');
  assert.deepEqual(published, response.characters);
});

test('failed checkout leaves balances and remembered source data untouched for captured-request retry', async () => {
  const { service, calls, published } = setup({ async checkout(input) { calls.push(['checkout', input]); throw Error('Response lost'); } });
  const data = await service.load({ moduleId: 'eleganz', pageIndex: 1 }), before = JSON.stringify(data);
  const request = { action: 'catalog-checkout', entryId: 'eleganz', merchantId: 'module:eleganz', operationId: 'same-op' };
  await assert.rejects(service.checkout(request), /Response lost/); await assert.rejects(service.checkout(request), /Response lost/);
  assert.equal(JSON.stringify(data), before); assert.deepEqual(published, []);
  assert.equal(calls[1][1], calls[2][1]);
});

test('out-of-order loads cannot overwrite the active module binding; in-flight commits patch their captured data', async () => {
  const pending = new Map();
  let finishCheckout;
  const { service, response } = setup({ load: ({ moduleId }) => new Promise(resolve => pending.set(moduleId, resolve)),
    checkout: () => new Promise(resolve => { finishCheckout = resolve; }) });
  const source = { characters: [{ id: 'gawain', inventory: { revision: 1 } }], groups: [], offers: [], access: { uid: 'u1' } };
  const first = service.load({ moduleId: 'old', pageIndex: 0 }), second = service.load({ moduleId: 'current', pageIndex: 0 });
  pending.get('current')(source); const current = await second;
  pending.get('old')(source); await first;
  await assert.rejects(service.checkout({ action: 'catalog-checkout', entryId: 'old', merchantId: 'module:old' }), /geöffneten Warenregister/);
  const commit = service.checkout({ action: 'catalog-checkout', entryId: 'current', merchantId: 'module:current' });
  const third = service.load({ moduleId: 'later', pageIndex: 0 }); pending.get('later')(source); const later = await third;
  finishCheckout(response); await commit;
  assert.equal(current.characters[0].inventory.revision, 2); assert.equal(later.characters[0].inventory.revision, 1);
});

test('invalid source contexts are rejected before any repository call', async () => {
  const { service, calls } = setup();
  for (const moduleId of ['', ' ', 'eleganz::scene', ' eleganz']) await assert.rejects(service.load({ moduleId, pageIndex: 1 }));
  for (const pageIndex of ['', ' ', false, null, -1, 1.5]) await assert.rejects(service.load({ moduleId: 'eleganz', pageIndex }));
  assert.deepEqual(calls, []);
});

test('overlapping authentication loads keep the latest snapshot and its exact client UID together', async () => {
  const pending = [], clients = [];
  let currentUid = 'first-user';
  const createTradeService = () => {
    let loadedUid;
    const client = {
      load: () => new Promise(resolve => pending.push(uid => { loadedUid = uid; resolve({ access: { uid }, offers: [], characters: [], groups: [] }); })),
      checkout: async input => { assert.equal(loadedUid, currentUid, 'Checkout must retain the UID that owns this snapshot.'); return { uid: loadedUid, input }; }
    };
    clients.push(client); return client;
  };
  const service = createCatalogPurchaseService({ createTradeService, publish: () => {} });
  const first = service.load({ moduleId: 'eleganz', pageIndex: 0 });
  const latest = service.load({ moduleId: 'eleganz', pageIndex: 0 });
  currentUid = 'latest-user'; pending[1](currentUid); await latest;
  pending[0]('first-user'); await first;
  const result = await service.checkout({ action: 'catalog-checkout', entryId: 'eleganz', merchantId: 'module:eleganz' });
  assert.equal(result.uid, 'latest-user'); assert.equal(clients.length, 3, 'One data-free utility client and one isolated client per load.');
});
