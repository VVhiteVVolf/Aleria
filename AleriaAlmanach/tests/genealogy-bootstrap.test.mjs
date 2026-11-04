import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { createGenealogyBootstrap } from '../modules/character-genealogy/genealogy-bootstrap.js';

const tick = () => new Promise(resolve => setImmediate(resolve));
const deferred = () => { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; };
function environment() {
  const listeners = new Map(), notifications = [], ready = [];
  const events = { addEventListener(type, handler) { if (!listeners.has(type)) listeners.set(type, new Set()); listeners.get(type).add(handler); },
    removeEventListener(type, handler) { listeners.get(type)?.delete(handler); },
    dispatchEvent(event) { for (const listener of [...listeners.get(event.type) || []]) listener(event); } };
  const host = { document: events, CustomEvent, showAppStatus: (message, type) => notifications.push({ message, type }) };
  events.addEventListener('aleria:character-genealogy-ready', () => ready.push(typeof host.AleriaCharacterGenealogy.getFamilyMemberships === 'function'));
  return { host, events, notifications, ready, click(action = 'open-import', source = { isConnected: true }) {
    const trigger = { dataset: { characterGenealogyAction: action }, disabled: false, closest: selector => selector === '#char-grid' ? source : null };
    const event = { type: 'click', target: { closest: selector => selector === '[data-character-genealogy-action]' || action === 'open-import' ? trigger : null }, preventDefault() {} };
    events.dispatchEvent(event);
  } };
}

test('initial genealogy bootstrap exposes real identity functions without loading families or importer', async () => {
  const env = environment(); let families = 0, imports = 0;
  const bootstrap = createGenealogyBootstrap({ host: env.host, loadMemberships: async () => { families++; }, loadImporter: async () => { imports++; } });
  await tick(); assert.equal(families, 0); assert.equal(imports, 0);
  const api = env.host.AleriaCharacterGenealogy;
  assert.deepEqual(api.normalizeCharacterIdentity({ worldPersonId: ' person:one ' }), { worldPersonId: 'person:one' });
  assert.equal(api.normalizeCharacterGenealogy({ worldPersonId: ' person:two ' }).worldPersonId, 'person:two');
  assert.equal(typeof api.findBestCharacterMatch, 'function'); assert.equal(typeof api.ensureFamilyMemberships, 'function');
  assert.equal(Object.hasOwn(api, 'getFamilyMemberships'), false); assert.deepEqual(env.ready, [false]);
  bootstrap.destroy();
});

test('concurrent membership requests install the exact resolver before the readiness event and reuse success', async () => {
  const env = environment(), wait = deferred(); let loads = 0;
  const bootstrap = createGenealogyBootstrap({ host: env.host, loadMemberships: () => { loads++; return wait.promise; } });
  const first = env.host.AleriaCharacterGenealogy.ensureFamilyMemberships(), concurrent = env.host.AleriaCharacterGenealogy.ensureFamilyMemberships();
  assert.equal(first, concurrent); await tick(); assert.equal(loads, 1); assert.equal(env.host.AleriaCharacterGenealogy.getFamilyMemberships, undefined);
  const resolver = person => [{ familyId: `family:${person.id}` }];
  wait.resolve({ getDefaultCharacterFamilyMemberships: resolver });
  assert.equal(await first, resolver); assert.equal(env.host.AleriaCharacterGenealogy.getFamilyMemberships, resolver);
  assert.deepEqual(env.ready, [false, true]);
  assert.deepEqual(env.host.AleriaCharacterGenealogy.getFamilyMemberships({ id: 'one' }), [{ familyId: 'family:one' }]);
  await bootstrap.ensureFamilyMemberships(); assert.equal(loads, 1); bootstrap.destroy();
});

test('membership failures retain the lightweight identity API and retry on the next explicit request', async () => {
  const env = environment(); let loads = 0;
  const resolver = () => [{ familyId: 'confirmed' }];
  const bootstrap = createGenealogyBootstrap({ host: env.host, loadMemberships: async () => { if (++loads === 1) throw Error('families offline'); return { getDefaultCharacterFamilyMemberships: resolver }; } });
  await assert.rejects(bootstrap.ensureFamilyMemberships(), /families offline/);
  assert.equal(env.host.AleriaCharacterGenealogy.getFamilyMemberships, undefined); assert.equal(env.notifications.length, 1);
  assert.equal(env.host.AleriaCharacterGenealogy.normalizeCharacterIdentity({}).worldPersonId, '');
  assert.equal(await bootstrap.ensureFamilyMemberships(), resolver); assert.equal(loads, 2); bootstrap.destroy();
});

test('the delegated import entry launches once while loading and the real importer ignores open-import actions', async () => {
  const env = environment(), wait = deferred(); let loads = 0, opens = 0, otherActions = 0;
  const bootstrap = createGenealogyBootstrap({ host: env.host, loadImporter: () => { loads++; return wait.promise; } });
  env.click(); env.click(); await tick(); assert.equal(loads, 1); assert.equal(opens, 0);
  assert.equal(env.notifications.filter(item => item.type === 'info').length, 1);
  const source = readFileSync(new URL('../modules/character-genealogy/genealogy-import-controller.js', import.meta.url), 'utf8');
  const clickListener = source.slice(source.indexOf("document.addEventListener('click'"), source.indexOf("document.addEventListener('input'"));
  vm.runInContext(clickListener, vm.createContext({ document: env.events, window: env.host, console, handleAction: async () => { otherActions++; } }));
  wait.resolve({ openImportDialog: async () => { opens++; } }); await tick();
  assert.equal(opens, 1); assert.equal(otherActions, 0);
  env.click(); await tick(); assert.equal(opens, 2); assert.equal(loads, 1); assert.equal(otherActions, 0);
  assert.equal(env.notifications.filter(item => item.type === 'info').length, 1, 'Cached openings do not repeat the initial loading notice.');
  env.click('close'); await tick(); assert.equal(otherActions, 1); assert.equal(opens, 2);
  assert.equal(typeof env.host.AleriaCharacterGenealogy.normalizeCharacterIdentity, 'function'); bootstrap.destroy();
});

test('a failed importer launch reports once for concurrent clicks and retries on the next action', async () => {
  const env = environment(); let loads = 0, opens = 0;
  const bootstrap = createGenealogyBootstrap({ host: env.host, loadImporter: async () => { if (++loads === 1) throw Error('importer offline'); return { openImportDialog: async () => { opens++; } }; } });
  env.click(); env.click(); await tick();
  assert.equal(loads, 1); assert.equal(env.notifications.filter(item => item.type === 'error').length, 1); assert.equal(opens, 0);
  env.click(); await tick(); assert.equal(loads, 2); assert.equal(opens, 1); bootstrap.destroy();
});

test('stopping a bootstrap prevents delayed importer display and membership publication', async () => {
  const env = environment(), importer = deferred(), membership = deferred(); let opens = 0;
  const bootstrap = createGenealogyBootstrap({ host: env.host, loadImporter: () => importer.promise, loadMemberships: () => membership.promise });
  const opening = bootstrap.openImportDialog(), loading = bootstrap.ensureFamilyMemberships(); bootstrap.destroy();
  importer.resolve({ openImportDialog: async () => { opens++; } }); membership.resolve({ getDefaultCharacterFamilyMemberships: () => [] });
  await Promise.all([opening, loading]);
  assert.equal(opens, 0); assert.equal(env.host.AleriaCharacterGenealogy.getFamilyMemberships, undefined); assert.deepEqual(env.ready, [false]);
});

test('leaving the launching character register prevents a delayed popup and a later valid click reuses the importer', async () => {
  const env = environment(), wait = deferred(), source = { isConnected: true }; let loads = 0, opens = 0;
  const bootstrap = createGenealogyBootstrap({ host: env.host, loadImporter: () => { loads++; return wait.promise; } });
  env.click('open-import', source); await tick(); source.isConnected = false;
  wait.resolve({ openImportDialog: async () => { opens++; } }); await tick();
  assert.equal(opens, 0); assert.equal(loads, 1);
  env.click('open-import', { isConnected: true }); await tick();
  assert.equal(opens, 1); assert.equal(loads, 1); bootstrap.destroy();
});

test('a later valid source supersedes an older guard while sharing exactly one pending importer launch', async () => {
  const env = environment(), wait = deferred(); let loads = 0, opens = 0;
  const bootstrap = createGenealogyBootstrap({ host: env.host, loadImporter: () => { loads++; return wait.promise; } });
  const old = bootstrap.openImportDialog(() => false), latest = bootstrap.openImportDialog(() => true);
  assert.equal(old, latest); await tick(); assert.equal(loads, 1);
  wait.resolve({ openImportDialog: async () => { opens++; } }); await Promise.all([old, latest]);
  assert.equal(opens, 1); bootstrap.destroy();
});
