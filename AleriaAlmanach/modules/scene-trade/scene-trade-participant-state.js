import { sceneTradeCommentParticipants } from './scene-trade-participants.js';

const unique = values => [...new Set((Array.isArray(values) ? values : []).filter(value => typeof value === 'string' && value.trim()).map(value => value.trim()))].slice(0, 500);
export function createSceneTradeParticipantPreferences({ uid, threadId, storage } = {}) {
  const key = uid && threadId ? `aleria.scene-trade.people.v1:${encodeURIComponent(uid)}:${encodeURIComponent(threadId)}` : '';
  let includeIds = [], excludeIds = [], persistent = true;
  try {
    const stored = key && storage?.getItem(key);
    if (stored) { const value = JSON.parse(stored); includeIds = unique(value.includeIds); excludeIds = unique(value.excludeIds); }
  } catch { persistent = false; }
  const save = () => {
    try { if (key && storage) storage.setItem(key, JSON.stringify({ includeIds, excludeIds })); else persistent = false; }
    catch { persistent = false; }
  };
  return {
    snapshot: () => ({ includeIds: [...includeIds], excludeIds: [...excludeIds], persistent }),
    add(id) { excludeIds = excludeIds.filter(value => value !== id); includeIds = unique([...includeIds, id]); save(); },
    remove(id) { includeIds = includeIds.filter(value => value !== id); excludeIds = unique([...excludeIds, id]); save(); },
    reset() { includeIds = []; excludeIds = []; save(); }
  };
}

/** Retain small identity references, never transcripts or remote writes. */
export function createSceneTradeParticipantSource({ loadComments, cachedComments = () => null, isCachedCurrent = () => true, now = Date.now, maxAgeMs = 60000 } = {}) {
  const threads = new Map();
  const update = (id, comments) => {
    const record = { references: sceneTradeCommentParticipants(comments), loadedAt: now() };
    threads.set(id, record); return record.references;
  };
  async function read(id) {
    const cached = cachedComments(id);
    if (Array.isArray(cached) && isCachedCurrent(id)) return update(id, cached);
    let current = threads.get(id);
    if (!current && Array.isArray(cached)) {
      current = { references: sceneTradeCommentParticipants(cached), loadedAt: -Infinity }; threads.set(id, current);
    }
    if (current?.pending) return current.pending;
    if (current && now() - current.loadedAt < maxAgeMs) return current.references;
    const request = { ...current };
    const pending = Promise.resolve().then(() => loadComments(id)).then(comments => {
      const latest = threads.get(id);
      return latest !== request && latest?.references ? latest.references : update(id, comments || []);
    });
    request.pending = pending; threads.set(id, request);
    try { return await pending; }
    catch (error) {
      if (threads.get(id) === request) { if (current?.references) threads.set(id, current); else threads.delete(id); }
      throw error;
    }
  }
  return {
    update,
    references(ids) { return [...new Set(ids)].flatMap(id => threads.get(id)?.references || []); },
    async load(ids, onUpdate = () => {}, { isCurrent = () => true } = {}) {
      const queue = [...new Set(ids.filter(Boolean))], errors = []; let next = 0;
      await Promise.all(Array.from({ length: Math.min(3, queue.length) }, async () => {
        while (next < queue.length && isCurrent()) {
          const id = queue[next++];
          try { await read(id); if (isCurrent()) onUpdate(); } catch (error) { errors.push(error); }
        }
      }));
      if (errors.length) throw new AggregateError(errors, 'Einige bisherige Beiträge konnten nicht geladen werden. Fehlende Personen kannst du manuell ergänzen.');
      return this.references(ids);
    }
  };
}
