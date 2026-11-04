import { STANDARD_ITEMS, STANDARD_VERSION } from './item-register-standard.js?v=20261020-arkaneum-v1';
import { buildOwnedItems, toLegacyItem, categoryLabel } from './item-register-model.js?v=20261006-regional-equipment-v2';
import { legacyOffers } from './item-register-migration.js?v=20261006-regional-equipment-v2';
import { buildModuleOffers, isModuleScanDuplicate } from './item-register-module-catalog.js?v=20261020-arkaneum-v1';
import { moduleProviders } from './item-register-providers.js?v=20261014-aldrimar-brewers-v1';
import { itemDefinitionStore } from '../item-definitions/item-definition-store.js';

export function createRegisterStore({ standards = STANDARD_ITEMS, version = STANDARD_VERSION, notify = () => {}, notifyProjection = 'full' } = {}) {
  let backend = null;
  let unsubscribes = [];
  let legacyUnsubscribe = null;
  const state = { offers: [], characters: [], creatures: [], legacy: [], status: 'loading', error: '', syncedAt: '', ready: new Set() };
  const cached = new Set();
  const failures = new Map();
  const listeners = new Map();
  const connectedKinds = new Set();
  let hydrateDefinitions = true;
  let views = {};
  let localLegacy = [];
  let remoteDeletedKeys = new Set();
  let modules = [], moduleOffers = [], providers = [];
  function recordSnapshot() {
    return { ...state, ready: undefined, charactersReady: state.ready.has('characters'), creaturesReady: state.ready.has('creatures'), version };
  }
  function tradeSnapshot() {
    if (views.trade) return views.trade;
    const required = ['offers', 'characters'];
    const failed = required.find(kind => failures.has(kind));
    const status = failed ? 'error' : required.every(kind => state.ready.has(kind) && !cached.has(kind)) ? 'live'
      : required.some(kind => cached.has(kind)) ? 'offline' : backend?.subscribe ? 'loading' : 'offline';
    return views.trade = { ...recordSnapshot(), status, error: failed ? failures.get(failed)?.message || state.error : '',
      offers: [...moduleOffers, ...state.offers], providers };
  }
  function snapshot() {
    if (views.full) return views.full;
    const remoteIds = new Set(state.offers.map(item => item.id));
    const legacyIds = new Set(state.legacy.map(item => item.id));
    const remainingLocal = localLegacy.filter(item => !legacyIds.has(item.id) && !item.aliases.some(key => remoteDeletedKeys.has(key)));
    const offers = [...moduleOffers, ...state.offers, ...[...state.legacy, ...remainingLocal].filter(item => !remoteIds.has(item.id) && !isModuleScanDuplicate(item, moduleOffers))];
    const owned = buildOwnedItems(state.characters, [...standards, ...offers], state.creatures);
    const definitions = itemDefinitionStore.snapshot().templates.map(template => ({ ...template, canonicalKey: template.id,
      categoryLabel: categoryLabel(template.category), listId: 'definitions', listName: 'Eigene Itemdefinitionen', priceRange: null }));
    return views.full = { ...recordSnapshot(),
      standards, offers, definitions, providers, owned, items: [...standards, ...definitions, ...offers, ...owned], version };
  }
  function changed() {
    views = {};
    for (const [listener, projection] of listeners) listener(projection === 'trade' ? tradeSnapshot() : snapshot());
    notify(notifyProjection === 'records' ? recordSnapshot() : snapshot());
  }
  function setLegacy(payload) {
    state.legacy = legacyOffers(payload || {}, standards);
    remoteDeletedKeys = new Set(payload?.deletedKeys || []);
    changed();
  }
  function setLocalLegacy(payload) { localLegacy = legacyOffers(payload || {}, standards); changed(); }
  function setModules(entries, { hydrateVersions = true, reuseSnapshot = false } = {}) {
    if (reuseSnapshot && modules === entries) return;
    modules = entries;
    moduleOffers = buildModuleOffers(modules, standards);
    itemDefinitionStore.registerTemplates(moduleOffers);
    if (hydrateVersions) itemDefinitionStore.ensureVersions([{ items: moduleOffers }]).catch(error => { state.error = error.message; changed(); });
    providers = moduleProviders(modules);
    changed();
  }
  function stop() {
    unsubscribes.forEach(unsubscribe => unsubscribe());
    unsubscribes = [];
    legacyUnsubscribe?.();
    legacyUnsubscribe = null;
    state.ready.clear();
    cached.clear();
    failures.clear();
    connectedKinds.clear();
    views = {};
  }
  function connect(api, legacyApi = null, { kinds = ['offers', 'characters', 'creatures'], hydrateInventoryDefinitions = true } = {}) {
    if (kinds.some(kind => !['offers', 'characters', 'creatures'].includes(kind))) throw new Error('Unbekannte Registersammlung.');
    const upgradingDefinitions = !hydrateDefinitions && hydrateInventoryDefinitions;
    if (backend !== api || !unsubscribes.length) {
      stop();
      hydrateDefinitions = hydrateInventoryDefinitions;
    } else hydrateDefinitions ||= hydrateInventoryDefinitions;
    backend = api;
    if (!api?.subscribe) { state.status = 'offline'; changed(); return; }
    if (kinds.some(kind => !connectedKinds.has(kind))) { state.status = 'loading'; state.error = ''; views = {}; }
    if (upgradingDefinitions) for (const kind of ['characters', 'creatures']) {
      if (state.ready.has(kind)) itemDefinitionStore.ensureVersions(state[kind]).catch(error => { state.error = error.message; changed(); });
    }
    for (const kind of kinds) {
      if (connectedKinds.has(kind)) continue;
      connectedKinds.add(kind);
      try { unsubscribes.push(api.subscribe(kind, (records, metadata = {}) => {
        state[kind] = records;
        if (hydrateDefinitions && (kind === 'characters' || kind === 'creatures')) itemDefinitionStore.ensureVersions(records).catch(error => { state.error = error.message; changed(); });
        state.ready.add(kind);
        failures.delete(kind);
        if (metadata.fromCache) cached.add(kind); else cached.delete(kind);
        state.status = failures.size ? 'error' : state.ready.size === 3 && !cached.size ? 'live' : cached.size ? 'offline' : 'loading';
        if (state.status === 'live') { state.syncedAt = new Date().toISOString(); state.error = ''; }
        changed();
      }, error => { connectedKinds.delete(kind); failures.set(kind, error); state.status = 'error'; state.error = error.message || 'Die Verbindung wurde unterbrochen.'; changed(); })); }
      catch (error) { connectedKinds.delete(kind); failures.set(kind, error); state.status = 'error'; state.error = error.message; changed(); throw error; }
    }
    if (!legacyUnsubscribe && legacyApi?.subscribeItemDatabase) legacyUnsubscribe = legacyApi.subscribeItemDatabase(setLegacy, error => {
      state.error = `Bisherige Registerdaten konnten nicht geladen werden: ${error.message}`; changed();
    });
  }
  async function commit(input) {
    if (!backend?.commit || state.status !== 'live') throw new Error('Bitte warten, bis das Register mit dem gemeinsamen Speicher verbunden ist.');
    const result = await backend.commit({ ...input, standardVersion: version });
    if (result.character) state.characters = state.characters.map(character => character.id === result.character.id ? result.character : character);
    if (result.offer) state.offers = [...state.offers.filter(offer => offer.id !== result.offer.id), result.offer];
    if (result.creature) state.creatures = [...state.creatures.filter(creature => creature.id !== result.creature.id), result.creature];
    changed();
    return result;
  }
  function replaceStandards(next, nextVersion) {
    if (!Array.isArray(next) || !next.length || next.some(item => !['standard', 'regional'].includes(item.section) || !item.id?.startsWith('standard:')) || new Set(next.map(item => item.id)).size !== next.length) throw new Error('Die Vorlagendaten sind ungültig.');
    standards = next; version = nextVersion; itemDefinitionStore.registerTemplates(standards); moduleOffers = buildModuleOffers(modules, standards); changed();
  }
  return Object.freeze({ snapshot, tradeSnapshot, connect, stop, commit, setLegacy, setLocalLegacy, setModules, replaceStandards, refreshDefinitions: changed,
    subscribe(listener, { projection = 'full' } = {}) { listeners.set(listener, projection); listener(projection === 'trade' ? tradeSnapshot() : snapshot()); return () => listeners.delete(listener); },
    legacyIndex() { return snapshot().items.map(toLegacyItem); },
    getByKey(key) { return snapshot().items.find(item => item.id === key || item.aliases?.includes(key)) || null; }
  });
}

export const registerStore = createRegisterStore({ notifyProjection: 'records', notify(snapshot) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('item-db-store-updated', { detail: { reason: 'register-sync' } }));
  document.dispatchEvent(new CustomEvent('aleria:item-register-records', { detail: { characters: snapshot.characters, creatures: snapshot.creatures,
    charactersReady: snapshot.charactersReady, creaturesReady: snapshot.creaturesReady } }));
} });
