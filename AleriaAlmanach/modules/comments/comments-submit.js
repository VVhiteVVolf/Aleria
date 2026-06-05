// Comment submit flow.
// Keeps save, fallback, and post-save reload behavior separate from form rendering.

async function submitComment() {
  syncCommentSegmentsToLegacyText();
  const commentSegments = buildCommentSegmentsForSave();
  const text  = commentSegments.map(segment => segment.text).join('\n\n').trim();
  const errEl = document.getElementById('cf-error');
  const btn   = document.getElementById('cf-submit');
  const threadId = getCurrentCommentThreadId();

  let isNarrator = _commentMode === 'narrator';
  let name, title, portrait;
  let commentMetadata = { commentMode: isNarrator ? 'narrator' : 'character' };

  if (isNarrator) {
    name = 'Erzähler'; title = ''; portrait = null;
    commentMetadata = { commentMode: 'narrator', avatarKind: 'narrator', characterId: '', emoteIndex: null };
  } else if (_selectedCharId) {
    const c = getAvailableCommentCharacterById(_selectedCharId);
    if (!c) { errEl.textContent = 'Charakter nicht gefunden.'; errEl.style.display='block'; return; }
    if (!isCommentCharacterAllowedForActivePlayer(c)) {
      errEl.textContent = `${c.name} ist ${getCommentPlayerOwnerLabel(c.playerOwner || c.playedBy || c.player)} zugewiesen.`;
      errEl.style.display='block';
      return;
    }
    name = c.name; title = c.title || '';
    if (_selectedEmoteIdx !== null && c.emotes && c.emotes[_selectedEmoteIdx]) {
      portrait = c.emotes[_selectedEmoteIdx].img;
      commentMetadata = { commentMode: 'character', avatarKind: 'emote', characterId: _selectedCharId, emoteIndex: _selectedEmoteIdx };
    } else {
      portrait = c.portrait || null;
      commentMetadata = { commentMode: 'character', avatarKind: 'portrait', characterId: _selectedCharId, emoteIndex: null };
    }
  } else if (_manualMode) {
    name    = document.getElementById('cf-name').value.trim();
    title   = document.getElementById('cf-title').value.trim();
    portrait = _portraitUrl || null;
    commentMetadata = { commentMode: 'manual', avatarKind: portrait ? 'manual' : 'none', characterId: '', emoteIndex: null };
    if (!name) { errEl.textContent = 'Bitte einen Charakternamen eingeben.'; errEl.style.display='block'; return; }
  } else {
    errEl.textContent = 'Bitte einen Charakter auswählen oder manuell eingeben.';
    errEl.style.display='block'; return;
  }
  commentMetadata.commentKind = normalizeCommentKind(_commentKind, isNarrator);
  commentMetadata.commentSegments = commentSegments;
  commentMetadata.orderKey = getNextCommentOrderKey(threadId, _commentInsertAfterId);

  if (!text) { errEl.textContent = 'Bitte einen Text schreiben.'; errEl.style.display='block'; return; }
  if (text.length > COMMENT_MAX_LENGTH) { errEl.textContent = `Bitte bei maximal ${COMMENT_MAX_LENGTH} Zeichen bleiben.`; errEl.style.display='block'; return; }
  if (!threadId) { errEl.textContent = 'Der Kommentar konnte keinem Eintrag zugeordnet werden.'; errEl.style.display='block'; return; }
  if (_commentSubmitInFlight) return;
  _commentSubmitInFlight = true;
  errEl.style.display = 'none';
  btn.disabled = true;
  btn.textContent = 'Wird gespeichert...';

  const deleteCode = COMMENT_DELETE_CODE;
  let backend = null;

  try {
    backend = await getCommentBackend({ timeoutMs: 1200 });
    await backend.addComment(
      threadId, name, title, portrait, text, deleteCode, isNarrator, commentMetadata
    );
    clearCommentDraft(threadId);
    closeCommentForm();
    await loadCommentsIntoPage(threadId, true, _commentInsertAfterId ? {} : { page: 'last' });
    if (typeof refreshCurrentModuleCommenterHighlights === 'function') refreshCurrentModuleCommenterHighlights();
    loadSidebarFeed(); // refresh activity feed
    btn.textContent = 'Eintragen';
    _commentSubmitInFlight = false;
  } catch(e) {
    if (backend && !backend._localFallback) {
      try {
        const localBackend = getLocalCommentBackend();
        await localBackend.addComment(threadId, name, title, portrait, text, deleteCode, isNarrator, commentMetadata);
        showCommentFallbackNotice();
        clearCommentDraft(threadId);
        closeCommentForm();
        await loadCommentsIntoPage(threadId, true, _commentInsertAfterId ? {} : { page: 'last' });
        btn.disabled = false;
        btn.textContent = 'Eintragen';
        _commentSubmitInFlight = false;
        return;
      } catch (localError) {
        console.warn('local comment fallback save failed:', localError);
      }
    }
    const message = getFriendlyErrorMessage(e, 'Fehler beim Speichern. Bitte erneut versuchen.');
    errEl.textContent = message;
    errEl.style.display = 'block';
    if (typeof showAppStatus === 'function') showAppStatus(message, 'error');
    btn.disabled = false;
    btn.textContent = 'Eintragen';
    _commentSubmitInFlight = false;
  }
}
