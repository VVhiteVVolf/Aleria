// Rendering and normalization helpers for the Aleria comment system.
// Loaded before the other comment modules as a classic script.
const COMMENT_KIND_LABELS = {
  speech: 'Rede',
  action: 'Handlung',
  thought: 'Gedanke',
  whisper: 'Zu Flüstern',
  shout: 'Rufen',
  narrator: 'Erzähler'
};

function normalizeCommentKind(kind, narrator = false) {
  if (narrator) return 'narrator';
  const value = String(kind || 'speech').toLowerCase();
  if (value === 'ooc') return 'whisper';
  return Object.prototype.hasOwnProperty.call(COMMENT_KIND_LABELS, value)
    ? value
    : 'speech';
}

function getCommentKindLabel(kind) {
  return COMMENT_KIND_LABELS[normalizeCommentKind(kind)] || COMMENT_KIND_LABELS.speech;
}

function getCommentCharacterForStoredComment(c) {
  if (typeof getAvailableCommentCharacterById === 'function' && c?.characterId) {
    const byId = getAvailableCommentCharacterById(c.characterId);
    if (byId) return byId;
  }
  if (typeof getAvailableCommentCharacterByName === 'function' && c?.charName) {
    return getAvailableCommentCharacterByName(c.charName);
  }
  return null;
}

function getCommentEmotePortrait(c, idx) {
  const char = getCommentCharacterForStoredComment(c);
  const emote = char?.emotes?.[idx];
  return emote?.img ? sanitizeImageSrc(emote.img) : '';
}

function splitCommentByEmoteMarkers(c) {
  const source = String(c?.text || '');
  const parts = [];
  const marker = /\{emote:(\d+)\}/g;
  let currentPortrait = sanitizeImageSrc(c?.portrait || '');
  let cursor = 0;
  let match;

  while ((match = marker.exec(source)) !== null) {
    const text = source.slice(cursor, match.index).trim();
    if (text) parts.push({ text, portrait: currentPortrait });
    const nextPortrait = getCommentEmotePortrait(c, Number(match[1]));
    if (nextPortrait) currentPortrait = nextPortrait;
    cursor = marker.lastIndex;
  }

  const tail = source.slice(cursor).trim();
  if (tail || !parts.length) parts.push({ text: tail, portrait: currentPortrait });
  return parts;
}

function renderCommentBubble(c, idx) {
  const showcaseItem = getCommentShowcaseItem(c);
  if (showcaseItem) return renderCommentShowcase(c, idx, showcaseItem);
  const attachmentItem = getCommentAttachmentItem(c);
  if (attachmentItem) return renderCommentAttachment(c, idx, attachmentItem);

  if (Array.isArray(c.commentSegments) && c.commentSegments.some(segment => String(segment?.text || '').trim())) {
    const cleanSegments = c.commentSegments.filter(segment => String(segment?.text || '').trim());
    return cleanSegments.map((segment, segmentIdx) => {
      const segmentComment = {
        ...c,
        ...segment,
        id: c.id,
        text: segment.text || '',
        narrator: !!segment.narrator,
        commentKind: segment.commentKind || segment.kind || (segment.narrator ? 'narrator' : 'speech'),
        charName: segment.charName || (segment.narrator ? 'Erzähler' : c.charName),
        charTitle: segment.charTitle || (segment.narrator ? '' : c.charTitle),
        portrait: segment.narrator ? null : (segment.portrait || c.portrait),
        commentSegments: null,
        _hideActions: segmentIdx < cleanSegments.length - 1
      };
      return renderCommentBubble(segmentComment, idx + segmentIdx);
    }).join('');
  }

  const commentId = escapeHtml(c.id);
  const charName = c.charName || 'Unbekannt';
  const safeCharName = escapeHtml(charName);
  const safeCharTitle = escapeHtml(c.charTitle || '');
  const speakerProfileAttrs = [
    'data-action="open-speaker-profile"',
    `data-speaker-name="${safeCharName}"`,
    `data-speaker-title="${safeCharTitle}"`,
    `data-speaker-portrait="${escapeHtml(c.portrait || '')}"`,
    `data-speaker-character-id="${escapeHtml(c.characterId || '')}"`
  ].join(' ');
  const commentKind = normalizeCommentKind(c.commentKind, c.narrator);
  const kindLabel = getCommentKindLabel(commentKind);
  const divider = idx > 0
    ? `<div class="comment-divider"><span class="comment-divider-icon">*</span></div>`
    : '';

  if (c.narrator) {
    const narratorActions = c._hideActions ? '' : `
        <div class="comment-narrator-actions">
          <button type="button" class="comment-narrator-del" data-action="open-edit-comment" data-comment-id="${commentId}" title="Bearbeiten">Bearbeiten</button>
          <button type="button" class="comment-narrator-del" data-action="open-delete-confirm" data-comment-id="${commentId}" title="Löschen">Löschen</button>
        </div>`;
    return `
      ${divider}
      <div class="comment-narrator comment-kind-${commentKind}" data-comment-id="${commentId}">
        <div class="comment-kind-badge">${kindLabel}</div>
        <div class="comment-narrator-text">${parseCommentMarkup(c.text)}</div>
        ${narratorActions}
      </div>`;
  }

  const side = ['left', 'right'].includes(String(c.side || '')) ? String(c.side) : (idx % 2 === 0 ? 'left' : 'right');
  const parts = splitCommentByEmoteMarkers(c);
  const entries = parts.map((part, partIdx) => {
    const portrait = part.portrait
      ? `<img class="comment-portrait" src="${part.portrait}" alt="${safeCharName}" loading="lazy" decoding="async" ${speakerProfileAttrs}>`
      : `<button type="button" class="comment-portrait-placeholder" ${speakerProfileAttrs}>${getInitialChar(charName)}</button>`;
    const actions = !c._hideActions && partIdx === parts.length - 1
      ? `<button class="comment-delete-btn" data-action="open-edit-comment" data-comment-id="${commentId}" style="margin-right:0.3rem;">Bearbeiten</button><button class="comment-delete-btn" data-action="open-delete-confirm" data-comment-id="${commentId}">Löschen</button>`
      : '';

    return `
      <div class="comment-entry ${side} ${partIdx ? 'comment-subentry' : ''}" data-comment-id="${commentId}">
        ${portrait}
        <div class="comment-content">
          <div class="comment-char-header">
            <button type="button" class="comment-char-name" ${speakerProfileAttrs}>${safeCharName}</button>
            ${c.charTitle ? `<div class="comment-char-title">${safeCharTitle}</div>` : ''}
          </div>
          <div class="comment-body comment-kind-${commentKind}">
            <span class="comment-kind-badge">${kindLabel}</span>
            ${commentKind === 'speech' || commentKind === 'shout' ? '<span class="comment-quote-mark">"</span>' : ''}<span class="comment-text">${parseCommentMarkup(part.text)}</span>
            ${actions}
          </div>
        </div>
      </div>`;
  }).join('');

  return `${divider}${entries}`;
}
