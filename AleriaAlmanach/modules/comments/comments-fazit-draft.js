// Local draft persistence for the Fazit block editor. Storage keys are isolated per
// scene and per new/edit form so drafts never overwrite ordinary comment drafts.
const FAZIT_DRAFT_PREFIX = 'aleria-fazit-draft:';
const FAZIT_DRAFT_VERSION = 1;
const FAZIT_DRAFT_MAX_AGE_DAYS = 30;

function getFazitDraftKey(threadId, commentId = '') {
  const safeThreadId = String(threadId || '').trim();
  if (!safeThreadId) return '';
  const scope = String(commentId || '').trim() || 'new';
  return `${FAZIT_DRAFT_PREFIX}${safeThreadId}:${scope}`;
}

function readFazitDraft(threadId, commentId = '') {
  if (typeof localStorage === 'undefined') return null;
  const key = getFazitDraftKey(threadId, commentId);
  if (!key) return null;
  try {
    const draft = JSON.parse(localStorage.getItem(key) || 'null');
    if (!draft || draft.version !== FAZIT_DRAFT_VERSION || !draft.snapshot) return null;
    return draft;
  } catch (error) {
    console.warn('fazit draft restore failed:', error);
    return null;
  }
}

function writeFazitDraft(threadId, commentId, snapshot) {
  if (typeof localStorage === 'undefined') return false;
  const key = getFazitDraftKey(threadId, commentId);
  if (!key) return false;
  try {
    localStorage.setItem(key, JSON.stringify({
      version: FAZIT_DRAFT_VERSION,
      savedAt: Date.now(),
      snapshot
    }));
    return true;
  } catch (error) {
    console.warn('fazit draft save failed:', error);
    return false;
  }
}

function removeFazitDraft(threadId, commentId = '') {
  if (typeof localStorage === 'undefined') return false;
  const key = getFazitDraftKey(threadId, commentId);
  if (!key) return false;
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.warn('fazit draft clear failed:', error);
    return false;
  }
}

function cleanupOldFazitDrafts(maxAgeDays = FAZIT_DRAFT_MAX_AGE_DAYS) {
  if (typeof localStorage === 'undefined') return 0;
  const maxAgeMs = Math.max(1, Number(maxAgeDays) || FAZIT_DRAFT_MAX_AGE_DAYS) * 86400000;
  const now = Date.now();
  let removed = 0;
  try {
    for (let index = localStorage.length - 1; index >= 0; index -= 1) {
      const key = localStorage.key(index);
      if (!key?.startsWith(FAZIT_DRAFT_PREFIX)) continue;
      const draft = JSON.parse(localStorage.getItem(key) || 'null');
      if (!draft?.savedAt || now - Number(draft.savedAt) > maxAgeMs) {
        localStorage.removeItem(key);
        removed += 1;
      }
    }
  } catch (error) {
    console.warn('fazit draft cleanup failed:', error);
  }
  return removed;
}
