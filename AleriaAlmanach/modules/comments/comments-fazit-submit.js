// Save flow for creating Fazit comments.
async function submitFazitItem() {
  const errEl = document.getElementById('fz-error');
  const btn = document.getElementById('fz-submit');
  const threadId = getCurrentCommentThreadId();
  const item = collectFazitFormPayload();
  if (!item) {
    errEl.textContent = 'Bitte mindestens eine Zeile mit einem Baustein anlegen.';
    errEl.style.display = 'block';
    return;
  }
  if (!threadId) {
    errEl.textContent = 'Das Fazit konnte keiner Szene zugeordnet werden.';
    errEl.style.display = 'block';
    return;
  }
  const text = buildFazitPlainText(item) || item.title;

  errEl.style.display = 'none';
  btn.disabled = true;
  btn.textContent = 'Wird gespeichert …';
  const metadata = {
    commentMode: 'fazit',
    commentKind: 'narrator',
    avatarKind: 'narrator',
    characterId: '',
    emoteIndex: null,
    commentSegments: null,
    fazit: item,
    orderKey: getNextCommentOrderKey(threadId, null),
    schemaVersion: 3
  };

  let backend = null;
  try {
    backend = await getCommentBackend({ timeoutMs: 1200 });
    await backend.addComment(threadId, 'Erzähler', '', null, text, COMMENT_DELETE_CODE, true, metadata);
    closeFazitForm();
    await loadCommentsIntoPage(threadId, true, { page: 'last' });
    if (typeof refreshCurrentModuleCommenterHighlights === 'function') refreshCurrentModuleCommenterHighlights();
    loadSidebarFeed();
  } catch (error) {
    if (backend && !backend._localFallback) {
      try {
        const localBackend = getLocalCommentBackend();
        await localBackend.addComment(threadId, 'Erzähler', '', null, text, COMMENT_DELETE_CODE, true, metadata);
        showCommentFallbackNotice();
        closeFazitForm();
        await loadCommentsIntoPage(threadId, true, { page: 'last' });
        return;
      } catch (localError) {
        console.warn('local fazit fallback save failed:', localError);
      }
    }
    const message = getFriendlyErrorMessage(error, 'Fazit konnte nicht gespeichert werden.');
    errEl.textContent = message;
    errEl.style.display = 'block';
    if (typeof showAppStatus === 'function') showAppStatus(message, 'error');
    btn.disabled = false;
    btn.textContent = 'Eintragen';
  }
}
