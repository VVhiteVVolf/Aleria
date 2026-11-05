import test from 'node:test';
import assert from 'node:assert/strict';
import { readSceneTradeAvailabilityResponse, reconcileSceneTradeAvailability } from '../modules/scene-trade/scene-trade-availability.js';
import { availableTradeProduct } from '../modules/scene-trade/scene-trade-state.js';

test('availability responses require an explicit, consistent and unambiguous product list', () => {
  const product = { productId: 'soup', available: true, status: 'available', unique: false };
  assert.deepEqual(readSceneTradeAvailabilityResponse({ products: [product] }), [product]);
  assert.deepEqual(readSceneTradeAvailabilityResponse({ products: [] }), []);
  for (const response of [undefined, null, {}, { products: {} }, { products: [null] },
    { products: [{ ...product, productId: '' }] }, { products: [{ ...product, available: 'true' }] },
    { products: [{ ...product, status: 'owned' }] }, { products: [{ ...product, status: undefined }] },
    { products: [{ ...product, unique: 'false' }] }, { products: [product, product] }]) {
    assert.throws(() => readSceneTradeAvailabilityResponse(response), /gültige Verfügbarkeitsbestätigung/);
  }
});

test('a catalog mismatch remains unconfirmed while confirmed ordinary wares and unique claims keep their status', () => {
  const otherMerchant = { id: 'elsewhere', listId: 'other', available: true };
  const offers = ['soup', 'stale', 'unique', 'sold', 'unavailable'].map(id => ({ id, listId: 'inn', available: false, availabilityStatus: 'checking' }));
  offers.push(otherMerchant);
  const original = structuredClone(offers);
  const result = reconcileSceneTradeAvailability(offers, 'inn', [
    { productId: 'soup', available: true, status: 'available' },
    { productId: 'unique', available: false, status: 'owned', unique: true },
    { productId: 'sold', available: false, status: 'sold', unique: true },
    { productId: 'unavailable', available: false, status: 'unavailable' }
  ]);
  assert.equal(result.unconfirmedCount, 1);
  assert.equal(result.offers[0].availabilityStatus, 'available');
  assert.equal(availableTradeProduct(result.offers[0]), true);
  assert.equal(result.offers[1].availabilityStatus, 'unknown');
  assert.equal(availableTradeProduct(result.offers[1]), false);
  assert.deepEqual(result.offers.slice(2, 5).map(product => product.availabilityStatus), ['owned', 'sold', 'unavailable']);
  assert.equal(result.offers[2].definitionKind, 'unique');
  assert.equal(result.offers[3].definitionKind, 'unique');
  assert.equal(result.offers.at(-1), otherMerchant);
  assert.deepEqual(offers, original);
});

test('an empty confirmed catalog never unlocks unmatched local wares', () => {
  const result = reconcileSceneTradeAvailability([{ id: 'local-draft', listId: 'inn' }], 'inn', []);
  assert.equal(result.unconfirmedCount, 1);
  assert.equal(result.offers[0].availabilityStatus, 'unknown');
  assert.equal(availableTradeProduct(result.offers[0]), false);
});
