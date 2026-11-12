function findSceneStartDateInComments(comments = []) {
  const source = Array.isArray(comments) ? comments : [];
  for (const comment of source) {
    const candidate = AleriaWorldDateModel.normalize(comment?.sceneStartDateAleria);
    if (AleriaWorldDateModel.isValid(candidate)) return candidate;
    const marker = comment?.sceneTimeEvent;
    if (AleriaWorldDateModel.isValid(marker?.calendarDate) && Number.isInteger(marker.calendarDay) && marker.calendarDay > 0) {
      return AleriaWorldDateModel.shift(marker.calendarDate, 1 - marker.calendarDay);
    }
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

function ensureCurrentSceneStartDateAleria(selectedDate = null) {
  const thread = typeof getCurrentCommentThread === 'function' ? getCurrentCommentThread() : null;
  if (!thread || thread.kind !== 'session') return null;
  const existing = resolveSceneStartDateAleria(thread);
  if (existing) return existing;

  const currentDate = AleriaWorldDateModel.isValid(selectedDate) ? selectedDate : AleriaWorldDateStore.getState().date;
  if (!AleriaWorldDateModel.isValid(currentDate)) return null;
  // Automatic dates belong to the contribution's sceneStartDateAleria metadata.
  // Reading or posting a scene must not edit or publish its containing module.
  return AleriaWorldDateModel.normalize(currentDate);
}

globalThis.AleriaSceneDateDefaults = Object.freeze({
  ensureForCurrentThread: ensureCurrentSceneStartDateAleria,
  findInComments: findSceneStartDateInComments,
  resolve: resolveSceneStartDateAleria
});
