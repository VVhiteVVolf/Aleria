// Comment thread IDs, page mapping, and current comment context.
function getPageCommentThreadKey(page, pageIndex) {
  const key = String(page?.commentThreadKey || '').trim();
  return key || String(pageIndex);
}

function getSessionThreadId(entryId, pageKey) {
  return `${entryId}::session:${pageKey}`;
}

function getPageCommentThreadId(entryId, pageKey) {
  return `${entryId}::page:${pageKey}`;
}

function parseCommentThreadLocation(threadId) {
  const raw = String(threadId || '');
  const sessionMatch = raw.match(/^(.*)::session:([^:]+)$/);
  if (sessionMatch) {
    return {
      raw,
      baseEntryId: sessionMatch[1],
      pageIndex: /^\d+$/.test(sessionMatch[2]) ? Number(sessionMatch[2]) : null,
      pageKey: sessionMatch[2],
      kind: 'session',
    };
  }
  const pageMatch = raw.match(/^(.*)::page:([^:]+)$/);
  if (pageMatch) {
    return {
      raw,
      baseEntryId: pageMatch[1],
      pageIndex: /^\d+$/.test(pageMatch[2]) ? Number(pageMatch[2]) : null,
      pageKey: pageMatch[2],
      kind: 'page',
    };
  }
  return { raw, baseEntryId: raw, pageIndex: null, pageKey: '', kind: 'entry' };
}

function isCommentlessModulePage(page) {
  return !!(
    page?.castePage ||
    page?.courtPage ||
    page?.tournamentPage ||
    page?.tournamentLeaguePage ||
    page?.questFilePage ||
    page?.biographyPage ||
    page?.artifactPage ||
    page?.recipePage
  );
}

function getCommentThreadForPage(page, entry, pageIndex) {
  if (!page || !entry) return null;
  if (isCommentlessModulePage(page)) return null;
  if (page._commentsPage) {
    return {
      threadId: entry.id,
      kind: 'entry-comments',
      page,
      entry,
      pageIndex,
      formTitle: '✦  Stimme hinterlassen  ✦',
      formPlaceholder: 'Schreibe aus der Sicht deines Charakters...',
      emptyTitle: 'Noch keine Stimmen',
      emptyText: 'Sei der Erste.',
    };
  }
  if (page.sessionPage) {
    const pageKey = getPageCommentThreadKey(page, pageIndex);
    return {
      threadId: getSessionThreadId(entry.id, pageKey),
      kind: 'session',
      page,
      entry,
      pageIndex,
      formTitle: '✦  Sitzung fortführen  ✦',
      formPlaceholder: 'Was sagt oder tut deine Figur in dieser Anhörung?',
      emptyTitle: page.sessionEmptyTitle || 'Die Sitzung wartet',
      emptyText: page.sessionEmptyText || 'Noch ist kein Beitrag eingetragen.',
    };
  }
  if (entry.enablePageComments || page.enableComments) {
    const pageKey = getPageCommentThreadKey(page, pageIndex);
    return {
      threadId: getPageCommentThreadId(entry.id, pageKey),
      kind: 'page',
      page,
      entry,
      pageIndex,
      formTitle: '✦  Kommentar zu dieser Seite  ✦',
      formPlaceholder: 'Schreibe aus der Sicht deines Charakters zu genau dieser Seite...',
      emptyTitle: page.pageTitle ? `Noch keine Stimmen zu ${page.pageTitle}` : 'Noch keine Stimmen zu dieser Seite',
      emptyText: 'Diese Seite wartet noch auf Kommentare.',
      inlineHint: 'Kommentare beziehen sich nur auf diese Seite.',
    };
  }
  return null;
}

function shouldShowInlineEntryComments(page, entry) {
  if (!page || !entry || page._commentsPage || page.sessionPage || page.wantedPage || page.profilePage || isCommentlessModulePage(page)) return false;
  const hasStaticCommentary = !!(
    (Array.isArray(page.commentSequence) && page.commentSequence.length) ||
    page.commentText ||
    page.quote ||
    (page.commentator && page.commentator.name)
  );
  return hasStaticCommentary;
}

function getInlineCommentThreadForPage(page, entry, pageIndex) {
  const pageThread = getCommentThreadForPage(page, entry, pageIndex);
  if (pageThread) return pageThread;
  if (!shouldShowInlineEntryComments(page, entry)) return null;
  return {
    threadId: entry.id,
    kind: 'entry-comments',
    page,
    entry,
    pageIndex,
    formTitle: '✦  Stimme hinterlassen  ✦',
    formPlaceholder: 'Schreibe aus der Sicht deines Charakters zu diesem Modul...',
    emptyTitle: page.pageTitle ? `Noch keine Stimmen zu ${page.pageTitle}` : 'Noch keine Stimmen',
    emptyText: 'Dieses Modul wartet noch auf Kommentare.',
    inlineHint: 'Kommentare werden direkt unter dem Modul gesammelt.'
  };
}

function getCurrentCommentThread() {
  if (!currentEntry) return null;
  const entry = getRenderableEntry(currentEntry);
  const pages = getPages(entry);
  const page = pages[currentPage];
  return getCommentThreadForPage(page, entry, currentPage)
    || getInlineCommentThreadForPage(page, entry, currentPage);
}

function getCurrentCommentThreadId() {
  return getCurrentCommentThread()?.threadId || currentEntry?.id || '';
}

function getCurrentCommentCastIds() {
  const thread = getCurrentCommentThread();
  const page = thread?.page;
  const entry = thread?.entry || getRenderableEntry(currentEntry);
  if (!page) return [];
  const pageCast = getModuleCastIdsFromSource(page);
  if (pageCast.length) return pageCast;
  const entryCast = getModuleCastIdsFromSource(entry);
  if (entryCast.length) return entryCast;
  return [];
}

function getModuleCommentThreadIds(entry) {
  if (!entry?.id) return [];
  const ids = new Set([entry.id]);
  getPages(entry).forEach((page, index) => {
    const directThread = getCommentThreadForPage(page, entry, index);
    if (directThread?.threadId) ids.add(directThread.threadId);
    if (shouldShowInlineEntryComments(page, entry)) ids.add(getPageCommentThreadId(entry.id, getPageCommentThreadKey(page, index)));
  });
  return Array.from(ids);
}
