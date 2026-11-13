// Adapts optional page time anchors to the existing scene clock. No game writes.
export function formatCommentPageTime(time) {
  if (!time) return '';
  const clock = [Math.floor(time.seconds / 3600), Math.floor(time.seconds % 3600 / 60), time.seconds % 60]
    .map(value => String(value).padStart(2, '0')).join(':');
  const date = globalThis.AleriaCalendar?.format(time.calendarDate, { withPlayDay: true }) || '';
  return [date, clock].filter(Boolean).join(' · ');
}

export function getCommentPageTimeAnchor(time, thread) {
  if (!time) return null;
  const calendar = globalThis.AleriaCalendar;
  const start = globalThis.AleriaSceneDateDefaults?.resolve?.(thread) || thread?.page?.sessionDateAleria;
  if (!calendar?.isValid(start)) return null;
  const dayIndex = calendar.ordinal(time.calendarDate) - calendar.ordinal(start) + 1;
  if (dayIndex < 1) return null;
  return { endSeconds: (dayIndex - 1) * 86400 + time.seconds, aleriaEndDayIndex: dayIndex };
}

export function getDefaultCommentPageTime(comments, thread) {
  const calendar = globalThis.AleriaCalendar;
  const start = globalThis.AleriaSceneDateDefaults?.resolve?.(thread, comments) || thread?.page?.sessionDateAleria;
  const latest = globalThis.buildSceneTimeline?.(comments)?.at(-1);
  return {
    calendarDate: calendar?.isValid(start) ? calendar.shift(start, (latest?.aleriaEndDayIndex || 1) - 1) : calendar?.current(),
    seconds: Number.isFinite(latest?.endSeconds) ? Math.floor(latest.endSeconds) % 86400 : 0
  };
}

export function validateCommentPageTime(time, thread) {
  if (time && !getCommentPageTimeAnchor(time, thread)) throw new Error('Die neue Szenenzeit braucht ein Datum ab dem Szenenbeginn.');
}
