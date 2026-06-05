// Modal state and page navigation controller.
let currentEntry = null;
let currentPage = 0;
let _autoScrollCommentsOnNextRender = false;

function openModal(entry) {
  preloadEntryImages(entry, 3);
  currentEntry = entry;
  currentPage = 0;
  _autoScrollCommentsOnNextRender = true;
  renderPage(0, 0);
  document.body.style.overflow = 'hidden';
  activateDialog('modal-overlay', { initialFocus: '.modal-close' });
}

function consumeCommentAutoScrollRequest(thread) {
  if (!_autoScrollCommentsOnNextRender) return;
  _autoScrollCommentsOnNextRender = false;
  if (!thread?.threadId) return;
  if (typeof requestCommentAutoScroll === 'function') {
    requestCommentAutoScroll(thread.threadId);
  }
}

function getPages(entry) {
  const base = entry.multipage ? entry.pages : [{
    image: entry.image, pageTitle: '',
    description: entry.description, stats: entry.stats,
    commentator: entry.commentator, commentatorMood: entry.commentatorMood,
    commentText: entry.commentText, quote: entry.quote, quoteBy: entry.quoteBy,
  }];
  if (entry.appendCommentsPage === false) return base;
  return [...base, { _commentsPage: true }];
}

function syncCurlForRenderedPage(entry) {
  if (entry && entry._useCurl) {
    setTimeout(() => { initCurlCanvas(); showCurlCorners(true); sizeCurlCanvas(); }, 40);
    return;
  }
  showCurlCorners(false);
  clearCurlCanvas();
}

function afterModalPageRender(entry, page, pageIndex, scope) {
  applyModalTheme(entry);
  syncSessionFocusShell(!!page?.sessionPage && isSessionFocusModeEnabled());
  applyCommentReaderSettings();
  hydrateModuleRichEditors(scope);
  initResizer();
  initInlineModuleSplitter(scope);
  resetScroll();
  const thread = getCommentThreadForPage(page, entry, pageIndex);
  consumeCommentAutoScrollRequest(thread);
  if (thread) loadCommentsIntoPage(thread.threadId);
  else if (typeof stopCommentLiveUpdates === 'function') stopCommentLiveUpdates();
  syncCurlForRenderedPage(entry);
}

function renderPage(idx, dir) {
  const entry = getRenderableEntry(currentEntry);
  const pages = getPages(entry);
  const page = pages[idx];
  const body = document.getElementById('modal-body');
  const html = buildPage(page, entry, idx, pages.length);

  if (dir === 0) {
    body.innerHTML = `<div class="flip-scene"><div class="flip-page">${html}</div></div>`;
    afterModalPageRender(entry, page, idx, body);
    return;
  }

  const scene = body.querySelector('.flip-scene');
  const oldPage = scene ? scene.querySelector('.flip-page') : null;

  if (!oldPage) {
    body.innerHTML = `<div class="flip-scene"><div class="flip-page">${html}</div></div>`;
    afterModalPageRender(entry, page, idx, body);
    return;
  }

  const outClass = dir > 0 ? 'flip-out-left' : 'flip-out-right';
  const inClass = dir > 0 ? 'flip-in-right' : 'flip-in-left';

  oldPage.classList.add(outClass);

  setTimeout(() => {
    scene.innerHTML = `<div class="flip-page ${inClass}">${html}</div>`;
    afterModalPageRender(entry, page, idx, scene);
  }, 200);
}

function flipPage(dir) {
  if (!currentEntry) return;
  const total = getPages(getRenderableEntry(currentEntry)).length;
  const next = currentPage + dir;
  if (next < 0 || next >= total) return;
  currentPage = next;
  renderPage(currentPage, dir);
}

function jumpToPage(targetPage) {
  if (!currentEntry || targetPage === currentPage) return;
  const total = getPages(getRenderableEntry(currentEntry)).length;
  if (targetPage < 0 || targetPage >= total) return;
  const dir = targetPage > currentPage ? 1 : -1;
  currentPage = targetPage;
  renderPage(currentPage, dir);
}

function closeModal() {
  if (!confirmDiscardInlineModuleEditChanges('schließen')) return;
  deactivateDialog('modal-overlay');
  document.body.style.overflow = '';
  syncSessionFocusShell(false);
  if (typeof stopCommentLiveUpdates === 'function') stopCommentLiveUpdates();
  _inlineModuleEdit = null;
  currentEntry = null;
  currentPage = 0;
}
