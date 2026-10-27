import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const source = file => readFileSync(new URL(`../assets/js/${file}`, import.meta.url), 'utf8');
const plain = value => JSON.parse(JSON.stringify(value));
const key = 'aleria.tafeln.draft.test';
const board = title => ({ schemaVersion: 2, zettel: [{ id: 'n', typ: 'quest', x: .2, y: .3, title, comments: [{ text: 'Spur bleibt' }] }] });

function fixture({ draft = null, revision = 7, published = board('Online'), offline = false, legacy = false, post } = {}) {
  const values = new Map();
  if (draft) values.set(key, JSON.stringify(draft));
  const requests = [];
  const timers = new Map();
  const localStorage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
  const window = {
    TAFEL_CONFIG: { boardId: 'test', storage: { dataPath: 'test/data.json' }, ...(legacy ? { legacyFirebase: { docId: 'unavailable-test-legacy' } } : {}) },
    TafelAuthoredNotices: { load: async () => ({ zettel: [], updates: [] }), merge: state => state },
    dispatchEvent() {}, setTimeout: fn => { const id = timers.size + 1; timers.set(id, fn); return id; },
    TafelRuntime: { toast() {} },
  };
  const context = { window, localStorage, console: { warn() {} }, Event: class {}, CustomEvent: class {}, document: { getElementById: () => null },
    clearTimeout: id => timers.delete(id), setTimeout: window.setTimeout,
    async fetch(url, options = {}) {
      requests.push({ url, ...options });
      if (options.method === 'GET') return { ok: true, json: async () => ({ repository: 'test', branch: 'master' }) };
      if (options.method === 'POST') return post ? post(JSON.parse(options.body)) : { ok: true, json: async () => ({ revision: revision + 1 }) };
      if (offline) throw new Error('offline');
      return { ok: true, json: async () => ({ revision, state: published }) };
    },
  };
  vm.createContext(context);
  vm.runInContext(source('core/tafel-state.js'), context);
  vm.runInContext(source('tafel-storage.js'), context);
  return { window, requests, values, timers, localStorage, draft: () => JSON.parse(values.get(key) || 'null'),
    async load() { await window._fb.sub(state => window.TafelState.apply(state)); },
    async authenticate() { await window.TafelPublish.authenticate('test-only'); },
  };
}

test('an old local base is preserved through reload, saves and conflict; newer online text cannot be overwritten', async () => {
  let expected;
  const f = fixture({ draft: { basedOnRevision: 3, state: board('Lokal') }, post: async body => {
    expected = body.expectedRevision;
    return { ok: false, status: 409, json: async () => ({ message: 'Konflikt' }) };
  } });
  await f.load(); await f.authenticate();
  assert.equal(f.window.TafelPublish.publishedRevision(), 7);
  f.window.TafelState.get().zettel[0].title = 'Lokale Weiterarbeit';
  await f.window.TafelState.saveNow();
  assert.equal(f.draft().basedOnRevision, 3);
  await assert.rejects(f.window.TafelPublish.publish(f.window.TafelState.snapshot()), error => error.status === 409);
  assert.equal(expected, 3);
  assert.equal(f.draft().state.zettel[0].title, 'Lokale Weiterarbeit');
});

test('offline loading does not reset a draft base revision', async () => {
  const f = fixture({ offline: true, draft: { basedOnRevision: 12, state: board('Offline') } });
  await f.load(); await f.window.TafelState.saveNow();
  assert.equal(f.draft().basedOnRevision, 12);
});

test('unavailable legacy data blocks publication even after draft reload, until an explicit complete import', async () => {
  const f = fixture({ published: null, legacy: true });
  await f.load(); await f.authenticate(); await f.window.TafelState.saveNow();
  assert.equal(f.draft().sourceIncomplete, true);
  await assert.rejects(f.window.TafelPublish.publish(f.window.TafelState.snapshot()), /Firebase-Stand/);
  assert.equal(f.requests.some(request => request.method === 'POST'), false);
  const reloaded = fixture({ draft: f.draft() });
  await reloaded.load(); await reloaded.authenticate();
  await assert.rejects(reloaded.window.TafelPublish.publish(reloaded.window.TafelState.snapshot()), /Firebase-Stand/);
  reloaded.window.TafelState.apply(board('Vollständiger Import'));
  reloaded.window.TafelPublish.useImportedState();
  await reloaded.window.TafelState.saveNow();
  await reloaded.window.TafelPublish.publish(reloaded.window.TafelState.snapshot());
  assert.equal(reloaded.draft(), null);
});

test('edits during a publication survive and are rebased to the successful revision', async () => {
  let resolvePost;
  const f = fixture({ post: () => new Promise(resolve => { resolvePost = resolve; }) });
  await f.load(); await f.authenticate();
  await f.window.TafelState.saveNow();
  const publication = f.window.TafelPublish.publish(f.window.TafelState.snapshot());
  f.window.TafelState.get().zettel[0].title = 'Nach dem Absenden';
  await f.window.TafelState.saveNow();
  resolvePost({ ok: true, json: async () => ({ revision: 8 }) });
  await publication;
  assert.equal(f.draft().state.zettel[0].title, 'Nach dem Absenden');
  assert.equal(f.draft().basedOnRevision, 8);
  assert.deepEqual(f.draft().state.zettel[0].comments, [{ text: 'Spur bleibt' }]);
});

test('an unchanged successful publication clears only its own draft; concurrent publication is rejected', async () => {
  let resolvePost;
  const f = fixture({ post: () => new Promise(resolve => { resolvePost = resolve; }) });
  await f.load(); await f.authenticate(); await f.window.TafelState.saveNow();
  const pending = f.window.TafelPublish.publish(f.window.TafelState.snapshot());
  await assert.rejects(f.window.TafelPublish.publish(f.window.TafelState.snapshot()), /läuft bereits/);
  resolvePost({ ok: true, json: async () => ({ revision: 8 }) }); await pending;
  assert.equal(f.draft(), null);
});

test('a second tab cannot overwrite a newer shared local draft', async () => {
  const f = fixture(); await f.load();
  const other = { basedOnRevision: 7, state: board('Anderer Tab') };
  f.localStorage.setItem(key, JSON.stringify(other));
  assert.equal(await f.window.TafelState.saveNow(), false);
  assert.deepEqual(f.draft(), other);
  await f.authenticate();
  await assert.rejects(f.window.TafelPublish.publish(f.window.TafelState.snapshot()), /anderer Tab/);
});

test('pending save can flush immediately, including layout, comments, backups and an explicitly empty board', async () => {
  const f = fixture(); await f.load();
  const state = f.window.TafelState.get();
  state.boardLayout = { version: 1, posters: [{ id: 'paper', assetId: 'arbeit', x: .3, y: .4, width: .1, rotation: 15, layer: 2, pin: { x: .17, y: .09, enabled: false } }] };
  f.window.TafelState.save();
  assert.equal(f.draft(), null);
  await f.window.TafelState.flushPending();
  assert.deepEqual(f.draft().state.boardLayout, plain(state.boardLayout));
  f.window.TafelState.backup('Vorher');
  state.boardLayout.posters = [];
  await f.window.TafelState.saveNow();
  const saved = plain(f.draft().state);
  f.window.TafelState.apply(saved);
  assert.deepEqual(plain(f.window.TafelState.snapshot().boardLayout), { version: 1, posters: [] });
  f.window.TafelState.restoreBackup(f.window.TafelState.backups()[0].id);
  assert.equal(f.window.TafelState.snapshot().boardLayout.posters.length, 1);
});
