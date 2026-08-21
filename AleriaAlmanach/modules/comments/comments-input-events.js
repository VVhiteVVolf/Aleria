// Input and keyboard delegation for comment forms.
function handleEditCommentInput(event) {
  const field = event.target;
  if (field?.dataset?.action === 'update-showcase-preview') {
    updateShowcasePreview();
    return;
  }
  if (field?.dataset?.action === 'update-module-insert-preview') {
    if (field.id === 'mf-template') applyModuleInsertTemplateDefaults();
    updateModuleInsertPreview();
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
    return;
  }
  if (field?.dataset?.action === 'update-fazit-title') {
    updateFazitTitle(field.value);
    return;
  }
  if (field?.dataset?.action === 'update-fazit-token-icon') {
    updateFazitTokenIcon(field.dataset.lineId, field.dataset.tokenId, field.value);
    return;
  }
  if (field?.dataset?.action === 'update-fazit-token-label') {
    updateFazitTokenLabel(field.dataset.lineId, field.dataset.tokenId, field.value);
    return;
  }
  if (field?.dataset?.action === 'filter-fazit-person-picker') {
    filterFazitPersonPicker(field.value);
    return;
  }
  if (field?.dataset?.action === 'update-fazit-line-text') {
    updateFazitLineText(field.dataset.lineId, field.value);
    return;
  }
  if (field?.dataset?.action === 'update-fazit-line-tone') {
    updateFazitLineTone(field.dataset.lineId, field.value);
    return;
  }
  if (field?.dataset?.action === 'update-fazit-heading-level') {
    updateFazitHeadingLevel(field.dataset.lineId, field.value);
    return;
  }
  if (field?.dataset?.action === 'update-fazit-line-align') {
    updateFazitLineAlign(field.dataset.lineId, field.value);
    return;
  }
  if (field?.dataset?.action === 'update-fazit-list-item') {
    updateFazitListItem(field.dataset.lineId, field.dataset.itemId, field.value);
    return;
  }
  if (field?.dataset?.action === 'update-fazit-list-style') {
    updateFazitListStyle(field.dataset.lineId, field.value);
    return;
  }
  if (field?.dataset?.action === 'update-fazit-token-size') {
    updateFazitTokenSize(field.dataset.lineId, field.dataset.tokenId, field.value);
    return;
  }
  if (field?.dataset?.action === 'update-fazit-token-variant') {
    updateFazitTokenVariant(field.dataset.lineId, field.dataset.tokenId, field.value);
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
    return;
  }
  if (event.key === 'Enter' && event.target?.id === 'fz-chat-input' && !event.shiftKey) {
    event.preventDefault();
    void sendFazitChatMessage();
    return;
  }
  if (event.key === 'Enter' && event.target?.dataset?.action === 'update-fazit-list-item' && !event.shiftKey) {
    event.preventDefault();
    addFazitListItem(event.target.dataset.lineId, event.target.dataset.itemId);
  }
}

document.addEventListener('keydown', handleCommentFormActionKeydown);
