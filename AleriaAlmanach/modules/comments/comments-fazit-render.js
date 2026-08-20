// Rendering and normalization for "Fazit" (session conclusion) comments: a title plus one or
// more lines of icon+caption tokens (Personen aus dem Charakterarchiv oder frei gewaehlte Symbole
// aus dem Icon-Verzeichnis / per Bild-URL).
function normalizeFazitToken(token, index) {
  const source = token && typeof token === 'object' ? token : {};
  const kind = source.kind === 'person' ? 'person' : 'symbol';
  const size = ['small', 'medium', 'large'].includes(source.size) ? source.size : 'medium';
  const variant = ['plain', 'tile', 'seal'].includes(source.variant) ? source.variant : 'plain';
  return {
    id: String(source.id || `token-${index + 1}`),
    kind,
    icon: String(source.icon || '').trim(),
    label: String(source.label || '').trim().slice(0, 80),
    characterId: kind === 'person' ? String(source.characterId || '').trim() : '',
    // Spiegelt z.B. den vorhandenen Links-Pfeil zu einem Rechts-Pfeil, ohne ein zweites
    // Icon-Asset zu brauchen - gilt nur fuer dieses eine Token, nicht fuer das Icon allgemein.
    flip: source.flip === true,
    size,
    variant: kind === 'person' ? 'portrait' : variant
  };
}

function normalizeFazitListItem(item, index) {
  const source = item && typeof item === 'object' ? item : { text: item };
  return {
    id: String(source.id || `item-${index + 1}`),
    text: String(source.text || '').trim().slice(0, 300)
  };
}

function normalizeFazitLine(line, index) {
  const source = line && typeof line === 'object' ? line : {};
  const kind = ['tokens', 'text', 'heading', 'list'].includes(source.kind) ? source.kind : 'tokens';
  if (kind === 'text') {
    const tone = ['plain', 'note', 'quote'].includes(source.tone) ? source.tone : 'note';
    return { id: String(source.id || `line-${index + 1}`), kind, text: String(source.text || '').trim().slice(0, 600), tone, tokens: [], items: [] };
  }
  if (kind === 'heading') {
    const level = source.level === 'subsection' ? 'subsection' : 'section';
    return { id: String(source.id || `line-${index + 1}`), kind, text: String(source.text || '').trim().slice(0, 160), level, tokens: [], items: [] };
  }
  if (kind === 'list') {
    const style = ['bullet', 'numbered', 'check'].includes(source.style) ? source.style : 'bullet';
    const bulletIcon = String(source.bulletIcon || '').trim().slice(0, 1000);
    const items = (Array.isArray(source.items) ? source.items : [])
      .slice(0, 16)
      .map(normalizeFazitListItem)
      .filter(item => item.text);
    return { id: String(source.id || `line-${index + 1}`), kind, style, bulletIcon, items, text: '', tokens: [] };
  }
  const align = ['left', 'center', 'right'].includes(source.align) ? source.align : 'center';
  const tokens = (Array.isArray(source.tokens) ? source.tokens : [])
    .slice(0, 24)
    .map(normalizeFazitToken)
    .filter(token => token.icon || token.label);
  return { id: String(source.id || `line-${index + 1}`), kind, tokens, text: '', items: [], align };
}

function fazitLineHasContent(line) {
  if (line.kind === 'tokens') return line.tokens.length > 0;
  if (line.kind === 'list') return line.items.length > 0;
  return Boolean(line.text);
}

function normalizeCommentFazitItem(item) {
  if (!item || typeof item !== 'object') return null;
  const lines = (Array.isArray(item.lines) ? item.lines : [])
    .slice(0, 24)
    .map(normalizeFazitLine)
    .filter(fazitLineHasContent);
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
    .map(line => {
      if (line.kind === 'heading') return `${line.level === 'subsection' ? '###' : '##'} ${line.text}`;
      if (line.kind === 'list') {
        return line.items.map((entry, index) => {
          const marker = line.style === 'numbered' ? `${index + 1}.` : line.style === 'check' ? '☐' : '•';
          return `${marker} ${entry.text}`;
        }).join('\n');
      }
      if (line.kind === 'text') return line.text;
      return line.tokens.map(token => token.label || (token.kind === 'person' ? 'Figur' : 'Symbol')).join(' → ');
    })
    .filter(Boolean)
    .join('\n');
}

function renderFazitTokenMarkup(token) {
  const src = sanitizeImageSrc(token.icon || '');
  const tokenClass = `fazit-token fazit-token-size-${token.size}`;
  const frameClass = token.kind === 'person'
    ? 'fazit-token-icon fazit-token-icon-person'
    : `fazit-token-icon fazit-token-icon-symbol fazit-token-variant-${token.variant}`;
  if (!src) {
    return `<span class="${tokenClass} fazit-token-text-only"><span class="fazit-token-glyph">${escapeHtml(token.label || '•')}</span></span>`;
  }
  return `<span class="${tokenClass}">
    <span class="${frameClass}"><img src="${src}" alt="" loading="lazy" decoding="async" class="${token.flip ? 'is-flipped' : ''}"></span>
    ${token.label ? `<span class="fazit-token-caption">${escapeHtml(token.label)}</span>` : ''}
  </span>`;
}

function renderFazitLineMarkup(line) {
  if (line.kind === 'heading') {
    const tag = line.level === 'subsection' ? 'h4' : 'h3';
    return `<${tag} class="fazit-line-heading fazit-line-heading-${line.level}">${escapeHtml(line.text)}</${tag}>`;
  }
  if (line.kind === 'list') {
    const tag = line.style === 'numbered' ? 'ol' : 'ul';
    const bulletIcon = line.style === 'bullet' ? sanitizeImageSrc(line.bulletIcon || '') : '';
    const items = line.items.map(item => bulletIcon
      ? `<li><img class="fazit-line-list-icon" src="${bulletIcon}" alt=""><span>${escapeHtml(item.text)}</span></li>`
      : `<li>${escapeHtml(item.text)}</li>`).join('');
    const customIconClass = bulletIcon ? ' fazit-line-list-custom-icon' : '';
    return `<${tag} class="fazit-line-list fazit-line-list-${line.style}${customIconClass}">${items}</${tag}>`;
  }
  if (line.kind === 'text') {
    const decoration = line.tone === 'note' ? '<span class="fazit-bullet" aria-hidden="true">✦</span>' : line.tone === 'quote' ? '<span class="fazit-quote-mark" aria-hidden="true">“</span>' : '';
    return `<div class="fazit-line fazit-line-text fazit-line-text-${line.tone}">${decoration}<p>${escapeHtml(line.text)}</p></div>`;
  }
  return `<div class="fazit-line fazit-line-align-${line.align}">${line.tokens.map(renderFazitTokenMarkup).join('')}</div>`;
}

function renderFazitLineDivider() {
  return '<div class="fazit-line-divider" aria-hidden="true"><span class="fazit-line-divider-glyph">✦</span></div>';
}

function renderCommentFazitCard(item) {
  const lines = item.lines.map((line, index) => {
    const previous = item.lines[index - 1];
    const needsDivider = index > 0 && line.kind !== 'heading' && previous?.kind !== 'heading';
    return `${needsDivider ? renderFazitLineDivider() : ''}${renderFazitLineMarkup(line)}`;
  }).join('');
  return `<div class="comment-fazit-card">
    <div class="comment-fazit-title">${escapeHtml(item.title)}</div>
    <div class="comment-fazit-lines">${lines}</div>
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
