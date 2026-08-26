import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

function loadWorldDateStore({ localRecord = null, backend = null } = {}) {
  const storage = new Map();
  if (localRecord) storage.set('aleria.current-world-date.v1', JSON.stringify(localRecord));
  const events = [];
  const context = vm.createContext({
    console,
    Date,
    CustomEvent: class CustomEvent {
      constructor(type, options = {}) { this.type = type; this.detail = options.detail; }
    },
    document: { dispatchEvent(event) { events.push(event); } },
    localStorage: {
      getItem(key) { return storage.has(key) ? storage.get(key) : null; },
      setItem(key, value) { storage.set(key, String(value)); }
    },
    addEventListener() {},
    setTimeout() {},
    clearTimeout() {},
    _fb: backend
  });
  for (const relativePath of [
    '../modules/world-date/world-date-model.js',
    '../modules/world-date/world-date-store.js'
  ]) {
    vm.runInContext(fs.readFileSync(new URL(relativePath, import.meta.url), 'utf8'), context);
  }
  return { context, events, storage };
}

test('ein neues Weltdatum wird ohne Firebase nicht als scheinbar geteiltes Datum übernommen', async () => {
  const { context } = loadWorldDateStore();
  vm.runInContext('AleriaWorldDateStore.initialize()', context);
  const before = vm.runInContext('AleriaWorldDateStore.getState().date', context);

  await assert.rejects(
    vm.runInContext('AleriaWorldDateStore.setDate({ year: 1740, month: 3, day: 12 })', context),
    /noch nicht mit Firebase verbunden/
  );
  const after = vm.runInContext('AleriaWorldDateStore.getState().date', context);
  assert.deepEqual({ ...after }, { ...before });
});

test('das gemeinsame Firebase-Datum gewinnt beim Laden gegen einen älteren lokalen Gerätestand', () => {
  const remote = { year: 1740, month: 3, day: 12, updatedAtClient: 5, updatedBy: 'player-b' };
  const backend = {
    subscribeCurrentAleriaDate(onNext) {
      onNext(remote);
      return () => {};
    },
    async saveCurrentAleriaDate(value) { return value; }
  };
  const { context } = loadWorldDateStore({
    localRecord: { year: 1740, month: 3, day: 20, updatedAtClient: 999, updatedBy: 'player-a' },
    backend
  });

  vm.runInContext('AleriaWorldDateStore.initialize()', context);
  const state = vm.runInContext('AleriaWorldDateStore.getState()', context);
  assert.deepEqual({ ...state.date }, { year: 1740, month: 3, day: 12 });
  assert.equal(state.remoteConnected, true);
  assert.equal(state.syncState, 'online');
});

test('eine Datumsänderung wird zuerst online gespeichert und danach als geteilt angezeigt', async () => {
  const writes = [];
  const backend = {
    subscribeCurrentAleriaDate(onNext) {
      onNext({ year: 1740, month: 3, day: 9, updatedAtClient: 1 });
      return () => {};
    },
    async saveCurrentAleriaDate(value) {
      writes.push({ ...value });
      return { ...value, updatedBy: 'player-a' };
    }
  };
  const { context } = loadWorldDateStore({ backend });
  vm.runInContext('AleriaWorldDateStore.initialize()', context);

  const result = await vm.runInContext('AleriaWorldDateStore.setDate({ year: 1740, month: 3, day: 13 })', context);
  assert.equal(writes.length, 1);
  assert.equal(result.localOnly, false);
  assert.deepEqual({ ...result.record, updatedAtClient: 0 }, {
    year: 1740,
    month: 3,
    day: 13,
    schemaVersion: 1,
    updatedAtClient: 0,
    updatedBy: 'player-a'
  });
  assert.equal(vm.runInContext('AleriaWorldDateStore.getState().syncState', context), 'online');
});
