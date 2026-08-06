// Rendering and normalization for "Fazit" (session conclusion) comments: a title plus one or
// more lines of icon+caption tokens (Personen aus dem Charakterarchiv oder frei gewaehlte Symbole
// aus dem Icon-Verzeichnis / per Bild-URL).
function normalizeFazitToken(token, index) {
  const source = token && typeof token === 'object' ? token : {};
  const kind = source.kind === 'person' ? 'person' : 'symbol';
  return {
    id: String(source.id || `token-${index + 1}`),
    kind,
    icon: String(source.icon || '').trim(),
    label: String(source.label || '').trim().slice(0, 80),
    characterId: kind === 'person' ? String(source.characterId || '').trim() : ''
  };
}

function normalizeFazitLine(line, index) {
  const source = line && typeof line === 'object' ? line : {};
  const tokens = (Array.isArray(source.tokens) ? source.tokens : [])
    .slice(0, 24)
    .map(normalizeFazitToken)
    .filter(token => token.icon || token.label);
  return { id: String(source.id || `line-${index + 1}`), tokens };
}

function normalizeCommentFazitItem(item) {
  if (!item || typeof item !== 'object') return null;
  const lines = (Array.isArray(item.lines) ? item.lines : [])
    .slice(0, 24)
    .map(normalizeFazitLine)
    .filter(line => line.tokens.length);
  if (!lines.length) return null;
  return {
    title: String(item.title || 'Fazit').trim().slice(0, 120) || 'Fazit',
    lines
  };
}

function getCommentFazitItem(comment) {
  return normalizeCommentFazitItem(comment?.fazit);
}

function buildFazitPlainText(item) {
  return (item?.lines || [])
    .map(line => line.tokens.map(token => token.label || (token.kind === 'person' ? 'Figur' : 'Symbol')).join(' → '))
    .filter(Boolean)
    .join('\n');
}

function renderFazitTokenMarkup(token) {
  const src = sanitizeImageSrc(token.icon || '');
  const frameClass = token.kind === 'person' ? 'fazit-token-icon fazit-token-icon-person' : 'fazit-token-icon fazit-token-icon-symbol';
  if (!src) {
    return `<span class="fazit-token fazit-token-text-only"><span class="fazit-token-glyph">${escapeHtml(token.label || '•')}</span></span>`;
  }
  return `<span class="fazit-token">
    <span class="${frameClass}"><img src="${src}" alt="" loading="lazy" decoding="async"></span>
    ${token.label ? `<span class="fazit-token-caption">${escapeHtml(token.label)}</span>` : ''}
  </span>`;
}

function renderFazitLineMarkup(line) {
  return `<div class="fazit-line">${line.tokens.map(renderFazitTokenMarkup).join('')}</div>`;
}

function renderCommentFazitCard(item) {
  return `<div class="comment-fazit-card">
    <div class="comment-fazit-title">${escapeHtml(item.title)}</div>
    <div class="comment-fazit-lines">${item.lines.map(renderFazitLineMarkup).join('')}</div>
  </div>`;
}

function renderCommentFazit(comment, idx, item) {
  const commentId = String(comment?.id || '');
  const safeCommentId = escapeHtml(commentId).replace(/'/g, '&#39;');
  const divider = idx > 0
    ? `<div class="comment-divider"><span class="comment-divider-icon">*</span></div>`
    : '';
  const actions = comment?._hideActions ? '' : `
      <div class="comment-narrator-actions">
        <button type="button" class="comment-narrator-edit" data-action="open-edit-fazit-form" data-comment-id="${safeCommentId}" title="Bearbeiten">Bearbeiten</button>
        <button type="button" class="comment-narrator-del" data-action="open-delete-confirm" data-comment-id="${safeCommentId}" title="Löschen">Löschen</button>
      </div>`;
  return `
    ${divider}
    <div class="comment-narrator comment-fazit-entry" data-comment-id="${safeCommentId}">
      <div class="comment-kind-badge">Erzähler · Fazit</div>
      ${renderCommentFazitCard(item)}
      ${actions}
    </div>`;
}
