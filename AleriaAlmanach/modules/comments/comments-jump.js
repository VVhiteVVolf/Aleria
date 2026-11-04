// Comment jump, author lookup, and scroll helpers.
function normalizeCommentJumpText(value) {
  const text = typeof normalizeSearchText === 'function' ? normalizeSearchText(value || '') : String(value || '');
  return String(text).normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
    .replace(/ß/g, 'ss').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}

function findCommentAuthorMatches(comments, query) {
  const normalized = normalizeCommentJumpText(query);
  if (!normalized) return [];
  const tokens = normalized.split(/\s+/);
  const matches = (Array.isArray(comments) ? comments : []).filter(comment =>
    getCommentAuthorNames(comment).some(name => tokens.every(token => normalizeCommentJumpText(name).includes(token))));
  const exact = matches.filter(comment => getCommentAuthorNames(comment).some(name => normalizeCommentJumpText(name) === normalized));
  return exact.length ? exact : matches;
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

  if (comment?.narrator || getCommentShowcaseItem(comment) || getCommentModuleInsertItem(comment) || getCommentAttachmentItem(comment)) addName('Erzähler');
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
  const datalist = tools.querySelector('[data-comment-author-options]');
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
  tools.dataset.commentAuthorCount = String(namesByKey.size);
  updateCommentJumpSearchStatus(input, sortedComments);
}

function getActiveCommentsScroll(source = null) {
  const scoped = source?.closest?.('.session-content, .comments-page, .module-embedded-comments, .module-organic-comments');
  return scoped?.querySelector?.('#comments-scroll, .comments-scroll')
    || document.getElementById('comments-scroll')
    || document.querySelector('.comments-scroll');
}

function getCommentJumpHistory(scroll) {
  const threadId = String(scroll?.dataset?.commentThreadId || '').trim();
  const history = sortCommentsByTimeline(_commentCache[threadId] || []);
  const comments = globalThis.AleriaSceneRegenerationPolicy?.filterVisible(history) || history;
  return { threadId, history, comments };
}

function updateCommentJumpSearchStatus(source, visibleComments = null) {
  const scroll = getActiveCommentsScroll(source);
  const tools = source?.closest?.('[data-comment-quick-tools]') || getCommentJumpTools(scroll);
  const input = tools?.querySelector('[data-comment-jump-input]');
  if (!tools || !input) return;
  input.removeAttribute('aria-invalid');
  const query = normalizeCommentJumpText(input.value);
  if (!query) {
    const count = Number(tools.dataset.commentAuthorCount || 0);
    setCommentJumpStatus(tools, count ? `${count} Kommentator${count === 1 ? '' : 'en'} im Verlauf · Namen eingeben und Enter drücken.` : 'Noch keine Kommentatoren im Verlauf.');
    return;
  }
  const comments = visibleComments || getCommentJumpHistory(scroll).comments;
  const matches = findCommentAuthorMatches(comments, query);
  setCommentJumpStatus(tools, matches.length
    ? `${matches.length} passende${matches.length === 1 ? 'r Beitrag' : ' Beiträge'} · Enter öffnet den jüngsten Treffer.`
    : 'Kein passender Kommentator. Versuche einen anderen Namen oder Namensteil.');
}

function scrollActiveComments(direction, source = null) {
  const scroll = getActiveCommentsScroll(source);
  if (!scroll) return;
  const top = direction === 'top' ? 0 : scroll.scrollHeight;
  scroll.scrollTop = top;
  requestAnimationFrame(() => { scroll.scrollTop = top; });
}

function getCommentElementForJump(commentId, scroll = null) {
  const id = String(commentId || '');
  if (!id) return null;
  const escaped = window.CSS?.escape ? CSS.escape(id) : id.replace(/["\\]/g, '\\$&');
  const nodes = Array.from((scroll || document).querySelectorAll(`[data-comment-id="${escaped}"]`));
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
  const scroll = getActiveCommentsScroll(source);
  const tools = source?.closest?.('[data-comment-quick-tools]') || getCommentJumpTools(scroll);
  const input = tools?.querySelector('[data-comment-jump-input]');
  const query = normalizeCommentJumpText(input?.value || '');
  const { threadId, history, comments } = getCommentJumpHistory(scroll);

  if (!query) {
    setCommentJumpStatus(tools, 'Gib zuerst einen Kommentatornamen ein.');
    input?.focus();
    return;
  }

  const matches = findCommentAuthorMatches(comments, query);
  const match = matches.at(-1);

  if (!match) {
    setCommentJumpStatus(tools, 'Kein Beitrag dieses Kommentators gefunden.');
    if (input) input.setAttribute('aria-invalid', 'true');
    return;
  }

  if (input) input.removeAttribute('aria-invalid');
  let target = getCommentElementForJump(match.id, scroll);
  if (!target && typeof setCommentPageForCommentId === 'function') {
    setCommentPageForCommentId(threadId, match.id, history);
    target = getCommentElementForJump(match.id, scroll);
  }
  if (!target) {
    setCommentJumpStatus(tools, 'Treffer gefunden, aber der Beitrag ist gerade nicht sichtbar.');
    return;
  }

  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
  highlightCommentJumpTarget(target);
  setCommentJumpStatus(tools, `Jüngster Treffer: ${getCommentAuthorNames(match).join(', ')} · ${matches.length} ${matches.length === 1 ? 'Beitrag' : 'Beiträge'}`);
}

function handleCommentJumpSearchKey(event) {
  if (event.key === 'Escape') {
    event.target.value = '';
    updateCommentJumpSearchStatus(event.target);
    event.preventDefault();
    return;
  }
  if (event.key !== 'Enter') return;
  event.preventDefault();
  jumpToLatestCommentByAuthor(event.target);
}

window.scrollActiveComments = scrollActiveComments;
window.jumpToLatestCommentByAuthor = jumpToLatestCommentByAuthor;
window.handleCommentJumpSearchKey = handleCommentJumpSearchKey;

