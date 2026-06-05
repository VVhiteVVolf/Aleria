// Input and keyboard delegation for comment forms.
function handleEditCommentInput(event) {
  const field = event.target;
  if (field?.dataset?.action === 'update-showcase-preview') {
    updateShowcasePreview();
    return;
  }
  if (field?.dataset?.action === 'update-attachment-preview') {
    updateAttachmentPreview();
    return;
  }
  if (field?.dataset?.action === 'set-comment-portrait-url') {
    setCommentPortraitUrl(field.value);
    return;
  }
  if (field?.dataset?.action === 'set-edit-portrait-url') {
    setEditPortraitUrl(field.value);
  }
}

document.addEventListener('input', handleEditCommentInput);
document.addEventListener('change', handleEditCommentInput);

function handleCommentFormActionKeydown(event) {
  if (event.target?.matches?.('[data-comment-jump-input]')) {
    handleCommentJumpSearchKey(event);
    return;
  }
  if (event.key === 'Enter' && event.target?.dataset?.action === 'verify-edit-code-on-enter') {
    event.preventDefault();
    event.stopImmediatePropagation();
    if (event._commentActionHandled) return;
    event._commentActionHandled = true;
    verifyEditCode();
  }
}

document.addEventListener('keydown', handleCommentFormActionKeydown);
