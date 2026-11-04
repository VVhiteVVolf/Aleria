// Per-browser read markers for interactive scene threads.
const SCENE_READ_STATE_PREFIX = 'aleria-scene-read-v1:';
const _sceneReadBaselines = new Map();
const _sceneReadTimers = new Map();

function getSceneReadBaseline(threadId) {
  const key = String(threadId || '');
  if (_sceneReadBaselines.has(key)) return _sceneReadBaselines.get(key);
  let value = 0;
  try { value = Number(localStorage.getItem(`${SCENE_READ_STATE_PREFIX}${key}`)) || 0; } catch {}
  _sceneReadBaselines.set(key, value);
  return value;
}

function getSceneFirstUnreadCommentId(threadId, comments = []) {
  const baseline = getSceneReadBaseline(threadId);
  if (!baseline) return '';
  const visibleComments = globalThis.AleriaSceneRegenerationPolicy?.filterVisible(comments) || comments;
  const first = visibleComments.find((comment, index) => getCommentActivityMs(comment, index) > baseline);
  return String(first?.id || '');
}

function renderSceneUnreadDivider(threadId, comment, comments = []) {
  const firstUnreadId = getSceneFirstUnreadCommentId(threadId, comments);
  if (!firstUnreadId || String(comment?.id || '') !== firstUnreadId) return '';
  const visibleComments = globalThis.AleriaSceneRegenerationPolicy?.filterVisible(comments) || comments;
  const count = visibleComments.filter((item, index) => getCommentActivityMs(item, index) > getSceneReadBaseline(threadId)).length;
  return `<div class="scene-unread-divider" data-scene-unread-divider><span>${count} ${count === 1 ? 'neuer Beitrag' : 'neue Beiträge'} seit deinem letzten Besuch</span></div>`;
}

function scheduleSceneReadStateUpdate(threadId, comments = []) {
  const key = String(threadId || '');
  const visibleComments = globalThis.AleriaSceneRegenerationPolicy?.filterVisible(comments) || comments;
  if (!key || !visibleComments.length) return;
  clearTimeout(_sceneReadTimers.get(key));
  const latest = visibleComments.reduce((max, comment, index) => Math.max(max, getCommentActivityMs(comment, index)), 0);
  _sceneReadTimers.set(key, window.setTimeout(() => {
    try { localStorage.setItem(`${SCENE_READ_STATE_PREFIX}${key}`, String(latest)); } catch {}
  }, 1800));
}
