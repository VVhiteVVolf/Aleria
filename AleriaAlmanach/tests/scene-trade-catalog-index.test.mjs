import test from 'node:test';
import assert from 'node:assert/strict';
import { querySceneTradeCatalog, findSceneTradeProduct, normalizeSceneTradeSearch } from '../modules/scene-trade/scene-trade-catalog.js';

test('search normalizes German text and only returns the selected assortment', () => {
  const data = { offers: [{ id: 'a', listId: 'eleganz', title: 'Göttliche Größe', category: 'kleidung' },
    { id: 'b', listId: 'other', title: 'Göttliche Größe' }] };
  assert.equal(normalizeSceneTradeSearch(' GRÖẞE '), 'grosse');
  assert.deepEqual(querySceneTradeCatalog(data, { merchantId: 'eleganz', search: 'grosse' }).items.map(item => item.id), ['a']);
  assert.equal(findSceneTradeProduct(data, 'a', 'other'), null);
});
test('typing reuses the immutable index without reading unrelated product fields', () => {
  let reads = 0;
  const offers = Array.from({ length: 5000 }, (_, index) => ({ id: String(index), listId: index < 100 ? 'here' : 'elsewhere',
    get title() { reads++; return `Ware ${index}`; } }));
  const data = { offers };
  assert.equal(querySceneTradeCatalog(data, { merchantId: 'here' }).total, 100);
  const initial = reads;
  for (const search of ['w', 'wa', 'ware', 'ware 1']) querySceneTradeCatalog(data, { merchantId: 'here', search });
  assert.equal(reads, initial, 'Search keys must not traverse the register or renormalize products.');
  assert.equal(findSceneTradeProduct(data, '10', 'here').id, '10');
});
test('a new snapshot invalidates cached product availability and search results', () => {
  const old = { id: 'a', listId: 'shop', title: 'Alt', available: true };
  const data = { offers: [old] };
  assert.equal(querySceneTradeCatalog(data, { merchantId: 'shop' }).items[0], old);
  const current = { ...old, title: 'Neu', available: false };
  data.offers = [current];
  assert.equal(querySceneTradeCatalog(data, { merchantId: 'shop', search: 'alt' }).total, 0);
  assert.equal(findSceneTradeProduct(data, 'a'), current);
});
test('heavy assortments return a bounded immutable page with exact totals and offsets', () => {
  const data = { offers: Array.from({ length: 250 }, (_, index) => ({ id: String(index), listId: 'shop', title: 'Ware' })) };
  const first = querySceneTradeCatalog(data, { merchantId: 'shop', limit: 10000 });
  assert.equal(first.items.length, 96); assert.equal(first.total, 250); assert.equal(first.hasMore, true);
  const last = querySceneTradeCatalog(data, { merchantId: 'shop', offset: 240, limit: 24 });
  assert.equal(last.items.length, 10); assert.equal(last.hasMore, false); assert.equal(last.items[0].id, '240');
  assert.throws(() => first.items.push({}));
});
