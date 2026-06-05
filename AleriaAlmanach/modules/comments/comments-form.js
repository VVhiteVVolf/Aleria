// Comment form dialog lifecycle.
function openCommentForm() {
  const thread = getCurrentCommentThread();
  if (typeof setCommentPreviewPanelState === 'function') setCommentPreviewPanelState('split');
  _commentInsertAfterId = null;
  _portraitUrl = null;
  _selectedCharId = null;
  _selectedEmoteIdx = null;
  _manualMode = false;
  _commentMode = 'charakter';
  _commentKind = 'speech';
  _commentSegments = [makeCommentSegment('speech')];
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
  setCommentPlayerFilter('');
  showCommentDraftNote('');
  document.getElementById('cf-emote-section').style.display = 'none';
  document.getElementById('cf-emote-picker').innerHTML = '';
  document.getElementById('cf-submit').disabled = false;
  document.getElementById('cf-submit').textContent = 'Eintragen';
  document.getElementById('comment-form-title').textContent = thread?.formTitle || '*  Stimme hinterlassen  *';
  document.getElementById('cf-text').placeholder = thread?.formPlaceholder || 'Schreibe aus der Sicht deines Charakters...';
  if (document.getElementById('cf-editor')) {
    document.getElementById('cf-editor').dataset.placeholder = thread?.formPlaceholder || 'Schreibe aus der Sicht deines Charakters...';
  }
  // Reset mode to charakter
  setCommentMode('charakter');
  setCommentKind('speech');
  // Re-render picker with latest characters
  renderCharPickerInForm();
  if (typeof refreshCurrentModuleCommenterHighlights === 'function') {
    refreshCurrentModuleCommenterHighlights();
  }
  applyCommentCharacterFilter();
  restoreCommentDraft();
  renderCommentSegmentList();
  setCommentFormCounter();
  updateCommentFormPreview();
  activateDialog('comment-form-overlay', { initialFocus: '#cf-segment-list textarea, #cf-editor, #cf-text' });
  if (typeof initCommentPreviewSplitter === 'function') initCommentPreviewSplitter();
  if (typeof applyCommentPreviewLayout === 'function') applyCommentPreviewLayout();
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
  deactivateDialog('comment-form-overlay');
  _commentInsertAfterId = null;
}


// Delete confirm helpers live in modules/comments/comments-delete.js.
// Showcase cards are narrator-side inserts for items, places, maps or people.
