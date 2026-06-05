(function() {
  let _tx = 0;
  let _ty = 0;
  let _swiping = false;

  document.addEventListener('touchstart', event => {
    const overlay = document.getElementById('modal-overlay');
    if (!overlay || !overlay.classList.contains('active')) return;
    if (event.target.closest('button, input, textarea, .comments-scroll, .wanted-page')) return;
    _tx = event.touches[0].clientX;
    _ty = event.touches[0].clientY;
    _swiping = true;
  }, { passive: true });

  document.addEventListener('touchend', event => {
    if (!_swiping) return;
    _swiping = false;
    const dx = event.changedTouches[0].clientX - _tx;
    const dy = event.changedTouches[0].clientY - _ty;
    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    if (dx < 0) flipPage(1);
    else flipPage(-1);
  }, { passive: true });
})();

document.addEventListener('input', event => {
  if (event.target.closest('#module-editor-overlay') && event.target.id !== 'me-json') {
    syncModuleJsonPreview();
  }
  if (event.target.id === 'cf-editor') {
    handleRichEditorChange('cf-text');
    return;
  }
  if (event.target.id === 'ec-editor') {
    handleRichEditorChange('ec-text');
    return;
  }
  if (['cf-text', 'cf-name', 'cf-title'].includes(event.target.id)) {
    setCommentFormCounter();
    updateCommentFormPreview();
    persistCommentDraft();
  }
  if (event.target.id === 'cf-char-search') {
    applyCommentCharacterFilter();
    persistCommentDraft();
  }
  if (['ec-text', 'ec-manual-name', 'ec-manual-title'].includes(event.target.id)) {
    setEditFormCounter();
    updateEditFormPreview();
  }
  if (event.target.id === 'ec-char-search') {
    applyEditCharacterFilter();
  }
});

document.addEventListener('change', event => {
  if (event.target.closest('#module-editor-overlay') && event.target.id !== 'me-json') {
    syncModuleJsonPreview();
  }
});

document.addEventListener('keydown', event => {
  const commentOpen = isCommentFormOpen();
  const attachmentOpen = document.getElementById('attachment-form-overlay')?.classList.contains('active');
  const editOpen = document.getElementById('edit-comment-overlay')?.classList.contains('active');
  const deleteOpen = document.getElementById('delete-confirm-overlay')?.classList.contains('active');
  const moduleEditorOpen = document.getElementById('module-editor-overlay')?.classList.contains('active');

  if ((event.target?.id === 'cf-editor' || event.target?.id === 'ec-editor') && (event.ctrlKey || event.metaKey)) {
    const fieldId = event.target.id === 'cf-editor' ? 'cf-text' : 'ec-text';
    const key = String(event.key || '').toLowerCase();
    if (key === 'b') { event.preventDefault(); fmtWrap(fieldId, '**', '**'); return; }
    if (key === 'i') { event.preventDefault(); fmtWrap(fieldId, '*', '*'); return; }
    if (key === 'u') { event.preventDefault(); fmtWrap(fieldId, '__', '__'); return; }
  }

  if (event.key === 'Escape') {
    if (moduleEditorOpen) { event.preventDefault(); closeModuleEditor(); return; }
    if (deleteOpen) { event.preventDefault(); closeDeleteConfirm(); return; }
    if (editOpen) { event.preventDefault(); closeEditComment(); return; }
    if (attachmentOpen) { event.preventDefault(); closeAttachmentForm(); return; }
    if (commentOpen) { event.preventDefault(); closeCommentForm(); return; }
  }

  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    if (commentOpen) { event.preventDefault(); submitComment(); return; }
    if (attachmentOpen) { event.preventDefault(); submitEditAttachment(); return; }
    if (editOpen) {
      event.preventDefault();
      if (document.getElementById('edit-step-form')?.classList.contains('visible')) submitEditComment();
      else verifyEditCode();
    }
  }

  if (deleteOpen && event.key === 'Enter' && event.target?.id === 'dc-code') {
    event.preventDefault();
    confirmDelete();
  }
});
