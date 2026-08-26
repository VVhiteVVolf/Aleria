function findSceneStartDateInComments(comments = []) {
  const source = Array.isArray(comments) ? comments : [];
  for (const comment of source) {
    const candidate = AleriaWorldDateModel.normalize(comment?.sceneStartDateAleria);
    if (AleriaWorldDateModel.isValid(candidate)) return candidate;
  }
  return null;
}

function resolveSceneStartDateAleria(thread = null, comments = null) {
  const pageDate = AleriaWorldDateModel.normalize(thread?.page?.sessionDateAleria);
  if (AleriaWorldDateModel.isValid(pageDate)) return pageDate;
  const threadId = String(thread?.threadId || '').trim();
  const cached = Array.isArray(comments)
    ? comments
    : (threadId && typeof _commentCache !== 'undefined' ? _commentCache[threadId] : []);
  return findSceneStartDateInComments(cached);
}

function ensureCurrentSceneStartDateAleria() {
  const thread = typeof getCurrentCommentThread === 'function' ? getCurrentCommentThread() : null;
  if (!thread || thread.kind !== 'session') return null;
  const existing = resolveSceneStartDateAleria(thread);
  if (existing) {
    if (!AleriaWorldDateModel.isValid(thread.page?.sessionDateAleria)) {
      thread.page.sessionDateAleria = existing;
      if (typeof setModuleSceneStartDateAleria === 'function') {
        setModuleSceneStartDateAleria(thread.entry?.id, thread.pageIndex, existing);
      }
    }
    return existing;
  }

  const currentDate = AleriaWorldDateStore.getState().date;
  if (!AleriaWorldDateModel.isValid(currentDate)) return null;
  thread.page.sessionDateAleria = currentDate;
  if (typeof setModuleSceneStartDateAleria === 'function') {
    setModuleSceneStartDateAleria(thread.entry?.id, thread.pageIndex, currentDate);
  }
  return currentDate;
}

globalThis.AleriaSceneDateDefaults = Object.freeze({
  ensureForCurrentThread: ensureCurrentSceneStartDateAleria,
  findInComments: findSceneStartDateInComments,
  resolve: resolveSceneStartDateAleria
});
