import { emptyBundleMetadata, normalizeBundleMetadata, normalizeBundleTitle, normalizeRegularCommentPage, normalizeCommentPageSize, partitionCommentPageItems, planBundleBefore, resolveBundleRanges, resolveRegularCommentPages, itemAnchor } from './comment-page-bundles-model.mjs?v=20261113-continuation-v2';
import { createCommentPageBundleDialog } from './comment-page-bundles-ui.mjs?v=20261113-continuation-v2';
import { formatCommentPageTime, getCommentPageTimeAnchor, getDefaultCommentPageTime, validateCommentPageTime } from './comment-page-time.mjs?v=20261113-continuation-v2';

const records = new Map();
let activeThread = '', unsubscribe = null, generation = 0, draft = null;
const state = id => { if (!records.has(id)) records.set(id, { metadata: emptyBundleMetadata(), loaded: false, owners: new Map(), error: '' }); return records.get(id); };
const isScene = id => /^.+::session:.+$/.test(String(id || ''));
const commentsFor = id => window.getCachedCommentsForThread?.(id) || [];
function itemsFor(comments) {
  const history = window.dedupeSceneTransitionComments?.(comments) || comments;
  const visible = window.AleriaSceneRegenerationPolicy?.filterVisible(history) || history;
  return visible.map((comment, index) => ({ comment, index, id: String(comment.id || ''),
    order: window.getCommentSortValue(comment, index), time: window.getCommentTimestampMs(comment) || 0,
    stable: Number.isFinite(Number(comment.orderKey)) || !!window.getCommentTimestampMs(comment) }));
}
function refresh(threadId, anchorId) {
  if (threadId !== activeThread || window.getCurrentCommentThreadId?.() !== threadId) return;
  const comments = commentsFor(threadId), scroll = window.getCommentsScrollForThread?.(threadId, { allowUnbound: false });
  if (!scroll) return;
  if (anchorId && window.setCommentPageForCommentId(threadId, anchorId, comments)) return;
  window.renderCommentsToScroll(scroll, comments);
}
function receive(threadId, value, targetId) {
  const record = state(threadId), metadata = normalizeBundleMetadata(value);
  if (metadata.revision < record.metadata.revision) return;
  const comments = commentsFor(threadId);
  const anchorId = targetId || window.getCommentPaginationWindow?.(comments, threadId)?.comments?.[0]?.id;
  const changed = !record.loaded || JSON.stringify(record.metadata) !== JSON.stringify(metadata);
  record.metadata = metadata; record.loaded = true; record.error = '';
  if (changed || targetId) refresh(threadId, anchorId);
  if (targetId && threadId === activeThread) {
    const scroll = window.getCommentsScrollForThread?.(threadId, { allowUnbound: false });
    if (scroll) scroll.scrollTop = 0;
  }
}
async function backend() {
  const api = await window.getCommentBackend({ source: 'comment-pages' });
  if (api._localFallback || typeof api.commitCommentPageBundle !== 'function') throw new Error('Für gemeinsame Seiten wird eine Onlineverbindung benötigt. Dein Titel bleibt hier erhalten.');
  return api;
}
function unbind() { generation++; unsubscribe?.(); unsubscribe = null; activeThread = ''; }
async function bindThread(threadId, force = false) {
  if (!isScene(threadId)) { unbind(); return; }
  if (threadId === activeThread && unsubscribe && !force) return;
  unbind(); activeThread = threadId; const current = generation;
  try {
    const api = await backend(); if (generation !== current || activeThread !== threadId) return;
    unsubscribe = api.subscribeCommentPageBundles(threadId, value => {
      if (generation === current && activeThread === threadId) receive(threadId, value);
    }, error => { if (generation === current) state(threadId).error = error.message || 'Die Seiteneinteilung konnte nicht geladen werden.'; });
  } catch (error) { if (generation === current) state(threadId).error = error.message; }
}
async function load(threadId) {
  if (state(threadId).loaded) return state(threadId);
  const api = await backend(); receive(threadId, await api.loadCommentPageBundles(threadId)); return state(threadId);
}
function getGroups(threadId, comments) {
  const record = state(threadId), result = partitionCommentPageItems(itemsFor(comments), record.metadata);
  record.owners = result.owners;
  return result.groups;
}
function pageList(threadId) {
  const record = state(threadId), ranges = resolveBundleRanges(itemsFor(commentsFor(threadId)), record.metadata.pages).ranges;
  const bundles = record.metadata.pages.map(page => { const range = ranges.find(item => item.page.id === page.id); return { ...page, kind: 'bundle', count: range ? range.end - range.start + 1 : null }; });
  const regular = window.buildCommentTimelinePages(commentsFor(threadId), threadId).map((page, index) => ({ ...page,
    id: page.regularPageId || '', title: page.regularPageId ? record.metadata.regularPages.find(item => item.id === page.regularPageId)?.title : '',
    kind: 'regular', number: index + 1, count: page.items.length })).filter(page => page.type === 'comments');
  return [...bundles, ...regular];
}
function currentDraft() { return draft && draft.threadId === activeThread ? draft : null; }
function updatePlan(options = ui.read()) {
  const current = currentDraft(); if (!current || current.mode !== 'create') return;
  current.options = options;
  try { current.plan = planBundleBefore(itemsFor(commentsFor(current.threadId)), state(current.threadId).metadata.pages, current.commentId, options); ui.plan(current.plan, state(current.threadId).metadata.pages); }
  catch (error) { current.plan = null; ui.error(error.message); }
}
async function openBefore(threadId, commentId) {
  if (!isScene(threadId)) return;
  void bindThread(threadId);
  const token = draft = { mode: 'create', threadId, commentId, pageId: `page-${crypto.randomUUID()}`, mutationId: crypto.randomUUID(), expectedRevision: state(threadId).metadata.revision, options: { includeComment: false, includeBundles: false } };
  token.nextPageId = `regular-${crypto.randomUUID()}`;
  ui.show({ mode: 'create', hasPages: !!state(threadId).metadata.pages.length, defaultTime: getDefaultCommentPageTime(commentsFor(threadId), window.getCurrentCommentThread?.()) }); ui.plan(null);
  try {
    await load(threadId); if (draft !== token) return;
    token.expectedRevision = state(threadId).metadata.revision;
    const existing = state(threadId).owners.get(commentId) || resolveBundleRanges(itemsFor(commentsFor(threadId)), state(threadId).metadata.pages).ranges.find(range => range.page.start.id === commentId)?.page;
    if (existing) { openRename(existing.id); return; }
    updatePlan();
  } catch (error) { if (draft === token) ui.error(error.message); }
}
function openRename(pageId) {
  const threadId = draft?.threadId || activeThread, page = state(threadId).metadata.pages.find(item => item.id === pageId); if (!page) return;
  draft = { mode: 'rename', threadId, pageId, expectedRevision: state(threadId).metadata.revision, mutationId: crypto.randomUUID() };
  ui.show({ mode: 'rename', title: page.title });
}
async function openManage(threadId) {
  void bindThread(threadId); const token = draft = { mode: 'manage', threadId, mutationId: crypto.randomUUID() };
  ui.show({ mode: 'manage', pages: pageList(threadId), pageSize: state(threadId).metadata.pageSize });
  try { await load(threadId); if (draft === token) { token.expectedRevision = state(threadId).metadata.revision; ui.show({ mode: 'manage', pages: pageList(threadId), pageSize: state(threadId).metadata.pageSize }); } }
  catch (error) { if (draft === token) ui.error(error.message); }
}
async function openRegular(threadId, pageId = '', pageNumber = 1, isNew = false) {
  if (!isScene(threadId)) return;
  void bindThread(threadId);
  const token = draft = { mode: 'regular', threadId, mutationId: crypto.randomUUID() };
  ui.show({ mode: 'regular', isNew }); ui.busy(true);
  try {
    await load(threadId); if (draft !== token) return;
    const record = state(threadId), comments = commentsFor(threadId), items = itemsFor(comments);
    const pageInfo = window.buildCommentTimelinePages(comments, threadId)[pageNumber - 1];
    const id = pageId || (!isNew && pageInfo?.regularPageId);
    const existing = id && record.metadata.regularPages.find(page => page.id === id);
    const start = isNew ? items.length : pageInfo?.startIndex || 0;
    token.page = existing || { id: `regular-${crypto.randomUUID()}`, after: start ? itemAnchor(items[start - 1]) : null, title: '', time: null };
    token.expectedRevision = record.metadata.revision;
    ui.show({ mode: 'regular', title: token.page.title, time: token.page.time, removable: !!existing, isNew,
      defaultTime: getDefaultCommentPageTime(isNew ? comments : comments.slice(0, start), window.getCurrentCommentThread?.()) });
  } catch (error) { if (draft === token) { ui.busy(false); ui.error(error.message); } }
}
async function commit(operation, token) {
  if (token.busy) return;
  token.busy = true; ui.busy(true); ui.error('');
  try {
    const api = await backend();
    const metadata = await api.commitCommentPageBundle({ threadId: token.threadId, expectedRevision: token.expectedRevision, mutationId: token.mutationId, operation });
    receive(token.threadId, metadata, operation.kind === 'create' ? operation.page.start.id : undefined);
    const targetPageId = operation.nextPage?.id || (operation.kind === 'regular' ? operation.page.id : '');
    if (targetPageId && token.threadId === activeThread) {
      const comments = commentsFor(token.threadId), pages = window.buildCommentTimelinePages(comments, token.threadId);
      const index = pages.findIndex(page => page.regularPageId === targetPageId);
      if (index >= 0) { window.setCommentCurrentPage(token.threadId, index + 1, comments); refresh(token.threadId); }
    }
    if (draft === token) { draft = null; ui.close(); }
  } catch (error) { if (draft === token) ui.error(error.message || 'Die Einteilung wurde nicht bestätigt. Dein Entwurf bleibt erhalten.'); }
  finally { token.busy = false; if (draft === token) { ui.busy(false); if (token.mode === 'create') ui.plan(token.plan, state(token.threadId).metadata.pages); } }
}
async function save() {
  const token = currentDraft(); if (!token) return;
  try {
    const fields = ui.read();
    if (token.mode === 'manage') return commit({ kind: 'configure', pageSize: normalizeCommentPageSize(fields.pageSize) }, token);
    if (token.mode === 'regular') {
      const page = normalizeRegularCommentPage({ ...token.page, title: fields.regularTitle, time: fields.time });
      validateCommentPageTime(page.time, window.getCurrentCommentThread?.());
      return commit({ kind: 'regular', page }, token);
    }
    const title = normalizeBundleTitle(fields.title);
    if (token.mode === 'rename') return commit({ kind: 'rename', pageId: token.pageId, title }, token);
    updatePlan(); if (!token.plan?.count || token.plan.existingPage) return;
    const nextPage = fields.nextPage ? normalizeRegularCommentPage({ id: token.nextPageId, title: fields.regularTitle, time: fields.time, after: token.plan.end }) : null;
    validateCommentPageTime(nextPage?.time, window.getCurrentCommentThread?.());
    return commit({ kind: 'create', page: { id: token.pageId, title, start: token.plan.start, end: token.plan.end, before: token.plan.before }, replaceIds: token.plan.replaceIds, ...(nextPage ? { nextPage } : {}) }, token);
  } catch (error) { ui.error(error.message); }
}
async function remove(pageId, kind) {
  const current = currentDraft(); if (!current) return;
  const token = pageId ? { mode: 'remove', threadId: current.threadId, pageId, expectedRevision: state(current.threadId).metadata.revision, mutationId: crypto.randomUUID() } : current;
  if (pageId) draft = token;
  return commit({ kind: kind === 'regular' || token.mode === 'regular' ? 'remove-regular' : 'remove', pageId: token.pageId || token.page?.id }, token);
}
async function refreshDraft() {
  const token = currentDraft(); if (!token) return;
  try {
    const api = await backend(); receive(token.threadId, await api.loadCommentPageBundles(token.threadId));
    if (draft !== token) return; token.expectedRevision = state(token.threadId).metadata.revision; token.mutationId = crypto.randomUUID();
    ui.error(''); if (token.mode === 'create') updatePlan();
    // Refresh the revision without resetting any entered fields.
  } catch (error) { if (draft === token) ui.error(error.message); }
}
function timeSections(comments) {
  if (!activeThread || window.getCurrentCommentThreadId?.() !== activeThread || comments.some(comment => comment.entryId && comment.entryId !== activeThread)) return [];
  return resolveRegularCommentPages(itemsFor(comments), state(activeThread).metadata.regularPages);
}
const ui = createCommentPageBundleDialog({ save, remove, refresh: refreshDraft, rename: openRename, optionsChanged: updatePlan,
  regular: (id, number) => openRegular(draft?.threadId || activeThread, id, number),
  newPage: () => openRegular(draft?.threadId || activeThread, '', 1, true), close() { draft = null; ui.close(); } });
window.AleriaCommentPageBundles = Object.freeze({ bindThread, unbind, getGroups,
  getBundle: (threadId, commentId) => state(threadId).owners.get(commentId),
  count: threadId => state(threadId).metadata.pages.length + state(threadId).metadata.regularPages.length,
  pageSize: threadId => state(threadId).metadata.pageSize, formatTime: formatCommentPageTime,
  timeAnchors(comments) {
    const items = itemsFor(comments), anchors = new Map();
    for (const { page, start } of timeSections(comments)) {
      const time = getCommentPageTimeAnchor(page.time, window.getCurrentCommentThread?.());
      if (time && items[start]) anchors.set(items[start].id, time);
    }
    return anchors;
  },
  trailingTime(comments) {
    const sections = timeSections(comments), end = itemsFor(comments).length;
    const page = sections.filter(section => section.start === end).at(-1)?.page;
    return getCommentPageTimeAnchor(page?.time, window.getCurrentCommentThread?.());
  } });
document.addEventListener('click', event => {
  const trigger = event.target.closest?.('[data-comment-page-action]'); if (!trigger) return;
  event.preventDefault(); const threadId = trigger.dataset.commentThreadId || window.getCurrentCommentThreadId?.();
  if (trigger.dataset.commentPageAction === 'before') void openBefore(threadId, trigger.dataset.commentId);
  if (trigger.dataset.commentPageAction === 'manage') void openManage(threadId);
  if (trigger.dataset.commentPageAction === 'new') void openRegular(threadId, '', 1, true);
  if (trigger.dataset.commentPageAction === 'regular') void openRegular(threadId, '', Number(trigger.dataset.commentPage));
  if (trigger.dataset.commentPageAction === 'rename') { draft = { threadId }; openRename(trigger.dataset.pageId); }
});
document.addEventListener('change', event => {
  const select = event.target.closest?.('[data-comment-page-select]'); if (!select) return;
  window.setCommentPageFromTrigger({ dataset: { commentThreadId: select.dataset.commentThreadId, commentPage: select.value } });
});
for (const event of ['online', 'fb-ready']) window.addEventListener(event, () => { if (activeThread) void bindThread(activeThread, true); });
const initial = window.getCurrentCommentThreadId?.(); if (isScene(initial)) void bindThread(initial);
