const ALMANACH_DASHBOARD_SCENE_ACTIVITY_MAX_AGE_MS = 30_000;

let _almanachDashboardSceneComments = [];
let _almanachDashboardSceneActivity = new Map();
let _almanachDashboardSceneActivityStatus = 'idle';
let _almanachDashboardSceneActivityLoadedAt = 0;
let _almanachDashboardSceneActivityRequest = null;

function getAlmanachDashboardCommentActivityMs(comment, fallbackIndex = 0) {
  if (typeof getCommentActivityMs === 'function') {
    return getCommentActivityMs(comment, fallbackIndex);
  }

  const candidates = [
    comment?.activityAtClient,
    comment?.updatedAtClient,
    comment?.activityAt,
    comment?.updatedAt,
    comment?.editedAt,
    comment?.createdAtClient,
    comment?.ts,
    comment?.createdAt
  ];
  for (const value of candidates) {
    if (Number.isFinite(Number(value))) return Number(value);
    if (typeof value?.toMillis === 'function') return value.toMillis();
    if (Number.isFinite(Number(value?.seconds))) return Number(value.seconds) * 1000;
    const parsed = Date.parse(String(value || ''));
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallbackIndex;
}

function getAlmanachDashboardSceneThreads(entry) {
  if (!entry?.id) return [];
  return (Array.isArray(entry.pages) ? entry.pages : []).flatMap((page, pageIndex) => {
    if (!page?.sessionPage) return [];
    const pageKey = typeof getPageCommentThreadKey === 'function'
      ? getPageCommentThreadKey(page, pageIndex)
      : String(page?.commentThreadKey || pageIndex);
    const threadId = typeof getSessionThreadId === 'function'
      ? getSessionThreadId(entry.id, pageKey)
      : `${entry.id}::session:${pageKey}`;
    return [{ threadId, pageIndex }];
  });
}

function getAlmanachDashboardCommentSpeaker(comment = {}) {
  const segments = Array.isArray(comment.commentSegments) ? comment.commentSegments : [];
  const segment = [...segments].reverse().find(item => item?.text || item?.charName || item?.name) || null;
  return {
    name: String(segment?.charName || segment?.name || comment.charName || (comment.narrator ? 'Erzähler' : 'Unbekannt')).trim(),
    portrait: String(segment?.portrait || comment.portrait || '').trim(),
    text: String(segment?.text || comment.text || '').trim()
  };
}

function cleanAlmanachDashboardCommentExcerpt(value) {
  return String(value || '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/\|\|(.*?)\|\|/g, '$1')
    .replace(/\[.*?\](.*?)\[\/.*?\]/g, '$1')
    .replace(/\{tip:.*?\}(.*?)\{\/tip\}/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildAlmanachDashboardSceneActivity(sections = [], comments = []) {
  const commentsByThread = new Map();
  (Array.isArray(comments) ? comments : []).forEach((comment, index) => {
    const threadId = String(comment?.entryId || '').trim();
    if (!threadId) return;
    const list = commentsByThread.get(threadId) || [];
    list.push({ comment, activityAt: getAlmanachDashboardCommentActivityMs(comment, index) });
    commentsByThread.set(threadId, list);
  });

  const activityByEntry = new Map();
  const seen = new Set();
  sections.forEach(section => {
    (Array.isArray(section?.entries) ? section.entries : []).forEach(entry => {
      const entryId = String(entry?.id || '').trim();
      if (!entryId || seen.has(entryId)) return;
      seen.add(entryId);

      const threadComments = getAlmanachDashboardSceneThreads(entry).flatMap(thread => (
        (commentsByThread.get(thread.threadId) || []).map(item => ({ ...item, ...thread }))
      ));
      if (!threadComments.length) return;

      threadComments.sort((left, right) => right.activityAt - left.activityAt);
      const latest = threadComments[0];
      const speaker = getAlmanachDashboardCommentSpeaker(latest.comment);
      activityByEntry.set(entryId, {
        entryId,
        threadId: latest.threadId,
        pageIndex: latest.pageIndex,
        commentCount: threadComments.length,
        activityAt: latest.activityAt,
        authorName: speaker.name,
        authorPortrait: speaker.portrait,
        excerpt: cleanAlmanachDashboardCommentExcerpt(speaker.text)
      });
    });
  });
  return activityByEntry;
}

function getAlmanachDashboardSceneActivity(entryId) {
  return _almanachDashboardSceneActivity.get(String(entryId || '').trim()) || null;
}

function getAlmanachDashboardSceneActivityStatus() {
  return _almanachDashboardSceneActivityStatus;
}

function sortAlmanachDashboardScenesByActivity(items = []) {
  return [...items].sort((left, right) => {
    const leftActivity = getAlmanachDashboardSceneActivity(left?.entry?.id);
    const rightActivity = getAlmanachDashboardSceneActivity(right?.entry?.id);
    return Number(rightActivity?.activityAt || 0) - Number(leftActivity?.activityAt || 0);
  });
}

function applyAlmanachDashboardSceneActivity(sections = []) {
  const panel = document.querySelector('[data-dashboard-scenes-panel]');
  const list = document.querySelector('[data-dashboard-scene-list]');
  const count = document.querySelector('[data-dashboard-scene-count]');
  const discovery = document.querySelector('[data-dashboard-discovery-panel]');
  if (!panel || !list) return;

  const activeCount = _almanachDashboardSceneActivity.size;
  if (_almanachDashboardSceneActivityStatus === 'ready' && !activeCount) {
    panel.hidden = true;
    discovery?.classList.add('archive-dashboard-panel-full');
    return;
  }
  if (_almanachDashboardSceneActivityStatus === 'error') {
    panel.hidden = true;
    discovery?.classList.add('archive-dashboard-panel-full');
    return;
  }

  panel.hidden = false;
  discovery?.classList.remove('archive-dashboard-panel-full');
  list.innerHTML = buildArchiveDashboardSceneCards(sections, { activityOnly: true });
  if (count) {
    count.textContent = `${activeCount} aktive Szene${activeCount === 1 ? '' : 'n'}`;
    count.hidden = !activeCount;
  }
  if (typeof refreshArchiveDashboardHeroActions === 'function') {
    refreshArchiveDashboardHeroActions();
  }
}

async function refreshAlmanachDashboardSceneActivity(sections = [], options = {}) {
  const isFresh = Date.now() - _almanachDashboardSceneActivityLoadedAt < ALMANACH_DASHBOARD_SCENE_ACTIVITY_MAX_AGE_MS;
  if (!options.force && isFresh) {
    _almanachDashboardSceneActivity = buildAlmanachDashboardSceneActivity(sections, _almanachDashboardSceneComments);
    _almanachDashboardSceneActivityStatus = 'ready';
    applyAlmanachDashboardSceneActivity(sections);
    return;
  }

  if (!_almanachDashboardSceneActivityRequest) {
    _almanachDashboardSceneActivityStatus = 'loading';
    _almanachDashboardSceneActivityRequest = (async () => {
      const backend = typeof getCommentBackend === 'function'
        ? await getCommentBackend()
        : null;
      if (!backend?.loadAllComments) throw new Error('Kommentaraktivität ist nicht verfügbar.');
      _almanachDashboardSceneComments = await backend.loadAllComments();
      _almanachDashboardSceneActivityLoadedAt = Date.now();
    })().finally(() => {
      _almanachDashboardSceneActivityRequest = null;
    });
  }

  try {
    await _almanachDashboardSceneActivityRequest;
    _almanachDashboardSceneActivity = buildAlmanachDashboardSceneActivity(sections, _almanachDashboardSceneComments);
    _almanachDashboardSceneActivityStatus = 'ready';
  } catch (error) {
    console.warn('dashboard scene activity load failed:', error);
    _almanachDashboardSceneActivityStatus = 'error';
  }
  applyAlmanachDashboardSceneActivity(sections);
}

function updateAlmanachDashboardSceneThread(event) {
  const threadId = String(event?.detail?.threadId || '').trim();
  const comments = Array.isArray(event?.detail?.comments) ? event.detail.comments : null;
  if (!threadId || !comments) return;
  _almanachDashboardSceneComments = [
    ..._almanachDashboardSceneComments.filter(comment => String(comment?.entryId || '') !== threadId),
    ...comments
  ];
  _almanachDashboardSceneActivityLoadedAt = Date.now();
  if (!document.querySelector('[data-dashboard-scenes-panel]') || typeof getValidSections !== 'function') return;
  const sections = getValidSections();
  _almanachDashboardSceneActivity = buildAlmanachDashboardSceneActivity(sections, _almanachDashboardSceneComments);
  _almanachDashboardSceneActivityStatus = 'ready';
  applyAlmanachDashboardSceneActivity(sections);
}

document.addEventListener('aleria:comments-updated', updateAlmanachDashboardSceneThread);
