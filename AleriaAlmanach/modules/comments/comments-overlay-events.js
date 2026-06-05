// Close overlays on background click
document.addEventListener('click', function(e) {
  if (e.target && e.target.id === 'delete-confirm-overlay') closeDeleteConfirm();
  if (e.target && e.target.id === 'edit-comment-overlay') closeEditComment();
  if (e.target && e.target.id === 'attachment-form-overlay') closeAttachmentForm();
  if (e.target && e.target.id === 'showcase-form-overlay') closeShowcaseForm();
  if (e.target && e.target.id === 'showcase-profile-overlay') closeCommentShowcaseProfile();
  if (e.target && e.target.id === 'char-profile-overlay') closeCharProfile();
  if (e.target && e.target.id === 'module-editor-overlay') closeModuleEditor();
});

// Close form on overlay click - use event delegation to be safe
document.addEventListener('click', function(e) {
  if (e.target && e.target.id === 'comment-form-overlay') closeCommentForm();
});


