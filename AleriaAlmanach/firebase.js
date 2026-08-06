    import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
    import { getAuth, onIdTokenChanged, signInAnonymously }
      from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
    import { getFunctions, httpsCallable }
      from "https://www.gstatic.com/firebasejs/10.12.0/firebase-functions.js";
    import { getFirestore, collection, addDoc, getDocs, query, where, orderBy, limit, serverTimestamp, onSnapshot, doc, getDoc, setDoc, deleteDoc, writeBatch, runTransaction }
      from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
    import { createFirebaseAuthSession }
      from "./modules/auth/firebase-auth-session.js?v=20260803-auth-v1";
    import { compactMechanicalMetadata }
      from "./modules/combat/combat-resolution-storage.js?v=20260804-referee-v1";

    const firebaseConfig = {
      apiKey: "AIzaSyCgSej0WkSlkfAlySKZAdCyu4JjTNZEnYg",
      authDomain: "aleriaprojekt.firebaseapp.com",
      projectId: "aleriaprojekt",
      storageBucket: "aleriaprojekt.firebasestorage.app",
      messagingSenderId: "377039244960",
      appId: "1:377039244960:web:27ab9971f25657224403c5"
    };

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const authSession = createFirebaseAuthSession({ auth, onIdTokenChanged, signInAnonymously });
    const authReady = authSession.start();
    const db  = getFirestore(app);
    const functions = getFunctions(app, 'europe-west1');
    const commitCombatCommentCallable = httpsCallable(functions, 'commitCombatComment', { timeout: 30000 });
    const commitSkillCommentCallable = httpsCallable(functions, 'commitSkillComment', { timeout: 30000 });
    const commitSceneRestCallable = httpsCallable(functions, 'commitSceneRest', { timeout: 30000 });
    const commitCombatEncounterCallable = httpsCallable(functions, 'commitCombatEncounter', { timeout: 30000 });
    const commitUndoMechanicalCommentCallable = httpsCallable(functions, 'commitUndoMechanicalComment', { timeout: 30000 });
    const commitResetCombatParticipantsCallable = httpsCallable(functions, 'commitResetCombatParticipants', { timeout: 30000 });
    const commitHerausforderungCallable = httpsCallable(functions, 'commitHerausforderung', { timeout: 30000 });
    const commitInventoryTransferCallable = httpsCallable(functions, 'commitInventoryTransfer', { timeout: 30000 });
    const commitNarrativeCommentCallable = httpsCallable(functions, 'commitNarrativeComment', { timeout: 20000 });
    const finalizeCombatNarrationCallable = httpsCallable(functions, 'finalizeCombatNarration', { timeout: 15000 });
    const importBackupRecordsCallable = httpsCallable(functions, 'importBackupRecords', { timeout: 60000 });
    const familyTreeDb = getFirestore(app, 'family-trees');
    const FAMILY_TREE_ENTITY_COLLECTIONS = Object.freeze([
      'persons',
      'partnerships',
      'parentages',
      'houses',
      'cadetBranches',
      'timeJumps'
    ]);
    const MODULE_STORE_COLLECTION = 'char_tabs';
    const MODULE_STORE_DOC = 'config';
    const MODULE_STORE_ENTRY_COLLECTION = 'module_store_entries';
    const MODULE_STORE_SPLIT_FORMAT = 'split-v1';
    const ITEM_DATABASE_COLLECTION = 'item_database';
    const ITEM_DATABASE_DOC = 'global';
    const ITEM_DATABASE_ENTRY_COLLECTION = 'item_database_entries';
    const ITEM_DATABASE_SPLIT_FORMAT = 'split-v1';

    async function requireFirebaseUser() {
      return authSession.requireUser();
    }

    function getFirebaseAccess() {
      return authSession.getAccess();
    }

    async function requireSharedEditor() {
      await requireFirebaseUser();
      if (!getFirebaseAccess().canEditSharedContent) {
        throw new Error('Diese Änderung benötigt die Firebase-Rolle Editor, Moderator oder Admin.');
      }
    }

    async function requireModerator() {
      await requireFirebaseUser();
      if (!getFirebaseAccess().canModerate) {
        throw new Error('Diese Änderung benötigt die Firebase-Rolle Moderator oder Admin.');
      }
    }

    function notifyAppStatus(message, type = 'error') {
      if (typeof window.showAppStatus === 'function') {
        window.showAppStatus(message, type);
      }
    }

    function assertCommentMutable(data, operation) {
      const policy = window.AleriaCommentTransactions;
      if (!policy?.assertMutable) throw new Error('Der Schutz mechanischer Beiträge ist nicht geladen.');
      return policy.assertMutable(data, operation);
    }

    function getFirebaseErrorMessage(error, fallback) {
      const code = String(error?.code || '');
      if (code.includes('permission-denied')) return 'Keine Berechtigung. Prüfe bitte die Firestore-Regeln oder deinen Zugriff.';
      if (code.includes('unavailable')) return 'Verbindung zu Firebase nicht verfügbar. Bitte später erneut versuchen.';
      if (code.includes('resource-exhausted')) return 'Firebase-Limit erreicht. Bitte später erneut versuchen.';
      return fallback;
    }

    function normalizeCommentModuleInsertForFirestore(source = {}) {
      const next = { ...(source || {}) };
      if (typeof next.moduleInsert === 'string' && next.moduleInsert.trim()) {
        next.moduleInsertJson = typeof next.moduleInsertJson === 'string' && next.moduleInsertJson
          ? next.moduleInsertJson
          : next.moduleInsert;
        next.moduleInsert = null;
      } else if (next.moduleInsert && typeof next.moduleInsert === 'object') {
        next.moduleInsertJson = typeof next.moduleInsertJson === 'string' && next.moduleInsertJson
          ? next.moduleInsertJson
          : JSON.stringify(next.moduleInsert);
        next.moduleInsert = null;
      } else if (typeof next.moduleInsertJson !== 'string') {
        next.moduleInsertJson = '';
      }
      return next;
    }

    function cloneSerializableValue(value) {
      if (!value || typeof value !== 'object') return value;
      if (typeof structuredClone === 'function') return structuredClone(value);
      return JSON.parse(JSON.stringify(value));
    }

    function normalizeFirebaseModuleStore(data) {
      return {
        version: data?.version || 1,
        updatedAtClient: Number(data?.updatedAtClient) || Date.now(),
        customSections: Array.isArray(data?.customSections) ? data.customSections : [],
        moduleSectionNodes: Array.isArray(data?.moduleSectionNodes) ? data.moduleSectionNodes : [],
        moduleNodeAssignments: data?.moduleNodeAssignments && typeof data.moduleNodeAssignments === 'object' ? data.moduleNodeAssignments : {},
        moduleSectionMoves: data?.moduleSectionMoves && typeof data.moduleSectionMoves === 'object' ? data.moduleSectionMoves : {},
        hiddenModuleIds: data?.hiddenModuleIds && typeof data.hiddenModuleIds === 'object' ? data.hiddenModuleIds : {},
        archiveDashboardInsights: Array.isArray(data?.archiveDashboardInsights) ? data.archiveDashboardInsights : [],
        entryOverrides: data?.entryOverrides && typeof data.entryOverrides === 'object' ? data.entryOverrides : {}
      };
    }

    function getModuleEntryDocId(entryId) {
      return encodeURIComponent(String(entryId || '').trim()).replace(/\./g, '%2E');
    }

    function serializeFirebaseModuleEntry(entry) {
      return JSON.stringify(entry || null);
    }

    function readFirebaseModuleEntry(data) {
      if (typeof data?.entryJson === 'string' && data.entryJson) {
        try {
          const parsed = JSON.parse(data.entryJson);
          return parsed && typeof parsed === 'object' ? parsed : null;
        } catch (error) {
          console.warn('module store entry JSON parse failed:', error);
          return null;
        }
      }
      return data?.entry && typeof data.entry === 'object' ? data.entry : null;
    }

    function getItemDatabaseEntryDocId(kind, key) {
      const safeKind = String(kind || 'item').replace(/[^a-z0-9-]/gi, '-');
      const safeKey = encodeURIComponent(String(key || '').trim()).replace(/\./g, '%2E');
      return `${safeKind}--${safeKey}`;
    }

    function buildSplitItemDatabase(payload = {}) {
      const docs = [];
      const addEntries = (kind, items, getKey) => {
        (Array.isArray(items) ? items : []).forEach((item, index) => {
          const key = String(getKey(item, index) || '').trim();
          if (!key) return;
          docs.push({
            id: getItemDatabaseEntryDocId(kind, key),
            data: {
              kind,
              key,
              valueJson: JSON.stringify(item),
              updatedAtClient: Number(payload.updatedAtClient) || Date.now(),
              schemaVersion: 1
            }
          });
        });
      };
      addEntries('scan', payload.scanCache, (item, index) => item?.canonicalKey || item?.id || `scan-${index + 1}`);
      addEntries('custom', payload.customItems, (item, index) => item?.canonicalKey || item?.id || `custom-${index + 1}`);
      Object.entries(payload.overrides || {}).forEach(([key, value]) => {
        docs.push({
          id: getItemDatabaseEntryDocId('override', key),
          data: {
            kind: 'override',
            key,
            valueJson: JSON.stringify(value || {}),
            updatedAtClient: Number(payload.updatedAtClient) || Date.now(),
            schemaVersion: 1
          }
        });
      });
      return {
        docs,
        manifest: {
          format: ITEM_DATABASE_SPLIT_FORMAT,
          schema: payload.schema || 'aleria-item-db-export-v1',
          exportedAt: payload.exportedAt || new Date().toISOString(),
          updatedAtClient: Number(payload.updatedAtClient) || Date.now(),
          entryIds: docs.map(item => item.id),
          deletedKeys: Array.isArray(payload.deletedKeys) ? payload.deletedKeys : [],
          config: payload.config && typeof payload.config === 'object' ? payload.config : {}
        }
      };
    }

    function readSplitItemDatabaseValue(data) {
      try {
        return JSON.parse(String(data?.valueJson || 'null'));
      } catch(error) {
        console.warn('item database entry JSON parse failed:', data?.key, error);
        return null;
      }
    }

    async function loadSplitItemDatabase(data = {}) {
      const manifest = data?.itemDatabaseManifest;
      if (!manifest || manifest.format !== ITEM_DATABASE_SPLIT_FORMAT) return null;
      const ids = new Set(Array.isArray(manifest.entryIds) ? manifest.entryIds : []);
      const snap = await getDocs(collection(db, ITEM_DATABASE_ENTRY_COLLECTION));
      const scanCache = [];
      const customItems = [];
      const overrides = {};
      snap.docs.forEach(item => {
        if (!ids.has(item.id)) return;
        const entry = item.data();
        const value = readSplitItemDatabaseValue(entry);
        if (!value) return;
        if (entry.kind === 'scan') scanCache.push(value);
        else if (entry.kind === 'custom') customItems.push(value);
        else if (entry.kind === 'override' && entry.key) overrides[String(entry.key)] = value;
      });
      return {
        schema: manifest.schema || 'aleria-item-db-export-v1',
        exportedAt: manifest.exportedAt || new Date().toISOString(),
        updatedAtClient: Number(manifest.updatedAtClient) || 0,
        scanCache,
        customItems,
        overrides,
        deletedKeys: Array.isArray(manifest.deletedKeys) ? manifest.deletedKeys : [],
        config: manifest.config && typeof manifest.config === 'object' ? manifest.config : {}
      };
    }

    async function saveSplitItemDatabase(payload = {}) {
      const split = buildSplitItemDatabase(payload);
      const nextIds = new Set(split.docs.map(item => item.id));
      const existing = await getDocs(collection(db, ITEM_DATABASE_ENTRY_COLLECTION));
      await Promise.all(split.docs.map(item => setDoc(doc(db, ITEM_DATABASE_ENTRY_COLLECTION, item.id), {
        ...item.data,
        updatedAt: serverTimestamp()
      }, { merge: false })));
      await setDoc(doc(db, ITEM_DATABASE_COLLECTION, ITEM_DATABASE_DOC), {
        itemDatabaseType: 'almanach-item-database',
        itemDatabaseMode: ITEM_DATABASE_SPLIT_FORMAT,
        itemDatabaseManifest: split.manifest,
        updatedAtClient: split.manifest.updatedAtClient,
        updatedAt: serverTimestamp()
      }, { merge: true });
      await Promise.all(existing.docs
        .filter(item => !nextIds.has(item.id))
        .map(item => deleteDoc(doc(db, ITEM_DATABASE_ENTRY_COLLECTION, item.id))));
    }

    function buildSplitModuleStore(data) {
      const normalized = normalizeFirebaseModuleStore(data);
      const docs = [];
      const customSections = normalized.customSections.map((section, sectionIndex) => {
        const entries = Array.isArray(section?.entries) ? section.entries : [];
        const entryIds = [];
        entries.forEach((entry, entryIndex) => {
          const entryId = String(entry?.id || '').trim();
          if (!entryId) return;
          entryIds.push(entryId);
          docs.push({
            id: getModuleEntryDocId(entryId),
            data: {
              entryId,
              moduleKind: 'custom',
              section: {
                key: String(section?.key || '').trim(),
                tab: String(section?.tab || '').trim(),
                desc: String(section?.desc || '').trim(),
                nodeId: String(section?.nodeId || '').trim(),
                path: Array.isArray(section?.path) ? section.path.map(part => String(part || '').trim()).filter(Boolean) : []
              },
              sectionIndex,
              entryIndex,
              entry: null,
              entryJson: serializeFirebaseModuleEntry(entry),
              updatedAtClient: normalized.updatedAtClient,
              schemaVersion: 1
            }
          });
        });
        return {
          key: String(section?.key || '').trim(),
          tab: String(section?.tab || '').trim(),
          desc: String(section?.desc || '').trim(),
          nodeId: String(section?.nodeId || '').trim(),
          path: Array.isArray(section?.path) ? section.path.map(part => String(part || '').trim()).filter(Boolean) : [],
          entryIds
        };
      });

      const entryOverrideIds = [];
      Object.entries(normalized.entryOverrides).forEach(([entryId, entry]) => {
        const safeId = String(entryId || entry?.id || '').trim();
        if (!safeId) return;
        entryOverrideIds.push(safeId);
        docs.push({
          id: getModuleEntryDocId(safeId),
          data: {
            entryId: safeId,
            moduleKind: 'override',
            entry: null,
            entryJson: serializeFirebaseModuleEntry({ ...entry, id: safeId }),
            updatedAtClient: normalized.updatedAtClient,
            schemaVersion: 1
          }
        });
      });

      return {
        manifest: {
          format: MODULE_STORE_SPLIT_FORMAT,
          version: normalized.version,
          updatedAtClient: normalized.updatedAtClient,
          customSections,
          moduleSectionNodes: normalized.moduleSectionNodes || [],
          moduleNodeAssignments: normalized.moduleNodeAssignments || {},
          moduleSectionMoves: normalized.moduleSectionMoves || {},
          hiddenModuleIds: normalized.hiddenModuleIds || {},
          archiveDashboardInsights: normalized.archiveDashboardInsights || [],
          entryOverrideIds
        },
        docs
      };
    }

    async function loadSplitModuleStore(configData) {
      const manifest = configData?.moduleStoreManifest;
      if (!manifest || manifest.format !== MODULE_STORE_SPLIT_FORMAT) return null;

      const snap = await getDocs(collection(db, MODULE_STORE_ENTRY_COLLECTION));
      const docsByEntryId = new Map();
      snap.docs.forEach(item => {
        const data = item.data();
        const entry = readFirebaseModuleEntry(data);
        const entryId = String(data?.entryId || entry?.id || '').trim();
        if (entryId && entry) docsByEntryId.set(entryId, { ...data, entry });
      });

      const customSections = (Array.isArray(manifest.customSections) ? manifest.customSections : [])
        .map(section => ({
          key: String(section?.key || '').trim(),
          tab: String(section?.tab || section?.key || '').trim(),
          desc: String(section?.desc || '').trim(),
          nodeId: String(section?.nodeId || '').trim(),
          path: Array.isArray(section?.path) ? section.path.map(part => String(part || '').trim()).filter(Boolean) : [],
          entries: (Array.isArray(section?.entryIds) ? section.entryIds : [])
            .map(entryId => docsByEntryId.get(String(entryId || '').trim())?.entry)
            .filter(Boolean)
        }));

      const entryOverrides = {};
      (Array.isArray(manifest.entryOverrideIds) ? manifest.entryOverrideIds : []).forEach(entryId => {
        const safeId = String(entryId || '').trim();
        const entry = docsByEntryId.get(safeId)?.entry;
        if (safeId && entry) entryOverrides[safeId] = { ...entry, id: safeId };
      });

      return {
        version: manifest.version || 1,
        updatedAtClient: Number(manifest.updatedAtClient) || 0,
        customSections,
        moduleSectionNodes: Array.isArray(manifest.moduleSectionNodes) ? manifest.moduleSectionNodes : [],
        moduleNodeAssignments: manifest.moduleNodeAssignments || configData?.moduleNodeAssignments || {},
        moduleSectionMoves: manifest.moduleSectionMoves || configData?.moduleSectionMoves || {},
        hiddenModuleIds: manifest.hiddenModuleIds || configData?.hiddenModuleIds || {},
        archiveDashboardInsights: Array.isArray(manifest.archiveDashboardInsights) ? manifest.archiveDashboardInsights : [],
        entryOverrides
      };
    }

    async function saveSplitModuleStore(data) {
      const normalized = normalizeFirebaseModuleStore(data);
      const split = buildSplitModuleStore(normalized);
      const nextDocIds = new Set(split.docs.map(item => item.id));
      const entriesRef = collection(db, MODULE_STORE_ENTRY_COLLECTION);
      const existing = await getDocs(entriesRef);

      await Promise.all(existing.docs
        .filter(item => !nextDocIds.has(item.id))
        .map(item => deleteDoc(doc(db, MODULE_STORE_ENTRY_COLLECTION, item.id))));

      await Promise.all(split.docs.map(item => setDoc(
        doc(db, MODULE_STORE_ENTRY_COLLECTION, item.id),
        {
          ...item.data,
          updatedAt: serverTimestamp()
        },
        { merge: false }
      )));

      await setDoc(doc(db, MODULE_STORE_COLLECTION, MODULE_STORE_DOC), {
        moduleStoreData: null,
        moduleStore: null,
        moduleStoreMode: MODULE_STORE_SPLIT_FORMAT,
        moduleStoreType: 'almanach-module-store',
        moduleStoreManifest: split.manifest,
        moduleSectionNodes: normalized.moduleSectionNodes || [],
        moduleNodeAssignments: normalized.moduleNodeAssignments || {},
        moduleSectionMoves: normalized.moduleSectionMoves || {},
        hiddenModuleIds: normalized.hiddenModuleIds || {},
        archiveDashboardInsights: normalized.archiveDashboardInsights || [],
        moduleStoreUpdatedAtClient: normalized.updatedAtClient,
        moduleStoreUpdatedAt: serverTimestamp()
      }, { merge: true });
    }

    async function hashDeleteCode(code) {
      const normalized = String(code || '').trim().toUpperCase();
      if (!normalized) return '';
      if (!window.crypto?.subtle) {
        throw new Error('Sichere Code-Pruefung wird von diesem Browser nicht unterstuetzt.');
      }
      const bytes = new TextEncoder().encode(`aleria-comment-delete:v1:${normalized}`);
      const hash = await window.crypto.subtle.digest('SHA-256', bytes);
      return Array.from(new Uint8Array(hash), byte => byte.toString(16).padStart(2, '0')).join('');
    }

    async function isMatchingDeleteCode(data, code) {
      const normalized = String(code || '').trim().toUpperCase();
      await authReady;
      if (getFirebaseAccess().canModerate) return true;
      if (!normalized) return false;
      if (data?.deleteCodeHash) return data.deleteCodeHash === await hashDeleteCode(normalized);
      // Legacy comments created before hashing still carry a clear-text deleteCode.
      return data?.deleteCode === normalized;
    }

    // ── PUBLIC API used by the rest of the page ──────────────────────────────
    function getTimestampMs(value) {
      if (!value) return null;
      if (typeof value.toMillis === 'function') {
        const ms = Number(value.toMillis());
        return Number.isFinite(ms) ? ms : null;
      }
      if (typeof value.toDate === 'function') {
        const ms = Number(value.toDate()?.getTime());
        return Number.isFinite(ms) ? ms : null;
      }
      if (typeof value === 'number') {
        return Number.isFinite(value) ? value : null;
      }
      if (typeof value === 'string') {
        const parsed = Date.parse(value);
        return Number.isFinite(parsed) ? parsed : null;
      }
      const seconds = Number(value?.seconds ?? value?._seconds);
      if (!Number.isFinite(seconds)) return null;
      const nanos = Number(value?.nanoseconds ?? value?._nanoseconds ?? 0);
      return (seconds * 1000) + (Number.isFinite(nanos) ? nanos / 1000000 : 0);
    }

    function getCommentTimestampMs(comment) {
      return getTimestampMs(comment?.ts);
    }

    function getCommentActivityMs(comment, fallbackIndex = 0) {
      const candidates = [
        Number(comment?.activityAtClient),
        getTimestampMs(comment?.activityAt),
        Number(comment?.updatedAtClient),
        getTimestampMs(comment?.updatedAt),
        getTimestampMs(comment?.editedAt),
        Number(comment?.createdAtClient),
        Number(comment?.createdAtMs),
        getTimestampMs(comment?.createdAt),
        getCommentTimestampMs(comment),
        getCommentSortValue(comment, fallbackIndex)
      ].filter(Number.isFinite);
      return candidates.length ? Math.max(...candidates) : fallbackIndex;
    }

    function getCommentSortValue(comment, fallbackIndex = 0) {
      const orderKey = Number(comment?.orderKey);
      if (Number.isFinite(orderKey)) return orderKey;
      const timestamp = getCommentTimestampMs(comment);
      return Number.isFinite(timestamp) ? timestamp : fallbackIndex * 1000;
    }

    function sortCommentsByTimeline(comments) {
      return (Array.isArray(comments) ? comments : []).slice().sort((a, b) => {
        const av = getCommentSortValue(a, 0);
        const bv = getCommentSortValue(b, 0);
        if (av !== bv) return av - bv;
        return (getCommentTimestampMs(a) || 0) - (getCommentTimestampMs(b) || 0);
      });
    }

    function sortCommentsByRecentActivity(comments) {
      return (Array.isArray(comments) ? comments : [])
        .map((comment, index) => ({ comment, index }))
        .sort((a, b) => {
          const av = getCommentActivityMs(a.comment, a.index);
          const bv = getCommentActivityMs(b.comment, b.index);
          if (av !== bv) return bv - av;
          return String(b.comment?.id || '').localeCompare(String(a.comment?.id || ''));
        })
        .map(item => item.comment);
    }

    window._fb = {
      async loadComments(entryId) {
        try {
          const q = query(
            collection(db, 'comments'),
            where('entryId', '==', entryId)
          );
          const snap = await getDocs(q);
          // Sort client-side by ts to avoid needing a composite Firestore index
          const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          return sortCommentsByTimeline(docs);
        } catch(e) {
          console.error('loadComments error:', e);
          notifyAppStatus(getFirebaseErrorMessage(e, 'Kommentare konnten nicht geladen werden.'));
          return [];
        }
      },
      subscribeComments(entryId, onNext, onError) {
        const q = query(
          collection(db, 'comments'),
          where('entryId', '==', entryId)
        );
        return onSnapshot(q, snap => {
          const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          onNext(sortCommentsByTimeline(docs));
        }, error => {
          console.error('subscribeComments error:', error);
          notifyAppStatus(getFirebaseErrorMessage(error, 'Live-Kommentare konnten nicht verbunden werden.'));
          if (onError) onError(error);
        });
      },
      async addComment(entryId, charName, charTitle, portrait, text, deleteCode, narrator, metadata = {}) {
        await requireFirebaseUser();
        const deleteCodeHash = await hashDeleteCode(deleteCode);
        const committed = await commitNarrativeCommentCallable({
          entryId,
          charName,
          charTitle,
          portrait,
          text,
          deleteCodeHash,
          narrator: narrator === true,
          metadata: cloneSerializableValue(normalizeCommentModuleInsertForFirestore(metadata))
        });
        return committed.data;
      },
      async addSceneRest(entryId, text, deleteCode, metadata = {}) {
        await requireFirebaseUser();
        const deleteCodeHash = await hashDeleteCode(deleteCode);
        const committed = await commitSceneRestCallable({
          entryId,
          text,
          deleteCodeHash,
          metadata: cloneSerializableValue(normalizeCommentModuleInsertForFirestore(metadata))
        });
        return committed.data;


      },
      async addCombatEncounter(entryId, text, deleteCode, metadata = {}) {
        await requireFirebaseUser();
        const deleteCodeHash = await hashDeleteCode(deleteCode);
        const committed = await commitCombatEncounterCallable({
          entryId,
          text,
          deleteCodeHash,
          metadata: cloneSerializableValue(normalizeCommentModuleInsertForFirestore(metadata))
        });
        return committed.data;
      },
      async undoMechanicalComment(entryId, commentId, options = {}) {
        await requireFirebaseUser();
        const result = await commitUndoMechanicalCommentCallable({ entryId, commentId, force: options.force === true });
        return result.data;
      },
      async resetCombatParticipants(participants) {
        await requireFirebaseUser();
        const result = await commitResetCombatParticipantsCallable({ participants });
        return result.data;
      },
      async addHerausforderung(entryId, text, deleteCode, metadata = {}) {
        await requireFirebaseUser();
        const deleteCodeHash = await hashDeleteCode(deleteCode);
        const committed = await commitHerausforderungCallable({
          entryId,
          text,
          deleteCodeHash,
          metadata: cloneSerializableValue(normalizeCommentModuleInsertForFirestore(metadata))
        });
        return committed.data;
      },
      async addCombatComment(entryId, charName, charTitle, portrait, text, deleteCode, narrator, metadata = {}) {
        await requireFirebaseUser();
        const deleteCodeHash = await hashDeleteCode(deleteCode);
        const committed = await commitCombatCommentCallable({
          entryId,
          charName,
          charTitle,
          portrait,
          text,
          deleteCodeHash,
          narrator: narrator === true,
          metadata: cloneSerializableValue(compactMechanicalMetadata(normalizeCommentModuleInsertForFirestore(metadata)))
        });
        try {
          const combatNarrations = typeof window.AleriaCombat?.narrateCommittedMechanics === 'function'
            ? await window.AleriaCombat.narrateCommittedMechanics(committed.data?.mechanics || {})
            : [];
          const skillNarrations = typeof window.AleriaSkillChecks?.narrateCommittedMechanics === 'function'
            ? await window.AleriaSkillChecks.narrateCommittedMechanics(committed.data?.mechanics || {})
            : [];
          const narrations = [...combatNarrations, ...skillNarrations];
          if (narrations.length) {
            await finalizeCombatNarrationCallable({ commentId: committed.data.id, narrations });
          }
        } catch (narrationError) {
          console.warn('combat narration finalization failed after committed mechanics:', narrationError);
          notifyAppStatus('Der Kampfzustand ist sicher gespeichert; nur die erzählerische Auswertung konnte noch nicht ergänzt werden.', 'error');
          committed.data.narrationPending = true;
        }
        return committed.data;


      },
      async addSkillComment(entryId, charName, charTitle, portrait, text, deleteCode, narrator, metadata = {}) {
        await requireFirebaseUser();
        const deleteCodeHash = await hashDeleteCode(deleteCode);
        const committed = await commitSkillCommentCallable({
          entryId,
          charName,
          charTitle,
          portrait,
          text,
          deleteCodeHash,
          narrator: narrator === true,
          metadata: cloneSerializableValue(compactMechanicalMetadata(normalizeCommentModuleInsertForFirestore(metadata)))
        });
        try {
          const narrations = typeof window.AleriaSkillChecks?.narrateCommittedMechanics === 'function'
            ? await window.AleriaSkillChecks.narrateCommittedMechanics(committed.data?.mechanics || {})
            : [];
          if (narrations.length) await finalizeCombatNarrationCallable({ commentId: committed.data.id, narrations });
        } catch (narrationError) {
          console.warn('skill narration finalization failed after committed mechanics:', narrationError);
          notifyAppStatus('Die Fertigkeitsauswertung ist sicher gespeichert; nur ihre Erz\u00e4hlung konnte noch nicht erg\u00e4nzt werden.', 'error');
          committed.data.narrationPending = true;
        }
        return committed.data;
      },
      async addSceneTransition(sourceThreadId, targetThreadId, text, deleteCode, metadata = {}) {
        await requireFirebaseUser();
        const deleteCodeHash = await hashDeleteCode(deleteCode);
        const committed = await commitNarrativeCommentCallable({
          entryIds: [sourceThreadId, targetThreadId],
          charName: 'Erzähler',
          charTitle: '',
          portrait: null,
          text,
          deleteCodeHash,
          narrator: true,
          metadata: cloneSerializableValue({
            commentMode: 'scene-transition',
            commentKind: 'scene-transition-event',
            sceneTransition: metadata.sceneTransition
          })
        });
        return committed.data;
      },
      async deleteSceneTransition(docId, transitionId, deleteCode) {
        await requireFirebaseUser();
        const selectedRef = doc(db, 'comments', String(docId || ''));
        const selected = await getDoc(selectedRef);
        if (!selected.exists()) throw new Error('Nicht gefunden');
        if (!(await isMatchingDeleteCode(selected.data(), deleteCode))) throw new Error('Falscher Code');
        const transitionQuery = query(
          collection(db, 'comments'),
          where('sceneTransition.transitionId', '==', String(transitionId || ''))
        );
        const matches = await getDocs(transitionQuery);
        const batch = writeBatch(db);
        matches.docs.forEach(item => batch.delete(item.ref));
        await batch.commit();
      },
      async deleteCommentsWithoutCode(commentIds) {
        await requireFirebaseUser();
        const ids = [...new Set((Array.isArray(commentIds) ? commentIds : []).map(id => String(id || '').trim()).filter(Boolean))];
        let deleted = 0;
        for (let index = 0; index < ids.length; index += 400) {
          const chunk = ids.slice(index, index + 400);
          const batch = writeBatch(db);
          chunk.forEach(id => batch.delete(doc(db, 'comments', id)));
          await batch.commit();
          deleted += chunk.length;
        }
        return { deleted };
      },
      async loadCommentTurn(threadId) {
        try {
          const snap = await getDoc(doc(db, 'comment_turns', String(threadId || '')));
          return snap.exists() ? snap.data() : null;
        } catch(e) {
          console.error('loadCommentTurn error:', e);
          notifyAppStatus(getFirebaseErrorMessage(e, 'Redestab-Status konnte nicht geladen werden.'));
          return null;
        }
      },
      subscribeCommentTurn(threadId, onNext, onError) {
        const ref = doc(db, 'comment_turns', String(threadId || ''));
        return onSnapshot(ref, snap => {
          onNext(snap.exists() ? snap.data() : null);
        }, error => {
          console.error('subscribeCommentTurn error:', error);
          notifyAppStatus(getFirebaseErrorMessage(error, 'Redestab-Status konnte nicht verbunden werden.'));
          if (onError) onError(error);
        });
      },
      async saveCommentTurn(threadId, current) {
        const user = await requireFirebaseUser();
        const value = ['erdi', 'patrick', 'ended'].includes(String(current || '')) ? String(current) : '';
        return setDoc(doc(db, 'comment_turns', String(threadId || '')), {
          threadId: String(threadId || ''),
          current: value,
          updatedBy: user.uid,
          updatedAt: serverTimestamp()
        }, { merge: true });
      },
      async deleteComment(docId, deleteCode) {
        await requireFirebaseUser();
        const { getDoc, deleteDoc, doc } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js");
        const ref  = doc(db, 'comments', docId);
        const snap = await getDoc(ref);
        if (!snap.exists()) throw new Error('Nicht gefunden');
        if (!(await isMatchingDeleteCode(snap.data(), deleteCode))) throw new Error('Falscher Code');
        assertCommentMutable(snap.data(), 'gelöscht');
        return deleteDoc(ref);
      },
      async loadCharacters() {
        try {
          const q = query(collection(db, 'characters'), orderBy('name', 'asc'));
          const snap = await getDocs(q);
          return snap.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch(e) {
          console.error('loadCharacters error:', e);
          notifyAppStatus(getFirebaseErrorMessage(e, 'Charaktere konnten nicht geladen werden.'));
          return [];
        }
      },
      async loadCreatures() {
        try {
          const q = query(collection(db, 'creatures'), orderBy('name', 'asc'));
          const snap = await getDocs(q);
          return snap.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch(e) {
          console.error('loadCreatures error:', e);
          notifyAppStatus(getFirebaseErrorMessage(e, 'Kreaturen konnten nicht geladen werden.'));
          return [];
        }
      },
      async listPublishedFamilyRegistry() {
        const snap = await getDocs(collection(familyTreeDb, 'publishedRegistryNodes'));
        return snap.docs.map(item => ({ id: item.id, ...item.data() }));
      },
      async loadPublishedFamily(familyId) {
        const safeFamilyId = String(familyId || '').trim();
        if (!/^[a-z0-9-]{2,120}$/.test(safeFamilyId)) {
          throw new Error('Die Familien-ID ist ungültig.');
        }
        const published = await getDoc(doc(familyTreeDb, 'publishedFamilies', safeFamilyId));
        const activeReleaseId = published.exists() ? String(published.data().activeReleaseId || '') : '';
        if (!activeReleaseId) return null;
        const releaseRef = doc(familyTreeDb, 'publishedFamilies', safeFamilyId, 'releases', activeReleaseId);
        const release = await getDoc(releaseRef);
        if (!release.exists()) return null;
        const entries = await Promise.all(FAMILY_TREE_ENTITY_COLLECTIONS.map(async collectionName => {
          const snapshot = await getDocs(collection(releaseRef, collectionName));
          return [collectionName, snapshot.docs.map(item => item.data())];
        }));
        return {
          family: { ...release.data(), ...Object.fromEntries(entries) },
          releaseId: activeReleaseId,
          publishedAt: published.data().publishedAt?.toDate?.()?.toISOString?.() || ''
        };
      },
      async saveCharacter(id, data) {
        const user = await requireFirebaseUser();
        const { setDoc, doc, addDoc } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js");
        if (id) {
          const ref = doc(db, 'characters', id);
          const lockSnap = await getDoc(doc(db, 'combat_profile_locks', 'characters', 'records', id));
          if ((lockSnap.data()?.activeEncounterKeys || []).length) {
            throw new Error('Diese Figur nimmt gerade an einem aktiven Kampf teil, deshalb ist das Kampfprofil gesperrt. Beende den Kampf zuerst über die Kampfliste ("Kampf beenden"), um den Bogen wieder speichern zu können.');
          }
          const { ownerUid: ignoredOwnerUid, createdBy: ignoredCreatedBy, ...safeData } = data || {};
          void ignoredOwnerUid;
          void ignoredCreatedBy;
          await setDoc(ref, safeData, { merge: true });
          return id;
        } else {
          const ref = await addDoc(collection(db, 'characters'), {
            ...(data || {}),
            ownerUid: user.uid,
            createdBy: user.uid
          });
          return ref.id;
        }
      },
      async deleteCharacter(id) {
        await requireFirebaseUser();
        const { deleteDoc, doc } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js");
        return deleteDoc(doc(db, 'characters', id));
      },
      async loadCharTabs() {
        try {
          const snap = await getDocs(collection(db, 'char_tabs'));
          if (snap.empty) return null;
          // There's only one doc: 'config'
          const d = snap.docs.find(x => x.id === 'config');
          return d ? d.data() : null;
        } catch(e) {
          console.error('loadCharTabs:', e);
          notifyAppStatus(getFirebaseErrorMessage(e, 'Charakter-Reiter konnten nicht geladen werden.'));
          return null;
        }
      },
      async verifyCommentCode(docId, code) {
        // Returns the comment data if code matches, throws otherwise
        const { getDoc, doc } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js");
        const snap = await getDoc(doc(db, 'comments', docId));
        if (!snap.exists()) throw new Error('Nicht gefunden');
        if (!(await isMatchingDeleteCode(snap.data(), code))) throw new Error('Falscher Code');
        return { id: snap.id, ...snap.data() };
      },
      async updateComment(docId, updates) {
        await requireFirebaseUser();
        const nowClient = Date.now();
        const safeUpdates = normalizeCommentModuleInsertForFirestore(updates);
        const ref = doc(db, 'comments', docId);
        await runTransaction(db, async transaction => {
          const snapshot = await transaction.get(ref);
          if (!snapshot.exists()) throw new Error('Nicht gefunden');
          assertCommentMutable(snapshot.data(), 'bearbeitet');
          transaction.set(ref, {
            ...safeUpdates,
            updatedAtClient: nowClient,
            activityAtClient: nowClient,
            updatedAt: serverTimestamp(),
            activityAt: serverTimestamp()
          }, { merge: true });
        });
      },
      async loadRecentComments(n) {
        try {
          const { getDocs, collection } = await import(
            "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js"
          );
          const take = Math.max(0, Number(n) || 0);
          if (!take) return [];
          // Legacy imports can store ts as Timestamp, plain object, or string.
          // Firestore ordering across mixed field types is not a reliable activity order.
          const snap = await getDocs(collection(db, 'comments'));
          return sortCommentsByRecentActivity(snap.docs.map(d => ({ id: d.id, ...d.data() }))).slice(0, take);
        } catch(e) {
          console.error('loadRecentComments:', e);
          notifyAppStatus(getFirebaseErrorMessage(e, 'Letzte Aktivitäten konnten nicht geladen werden.'));
          return [];
        }
      },
      async loadAllComments() {
        try {
          const snap = await getDocs(collection(db, 'comments'));
          return snap.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch(e) {
          console.error('loadAllComments:', e);
          notifyAppStatus(getFirebaseErrorMessage(e, 'Kommentare konnten nicht vollständig exportiert werden.'));
          throw e;
        }
      },
      async loadAllCommentTurns() {
        try {
          const snap = await getDocs(collection(db, 'comment_turns'));
          return snap.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch(e) {
          console.error('loadAllCommentTurns:', e);
          notifyAppStatus(getFirebaseErrorMessage(e, 'Redestab-Daten konnten nicht vollständig exportiert werden.'));
          throw e;
        }
      },
      async saveBackupComment(id, data) {
        const safeId = String(id || '').trim();
        if (!safeId) throw new Error('Kommentar ohne ID kann nicht importiert werden.');
        await this.importBackupRecords('comments', [{ id: safeId, ...normalizeCommentModuleInsertForFirestore(data) }]);
      },
      async importBackupRecords(kind, records) {
        await requireModerator();
        const allowed = new Set(['characters', 'creatures', 'comments', 'commentTurns']);
        if (!allowed.has(String(kind || ''))) throw new Error('Unbekannte Backup-Importart.');
        const list = Array.isArray(records) ? records : [];
        let imported = 0;
        for (let index = 0; index < list.length; index += 200) {
          const chunk = list.slice(index, index + 200);
          if (!chunk.length) continue;
          const result = await importBackupRecordsCallable({ kind, records: cloneSerializableValue(chunk) });
          imported += Number(result.data?.imported || 0);
        }
        return { kind, imported };
      },
      async saveCreature(id, data) {
        const user = await requireFirebaseUser();
        if (id) {
          const ref = doc(db, 'creatures', id);
          const { ownerUid: ignoredOwnerUid, createdBy: ignoredCreatedBy, ...safeData } = data || {};
          void ignoredOwnerUid;
          void ignoredCreatedBy;
          const existing = await getDoc(ref);
          const payload = existing.exists() ? safeData : { ...safeData, ownerUid: user.uid, createdBy: user.uid };
          await setDoc(ref, payload, { merge: true });
          return id;
        }
        const ref = await addDoc(collection(db, 'creatures'), {
          ...(data || {}),
          ownerUid: user.uid,
          createdBy: user.uid
        });
        return ref.id;
      },
      async deleteCreature(id) {
        await requireFirebaseUser();
        return deleteDoc(doc(db, 'creatures', id));
      },
      async transferCharacterInventories(giverId, giverInventory, receiverId, receiverInventory, threadId, sceneEvent, deleteCode) {
        await requireFirebaseUser();
        void giverInventory;
        void receiverInventory;
        const serverDeleteCodeHash = await hashDeleteCode(deleteCode);
        const committed = await commitInventoryTransferCallable({
          giverId,
          receiverId,
          entryId: threadId,
          sceneEvent: cloneSerializableValue(sceneEvent),
          deleteCodeHash: serverDeleteCodeHash
        });
        return committed.data;


      },
      async saveBackupCommentTurn(id, data) {
        const safeId = String(id || data?.threadId || '').trim();
        if (!safeId) throw new Error('Redestab-Datensatz ohne ID kann nicht importiert werden.');
        await this.importBackupRecords('commentTurns', [{ id: safeId, ...(data || {}) }]);
      },
      async saveCharTabs(data) {
        try {
          await requireSharedEditor();
          await setDoc(doc(db, 'char_tabs', 'config'), data || {});
        } catch(e) {
          console.error('saveCharTabs:', e);
          notifyAppStatus(getFirebaseErrorMessage(e, 'Charakter-Reiter konnten nicht gespeichert werden.'));
        }
      },
      async setCommentAdminCode(code) {
        await requireModerator();
        void code;
        throw new Error('Der gemeinsame Moderationscode wurde abgeschaltet. Moderation erfolgt über Firebase-Benutzerrollen.');
      },
      async loadModuleStore() {
        try {
          const snap = await getDoc(doc(db, MODULE_STORE_COLLECTION, MODULE_STORE_DOC));
          if (!snap.exists()) return null;
          const data = snap.data();
          let splitStore = null;
          try {
            splitStore = await loadSplitModuleStore(data);
          } catch(splitError) {
            console.warn('loadModuleStore split fallback:', splitError);
          }
          if (splitStore) return splitStore;
          if (typeof data?.moduleStoreData === 'string') return { data: data.moduleStoreData };
          return data?.moduleStore || null;
        } catch(e) {
          console.error('loadModuleStore:', e);
          notifyAppStatus(getFirebaseErrorMessage(e, 'Almanach-Module konnten nicht synchronisiert werden.'));
          return null;
        }
      },
      async saveModuleStore(data) {
        try {
          await requireSharedEditor();
          const normalized = normalizeFirebaseModuleStore(data);
          try {
            await saveSplitModuleStore(normalized);
            return;
          } catch(splitError) {
            console.warn('saveModuleStore split fallback:', splitError);
            notifyAppStatus('Split-Speicher nicht erreichbar. Modulstand wird im alten Format gespeichert.', 'error');
          }
          await setDoc(doc(db, MODULE_STORE_COLLECTION, MODULE_STORE_DOC), {
            moduleStoreData: JSON.stringify(normalized),
            moduleStore: null,
            moduleStoreManifest: null,
            moduleStoreType: 'almanach-module-store',
            moduleStoreMode: 'legacy',
            moduleStoreUpdatedAtClient: normalized.updatedAtClient,
            moduleStoreUpdatedAt: serverTimestamp()
          }, { merge: true });
        } catch(e) {
          console.error('saveModuleStore:', e);
          notifyAppStatus(getFirebaseErrorMessage(e, 'Almanach-Module konnten nicht online gespeichert werden.'));
          throw e;
        }
      },
      subscribeModuleStore(onNext, onError) {
        return onSnapshot(doc(db, MODULE_STORE_COLLECTION, MODULE_STORE_DOC), snap => {
          if (!snap.exists()) {
            onNext(null);
            return;
          }
          (async () => {
            try {
              const data = snap.data();
              let splitStore = null;
              try {
                splitStore = await loadSplitModuleStore(data);
              } catch(splitError) {
                console.warn('subscribeModuleStore split fallback:', splitError);
              }
              if (splitStore) {
                onNext(splitStore);
                return;
              }
              onNext(typeof data?.moduleStoreData === 'string' ? { data: data.moduleStoreData } : (data?.moduleStore || null));
            } catch(error) {
              console.error('subscribeModuleStore load:', error);
              if (onError) onError(error);
            }
          })();
        }, error => {
          console.error('subscribeModuleStore:', error);
          notifyAppStatus(getFirebaseErrorMessage(error, 'Live-Synchronisation der Almanach-Module konnte nicht verbunden werden.'));
          if (onError) onError(error);
        });
      },
      async loadItemDatabase() {
        try {
          const snap = await getDoc(doc(db, ITEM_DATABASE_COLLECTION, ITEM_DATABASE_DOC));
          if (!snap.exists()) return null;
          const data = snap.data();
          try {
            const splitPayload = await loadSplitItemDatabase(data);
            if (splitPayload) return splitPayload;
          } catch(splitError) {
            console.warn('loadItemDatabase split fallback:', splitError);
          }
          return data?.payload && typeof data.payload === 'object' ? data.payload : null;
        } catch(e) {
          console.error('loadItemDatabase:', e);
          notifyAppStatus(getFirebaseErrorMessage(e, 'Item-Register konnte nicht geladen werden.'));
          return null;
        }
      },
      async saveItemDatabase(payload) {
        try {
          await requireSharedEditor();
          const safePayload = payload && typeof payload === 'object' ? payload : {};
          try {
            await saveSplitItemDatabase(safePayload);
            return;
          } catch(splitError) {
            console.warn('saveItemDatabase split fallback:', splitError);
            notifyAppStatus('Geteilte Item-Speicherung nicht erreichbar. Der bisherige Speicher wird weiterverwendet.', 'error');
          }
          await setDoc(doc(db, ITEM_DATABASE_COLLECTION, ITEM_DATABASE_DOC), {
            itemDatabaseType: 'almanach-item-database',
            schema: safePayload.schema || 'aleria-item-db-export-v1',
            updatedAtClient: Number(safePayload.updatedAtClient) || Date.now(),
            payload: safePayload,
            updatedAt: serverTimestamp()
          }, { merge: false });
        } catch(e) {
          console.error('saveItemDatabase:', e);
          notifyAppStatus(getFirebaseErrorMessage(e, 'Item-Register konnte nicht online gespeichert werden.'));
          throw e;
        }
      },
      subscribeItemDatabase(onNext, onError) {
        return onSnapshot(doc(db, ITEM_DATABASE_COLLECTION, ITEM_DATABASE_DOC), snap => {
          const data = snap.exists() ? snap.data() : null;
          (async () => {
            try {
              const splitPayload = await loadSplitItemDatabase(data);
              onNext(splitPayload || (data?.payload && typeof data.payload === 'object' ? data.payload : null));
            } catch(error) {
              console.error('subscribeItemDatabase split load:', error);
              if (onError) onError(error);
            }
          })();
        }, error => {
          console.error('subscribeItemDatabase:', error);
          notifyAppStatus(getFirebaseErrorMessage(error, 'Live-Synchronisation des Item-Registers konnte nicht verbunden werden.'));
          if (onError) onError(error);
        });
      }
    };

    window._fbAuth = Object.freeze({
      ready: authReady,
      getAccess: getFirebaseAccess,
      getIdToken: forceRefresh => authSession.getIdToken(forceRefresh)
    });

    // Signal that Firebase is ready
    window._fbReady = true;
    window.dispatchEvent(new Event('fb-ready'));
