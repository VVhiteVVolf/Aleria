// Per-thread render pagination for long comment lists.
const COMMENT_PAGE_SIZE = 50;
const _commentPaginationState = new Map();

function getCommentPaginationThreadId(scroll) {
  return String(scroll?.dataset?.commentThreadId || '').trim();
}

function getCommentPageCount(totalCount) {
  const total = Math.max(0, Number(totalCount) || 0);
  return Math.max(1, Math.ceil(total / COMMENT_PAGE_SIZE));
}

function getCommentCurrentPage(threadId, totalCount) {
  const safeThreadId = String(threadId || '').trim();
  const pageCount = getCommentPageCount(totalCount);
  const stored = Number(_commentPaginationState.get(safeThreadId) || 1);
  return Math.max(1, Math.min(pageCount, Number.isFinite(stored) ? stored : 1));
}

function setCommentCurrentPage(threadId, page, totalCount = null) {
  const safeThreadId = String(threadId || '').trim();
  if (!safeThreadId) return;
  const pageCount = totalCount == null ? Number.MAX_SAFE_INTEGER : getCommentPageCount(totalCount);
  const next = Math.max(1, Math.min(pageCount, Number(page) || 1));
  _commentPaginationState.set(safeThreadId, next);
}

function setCommentPageTarget(threadId, target, totalCount) {
  if (target === 'last') {
    setCommentCurrentPage(threadId, getCommentPageCount(totalCount), totalCount);
    return;
  }
  if (Number.isFinite(Number(target))) {
    setCommentCurrentPage(threadId, Number(target), totalCount);
  }
}

function getCommentPaginationWindow(comments, threadId) {
  const allComments = Array.isArray(comments) ? comments : [];
  const totalCount = allComments.length;
  const pageCount = getCommentPageCount(totalCount);
  const currentPage = getCommentCurrentPage(threadId, totalCount);
  const startIndex = (currentPage - 1) * COMMENT_PAGE_SIZE;
  const endIndex = startIndex + COMMENT_PAGE_SIZE;
  return {
    comments: allComments.slice(startIndex, endIndex),
    totalCount,
    pageCount,
    currentPage,
    startIndex,
    endIndex: Math.min(endIndex, totalCount)
  };
}

function buildCommentPaginationPageButtons(threadId, currentPage, pageCount) {
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
    parts.push(`
      <button
        type="button"
        class="comment-pagination-page${active ? ' active' : ''}"
        data-action="set-comment-page"
        data-comment-thread-id="${escapeHtml(threadId)}"
        data-comment-page="${page}"
        aria-current="${active ? 'page' : 'false'}">${page}</button>`);
    previousPage = page;
  });

  return parts.join('');
}

function renderCommentPaginationControls(threadId, pageInfo) {
  if (!threadId || !pageInfo || pageInfo.totalCount <= COMMENT_PAGE_SIZE) return '';

  const { currentPage, pageCount, startIndex, endIndex, totalCount } = pageInfo;
  const safeThreadId = escapeHtml(threadId);
  const prevPage = Math.max(1, currentPage - 1);
  const nextPage = Math.min(pageCount, currentPage + 1);
  return `
    <nav class="comment-pagination" aria-label="Kommentarseiten">
      <div class="comment-pagination-summary">
        Kommentare ${startIndex + 1}-${endIndex} von ${totalCount}
      </div>
      <div class="comment-pagination-actions">
        <button
          type="button"
          class="comment-pagination-btn"
          data-action="set-comment-page"
          data-comment-thread-id="${safeThreadId}"
          data-comment-page="${prevPage}"
          ${currentPage <= 1 ? 'disabled' : ''}>Zurueck</button>
        ${buildCommentPaginationPageButtons(threadId, currentPage, pageCount)}
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
  setCommentCurrentPage(threadId, page, comments.length);
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
  const index = sortedComments.findIndex(comment => String(comment?.id || '') === safeCommentId);
  if (index < 0) return false;

  setCommentCurrentPage(safeThreadId, Math.floor(index / COMMENT_PAGE_SIZE) + 1, sortedComments.length);
  const scroll = getCommentsScrollForThread(safeThreadId, { allowUnbound: false });
  if (!scroll) return false;
  renderCommentsToScroll(scroll, sortedComments);
  return true;
}
