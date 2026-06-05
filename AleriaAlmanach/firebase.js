    import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
    import { getFirestore, collection, addDoc, getDocs, query, where, orderBy, limit, serverTimestamp, onSnapshot, doc, getDoc, setDoc, deleteDoc }
      from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

    const firebaseConfig = {
      apiKey: "AIzaSyCgSej0WkSlkfAlySKZAdCyu4JjTNZEnYg",
      authDomain: "aleriaprojekt.firebaseapp.com",
      projectId: "aleriaprojekt",
      storageBucket: "aleriaprojekt.firebasestorage.app",
      messagingSenderId: "377039244960",
      appId: "1:377039244960:web:27ab9971f25657224403c5"
    };

    const app = initializeApp(firebaseConfig);
    const db  = getFirestore(app);
    const MODULE_STORE_COLLECTION = 'char_tabs';
    const MODULE_STORE_DOC = 'config';
    const MODULE_STORE_ENTRY_COLLECTION = 'module_store_entries';
    const MODULE_STORE_SPLIT_FORMAT = 'split-v1';
    const COMMENT_ADMIN_CODE = '7777';

    function notifyAppStatus(message, type = 'error') {
      if (typeof window.showAppStatus === 'function') {
        window.showAppStatus(message, type);
      }
    }

    function getFirebaseErrorMessage(error, fallback) {
      const code = String(error?.code || '');
      if (code.includes('permission-denied')) return 'Keine Berechtigung. Prüfe bitte die Firestore-Regeln oder deinen Zugriff.';
      if (code.includes('unavailable')) return 'Verbindung zu Firebase nicht verfügbar. Bitte später erneut versuchen.';
      if (code.includes('resource-exhausted')) return 'Firebase-Limit erreicht. Bitte später erneut versuchen.';
      return fallback;
    }

    function normalizeFirebaseModuleStore(data) {
      return {
        version: data?.version || 1,
        updatedAtClient: Number(data?.updatedAtClient) || Date.now(),
        customSections: Array.isArray(data?.customSections) ? data.customSections : [],
        entryOverrides: data?.entryOverrides && typeof data.entryOverrides === 'object' ? data.entryOverrides : {}
      };
    }

    function getModuleEntryDocId(entryId) {
      return encodeURIComponent(String(entryId || '').trim()).replace(/\./g, '%2E');
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
                desc: String(section?.desc || '').trim()
              },
              sectionIndex,
              entryIndex,
              entry,
              updatedAtClient: normalized.updatedAtClient,
              schemaVersion: 1
            }
          });
        });
        return {
          key: String(section?.key || '').trim(),
          tab: String(section?.tab || '').trim(),
          desc: String(section?.desc || '').trim(),
          entryIds
        };
      }).filter(section => section.entryIds.length);

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
            entry: { ...entry, id: safeId },
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
        const entryId = String(data?.entryId || data?.entry?.id || '').trim();
        if (entryId) docsByEntryId.set(entryId, data);
      });

      const customSections = (Array.isArray(manifest.customSections) ? manifest.customSections : [])
        .map(section => ({
          key: String(section?.key || '').trim(),
          tab: String(section?.tab || section?.key || '').trim(),
          desc: String(section?.desc || '').trim(),
          entries: (Array.isArray(section?.entryIds) ? section.entryIds : [])
            .map(entryId => docsByEntryId.get(String(entryId || '').trim())?.entry)
            .filter(Boolean)
        }))
        .filter(section => section.entries.length);

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

    async function hashCommentAdminCode(code) {
      const normalized = String(code || '').trim().toUpperCase();
      if (!normalized) return '';
      if (!window.crypto?.subtle) {
        throw new Error('Sichere Code-Pruefung wird von diesem Browser nicht unterstuetzt.');
      }
      const bytes = new TextEncoder().encode(`aleria-comment-admin:v1:${normalized}`);
      const hash = await window.crypto.subtle.digest('SHA-256', bytes);
      return Array.from(new Uint8Array(hash), byte => byte.toString(16).padStart(2, '0')).join('');
    }

    async function isMatchingCommentAdminCode(code) {
      const normalized = String(code || '').trim().toUpperCase();
      if (!normalized) return false;
      if (normalized === COMMENT_ADMIN_CODE) return true;
      const snap = await getDoc(doc(db, MODULE_STORE_COLLECTION, MODULE_STORE_DOC));
      if (!snap.exists()) return false;
      const adminHash = String(snap.data()?.commentAdminCodeHash || '');
      return !!adminHash && adminHash === await hashCommentAdminCode(normalized);
    }

    async function isMatchingDeleteCode(data, code) {
      const normalized = String(code || '').trim().toUpperCase();
      if (!normalized) return false;
      if (await isMatchingCommentAdminCode(normalized)) return true;
      if (data?.deleteCodeHash) return data.deleteCodeHash === await hashDeleteCode(normalized);
      // Legacy comments created before hashing still carry a clear-text deleteCode.
      return data?.deleteCode === normalized;
    }

    // ── PUBLIC API used by the rest of the page ──────────────────────────────
    function getCommentTimestampMs(comment) {
      const seconds = Number(comment?.ts?.seconds);
      if (!Number.isFinite(seconds)) return null;
      const nanos = Number(comment?.ts?.nanoseconds || 0);
      return (seconds * 1000) + (Number.isFinite(nanos) ? nanos / 1000000 : 0);
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
        const deleteCodeHash = await hashDeleteCode(deleteCode);
        return addDoc(collection(db, 'comments'), {
          entryId, charName, charTitle, portrait, text,
          deleteCodeHash, deleteCodeVersion: 1,
          narrator: narrator || false,
          characterId: metadata.characterId || '',
          emoteIndex: Number.isInteger(metadata.emoteIndex) ? metadata.emoteIndex : null,
          avatarKind: metadata.avatarKind || '',
          commentMode: metadata.commentMode || (narrator ? 'narrator' : 'character'),
          commentKind: metadata.commentKind || (narrator ? 'narrator' : 'speech'),
          commentSegments: Array.isArray(metadata.commentSegments) ? metadata.commentSegments : null,
          itemShowcase: metadata.itemShowcase && typeof metadata.itemShowcase === 'object' ? metadata.itemShowcase : null,
          documentAttachment: metadata.documentAttachment && typeof metadata.documentAttachment === 'object' ? metadata.documentAttachment : null,
          orderKey: Number.isFinite(Number(metadata.orderKey)) ? Number(metadata.orderKey) : Date.now(),
          schemaVersion: 2,
          ts: serverTimestamp()
        });
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
        const value = ['erdi', 'patrick', 'ended'].includes(String(current || '')) ? String(current) : '';
        return setDoc(doc(db, 'comment_turns', String(threadId || '')), {
          threadId: String(threadId || ''),
          current: value,
          updatedAt: serverTimestamp()
        }, { merge: true });
      },
      async deleteComment(docId, deleteCode) {
        const { getDoc, deleteDoc, doc } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js");
        const ref  = doc(db, 'comments', docId);
        const snap = await getDoc(ref);
        if (!snap.exists()) throw new Error('Nicht gefunden');
        if (!(await isMatchingDeleteCode(snap.data(), deleteCode))) throw new Error('Falscher Code');
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
      async saveCharacter(id, data) {
        const { setDoc, doc, addDoc } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js");
        if (id) {
          const ref = doc(db, 'characters', id);
          await setDoc(ref, data, { merge: true });
          return id;
        } else {
          const ref = await addDoc(collection(db, 'characters'), data);
          return ref.id;
        }
      },
      async deleteCharacter(id) {
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
        const { setDoc, doc } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js");
        await setDoc(doc(db, 'comments', docId), updates, { merge: true });
      },
      async loadRecentComments(n) {
        try {
          const { getDocs, collection, query, orderBy, limit } = await import(
            "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js"
          );
          const q = query(
            collection(db, 'comments'),
            orderBy('ts', 'desc'),
            limit(Math.max(0, Number(n) || 0))
          );
          const snap = await getDocs(q);
          return snap.docs
            .map(d => ({ id: d.id, ...d.data() }));
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
        await setDoc(doc(db, 'comments', safeId), data || {}, { merge: true });
      },
      async saveBackupCommentTurn(id, data) {
        const safeId = String(id || data?.threadId || '').trim();
        if (!safeId) throw new Error('Redestab-Datensatz ohne ID kann nicht importiert werden.');
        await setDoc(doc(db, 'comment_turns', safeId), data || {}, { merge: true });
      },
      async saveCharTabs(data) {
        try {
          await setDoc(doc(db, 'char_tabs', 'config'), data || {});
        } catch(e) {
          console.error('saveCharTabs:', e);
          notifyAppStatus(getFirebaseErrorMessage(e, 'Charakter-Reiter konnten nicht gespeichert werden.'));
        }
      },
      async setCommentAdminCode(code) {
        const commentAdminCodeHash = await hashCommentAdminCode(code);
        if (!commentAdminCodeHash) return;
        await setDoc(doc(db, MODULE_STORE_COLLECTION, MODULE_STORE_DOC), {
          commentAdminCodeHash,
          commentAdminCodeVersion: 1,
          commentAdminCodeUpdatedAt: serverTimestamp()
        }, { merge: true });
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
      }
    };

    // Signal that Firebase is ready
    window._fbReady = true;
    window.dispatchEvent(new Event('fb-ready'));
