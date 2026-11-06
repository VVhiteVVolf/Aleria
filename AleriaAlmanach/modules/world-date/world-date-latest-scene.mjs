import { projectGroupScene } from '../landing/group-landing-scenes.js';

const mounts = new WeakMap();

export function selectLatestScene(catalog, commentsByThread, projection) {
  let latest = null;
  for (const item of catalog) {
    const endpoint = item.endpoint;
    if (!endpoint?.threadId || !item.page?.sessionPage) continue;
    const comments = (commentsByThread.get(endpoint.threadId) || []).filter(comment => comment.localOnly !== true && comment.pending !== true);
    const scene = projectGroupScene({ threadId: endpoint.threadId, page: item.page }, comments, projection);
    if (!Number.isFinite(scene?.ordinal)) continue;
    const candidate = { threadId: endpoint.threadId,
      title: endpoint.pageTitle === endpoint.entryTitle ? endpoint.entryTitle : `${endpoint.entryTitle} · ${endpoint.pageTitle}`,
      ordinal: scene.ordinal, timeSeconds: scene.timeSeconds, dateLabel: scene.dateLabel, time: scene.time };
    if (!latest || candidate.ordinal > latest.ordinal
      || candidate.ordinal === latest.ordinal && (candidate.timeSeconds ?? -1) > (latest.timeSeconds ?? -1)
      || candidate.ordinal === latest.ordinal && candidate.timeSeconds === latest.timeSeconds && candidate.threadId < latest.threadId) latest = candidate;
  }
  return latest;
}

async function loadCompleteSceneComments() {
  try {
    const backend = await globalThis.getCommentBackend?.({ source: 'latest-scene' });
    // A local fallback is not a complete world snapshot and cannot establish a maximum.
    if (!globalThis._fb || backend !== globalThis._fb || typeof backend.loadAllComments !== 'function') throw Error('Szenenverbindung ist noch nicht verfügbar.');
    const comments = await backend.loadAllComments({ serverOnly: true });
    document.dispatchEvent(new CustomEvent('aleria:comment-backend-connected', { detail: { source: 'latest-scene' } }));
    return comments;
  } catch (error) {
    globalThis.showCommentFallbackNotice?.(error, 'latest-scene');
    throw error;
  }
}

export function mountLatestSceneSidebar(root, {
  getCatalog = () => globalThis.getSceneTransitionCatalog?.(globalThis.getValidSections?.() || []) || [],
  loadComments = loadCompleteSceneComments,
  calendar = globalThis.AleriaCalendar,
  resolveStart = globalThis.AleriaSceneDateDefaults?.resolve,
  timeline = globalThis.buildSceneTimeline,
  openScene = threadId => globalThis.openEntryById?.(threadId),
  events = globalThis.document,
  windowEvents = globalThis.window,
} = {}) {
  mounts.get(root)?.destroy();
  const abort = new AbortController(), histories = new Map(), updatesDuringLoad = new Map();
  const button = root.querySelector('[data-latest-scene-open]');
  const title = root.querySelector('[data-latest-scene-title]');
  const time = root.querySelector('[data-latest-scene-time]');
  const status = root.querySelector('[data-latest-scene-status]');
  let loaded = false, pending = null, failed = false, selected = null;

  function render() {
    if (abort.signal.aborted) return;
    root.setAttribute('aria-busy', String(!loaded && !failed));
    selected = loaded ? selectLatestScene(getCatalog(), histories, { calendar, resolveStart, timeline }) : null;
    button.hidden = !selected;
    status.hidden = Boolean(selected);
    status.textContent = loaded ? 'Keine datierte Spielszene.' : failed ? 'Szenenzeit derzeit nicht verfügbar.' : 'Szenenzeit wird geladen …';
    title.textContent = selected?.title || '';
    time.textContent = selected ? `${selected.dateLabel} · ${selected.time ? selected.time + ' Uhr' : 'Uhrzeit offen'}` : '';
  }

  function loadOnce() {
    if (loaded || abort.signal.aborted) return Promise.resolve(loaded);
    if (pending) return pending;
    failed = false;
    pending = Promise.resolve().then(loadComments).then(comments => {
      if (abort.signal.aborted) return false;
      if (!Array.isArray(comments)) throw Error('Vollständiger Szenenstand fehlt.');
      for (const comment of comments) {
        const id = String(comment?.entryId || '');
        if (!id) continue;
        if (!histories.has(id)) histories.set(id, []);
        histories.get(id).push(comment);
      }
      for (const [id, history] of updatesDuringLoad) histories.set(id, history);
      updatesDuringLoad.clear();
      loaded = true;
      render();
      return true;
    }).catch(() => { failed = true; render(); return false; }).finally(() => { pending = null; });
    render();
    return pending;
  }

  function updateThread(event) {
    const id = String(event.detail?.threadId || ''), comments = event.detail?.comments;
    if (!id || !Array.isArray(comments)) return;
    const confirmed = comments.filter(comment => comment.localOnly !== true && comment.pending !== true);
    // Existing thread snapshots can merge local drafts into confirmed server rows.
    // An exclusively local draft cannot replace the complete confirmed history.
    if (comments.length && !confirmed.length) return;
    if (!loaded) updatesDuringLoad.set(id, confirmed);
    else histories.set(id, confirmed);
    render();
  }
  root.addEventListener('click', event => {
    if (!event.target.closest?.('[data-latest-scene-open]') || !selected) return;
    if (!getCatalog().some(item => item.endpoint.threadId === selected.threadId)) { render(); return; }
    event.preventDefault();
    openScene(selected.threadId);
  }, { signal: abort.signal });
  events?.addEventListener('aleria:comments-updated', updateThread, { signal: abort.signal });
  events?.addEventListener('aleria:comment-backend-reconnect', event => {
    if (event.detail?.sources?.includes('latest-scene')) loadOnce();
  }, { signal: abort.signal });
  events?.addEventListener('almanach-world-date-state', render, { signal: abort.signal });
  for (const name of ['almanach:modules-changed', 'almanach:initial-modules-settled']) windowEvents?.addEventListener(name, render, { signal: abort.signal });
  windowEvents?.addEventListener('fb-ready', loadOnce, { signal: abort.signal });
  const api = { ready: loadOnce(), refresh: render, destroy() { abort.abort(); histories.clear(); updatesDuringLoad.clear(); mounts.delete(root); } };
  mounts.set(root, api);
  return api;
}

function initialize() {
  const root = document.querySelector('[data-world-date-latest-scene]');
  if (root && !mounts.has(root)) mountLatestSceneSidebar(root);
}
if (typeof document !== 'undefined') {
  // This independent background read never participates in application readiness.
  if (document.readyState !== 'complete') document.addEventListener('DOMContentLoaded', () => setTimeout(initialize, 0), { once: true });
  else setTimeout(initialize, 0);
}
