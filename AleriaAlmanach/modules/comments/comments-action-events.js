// Click action delegation for comment forms and tools.
const COMMENT_FORM_CLICK_ACTIONS = new Set([
  'open-comment-form',
  'open-showcase-form',
  'open-attachment-form',
  'open-comment-form-after',
  'open-showcase-form-after',
  'open-attachment-form-after',
  'open-edit-comment',
  'open-edit-showcase-form',
  'open-edit-attachment-form',
  'open-delete-confirm',
  'open-comment-showcase-profile',
  'set-comment-mode',
  'set-comment-player-filter',
  'set-comment-kind',
  'toggle-manual-mode',
  'select-comment-character',
  'select-comment-emote',
  'insert-comment-emote-break',
  'remove-comment-emote',
  'add-comment-emote',
  'set-edit-mode',
  'set-edit-comment-kind',
  'toggle-edit-manual-mode',
  'verify-edit-code',
  'add-showcase-info-row',
  'remove-showcase-info-row',
  'select-edit-character',
  'select-edit-emote',
  'insert-edit-comment-emote-break',
  'set-comment-turn',
  'toggle-comment-tools',
  'toggle-comment-quick-tools',
  'toggle-comment-preview',
  'toggle-session-focus-mode',
  'jump-to-latest-comment-author',
  'scroll-comments',
  'set-comment-page',
  'reset-comment-reader-settings',
  'close-comment-form',
  'close-showcase-form',
  'close-attachment-form',
  'close-edit-comment',
  'close-delete-confirm',
  'close-comment-showcase-profile',
  'submit-comment',
  'submit-showcase',
  'submit-attachment',
  'submit-edit-comment',
  'confirm-delete-comment'
]);

function handleCommentFormActionClick(event) {
  const trigger = event.target?.closest?.('[data-action]');
  if (!trigger || !COMMENT_FORM_CLICK_ACTIONS.has(trigger.dataset.action)) return;

  event.preventDefault();
  const action = trigger.dataset.action;
  const commentId = trigger.dataset.commentId || trigger.closest('[data-comment-id]')?.dataset.commentId || '';

  if (action === 'open-comment-form') {
    openCommentForm();
    return;
  }
  if (action === 'open-showcase-form') {
    openShowcaseForm();
    return;
  }
  if (action === 'open-attachment-form') {
    openAttachmentForm();
    return;
  }
  if (action === 'open-comment-form-after') {
    openCommentFormAfter(commentId);
    return;
  }
  if (action === 'open-showcase-form-after') {
    openShowcaseFormAfter(commentId);
    return;
  }
  if (action === 'open-attachment-form-after') {
    openAttachmentFormAfter(commentId);
    return;
  }
  if (action === 'open-edit-comment') {
    openEditComment(commentId);
    return;
  }
  if (action === 'open-edit-showcase-form') {
    openEditShowcaseForm(commentId);
    return;
  }
  if (action === 'open-edit-attachment-form') {
    openEditAttachmentForm(commentId);
    return;
  }
  if (action === 'open-delete-confirm') {
    openDeleteConfirm(commentId);
    return;
  }
  if (action === 'open-comment-showcase-profile') {
    openCommentShowcaseProfile(commentId);
    return;
  }
  if (action === 'set-comment-mode') {
    setCommentMode(trigger.dataset.mode || 'charakter');
    return;
  }
  if (action === 'set-comment-player-filter') {
    setCommentPlayerFilter(trigger.dataset.commentPlayerFilter || '');
    return;
  }
  if (action === 'set-comment-kind') {
    setCommentKind(trigger.dataset.commentKind || 'speech');
    return;
  }
  if (action === 'toggle-manual-mode') {
    toggleManualMode();
    return;
  }
  if (action === 'select-comment-character') {
    if (trigger.getAttribute('aria-disabled') === 'true') return;
    selectCharForComment(trigger.dataset.id || '');
    return;
  }
  if (action === 'select-comment-emote') {
    selectEmote(Number(trigger.dataset.emoteIdx) || 0);
    return;
  }
  if (action === 'insert-comment-emote-break') {
    insertCommentEmoteBreak(Number(trigger.dataset.emoteIdx) || 0, event);
    return;
  }
  if (action === 'remove-comment-emote') {
    removeEmoteFromSelectedCommentCharacter(Number(trigger.dataset.emoteIdx) || 0, event);
    return;
  }
  if (action === 'add-comment-emote') {
    addEmoteToSelectedCommentCharacter();
    return;
  }
  if (action === 'set-edit-mode') {
    setEditMode(trigger.dataset.mode || 'charakter');
    return;
  }
  if (action === 'set-edit-comment-kind') {
    setEditCommentKind(trigger.dataset.editCommentKind || 'speech');
    return;
  }
  if (action === 'toggle-edit-manual-mode') {
    toggleEditManualMode();
    return;
  }
  if (action === 'verify-edit-code') {
    verifyEditCode();
    return;
  }
  if (action === 'add-showcase-info-row') {
    addShowcaseInfoRow();
    return;
  }
  if (action === 'remove-showcase-info-row') {
    removeShowcaseInfoRow(trigger.dataset.infoIndex || 0);
    return;
  }
  if (action === 'select-edit-character') {
    selectEditChar(trigger.dataset.id || '');
    return;
  }
  if (action === 'select-edit-emote') {
    selectEditEmote(Number(trigger.dataset.editEmoteIdx) || 0);
    return;
  }
  if (action === 'insert-edit-comment-emote-break') {
    insertEditCommentEmoteBreak(Number(trigger.dataset.editEmoteIdx) || 0, event);
    return;
  }
  if (action === 'set-comment-turn') {
    setCommentTurnFromButton(trigger, trigger.dataset.turnValue || '');
    return;
  }
  if (action === 'toggle-comment-tools') {
    toggleCommentToolsVisibility();
    return;
  }
  if (action === 'toggle-comment-quick-tools') {
    toggleCommentQuickToolsVisibility();
    return;
  }
  if (action === 'toggle-comment-preview') {
    toggleCommentPreviewPanel(trigger.dataset.previewMode || '', trigger);
    return;
  }
  if (action === 'toggle-session-focus-mode') {
    toggleSessionFocusMode(trigger);
    return;
  }
  if (action === 'jump-to-latest-comment-author') {
    jumpToLatestCommentByAuthor(trigger);
    return;
  }
  if (action === 'scroll-comments') {
    scrollActiveComments(trigger.dataset.direction || 'bottom', trigger);
    return;
  }
  if (action === 'set-comment-page') {
    setCommentPageFromTrigger(trigger);
    return;
  }
  if (action === 'reset-comment-reader-settings') {
    resetCommentReaderSettings();
    return;
  }
  if (action === 'close-comment-form') {
    closeCommentForm();
    return;
  }
  if (action === 'close-showcase-form') {
    closeShowcaseForm();
    return;
  }
  if (action === 'close-attachment-form') {
    closeAttachmentForm();
    return;
  }
  if (action === 'close-edit-comment') {
    closeEditComment();
    return;
  }
  if (action === 'close-delete-confirm') {
    closeDeleteConfirm();
    return;
  }
  if (action === 'close-comment-showcase-profile') {
    closeCommentShowcaseProfile();
    return;
  }
  if (action === 'submit-comment') {
    submitComment();
    return;
  }
  if (action === 'submit-showcase') {
    submitEditShowcase();
    return;
  }
  if (action === 'submit-attachment') {
    submitEditAttachment();
    return;
  }
  if (action === 'submit-edit-comment') {
    submitEditComment();
    return;
  }
  if (action === 'confirm-delete-comment') {
    confirmDelete();
  }
}

document.addEventListener('click', handleCommentFormActionClick);
