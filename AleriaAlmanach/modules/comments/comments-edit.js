// Edit existing comments: dialog lifecycle and code verification.
// ── KOMMENTAR BEARBEITEN ─────────────────────────────────────────────────────
function openEditComment(commentId) {
  if (typeof setCommentPreviewPanelState === 'function') setCommentPreviewPanelState('split');
  _editTargetId = commentId;
  _editCommentData = null;
  _editMode = 'charakter';
  _editCommentKind = 'speech';
  _editSelectedCharId = null;
  _editSelectedEmoteIdx = null;
  _editManualMode = false;
  _editPortraitUrl = null;
  _editCommentSegments = [makeCommentSegment('speech')];
  // Reset to code step
  document.getElementById('ec-code').value = '';
  document.getElementById('ec-code-error').style.display = 'none';
  document.getElementById('ec-verify-btn').disabled = false;
  document.getElementById('ec-verify-btn').textContent = 'Weiter ->';
  document.getElementById('edit-step-code').style.display = 'flex';
  document.getElementById('edit-step-form').classList.remove('visible');
  document.getElementById('ec-form-error').style.display = 'none';
  document.getElementById('ec-char-search').value = '';
  document.getElementById('ec-selected-name').textContent = '';
  document.getElementById('ec-manual-name').value = '';
  document.getElementById('ec-manual-title').value = '';
  document.getElementById('ec-portrait-url').value = '';
  document.getElementById('ec-manual-fields').style.display = 'none';
  document.getElementById('ec-manual-toggle').textContent = '+ Manuell';
  document.getElementById('ec-emote-section').style.display = 'none';
  document.getElementById('ec-emote-picker').innerHTML = '';
  document.getElementById('ec-portrait-preview').removeAttribute('src');
  document.getElementById('ec-portrait-preview').style.display = 'none';
  setRichEditorContent('ec-text', '');
  renderEditCommentSegmentList();
  setEditMode('charakter');
  setEditCommentKind('speech');
  setEditFormCounter();
  updateEditFormPreview();
  activateDialog('edit-comment-overlay', { initialFocus: '#ec-code' });
}

function closeEditComment() {
  deactivateDialog('edit-comment-overlay');
  _editTargetId = null;
  _editCommentData = null;
}

async function verifyEditCode() {
  const code = document.getElementById('ec-code').value.trim().toUpperCase();
  const errEl = document.getElementById('ec-code-error');
  const btn = document.getElementById('ec-verify-btn');
  if (!code) { errEl.textContent = 'Bitte Code eingeben.'; errEl.style.display='block'; return; }
  errEl.style.display = 'none';
  btn.disabled = true;
  btn.textContent = 'Prüfe...';
  try {
    const backend = await getCommentBackend({ timeoutMs: 1200 });
    const data = await backend.verifyCommentCode(_editTargetId, code);
    _editCommentData = data;
    _editSelectedEmoteIdx = null;
    _editPortraitUrl = normalizeImageUrlForStorage(data.portrait || '');
    setEditCommentKind(data.commentKind || 'speech');
    // Populate edit form
    setRichEditorContent('ec-text', data.text || '');
    if (Array.isArray(data.commentSegments) && data.commentSegments.length) {
      _editCommentSegments = data.commentSegments.map(segment => makeCommentSegment(
        segment.commentKind || segment.kind || (segment.narrator ? 'action' : 'speech'),
        segment.text || '',
        Number.isInteger(segment.emoteIndex) ? segment.emoteIndex : null,
        segment.side || 'left'
      ));
    } else {
      _editCommentSegments = [makeCommentSegment(data.commentKind || 'speech', data.text || '', Number.isInteger(data.emoteIndex) ? data.emoteIndex : null)];
    }
    // Set mode
    setEditMode(data.narrator ? 'narrator' : 'charakter');
    // Pre-select char if it exists
    _editSelectedCharId = null;
    if (!data.narrator) {
      const match = getAvailableCommentCharacterByName(data.charName);
      if (match) {
        _editSelectedCharId = match.id;
        if (data.portrait && Array.isArray(match.emotes)) {
          const emoteIdx = match.emotes.findIndex(emote => String(emote?.img || '') === String(data.portrait || ''));
          _editSelectedEmoteIdx = emoteIdx >= 0 ? emoteIdx : null;
        }
      } else {
        _editManualMode = true;
      }
    }
    renderEditCharPicker();
    renderEditCommentSegmentList();
    document.getElementById('ec-char-search').value = '';
    document.getElementById('ec-manual-name').value = data.charName || '';
    document.getElementById('ec-manual-title').value = data.charTitle || '';
    document.getElementById('ec-portrait-url').value = _editPortraitUrl || '';
    const portraitPreview = document.getElementById('ec-portrait-preview');
    if (portraitPreview && _editPortraitUrl) {
      portraitPreview.src = _editPortraitUrl;
      portraitPreview.style.display = 'block';
    } else if (portraitPreview) {
      portraitPreview.style.display = 'none';
    }
    if (_editSelectedCharId) {
      const char = getAvailableCommentCharacterById(_editSelectedCharId);
      document.getElementById('ec-selected-name').textContent = char ? `Als ${char.name} bearbeiten` : '';
    } else {
      document.getElementById('ec-selected-name').textContent = '';
    }
    document.getElementById('edit-step-code').style.display = 'none';
    document.getElementById('edit-step-form').classList.add('visible');
    if (typeof applyCommentPreviewLayout === 'function') applyCommentPreviewLayout();
    applyEditCharacterFilter();
    setEditFormCounter();
    updateEditFormPreview();
    setTimeout(() => focusRichEditor('ec-text'), 30);
  } catch(e) {
    errEl.textContent = e.message === 'Falscher Code'
      ? 'Falscher Code.'
      : getFriendlyErrorMessage(e, 'Fehler beim Prüfen.');
    errEl.style.display = 'block';
    btn.disabled = false;
    btn.textContent = 'Weiter ->';
  }
}

