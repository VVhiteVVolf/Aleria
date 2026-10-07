import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import { parseModuleStoreRevision, getFirebaseModuleStoreRevision } from '../modules/module-store/module-store-revision.js';

const publishedAt = '2026-10-05T08:43:26.202Z';
const publishedRevision = Date.parse(publishedAt);
const clone = value => JSON.parse(JSON.stringify(value));

test('ISO releases and epoch revisions have the same ordering', () => {
  for (const value of [publishedAt, publishedRevision, String(publishedRevision), { toMillis: () => publishedRevision }]) {
    assert.equal(parseModuleStoreRevision(value), publishedRevision);
    assert.ok(parseModuleStoreRevision(value) > 1791163186471);
  }
  for (const value of [null, undefined, '', 'broken', '2026-10-05', -1, Infinity, {}, true]) {
    assert.equal(parseModuleStoreRevision(value), 0);
  }
});

test('missing client revisions fall back to the stored server timestamp', () => {
  assert.equal(getFirebaseModuleStoreRevision({
    moduleStoreManifest: { updatedAtClient: 'broken' },
    moduleStoreUpdatedAt: { toMillis: () => publishedRevision }
  }), publishedRevision);
  assert.equal(getFirebaseModuleStoreRevision({ moduleStoreUpdatedAtClient: publishedAt }), publishedRevision);
  assert.equal(getFirebaseModuleStoreRevision(), 0);
});

function syncContext() {
  const storage = new Map();
  const saved = [];
  const context = vm.createContext({
    console, CustomEvent, TextEncoder, setTimeout, clearTimeout,
    MODULE_STORE_SCHEMA_VERSION: 1,
    MODULE_STORE_KEY: 'module-store', MODULE_STORE_SYNC_META_KEY: 'sync-meta',
    FIREBASE_READY_TIMEOUT_MS: 100,
    _fbReady: true, _moduleStoreRemoteSyncStarted: false, _moduleStoreRemoteUnsubscribe: null,
    _moduleStoreSyncConflict: null,
    _inlineModuleEdit: { active: false },
    document: { getElementById: () => null },
    localStorage: { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value) },
    cleanCustomSection: clone, cleanModuleSectionMove: clone, sanitizeModuleEntry: clone, deepClone: clone,
    dispatchEvent() {}, invalidateArchiveSearchCache() {}, updateFirebaseSyncStatus() {},
    renderAll() {}, showAppStatus() {}, showAppStatusHtml() {},
    showFriendlyAppError(error) { throw error; }, escapeHtml: value => value,
    parseModuleStoreRevision, getFirebaseModuleStoreRevision,
    db: {}, MODULE_STORE_SPLIT_FORMAT: 'split-v1', MODULE_STORE_ENTRY_COLLECTION: 'module_store_entries',
    collection: (_db, path) => path,
    readFirebaseModuleEntry: data => JSON.parse(data.entryJson),
    _fb: { saveModuleStore: async payload => saved.push(clone(payload)), subscribeModuleStore: () => () => {} }
  });
  context.window = context;
  vm.runInContext(readFileSync(new URL('../modules/module-store/module-store-sync.js', import.meta.url), 'utf8'), context);
  const firebase = readFileSync(new URL('../firebase.js', import.meta.url), 'utf8');
  vm.runInContext(firebase.slice(firebase.indexOf('    async function loadSplitModuleStore('), firebase.indexOf('    async function saveSplitModuleStore(')), context);
  return { context, saved };
}

function store(revision, name) {
  return { updatedAtClient: revision, customSections: [{ key: 'Haus Arth', tab: 'Gruppen',
    entries: [{ id: 'rhydians-schiffsmannschaft', title: name }] }] };
}

test('the actual split loader keeps an ISO release newer than the eight-person cache', async () => {
  const { context, saved } = syncContext();
  const local = store(1791163186471, '8 Namen');
  context.writeLocalModuleStorePayload(local);
  context.writeModuleStoreSyncMeta(local);
  context.getDocs = async () => ({ docs: [{ data: () => ({ entryId: 'rhydians-schiffsmannschaft',
    entryJson: JSON.stringify({ id: 'rhydians-schiffsmannschaft', title: '28 Namen mit Bildern' }) }) }] });
  const remote = await context.loadSplitModuleStore({ moduleStoreManifest: {
    format: 'split-v1', updatedAtClient: publishedAt,
    customSections: [{ key: 'Haus Arth', tab: 'Gruppen', entryIds: ['rhydians-schiffsmannschaft'] }]
  } });
  assert.equal(remote.updatedAtClient, publishedRevision);
  context._fb.loadModuleStore = async () => remote;
  await context.setupModuleStoreRemoteSync();
  assert.equal(context.readLocalModuleStorePayload().customSections[0].entries[0].title, '28 Namen mit Bildern');
  assert.equal(saved.length, 0);
});

for (const remoteRevision of [0, 100]) {
  test(`an unchanged cache cannot overwrite online content with revision ${remoteRevision}`, async () => {
    const { context, saved } = syncContext();
    const local = store(200, 'Alter Cache');
    context.writeLocalModuleStorePayload(local);
    context.writeModuleStoreSyncMeta(local);
    context._fb.loadModuleStore = async () => store(remoteRevision, 'Online-Inhalt');
    await context.setupModuleStoreRemoteSync();
    assert.equal(context.readLocalModuleStorePayload().customSections[0].entries[0].title, 'Online-Inhalt');
    assert.equal(saved.length, 0);
  });
}

test('unsynced user edits still raise a conflict and stay in local storage', async () => {
  const { context, saved } = syncContext();
  context.writeModuleStoreSyncMeta(store(100, 'Synchronisierter Stand'));
  context.writeLocalModuleStorePayload(store(200, 'Eigene Bearbeitung'));
  context._fb.loadModuleStore = async () => store(300, 'Neue Veröffentlichung');
  await context.setupModuleStoreRemoteSync();
  assert.equal(context.readLocalModuleStorePayload().customSections[0].entries[0].title, 'Eigene Bearbeitung');
  assert.ok(context._moduleStoreSyncConflict);
  assert.equal(saved.length, 0);
});

test('a first local module can still be saved when the online store is empty', async () => {
  const { context, saved } = syncContext();
  context.writeLocalModuleStorePayload(store(200, 'Erstes Modul'));
  context._fb.loadModuleStore = async () => null;
  await context.setupModuleStoreRemoteSync();
  assert.equal(saved.length, 1);
  assert.equal(saved[0].customSections[0].entries[0].title, 'Erstes Modul');
});

test('Windreiter layout repair does not turn an unchanged cache into an unsynced edit', async () => {
  const { context, saved } = syncContext();
  context.normalizeModuleTreeState = payload => ({ nodes: payload.moduleSectionNodes || [], assignments: payload.moduleNodeAssignments || {} });
  vm.runInContext(readFileSync(new URL('../modules/windreiter/windreiter-section-migration.js', import.meta.url), 'utf8'), context);
  const payload = { updatedAtClient: 200, moduleSectionNodes: [
    { id: 'root:soldner', parentId: '', tab: 'Söldner', title: 'Söldner' },
    { id: 'node:soldner:windreiter', parentId: 'root:soldner', tab: 'Söldner', title: 'Windreiter' }
  ], moduleNodeAssignments: { windreiter: 'node:soldner:windreiter' } };
  context.writeLocalModuleStorePayload(payload);
  context.writeModuleStoreSyncMeta(payload);
  context._fb.loadModuleStore = async () => payload;
  await context.setupModuleStoreRemoteSync();
  assert.equal(context._moduleNodeAssignments.windreiter, 'node:soldner:die-windreiter');
  assert.equal(context.isLocalModuleStoreSynced(context.readLocalModuleStorePayload()), true);
  assert.equal(context._moduleStoreSyncConflict, null);
  assert.equal(saved.length, 0, 'Rendering a repaired layout must not republish the store');
});
