// Per-thread render pagination for long comment lists.
const COMMENT_PAGE_SIZE = 75;
const _commentPaginationState = new Map();

function getCommentPaginationThreadId(scroll) {
  return String(scroll?.dataset?.commentThreadId || '').trim();
}

function getCommentPageCount(totalCount) {
  const total = Math.max(0, Number(totalCount) || 0);
  return Math.max(1, Math.ceil(total / COMMENT_PAGE_SIZE));
}

function isCommentTimelineSegmentBreak(comment) {
  return !!(
    typeof isSceneTimeEventComment === 'function' &&
    typeof isSceneTimeSegmentBreakEvent === 'function' &&
    isSceneTimeEventComment(comment) &&
    isSceneTimeSegmentBreakEvent(comment)
  );
}

function getCommentTimelineSegmentLabel(comment, segmentIndex) {
  if (typeof getSceneTimeEventSegmentLabel === 'function') {
    return getSceneTimeEventSegmentLabel(comment?.sceneTimeEvent || comment, segmentIndex);
  }
  return `Tag ${segmentIndex}`;
}

function pushCommentTimelineCommentPages(pages, items, options = {}) {
  if (!items.length) return;
  const labelOffset = Number(options.labelOffset || 0);
  for (let index = 0; index < items.length; index += COMMENT_PAGE_SIZE) {
    const pageItems = items.slice(index, index + COMMENT_PAGE_SIZE);
    const label = String(Math.floor(index / COMMENT_PAGE_SIZE) + 1 + labelOffset);
    pages.push({
      type: options.type || 'comments',
      label,
      items: pageItems,
      startIndex: pageItems[0]?.index || 0,
      endIndex: (pageItems[pageItems.length - 1]?.index || 0) + 1
    });
  }
}

function buildCommentTimelinePages(comments) {
  const allComments = Array.isArray(comments) ? comments : [];
  const pages = [];
  let segmentItems = [];
  let breakCount = 0;

  allComments.forEach((comment, index) => {
    const item = { comment, index };
    if (!isCommentTimelineSegmentBreak(comment)) {
      segmentItems.push(item);
      return;
    }

    pushCommentTimelineCommentPages(pages, segmentItems);
    segmentItems = [];
    breakCount += 1;
    pages.push({
      type: 'segment-break',
      label: getCommentTimelineSegmentLabel(comment, breakCount),
      items: [item],
      startIndex: index,
      endIndex: index + 1
    });
  });

  pushCommentTimelineCommentPages(pages, segmentItems);
  return pages;
}

function getCommentCurrentPage(threadId, totalCount) {
  const safeThreadId = String(threadId || '').trim();
  const pageCount = Array.isArray(totalCount)
    ? Math.max(1, buildCommentTimelinePages(totalCount).length)
    : getCommentPageCount(totalCount);
  const stored = Number(_commentPaginationState.get(safeThreadId) || 1);
  return Math.max(1, Math.min(pageCount, Number.isFinite(stored) ? stored : 1));
}

function setCommentCurrentPage(threadId, page, totalCount = null) {
  const safeThreadId = String(threadId || '').trim();
  if (!safeThreadId) return;
  const pageCount = totalCount == null
    ? Number.MAX_SAFE_INTEGER
    : (Array.isArray(totalCount) ? Math.max(1, buildCommentTimelinePages(totalCount).length) : getCommentPageCount(totalCount));
  const next = Math.max(1, Math.min(pageCount, Number(page) || 1));
  _commentPaginationState.set(safeThreadId, next);
}

function setCommentPageTarget(threadId, target, totalCount) {
  const pageCount = Array.isArray(totalCount)
    ? Math.max(1, buildCommentTimelinePages(totalCount).length)
    : getCommentPageCount(totalCount);
  if (target === 'last') {
    setCommentCurrentPage(threadId, pageCount, totalCount);
    return;
  }
  if (Number.isFinite(Number(target))) {
    setCommentCurrentPage(threadId, Number(target), totalCount);
  }
}

function getCommentPaginationWindow(comments, threadId) {
  const allComments = Array.isArray(comments) ? comments : [];
  const totalCount = allComments.length;
  const pages = buildCommentTimelinePages(allComments);
  const pageCount = Math.max(1, pages.length);
  const currentPage = getCommentCurrentPage(threadId, allComments);
  const page = pages[currentPage - 1] || { items: [], label: '1', startIndex: 0, endIndex: 0, type: 'comments' };
  const visibleItems = page.items || [];
  return {
    comments: visibleItems.map(item => item.comment),
    commentItems: visibleItems,
    totalCount,
    pageCount,
    currentPage,
    pages,
    pageLabel: page.label,
    pageType: page.type,
    startIndex: page.startIndex || 0,
    endIndex: page.endIndex || 0
  };
}

function buildCommentPaginationPageButtons(threadId, pageInfo) {
  const { currentPage, pageCount } = pageInfo;
  const pages = new Set([1, pageCount, currentPage - 1, currentPage, currentPage + 1]);
  if (pageCount <= 7) {
    for (let page = 1; page <= pageCount; page += 1) pages.add(page);
  }

  const orderedPages = Array.from(pages)
    .filter(page => page >= 1 && page <= pageCount)
    .sort((a, b) => a - b);

  const parts = [];
  let previousPage = 0;
  orderedPages.forEach(page => {
    if (previousPage && page - previousPage > 1) {
      parts.push('<span class="comment-pagination-gap">...</span>');
    }
    const active = page === currentPage;
    const pageMeta = pageInfo.pages?.[page - 1] || {};
    const pageLabel = String(pageMeta.label || page);
    parts.push(`
      <button
        type="button"
        class="comment-pagination-page${active ? ' active' : ''}"
        data-action="set-comment-page"
        data-comment-thread-id="${escapeHtml(threadId)}"
        data-comment-page="${page}"
        aria-current="${active ? 'page' : 'false'}">${escapeHtml(pageLabel)}</button>`);
    previousPage = page;
  });

  return parts.join('');
}

function renderCommentPaginationControls(threadId, pageInfo) {
  if (!threadId || !pageInfo || pageInfo.pageCount <= 1) return '';

  const { currentPage, pageCount, startIndex, endIndex, totalCount, pageLabel } = pageInfo;
  const safeThreadId = escapeHtml(threadId);
  const prevPage = Math.max(1, currentPage - 1);
  const nextPage = Math.min(pageCount, currentPage + 1);
  const rangeText = pageInfo.pageType === 'segment-break'
    ? escapeHtml(String(pageLabel || 'Abschnitt'))
    : `${escapeHtml(String(pageLabel || currentPage))} · Kommentare ${startIndex + 1}-${endIndex} von ${totalCount}`;
  return `
    <nav class="comment-pagination" aria-label="Kommentarseiten">
      <div class="comment-pagination-summary">
        ${rangeText}
      </div>
      <div class="comment-pagination-actions">
        <button
          type="button"
          class="comment-pagination-btn"
          data-action="set-comment-page"
          data-comment-thread-id="${safeThreadId}"
          data-comment-page="${prevPage}"
          ${currentPage <= 1 ? 'disabled' : ''}>Zurueck</button>
        ${buildCommentPaginationPageButtons(threadId, pageInfo)}
        <button
          type="button"
          class="comment-pagination-btn"
          data-action="set-comment-page"
          data-comment-thread-id="${safeThreadId}"
          data-comment-page="${nextPage}"
          ${currentPage >= pageCount ? 'disabled' : ''}>Weiter</button>
      </div>
    </nav>`;
}

function setCommentPageFromTrigger(trigger) {
  const threadId = String(trigger?.dataset?.commentThreadId || '').trim();
  const page = Number(trigger?.dataset?.commentPage || 1);
  if (!threadId || !Number.isFinite(page)) return;
  const comments = sortCommentsByTimeline(_commentCache[threadId] || []);
  setCommentCurrentPage(threadId, page, comments);
  const scroll = getCommentsScrollForThread(threadId, { allowUnbound: false });
  if (!scroll) return;
  renderCommentsToScroll(scroll, comments);
  scroll.scrollTop = 0;
}

function setCommentPageForCommentId(threadId, commentId, comments = null) {
  const safeThreadId = String(threadId || '').trim();
  const safeCommentId = String(commentId || '').trim();
  if (!safeThreadId || !safeCommentId) return false;

  const sortedComments = comments || sortCommentsByTimeline(_commentCache[safeThreadId] || []);
  const pages = buildCommentTimelinePages(sortedComments);
  const index = sortedComments.findIndex(comment => String(comment?.id || '') === safeCommentId);
  if (index < 0) return false;

  const pageIndex = pages.findIndex(page =>
    (page.items || []).some(item => String(item.comment?.id || '') === safeCommentId)
  );
  setCommentCurrentPage(safeThreadId, pageIndex >= 0 ? pageIndex + 1 : 1, sortedComments);
  const scroll = getCommentsScrollForThread(safeThreadId, { allowUnbound: false });
  if (!scroll) return false;
  renderCommentsToScroll(scroll, sortedComments);
  return true;
}
