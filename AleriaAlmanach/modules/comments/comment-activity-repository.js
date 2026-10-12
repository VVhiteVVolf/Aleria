import { COMMENT_ACTIVITY_RECENT_LIMIT, buildCommentThreadActivity } from './comment-activity-preview.js';

export function createCommentActivityRepository({ readState, readThreads, now = Date.now, maxAgeMs = 30000 }) {
  let cache = null, loadedAt = 0, pending = null, ready = null;
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
      if (ready !== true) ready = (await readState())?.ready === true;
      if (!ready) return null;
      cache = await readThreads(); loadedAt = now(); return cache;
    })().finally(() => { pending = null; });
    const threads = await pending; return threads ? merge(threads) : null;
  }
  return Object.freeze({
    load,
    async recent(count) {
      if (count > COMMENT_ACTIVITY_RECENT_LIMIT) return null;
      const threads = await load();
      return threads ? threads.flatMap(thread => thread.recentComments || []).sort((a, b) => b.activityAtClient - a.activityAtClient || b.id.localeCompare(a.id)).slice(0, count) : null;
    },
    update(threadId, comments) { overlays.set(threadId, { value: buildCommentThreadActivity(threadId, comments), expiresAt: now() + 10000 }); }
  });
}
