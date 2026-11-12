import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import { parseModuleStoreRevision, getFirebaseModuleStoreRevision } from '../modules/module-store/module-store-revision.js';
import { readFirebaseModuleEntry as decodeFirebaseModuleEntry } from '../modules/module-store/module-entry-serialization.js';
import { createServerModuleStoreLoader } from '../modules/module-store/module-store-server-loader.js';

const publishedAt = '2026-10-05T08:43:26.202Z';
const publishedRevision = Date.parse(publishedAt);
const clone = value => JSON.parse(JSON.stringify(value));

test('ISO releases and epoch revisions have the same ordering', async () => {
  for (const value of [publishedAt, publishedRevision, String(publishedRevision), { toMillis: () => publishedRevision }]) {
    assert.equal(parseModuleStoreRevision(value), publishedRevision);
    assert.ok(parseModuleStoreRevision(value) > 1791163186471);
  }
  for (const value of [null, undefined, '', 'broken', '2026-10-05', -1, Infinity, {}, true]) {
    assert.equal(parseModuleStoreRevision(value), 0);
  }
});

test('missing client revisions fall back to the stored server timestamp', async () => {
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
  const listeners = new Map();
  const context = vm.createContext({
    console, crypto, CustomEvent, TextEncoder, setTimeout, clearTimeout,
    addEventListener(name, handler) {
      if (!listeners.has(name)) listeners.set(name, []);
      listeners.get(name).push(handler);
    },
    MODULE_STORE_SCHEMA_VERSION: 1,
    MODULE_STORE_KEY: 'module-store', MODULE_STORE_SYNC_META_KEY: 'sync-meta',
    FIREBASE_READY_TIMEOUT_MS: 100,
    _fbReady: true, _moduleStoreRemoteSyncStarted: false, _moduleStoreRemoteUnsubscribe: null,
    _moduleStoreSyncConflict: null,
    _moduleStoreRemoteSaveTimer: null, MODULE_STORE_REMOTE_SAVE_DELAY: 5,
    _inlineModuleEdit: { active: false },
    document: { getElementById: () => null },
    localStorage: { get length() { return storage.size; }, key: index => [...storage.keys()][index] || null, getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) },
    cleanCustomSection: clone, cleanModuleSectionMove: clone, sanitizeModuleEntry: clone, deepClone: clone,
    normalizeModuleTreeState: payload => ({ nodes: payload.moduleSectionNodes || [], assignments: payload.moduleNodeAssignments || {} }),
    dispatchEvent(event) { (listeners.get(event.type) || []).forEach(handler => handler(event)); }, invalidateArchiveSearchCache() {}, updateFirebaseSyncStatus() {},
    renderAll() {}, showAppStatus() {}, showAppStatusHtml() {},
    showFriendlyAppError(error) { throw error; }, escapeHtml: value => value,
    parseModuleStoreRevision, getFirebaseModuleStoreRevision,
    db: {}, MODULE_STORE_SPLIT_FORMAT: 'split-v1', MODULE_STORE_ENTRY_COLLECTION: 'module_store_entries',
    collection: (_db, path) => path,
    decodeFirebaseModuleEntry,
    createServerModuleStoreLoader,
    _fb: { saveModuleStore: async payload => saved.push(clone(payload)), subscribeModuleStore: () => () => {} }
  });
  context.window = context;
  vm.runInContext(readFileSync(new URL('../modules/module-store/module-store-local.js', import.meta.url), 'utf8'), context);
  vm.runInContext('moduleStoreLocalPersistence.ready()', context);
  vm.runInContext(readFileSync(new URL('../modules/module-store/module-store-sync.js', import.meta.url), 'utf8'), context);
  const firebase = readFileSync(new URL('../firebase.js', import.meta.url), 'utf8');
  vm.runInContext(firebase.slice(firebase.indexOf('    function normalizeFirebaseModuleStore('), firebase.indexOf('    async function hashDeleteCode(')), context);
  return { context, saved, storage };
}

function store(revision, name) {
  return { updatedAtClient: revision, customSections: [{ key: 'Haus Arth', tab: 'Gruppen',
    entries: [{ id: 'rhydians-schiffsmannschaft', title: name }] }] };
}

test('the actual split loader keeps an ISO release newer than the eight-person cache', async () => {
  const { context, saved } = syncContext();
  const local = store(1791163186471, '8 Namen');
  context.writeLocalModuleStorePayload(local);
  await context.writeModuleStoreSyncMeta(local);
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

test('Firestore map ordering and old sync receipts do not create conflicts', async () => {
  const { context, saved } = syncContext();
  const local = { ...store(200, 'Identisch'), moduleSectionNodes: [{ id: 'root:gruppen' }],
    moduleNodeAssignments: { z: 'root:gruppen', a: 'root:gruppen' },
    entryOverrides: { z: { title: 'Z', id: 'z' }, a: { title: 'A', id: 'a' } } };
  const remote = { ...clone(local), moduleNodeAssignments: { a: 'root:gruppen', z: 'root:gruppen' },
    entryOverrides: { a: { id: 'a', title: 'A' }, z: { id: 'z', title: 'Z' } } };
  assert.equal(context.getModuleStoreContentSignature(local), context.getModuleStoreContentSignature(remote));
  context.writeLocalModuleStorePayload(local);
  const normalized = context.normalizeModuleStorePayload(local);
  delete normalized.hiddenModuleIds;
  context.localStorage.setItem('sync-meta', JSON.stringify({ signature: JSON.stringify(normalized), syncedAt: 1 }));
  assert.equal(await context.isLocalModuleStoreSynced(remote), true);
  context._fb.loadModuleStore = async () => remote;
  await context.setupModuleStoreRemoteSync();
  assert.equal(context._moduleStoreSyncConflict, null);
  assert.equal(saved.length, 0);
});

test('cross-tab cache comparison ignores sync timing and map order but retains real content and schema changes', () => {
  const { context } = syncContext();
  const compare = (first, second) => context.areModuleStoreLocalRecordsEquivalent('module-store', JSON.stringify(first), JSON.stringify(second));
  const first = { ...store(100, 'Gemeinsamer Stand'), moduleNodeAssignments: { z: 'root', a: 'root' } };
  const second = { ...clone(first), version: 1, updatedAtClient: 200, moduleNodeAssignments: { a: 'root', z: 'root' } };
  assert.equal(compare(first, second), true);
  assert.equal(compare(first, store(200, 'Eigener Entwurf')), false);
  assert.equal(compare(second, { ...second, version: 2 }), false);
  assert.equal(compare({ ...first, version: 2 }, { ...second, version: 2 }), false);
  assert.equal(compare({ ...first, version: '1' }, second), false);
  assert.equal(compare({ ...first, futureMetadata: 'keep' }, { ...second, futureMetadata: 'changed' }), false);
  const extraEntryField = clone(first);
  extraEntryField.customSections[0].entries[0].futureField = 'Unbekannte Bearbeitung erhalten';
  assert.equal(compare(first, extraEntryField), false);
  assert.equal(compare(null, {}), false);
  assert.equal(compare([], {}), false);
  assert.equal(context.areModuleStoreLocalRecordsEquivalent('module-store', 'broken', '{}'), false);
  assert.equal(context.areModuleStoreLocalRecordsEquivalent('unrelated', JSON.stringify(first), JSON.stringify(second)), false);
  const ordered = { ...first, customSections: [{ key: 'Ort', entries: [{ id: 'a' }, { id: 'b' }] }] };
  const reordered = clone(ordered);
  reordered.customSections[0].entries.reverse();
  assert.equal(compare(ordered, reordered), false);
});

test('cross-tab sync receipts match only the same valid acknowledgement regardless of its timestamp', () => {
  const { context } = syncContext();
  const compare = (first, second) => context.areModuleStoreLocalRecordsEquivalent('sync-meta', JSON.stringify(first), JSON.stringify(second));
  const first = { signature: `sha256:${'a'.repeat(64)}`, syncedAt: 10, updatedAtClient: 100 };
  const second = { ...first, syncedAt: 20, updatedAtClient: 200 };
  assert.equal(compare(first, second), true);
  assert.equal(compare(first, { ...second, signature: `sha256:${'b'.repeat(64)}` }), false);
  assert.equal(compare({ syncedAt: 10 }, { syncedAt: 20 }), false);
  for (const signature of ['', 'broken', 'sha256:abc', 'null', '[]', '{"version":2}']) {
    assert.equal(compare({ signature, syncedAt: 10 }, { signature, syncedAt: 20 }), false);
  }
  const legacy = JSON.stringify(store(100, 'Alter bestätigter Stand'));
  assert.equal(compare({ signature: legacy, syncedAt: 10 }, { signature: legacy, syncedAt: 20 }), true);
});

test('hidden modules participate in sync state even without custom modules', async () => {
  const { context } = syncContext();
  const before = {};
  await context.writeModuleStoreSyncMeta(before);
  const hidden = { hiddenModuleIds: { builtin: true } };
  assert.ok(context.hasModuleStoreContent(hidden));
  assert.equal(await context.isLocalModuleStoreSynced(hidden), false);
});

test('an equal live snapshot establishes a missing sync receipt', async () => {
  const { context } = syncContext();
  const payload = store(200, 'Gleich');
  context.writeLocalModuleStorePayload(payload);
  assert.equal(await context.isLocalModuleStoreSynced(payload), false);
  await context.applyRemoteModuleStore(payload);
  assert.equal(await context.isLocalModuleStoreSynced(payload), true);
});

test('online always wins on startup while offline edits remain in the full-backup recovery', async () => {
  const { context, saved } = syncContext();
  const baseline = store(300, 'Basis');
  const local = store(200, 'Offline draft');
  await context.writeModuleStoreSyncMeta(baseline);
  context.writeLocalModuleStorePayload(local);
  context._fb.loadModuleStore = async () => baseline;
  await context.setupModuleStoreRemoteSync();
  assert.equal(saved.length, 0);
  assert.equal(context.readLocalModuleStorePayload().customSections[0].entries[0].title, 'Basis');
  const recoveries = await vm.runInContext('moduleStoreLocalPersistence.readLegacyRecovery()', context);
  assert.equal(Object.values(recoveries).map(JSON.parse)[0].moduleStore.customSections[0].entries[0].title, 'Offline draft');
  assert.equal(context._moduleStoreSyncConflict, null);
});

test('edits made during the initial online read are recovered without interrupting online loading', async () => {
  const { context, saved } = syncContext();
  const baseline = store(100, 'Basis');
  await context.writeModuleStoreSyncMeta(baseline);
  context.writeLocalModuleStorePayload(baseline);
  context._fb.loadModuleStore = async () => {
    context.writeLocalModuleStorePayload(store(200, 'Edited during load'));
    return store(300, 'Online edited');
  };
  const prompts = [];
  context.showAppStatusHtml = (...args) => prompts.push(args);
  context.showAppStatus = (...args) => prompts.push(args);
  await context.setupModuleStoreRemoteSync();
  assert.equal(context.readLocalModuleStorePayload().customSections[0].entries[0].title, 'Online edited');
  const recoveries = await vm.runInContext('moduleStoreLocalPersistence.readLegacyRecovery()', context);
  assert.equal(Object.values(recoveries).map(JSON.parse)[0].moduleStore.customSections[0].entries[0].title, 'Edited during load');
  assert.equal(context._moduleStoreSyncConflict, null);
  assert.equal(saved.length, 0);
  assert.equal(prompts.length, 0);
});

test('failed reads cannot publish a local cache as an allegedly empty online store', async () => {
  const { context, saved } = syncContext();
  context.writeLocalModuleStorePayload(store(100, 'Lokaler Cache'));
  context._fb.loadModuleStore = async () => { throw new Error('unavailable'); };
  context.showFriendlyAppError = () => {};
  await context.setupModuleStoreRemoteSync();
  assert.equal(saved.length, 0);
  assert.equal(context._moduleStoreRemoteSyncStarted, false);
  assert.equal(context.readLocalModuleStorePayload().customSections[0].entries[0].title, 'Lokaler Cache');
});

test('incoming online state cancels stale queued uploads while deliberate later edits still save', async () => {
  const { context, saved } = syncContext();
  const local = store(200, 'Local draft');
  context.writeLocalModuleStorePayload(local);
  context.scheduleRemoteModuleStoreSave(local);
  await context.applyRemoteModuleStore(store(300, 'Online state'));
  await new Promise(resolve => setTimeout(resolve, 20));
  assert.equal(saved.length, 0);
  assert.equal(context._moduleStoreRemoteSaveTimer, null);
  const edited = store(400, 'Deliberate edit');
  context.writeLocalModuleStorePayload(edited);
  context.scheduleRemoteModuleStoreSave(edited);
  await new Promise(resolve => setTimeout(resolve, 20));
  assert.equal(saved.length, 1);
  assert.equal(saved[0].customSections[0].entries[0].title, 'Deliberate edit');
});

test('the split module round trip retains section icons and content', async () => {
  const { context } = syncContext();
  context.getSectionPathParts = section => section.path || [];
  const sectionSource = readFileSync(new URL('../modules/module-store/module-store-sections.js', import.meta.url), 'utf8');
  vm.runInContext(sectionSource.slice(0, sectionSource.indexOf('function cleanModuleSectionMove(')), context);
  const payload = store(200, 'Mit Bereichsbild');
  payload.customSections[0].iconUrl = './assets/section.png';
  const split = context.buildSplitModuleStore(payload);
  context.getDocs = async () => ({ docs: split.docs.map(item => ({ data: () => item.data })) });
  const restored = await context.loadSplitModuleStore({ moduleStoreManifest: split.manifest });
  assert.equal(context.getModuleStoreContentSignature(restored), context.getModuleStoreContentSignature(payload));
});

for (const remoteRevision of [0, 100]) {
  test(`an unchanged cache cannot overwrite online content with revision ${remoteRevision}`, async () => {
    const { context, saved } = syncContext();
    const local = store(200, 'Alter Cache');
    context.writeLocalModuleStorePayload(local);
    await context.writeModuleStoreSyncMeta(local);
    context._fb.loadModuleStore = async () => store(remoteRevision, 'Online-Inhalt');
    await context.setupModuleStoreRemoteSync();
    assert.equal(context.readLocalModuleStorePayload().customSections[0].entries[0].title, 'Online-Inhalt');
    assert.equal(saved.length, 0);
  });
}

test('unsynced drafts are retained once without any online/local choice', async () => {
  const { context, saved } = syncContext();
  await context.writeModuleStoreSyncMeta(store(100, 'Baseline'));
  context.writeLocalModuleStorePayload(store(200, 'Unsent draft'));
  context._fb.loadModuleStore = async () => store(300, 'Publication');
  await context.setupModuleStoreRemoteSync();
  assert.equal(context.readLocalModuleStorePayload().customSections[0].entries[0].title, 'Publication');
  assert.equal(context._moduleStoreSyncConflict, null);
  assert.equal(saved.length, 0);
  await context.applyRemoteModuleStore(store(300, 'Publication'));
  const recoveries = await vm.runInContext('moduleStoreLocalPersistence.readLegacyRecovery()', context);
  assert.equal(Object.keys(recoveries).length, 1);
  assert.equal(Object.values(recoveries).map(JSON.parse)[0].moduleStore.customSections[0].entries[0].title, 'Unsent draft');
});

test('an empty online store is loaded without automatically publishing an old browser draft', async () => {
  const { context, saved } = syncContext();
  context.writeLocalModuleStorePayload(store(200, 'Browser only'));
  context._fb.loadModuleStore = async () => null;
  await context.setupModuleStoreRemoteSync();
  assert.equal(saved.length, 0);
  assert.equal(context.readLocalModuleStorePayload().customSections.length, 0);
  const recoveries = await vm.runInContext('moduleStoreLocalPersistence.readLegacyRecovery()', context);
  assert.equal(Object.values(recoveries).map(JSON.parse)[0].moduleStore.customSections[0].entries[0].title, 'Browser only');
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
  await context.writeModuleStoreSyncMeta(payload);
  context._fb.loadModuleStore = async () => payload;
  await context.setupModuleStoreRemoteSync();
  assert.equal(context._moduleNodeAssignments.windreiter, 'node:soldner:die-windreiter');
  assert.equal(await context.isLocalModuleStoreSynced(context.readLocalModuleStorePayload()), true);
  assert.equal(context._moduleStoreSyncConflict, null);
  assert.equal(saved.length, 0, 'Rendering a repaired layout must not republish the store');
});

test('Cenyr group classification repair preserves raw cache signatures and does not republish unchanged modules', async () => {
  const { context, saved } = syncContext();
  vm.runInContext(readFileSync(new URL('../modules/module-store/group-section-migration.global.js', import.meta.url), 'utf8'), context);
  const islands = 'node:gruppen:klaueninseln';
  const arth = `${islands}/haus-arth`;
  const payload = { ...store(200, 'Unveränderte Mannschaft'), moduleSectionNodes: [
    { id: 'root:gruppen', parentId: '', tab: 'Gruppen', title: 'Gruppen' },
    { id: 'node:gruppen:cenyr', parentId: 'root:gruppen', tab: 'Gruppen', title: 'Cenyr' },
    { id: islands, parentId: 'root:gruppen', tab: 'Gruppen', title: 'Klaueninseln' },
    { id: arth, parentId: islands, tab: 'Gruppen', title: 'Haus Arth' }
  ], moduleNodeAssignments: { 'rhydians-schiffsmannschaft': arth } };
  payload.customSections[0] = { ...payload.customSections[0], path: ['Klaueninseln', 'Haus Arth'], nodeId: arth };
  context.writeLocalModuleStorePayload(payload);
  await context.writeModuleStoreSyncMeta(payload);
  const receipt = context.localStorage.getItem('sync-meta');
  const signature = context.getModuleStoreContentSignature(context.readLocalModuleStorePayload());
  context.applyModuleStorePayload(context.readLocalModuleStorePayload());
  assert.equal(context._moduleSectionNodes.find(node => node.id === islands).parentId, 'node:gruppen:cenyr');
  assert.deepEqual(clone(context._customSections[0].path), ['Cenyr', 'Klaueninseln', 'Haus Arth']);
  assert.equal(context._moduleNodeAssignments['rhydians-schiffsmannschaft'], arth);
  assert.equal(context.getModuleStoreContentSignature(context.readLocalModuleStorePayload()), signature);
  assert.equal(context.localStorage.getItem('sync-meta'), receipt);
  assert.equal(await context.isLocalModuleStoreSynced(context.readLocalModuleStorePayload()), true);
  context._fb.loadModuleStore = async () => payload;
  await context.setupModuleStoreRemoteSync();
  assert.equal(context._moduleStoreSyncConflict, null);
  assert.equal(saved.length, 0);
});

test('Gwynthor reclassification keeps the raw sync baseline and never republishes unchanged modules', async () => {
  const { context, saved } = syncContext();
  context.SECTIONS = []; context.structuredClone = structuredClone;
  vm.runInContext(readFileSync(new URL('../modules/gwynthor-geography/gwynthor-geography.global.js', import.meta.url), 'utf8'), context);
  const tab = 'Völker & Kulturen', path = ['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Gwynthor'];
  const nodes = [{ id: 'root', parentId: '', title: tab, tab }];
  path.forEach((title, index) => nodes.push({ id: `n${index}`, parentId: index ? `n${index - 1}` : 'root', tab, title }));
  const payload = { updatedAtClient: 200, customSections: [{ key: 'Gwynthor', tab, path, nodeId: 'n3',
    entries: [{ id: 'unchanged-gwynthor', title: 'Unverändert', pages: [{ sessionPage: true, commentThreadKey: 'kept-thread' }] }] }],
    moduleSectionNodes: nodes, moduleNodeAssignments: { 'unchanged-gwynthor': 'n3' } };
  context.writeLocalModuleStorePayload(payload);
  await context.writeModuleStoreSyncMeta(payload);
  const receipt = context.localStorage.getItem('sync-meta');
  const signature = context.getModuleStoreContentSignature(context.readLocalModuleStorePayload());
  context.applyModuleStorePayload(context.readLocalModuleStorePayload());
  assert.equal(context._moduleSectionNodes.find(node => node.id === 'n3').title, 'Gwynthor-Stadt');
  assert.deepEqual(clone(context._customSections[0].path), [...path.slice(0, -1), 'Bannkreis Gwynthor', 'Gwynthor-Stadt']);
  assert.equal(context._customSections[0].entries[0].pages[0].commentThreadKey, 'kept-thread');
  assert.equal(context.getModuleStoreContentSignature(context.readLocalModuleStorePayload()), signature);
  assert.equal(context.localStorage.getItem('sync-meta'), receipt);
  assert.equal(await context.isLocalModuleStoreSynced(context.readLocalModuleStorePayload()), true);
  context._fb.loadModuleStore = async () => payload;
  await context.setupModuleStoreRemoteSync();
  assert.equal(context._moduleStoreSyncConflict, null); assert.equal(saved.length, 0);
});

test('sync receipts remain compact even for a multi-megabyte module store', async () => {
  const { context } = syncContext();
  const payload = store(100, 'Großer Bestand');
  payload.customSections[0].entries[0].description = 'a'.repeat(6000000);
  await context.writeModuleStoreSyncMeta(payload);
  const receipt = context.localStorage.getItem('sync-meta');
  assert.ok(receipt.length < 250);
  assert.match(JSON.parse(receipt).signature, /^sha256:[a-f0-9]{64}$/);
  assert.equal(await context.isLocalModuleStoreSynced(payload), true);
  payload.customSections[0].entries[0].description += 'b';
  assert.equal(await context.isLocalModuleStoreSynced(payload), false);
});

test('receipt migration keeps offline edits unsynced and preserves the original sync date', async () => {
  const { context } = syncContext();
  const baseline = store(100, 'Online-Basis');
  const draft = store(200, 'Offline-Bearbeitung');
  context.writeLocalModuleStorePayload(draft);
  context.localStorage.setItem('sync-meta', JSON.stringify({ signature: JSON.stringify(baseline), updatedAtClient: 100, syncedAt: 10 }));
  await context.loadModuleStore();
  assert.equal(context.readModuleStoreSyncMeta().syncedAt, 10);
  assert.equal(context.readModuleStoreSyncMeta().updatedAtClient, 100);
  assert.equal(await context.isLocalModuleStoreSynced(draft), false);
  assert.equal(await context.isLocalModuleStoreSynced(baseline), true);
});

test('edits made while an incoming snapshot is hashed are recovered before online takes priority', async () => {
  const { context, saved } = syncContext();
  const baseline = store(100, 'Basis');
  await context.writeModuleStoreSyncMeta(baseline);
  context.writeLocalModuleStorePayload(baseline);
  const subtle = crypto.subtle;
  let edited = false;
  context.crypto = { subtle: { digest: async (...args) => {
    if (!edited) {
      edited = true;
      context.writeLocalModuleStorePayload(store(200, 'Während der Prüfsumme bearbeitet'));
    }
    return subtle.digest(...args);
  } } };
  await context.applyRemoteModuleStore(store(300, 'Neuer Online-Stand'));
  assert.equal(context.readLocalModuleStorePayload().customSections[0].entries[0].title, 'Neuer Online-Stand');
  const recoveries = await vm.runInContext('moduleStoreLocalPersistence.readLegacyRecovery()', context);
  assert.equal(Object.values(recoveries).map(JSON.parse)[0].moduleStore.customSections[0].entries[0].title, 'Während der Prüfsumme bearbeitet');
  assert.equal(context._moduleStoreSyncConflict, null);
  assert.equal(saved.length, 0);
});

test('successive live snapshots do not mistake an in-progress cache write for an offline edit', async () => {
  const { context } = syncContext();
  const baseline = store(100, 'Basis');
  await context.writeModuleStoreSyncMeta(baseline);
  context.writeLocalModuleStorePayload(baseline);
  await Promise.all([
    context.applyRemoteModuleStore(store(200, 'Erste Online-Änderung')),
    context.applyRemoteModuleStore(store(300, 'Zweite Online-Änderung'))
  ]);
  assert.equal(context.readLocalModuleStorePayload().customSections[0].entries[0].title, 'Zweite Online-Änderung');
  assert.equal(context._moduleStoreSyncConflict, null);
  assert.equal(await context.isLocalModuleStoreSynced(context.readLocalModuleStorePayload()), true);
});

test('an inline edit defers only the newest online snapshot and cannot upload over that unseen revision', async () => {
  const { context, saved } = syncContext();
  const baseline = store(100, 'Baseline');
  context.writeLocalModuleStorePayload(baseline);
  await context.writeModuleStoreSyncMeta(baseline);
  context._inlineModuleEdit.active = true;
  await context.applyRemoteModuleStore(store(200, 'Earlier online'));
  await context.applyRemoteModuleStore(store(300, 'Latest online'));
  const draft = store(400, 'Finished draft');
  context.writeLocalModuleStorePayload(draft);
  context.scheduleRemoteModuleStoreSave(draft);
  await new Promise(resolve => setTimeout(resolve, 20));
  assert.equal(saved.length, 0);
  context._inlineModuleEdit = null;
  context.dispatchEvent(new CustomEvent('almanach:inline-module-edit-ended'));
  await vm.runInContext('moduleStoreRemoteApplyQueue', context);
  assert.equal(context.readLocalModuleStorePayload().customSections[0].entries[0].title, 'Latest online');
  const recoveries = await vm.runInContext('moduleStoreLocalPersistence.readLegacyRecovery()', context);
  assert.equal(Object.values(recoveries).map(JSON.parse)[0].moduleStore.customSections[0].entries[0].title, 'Finished draft');
  assert.equal(saved.length, 0);
});

test('a newer received snapshot invalidates an older adoption still hashing its baseline', async () => {
  const { context } = syncContext();
  const baseline = store(100, 'Baseline');
  context.writeLocalModuleStorePayload(baseline);
  await context.writeModuleStoreSyncMeta(baseline);
  let release, started;
  const gate = new Promise(resolve => { release = resolve; });
  const entered = new Promise(resolve => { started = resolve; });
  const subtle = crypto.subtle;
  let paused = false;
  context.crypto = { subtle: { digest: async (...args) => {
    if (!paused) { paused = true; started(); await gate; }
    return subtle.digest(...args);
  } } };
  const rendered = [];
  context.renderAll = () => rendered.push(context.readLocalModuleStorePayload().customSections[0].entries[0].title);
  const old = context.applyRemoteModuleStore(store(200, 'Older online'));
  await entered;
  const latest = context.applyRemoteModuleStore(store(300, 'Latest online'));
  release();
  await Promise.all([old, latest]);
  assert.equal(context.readLocalModuleStorePayload().customSections[0].entries[0].title, 'Latest online');
  assert.deepEqual(rendered, ['Latest online']);
});
