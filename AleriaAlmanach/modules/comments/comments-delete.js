// Delete confirmation dialog and delete submit flow.
let _deleteTargetId = null;

function openDeleteConfirm(commentId) {
  _deleteTargetId = commentId;
  document.getElementById('dc-code').value = '';
  document.getElementById('dc-error').style.display = 'none';
  document.getElementById('dc-submit').disabled = false;
  activateDialog('delete-confirm-overlay', { initialFocus: '#dc-code' });
}

function closeDeleteConfirm() {
  deactivateDialog('delete-confirm-overlay');
  _deleteTargetId = null;
}

async function confirmDelete() {
  const code = document.getElementById('dc-code').value.trim().toUpperCase();
  const errEl = document.getElementById('dc-error');
  const btn   = document.getElementById('dc-submit');
  if (!code) { errEl.textContent = 'Bitte Code eingeben.'; errEl.style.display='block'; return; }
  errEl.style.display = 'none';
  btn.disabled = true;
  btn.textContent = 'Lösche…';
  try {
    const backend = await getCommentBackend({ timeoutMs: 1200 });
    await backend.deleteComment(_deleteTargetId, code);
    closeDeleteConfirm();
    await loadCommentsIntoPage(getCurrentCommentThreadId(), true);
    if (typeof refreshCurrentModuleCommenterHighlights === 'function') refreshCurrentModuleCommenterHighlights();
    loadSidebarFeed();
  } catch(e) {
    const message = e.message === 'Falscher Code'
      ? 'Falscher Code. Bitte erneut versuchen.'
      : getFriendlyErrorMessage(e, 'Fehler beim Löschen.');
    errEl.textContent = message;
    errEl.style.display = 'block';
    if (e.message !== 'Falscher Code' && typeof showAppStatus === 'function') showAppStatus(message, 'error');
    btn.disabled = false;
    btn.textContent = 'Löschen';
  }
}
