export function collectGroupScenes(sections = []) {
  const found = new Map();
  for (const section of sections) for (const entry of section.entries || []) for (const [pageIndex, page] of (entry.pages || []).entries()) {
    if (!page.sessionPage) continue;
    const threadId = `${entry.id}::session:${page.commentThreadKey || String(pageIndex)}`;
    found.set(threadId, { threadId, entryId: entry.id, entryTitle: entry.title, title: page.pageTitle || entry.title,
      pageIndex, page, location: page.sessionLocation || '', phase: page.sessionPhase || '', status: page.sessionStatus || 'active' });
  }
  return [...found.values()];
}

export function projectGroupScene(scene, comments = [], { calendar, resolveStart, timeline } = {}) {
  if (!scene) return null;
  const start = resolveStart?.({ page: scene.page, threadId: scene.threadId }, comments) || scene.page.sessionDateAleria;
  const entries = timeline?.(comments) || [];
  const last = [...entries].reverse().find(entry => Number.isFinite(entry.endSeconds));
  const date = calendar?.isValid(start) ? calendar.shift(start, Math.max(1, Number(last?.aleriaEndDayIndex) || 1) - 1) : null;
  const seconds = last ? ((Math.floor(last.endSeconds) % 86400) + 86400) % 86400 : null;
  const time = seconds == null ? '' : [Math.floor(seconds / 3600), Math.floor(seconds % 3600 / 60)].map(value => String(value).padStart(2, '0')).join(':');
  return { ...scene, date, time, ordinal: date ? calendar.ordinal(date) : null,
    dateLabel: date ? calendar.format(date) : 'Datum offen', dayLabel: date ? calendar.playDayLabel(date) : 'Play-Tag offen',
    commentCount: comments.length, phase: [...comments].reverse().find(comment => comment.sceneTimeEvent?.title)?.sceneTimeEvent.title || scene.phase };
}

export function classifyGroupScene(scene, active, calendar, worldDate) {
  if (scene.threadId === active?.threadId) return 'Aktive Sitzung';
  if (scene.status === 'ended') return 'Beendet';
  const reference = active?.ordinal ?? (calendar?.isValid(worldDate) ? calendar.ordinal(worldDate) : null);
  if (scene.ordinal == null || reference == null) return 'Zeit offen';
  if (scene.ordinal < reference || (scene.ordinal === reference && scene.time && active?.time && scene.time < active.time)) return 'Früher';
  return scene.ordinal > reference ? 'Kommend' : 'Gleicher Tag';
}
