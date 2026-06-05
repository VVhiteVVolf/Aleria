// Shared state and lightweight state transitions for editing existing comments.
let _editTargetId = null;
let _editCommentData = null;
let _editMode = 'charakter'; // 'charakter' | 'narrator'
let _editCommentKind = 'speech';
let _editSelectedCharId = null;
let _editSelectedEmoteIdx = null;
let _editManualMode = false;
let _editPortraitUrl = null;
let _editCommentSegments = [];

function setEditCommentKind(kind) {
  _editCommentKind = normalizeCommentKind(kind);
  if (_editCommentKind === 'narrator') _editCommentKind = 'speech';
  document.querySelectorAll('[data-edit-comment-kind]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.editCommentKind === _editCommentKind);
  });
  updateEditFormPreview();
}

function setEditMode(mode) {
  _editMode = mode;
  document.getElementById('ec-mode-char').classList.toggle('active', mode === 'charakter');
  document.getElementById('ec-mode-narrator').classList.toggle('active', mode === 'narrator');
  document.getElementById('ec-char-section').style.display = mode === 'narrator' ? 'none' : 'block';
  document.getElementById('ec-narrator-hint').style.display = mode === 'narrator' ? 'block' : 'none';
  if (mode === 'narrator') {
    _editCommentKind = 'action';
    coerceCommentSegmentsForMode(true);
  }
  renderCommentSegmentActions(true);
  renderEditCommentSegmentList();
  updateEditFormPreview();
}

function setEditFormCounter() {
  const textarea = document.getElementById('ec-text');
  const counter = document.getElementById('ec-counter');
  if (!textarea || !counter) return;
  const length = textarea.value.length;
  counter.textContent = `${length} / ${COMMENT_MAX_LENGTH} Zeichen`;
  counter.classList.toggle('limit', length > COMMENT_MAX_LENGTH - 200);
}
