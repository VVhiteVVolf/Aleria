// Comment segment editor.
// Shared by compose and edit flows for segmented speech/action/thought content.

function normalizeCommentSegmentSide(side) {
  return String(side || 'left') === 'right' ? 'right' : 'left';
}

function commentSegmentUsesSide(kind, edit = false) {
  const mode = edit ? _editMode : _commentMode;
  return mode !== 'narrator' && normalizeCommentKind(kind) !== 'action';
}

function makeCommentSegment(kind = 'speech', text = '', emoteIndex = null, side = 'left') {
  const normalizedKind = normalizeCommentKind(kind);
  _commentSegmentSeq += 1;
  return {
    id: `seg-${Date.now().toString(36)}-${_commentSegmentSeq}`,
    kind: normalizedKind,
    text: String(text || ''),
    emoteIndex: Number.isInteger(emoteIndex) ? emoteIndex : null,
    side: normalizedKind === 'action' ? '' : normalizeCommentSegmentSide(side)
  };
}

function getAllowedCommentSegmentKinds(edit = false) {
  const mode = edit ? _editMode : _commentMode;
  return mode === 'narrator'
    ? ['action']
    : ['speech', 'action', 'thought', 'whisper', 'shout'];
}

function coerceCommentSegmentsForMode(edit = false) {
  const segments = edit ? _editCommentSegments : _commentSegments;
  const allowed = getAllowedCommentSegmentKinds(edit);
  segments.forEach(segment => {
    if (!allowed.includes(segment.kind)) {
      segment.kind = allowed[0];
      segment.emoteIndex = null;
    }
    if (segment.kind === 'action') {
      segment.emoteIndex = null;
      segment.side = '';
    } else {
      segment.side = normalizeCommentSegmentSide(segment.side);
    }
  });
}

function renderCommentSegmentActions(edit = false) {
  const selector = edit
    ? '#ec-segment-list + .comment-segment-actions'
    : '#cf-segment-list + .comment-segment-actions';
  const actions = document.querySelector(selector);
  if (!actions) return;
  const action = edit ? 'add-edit-comment-segment' : 'add-comment-segment';
  const buttons = getAllowedCommentSegmentKinds(edit).map(kind => `
    <button type="button" class="comment-segment-add" data-action="${action}" data-kind="${kind}">+ ${getCommentKindLabel(kind)}</button>
  `);
  actions.innerHTML = buttons.join('');
}

function getSegmentTypeButtons(segment, edit = false) {
  const action = edit ? 'set-edit-comment-segment-kind' : 'set-comment-segment-kind';
  const segmentId = escapeHtml(segment.id);
  return getAllowedCommentSegmentKinds(edit).map(kind => `
    <button type="button" class="comment-segment-type ${segment.kind === kind ? 'active' : ''}" data-action="${action}" data-segment-id="${segmentId}" data-kind="${kind}">${getCommentKindLabel(kind)}</button>
  `).join('');
}

function renderSegmentAvatarThumb(src, fallbackName, label) {
  const safeLabel = escapeHtml(label || fallbackName || 'Ausdruck');
  const safeSrc = sanitizeImageSrc(src || '');
  return safeSrc
    ? `<img src="${safeSrc}" alt="${safeLabel}" loading="lazy" decoding="async">`
    : `<span class="comment-segment-avatar-initial">${getInitialChar(fallbackName || label || '?')}</span>`;
}

function getSegmentEmotePalette(segment, edit = false) {
  const char = edit
    ? (_editSelectedCharId ? getAvailableCommentCharacterById(_editSelectedCharId) : null)
    : (_selectedCharId ? getAvailableCommentCharacterById(_selectedCharId) : null);
  if (!char) return '';

  const emotes = Array.isArray(char.emotes) ? char.emotes : [];
  const action = edit ? 'set-edit-comment-segment-emote' : 'set-comment-segment-emote';
  const segmentId = escapeHtml(segment.id);
  const selected = Number.isInteger(segment.emoteIndex) ? String(segment.emoteIndex) : '';
  const standardActive = selected === '';
  const standard = `
    <button type="button" class="comment-segment-avatar ${standardActive ? 'active' : ''}" data-action="${action}" data-segment-id="${segmentId}" data-emote-index="" title="Standardportrait">
      ${renderSegmentAvatarThumb(char.portrait, char.name, 'Standardportrait')}
      <span>Standard</span>
    </button>`;
  const avatars = emotes.map((emote, idx) => {
    const label = emote.label || `Ausdruck ${idx + 1}`;
    return `
      <button type="button" class="comment-segment-avatar ${selected === String(idx) ? 'active' : ''}" data-action="${action}" data-segment-id="${segmentId}" data-emote-index="${idx}" title="${escapeHtml(label)}">
        ${renderSegmentAvatarThumb(emote.img, char.name, label)}
        <span>${escapeHtml(emote.label || String(idx + 1))}</span>
      </button>`;
  }).join('');
  return `
    <div class="comment-segment-avatar-row" aria-label="Ausdruck wählen">
      ${standard}${avatars}
    </div>`;
}

function getCommentSegmentTextareaId(segment, edit = false) {
  return `${edit ? 'ec' : 'cf'}-segment-text-${String(segment?.id || '').replace(/[^a-zA-Z0-9_-]/g, '')}`;
}

function getCommentSegmentPlaceholder(kind) {
  const normalized = normalizeCommentKind(kind);
  if (normalized === 'action') return 'Was geschieht?';
  if (normalized === 'thought') return 'Was denkt die Figur?';
  if (normalized === 'whisper') return 'Was wird geflüstert?';
  if (normalized === 'shout') return 'Was wird gerufen?';
  return 'Was wird gesagt?';
}

function getSegmentSideControl(segment, edit = false) {
  if (!commentSegmentUsesSide(segment.kind, edit)) return '';
  const action = edit ? 'set-edit-comment-segment-side' : 'set-comment-segment-side';
  const segmentId = escapeHtml(segment.id);
  const side = normalizeCommentSegmentSide(segment.side);
  return `
    <div class="comment-segment-side" aria-label="Sprechseite">
      <span>Seite</span>
      <button type="button" class="${side === 'left' ? 'active' : ''}" data-action="${action}" data-segment-id="${segmentId}" data-side="left">Links</button>
      <button type="button" class="${side === 'right' ? 'active' : ''}" data-action="${action}" data-segment-id="${segmentId}" data-side="right">Rechts</button>
    </div>`;
}

function buildCommentSegmentFormatToolbar(textareaId) {
  const targetId = escapeHtml(textareaId);
  return `
    <div class="fmt-toolbar comment-segment-format-toolbar" aria-label="Formatierung">
      <button type="button" class="fmt-btn fmt-bold" data-action="format-comment-segment-wrap" data-target-id="${targetId}" data-wrap-before="**" data-wrap-after="**" title="Fett">B</button>
      <button type="button" class="fmt-btn fmt-italic" data-action="format-comment-segment-wrap" data-target-id="${targetId}" data-wrap-before="*" data-wrap-after="*" title="Kursiv">I</button>
      <button type="button" class="fmt-btn fmt-under" data-action="format-comment-segment-wrap" data-target-id="${targetId}" data-wrap-before="__" data-wrap-after="__" title="Unterstrichen">U</button>
      <button type="button" class="fmt-btn" data-action="format-comment-segment-wrap" data-target-id="${targetId}" data-wrap-before="***" data-wrap-after="***" title="Fett+Kursiv" style="font-weight:700;font-style:italic;font-family:'EB Garamond',serif;">BI</button>
      <div class="fmt-separator"></div>
      <div class="fmt-color-row" title="Farbe wählen">
        <button type="button" class="fmt-color-swatch" style="background:#c0392b" data-action="format-comment-segment-color" data-target-id="${targetId}" data-color="rot" title="Rot" aria-label="Rot"></button>
        <button type="button" class="fmt-color-swatch" style="background:#d4b464" data-action="format-comment-segment-color" data-target-id="${targetId}" data-color="gold" title="Gold" aria-label="Gold"></button>
        <button type="button" class="fmt-color-swatch" style="background:#a8b8c8" data-action="format-comment-segment-color" data-target-id="${targetId}" data-color="silber" title="Silber" aria-label="Silber"></button>
        <button type="button" class="fmt-color-swatch" style="background:#5a8a5a" data-action="format-comment-segment-color" data-target-id="${targetId}" data-color="gruen" title="Gruen" aria-label="Gruen"></button>
        <button type="button" class="fmt-color-swatch" style="background:#4a7ab0" data-action="format-comment-segment-color" data-target-id="${targetId}" data-color="blau" title="Blau" aria-label="Blau"></button>
        <button type="button" class="fmt-color-swatch" style="background:#8b5fa0" data-action="format-comment-segment-color" data-target-id="${targetId}" data-color="lila" title="Lila" aria-label="Lila"></button>
        <button type="button" class="fmt-color-swatch" style="background:#e8e0d0" data-action="format-comment-segment-color" data-target-id="${targetId}" data-color="weiss" title="Weiss" aria-label="Weiss"></button>
        <button type="button" class="fmt-color-swatch" style="background:#888880" data-action="format-comment-segment-color" data-target-id="${targetId}" data-color="grau" title="Grau" aria-label="Grau"></button>
      </div>
      <div class="fmt-separator"></div>
      <button type="button" class="fmt-btn" data-action="format-comment-segment-wrap" data-target-id="${targetId}" data-wrap-before="||" data-wrap-after="||" title="Spoiler">Spoiler</button>
      <button type="button" class="fmt-btn" data-action="format-comment-segment-tooltip" data-target-id="${targetId}" title="Tooltip">Tooltip</button>
    </div>`;
}
