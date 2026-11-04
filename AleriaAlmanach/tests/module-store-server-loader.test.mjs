import assert from 'node:assert/strict';
import test from 'node:test';
import { createServerModuleStoreLoader } from '../modules/module-store/module-store-server-loader.js';
import { subscribeServerModuleStore } from '../modules/module-store/module-store-online-source.js';

const tick = () => new Promise(resolve => setImmediate(resolve));
const config = (revision = 100, manifest = {}) => ({ moduleStoreManifest: { format: 'split-v1', updatedAtClient: revision, customSections: [], ...manifest } });
const snapshot = (data, metadata = {}) => ({ exists: () => data != null, data: () => data, metadata });

test('initial server load and the acknowledged subscription share one split collection read', async () => {
  let reads = 0, emit;
  const delivered = [], load = createServerModuleStoreLoader({ loadSplit: async (data, options) => { reads++; assert.deepEqual(options, { serverOnly: true }); return { revision: data.moduleStoreManifest.updatedAtClient }; } });
  assert.deepEqual(await load(snapshot(config())), { revision: 100 });
  const stop = subscribeServerModuleStore({ reference: 'config', onSnapshot(_ref, _options, next) { emit = next; return () => {}; }, decode: load, onNext: value => delivered.push(value) });
  emit(snapshot(config(), { fromCache: true }));
  emit(snapshot(config(), { hasPendingWrites: true }));
  await tick(); assert.equal(reads, 1); assert.equal(delivered.length, 0);
  emit(snapshot(config(), { fromCache: false, hasPendingWrites: false }));
  await tick(); assert.equal(reads, 1); assert.deepEqual(delivered, [{ revision: 100 }]); stop();
});

test('concurrent server loads share work, but manifest or revision changes fetch fresh entries', async () => {
  let reads = 0;
  const load = createServerModuleStoreLoader({ loadSplit: async () => ({ read: ++reads }) });
  await Promise.all([load(snapshot(config())), load(snapshot(config()))]); assert.equal(reads, 1);
  await load(snapshot(config(101))); assert.equal(reads, 2);
  await load(snapshot(config(101, { hiddenModuleIds: { one: true } }))); assert.equal(reads, 3);
  await load(snapshot({ ...config(101, { hiddenModuleIds: { one: true } }), tabs: ['Other tab'] })); assert.equal(reads, 3);
});

test('map order alone is irrelevant, server timestamps preserve submillisecond changes', async () => {
  let reads = 0;
  const load = createServerModuleStoreLoader({ loadSplit: async () => ({ read: ++reads }) });
  await load(snapshot(config(100, { hiddenModuleIds: { a: true, b: true } })));
  await load(snapshot(config(100, { hiddenModuleIds: { b: true, a: true } }))); assert.equal(reads, 1);
  await load(snapshot({ ...config(), moduleStoreUpdatedAt: { seconds: 20, nanoseconds: 1 } }));
  await load(snapshot({ ...config(), moduleStoreUpdatedAt: { seconds: 20, nanoseconds: 2 } })); assert.equal(reads, 3);
});

test('rejected or unversioned server reads never become a reusable success', async () => {
  let reads = 0;
  const load = createServerModuleStoreLoader({ loadSplit: async () => { if (++reads === 1) throw Error('offline'); return { read: reads }; } });
  await assert.rejects(load(snapshot(config())), /offline/);
  await load(snapshot(config())); assert.equal(reads, 2);
  await load(snapshot(config(0))); await load(snapshot(config(0))); assert.equal(reads, 4);
  await assert.rejects(load(snapshot(config(), { fromCache: true })), { code: 'module-store-awaiting-server' }); assert.equal(reads, 4);
});

test('an older failed read cannot clear the cached newer configuration', async () => {
  const pending = new Map(); let reads = 0;
  const load = createServerModuleStoreLoader({ loadSplit: data => { reads++; return new Promise((resolve, reject) => pending.set(data.moduleStoreManifest.updatedAtClient, { resolve, reject })); } });
  const old = load(snapshot(config(100))); await tick();
  const newer = load(snapshot(config(200))); await tick();
  pending.get(200).resolve('newer'); assert.equal(await newer, 'newer');
  pending.get(100).reject(Error('old failure')); await assert.rejects(old, /old failure/);
  assert.equal(await load(snapshot(config(200))), 'newer'); assert.equal(reads, 2);
});

test('missing or legacy server documents clear split reuse without replacing failures with emptiness', async () => {
  let reads = 0;
  const load = createServerModuleStoreLoader({ loadSplit: async () => ({ read: ++reads }) });
  await load(snapshot(config())); assert.equal(await load(snapshot(null)), null);
  await load(snapshot(config())); assert.equal(reads, 2);
  assert.deepEqual(await load(snapshot({ moduleStoreData: '{"customSections":[]}' })), { data: '{"customSections":[]}' });
  await load(snapshot(config())); assert.equal(reads, 3);
});

test('unsubscribe before a shared read settles cannot deliver its payload', async () => {
  let emit, finish; const delivered = [];
  const load = createServerModuleStoreLoader({ loadSplit: () => new Promise(resolve => { finish = resolve; }) });
  const stop = subscribeServerModuleStore({ reference: 'config', onSnapshot(_ref, _options, next) { emit = next; return () => {}; }, decode: load, onNext: value => delivered.push(value) });
  emit(snapshot(config())); await tick(); stop(); finish('ignored'); await tick(); assert.deepEqual(delivered, []);
});
