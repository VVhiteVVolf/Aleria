// Comment jump, author lookup, and scroll helpers.
function normalizeCommentJumpText(value) {
  if (typeof normalizeSearchText === 'function') return normalizeSearchText(value || '');
  return String(value || '').toLowerCase().trim();
}

function getCommentAuthorNames(comment) {
  const names = [];
  const addName = value => {
    const name = String(value || '').trim();
    if (!name) return;
    const key = normalizeCommentJumpText(name);
    if (!key || names.some(existing => normalizeCommentJumpText(existing) === key)) return;
    names.push(name);
  };

  if (comment?.narrator || getCommentShowcaseItem(comment) || getCommentAttachmentItem(comment)) addName('Erzähler');
  addName(comment?.charName);

  if (Array.isArray(comment?.commentSegments)) {
    comment.commentSegments.forEach(segment => {
      if (segment?.narrator) addName('Erzähler');
      addName(segment?.charName);
    });
  }

  return names.length ? names : ['Unbekannt'];
}

function getCommentJumpTools(scroll) {
  const root = scroll?.parentElement || document;
  return root.querySelector('[data-comment-quick-tools]') || document.querySelector('[data-comment-quick-tools]');
}

function setCommentJumpStatus(tools, message = '') {
  const status = tools?.querySelector('[data-comment-jump-status]');
  if (status) status.textContent = message;
}

function syncCommentJumpTools(scroll, sortedComments) {
  const tools = getCommentJumpTools(scroll);
  if (!tools) return;
  const datalist = tools.querySelector('#comment-author-jump-list');
  const input = tools.querySelector('[data-comment-jump-input]');
  const namesByKey = new Map();

  (Array.isArray(sortedComments) ? sortedComments : [])
    .slice()
    .reverse()
    .forEach(comment => {
      getCommentAuthorNames(comment).forEach(name => {
        const key = normalizeCommentJumpText(name);
        if (key && !namesByKey.has(key)) namesByKey.set(key, name);
      });
    });

  if (datalist) {
    datalist.innerHTML = Array.from(namesByKey.values())
      .map(name => `<option value="${escapeHtml(name)}"></option>`)
      .join('');
  }

  tools.dataset.commentCount = String(Array.isArray(sortedComments) ? sortedComments.length : 0);
  setCommentJumpStatus(
    tools,
    namesByKey.size
      ? `${namesByKey.size} Kommentator${namesByKey.size === 1 ? '' : 'en'} in diesem Verlauf`
      : 'Noch keine Kommentatoren im Verlauf'
  );

  if (input && input.value && !Array.from(namesByKey.keys()).some(key => key.includes(normalizeCommentJumpText(input.value)))) {
    input.removeAttribute('aria-invalid');
  }
}

function getActiveCommentsScroll(source = null) {
  const scoped = source?.closest?.('.session-content, .comments-page, .module-embedded-comments, .module-organic-comments');
  return scoped?.querySelector?.('#comments-scroll, .comments-scroll')
    || document.getElementById('comments-scroll')
    || document.querySelector('.comments-scroll');
}

function scrollActiveComments(direction, source = null) {
  const scroll = getActiveCommentsScroll(source);
  if (!scroll) return;
  const top = direction === 'top' ? 0 : scroll.scrollHeight;
  scroll.scrollTop = top;
  requestAnimationFrame(() => { scroll.scrollTop = top; });
}

function getCommentElementForJump(commentId) {
  const id = String(commentId || '');
  if (!id) return null;
  const escaped = window.CSS?.escape ? CSS.escape(id) : id.replace(/["\\]/g, '\\$&');
  const nodes = Array.from(document.querySelectorAll(`[data-comment-id="${escaped}"]`));
  return nodes[0] || null;
}

function highlightCommentJumpTarget(element) {
  if (!element) return;
  document.querySelectorAll('.comment-jump-highlight').forEach(node => {
    node.classList.remove('comment-jump-highlight');
  });
  element.classList.add('comment-jump-highlight');
  window.setTimeout(() => element.classList.remove('comment-jump-highlight'), 2200);
}

function jumpToLatestCommentByAuthor(source = null) {
  const tools = source?.closest?.('[data-comment-quick-tools]') || document.querySelector('[data-comment-quick-tools]');
  const input = tools?.querySelector('[data-comment-jump-input]');
  const query = normalizeCommentJumpText(input?.value || '');
  const scroll = getActiveCommentsScroll(source);
  const threadId = String(scroll?.dataset?.commentThreadId || '').trim();
  const comments = sortCommentsByTimeline(_commentCache[threadId] || []);

  if (!query) {
    setCommentJumpStatus(tools, 'Gib zuerst einen Kommentatornamen ein.');
    input?.focus();
    return;
  }

  const match = comments
    .slice()
    .reverse()
    .find(comment => getCommentAuthorNames(comment).some(name => normalizeCommentJumpText(name).includes(query)));

  if (!match) {
    setCommentJumpStatus(tools, 'Kein Beitrag dieses Kommentators gefunden.');
    if (input) input.setAttribute('aria-invalid', 'true');
    return;
  }

  if (input) input.removeAttribute('aria-invalid');
  let target = getCommentElementForJump(match.id);
  if (!target && typeof setCommentPageForCommentId === 'function') {
    setCommentPageForCommentId(threadId, match.id, comments);
    target = getCommentElementForJump(match.id);
  }
  if (!target) {
    setCommentJumpStatus(tools, 'Treffer gefunden, aber der Beitrag ist gerade nicht sichtbar.');
    return;
  }

  target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  highlightCommentJumpTarget(target);
  setCommentJumpStatus(tools, `Jüngster Treffer: ${getCommentAuthorNames(match).join(', ')}`);
}

function handleCommentJumpSearchKey(event) {
  if (event.key !== 'Enter') return;
  event.preventDefault();
  jumpToLatestCommentByAuthor(event.target);
}

window.scrollActiveComments = scrollActiveComments;
window.jumpToLatestCommentByAuthor = jumpToLatestCommentByAuthor;
window.handleCommentJumpSearchKey = handleCommentJumpSearchKey;


