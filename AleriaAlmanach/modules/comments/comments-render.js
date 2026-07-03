// Rendering and normalization helpers for the Aleria comment system.
// Loaded before the other comment modules as a classic script.
const COMMENT_KIND_LABELS = {
  speech: 'Rede',
  action: 'Handlung',
  thought: 'Gedanke',
  whisper: 'Zu Flüstern',
  shout: 'Rufen',
  animal: 'Tiersprache',
  song: 'Gesang',
  spell: 'Zauberformel',
  madness: 'Wahnsinn',
  telepathy: 'Telepathie',
  prayer: 'Gebet',
  flirt: 'Flirt',
  narrator: 'Erzähler',
  'scene-time-event': 'Szenenzeit',
  'scene-transition-event': 'Szenenwechsel',
  'scene-poll-event': 'Abstimmung'
};

const COMMENT_KIND_ICONS = {
  speech: '../IconOrdner/Buttom Icons/Rede.PNG',
  thought: '../IconOrdner/Buttom Icons/Gedanke.PNG',
  whisper: '../IconOrdner/Buttom Icons/Flüstern.PNG',
  shout: '../IconOrdner/Buttom Icons/Rufen.PNG',
  animal: '../IconOrdner/Buttom Icons/Tiersprache.PNG',
  song: '../IconOrdner/Buttom Icons/Singen.PNG',
  spell: '../IconOrdner/Buttom Icons/Zaubern.PNG',
  madness: '../IconOrdner/Buttom Icons/Wahn.PNG',
  telepathy: '../IconOrdner/Buttom Icons/Telepatie.PNG',
  prayer: '../IconOrdner/Buttom Icons/Beten.PNG',
  flirt: '../IconOrdner/Buttom Icons/Flirt.PNG'
};

const COMMENT_KIND_ALIASES = {
  ooc: 'whisper',
  fluestern: 'whisper',
  flüstern: 'whisper',
  rufen: 'shout',
  tiersprache: 'animal',
  tier: 'animal',
  animal: 'animal',
  gesang: 'song',
  singen: 'song',
  zauber: 'spell',
  zauberformel: 'spell',
  wahn: 'madness',
  wahnsinn: 'madness',
  telepathie: 'telepathy',
  gebet: 'prayer',
  beten: 'prayer',
  flirty: 'flirt'
};

function normalizeCommentKind(kind, narrator = false) {
  if (narrator) return 'narrator';
  const value = String(kind || 'speech').toLowerCase();
  const normalized = COMMENT_KIND_ALIASES[value] || value;
  return Object.prototype.hasOwnProperty.call(COMMENT_KIND_LABELS, normalized)
    ? normalized
    : 'speech';
}

function getCommentKindLabel(kind) {
  return COMMENT_KIND_LABELS[normalizeCommentKind(kind)] || COMMENT_KIND_LABELS.speech;
}

function getCommentKindIconSrc(kind) {
  return COMMENT_KIND_ICONS[normalizeCommentKind(kind)] || '';
}

function getCommentKindIconMarkup(kind, className = 'comment-kind-icon') {
  const src = getCommentKindIconSrc(kind);
  return src
    ? `<img class="${escapeHtml(className)}" src="${sanitizeImageSrc(src)}" alt="" loading="lazy" decoding="async">`
    : '';
}

function commentKindUsesQuoteMark(kind) {
  return ['speech', 'shout', 'song', 'telepathy', 'spell', 'madness', 'prayer', 'flirt'].includes(normalizeCommentKind(kind));
}

const COMMENT_ANIMAL_GLYPHS = ['#', '◇', '✶', '∥', '♧', '·', '❄', '☂', '⇆', '↟', 'Ⅱ', '✧', '⋄', '⟐', '※', '¤'];

function hashCommentAnimalText(text = '') {
  return Array.from(String(text || '')).reduce((hash, char) => {
    hash = ((hash << 5) - hash) + char.charCodeAt(0);
    return hash >>> 0;
  }, 2166136261);
}

function scrambleAnimalCommentText(text = '') {
  const source = String(text || '');
  let seed = hashCommentAnimalText(source);
  return Array.from(source).map(char => {
    if (/\s/.test(char)) return char;
    if (/[.,!?;:„“"'\-–—()[\]{}]/.test(char)) return char;
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return COMMENT_ANIMAL_GLYPHS[seed % COMMENT_ANIMAL_GLYPHS.length];
  }).join('');
}

function buildAnimalCommentTextMarkup(text, commentId, partIdx) {
  const safeId = escapeHtml(`${commentId}-animal-${partIdx}`);
  const cipher = escapeHtml(scrambleAnimalCommentText(text));
  return `
    <button type="button" class="comment-animal-toggle" data-action="toggle-animal-comment" aria-expanded="false" aria-controls="${safeId}" title="Tiersprache entschlüsseln">
      <span class="comment-animal-cipher" aria-hidden="false">${cipher}</span>
      <span id="${safeId}" class="comment-animal-plain" aria-hidden="true">${parseCommentMarkup(text)}</span>
    </button>`;
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
  if (typeof isScenePollComment === 'function' && isScenePollComment(c)) {
    return renderScenePollComment(c, idx);
  }
  if (typeof isSceneTransitionComment === 'function' && isSceneTransitionComment(c)) {
    return renderSceneTransitionComment(c, idx);
  }
  const showcaseItem = getCommentShowcaseItem(c);
  if (showcaseItem) return renderCommentShowcase(c, idx, showcaseItem);
  const moduleInsert = getCommentModuleInsertItem(c);
  if (moduleInsert) return renderCommentModuleInsert(c, idx, moduleInsert);
  const attachmentItem = getCommentAttachmentItem(c);
  if (attachmentItem) return renderCommentAttachment(c, idx, attachmentItem);
  if (typeof isSceneTimeEventComment === 'function' && isSceneTimeEventComment(c)) {
    return renderSceneTimeEventComment(c, idx);
  }

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
        <div class="comment-kind-badge">${getCommentKindIconMarkup(commentKind)}<span>${kindLabel}</span></div>
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
    const textMarkup = commentKind === 'animal' && !c._commentPreview
      ? buildAnimalCommentTextMarkup(part.text, commentId, partIdx)
      : `<span class="comment-text">${parseCommentMarkup(part.text)}</span>`;

    return `
      <div class="comment-entry ${side} ${partIdx ? 'comment-subentry' : ''}" data-comment-id="${commentId}">
        ${portrait}
        <div class="comment-content">
          <div class="comment-char-header">
            <button type="button" class="comment-char-name" ${speakerProfileAttrs}>${safeCharName}</button>
            ${c.charTitle ? `<div class="comment-char-title">${safeCharTitle}</div>` : ''}
          </div>
          <div class="comment-body comment-kind-${commentKind}">
            <span class="comment-kind-badge">${getCommentKindIconMarkup(commentKind)}<span>${kindLabel}</span></span>
            ${commentKindUsesQuoteMark(commentKind) ? '<span class="comment-quote-mark">"</span>' : ''}${textMarkup}
            ${actions}
          </div>
        </div>
      </div>`;
  }).join('');

  return `${divider}${entries}`;
}
