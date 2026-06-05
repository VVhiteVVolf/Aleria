// Save flow for editing showcase comments.
async function submitEditShowcase() {
  if (!_editingShowcaseCommentId) {
    return submitShowcaseItem();
  }
  
  const errEl = document.getElementById('sf-error');
  const btn = document.getElementById('sf-submit');
  const threadId = getCurrentCommentThreadId();
  const item = collectShowcaseFormPayload();
  
  if (!item) {
    errEl.textContent = 'Bitte mindestens einen Titel eintragen.';
    errEl.style.display = 'block';
    return;
  }
  
  const image = normalizeImageUrlForStorage(item.image || '');
  if (item.image && !image) {
    errEl.textContent = 'Die Bild-URL ist ungültig oder nicht erlaubt.';
    errEl.style.display = 'block';
    return;
  }
  item.image = image;
  
  const text = item.description || item.teaser || `${getShowcaseKindLabel(item.kind)}: ${item.title}`;
  if (text.length > COMMENT_MAX_LENGTH) {
    errEl.textContent = `Bitte bei maximal ${COMMENT_MAX_LENGTH} Zeichen bleiben.`;
    errEl.style.display = 'block';
    return;
  }
  
  if (!threadId) {
    errEl.textContent = 'Die Vorstellung konnte keiner Szene zugeordnet werden.';
    errEl.style.display = 'block';
    return;
  }
  
  errEl.style.display = 'none';
  btn.disabled = true;
  btn.textContent = 'Wird gespeichert...';
  
  const commentId = _editingShowcaseCommentId;
  const metadata = {
    commentMode: 'showcase',
    commentKind: 'narrator',
    avatarKind: 'narrator',
    characterId: '',
    emoteIndex: null,
    commentSegments: null,
    itemShowcase: item,
    schemaVersion: 3
  };
  
  let backend = null;
  try {
    backend = await getCommentBackend({ timeoutMs: 1200 });
    await backend.updateComment(commentId, {
      text,
      charName: 'Erzähler',
      charTitle: '',
      portrait: null,
      narrator: true,
      ...metadata
    });
    closeShowcaseForm();
    _editingShowcaseCommentId = null;
    await loadCommentsIntoPage(threadId, true);
    if (typeof refreshCurrentModuleCommenterHighlights === 'function') refreshCurrentModuleCommenterHighlights();
    loadSidebarFeed();
  } catch (error) {
    if (backend && !backend._localFallback) {
      try {
        const localBackend = getLocalCommentBackend();
        await localBackend.updateComment(commentId, {
          text,
          charName: 'Erzähler',
          charTitle: '',
          portrait: null,
          narrator: true,
          ...metadata
        });
        showCommentFallbackNotice();
        closeShowcaseForm();
        _editingShowcaseCommentId = null;
        await loadCommentsIntoPage(threadId, true);
        return;
      } catch (localError) {
        console.warn('local showcase edit fallback save failed:', localError);
      }
    }
    const message = getFriendlyErrorMessage(error, 'Änderungen konnten nicht gespeichert werden.');
    errEl.textContent = message;
    errEl.style.display = 'block';
    if (typeof showAppStatus === 'function') showAppStatus(message, 'error');
    btn.disabled = false;
    btn.textContent = 'Änderungen speichern';
  }
}

