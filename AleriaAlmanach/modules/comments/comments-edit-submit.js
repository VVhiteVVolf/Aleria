// Save flow for editing an existing comment.
async function submitEditComment() {
  syncEditCommentSegmentsToLegacyText();
  const editSegments = buildEditCommentSegmentsForSave();
  const text = editSegments.map(segment => segment.text).join('\n\n').trim();
  const errEl = document.getElementById('ec-form-error');
  const btn = document.getElementById('ec-submit');
  if (!text) { errEl.textContent = 'Bitte Text eingeben.'; errEl.style.display='block'; return; }
  if (text.length > COMMENT_MAX_LENGTH) { errEl.textContent = `Bitte bei maximal ${COMMENT_MAX_LENGTH} Zeichen bleiben.`; errEl.style.display='block'; return; }

  let charName, charTitle, portrait, narrator;
  let commentMetadata = {};
  if (_editMode === 'narrator') {
    charName = 'Erzähler'; charTitle = ''; portrait = null; narrator = true;
    commentMetadata = { characterId: '', emoteIndex: null, avatarKind: 'narrator', commentMode: 'narrator', schemaVersion: 2 };
  } else if (_editSelectedCharId) {
    const c = getAvailableCommentCharacterById(_editSelectedCharId);
    if (!c) { errEl.textContent = 'Charakter nicht gefunden.'; errEl.style.display='block'; return; }
    charName = c.name;
    charTitle = c.title || '';
    if (_editSelectedEmoteIdx !== null && c.emotes && c.emotes[_editSelectedEmoteIdx]) {
      portrait = c.emotes[_editSelectedEmoteIdx].img;
      commentMetadata = { characterId: _editSelectedCharId, emoteIndex: _editSelectedEmoteIdx, avatarKind: 'emote', commentMode: 'character', schemaVersion: 2 };
    } else if (normalizeSearchText(_editCommentData?.charName) === normalizeSearchText(c.name) && _editCommentData?.portrait) {
      portrait = normalizeImageUrlForStorage(_editCommentData.portrait) || c.portrait || null;
      commentMetadata = { characterId: _editSelectedCharId, emoteIndex: null, avatarKind: 'portrait', commentMode: 'character', schemaVersion: 2 };
    } else {
      portrait = c.portrait || null;
      commentMetadata = { characterId: _editSelectedCharId, emoteIndex: null, avatarKind: 'portrait', commentMode: 'character', schemaVersion: 2 };
    }
    narrator = false;
  } else if (_editManualMode) {
    charName = document.getElementById('ec-manual-name').value.trim();
    charTitle = document.getElementById('ec-manual-title').value.trim();
    portrait = _editPortraitUrl || normalizeImageUrlForStorage(_editCommentData?.portrait || '') || null;
    narrator = false;
    commentMetadata = { characterId: '', emoteIndex: null, avatarKind: portrait ? 'manual' : 'none', commentMode: 'manual', schemaVersion: 2 };
    if (!charName) { errEl.textContent = 'Bitte Namen eingeben.'; errEl.style.display='block'; return; }
  } else {
    errEl.textContent = 'Bitte Charakter wählen oder manuell eingeben.';
    errEl.style.display='block'; return;
  }
  commentMetadata.commentKind = normalizeCommentKind(_editCommentKind, narrator);
  commentMetadata.commentSegments = editSegments;

  errEl.style.display = 'none';
  btn.disabled = true;
  btn.textContent = 'Speichere…';
  try {
    const backend = await getCommentBackend({ timeoutMs: 1200 });
    await backend.updateComment(_editTargetId, { text, charName, charTitle, portrait, narrator, ...commentMetadata });
    closeEditComment();
    await loadCommentsIntoPage(getCurrentCommentThreadId(), true);
    if (typeof refreshCurrentModuleCommenterHighlights === 'function') refreshCurrentModuleCommenterHighlights();
  } catch(e) {
    const message = getFriendlyErrorMessage(e, 'Fehler beim Speichern.');
    errEl.textContent = message;
    errEl.style.display = 'block';
    if (typeof showAppStatus === 'function') showAppStatus(message, 'error');
    btn.disabled = false;
    btn.textContent = 'Speichern';
  }
}
