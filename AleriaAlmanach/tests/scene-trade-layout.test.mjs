import test from 'node:test';
import assert from 'node:assert/strict';
import { renderSceneTradeDialog, renderSceneTradeCatalogResults } from '../modules/scene-trade/scene-trade-view.js';
import { createSceneTradeLayoutFixture } from './fixtures/scene-trade-layout-fixture.mjs';

test('wide trade view separates bounded goods results from stable search, people scope and cart', () => {
  const fixture = createSceneTradeLayoutFixture(), markup = renderSceneTradeDialog(fixture);
  assert.equal((markup.match(/class="scene-trade-line"/g) || []).length, 20);
  assert.equal((markup.match(/class="scene-trade-product/g) || []).length > 0, true);
  assert.match(markup, /data-trade-participant-manager/);
  assert.match(markup, /data-trade-catalog-results/);
  assert.match(markup, /data-trade-cart-scroll/);
  assert.match(markup, /data-trade-field="search"/);
  assert.match(markup, /data-trade-actor-picker/);
  assert.doesNotMatch(markup, /<select[^>]+(?:payerKey|recipientKey|actorCharacterId|sellerKey)/);
  assert.equal((markup.match(/data-trade-picker-value=/g) || []).length, 0, 'Closed actor pickers render no thousand-record option lists');
  assert(!markup.includes('Weitere Person 999'));
});

test('partial goods rendering never touches character records or creates cart/picker/search markup', () => {
  const fixture = createSceneTradeLayoutFixture();
  Object.defineProperty(fixture.data, 'characters', { get() { throw Error('Goods search must not scan the character archive'); } });
  const markup = renderSceneTradeCatalogResults({ state: fixture.state, data: fixture.data });
  assert.equal((markup.match(/<article class="scene-trade-product/g) || []).length, 24);
  assert.match(markup, /1–24 von 72/);
  assert.match(markup, /data-trade-action="more"/);
  assert.doesNotMatch(markup, /scene-trade-cart|data-trade-field="search"|data-trade-actor-picker/);
  fixture.state.offset = 24;
  const next = renderSceneTradeCatalogResults({ state: fixture.state, data: fixture.data });
  assert.match(next, /25–48 von 72/);
  assert.match(next, /data-trade-action="catalog-back"/);
  assert.equal((next.match(/<article class="scene-trade-product/g) || []).length, 24);
});

test('sell pages are bounded and use the same previous/next navigation', () => {
  const fixture = createSceneTradeLayoutFixture();
  fixture.state.mode = 'sell'; fixture.state.offset = 24;
  fixture.accounts[0].record.inventory.items = Array.from({ length: 60 }, (_, index) => ({ id: `old-${index}`, name: `Alter Gegenstand ${index}`, quantity: 1 }));
  const markup = renderSceneTradeCatalogResults(fixture);
  assert.equal((markup.match(/<article class="scene-trade-product/g) || []).length, 24);
  assert.match(markup, /25–48 von 60/);
  assert.match(markup, /data-trade-action="catalog-back"/);
  assert.match(markup, /Weitere Gegenstände/);
});

test('review and unresolved request keep their original protections in the new layout', () => {
  const fixture = createSceneTradeLayoutFixture(); fixture.state.stage = 'review';
  const review = renderSceneTradeDialog(fixture);
  assert.match(review, /scene-trade-layout is-review/);
  assert.match(review, /data-trade-action="checkout"/);
  assert.doesNotMatch(review, /data-trade-action="remove"|data-trade-action="add-buy"/);
  const pending = renderSceneTradeDialog({ ...fixture, pendingRequest: { merchantId: fixture.state.merchantId,
    lines: [{ direction: 'buy', productId: fixture.data.offers[0].id, quantity: 2, priceMode: 'agreed', agreedTotalMinor: 333 }] } });
  assert.match(pending, /data-trade-action="retry"/);
  assert.doesNotMatch(pending, /data-trade-action="checkout"|data-trade-field="merchantId"/);
});
