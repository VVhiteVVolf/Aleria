// Save flow for creating showcase comments.
async function submitShowcaseItem() {
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
  const metadata = {
    commentMode: 'showcase',
    commentKind: 'narrator',
    avatarKind: 'narrator',
    characterId: '',
    emoteIndex: null,
    commentSegments: null,
    itemShowcase: item,
    orderKey: getNextCommentOrderKey(threadId, _showcaseInsertAfterId),
    schemaVersion: 3
  };

  let backend = null;
  try {
    backend = await getCommentBackend({ timeoutMs: 1200 });
    await backend.addComment(threadId, 'Erzähler', '', null, text, COMMENT_DELETE_CODE, true, metadata);
    closeShowcaseForm();
    await loadCommentsIntoPage(threadId, true, _showcaseInsertAfterId ? {} : { page: 'last' });
    if (typeof refreshCurrentModuleCommenterHighlights === 'function') refreshCurrentModuleCommenterHighlights();
    loadSidebarFeed();
  } catch (error) {
    if (backend && !backend._localFallback) {
      try {
        const localBackend = getLocalCommentBackend();
        await localBackend.addComment(threadId, 'Erzähler', '', null, text, COMMENT_DELETE_CODE, true, metadata);
        showCommentFallbackNotice();
        closeShowcaseForm();
        await loadCommentsIntoPage(threadId, true, _showcaseInsertAfterId ? {} : { page: 'last' });
        return;
      } catch (localError) {
        console.warn('local showcase fallback save failed:', localError);
      }
    }
    const message = getFriendlyErrorMessage(error, 'Vorstellung konnte nicht gespeichert werden.');
    errEl.textContent = message;
    errEl.style.display = 'block';
    if (typeof showAppStatus === 'function') showAppStatus(message, 'error');
    btn.disabled = false;
    btn.textContent = 'Vorstellen';
  }
}

