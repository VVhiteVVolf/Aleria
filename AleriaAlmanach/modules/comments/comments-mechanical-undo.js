// Delete/undo flow for server-validated mechanical comments (Kampfhandlung, Kampfankündigung, Rast).
// Unlike normal comments, these never use a delete code: the server only allows removal when
// nothing newer has touched the same character/creature records, and reverts every value it changed.
function mechanicalUndoLabel(comment) {
  if (comment?.commentKind === 'combat-encounter-event') return 'diese Kampfankündigung';
  if (comment?.commentKind === 'scene-rest-event') return 'diese Rast';
  return 'diese Kampfhandlung';
}

async function confirmMechanicalUndo(commentId) {
  const safeId = String(commentId || '').trim();
  if (!safeId) return;
  const targetComment = Object.values(_commentCache || {}).flat().find(comment => comment?.id === safeId);
  const label = mechanicalUndoLabel(targetComment);
  const confirmed = confirm(
    `Willst du ${label} wirklich löschen?\n\nDadurch veränderte Werte (Trefferpunkte, Ressourcen, Erfahrung, Kampfsperren …) werden automatisch zurückgesetzt. Das funktioniert nur, wenn seitdem nichts Neueres damit passiert ist — sonst bekommst du eine Meldung, was du zuerst löschen musst.`
  );
  if (!confirmed) return;
  try {
    const backend = await getCommentBackend({ timeoutMs: 1200 });
    if (typeof backend.undoMechanicalComment !== 'function') {
      throw new Error('Löschen von Kampf-/Rast-Einträgen benötigt eine Online-Verbindung.');
    }
    const threadId = getCurrentCommentThreadId();
    await backend.undoMechanicalComment(threadId, safeId);
    await loadCommentsIntoPage(threadId, true);
    if (typeof refreshCurrentModuleCommenterHighlights === 'function') refreshCurrentModuleCommenterHighlights();
    if (typeof loadSidebarFeed === 'function') loadSidebarFeed();
    if (typeof showAppStatus === 'function') showAppStatus(`${label[0].toUpperCase()}${label.slice(1)} wurde gelöscht und zurückgesetzt.`, 'success');
  } catch (e) {
    console.error('mechanical undo failed:', e);
    const message = getFriendlyErrorMessage(e, 'Fehler beim Löschen.');
    if (typeof showAppStatus === 'function') showAppStatus(message, 'error');
  }
}

document.addEventListener('click', event => {
  const trigger = event.target?.closest?.('[data-action="undo-mechanical-comment"]');
  if (!trigger) return;
  void confirmMechanicalUndo(trigger.dataset.commentId || '');
});
