import { loadBuiltinCharacterArchiveEntries } from './character-archive-catalog.js?v=20260810-fire-spell-arsenal-v1';
import {
  cloneArchiveValue,
  extractCharacterArchiveEntries,
  extractItemRegisterArchiveEntries,
  makeCharacterArchiveKey,
  mergeCharacterArchiveEntries,
  normalizeCharacterArchiveEntry
} from './character-archive-model.js?v=20260810-character-archive-register-v1';

const LOCAL_STORAGE_KEY = 'aleria-character-archive-v1';

const state = {
  builtin: [],
  remote: [],
  live: [],
  register: [],
  loaded: false,
  loadingPromise: null,
  unsubscribe: null
};

function readLocalEntries() {
  try {
    const parsed = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed.map(normalizeCharacterArchiveEntry) : [];
  } catch {
    return [];
  }
}

function writeLocalEntries(entries) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(entries));
  } catch (error) {
    console.info('Lokaler Charakterbogen-Archivspeicher ist voll oder nicht verfügbar.', error);
  }
}

function dispatchChanged() {
  document.dispatchEvent(new CustomEvent('aleria:character-archive-changed', {
    detail: { entries: getCharacterArchiveEntries() }
  }));
}

function mergeRemoteEntries(entries, { replace = true } = {}) {
  state.remote = replace
    ? mergeCharacterArchiveEntries(entries, readLocalEntries())
    : mergeCharacterArchiveEntries(state.remote, entries);
  writeLocalEntries(state.remote);
  dispatchChanged();
}

async function waitForBackend() {
  if (globalThis._fb?.loadCharacterArchiveEntries) return globalThis._fb;
  if (typeof globalThis.waitForFirebaseReady === 'function') {
    try { await globalThis.waitForFirebaseReady(); } catch { /* local fallback */ }
  }
  return globalThis._fb || null;
}

async function loadRemoteEntries() {
  const backend = await waitForBackend();
  if (!backend?.loadCharacterArchiveEntries) return readLocalEntries();
  try {
    return await backend.loadCharacterArchiveEntries();
  } catch (error) {
    console.info('Online-Charakterbogen-Archiv nicht erreichbar; lokale Fassung wird verwendet.', error);
    return readLocalEntries();
  }
}

function startRemoteSubscription() {
  if (state.unsubscribe || !globalThis._fb?.subscribeCharacterArchiveEntries) return;
  state.unsubscribe = globalThis._fb.subscribeCharacterArchiveEntries(entries => {
    mergeRemoteEntries(entries, { replace: true });
  }, error => {
    console.info('Live-Abgleich des Charakterbogen-Archivs wurde unterbrochen.', error);
  });
}

export async function ensureCharacterArchiveLoaded() {
  if (state.loaded) return getCharacterArchiveEntries();
  if (!state.loadingPromise) {
    state.loadingPromise = Promise.all([
      loadBuiltinCharacterArchiveEntries(),
      loadRemoteEntries()
    ]).then(([builtin, remote]) => {
      state.builtin = builtin;
      state.remote = mergeCharacterArchiveEntries(remote, readLocalEntries());
      state.register = extractItemRegisterArchiveEntries();
      state.loaded = true;
      writeLocalEntries(state.remote);
      startRemoteSubscription();
      dispatchChanged();
      return getCharacterArchiveEntries();
    }).finally(() => {
      state.loadingPromise = null;
    });
  }
  return state.loadingPromise;
}

export function getCharacterArchiveEntries() {
  return mergeCharacterArchiveEntries(state.builtin, state.live, state.register, state.remote).map(entry => cloneArchiveValue(entry));
}

export function setCharacterArchiveLiveRecords(characters = [], creatures = []) {
  const characterEntries = (Array.isArray(characters) ? characters : [])
    .flatMap(record => extractCharacterArchiveEntries(record, 'character'));
  const creatureEntries = (Array.isArray(creatures) ? creatures : [])
    .flatMap(record => extractCharacterArchiveEntries({ ...record, entityType: 'creature' }, 'creature'));
  state.live = mergeCharacterArchiveEntries(characterEntries, creatureEntries);
  if (state.loaded) dispatchChanged();
}

export function refreshItemRegisterArchiveEntries() {
  const entries = extractItemRegisterArchiveEntries();
  const changed = JSON.stringify(entries.map(entry => entry.id)) !== JSON.stringify(state.register.map(entry => entry.id));
  state.register = entries;
  if (state.loaded && changed) dispatchChanged();
}

if (typeof window !== 'undefined') {
  window.addEventListener('item-db-store-updated', () => refreshItemRegisterArchiveEntries());
}

async function persistEntries(entries) {
  const normalized = entries.map(entry => normalizeCharacterArchiveEntry(entry));
  mergeRemoteEntries(normalized, { replace: false });
  const backend = await waitForBackend();
  if (!backend?.saveCharacterArchiveEntries) return normalized;
  try {
    await backend.saveCharacterArchiveEntries(normalized);
    return normalized;
  } catch (error) {
    console.info('Charakterbogen-Archiv wurde nur lokal gespeichert.', error);
    throw error;
  }
}

export async function saveCharacterArchiveEntry(entry = {}) {
  await ensureCharacterArchiveLoaded();
  const now = new Date().toISOString();
  const normalized = normalizeCharacterArchiveEntry({
    ...entry,
    builtin: false,
    createdAt: entry.createdAt || now,
    updatedAt: now
  });
  await persistEntries([normalized]);
  return cloneArchiveValue(normalized);
}

export async function archiveCharacterRecord(record = {}, sourceKind = '') {
  await ensureCharacterArchiveLoaded();
  const extracted = extractCharacterArchiveEntries(record, sourceKind);
  if (!extracted.length) return [];
  const existingByKey = new Map(getCharacterArchiveEntries().map(entry => [makeCharacterArchiveKey(entry.kind, entry.name), entry]));
  const now = new Date().toISOString();
  const changed = extracted.map(entry => {
    const existing = existingByKey.get(entry.key);
    if (!existing) {
      return normalizeCharacterArchiveEntry({
        ...entry,
        builtin: false,
        archivedFromProfile: true,
        createdAt: now,
        updatedAt: now
      });
    }
    const sources = mergeCharacterArchiveEntries(existing, entry)[0]?.sources || existing.sources;
    const before = JSON.stringify(existing.sources || []);
    if (JSON.stringify(sources) === before) return null;
    return normalizeCharacterArchiveEntry({ ...existing, sources, updatedAt: now });
  }).filter(Boolean);
  if (!changed.length) return [];
  await persistEntries(changed);
  return changed.map(entry => cloneArchiveValue(entry));
}

export const characterArchiveStoreInternals = Object.freeze({ readLocalEntries, writeLocalEntries });
