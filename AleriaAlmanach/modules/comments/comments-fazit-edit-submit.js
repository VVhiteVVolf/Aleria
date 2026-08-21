// Save flow for editing Fazit comments.
async function submitEditFazit() {
  if (!_editingFazitCommentId) return submitFazitItem();

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

  const commentId = _editingFazitCommentId;
  const metadata = {
    commentMode: 'fazit',
    commentKind: 'narrator',
    avatarKind: 'narrator',
    characterId: '',
    emoteIndex: null,
    commentSegments: null,
    fazit: item,
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
    clearCurrentFazitDraft();
    closeFazitForm();
    _editingFazitCommentId = null;
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
        clearCurrentFazitDraft();
        closeFazitForm();
        _editingFazitCommentId = null;
        await loadCommentsIntoPage(threadId, true);
        return;
      } catch (localError) {
        console.warn('local fazit edit fallback save failed:', localError);
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
