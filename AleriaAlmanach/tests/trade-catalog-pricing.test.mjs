import assert from 'node:assert/strict';
import test from 'node:test';
import { buildDrinkPricing } from '../modules/trade-catalog/drink-catalog-model.mjs';
import { buildModuleOffers } from '../modules/item-register/item-register-module-catalog.js';
import { parsePrice } from '../modules/item-register/item-register-money.js';
import { buildBreweryDrinkPricing } from '../modules/brewer-guilds/brewery-prices.mjs';

test('the accepted sizes scale from the serving price, including Pfennige', () => {
  const prices = (kind, base) => buildDrinkPricing(kind, base).priceOptions.map(option => parsePrice(option.price, 'KT').minCopper);
  assert.deepEqual(prices('beer', 5), [5, 10, 500]);
  assert.deepEqual(prices('beer', 0.5), [0.5, 1, 50]);
  assert.deepEqual(prices('whisky', 8), [8, 140, 10000]);
  assert.deepEqual(prices('whisky', 5), [5, 87.5, 6250]);
  assert.throws(() => buildDrinkPricing('beer', 0));
});

test('the requested brewery increase starts from the original serving price once, then scales each size', () => {
  const cases = [
    ['beer', 0.5, [0.6, 1.2, 60]], ['beer', 1, [1.3, 2.6, 130]],
    ['beer', 1.5, [1.95, 3.9, 195]], ['beer', 2.5, [3.25, 6.5, 325]],
    ['beer', 3, [4.5, 9, 450]], ['beer', 5, [8.5, 17, 850]],
    ['whisky', 5, [6.5, 113.75, 8125]], ['whisky', 8, [12, 210, 15000]],
    ['whisky', 16, [27.2, 476, 34000]], ['whisky', 28, [47.6, 833, 59500]]
  ];
  for (const [kind, base, expected] of cases) {
    const build = () => buildBreweryDrinkPricing(kind, base).priceOptions.map(option => parsePrice(option.price, 'KT').minCopper);
    assert.deepEqual(build(), expected);
    assert.deepEqual(build(), expected, 'repeated generation must not compound the increase');
  }
});

test('three sizes remain distinct offers while reserved and malformed options cannot become free goods', () => {
  const entry = { id: 'test-brewery', title: 'Brauhaus', pages: [{ tradeCatalogPage: true, tradeCatalog: {
    categories: [{ id: 'beer', label: 'Bier · Getränke' }], items: [
      { id: 'hell', title: 'Helles', category: 'beer', ...buildDrinkPricing('beer', 2) },
      { id: 'reserve', title: 'Freier Sortimentplatz', status: 'planned', category: 'beer', priceMin: '0' },
      { id: 'special', title: 'Sonderabfüllung', category: 'beer', priceOptions: [{ label: 'Fass', unit: '50 l', price: 'auf Anfrage' }] }
    ]
  } }] };
  const offers = buildModuleOffers([entry]);
  assert.equal(offers.length, 4);
  const regular = offers.filter(offer => offer.title === 'Helles');
  assert.equal(new Set(regular.map(offer => offer.id)).size, 3);
  assert.deepEqual(regular.map(offer => offer.hiddenMeta.unit), ['Krug · 0,5 l', 'Flasche · 1 l', 'Fass · 50 l']);
  assert.deepEqual(regular.map(offer => offer.priceRange.minCopper), [2, 4, 200]);
  assert.equal(offers.find(offer => offer.title === 'Sonderabfüllung').priceRange, null);
});
