import { emptyBundleMetadata, normalizeBundleMetadata, normalizeBundleTitle, partitionBundleItems, planBundleBefore, resolveBundleRanges } from './comment-page-bundles-model.mjs';
import { createCommentPageBundleDialog } from './comment-page-bundles-ui.mjs';

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
  const record = state(threadId), result = partitionBundleItems(itemsFor(comments), record.metadata.pages);
  record.owners = result.owners;
  return result.groups;
}
function pageList(threadId) {
  const record = state(threadId), ranges = resolveBundleRanges(itemsFor(commentsFor(threadId)), record.metadata.pages).ranges;
  return record.metadata.pages.map(page => { const range = ranges.find(item => item.page.id === page.id); return { ...page, count: range ? range.end - range.start + 1 : null }; });
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
  ui.show({ mode: 'create', hasPages: !!state(threadId).metadata.pages.length }); ui.plan(null);
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
  void bindThread(threadId); const token = draft = { mode: 'manage', threadId };
  ui.show({ mode: 'manage', pages: pageList(threadId) });
  try { await load(threadId); if (draft === token) ui.show({ mode: 'manage', pages: pageList(threadId) }); }
  catch (error) { if (draft === token) ui.error(error.message); }
}
async function commit(operation, token) {
  if (token.busy) return;
  token.busy = true; ui.busy(true); ui.error('');
  try {
    const api = await backend();
    const metadata = await api.commitCommentPageBundle({ threadId: token.threadId, expectedRevision: token.expectedRevision, mutationId: token.mutationId, operation });
    receive(token.threadId, metadata, operation.kind === 'create' ? operation.page.start.id : undefined);
    if (draft === token) { draft = null; ui.close(); }
  } catch (error) { if (draft === token) ui.error(error.message || 'Die Einteilung wurde nicht bestätigt. Dein Entwurf bleibt erhalten.'); }
  finally { token.busy = false; if (draft === token) { ui.busy(false); if (token.mode === 'create') ui.plan(token.plan, state(token.threadId).metadata.pages); } }
}
async function save() {
  const token = currentDraft(); if (!token || token.mode === 'manage') return;
  try {
    const title = normalizeBundleTitle(ui.read().title);
    if (token.mode === 'rename') return commit({ kind: 'rename', pageId: token.pageId, title }, token);
    updatePlan(); if (!token.plan?.count || token.plan.existingPage) return;
    return commit({ kind: 'create', page: { id: token.pageId, title, start: token.plan.start, end: token.plan.end, before: token.plan.before }, replaceIds: token.plan.replaceIds }, token);
  } catch (error) { ui.error(error.message); }
}
async function remove(pageId) {
  const current = currentDraft(); if (!current) return;
  const token = pageId ? { mode: 'remove', threadId: current.threadId, pageId, expectedRevision: state(current.threadId).metadata.revision, mutationId: crypto.randomUUID() } : current;
  if (pageId) draft = token;
  return commit({ kind: 'remove', pageId: token.pageId }, token);
}
async function refreshDraft() {
  const token = currentDraft(); if (!token) return;
  try {
    const api = await backend(); receive(token.threadId, await api.loadCommentPageBundles(token.threadId));
    if (draft !== token) return; token.expectedRevision = state(token.threadId).metadata.revision; token.mutationId = crypto.randomUUID();
    ui.error(''); if (token.mode === 'create') updatePlan();
    if (token.mode === 'manage') ui.show({ mode: 'manage', pages: pageList(token.threadId) });
  } catch (error) { if (draft === token) ui.error(error.message); }
}
const ui = createCommentPageBundleDialog({ save, remove, refresh: refreshDraft, rename: openRename, optionsChanged: updatePlan, close() { draft = null; ui.close(); } });
window.AleriaCommentPageBundles = Object.freeze({ bindThread, unbind, getGroups,
  getBundle: (threadId, commentId) => state(threadId).owners.get(commentId),
  count: threadId => state(threadId).metadata.pages.length });
document.addEventListener('click', event => {
  const trigger = event.target.closest?.('[data-comment-page-action]'); if (!trigger) return;
  event.preventDefault(); const threadId = trigger.dataset.commentThreadId || window.getCurrentCommentThreadId?.();
  if (trigger.dataset.commentPageAction === 'before') void openBefore(threadId, trigger.dataset.commentId);
  if (trigger.dataset.commentPageAction === 'manage') void openManage(threadId);
  if (trigger.dataset.commentPageAction === 'rename') { draft = { threadId }; openRename(trigger.dataset.pageId); }
});
document.addEventListener('change', event => {
  const select = event.target.closest?.('[data-comment-page-select]'); if (!select) return;
  window.setCommentPageFromTrigger({ dataset: { commentThreadId: select.dataset.commentThreadId, commentPage: select.value } });
});
for (const event of ['online', 'fb-ready']) window.addEventListener(event, () => { if (activeThread) void bindThread(activeThread, true); });
const initial = window.getCurrentCommentThreadId?.(); if (isScene(initial)) void bindThread(initial);
