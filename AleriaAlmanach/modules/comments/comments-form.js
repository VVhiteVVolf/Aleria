// Comment form dialog lifecycle.
let _commentFormInitialRenderToken = 0;

function scheduleCommentFormInitialRender(token) {
  const scheduleFrame = typeof requestAnimationFrame === 'function'
    ? requestAnimationFrame
    : callback => setTimeout(callback, 0);
  scheduleFrame(() => setTimeout(() => {
    if (token !== _commentFormInitialRenderToken || !isCommentFormOpen()) return;
    renderCharPickerInForm();
    renderCommentSegmentList();
    setCommentFormCounter();
    updateCommentFormPreview();
    document.querySelector('#cf-segment-list textarea, #cf-editor, #cf-text')?.focus?.({ preventScroll: true });
  }, 0));
}

function openCommentForm() {
  const initialRenderToken = ++_commentFormInitialRenderToken;
  const thread = getCurrentCommentThread();
  if (typeof setCommentPreviewPanelState === 'function') setCommentPreviewPanelState('split');
  _commentInsertAfterId = null;
  _portraitUrl = null;
  _selectedCharId = null;
  _selectedEmoteIdx = null;
  _selectedImageSetId = CHARACTER_IMAGE_SET_DEFAULT_ID;
  _manualMode = false;
  _commentMode = 'charakter';
  _commentKind = 'speech';
  _commentSegments = [makeCommentSegment('speech')];
  window.AleriaCommentSceneCast?.resetCreate?.();
  document.getElementById('cf-name').value    = '';
  document.getElementById('cf-title').value   = '';
  setRichEditorContent('cf-text', '');
  document.getElementById('cf-error').style.display = 'none';
  const prev = document.getElementById('cf-portrait-preview');
  if (prev) {
    prev.removeAttribute('src');
    prev.style.display = 'none';
  }
  const portraitUrlInput = document.getElementById('cf-portrait-url');
  if (portraitUrlInput) portraitUrlInput.value = '';
  document.getElementById('cf-manual-fields').style.display = 'none';
  document.getElementById('cf-manual-toggle').textContent = '+ Manuell eingeben';
  document.getElementById('cf-selected-name').textContent = '';
  document.getElementById('cf-char-search').value = '';
  setCommentPlayerFilter('', { render: false, persist: false });
  showCommentDraftNote('');
  document.getElementById('cf-submit').disabled = false;
  document.getElementById('cf-submit').textContent = 'Eintragen';
  if (typeof resetCommentAssistant === 'function') resetCommentAssistant();
  document.getElementById('comment-form-title').textContent = thread?.formTitle || '*  Stimme hinterlassen  *';
  document.getElementById('cf-text').placeholder = thread?.formPlaceholder || 'Schreibe aus der Sicht deines Charakters...';
  if (document.getElementById('cf-editor')) {
    document.getElementById('cf-editor').dataset.placeholder = thread?.formPlaceholder || 'Schreibe aus der Sicht deines Charakters...';
  }
  // Reset mode to charakter
  setCommentMode('charakter', { render: false, persist: false });
  setCommentKind('speech', { render: false, persist: false });
  if (typeof refreshCurrentModuleCommenterHighlights === 'function') {
    refreshCurrentModuleCommenterHighlights();
  }
  restoreCommentDraft({ render: false });
  document.getElementById('cf-char-picker')?.replaceChildren();
  document.getElementById('cf-segment-list')?.replaceChildren();
  document.getElementById('cf-preview')?.replaceChildren();
  setCommentFormCounter();
  activateDialog('comment-form-overlay', { initialFocus: '#cf-char-search' });
  if (typeof initCommentPreviewSplitter === 'function') initCommentPreviewSplitter();
  if (typeof applyCommentPreviewLayout === 'function') applyCommentPreviewLayout();
  scheduleCommentFormInitialRender(initialRenderToken);
}

function openCommentFormAfter(commentId) {
  openCommentForm();
  _commentInsertAfterId = String(commentId || '');
  const title = document.getElementById('comment-form-title');
  if (title) title.textContent = '*  Nachträglich antworten  *';
  const note = document.getElementById('cf-draft-note');
  if (note) note.textContent = 'Antwort wird an der gewählten Stelle eingefügt';
}

function closeCommentForm() {
  _commentFormInitialRenderToken += 1;
  deactivateDialog('comment-form-overlay');
  _commentInsertAfterId = null;
}


// Delete confirm helpers live in modules/comments/comments-delete.js.
// Showcase cards are narrator-side inserts for items, places, maps or people.
