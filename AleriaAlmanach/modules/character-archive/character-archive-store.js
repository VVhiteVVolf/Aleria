import { projectCharacterArchiveViewEntries } from './character-archive-view-projection.js';
import { coalesceRegisterArchiveEntries } from './character-archive-register-projection.js';
import { coalesceWeaponReferenceArchiveEntries } from './character-archive-weapon-reference-projection.js';
import { loadBuiltinCharacterArchiveSnapshot } from './character-archive-catalog.js?v=20260928-equipment-art-v4';
import { reconcileCharacterArchiveLibraryEntries } from './character-archive-library-revision.js';
import { createCatalogSpell, detachCatalogSpell, normalizeSpellCatalogReference } from '../spell-catalog/spell-catalog.js';
import { getCharacterArchiveEntrySignature } from './character-archive-entry-equivalence.js';
import {
  cloneArchiveValue,
  CHARACTER_ARCHIVE_ICON_ASSIGNMENT_VERSION,
  extractItemRegisterArchiveEntries,
  mergeCharacterArchiveEntries,
  normalizeCharacterArchiveEntry
} from './character-archive-model.js?v=20260928-equipment-art-v4';
import { classifyCharacterArchiveEntries } from './character-archive-classification.js?v=20260928-equipment-art-v4';
import { extractCurrentCharacterArchiveEntries, reconcileCharacterArchiveClassTraining } from './character-archive-class-training.js?v=20260928-equipment-art-v4';

const LOCAL_STORAGE_KEY = 'aleria-character-archive-v1';

const state = {
  builtin: [],
  libraryRevision: '',
  remote: [],
  live: [],
  register: [],
  loaded: false,
  loadingPromise: null,
  unsubscribe: null,
  projection: null
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

function snapshotTimestamp(entry) {
  return Math.max(0, ...[entry.updatedAt, entry.createdAt].map(value => Date.parse(value || '')).filter(Number.isFinite));
}

// Stored document IDs are mutable snapshot identities. Resolve them before
// semantic grouping, including old automatic rows whose rules were edited.
function mergePersistedArchiveSnapshots(current, incoming, { patch = false } = {}) {
  const snapshots = new Map();
  const remember = (entry, replace) => {
    if (!entry) return;
    const id = String(entry.id || '').trim();
    if (!id) { snapshots.set(Symbol('anonymous-snapshot'), entry); return; }
    const previous = snapshots.get(id);
    if (!previous || replace || snapshotTimestamp(entry) > snapshotTimestamp(previous)) snapshots.set(id, entry);
  };
  current.forEach(entry => remember(entry, false));
  incoming.forEach(entry => remember(entry, patch));
  return [...snapshots.values()];
}

function mergeRemoteEntries(entries, { replace = true } = {}) {
  const snapshots = replace
    ? mergePersistedArchiveSnapshots(entries, readLocalEntries())
    : mergePersistedArchiveSnapshots(state.remote, entries, { patch: true });
  const merged = mergeCharacterArchiveEntries(snapshots);
  state.remote = reconcileCharacterArchiveLibraryEntries(merged, { entries: state.builtin, libraryRevision: state.libraryRevision });
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
      loadBuiltinCharacterArchiveSnapshot(),
      loadRemoteEntries()
    ]).then(([snapshot, remote]) => {
      state.builtin = snapshot.entries;
      state.libraryRevision = snapshot.libraryRevision;
      const stored = mergePersistedArchiveSnapshots(remote, readLocalEntries());
      state.remote = reconcileCharacterArchiveLibraryEntries(mergeCharacterArchiveEntries(stored), snapshot);
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
  const inputs = [state.builtin, state.live, state.register, state.remote];
  if (!state.projection || inputs.some((input, index) => input !== state.projection.inputs[index])) {
    const classified = classifyCharacterArchiveEntries(reconcileCharacterArchiveClassTraining(inputs.flat()));
    const templates = mergeCharacterArchiveEntries(classified);
    const registers = coalesceRegisterArchiveEntries(templates);
    const references = coalesceWeaponReferenceArchiveEntries(registers);
    state.projection = { inputs, entries: projectCharacterArchiveViewEntries(references) };
  }
  return state.projection.entries.map(entry => cloneArchiveValue(entry));
}

export function setCharacterArchiveLiveRecords(characters = [], creatures = []) {
  const characterEntries = (Array.isArray(characters) ? characters : [])
    .flatMap(record => extractCurrentCharacterArchiveEntries(record, 'character'));
  const creatureEntries = (Array.isArray(creatures) ? creatures : [])
    .flatMap(record => extractCurrentCharacterArchiveEntries({ ...record, entityType: 'creature' }, 'creature'));
  state.live = mergeCharacterArchiveEntries(characterEntries, creatureEntries);
  if (state.loaded) dispatchChanged();
}

export function refreshItemRegisterArchiveEntries() {
  const entries = extractItemRegisterArchiveEntries();
  const changed = JSON.stringify(entries) !== JSON.stringify(state.register);
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

function catalogSpellBeforeEdit(entry) {
  // These are the stored source contracts, not the comparatively expensive
  // grouped register/character view. A spell edit already carries its source ID.
  const entries = [...state.remote, ...state.builtin];
  const existing = entries.find(candidate => candidate.id === entry.id);
  if (existing?.kind === 'spell' && existing.data?.catalogReference) return existing;
  const reference = normalizeSpellCatalogReference(entry.data?.catalogReference);
  if (!reference) return null;
  const matching = entries.find(candidate => candidate.kind === 'spell'
    && candidate.data?.catalogReference?.id === reference.id
    && candidate.data.catalogReference.revision === reference.revision);
  if (matching) return matching;
  const manaResourceId = entry.data?.costs?.find(cost => ['mana-focus', 'pact-points'].includes(cost.resourceId))?.resourceId;
  const spell = createCatalogSpell(reference.id, { revision: reference.revision, ...(manaResourceId ? { manaResourceId } : {}) });
  return spell ? normalizeCharacterArchiveEntry({ kind: 'spell', name: spell.name, data: spell, builtin: true }) : null;
}

function catalogSpellRulesSignature(entry) {
  const data = cloneArchiveValue(entry.data, {});
  // Normalize editor defaults without resolving the reference over the user's
  // proposed rules. The equivalence layer retains the same edition identity.
  if (data.catalogReference) {
    data.catalogOrigin = data.catalogReference;
    delete data.catalogReference;
  }
  return getCharacterArchiveEntrySignature(normalizeCharacterArchiveEntry({ ...entry, data }));
}

export async function saveCharacterArchiveEntry(entry = {}) {
  if (['standard', 'offer', 'owned'].includes(entry.data?.section)) throw new Error('Diese Ware wird im Güterregister verwaltet. Bitte dort die Variante oder den persönlichen Besitz bearbeiten.');
  await ensureCharacterArchiveLoaded();
  if (entry.kind === 'spell' && (entry.data?.catalogReference || String(entry.id || '').startsWith('catalog--'))) {
    const previous = catalogSpellBeforeEdit(entry);
    const rulesChanged = !previous || catalogSpellRulesSignature(entry) !== catalogSpellRulesSignature(previous);
    if (rulesChanged) {
      const reference = entry.data?.catalogReference || previous?.data?.catalogReference;
      entry = { ...entry, id: `custom--${entry.id}`, data: detachCatalogSpell({ ...entry.data, ...(reference ? { catalogReference: reference } : {}) }), builtin: false };
    }
  }
  const now = new Date().toISOString();
  const normalized = normalizeCharacterArchiveEntry({
    ...entry,
    iconAssignmentVersion: CHARACTER_ARCHIVE_ICON_ASSIGNMENT_VERSION,
    data: { ...(entry.data || {}), userAuthored: true },
    builtin: false,
    createdAt: entry.createdAt || now,
    updatedAt: now
  });
  await persistEntries([normalized]);
  return cloneArchiveValue(normalized);
}

export async function archiveCharacterRecord(record = {}, sourceKind = '') {
  await ensureCharacterArchiveLoaded();
  const extracted = extractCurrentCharacterArchiveEntries(record, sourceKind);
  if (!extracted.length) return [];
  // Explicit archival remains available. Live viewing and ordinary profile
  // saves do not persist copies; identical known rules need no extra document.
  const known = new Set([...state.builtin, ...state.remote].map(getCharacterArchiveEntrySignature));
  const now = new Date().toISOString();
  const changed = extracted.map(entry => {
    const signature = getCharacterArchiveEntrySignature(entry);
    if (known.has(signature)) return null;
    known.add(signature);
    return normalizeCharacterArchiveEntry({ ...entry, builtin: false, archivedFromProfile: true,
      iconAssignmentVersion: CHARACTER_ARCHIVE_ICON_ASSIGNMENT_VERSION,
      data: { ...entry.data, userAuthored: true }, createdAt: now, updatedAt: now });
  }).filter(Boolean);
  if (!changed.length) return [];
  await persistEntries(changed);
  return changed.map(entry => cloneArchiveValue(entry));
}

export const characterArchiveStoreInternals = Object.freeze({ readLocalEntries, writeLocalEntries });
