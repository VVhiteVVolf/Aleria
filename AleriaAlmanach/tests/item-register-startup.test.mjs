import assert from 'node:assert/strict';
import test from 'node:test';
import { createItemRegisterActivation } from '../modules/item-register/item-register-activation.js';
import { watchItemRegisterRoute } from '../modules/item-register/item-register-route-entry.js';

const tick = () => new Promise(resolve => setImmediate(resolve));
function host(hash = '') {
  const listeners = new Map();
  return { location: { hash }, addEventListener(type, listener) { if (!listeners.has(type)) listeners.set(type, new Set()); listeners.get(type).add(listener); },
    removeEventListener(type, listener) { listeners.get(type)?.delete(listener); },
    emit(type) { for (const listener of listeners.get(type) || []) listener(); } };
}

test('Firebase readiness and reconnects do not start register reads before open or picker activation', () => {
  const events = host(); let reads = 0, stops = 0;
  const activation = createItemRegisterActivation({ events, activate: () => { reads++; }, stop: () => { stops++; } });
  events.emit('fb-ready'); events.emit('fb-load-error'); events.emit('online');
  assert.equal(reads, 0); assert.equal(stops, 0);
  activation.ensure(); assert.equal(reads, 1);
  events.emit('fb-ready'); assert.equal(reads, 2);
  events.emit('online'); assert.equal(reads, 3); assert.equal(stops, 1);
  activation.destroy(); events.emit('fb-ready'); activation.ensure();
  assert.equal(reads, 3); assert.equal(stops, 2);
});

test('normal homepage navigation keeps the catalogue unloaded while a regional deep link activates it', async () => {
  const events = host(); let loads = 0;
  const stop = watchItemRegisterRoute({ host: events, load: async () => { loads++; } });
  await tick(); assert.equal(loads, 0);
  events.location.hash = '#other'; events.emit('hashchange'); await tick(); assert.equal(loads, 0);
  events.location.hash = '#laender-ruestungen-waffen'; events.emit('hashchange'); await tick(); assert.equal(loads, 1);
  stop(); events.emit('hashchange'); await tick(); assert.equal(loads, 1);
});

test('an initial register deep link single-flights activation and can retry a failed feature load', async () => {
  const events = host('#laender-ruestungen-waffen'), errors = []; let loads = 0, reject;
  const stop = watchItemRegisterRoute({ host: events, load: () => { loads++; return loads === 1 ? new Promise((_resolve, fail) => { reject = fail; }) : Promise.resolve(); }, onError: error => errors.push(error.message) });
  await tick(); events.emit('hashchange'); events.emit('hashchange'); assert.equal(loads, 1);
  reject(Error('offline')); await tick(); assert.deepEqual(errors, ['offline']);
  events.emit('hashchange'); await tick(); assert.equal(loads, 2); stop();
});

test('a stopped route entry ignores a pending feature error', async () => {
  const events = host('#laender-ruestungen-waffen'), errors = []; let reject;
  const stop = watchItemRegisterRoute({ host: events, load: () => new Promise((_resolve, fail) => { reject = fail; }), onError: error => errors.push(error) });
  await tick(); stop(); reject(Error('late failure')); await tick(); assert.deepEqual(errors, []);
});

test('route cancellation before the queued activation does not load the catalogue', async () => {
  const events = host('#laender-ruestungen-waffen'); let loads = 0;
  const stop = watchItemRegisterRoute({ host: events, load: async () => { loads++; } });
  stop(); await tick(); assert.equal(loads, 0);
});
