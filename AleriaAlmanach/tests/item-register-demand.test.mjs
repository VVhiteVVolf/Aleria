import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { requestItemRegister } from '../modules/item-register/item-register-demand.js';
import { mountInventoryChooser } from '../modules/landing/group-landing-inventory-editor.js';

const tick = () => new Promise(resolve => setImmediate(resolve));
const deferred = () => { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; };

test('register demand awaits the existing native bootstrap and preserves its failures for the requesting view', async () => {
  const wait = deferred(), api = { open() {} }, host = { itemDbEnsureGlobalSync: () => wait.promise };
  const requested = requestItemRegister(host); host.AleriaItemRegister = api; wait.resolve();
  assert.equal(await requested, api);
  await assert.rejects(requestItemRegister({ itemDbEnsureGlobalSync: async () => { throw Error('offline'); } }), /offline/);
  await assert.rejects(requestItemRegister({}), /nicht verfügbar/);
  let ensured = 0;
  const existing = { AleriaItemRegister: { ensure: () => { ensured++; } } };
  assert.equal(await requestItemRegister(existing), existing.AleriaItemRegister); assert.equal(ensured, 1);
});

function chooser() {
  let renders = 0;
  const results = { get innerHTML() { return this.html || ''; }, set innerHTML(value) { this.html = value; renders++; } }, status = { textContent: '' }, more = {};
  const overlay = { addEventListener() {}, querySelector(selector) {
    if (selector === '[data-group-item-results]') return results;
    if (selector === '[data-group-catalog-more]') return more;
    if (selector === '[role="alert"]') return status;
    return null;
  } };
  return { overlay, results, status, renders: () => renders };
}

test('a mounted inventory chooser explicitly loads the register and refreshes when it becomes available', async () => {
  const previous = new Map(['itemDbEnsureGlobalSync', 'AleriaItemRegister', 'addEventListener'].map(key => [key, globalThis[key]]));
  const wait = deferred(), view = chooser(); let requests = 0;
  try {
    globalThis.addEventListener = () => {};
    globalThis.AleriaItemRegister = undefined;
    globalThis.itemDbEnsureGlobalSync = () => { requests++; return wait.promise; };
    const stop = mountInventoryChooser(view.overlay);
    assert.equal(requests, 1); assert.equal(view.renders(), 1);
    globalThis.AleriaItemRegister = { store: { snapshot: () => ({ status: 'live', items: [{ id: 'chalk', title: 'Kreide', section: 'standard', category: 'werkzeuge' }] }) } };
    wait.resolve(); await tick();
    assert.equal(view.renders(), 2); assert.match(view.results.innerHTML, /Kreide/); stop();
  } finally { for (const [key, value] of previous) globalThis[key] = value; }
});

test('a closed inventory chooser ignores delayed register results and errors', async () => {
  const previous = new Map(['itemDbEnsureGlobalSync', 'AleriaItemRegister', 'addEventListener'].map(key => [key, globalThis[key]]));
  try {
    globalThis.addEventListener = () => {};
    for (const fail of [false, true]) {
      const wait = deferred(), view = chooser();
      globalThis.itemDbEnsureGlobalSync = () => wait.promise;
      globalThis.AleriaItemRegister = undefined;
      const stop = mountInventoryChooser(view.overlay); stop();
      globalThis.AleriaItemRegister = { store: { snapshot: () => ({ items: [] }) } };
      if (fail) wait.reject(Error('late failure')); else wait.resolve();
      await tick(); assert.equal(view.renders(), 1); assert.equal(view.status.textContent, '');
    }
  } finally { for (const [key, value] of previous) globalThis[key] = value; }
});

function groupMount() {
  const actors = deferred(), register = deferred(), handlers = new Map(), opened = [], errors = [], regions = new Map();
  const root = { matches: () => true, contains: () => true,
    querySelector(selector) { if (!regions.has(selector)) regions.set(selector, {}); return regions.get(selector); }, querySelectorAll: () => [],
    addEventListener(type, handler, options) { handlers.set(type, handler); options?.signal?.addEventListener('abort', () => handlers.delete(type)); }
  };
  let records = [];
  const context = vm.createContext({ console, AbortController, Promise, Map, WeakMap, Set,
    normalizeLandingData: data => data, groupCharacters: () => records, groupCreatures: () => [], groupScenes: () => [], groupMemberSnapshots: () => [],
    renderGroupSummary: () => '', renderGroupRosterResults: () => '', renderGroupInventory: () => '', renderGroupScenePanel: () => '', renderGroupHeaderClock: () => '',
    mountGroupRosterWindow: () => ({ update() {}, destroy() {} }), createGroupEditor: () => ({ open: (kind, data) => opened.push({ kind, data }), close() {} }),
    mountGroupNavigation: () => () => {}, mountGroupMap: () => () => {}, mountGroupQuestAccount: () => () => {},
    mountGroupSceneControls() {}, unmountGroupSceneControls() {},
    document: { addEventListener() {} }, addEventListener() {}, canEditModuleContent: () => true,
    loadSceneActorData: () => actors.promise.then(() => { records = [{ id: 'confirmed-actor', name: 'Geladene Figur' }]; }),
    requestItemRegister: () => register.promise, showAppStatus: message => errors.push(message), openCharProfile: id => opened.push({ profile: id })
  });
  const source = readFileSync(new URL('../modules/landing/group-landing-controller.js', import.meta.url), 'utf8').replace(/^import[^\n]+;\r?$/gm, '');
  vm.runInContext(source, context);
  const mountContext = { root, entry: { id: 'crew', pages: [] }, page: { landing: { group: { threadId: '' } } }, preview: false, pageIndex: 0 };
  context.AleriaGroupLanding.mount(mountContext);
  return { actors, register, opened, errors, click: (action, data = {}) => handlers.get('click')({ target: { closest: () => ({ dataset: { groupAction: action, ...data }, hasAttribute: () => false }) } }),
    unmount: () => context.AleriaGroupLanding.unmount(mountContext) };
}

test('group editing waits for authoritative actor loading before collecting its editor context', async () => {
  const view = groupMount(), clicked = view.click('settings');
  await tick(); assert.equal(view.opened.length, 0);
  view.actors.resolve(); await clicked;
  assert.equal(view.opened.length, 1); assert.equal(view.opened[0].data.characters[0].id, 'confirmed-actor'); view.unmount();
});

test('unmount cancels delayed group editor and register opens; actor failures remain visible', async () => {
  const view = groupMount(), editing = view.click('settings'), opening = view.click('register');
  view.unmount(); view.actors.resolve(); view.register.resolve({ open: () => view.opened.push('register') });
  await Promise.all([editing, opening]); assert.equal(view.opened.length, 0);
  const failed = groupMount(); await tick(); failed.actors.reject(Error('actor repository offline')); await tick();
  assert.match(failed.errors[0], /actor repository offline/); assert.equal(failed.opened.length, 0); failed.unmount();
});

test('group profile clicks await actor readiness and never open a blank sheet for an unresolved ID', async () => {
  const view = groupMount(), profile = view.click('profile', { characterId: 'confirmed-actor' });
  await tick(); assert.equal(view.opened.length, 0);
  view.actors.resolve(); await profile;
  assert.equal(view.opened[0].profile, 'confirmed-actor');
  await view.click('profile', { characterId: 'missing' }); assert.equal(view.opened.length, 1);
  assert.match(view.errors[0], /nicht verfügbar/); view.unmount();
});

test('a challenge refreshes only the still-open reward picker after demand loading, retaining the draft', async () => {
  const source = readFileSync(new URL('../modules/herausforderung/herausforderung-controller.js', import.meta.url), 'utf8');
  for (const closeBeforeReady of [false, true]) {
    const wait = deferred(), fields = new Map(), refreshed = [], statuses = [];
    const root = { dataset: {}, querySelector(selector) { if (!fields.has(selector)) fields.set(selector, {}); return fields.get(selector); } };
    const context = vm.createContext({ console, Map, crypto, submitting: false, activeThreadId: '', editingComment: null, draftApproaches: [],
      draftAudience: {}, draftTargetActor: {}, dialogCombatContext: {}, draftCombatBound: false, operationId: '', submittedDraft: '',
      getCurrentCommentThread: () => ({ kind: 'session' }), getCurrentCommentThreadId: () => 'scene', getCachedCommentsForThread: () => [], getAvailableCommentCharacters: () => [],
      defaultApproaches: () => [{}], normalizeChallengeAudience: () => ({}), normalizeChallengeTarget: () => ({}),
      deriveCombatStateFromComments: () => new Map(), createChallengeCombatContext: () => ({ encounterId: '' }),
      ensureHerausforderungDialog: () => root, setChallengeSceneImage() {}, renderDialog() {}, activateDialog() {}, deactivateDialog() {},
      requestItemRegister: () => wait.promise, refreshHerausforderungRewardTemplates: node => refreshed.push(node), setHerausforderungStatus: message => statuses.push(message) });
    vm.runInContext(source.slice(source.indexOf('function openDialog('), source.indexOf('function addApproach(')), context);
    context.openDialog();
    const title = root.querySelector('[data-herausforderung-field="title"]'); title.value = 'Mein laufender Entwurf';
    if (closeBeforeReady) context.closeDialog();
    wait.resolve(); await tick();
    assert.equal(refreshed.length, closeBeforeReady ? 0 : 1);
    assert.equal(title.value, 'Mein laufender Entwurf');
  }
});
