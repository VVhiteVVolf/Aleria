// Shared state and lightweight state transitions for editing existing comments.
let _editTargetId = null;
let _editCommentData = null;
let _editMode = 'charakter'; // 'charakter' | 'creature' | 'narrator'
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
  mode = normalizeCommentComposerMode(mode);
  _editMode = mode;
  document.getElementById('ec-mode-char')?.classList.toggle('active', mode === 'charakter');
  document.getElementById('ec-mode-creature')?.classList.toggle('active', mode === 'creature');
  document.getElementById('ec-mode-narrator')?.classList.toggle('active', mode === 'narrator');
  document.getElementById('ec-char-section').style.display = mode === 'narrator' ? 'none' : 'block';
  document.getElementById('ec-char-section').dataset.actorMode = mode;
  document.getElementById('ec-narrator-hint').style.display = mode === 'narrator' ? 'block' : 'none';
  const creatureMode = mode === 'creature';
  const label = document.getElementById('ec-actor-select-label');
  const search = document.getElementById('ec-char-search');
  const empty = document.getElementById('ec-char-search-empty');
  const manualToggle = document.getElementById('ec-manual-toggle');
  if (label) label.textContent = creatureMode ? 'Kreatur wählen' : 'Charakter wählen';
  if (search) search.placeholder = creatureMode ? 'Kreatur suchen...' : 'Figur suchen...';
  if (empty) empty.textContent = creatureMode ? 'Keine passende Kreatur im Kreaturenregister gefunden.' : 'Keine passende Figur gefunden. Du kannst stattdessen manuell bearbeiten.';
  if (manualToggle) manualToggle.hidden = creatureMode;
  const selectedActor = _editSelectedCharId ? getAvailableCommentCharacterById(_editSelectedCharId) : null;
  if (mode !== 'narrator' && _editSelectedCharId && !commentActorMatchesComposerMode(selectedActor, mode)) {
    _editSelectedCharId = null;
    _editSelectedEmoteIdx = null;
    document.getElementById('ec-selected-name').textContent = '';
    document.getElementById('ec-emote-section').style.display = 'none';
    document.getElementById('ec-emote-picker').innerHTML = '';
  }
  if (mode !== 'charakter' && _editManualMode) {
    _editManualMode = false;
    document.getElementById('ec-manual-fields').style.display = 'none';
  }
  if (mode === 'narrator') {
    _editCommentKind = 'action';
    coerceCommentSegmentsForMode(true);
  }
  if (mode !== 'narrator' && typeof renderEditCharPicker === 'function') renderEditCharPicker();
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
