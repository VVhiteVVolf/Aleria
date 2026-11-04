import test from 'node:test';
import assert from 'node:assert/strict';
import { createRegisterStore } from '../modules/item-register/item-register-store.js';

function repository() {
  const calls = [], callbacks = new Map(), stops = [];
  return { calls, callbacks, stops,
    subscribe(kind, next, error) { calls.push(kind); callbacks.set(kind, { next, error }); return () => stops.push(kind); },
    commit: async () => ({}) };
}
test('trade demand subscribes only offers and characters and never projects owned instances', () => {
  let reads = 0;
  const character = { id: 'hero', inventory: { get items() { reads++; return []; } } };
  const store = createRegisterStore({ standards: [], notifyProjection: 'records' }), api = repository();
  store.connect(api, null, { kinds: ['offers', 'characters'], hydrateInventoryDefinitions: false });
  const seen = []; const stop = store.subscribe(value => seen.push(value), { projection: 'trade' });
  api.callbacks.get('offers').next([{ id: 'offer', listId: 'shop' }]);
  api.callbacks.get('characters').next([character]);
  assert.deepEqual(api.calls, ['offers', 'characters']); assert.equal(store.tradeSnapshot().status, 'live');
  assert.equal(store.tradeSnapshot().characters[0], character); assert.equal(reads, 0);
  assert.equal('owned' in store.tradeSnapshot(), false); assert.equal('items' in store.tradeSnapshot(), false);
  assert.equal(store.tradeSnapshot(), store.tradeSnapshot()); assert.equal(seen.at(-1).status, 'live');
  stop(); store.stop();
});
test('later full-register demand upgrades the same connection without restarting existing streams', () => {
  const store = createRegisterStore({ standards: [], notifyProjection: 'records' }), api = repository();
  store.connect(api, null, { kinds: ['offers', 'characters'], hydrateInventoryDefinitions: false });
  api.callbacks.get('offers').next([]); api.callbacks.get('characters').next([]);
  store.connect(api);
  assert.deepEqual(api.calls, ['offers', 'characters', 'creatures']); assert.deepEqual(api.stops, []);
  api.callbacks.get('creatures').next([]);
  assert.equal(store.snapshot().status, 'live');
  store.connect(api); assert.equal(store.snapshot().status, 'live');
  assert.deepEqual(api.calls, ['offers', 'characters', 'creatures']); store.stop();
});
test('default snapshots still include owned items and cache only until a real repository change', () => {
  let reads = 0;
  const character = { id: 'hero', name: 'Hero', inventory: { get items() { reads++; return [{ id: 'note', name: 'Notiz', quantity: '1' }]; } } };
  const store = createRegisterStore({ standards: [], notifyProjection: 'records' }), api = repository();
  store.connect(api, null, { kinds: ['offers', 'characters'], hydrateInventoryDefinitions: false });
  api.callbacks.get('offers').next([]); api.callbacks.get('characters').next([character]);
  assert.equal(reads, 0); const first = store.snapshot();
  assert.equal(first.owned.length, 1); const after = reads;
  assert.equal(store.snapshot(), first); assert.equal(reads, after);
  api.callbacks.get('offers').next([{ id: 'new' }]);
  assert.notEqual(store.snapshot(), first); assert.ok(reads > after); store.stop();
});
test('cached or failed required streams stay visibly unavailable while an unrelated creature error cannot block trade', () => {
  const store = createRegisterStore({ standards: [], notifyProjection: 'records' }), api = repository();
  store.connect(api); api.callbacks.get('offers').next([], { fromCache: true }); api.callbacks.get('characters').next([]);
  assert.equal(store.tradeSnapshot().status, 'offline');
  api.callbacks.get('offers').next([]); api.callbacks.get('creatures').error(Error('Creature service unavailable'));
  assert.equal(store.tradeSnapshot().status, 'live');
  api.callbacks.get('characters').error(Error('Characters unavailable'));
  assert.equal(store.tradeSnapshot().status, 'error'); assert.match(store.tradeSnapshot().error, /Characters/); store.stop();
});
test('refresh retries only a terminated required stream on the shared connection', () => {
  const store = createRegisterStore({ standards: [], notifyProjection: 'records' }), api = repository();
  const options = { kinds: ['offers', 'characters'], hydrateInventoryDefinitions: false };
  store.connect(api, null, options); api.callbacks.get('offers').next([]); api.callbacks.get('characters').next([]);
  api.callbacks.get('offers').error(Error('Permission changed'));
  assert.equal(store.tradeSnapshot().status, 'error');
  store.connect(api, null, options);
  assert.deepEqual(api.calls, ['offers', 'characters', 'offers']);
  api.callbacks.get('offers').next([]);
  assert.equal(store.tradeSnapshot().status, 'live'); store.stop();
});
