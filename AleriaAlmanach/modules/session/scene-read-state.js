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

function getSceneUnreadSummary(threadId, comments = []) {
  const baseline = getSceneReadBaseline(threadId);
  const summary = { firstUnreadId: '', count: 0 };
  if (!baseline) return summary;
  const visibleComments = globalThis.AleriaSceneRegenerationPolicy?.filterVisible(comments) || comments;
  visibleComments.forEach((comment, index) => {
    if (!(getCommentActivityMs(comment, index) > baseline)) return;
    if (!summary.count) summary.firstUnreadId = String(comment?.id || '');
    summary.count += 1;
  });
  return summary;
}

function getSceneFirstUnreadCommentId(threadId, comments = []) {
  return getSceneUnreadSummary(threadId, comments).firstUnreadId;
}

function renderSceneUnreadDivider(threadId, comment, comments = [], unread = null) {
  const { firstUnreadId, count } = unread || getSceneUnreadSummary(threadId, comments);
  if (!firstUnreadId || String(comment?.id || '') !== firstUnreadId) return '';
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
