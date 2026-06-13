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
      comments.push({
        id: makeLocalCommentId(),
        entryId: key,
        charName,
        charTitle,
        portrait,
        text,
        deleteCode: String(deleteCode || '').trim().toUpperCase(),
        narrator: !!narrator,
        characterId: metadata.characterId || '',
        emoteIndex: Number.isInteger(metadata.emoteIndex) ? metadata.emoteIndex : null,
        avatarKind: metadata.avatarKind || '',
        commentMode: metadata.commentMode || (narrator ? 'narrator' : 'character'),
        commentKind: normalizeCommentKind(metadata.commentKind, narrator),
        commentSegments: Array.isArray(metadata.commentSegments) ? metadata.commentSegments : null,
        itemShowcase: metadata.itemShowcase && typeof metadata.itemShowcase === 'object' ? metadata.itemShowcase : null,
        documentAttachment: metadata.documentAttachment && typeof metadata.documentAttachment === 'object' ? metadata.documentAttachment : null,
        orderKey: Number.isFinite(Number(metadata.orderKey)) ? Number(metadata.orderKey) : Date.now(),
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
    async loadCommentTurn(threadId) {
      const turns = readLocalCommentTurnStore();
      return turns[String(threadId || '')] || null;
    },
    async saveCommentTurn(threadId, current) {
      const key = String(threadId || '');
      const value = ['erdi', 'patrick', 'ended'].includes(String(current || '')) ? String(current) : '';
      const turns = readLocalCommentTurnStore();
      turns[key] = { threadId: key, current: value, updatedAt: makeLocalTimestamp(), localOnly: true };
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
      let updated = false;
      Object.keys(store).forEach(key => {
        store[key] = (store[key] || []).map(comment => {
          if (comment.id !== docId) return comment;
          updated = true;
          const nowClient = Date.now();
          return {
            ...comment,
            ...updates,
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
      await this.verifyCommentCode(docId, deleteCode);
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
      comments.push({ ...(data || {}), id, localOnly: true });
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
