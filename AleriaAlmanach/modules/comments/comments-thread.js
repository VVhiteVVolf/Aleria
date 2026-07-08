// Comment cache, live thread rendering, navigation tools, and preview splitter.
// Comment cache to avoid slow reloads
const _commentCache = {};
let _commentLiveThreadId = null;
let _commentLiveUnsubscribe = null;
const _commentAutoScrollThreads = new Set();
function getCommentTimestampMs(comment) {
  const seconds = Number(comment?.ts?.seconds ?? comment?.ts?._seconds);
  if (!Number.isFinite(seconds)) return null;
  const nanos = Number(comment?.ts?.nanoseconds ?? comment?.ts?._nanoseconds ?? 0);
  return (seconds * 1000) + (Number.isFinite(nanos) ? nanos / 1000000 : 0);
}

function getCommentValueTimestampMs(value) {
  if (!value) return null;
  if (typeof value.toMillis === 'function') {
    const ms = Number(value.toMillis());
    return Number.isFinite(ms) ? ms : null;
  }
  if (typeof value.toDate === 'function') {
    const ms = Number(value.toDate()?.getTime());
    return Number.isFinite(ms) ? ms : null;
  }
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  const seconds = Number(value?.seconds ?? value?._seconds);
  if (!Number.isFinite(seconds)) return null;
  const nanos = Number(value?.nanoseconds ?? value?._nanoseconds ?? 0);
  return (seconds * 1000) + (Number.isFinite(nanos) ? nanos / 1000000 : 0);
}

function getCommentSortValue(comment, fallbackIndex = 0) {
  const orderKey = Number(comment?.orderKey);
  if (Number.isFinite(orderKey)) return orderKey;
  const timestamp = getCommentTimestampMs(comment);
  return Number.isFinite(timestamp) ? timestamp : fallbackIndex * 1000;
}

function getCommentActivityMs(comment, fallbackIndex = 0) {
  const candidates = [
    Number(comment?.activityAtClient),
    getCommentValueTimestampMs(comment?.activityAt),
    Number(comment?.updatedAtClient),
    getCommentValueTimestampMs(comment?.updatedAt),
    getCommentValueTimestampMs(comment?.editedAt),
    Number(comment?.createdAtClient),
    Number(comment?.createdAtMs),
    getCommentValueTimestampMs(comment?.createdAt),
    getCommentTimestampMs(comment),
    getCommentSortValue(comment, fallbackIndex)
  ].filter(Number.isFinite);
  return candidates.length ? Math.max(...candidates) : fallbackIndex;
}

function sortCommentsByTimeline(comments) {
  return (Array.isArray(comments) ? comments : []).slice().sort((a, b) => {
    const av = getCommentSortValue(a, 0);
    const bv = getCommentSortValue(b, 0);
    if (av !== bv) return av - bv;
    const at = getCommentTimestampMs(a) || 0;
    const bt = getCommentTimestampMs(b) || 0;
    return at - bt;
  });
}

function sortCommentsByRecentActivity(comments) {
  return (Array.isArray(comments) ? comments : [])
    .map((comment, index) => ({ comment, index }))
    .sort((a, b) => {
      const av = getCommentActivityMs(a.comment, a.index);
      const bv = getCommentActivityMs(b.comment, b.index);
      if (av !== bv) return bv - av;
      return String(b.comment?.id || '').localeCompare(String(a.comment?.id || ''));
    })
    .map(item => item.comment);
}

function getNextCommentOrderKey(threadId, insertAfterId = null) {
  const comments = sortCommentsByTimeline(_commentCache[String(threadId || '')] || []);
  if (!comments.length) return Date.now();
  if (!insertAfterId) {
    return getCommentSortValue(comments[comments.length - 1], comments.length - 1) + 1000;
  }
  const index = comments.findIndex(comment => String(comment.id) === String(insertAfterId));
  if (index < 0) return getCommentSortValue(comments[comments.length - 1], comments.length - 1) + 1000;
  const prev = getCommentSortValue(comments[index], index);
  const nextComment = comments[index + 1];
  if (!nextComment) return prev + 1000;
  const next = getCommentSortValue(nextComment, index + 1);
  if (!Number.isFinite(next) || next <= prev) return prev + 0.001;
  return prev + ((next - prev) / 2);
}

// Comment backend and local fallback live in modules/comments/comments-backend.js.

function stopCommentLiveUpdates() {
  if (_commentLiveUnsubscribe) {
    _commentLiveUnsubscribe();
    _commentLiveUnsubscribe = null;
  }
  _commentLiveThreadId = null;
  stopCommentTurnUpdates();
}

function requestCommentAutoScroll(threadId) {
  const safeId = String(threadId || '').trim();
  if (safeId) _commentAutoScrollThreads.add(safeId);
}

function scrollCommentsToLatest(scroll) {
  if (!scroll) return;
  const run = () => {
    scroll.scrollTop = scroll.scrollHeight;
  };
  run();
  requestAnimationFrame(run);
  window.setTimeout(run, 80);
  window.setTimeout(run, 220);
}

function maybeAutoScrollComments(scroll, comments) {
  const threadId = String(scroll?.dataset?.commentThreadId || '').trim();
  if (!threadId || !_commentAutoScrollThreads.has(threadId)) return;
  if (!Array.isArray(comments) || !comments.length) return;
  _commentAutoScrollThreads.delete(threadId);
  scrollCommentsToLatest(scroll);
}

function getCommentThreadSelectorValue(threadId) {
  const value = String(threadId || '').trim();
  if (!value) return '';
  return window.CSS?.escape
    ? CSS.escape(value)
    : value.replace(/["\\]/g, '\\$&');
}

function getCommentsScrollForThread(threadId, options = {}) {
  const safeThreadId = String(threadId || '').trim();
  if (!safeThreadId) return null;
  const escaped = getCommentThreadSelectorValue(safeThreadId);
  const existing = document.querySelector(`.comments-scroll[data-comment-thread-id="${escaped}"]`);
  if (existing) return existing;
  if (options.allowUnbound === false) return null;

  const modal = document.getElementById('modal-overlay');
  const modalScroll = modal?.classList.contains('active')
    ? modal.querySelector('.comments-scroll')
    : null;
  return modalScroll || getActiveCommentsScroll() || document.querySelector('.comments-scroll');
}

async function loadCommentsIntoPage(entryId, forceRefresh = false, options = {}) {
  const scroll = getCommentsScrollForThread(entryId, { allowUnbound: true });
  if (!scroll) return;
  scroll.dataset.commentThreadId = entryId;
  let pageTarget = options.page;
  const applyPageTarget = comments => {
    if (pageTarget == null) return;
    setCommentPageTarget(entryId, pageTarget, comments);
    pageTarget = null;
  };

  // Show cached immediately if available
  if (_commentCache[entryId] && !forceRefresh) {
    applyPageTarget(_commentCache[entryId]);
    renderCommentsToScroll(scroll, _commentCache[entryId]);
    maybeAutoScrollComments(scroll, _commentCache[entryId]);
  }

  const backend = await getCommentBackend();

  if (_commentLiveThreadId === entryId && _commentLiveUnsubscribe && !forceRefresh) {
    loadCommentTurnIntoPage(entryId, forceRefresh);
    return;
  }
  stopCommentLiveUpdates();
  loadCommentTurnIntoPage(entryId, forceRefresh);

  if (typeof backend.subscribeComments === 'function') {
    _commentLiveThreadId = entryId;
    _commentLiveUnsubscribe = backend.subscribeComments(entryId, comments => {
      _commentCache[entryId] = comments;
      applyPageTarget(comments);
      const currentScroll = getCommentsScrollForThread(entryId, { allowUnbound: false });
      if (currentScroll?.dataset.commentThreadId === entryId) {
        renderCommentsToScroll(currentScroll, comments);
        maybeAutoScrollComments(currentScroll, comments);
      }
      if (typeof loadSidebarFeed === 'function') loadSidebarFeed();
    }, async error => {
      if (typeof showFriendlyAppError === 'function') {
        showFriendlyAppError(error, 'Live-Kommentare konnten nicht geladen werden.');
      }
      const fallbackBackend = getLocalCommentBackend();
      showCommentFallbackNotice();
      const comments = await fallbackBackend.loadComments(entryId);
      _commentCache[entryId] = comments;
      applyPageTarget(comments);
      const currentScroll = getCommentsScrollForThread(entryId, { allowUnbound: false });
      if (currentScroll?.dataset.commentThreadId === entryId) {
        renderCommentsToScroll(currentScroll, comments);
        maybeAutoScrollComments(currentScroll, comments);
      }
    });
    return;
  }

  const comments = await backend.loadComments(entryId);
  _commentCache[entryId] = comments;
  applyPageTarget(comments);
  renderCommentsToScroll(scroll, comments);
  maybeAutoScrollComments(scroll, comments);
}

function renderCommentsToScroll(scroll, comments) {
  const sortedComments = typeof dedupeSceneTransitionComments === 'function'
    ? dedupeSceneTransitionComments(sortCommentsByTimeline(comments))
    : sortCommentsByTimeline(comments);
  const threadId = getCommentPaginationThreadId(scroll);
  const pageInfo = getCommentPaginationWindow(sortedComments, threadId);
  const visibleComments = pageInfo.comments;
  const paginationTop = renderCommentPaginationControls(threadId, pageInfo);
  const paginationBottom = renderCommentPaginationControls(threadId, pageInfo);
  if (sortedComments.length === 0) {
    detachCommentAnimObserver(scroll);
    const emptyTitle = escapeHtml(scroll.dataset.emptyTitle || 'Noch keine Stimmen');
    const emptyText = escapeHtml(scroll.dataset.emptyText || 'Sei der Erste.');
    scroll.innerHTML = `
      <div class="comment-empty">
        <div>${emptyTitle}</div>
        <div class="comment-empty-sub">${emptyText}</div>
      </div>`;
  } else {
    const units = visibleComments.map((c, i) => {
      const absoluteIndex = pageInfo.commentItems?.[i]?.index ?? pageInfo.startIndex + i;
      const key = String(c?.id ?? `idx-${absoluteIndex}`);
      const html = `${renderCommentBubble(c, absoluteIndex)}${renderCommentInsertControl(c, absoluteIndex, sortedComments)}`;
      return { key, html };
    });
    patchCommentScroll(scroll, paginationTop, units, paginationBottom);
  }
  syncCommentJumpTools(scroll, sortedComments);
  applyCommentToolsVisibility();
  observeCommentEntriesForAnimation(scroll);
}

// Keyed reconciliation: only comments whose rendered HTML actually changed get their
// DOM touched. Untouched comments keep their live animations, loaded images and any
// in-progress interaction instead of being torn down and rebuilt on every snapshot.
function patchCommentScroll(scroll, paginationTopHtml, units, paginationBottomHtml) {
  let topEl = scroll.querySelector(':scope > [data-comment-pagination="top"]');
  let bottomEl = scroll.querySelector(':scope > [data-comment-pagination="bottom"]');
  if (!topEl || !bottomEl) {
    scroll.innerHTML = '';
    topEl = document.createElement('div');
    topEl.dataset.commentPagination = 'top';
    bottomEl = document.createElement('div');
    bottomEl.dataset.commentPagination = 'bottom';
    scroll.appendChild(topEl);
    scroll.appendChild(bottomEl);
  }
  if (topEl.__commentHtml !== paginationTopHtml) {
    topEl.innerHTML = paginationTopHtml;
    topEl.__commentHtml = paginationTopHtml;
  }
  if (bottomEl.__commentHtml !== paginationBottomHtml) {
    bottomEl.innerHTML = paginationBottomHtml;
    bottomEl.__commentHtml = paginationBottomHtml;
  }

  const existingUnits = Array.from(scroll.querySelectorAll(':scope > .comment-unit'));
  const existingByKey = new Map(existingUnits.map(el => [el.dataset.commentKey, el]));
  const seen = new Set();
  // `cursor` is the node the next correctly-placed unit must precede. As long as units
  // already sit in the right order we only ever advance the cursor — no DOM writes at all.
  let cursor = topEl.nextSibling;

  units.forEach(({ key, html }) => {
    seen.add(key);
    let el = existingByKey.get(key);
    if (el) {
      if (el.__commentHtml !== html) {
        el.innerHTML = html;
        el.__commentHtml = html;
      }
    } else {
      el = document.createElement('div');
      el.className = 'comment-unit';
      el.dataset.commentKey = key;
      el.innerHTML = html;
      el.__commentHtml = html;
    }
    if (el === cursor) {
      cursor = cursor.nextSibling;
    } else {
      scroll.insertBefore(el, cursor);
    }
  });

  existingUnits.forEach(el => {
    if (!seen.has(el.dataset.commentKey)) el.remove();
  });
}

// Off-screen comments have their CSS animations paused (see .comment-in-view in
// comments.css) so long threads don't keep dozens of invisible bubbles animating.
function observeCommentEntriesForAnimation(scroll) {
  if (typeof IntersectionObserver === 'undefined') return;
  detachCommentAnimObserver(scroll);
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      entry.target.classList.toggle('comment-in-view', entry.isIntersecting);
    });
  }, { rootMargin: '200px 0px', threshold: 0 });
  scroll.querySelectorAll('.comment-entry').forEach(el => observer.observe(el));
  scroll._commentAnimObserver = observer;
}

function detachCommentAnimObserver(scroll) {
  if (scroll._commentAnimObserver) {
    scroll._commentAnimObserver.disconnect();
    scroll._commentAnimObserver = null;
  }
}

function renderCommentInsertControl(comment, idx, comments) {
  const id = String(comment?.id || '');
  if (!id) return '';
  const label = idx < comments.length - 1 ? 'Hier nachträglich antworten' : 'Danach antworten';
  const safeId = escapeHtml(id);
  const currentThreadKind = typeof parseCommentThreadLocation === 'function'
    ? parseCommentThreadLocation(getCurrentCommentThreadId()).kind
    : '';
  const moduleInsertButton = currentThreadKind === 'session'
    ? `<button type="button" data-action="open-module-insert-form-after" data-comment-id="${safeId}">Modul danach</button>`
    : '';
  return `
    <div class="comment-insert-control">
      <button type="button" data-action="open-comment-form-after" data-comment-id="${safeId}">${label}</button>
      <button type="button" data-action="open-showcase-form-after" data-comment-id="${safeId}">Objekt danach</button>
      ${moduleInsertButton}
      <button type="button" data-action="open-attachment-form-after" data-comment-id="${safeId}">Anhang danach</button>
    </div>`;
}

// Comment form logic lives in modules/comments/comments-form.js.

function findCachedCommentById(commentId) {
  const target = String(commentId || '');
  if (!target) return null;
  for (const comments of Object.values(_commentCache)) {
    const found = (comments || []).find(comment => String(comment?.id || '') === target);
    if (found) return found;
  }
  return null;
}

// Showcase form and profile logic lives in modules/comments/comments-showcase.js.

// Attachment form logic lives in modules/comments/comments-attachments.js.


// Comment markup and formatting helpers live in modules/comments/comments-markup.js.

// Comment edit logic lives in modules/comments/comments-edit.js.

// Comment delete logic lives in modules/comments/comments-delete.js.
