// Edit comment live preview.
// Renders the non-persistent preview for the existing-comment editor.

function getEditPreviewState() {
  const text = document.getElementById('ec-text')?.value.trim() || '';

  if (_editMode === 'narrator') {
    return { narrator: true, commentKind: 'narrator', name: 'Erzähler', title: '', portrait: null, text };
  }

  if (_editSelectedCharId) {
    const char = getAvailableCommentCharacterById(_editSelectedCharId);
    if (char) {
      return {
        narrator: false,
        commentKind: _editCommentKind,
        name: char.name || 'Unbekannt',
        title: char.title || '',
        portrait: _editSelectedEmoteIdx !== null && char.emotes?.[_editSelectedEmoteIdx]
          ? char.emotes[_editSelectedEmoteIdx].img
          : (char.portrait || null),
        text,
      };
    }
  }

  if (_editManualMode) {
    return {
      narrator: false,
      commentKind: _editCommentKind,
      name: document.getElementById('ec-manual-name')?.value.trim() || 'Eigene Figur',
      title: document.getElementById('ec-manual-title')?.value.trim() || '',
      portrait: _editPortraitUrl || normalizeImageUrlForStorage(_editCommentData?.portrait || '') || null,
      text,
    };
  }

  return {
    narrator: false,
    commentKind: _editCommentKind,
    name: 'Noch keine Figur gewählt',
    title: 'Wähle eine Figur oder trage sie manuell ein',
    portrait: null,
    text,
  };
}

function updateEditFormPreview() {
  const preview = document.getElementById('ec-preview');
  if (!preview) return;

  const segments = buildEditCommentSegmentsForSave();
  if (segments.length) {
    preview.innerHTML = `
      <div class="comment-live-preview-head">
        <div class="comment-live-preview-kicker">Live-Vorschau</div>
      </div>
      <div class="comment-segment-preview-stack">
        ${segments.map((segment, index) => renderCommentBubble({
          id: `edit-preview-${index}`,
          ...segment,
          _hideActions: true,
          commentSegments: null
        }, index)).join('')}
      </div>`;
    return;
  }

  const state = getEditPreviewState();
  const safeName = escapeHtml(state.name || 'Unbekannt');
  const safeTitle = escapeHtml(state.title || '');
  const portraitSrc = sanitizeImageSrc(state.portrait);
  const commentKind = normalizeCommentKind(state.commentKind, state.narrator);
  const kindLabel = getCommentKindLabel(commentKind);
  const parsedText = state.text
    ? parseCommentMarkup(state.text)
    : '<span class="comment-live-preview-placeholder">Dein bearbeiteter Text erscheint hier als Vorschau.</span>';

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

