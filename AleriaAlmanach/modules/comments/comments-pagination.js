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
  const pageSize = options.pageSize || COMMENT_PAGE_SIZE;
  const labelOffset = Number(options.labelOffset || 0);
  for (let index = 0; index < items.length; index += pageSize) {
    const pageItems = items.slice(index, index + pageSize);
    const label = String(Math.floor(index / pageSize) + 1 + labelOffset);
    const page = {
      type: options.type || 'comments',
      label,
      items: pageItems,
      startIndex: pageItems[0]?.index || 0,
      endIndex: (pageItems[pageItems.length - 1]?.index || 0) + 1
    };
    if (index === 0 && options.firstPage) Object.assign(options.firstPage, page, { label: options.firstPage.label });
    else pages.push(page);
  }
}

function buildCommentTimelinePages(comments, threadId = '') {
  const visibleComments = globalThis.AleriaSceneRegenerationPolicy?.filterVisible(comments) || comments;
  const allComments = Array.isArray(visibleComments) ? visibleComments : [];
  const pages = [];
  let segmentItems = [];
  let breakCount = 0;
  let firstPage = null;
  const pageSize = window.AleriaCommentPageBundles?.pageSize?.(threadId) || COMMENT_PAGE_SIZE;
  const flush = () => {
    pushCommentTimelineCommentPages(pages, segmentItems, { pageSize, firstPage });
    if (segmentItems.length) firstPage = null;
    segmentItems = [];
  };

  const groups = window.AleriaCommentPageBundles?.getGroups(threadId, allComments)
    || [{ type: 'comments', items: allComments.map((comment, index) => ({ comment, index })) }];
  groups.forEach(group => {
    if (group.type === 'regular-start') {
      flush();
      firstPage = { type: 'comments', label: group.title || '1', regularPageId: group.id, time: group.time,
        items: [], startIndex: group.startIndex, endIndex: group.startIndex };
      pages.push(firstPage);
      return;
    }
    if (group.type === 'bundle') {
      flush(); firstPage = null;
      pages.push({ type: 'bundle', label: group.label, bundleId: group.id, items: group.items,
        startIndex: group.items[0]?.index || 0, endIndex: (group.items.at(-1)?.index || 0) + 1 });
      breakCount += group.items.filter(item => isCommentTimelineSegmentBreak(item.comment)).length;
      return;
    }
    group.items.forEach(item => {
      const { comment, index } = item;
      if (!isCommentTimelineSegmentBreak(comment)) {
        segmentItems.push(item);
        return;
      }

      flush(); firstPage = null;
      breakCount += 1;
      pages.push({
        type: 'segment-break',
        label: getCommentTimelineSegmentLabel(comment, breakCount),
        items: [item],
        startIndex: index,
        endIndex: index + 1
      });
    });
    flush();
  });

  return pages;
}

function getCommentCurrentPage(threadId, totalCount) {
  const safeThreadId = String(threadId || '').trim();
  const pageCount = Array.isArray(totalCount)
    ? Math.max(1, buildCommentTimelinePages(totalCount, safeThreadId).length)
    : getCommentPageCount(totalCount);
  const stored = Number(_commentPaginationState.get(safeThreadId) || 1);
  return Math.max(1, Math.min(pageCount, Number.isFinite(stored) ? stored : 1));
}

function setCommentCurrentPage(threadId, page, totalCount = null) {
  const safeThreadId = String(threadId || '').trim();
  if (!safeThreadId) return;
  const pageCount = totalCount == null
    ? Number.MAX_SAFE_INTEGER
    : (Array.isArray(totalCount) ? Math.max(1, buildCommentTimelinePages(totalCount, safeThreadId).length) : getCommentPageCount(totalCount));
  const next = Math.max(1, Math.min(pageCount, Number(page) || 1));
  _commentPaginationState.set(safeThreadId, next);
}

function setCommentPageTarget(threadId, target, totalCount) {
  const pageCount = Array.isArray(totalCount)
    ? Math.max(1, buildCommentTimelinePages(totalCount, threadId).length)
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
  const visibleComments = globalThis.AleriaSceneRegenerationPolicy?.filterVisible(comments) || comments;
  const allComments = Array.isArray(visibleComments) ? visibleComments : [];
  const totalCount = allComments.length;
  const pages = buildCommentTimelinePages(allComments, threadId);
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
    bundleId: page.bundleId || '',
    regularPageId: page.regularPageId || '',
    time: page.time || null,
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
        title="${escapeHtml(pageLabel)}"${pageMeta.bundleId ? ` data-comment-bundle-id="${escapeHtml(pageMeta.bundleId)}"` : ''}
        aria-current="${active ? 'page' : 'false'}">${escapeHtml(pageLabel)}</button>`);
    previousPage = page;
  });

  return parts.join('');
}

function renderCommentPaginationControls(threadId, pageInfo) {
  if (!threadId || !pageInfo) return '';
  const bundleCount = window.AleriaCommentPageBundles?.count(threadId) || 0;
  const isScene = /^.+::session:.+$/.test(threadId);
  if (pageInfo.pageCount <= 1 && !bundleCount && !isScene) return '';

  const { currentPage, pageCount, startIndex, endIndex, totalCount, pageLabel } = pageInfo;
  const safeThreadId = escapeHtml(threadId);
  const prevPage = Math.max(1, currentPage - 1);
  const nextPage = Math.min(pageCount, currentPage + 1);
  const visibleCount = pageInfo.comments?.length ?? Math.max(0, endIndex - startIndex);
  const rangeText = !visibleCount ? 'Auf dieser Seite sind noch keine Kommentare.' : pageInfo.pageType === 'segment-break'
    ? escapeHtml(String(pageLabel || 'Abschnitt'))
    : `${escapeHtml(String(pageLabel || currentPage))} · Kommentare ${startIndex + 1}-${endIndex} von ${totalCount}`;
  const manager = isScene ? `<button type="button" class="comment-pagination-btn" data-comment-page-action="manage" data-comment-thread-id="${safeThreadId}">Seiten verwalten</button><button type="button" class="comment-pagination-btn" data-comment-page-action="new" data-comment-thread-id="${safeThreadId}">Neue Seite</button>` : '';
  const rename = pageInfo.bundleId ? `<button type="button" class="comment-pagination-btn" data-comment-page-action="rename" data-comment-thread-id="${safeThreadId}" data-page-id="${escapeHtml(pageInfo.bundleId)}">Seite umbenennen</button>`
    : isScene && pageInfo.pageType === 'comments' ? `<button type="button" class="comment-pagination-btn" data-comment-page-action="regular" data-comment-thread-id="${safeThreadId}" data-comment-page="${currentPage}">Seite bearbeiten</button>` : '';
  const timeLabel = pageInfo.time ? window.AleriaCommentPageBundles?.formatTime?.(pageInfo.time) || '' : '';
  const selection = bundleCount && pageCount > 7 ? `<select class="comment-pagination-select" data-comment-page-select data-comment-thread-id="${safeThreadId}" aria-label="Kommentarseite wählen">${pageInfo.pages.map((page,index)=>`<option value="${index+1}"${index+1===currentPage?' selected':''}>${escapeHtml(page.type==='bundle'?page.label:`Seite ${page.label}`)}</option>`).join('')}</select>` : '';
  return `
    <nav class="comment-pagination" aria-label="Kommentarseiten">
      <div class="comment-pagination-summary">
        ${rangeText}${timeLabel ? `<span class="comment-page-time">${escapeHtml(timeLabel)}</span>` : ''}
        ${rename}${manager}
      </div>
      <div class="comment-pagination-actions">
        ${selection}
        <button
          type="button"
          class="comment-pagination-btn"
          data-action="set-comment-page"
          data-comment-thread-id="${safeThreadId}"
          data-comment-page="${prevPage}"
          ${currentPage <= 1 ? 'disabled' : ''}>Zurück</button>
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
  const pages = buildCommentTimelinePages(sortedComments, safeThreadId);
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
