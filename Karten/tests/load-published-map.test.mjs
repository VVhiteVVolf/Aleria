import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const sources = ['karto-storage.js', 'data/data-manager.js', 'core/karto-load-published-ui.js']
  .map(path => fs.readFileSync(new URL(`../assets/js/${path}`, import.meta.url), 'utf8'));
const draftKey = 'karto.draft.test-map';
const published = { revision: 2, state: { pins: [], regionTitle: 'Aktuelle Karte' } };
const draftState = {
  pins: [{ id: 'local-pin', title: 'Lokaler Ort' }],
  regionTitle: 'Mein Entwurf',
  regionIcon: 'crest.png',
  mapImages: { normal: 'map.png' },
  extraLayers: [{ id: 'layer', url: 'overlay.png' }],
  markerCatalog: [{ id: 'marker', url: 'marker.png' }],
  dominions: [{ id: 'dominion' }],
  dm: { notes: 'Notizen' },
  lsb: { scale: 25 },
};
const clone = value => JSON.parse(JSON.stringify(value));

async function fixture({ withDraft = true, pendingSave = false, store } = {}) {
  const items = store || new Map(withDraft
    ? [[draftKey, JSON.stringify({ basedOnRevision: 1, state: draftState })]] : []);
  const calls = [];
  const messages = [];
  const events = new Map();
  const button = { textContent: '', addEventListener: (_, listener) => { button.click = listener; } };
  const status = { textContent: '' };
  let editorOpen = false;
  let rejectBackup = false;
  let rejectRemoval = false;
  let reloaded = false;
  let liveState = {};
  let readOnline = async () => ({ ok: true, json: async () => clone(published) });
  const runtime = {
    state: () => liveState,
    applyState: data => { Object.assign(liveState, data); },
    hasPendingSave: () => pendingSave,
    cancelPendingSave: () => { pendingSave = false; calls.push('cancel-save'); },
    save: () => { pendingSave = true; },
    toast: message => messages.push(message),
    closeModal: () => {},
  };
  const window = {
    KARTO_CONFIG: { mapId: 'test-map', storage: { dataPath: 'test-map/data.json' } },
    KartoRuntime: runtime,
    KartoPinEditor: { isOpen: () => editorOpen },
    location: { reload: () => { reloaded = true; calls.push('reload'); } },
    addEventListener(type, listener) {
      if (!events.has(type)) events.set(type, []);
      events.get(type).push(listener);
    },
    dispatchEvent: event => (events.get(event.type) || []).forEach(listener => listener(event)),
  };
  const context = vm.createContext({
    window,
    document: {
      getElementById: () => null,
      querySelector: selector => selector.includes('load-published-map') ? button
        : selector.includes('map-storage-status') ? status : null,
    },
    localStorage: {
      getItem: key => items.get(key) ?? null,
      setItem(key, value) {
        if (rejectBackup && key === 'karto-backups-v1') throw new Error('QuotaExceededError');
        items.set(key, value);
        calls.push(`save:${key}`);
      },
      removeItem(key) {
        if (rejectRemoval) throw new Error('Storage access denied');
        items.delete(key);
        calls.push(`remove:${key}`);
      },
    },
    fetch: (...args) => { calls.push('fetch'); return readOnline(...args); },
    Event,
    CustomEvent: class { constructor(type, options) { this.type = type; this.detail = options.detail; } },
    confirm: () => true,
    console,
    setTimeout: () => 1,
  });
  sources.forEach(source => vm.runInContext(source, context));
  await new Promise(resolve => window._fb.sub(state => { liveState = state; resolve(); }));
  calls.length = 0;
  return {
    window, items, calls, messages, button, status,
    get state() { return liveState; },
    get reloaded() { return reloaded; },
    get pendingSave() { return pendingSave; },
    setOnline(fn) { readOnline = fn; },
    setEditorOpen(value) { editorOpen = value; },
    failBackup() { rejectBackup = true; },
    failRemoval() { rejectRemoval = true; },
  };
}

test('switch secures the complete current draft, then reloads the published map', async () => {
  const f = await fixture({ pendingSave: true });
  f.state.pins[0].title = 'Gerade geändert';
  f.items.set('karto.draft.other-map', 'unverändert');
  assert.equal(f.status.textContent, 'ENTWURF');
  await f.button.click();
  const backup = JSON.parse(f.items.get('karto-backups-v1'))[0];
  assert.equal(backup.label, 'Vor Laden der aktuellen Karte');
  assert.equal(backup.mapId, 'test-map');
  assert.deepEqual(JSON.parse(backup.data), clone(f.state));
  assert.deepEqual(f.calls, ['fetch', 'save:karto-backups-v1', `remove:${draftKey}`, 'cancel-save', 'reload']);
  assert.equal(f.items.get('karto.draft.other-map'), 'unverändert');
  const nextPage = await fixture({ store: f.items });
  assert.deepEqual(nextPage.state, published.state);
  assert.equal(nextPage.status.textContent, 'VERÖFFENTLICHT');
});

for (const [label, response] of [
  ['offline', () => { throw new Error('Offline'); }],
  ['HTTP error', () => ({ ok: false })],
  ['invalid state', () => ({ ok: true, json: async () => ({ revision: 2, state: [] }) })],
  ['missing revision', () => ({ ok: true, json: async () => ({ state: {} }) })],
]) {
  test(`${label} keeps the draft and pending edits intact`, async () => {
    const f = await fixture({ pendingSave: true });
    const before = f.items.get(draftKey);
    f.setOnline(response);
    await f.button.click();
    assert.equal(f.items.get(draftKey), before);
    assert.equal(f.items.has('karto-backups-v1'), false);
    assert.equal(f.pendingSave, true);
    assert.equal(f.reloaded, false);
    assert.equal(f.button.disabled, false);
    assert.ok(f.messages.length);
  });
}

for (const failure of ['failBackup', 'failRemoval']) {
  test(`${failure} aborts the switch without clearing pending edits`, async () => {
    const f = await fixture({ pendingSave: true });
    f[failure]();
    await f.button.click();
    assert.equal(f.items.has(draftKey), true);
    assert.equal(f.pendingSave, true);
    assert.equal(f.reloaded, false);
    assert.match(f.messages.at(-1), /unverändert/);
  });
}

test('a clean published map reloads without creating an unnecessary backup', async () => {
  const f = await fixture({ withDraft: false });
  await f.button.click();
  assert.equal(f.items.has('karto-backups-v1'), false);
  assert.equal(f.reloaded, true);
});

test('pending edits are backed up even before the first autosave', async () => {
  const f = await fixture({ withDraft: false, pendingSave: true });
  f.state.regionTitle = 'Noch nicht automatisch gespeichert';
  await f.button.click();
  assert.deepEqual(JSON.parse(JSON.parse(f.items.get('karto-backups-v1'))[0].data), f.state);
  assert.equal(f.reloaded, true);
});

test('an open pin editor blocks switching and is checked again after the request', async () => {
  const f = await fixture();
  f.setEditorOpen(true);
  await f.button.click();
  assert.deepEqual(f.calls, []);
  f.setEditorOpen(false);
  f.setOnline(async () => {
    f.setEditorOpen(true);
    return { ok: true, json: async () => published };
  });
  await f.button.click();
  assert.equal(f.items.has(draftKey), true);
  assert.equal(f.reloaded, false);
});

test('backup restoration uses the selected entry and all saved fields', async () => {
  const f = await fixture({ withDraft: false });
  f.items.set('karto-backups-v1', JSON.stringify([
    { ts: 1, mapId: 'test-map', label: 'Entwurf', data: JSON.stringify(draftState) },
  ]));
  f.window.backupRestore(0);
  assert.deepEqual(clone(f.state), draftState);
  assert.equal(f.pendingSave, true);
});
