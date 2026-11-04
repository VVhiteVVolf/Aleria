import assert from 'node:assert/strict';
import test from 'node:test';
import { assertServerModuleStoreSnapshot, subscribeServerModuleStore } from '../modules/module-store/module-store-online-source.js';

const tick = () => new Promise(resolve => setImmediate(resolve));

test('only acknowledged server metadata qualifies as the online module source', () => {
  for (const metadata of [{ fromCache: true }, { hasPendingWrites: true }, { fromCache: true, hasPendingWrites: true }]) {
    assert.throws(() => assertServerModuleStoreSnapshot({ metadata }), { code: 'module-store-awaiting-server' });
  }
  const server = { metadata: { fromCache: false, hasPendingWrites: false } };
  assert.equal(assertServerModuleStoreSnapshot(server), server);
});

test('cached and pending snapshots stay silent until the metadata-only server acknowledgment', async () => {
  let emit, stopped = false;
  const delivered = [], decoded = [];
  const stop = subscribeServerModuleStore({ reference: 'module-config',
    onSnapshot(ref, options, next) {
      assert.equal(ref, 'module-config');
      assert.deepEqual(options, { includeMetadataChanges: true });
      emit = next;
      return () => { stopped = true; };
    },
    decode: async snap => { decoded.push(snap.value); return snap.value; },
    onNext: value => delivered.push(value), onError: error => { throw error; }
  });
  emit({ value: 'cache', metadata: { fromCache: true } });
  emit({ value: 'pending', metadata: { hasPendingWrites: true } });
  await tick();
  assert.deepEqual(delivered, []);
  assert.deepEqual(decoded, []);
  emit({ value: 'confirmed', metadata: { fromCache: false, hasPendingWrites: false } });
  await tick();
  assert.deepEqual(delivered, ['confirmed']);
  stop();
  assert.equal(stopped, true);
});

test('a slow old split read cannot replace a newer acknowledged module revision', async () => {
  let emit;
  const pending = new Map(), delivered = [];
  subscribeServerModuleStore({ reference: 'module-config',
    onSnapshot(_ref, _options, next) { emit = next; return () => {}; },
    decode: snap => new Promise(resolve => pending.set(snap.revision, resolve)),
    onNext: value => delivered.push(value)
  });
  emit({ revision: 1 }); await tick();
  emit({ revision: 2 }); await tick();
  pending.get(2)('newer'); await tick();
  pending.get(1)('older'); await tick();
  assert.deepEqual(delivered, ['newer']);
});

test('unsubscribe invalidates an in-progress server load and its errors', async () => {
  let emit, complete;
  const delivered = [], errors = [];
  const stop = subscribeServerModuleStore({ reference: 'module-config',
    onSnapshot(_ref, _options, next) { emit = next; return () => {}; },
    decode: () => new Promise(resolve => { complete = resolve; }),
    onNext: value => delivered.push(value), onError: error => errors.push(error)
  });
  emit({ revision: 1 }); await tick();
  stop(); complete('ignored'); await tick();
  assert.deepEqual(delivered, []);
  assert.deepEqual(errors, []);
});
