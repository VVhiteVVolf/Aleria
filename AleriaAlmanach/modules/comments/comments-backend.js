let _commentFallbackNoticeShown = false;
let _commentUseLocalFallback = false;

const COMMENT_FIREBASE_READY_TIMEOUT_MS = 4500;
const COMMENT_LOCAL_STORE_KEY = 'aleria-local-comments-v1';
const COMMENT_LOCAL_TURN_STORE_KEY = 'aleria-local-comment-turns-v1';

function readLocalCommentStore() {
  try {
    const raw = localStorage.getItem(COMMENT_LOCAL_STORE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (error) {
    console.warn('local comment store read failed:', error);
    return {};
  }
}

function writeLocalCommentStore(store) {
  localStorage.setItem(COMMENT_LOCAL_STORE_KEY, JSON.stringify(store || {}));
}

function readLocalCommentTurnStore() {
  try {
    const raw = localStorage.getItem(COMMENT_LOCAL_TURN_STORE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (error) {
    console.warn('local comment turn store read failed:', error);
    return {};
  }
}

function writeLocalCommentTurnStore(store) {
  localStorage.setItem(COMMENT_LOCAL_TURN_STORE_KEY, JSON.stringify(store || {}));
}

function makeLocalCommentId() {
  const random = Math.random().toString(36).slice(2, 8);
  return `local-${Date.now().toString(36)}-${random}`;
}

function makeLocalTimestamp() {
  return { seconds: Math.floor(Date.now() / 1000), local: true };
}

function assertLocalCommentMutable(comment, operation) {
  const policy = window.AleriaCommentTransactions;
  if (!policy?.assertMutable) throw new Error('Der Schutz mechanischer Beiträge ist nicht geladen.');
  return policy.assertMutable(comment, operation);
}

function normalizeCommentModuleInsertForStorage(source = {}) {
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

function makeLocalSceneTransitionComment(entryId, text, deleteCode, metadata, nowClient) {
  return {
    id: makeLocalCommentId(),
    entryId,
    charName: 'Erzähler',
    charTitle: '',
    portrait: null,
    text,
    deleteCode: String(deleteCode || '').trim().toUpperCase(),
    narrator: true,
    commentMode: 'scene-transition',
    commentKind: 'scene-transition-event',
    sceneTransition: metadata.sceneTransition,
    orderKey: nowClient,
    createdAtClient: nowClient,
    activityAtClient: nowClient,
    ts: makeLocalTimestamp(),
    schemaVersion: 2,
    localOnly: true
  };
}

function getLocalCommentBackend() {
  return {
    _localFallback: true,
    async loadComments(entryId) {
      const store = readLocalCommentStore();
      return sortCommentsByTimeline(store[String(entryId || '')] || []);
    },
    async addComment(entryId, charName, charTitle, portrait, text, deleteCode, narrator, metadata = {}) {
      const key = String(entryId || '');
      const store = readLocalCommentStore();
      const comments = Array.isArray(store[key]) ? store[key] : [];
      const nowClient = Date.now();
      const commentMetadata = normalizeCommentModuleInsertForStorage(metadata);
      comments.push({
        id: makeLocalCommentId(),
        entryId: key,
        charName,
        charTitle,
        portrait,
        text,
        deleteCode: String(deleteCode || '').trim().toUpperCase(),
        narrator: !!narrator,
        characterId: commentMetadata.characterId || '',
        actorType: commentMetadata.actorType || '',
        creatureId: commentMetadata.creatureId || '',
        emoteIndex: Number.isInteger(commentMetadata.emoteIndex) ? commentMetadata.emoteIndex : null,
        imageSetId: String(commentMetadata.imageSetId || '').slice(0, 48),
        avatarKind: commentMetadata.avatarKind || '',
        commentMode: commentMetadata.commentMode || (narrator ? 'narrator' : 'character'),
        commentKind: ['scene-time-event', 'scene-rest-event'].includes(commentMetadata.commentKind)
          ? commentMetadata.commentKind
          : normalizeCommentKind(commentMetadata.commentKind, narrator),
        commentSegments: Array.isArray(commentMetadata.commentSegments) ? commentMetadata.commentSegments : null,
        itemShowcase: commentMetadata.itemShowcase && typeof commentMetadata.itemShowcase === 'object' ? commentMetadata.itemShowcase : null,
        moduleInsert: null,
        moduleInsertJson: commentMetadata.moduleInsertJson || '',
        documentAttachment: commentMetadata.documentAttachment && typeof commentMetadata.documentAttachment === 'object' ? commentMetadata.documentAttachment : null,
        sceneTimeEvent: commentMetadata.sceneTimeEvent && typeof commentMetadata.sceneTimeEvent === 'object' ? commentMetadata.sceneTimeEvent : null,
        sceneTransition: commentMetadata.sceneTransition && typeof commentMetadata.sceneTransition === 'object' ? commentMetadata.sceneTransition : null,
        scenePoll: commentMetadata.scenePoll && typeof commentMetadata.scenePoll === 'object' ? commentMetadata.scenePoll : null,
        sceneDiceRoll: commentMetadata.sceneDiceRoll && typeof commentMetadata.sceneDiceRoll === 'object' ? commentMetadata.sceneDiceRoll : null,
        sceneRest: commentMetadata.sceneRest && typeof commentMetadata.sceneRest === 'object' ? commentMetadata.sceneRest : null,
        combatEncounter: commentMetadata.combatEncounter && typeof commentMetadata.combatEncounter === 'object' ? commentMetadata.combatEncounter : null,
        encounterTransaction: commentMetadata.encounterTransaction && typeof commentMetadata.encounterTransaction === 'object' ? commentMetadata.encounterTransaction : null,
        restTransaction: commentMetadata.restTransaction && typeof commentMetadata.restTransaction === 'object' ? commentMetadata.restTransaction : null,
        combatAction: commentMetadata.combatAction && typeof commentMetadata.combatAction === 'object' ? commentMetadata.combatAction : null,
        combatResolution: commentMetadata.combatResolution && typeof commentMetadata.combatResolution === 'object' ? commentMetadata.combatResolution : null,
        combatTransaction: commentMetadata.combatTransaction && typeof commentMetadata.combatTransaction === 'object' ? commentMetadata.combatTransaction : null,
        combatRecoveryDayKey: String(commentMetadata.combatRecoveryDayKey || ''),
        inventoryTransaction: commentMetadata.inventoryTransaction && typeof commentMetadata.inventoryTransaction === 'object' ? commentMetadata.inventoryTransaction : null,
        orderKey: Number.isFinite(Number(commentMetadata.orderKey)) ? Number(commentMetadata.orderKey) : Date.now(),
        createdAtClient: nowClient,
        activityAtClient: nowClient,
        ts: makeLocalTimestamp(),
        schemaVersion: 2,
        localOnly: true
      });
      store[key] = comments;
      writeLocalCommentStore(store);
      return { id: comments[comments.length - 1].id };
    },
    async addSceneRest(entryId, text, deleteCode, metadata = {}) {
      throw new Error('Rasten verändern verbindlichen Szenenzustand und benötigen eine Online-Verbindung.');
    },
    async addCombatEncounter() {
      throw new Error('Kampfankündigungen verändern verbindlichen Szenenzustand und benötigen eine Online-Verbindung.');
    },
    async addCombatComment(entryId, charName, charTitle, portrait, text, deleteCode, narrator, metadata = {}) {
      throw new Error('Kampfhandlungen verändern verbindlichen Zustand und benötigen eine Online-Verbindung. Der Entwurf bleibt lokal erhalten.');
    },
    async addSkillComment(entryId, charName, charTitle, portrait, text, deleteCode, narrator, metadata = {}) {
      throw new Error('Fertigkeitsauswertungen müssen serverseitig geprüft werden und benötigen eine Online-Verbindung. Der Entwurf bleibt lokal erhalten.');
    },
    async addSceneTransition(sourceThreadId, targetThreadId, text, deleteCode, metadata = {}) {
      const store = readLocalCommentStore();
      const nowClient = Date.now();
      new Set([sourceThreadId, targetThreadId].map(threadId => String(threadId || '').trim()).filter(Boolean)).forEach(threadId => {
        const key = String(threadId || '');
        const comments = Array.isArray(store[key]) ? store[key] : [];
        comments.push(makeLocalSceneTransitionComment(key, text, deleteCode, metadata, nowClient));
        store[key] = comments;
      });
      writeLocalCommentStore(store);
    },
    async deleteSceneTransition(docId, transitionId, deleteCode) {
      await this.verifyCommentCode(docId, deleteCode);
      const store = readLocalCommentStore();
      Object.keys(store).forEach(key => {
        store[key] = (store[key] || []).filter(comment => (
          String(comment?.sceneTransition?.transitionId || '') !== String(transitionId || '')
        ));
      });
      writeLocalCommentStore(store);
    },
    async loadCommentTurn(threadId) {
      const turns = readLocalCommentTurnStore();
      return turns[String(threadId || '')] || null;
    },
    async saveCommentTurn(threadId, current) {
      const key = String(threadId || '');
      const value = ['erdi', 'patrick', 'ended'].includes(String(current || '')) ? String(current) : '';
      const turns = readLocalCommentTurnStore();
      turns[key] = { ...(turns[key] || {}), threadId: key, current: value, updatedAt: makeLocalTimestamp(), localOnly: true };
      writeLocalCommentTurnStore(turns);
    },
    async verifyCommentCode(docId, code) {
      const normalized = String(code || '').trim().toUpperCase();
      const store = readLocalCommentStore();
      for (const comments of Object.values(store)) {
        const found = (comments || []).find(comment => comment.id === docId);
        if (!found) continue;
        if (normalized === COMMENT_DELETE_CODE) return { ...found };
        if (String(found.deleteCode || '').toUpperCase() !== normalized) throw new Error('Falscher Code');
        return { ...found };
      }
      throw new Error('Nicht gefunden');
    },
    async updateComment(docId, updates) {
      const store = readLocalCommentStore();
      const safeUpdates = normalizeCommentModuleInsertForStorage(updates);
      let updated = false;
      Object.keys(store).forEach(key => {
        store[key] = (store[key] || []).map(comment => {
          if (comment.id !== docId) return comment;
          assertLocalCommentMutable(comment, 'bearbeitet');
          updated = true;
          const nowClient = Date.now();
          return {
            ...comment,
            ...safeUpdates,
            editedAt: makeLocalTimestamp(),
            updatedAtClient: nowClient,
            activityAtClient: nowClient,
            localOnly: true
          };
        });
      });
      if (!updated) throw new Error('Nicht gefunden');
      writeLocalCommentStore(store);
    },
    async deleteComment(docId, deleteCode) {
      const comment = await this.verifyCommentCode(docId, deleteCode);
      assertLocalCommentMutable(comment, 'gelöscht');
      const store = readLocalCommentStore();
      Object.keys(store).forEach(key => {
        store[key] = (store[key] || []).filter(comment => comment.id !== docId);
      });
      writeLocalCommentStore(store);
    },
    async loadRecentComments(n) {
      const store = readLocalCommentStore();
      const comments = Object.values(store).flat();
      const sorted = typeof sortCommentsByRecentActivity === 'function'
        ? sortCommentsByRecentActivity(comments)
        : comments.sort((a, b) => (b.ts?.seconds || 0) - (a.ts?.seconds || 0));
      return sorted.slice(0, Math.max(0, Number(n) || 0));
    },
    async loadAllComments() {
      return Object.values(readLocalCommentStore()).flat();
    },
    async loadAllCommentTurns() {
      return Object.entries(readLocalCommentTurnStore()).map(([id, data]) => ({ id, ...(data || {}) }));
    },
    async saveBackupComment(id, data) {
      const key = String(data?.entryId || '');
      if (!key) throw new Error('Kommentar ohne Eintrag kann nicht lokal importiert werden.');
      const store = readLocalCommentStore();
      const comments = (store[key] || []).filter(comment => comment.id !== id);
      comments.push({ ...normalizeCommentModuleInsertForStorage(data), id, localOnly: true });
      store[key] = comments;
      writeLocalCommentStore(store);
    },
    async saveBackupCommentTurn(id, data) {
      const key = String(id || data?.threadId || '');
      if (!key) throw new Error('Redestab-Datensatz ohne ID kann nicht lokal importiert werden.');
      const turns = readLocalCommentTurnStore();
      turns[key] = { ...(data || {}), id: key, threadId: String(data?.threadId || key), localOnly: true };
      writeLocalCommentTurnStore(turns);
    }
  };
}

function showCommentFallbackNotice() {
  _commentUseLocalFallback = true;
  if (_commentFallbackNoticeShown) return;
  _commentFallbackNoticeShown = true;
  if (typeof updateFirebaseSyncStatus === 'function') {
    updateFirebaseSyncStatus('offline', 'Kommentare nutzen lokalen Browser-Speicher.');
  }
  if (typeof showAppStatus === 'function') {
    showAppStatus('Firebase ist nicht erreichbar. Kommentare werden vorübergehend nur lokal in diesem Browser gespeichert.', 'error', { timeout: 9000 });
  }
}

async function getCommentBackend(options = {}) {
  if (_commentUseLocalFallback && !options.preferRemote) return getLocalCommentBackend();
  if (window._fb) return window._fb;
  const timeoutMs = Number.isFinite(options.timeoutMs) ? options.timeoutMs : COMMENT_FIREBASE_READY_TIMEOUT_MS;
  await Promise.race([
    new Promise(resolve => window.addEventListener('fb-ready', resolve, { once: true })),
    new Promise(resolve => setTimeout(resolve, timeoutMs))
  ]);
  if (window._fb) return window._fb;
  showCommentFallbackNotice();
  return getLocalCommentBackend();
}
