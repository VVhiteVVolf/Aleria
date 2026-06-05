// Comment compose live preview.
// Reads form state and renders the non-persistent preview only.

function getCommentPreviewState() {
  const text = document.getElementById('cf-text')?.value.trim() || '';

  if (_commentMode === 'narrator') {
    return {
      narrator: true,
      commentKind: 'narrator',
      name: 'Erzähler',
      title: '',
      portrait: null,
      text,
    };
  }

  if (_selectedCharId) {
    const char = getAvailableCommentCharacterById(_selectedCharId);
    if (char) {
      return {
        narrator: false,
        commentKind: _commentKind,
        name: char.name || 'Unbekannt',
        title: char.title || '',
        portrait: _selectedEmoteIdx !== null && char.emotes?.[_selectedEmoteIdx]
          ? char.emotes[_selectedEmoteIdx].img
          : (char.portrait || null),
        text,
      };
    }
  }

  if (_manualMode) {
    return {
      narrator: false,
      commentKind: _commentKind,
      name: document.getElementById('cf-name')?.value.trim() || 'Eigene Figur',
      title: document.getElementById('cf-title')?.value.trim() || '',
      portrait: _portraitUrl || null,
      text,
    };
  }

  return {
    narrator: false,
    commentKind: _commentKind,
    name: 'Noch keine Figur gewählt',
    title: 'Wähle eine Figur oder trage sie manuell ein',
    portrait: null,
    text,
  };
}

function updateCommentFormPreview() {
  const preview = document.getElementById('cf-preview');
  if (!preview) return;

  const segments = buildCommentSegmentsForSave();
  if (segments.length) {
    preview.innerHTML = `
      <div class="comment-live-preview-head">
        <div class="comment-live-preview-kicker">Live-Vorschau</div>
      </div>
      <div class="comment-segment-preview-stack">
        ${segments.map((segment, index) => renderCommentBubble({
          id: `preview-${index}`,
          ...segment,
          _hideActions: true,
          commentSegments: null
        }, index)).join('')}
      </div>`;
    return;
  }

  const state = getCommentPreviewState();
  const safeName = escapeHtml(state.name || 'Unbekannt');
  const safeTitle = escapeHtml(state.title || '');
  const portraitSrc = sanitizeImageSrc(state.portrait);
  const commentKind = normalizeCommentKind(state.commentKind, state.narrator);
  const kindLabel = getCommentKindLabel(commentKind);
  const parsedText = state.text
    ? parseCommentMarkup(state.text)
    : '<span class="comment-live-preview-placeholder">Dein Text erscheint hier als Vorschau.</span>';

  if (state.narrator) {
    preview.innerHTML = `
      <div class="comment-live-preview-head">
        <div class="comment-live-preview-kicker">Live-Vorschau</div>
      </div>
      <div class="comment-live-preview-body narrator">
        <div class="comment-live-preview-copy">
          <div class="comment-live-preview-name">* Erzähler</div>
          <div class="comment-kind-badge">${kindLabel}</div>
          <div class="comment-live-preview-text">${parsedText}</div>
        </div>
      </div>`;
    return;
  }

  preview.innerHTML = `
    <div class="comment-live-preview-head">
      <div class="comment-live-preview-kicker">Live-Vorschau</div>
    </div>
    <div class="comment-live-preview-body comment-kind-${commentKind}">
      ${portraitSrc
        ? `<img class="comment-live-preview-avatar" src="${portraitSrc}" alt="${safeName}" loading="lazy" decoding="async">`
        : `<div class="comment-live-preview-avatar-ph">${getInitialChar(state.name)}</div>`}
      <div class="comment-live-preview-copy">
        <div class="comment-live-preview-name">${safeName}</div>
        ${safeTitle ? `<div class="comment-live-preview-title">${safeTitle}</div>` : ''}
        <div class="comment-kind-badge">${kindLabel}</div>
        <div class="comment-live-preview-text">${parsedText}</div>
      </div>
    </div>`;
}

