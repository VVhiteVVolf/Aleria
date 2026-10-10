import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const source = readFileSync(new URL('../firebase.js', import.meta.url), 'utf8');
function repositoryMethod(name, nextName, overrides = {}) {
  const start = source.indexOf(`      async ${name}(`);
  const end = source.indexOf(`      ${nextName}`, start);
  const context = vm.createContext({
    console: { error() {} }, db: {}, doc: (_db, ...parts) => parts.join('/'),
    requireFirebaseUser: async () => ({ uid: 'player' }),
    notifyAppStatus() {}, getFirebaseErrorMessage: (_error, fallback) => fallback,
    MODULE_STORE_COLLECTION: 'char_tabs', MODULE_STORE_DOC: 'config',
    ...overrides
  });
  return vm.runInContext(`({${source.slice(start, end)}})`, context)[name];
}

test('character-tab writes preserve module settings and replace maps including deletions', async () => {
  const document = { moduleStoreManifest: { format: 'split-v1', entryOverrideIds: ['kept'] },
    moduleStoreUpdatedAtClient: 100, map: { removed: 'Old' }, tabs: ['Alle', 'Old'] };
  const save = repositoryMethod('saveCharTabs', 'async setCommentAdminCode(', {
    setDoc: async (ref, payload, options) => {
      assert.equal(ref, 'char_tabs/config');
      assert.deepEqual(Array.from(options.mergeFields).sort(), ['hiddenBuiltins', 'map', 'subtabMap', 'subtabs', 'tabs']);
      for (const key of options.mergeFields) document[key] = payload[key];
    }
  });
  await save({ tabs: ['Alle'], map: {}, subtabs: {}, subtabMap: {}, hiddenBuiltins: [] });
  assert.deepEqual(document.moduleStoreManifest, { format: 'split-v1', entryOverrideIds: ['kept'] });
  assert.equal(document.moduleStoreUpdatedAtClient, 100);
  assert.equal(Object.hasOwn(document.map, 'removed'), false);
});

test('failed character-tab writes reject instead of reporting success', async () => {
  const save = repositoryMethod('saveCharTabs', 'async setCommentAdminCode(', {
    setDoc: async () => { throw new Error('permission-denied'); }
  });
  await assert.rejects(save({}), /permission-denied/);
});

test('failed split reads cannot be mistaken for an empty or legacy module store', async () => {
  const load = repositoryMethod('loadModuleStore', 'async saveModuleStore(', {
    getDoc: async () => ({ exists: () => true, data: () => ({ moduleStoreManifest: { format: 'split-v1' } }) }),
    loadSplitModuleStore: async () => { throw new Error('unavailable'); }
  });
  await assert.rejects(load(), /unavailable/);
});

test('a genuinely missing online module store still returns null', async () => {
  const load = repositoryMethod('loadModuleStore', 'async saveModuleStore(', {
    getDoc: async () => ({ exists: () => false })
  });
  assert.equal(await load(), null);
});
