import { STANDARD_ITEMS, STANDARD_VERSION } from './item-register-standard.js';
import { buildOwnedItems, toLegacyItem } from './item-register-model.js';
import { legacyOffers } from './item-register-migration.js';

export function createRegisterStore({ standards = STANDARD_ITEMS, version = STANDARD_VERSION, notify = () => {} } = {}) {
  let backend = null;
  let unsubscribes = [];
  let legacyUnsubscribe = null;
  const state = { offers: [], characters: [], creatures: [], legacy: [], status: 'loading', error: '', syncedAt: '', ready: new Set() };
  const cached = new Set();
  const failures = new Map();
  const listeners = new Set();
  let localLegacy = [];
  let remoteDeletedKeys = new Set();
  function snapshot() {
    const remoteIds = new Set(state.offers.map(item => item.id));
    const legacyIds = new Set(state.legacy.map(item => item.id));
    const remainingLocal = localLegacy.filter(item => !legacyIds.has(item.id) && !item.aliases.some(key => remoteDeletedKeys.has(key)));
    const offers = [...state.offers, ...[...state.legacy, ...remainingLocal].filter(item => !remoteIds.has(item.id))];
    const owned = buildOwnedItems(state.characters, [...standards, ...offers], state.creatures);
    return { ...state, ready: undefined, charactersReady: state.ready.has('characters'), creaturesReady: state.ready.has('creatures'), standards, offers, owned, items: [...standards, ...offers, ...owned], version };
  }
  function changed() {
    const current = snapshot();
    for (const listener of listeners) listener(current);
    notify(current);
  }
  function setLegacy(payload) {
    state.legacy = legacyOffers(payload || {}, standards);
    remoteDeletedKeys = new Set(payload?.deletedKeys || []);
    changed();
  }
  function setLocalLegacy(payload) { localLegacy = legacyOffers(payload || {}, standards); changed(); }
  function stop() {
    unsubscribes.forEach(unsubscribe => unsubscribe());
    unsubscribes = [];
    legacyUnsubscribe?.();
    legacyUnsubscribe = null;
    state.ready.clear();
    cached.clear();
    failures.clear();
  }
  function connect(api, legacyApi = null) {
    if (backend === api && unsubscribes.length) return;
    stop();
    backend = api;
    if (!api?.subscribe) { state.status = 'offline'; changed(); return; }
    state.status = 'loading'; state.error = '';
    for (const kind of ['offers', 'characters', 'creatures']) {
      unsubscribes.push(api.subscribe(kind, (records, metadata = {}) => {
        state[kind] = records;
        state.ready.add(kind);
        failures.delete(kind);
        if (metadata.fromCache) cached.add(kind); else cached.delete(kind);
        state.status = failures.size ? 'error' : state.ready.size === 3 && !cached.size ? 'live' : cached.size ? 'offline' : 'loading';
        if (state.status === 'live') { state.syncedAt = new Date().toISOString(); state.error = ''; }
        changed();
      }, error => { failures.set(kind, error); state.status = 'error'; state.error = error.message || 'Die Verbindung wurde unterbrochen.'; changed(); }));
    }
    if (legacyApi?.subscribeItemDatabase) legacyUnsubscribe = legacyApi.subscribeItemDatabase(setLegacy, error => {
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
    if (!Array.isArray(next) || !next.length || next.some(item => item.section !== 'standard' || !item.id?.startsWith('standard:')) || new Set(next.map(item => item.id)).size !== next.length) throw new Error('Die Standarddaten sind ungültig.');
    standards = next; version = nextVersion; changed();
  }
  return Object.freeze({ snapshot, connect, stop, commit, setLegacy, setLocalLegacy, replaceStandards,
    subscribe(listener) { listeners.add(listener); listener(snapshot()); return () => listeners.delete(listener); },
    legacyIndex() { return snapshot().items.map(toLegacyItem); },
    getByKey(key) { return snapshot().items.find(item => item.id === key || item.aliases?.includes(key)) || null; }
  });
}

export const registerStore = createRegisterStore({ notify(snapshot) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('item-db-store-updated', { detail: { reason: 'register-sync' } }));
  document.dispatchEvent(new CustomEvent('aleria:item-register-records', { detail: { characters: snapshot.characters, creatures: snapshot.creatures,
    charactersReady: snapshot.charactersReady, creaturesReady: snapshot.creaturesReady } }));
} });
