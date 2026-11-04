import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const read = name => readFileSync(new URL(`../modules/${name}`, import.meta.url), 'utf8');
const deferred = () => { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; };
const turn = () => new Promise(resolve => setImmediate(resolve));

test('icon catalogue starts on demand, shares requests and can retry a failed fetch', async () => {
  const scripts = [];
  const document = new EventTarget();
  Object.assign(document, { currentScript: { src: 'https://example.test/AleriaAlmanach/modules/icon-directory/icon-directory.js?v=test' },
    head: { appendChild: script => scripts.push(script) },
    createElement() { const script = new EventTarget(); script.remove = () => { script.removed = true; }; return script; } });
  const context = vm.createContext({ document, URL });
  vm.runInContext(read('icon-directory/icon-directory.js'), context);
  assert.equal(scripts.length, 0);
  const first = context.loadIconDirectoryCatalog(), simultaneous = context.loadIconDirectoryCatalog();
  assert.equal(first, simultaneous);
  assert.equal(scripts.length, 1);
  assert.equal(scripts[0].src, 'https://example.test/AleriaAlmanach/modules/icon-directory/icon-directory-data.js?v=20261104-startup-v1');
  const failed = assert.rejects(first, /nicht geladen/);
  scripts[0].dispatchEvent(new Event('error'));
  await failed;
  assert.equal(scripts[0].removed, true);
  const retry = context.loadIconDirectoryCatalog();
  assert.equal(scripts.length, 2);
  context.ALERIA_ICON_DIRECTORY = [{ name: 'Sack', path: '/sack.png' }];
  scripts[1].dispatchEvent(new Event('load'));
  await retry;
  await context.loadIconDirectoryCatalog();
  assert.equal(scripts.length, 2);
  assert.equal(context.getIconDirectoryItems()[0].name, 'Sack');
});

test('character demand shares remote work, announces actual readiness and repaints a remounted register from cache', async () => {
  const remote = deferred(), events = [], calls = { reads: 0, tabs: 0, grid: 0 };
  const document = new EventTarget();
  document.readyState = 'interactive';
  document.addEventListener('aleria:characters-changed', event => events.push(event.detail));
  const window = new EventTarget();
  window._fb = { loadCharacters() { calls.reads++; return remote.promise; }, async loadCharTabs() { return { tabs: ['Alle'] }; } };
  const context = vm.createContext({ document, window, console, Promise, Set,
    CustomEvent: class extends Event { constructor(type, init) { super(type); this.detail = init?.detail; } },
    _fbReady: true, cloneCharacterRecord: value => structuredClone(value),
    normalizeCharTabState() {}, renderCharSubtabs() { calls.tabs++; }, renderCharGrid() { calls.grid++; },
    renderCharPickerInForm() {}, refreshAllModuleCastPickers() {}, getAllCharacterRecords: () => context.records() });
  vm.runInContext(read('characters/character-tabs.js'), context);
  context.renderCharSubtabs = () => { calls.tabs++; };
  context.renderCharGrid = () => { calls.grid++; };
  vm.runInContext('_localCharacterDatabaseRequest = Promise.resolve({ database: { characters: [] } }); globalThis.records = () => _characters;', context);
  assert.equal(calls.reads, 0);
  const first = context.loadCharacters(), second = context.loadCharacters();
  assert.equal(first, second);
  await turn();
  assert.equal(calls.reads, 1);
  remote.resolve([{ id: 'gawain', inventory: { items: ['protected'] } }]);
  await first;
  assert.equal(events.length, 1, 'readiness must not wait for unrelated window.load');
  assert.equal(document.readyState, 'interactive');
  const previousGrid = calls.grid;
  await context.loadCharacters();
  assert.equal(calls.grid, previousGrid + 1, 'cached records populate a recreated host');
  assert.equal(calls.reads, 1);
  assert.equal(events.length, 1, 'a cache hit must not clone and redispatch all records');
  assert.deepEqual(context.records()[0].inventory.items, ['protected']);
});

test('creature demand joins pending reads, remains cached and mounts fresh hosts without more remote work', async () => {
  const remote = deferred(), calls = { reads: 0, renders: 0, changed: 0 };
  const source = read('creatures/creature-system.js');
  const start = source.indexOf('let creatureLoadRequest =');
  const end = source.indexOf("document.addEventListener('click', handleClick);", start);
  const context = vm.createContext({ console, Promise, state: { loaded: false, creatures: [{ id: 'builtin' }] },
    renderLibrary() { calls.renders++; },
    async ensureBackend() { return { loadCreatures() { calls.reads++; return remote.promise; } }; },
    mergeCreatureCatalog: value => value, itemDefinitionStore: { async ensureVersions() {} },
    dispatchChanged() { calls.changed++; }, notify() {}, makeCreatureSceneActor: value => value });
  vm.runInContext(source.slice(start, end).replaceAll('export ', ''), context);
  assert.equal(calls.reads, 0);
  const first = context.loadCreatures(), second = context.loadCreatures({ force: true });
  assert.equal(first, second);
  await turn();
  assert.equal(calls.reads, 1);
  remote.resolve([{ id: 'troetzli' }]);
  const result = await first;
  assert.equal(result[0].id, 'troetzli');
  assert.equal(calls.changed, 1);
  const previous = calls.renders;
  await context.mount();
  assert.equal(calls.renders, previous + 1, 'mount must populate a fresh creature host');
  assert.equal(calls.reads, 1);
  await context.loadCreatures({ force: true });
  assert.equal(calls.reads, 2, 'explicit reload still reads authoritative records');
});

test('scene actor readiness waits for both stores and reports an unavailable store', async () => {
  const character = deferred(), creature = deferred(), warnings = [];
  const source = read('characters/character-data.js');
  const context = vm.createContext({ Promise, console: { warn: (...args) => warnings.push(args) },
    loadCharacters: () => character.promise, window: { AleriaCreatures: { ensureLoaded: () => creature.promise } } });
  vm.runInContext(source.slice(source.indexOf('async function loadSceneActorData()'), source.indexOf('function getAvailableCommentCharacters()')), context);
  let ready = false;
  const request = context.loadSceneActorData().then(() => { ready = true; });
  character.resolve(); await turn(); assert.equal(ready, false);
  const failure = assert.rejects(request, /offline/);
  creature.reject(new Error('offline')); await failure;
  assert.equal(ready, false); assert.equal(warnings.length, 0);
});

function editorHarness() {
  const actorRequest = deferred(), populated = [];
  const nodes = new Map();
  function node(id) {
    if (!nodes.has(id)) { const classes = new Set(); nodes.set(id, { hidden: false, style: {}, classList: {
      remove: value => classes.delete(value), toggle: (value, on) => { if (on) classes.add(value); else classes.delete(value); }, contains: value => classes.has(value) } }); }
    return nodes.get(id);
  }
  const context = vm.createContext({ document: { getElementById: node }, canEditModuleContent: () => true,
    _moduleEditorContext: { payload: { entry: { id: 'one', sessionCastDetails: [{ id: 'later', role: 'Gast' }] } } },
    loadSceneActorData: () => actorRequest.promise, confirmDiscardModuleEditorChanges: () => true,
    deactivateDialog() {}, setModuleEditorStatus() {}, clearModuleDragMarkers() {}, setModuleEditorDirtyState() {} });
  vm.runInContext(read('module-editor/module-editor-controller.js'), context);
  context.populateModuleEditor = payload => populated.push(structuredClone(payload));
  return { context, actorRequest, populated, node };
}

test('module form waits for actor data before creating selectors and preserving cast roles', async () => {
  const h = editorHarness();
  const request = h.context.showModuleEditorForm();
  assert.equal(h.populated.length, 0);
  assert.equal(h.node('module-editor-loading').hidden, false);
  assert.equal(h.node('module-editor-body').classList.contains('visible'), false);
  h.actorRequest.resolve(); await request;
  assert.equal(h.populated.length, 1);
  assert.equal(h.populated[0].entry.sessionCastDetails[0].role, 'Gast');
  assert.equal(h.node('module-editor-body').classList.contains('visible'), true);
  assert.equal(h.node('module-editor-loading').hidden, true);
});

test('closing or reopening a module editor cancels late initial population', async () => {
  const h = editorHarness();
  const first = h.context.showModuleEditorForm();
  h.context.closeModuleEditor();
  h.actorRequest.resolve();
  assert.equal(await first, false);
  assert.equal(h.populated.length, 0);
  const other = editorHarness();
  const older = other.context.showModuleEditorForm();
  other.context._moduleEditorContext = { payload: { entry: { id: 'two' } } };
  const newer = other.context.showModuleEditorForm();
  other.actorRequest.resolve();
  await Promise.all([older, newer]);
  assert.equal(other.populated.length, 1);
  assert.equal(other.populated[0].entry.id, 'two');
});

test('failed actor loading keeps module form data untouched and permits a later open', async () => {
  const h = editorHarness();
  const request = h.context.showModuleEditorForm();
  h.actorRequest.reject(new Error('offline'));
  assert.equal(await request, false);
  assert.equal(h.populated.length, 0);
  assert.equal(h.node('module-editor-body').classList.contains('visible'), false);
  assert.match(h.node('module-editor-loading').textContent, /nicht geladen/);
  h.context.loadSceneActorData = async () => {};
  assert.equal(await h.context.showModuleEditorForm(), true);
  assert.equal(h.populated.length, 1);
});

function archiveHarness() {
  const archive = deferred(), actors = deferred(), calls = { loads: 0, actors: 0, refresh: 0, renders: 0 };
  const document = new EventTarget();
  document.body = { classList: { add() {}, remove() {} } };
  const context = vm.createContext({ document, URLSearchParams, queueMicrotask, location: { search: '' },
    getSpellCatalogSchool: () => null, getSpellCatalogEntry: () => null, createCharacterArchiveProfileItem() {}, archiveCharacterRecord() {},
    ensureCharacterArchiveLoaded() { calls.loads++; return archive.promise; }, loadSceneActorData() { calls.actors++; return actors.promise; },
    activateDialog() {}, deactivateDialog() {} });
  const source = read('character-archive/character-archive-ui.js');
  vm.runInContext(source.slice(source.indexOf('const DEFAULT_RESOURCE_OPTIONS')), context);
  context.refreshLiveEntries = () => { calls.refresh++; };
  context.ensureOverlay = () => ({ replaceChildren() {} });
  context.renderArchive = () => { calls.renders++; };
  context.closeEntryEditor = () => {};
  return { context, archive, actors, calls };
}

test('character rule archive stays idle on overview and awaits its own catalogue plus actors when opened', async () => {
  const h = archiveHarness(); await turn();
  assert.equal(h.calls.loads, 0); assert.equal(h.calls.refresh, 0);
  const request = h.context.openArchive();
  assert.equal(h.calls.loads, 1); assert.equal(h.calls.actors, 1); assert.equal(h.calls.renders, 1);
  h.archive.resolve(); await turn();
  assert.equal(h.calls.renders, 1, 'do not render final selectors with incomplete actor records');
  h.actors.resolve(); await request;
  assert.equal(h.calls.renders, 2);
});

test('late archive data does not redraw a closed picker', async () => {
  const h = archiveHarness();
  const request = h.context.openArchive();
  h.context.closeArchive();
  h.archive.resolve(); h.actors.resolve(); await request;
  assert.equal(h.calls.renders, 1);
});
