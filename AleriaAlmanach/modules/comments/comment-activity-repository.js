import { COMMENT_ACTIVITY_RECENT_LIMIT, buildCommentThreadActivity } from './comment-activity-preview.js?v=20261104-startup-v1';

export function createCommentActivityRepository({ readState, readThreads, readAll, now = Date.now, maxAgeMs = 30000 }) {
  let cache = null, loadedAt = 0, pending = null, ready = null;
  let fallbackCache = null, fallbackLoadedAt = 0, fallbackPending = null;
  let updateGeneration = 0;
  const overlays = new Map();
  function merge(threads) {
    const records = new Map(threads.map(thread => [thread.threadId, thread]));
    for (const [threadId, overlay] of overlays) {
      if (overlay.expiresAt <= now()) { overlays.delete(threadId); continue; }
      records.set(threadId, overlay.value);
    }
    return [...records.values()];
  }
  async function load() {
    if (cache && now() - loadedAt < maxAgeMs) return merge(cache);
    if (!pending) pending = (async () => {
      const generation = updateGeneration;
      if (ready !== true) ready = (await readState())?.ready === true;
      if (!ready) return null;
      cache = await readThreads();
      loadedAt = generation === updateGeneration ? now() : -Infinity;
      return cache;
    })().finally(() => { pending = null; });
    const threads = await pending; return threads ? merge(threads) : null;
  }
  async function overview() {
    try {
      const compact = await load();
      if (compact) return compact;
    } catch (error) {
      if (!readAll) throw error;
    }
    if (!readAll) return null;
    if (fallbackCache && now() - fallbackLoadedAt < maxAgeMs) return merge(fallbackCache);
    if (!fallbackPending) fallbackPending = (async () => {
      const generation = updateGeneration;
      const comments = await readAll(), byThread = new Map();
      for (const comment of comments) {
        const threadId = String(comment?.entryId || '').trim();
        const rows = byThread.get(threadId) || []; rows.push(comment); byThread.set(threadId, rows);
      }
      fallbackCache = [...byThread].map(([threadId, rows]) => buildCommentThreadActivity(threadId, rows));
      fallbackLoadedAt = generation === updateGeneration ? now() : -Infinity;
      return fallbackCache;
    })().finally(() => { fallbackPending = null; });
    return merge(await fallbackPending);
  }
  return Object.freeze({
    load, overview,
    async recent(count) {
      if (count > COMMENT_ACTIVITY_RECENT_LIMIT) return null;
      const threads = await overview();
      return threads ? threads.flatMap(thread => thread.recentComments || []).sort((a, b) => b.activityAtClient - a.activityAtClient || b.id.localeCompare(a.id)).slice(0, count) : null;
    },
    update(threadId, comments) {
      overlays.set(threadId, { value: buildCommentThreadActivity(threadId, comments), expiresAt: now() + 10000 });
      // An older in-flight read may still provide other threads, but cannot
      // become fresh again after this confirmed update invalidated its cache.
      updateGeneration += 1;
      loadedAt = -Infinity;
      fallbackLoadedAt = -Infinity;
    }
  });
}
