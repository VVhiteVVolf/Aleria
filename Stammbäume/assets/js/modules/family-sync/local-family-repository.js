import { loadFamilyById, saveFamilyToLibrary } from '../../services/family-library.js';
import { loadPersistedFamily, persistFamily } from '../../services/family-persistence.js';
import { assertValidFamily } from '../../domain/family-schema.js';

const DRAFTS_STORAGE_KEY = 'aleria.family-tree.local-drafts.v1';
const RECOVERY_STORAGE_KEY = 'aleria.family-tree.local-draft-recovery.v1';
const MAX_RECOVERY_RECORDS = 12;

function readJson(storage, key, fallback) {
  try {
    const value = storage?.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function readDrafts(storage) {
  const value = readJson(storage, DRAFTS_STORAGE_KEY, {});
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function writeDrafts(storage, drafts) {
  try {
    storage?.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(drafts));
    return true;
  } catch (error) {
    console.warn('Der lokale Familienentwurf konnte nicht gespeichert werden.', error);
    return false;
  }
}

function sameFamilySnapshot(first, second) {
  return JSON.stringify(first) === JSON.stringify(second);
}

function normalizeDraft(record, familyId = '') {
  if (!record?.family || record.family.document?.id !== familyId) return null;
  try {
    let baseFamily = null;
    if (record.baseFamily?.document?.id === familyId) {
      try {
        baseFamily = assertValidFamily(record.baseFamily).family;
      } catch {
        baseFamily = null;
      }
    }
    return Object.freeze({
      family: assertValidFamily(record.family).family,
      baseFamily,
      baseRevision: Math.max(0, Number(record.baseRevision || 0)),
      dirty: record.dirty === true,
      cloudFamilyId: String(record.cloudFamilyId || ''),
      identityCollision: record.identityCollision === true,
      relatedFamilyIds: Object.freeze(Array.isArray(record.relatedFamilyIds)
        ? [...new Set(record.relatedFamilyIds.map(String).filter(id => id && id !== familyId))]
        : []),
      updatedAt: String(record.updatedAt || '')
    });
  } catch {
    return null;
  }
}

export function createLocalFamilyRepository(storage = globalThis.localStorage) {
  function loadDraft(familyId) {
    const stored = normalizeDraft(readDrafts(storage)[familyId], familyId);
    if (stored) return stored;
    const legacyFamily = loadPersistedFamily(storage);
    if (legacyFamily?.document?.id !== familyId) return null;
    return Object.freeze({
      family: legacyFamily,
      baseFamily: null,
      baseRevision: 0,
      dirty: true,
      cloudFamilyId: '',
      identityCollision: false,
      relatedFamilyIds: Object.freeze([]),
      updatedAt: ''
    });
  }

  function persistDraft(family, options = {}, setAsCurrent = false) {
    const familyId = family?.document?.id;
    if (!familyId) return false;
    const existing = loadDraft(familyId);
    const record = {
      family,
      baseFamily: options.baseFamily === undefined
        ? (existing?.baseFamily || null)
        : (options.baseFamily ? assertValidFamily(options.baseFamily).family : null),
      baseRevision: Math.max(0, Number(options.baseRevision ?? existing?.baseRevision ?? 0)),
      dirty: options.dirty === undefined ? (existing?.dirty === true) : options.dirty === true,
      cloudFamilyId: options.cloudFamilyId === undefined
        ? String(existing?.cloudFamilyId || '')
        : String(options.cloudFamilyId || ''),
      identityCollision: options.identityCollision === undefined
        ? existing?.identityCollision === true
        : options.identityCollision === true,
      relatedFamilyIds: options.relatedFamilyIds === undefined
        ? [...(existing?.relatedFamilyIds || [])]
        : [...new Set((options.relatedFamilyIds || []).map(String).filter(id => id && id !== familyId))],
      updatedAt: new Date().toISOString()
    };
    const drafts = readDrafts(storage);
    drafts[familyId] = record;
    const draftSaved = writeDrafts(storage, drafts);
    const legacySaved = setAsCurrent ? persistFamily(family, storage) : true;
    return draftSaved && legacySaved;
  }

  function persistCurrent(family, options = {}) {
    return persistDraft(family, options, true);
  }

  function persistRelatedChanges(changes) {
    const normalizedChanges = changes.map(change => {
      const family = assertValidFamily(change?.family || change).family;
      const baseFamily = change?.baseFamily
        ? assertValidFamily(change.baseFamily).family
        : null;
      return Object.freeze({ family, baseFamily });
    });
    const normalizedFamilies = normalizedChanges.map(change => change.family);
    const familyIds = [...new Set(normalizedFamilies.map(family => family.document.id))];
    if (familyIds.length < 2 || familyIds.length !== normalizedChanges.length) return false;
    const drafts = readDrafts(storage);
    const existingDrafts = new Map(normalizedChanges.map(({ family }) => {
      const familyId = family.document.id;
      return [familyId, normalizeDraft(drafts[familyId], familyId) || loadDraft(familyId)];
    }));
    const containsStaleFamily = normalizedChanges.some(({ family, baseFamily }) => {
      const existing = existingDrafts.get(family.document.id);
      if (!existing) return false;
      if (sameFamilySnapshot(existing.family, family)) return false;
      return !baseFamily || !sameFamilySnapshot(existing.family, baseFamily);
    });
    if (containsStaleFamily) return false;
    const updatedAt = new Date().toISOString();
    normalizedChanges.forEach(({ family, baseFamily }) => {
      const familyId = family.document.id;
      const existing = existingDrafts.get(familyId);
      drafts[familyId] = {
        family,
        baseFamily: existing?.baseFamily || baseFamily,
        baseRevision: Math.max(0, Number(existing?.baseRevision || 0)),
        dirty: true,
        cloudFamilyId: String(existing?.cloudFamilyId || ''),
        identityCollision: existing?.identityCollision === true,
        relatedFamilyIds: [...new Set([
          ...(existing?.relatedFamilyIds || []),
          ...familyIds.filter(id => id !== familyId)
        ])],
        updatedAt
      };
    });
    return writeDrafts(storage, drafts);
  }

  function listRelatedDrafts(familyId) {
    const drafts = readDrafts(storage);
    const normalizedDrafts = new Map(
      Object.keys(drafts)
        .map(id => [id, normalizeDraft(drafts[id], id)])
        .filter(([, draft]) => Boolean(draft))
    );
    const rootDraft = normalizedDrafts.get(familyId) || loadDraft(familyId);
    if (!rootDraft) return [];

    const adjacency = new Map();
    const ensureLinks = id => {
      if (!adjacency.has(id)) adjacency.set(id, new Set());
      return adjacency.get(id);
    };
    normalizedDrafts.set(familyId, rootDraft);
    normalizedDrafts.forEach((draft, id) => {
      draft.relatedFamilyIds.forEach(relatedId => {
        ensureLinks(id).add(relatedId);
        ensureLinks(relatedId).add(id);
      });
    });

    const visited = new Set([familyId]);
    const pendingIds = [...(adjacency.get(familyId) || [])];
    const relatedDrafts = [];
    while (pendingIds.length) {
      const nextFamilyId = pendingIds.shift();
      if (!nextFamilyId || visited.has(nextFamilyId)) continue;
      visited.add(nextFamilyId);
      const draft = normalizedDrafts.get(nextFamilyId) || loadDraft(nextFamilyId);
      if (!draft) continue;
      relatedDrafts.push(draft);
      (adjacency.get(nextFamilyId) || []).forEach(id => {
        if (!visited.has(id)) pendingIds.push(id);
      });
    }
    return relatedDrafts;
  }

  function markDraftsSynced(records, currentFamilyId = '') {
    if (!Array.isArray(records) || !records.length) return false;
    const drafts = readDrafts(storage);
    const updatedAt = new Date().toISOString();
    const syncedFamilies = records.map(record => Object.freeze({
      family: assertValidFamily(record?.family).family,
      revision: Math.max(0, Number(record?.revision || 0))
    }));
    syncedFamilies.forEach(({ family, revision }) => {
      const familyId = family.document.id;
      drafts[familyId] = {
        family,
        baseFamily: null,
        baseRevision: revision,
        dirty: false,
        cloudFamilyId: familyId,
        identityCollision: false,
        relatedFamilyIds: [],
        updatedAt
      };
    });
    const draftsSaved = writeDrafts(storage, drafts);
    const currentFamily = syncedFamilies.find(record => record.family.document.id === currentFamilyId)?.family;
    const currentSaved = currentFamily ? persistFamily(currentFamily, storage) : true;
    return draftsSaved && currentSaved;
  }

  function archiveDraft(familyId, reason = 'repository-priority') {
    const draft = loadDraft(familyId);
    if (!draft?.dirty) return null;
    const recoveryRecords = readJson(storage, RECOVERY_STORAGE_KEY, []);
    const nextRecord = Object.freeze({
      ...draft,
      familyId,
      reason: String(reason || 'repository-priority'),
      archivedAt: new Date().toISOString()
    });
    try {
      storage?.setItem(RECOVERY_STORAGE_KEY, JSON.stringify([
        nextRecord,
        ...(Array.isArray(recoveryRecords) ? recoveryRecords : [])
      ].slice(0, MAX_RECOVERY_RECORDS)));
      return nextRecord;
    } catch (error) {
      console.warn('Die verdrängte lokale Fassung konnte nicht archiviert werden.', error);
      return null;
    }
  }

  return Object.freeze({
    kind: 'local',
    loadCurrent: () => loadPersistedFamily(storage),
    loadDraft,
    listDrafts() {
      const drafts = Object.keys(readDrafts(storage))
        .map(loadDraft)
        .filter(Boolean);
      const legacyFamily = loadPersistedFamily(storage);
      if (legacyFamily && !drafts.some(draft => draft.family.document.id === legacyFamily.document.id)) {
        const legacyDraft = loadDraft(legacyFamily.document.id);
        if (legacyDraft) drafts.push(legacyDraft);
      }
      return Object.freeze(drafts);
    },
    listRelatedDrafts,
    loadFamily: familyId => loadDraft(familyId)?.family || loadFamilyById(familyId, storage)?.family || null,
    persistCurrent,
    persistDraft,
    persistRelatedChanges,
    markSynced: (family, revision) => persistCurrent(family, {
      baseRevision: revision,
      dirty: false,
      cloudFamilyId: family.document.id,
      identityCollision: false,
      baseFamily: null
    }),
    markDraftSynced: (family, revision) => persistDraft(family, {
      baseRevision: revision,
      dirty: false,
      cloudFamilyId: family.document.id,
      identityCollision: false,
      baseFamily: null
    }),
    markDraftsSynced,
    archiveDraft,
    saveToLibrary: values => saveFamilyToLibrary(values, storage)
  });
}
