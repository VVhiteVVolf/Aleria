// Shared state and lightweight state transitions for the new-comment form.
const COMMENT_MAX_LENGTH = 250000;
const COMMENT_DRAFT_PREFIX = 'aleria-comment-draft:';
const COMMENT_DELETE_CODE = '7777';
let _commentDraftTimer = null;
let _portraitUrl = null;
let _commentMode = 'charakter'; // 'charakter' | 'narrator'
let _commentKind = 'speech';
let _commentPlayerFilter = ''; // '' | 'erdi' | 'patrick'
let _commentSegments = [];
let _commentSegmentSeq = 0;
let _commentInsertAfterId = null;
let _commentSubmitInFlight = false;

function normalizeCommentPlayerOwner(value) {
  const normalized = normalizeSearchText(value || '');
  if (normalized === 'erdi') return 'erdi';
  if (normalized === 'patrick') return 'patrick';
  return '';
}

function getCommentPlayerFilter() {
  return _commentPlayerFilter;
}

function getCommentPlayerOwnerLabel(value) {
  const owner = normalizeCommentPlayerOwner(value);
  if (owner === 'erdi') return 'Erdi';
  if (owner === 'patrick') return 'Patrick';
  return '';
}

function isCommentCharacterAllowedForActivePlayer(char) {
  const activePlayer = normalizeCommentPlayerOwner(_commentPlayerFilter);
  if (!activePlayer) return true;
  const owner = normalizeCommentPlayerOwner(char?.playerOwner || char?.playedBy || char?.player);
  return !owner || owner === activePlayer;
}

function setCommentPlayerFilter(player) {
  _commentPlayerFilter = normalizeCommentPlayerOwner(player);
  document.querySelectorAll('[data-comment-player-filter]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.commentPlayerFilter === _commentPlayerFilter);
  });
  const activeLabel = document.getElementById('cf-player-filter-active');
  if (activeLabel) {
    activeLabel.textContent = _commentPlayerFilter
      ? `${getCommentPlayerOwnerLabel(_commentPlayerFilter)}s Figuren`
      : 'Alle Figuren';
  }
  if (_selectedCharId) {
    const selected = getAvailableCommentCharacterById(_selectedCharId);
    if (selected && !isCommentCharacterAllowedForActivePlayer(selected)) {
      _selectedCharId = null;
      _selectedEmoteIdx = null;
      document.getElementById('cf-selected-name').textContent = '';
      document.getElementById('cf-emote-section').style.display = 'none';
      document.getElementById('cf-emote-picker').innerHTML = '';
    }
  }
  if (typeof renderCharPickerInForm === 'function') renderCharPickerInForm();
  updateCommentFormPreview();
  persistCommentDraft();
}

function setCommentKind(kind) {
  _commentKind = normalizeCommentKind(kind);
  if (_commentKind === 'narrator') _commentKind = 'speech';
  document.querySelectorAll('[data-comment-kind]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.commentKind === _commentKind);
  });
  updateCommentFormPreview();
  persistCommentDraft();
}

function normalizeImageUrlForStorage(value) {
  const raw = String(value || '').trim();
  if (!raw || /^data:/i.test(raw)) return null;
  return sanitizeImageSrc(raw) ? raw : null;
}

function setCommentPortraitUrl(value) {
  const url = normalizeImageUrlForStorage(value);
  _portraitUrl = url;
  const input = document.getElementById('cf-portrait-url');
  const preview = document.getElementById('cf-portrait-preview');
  const errEl = document.getElementById('cf-error');
  if (input && input.value !== String(value || '')) input.value = String(value || '');
  if (preview && url) {
    preview.src = url;
    preview.style.display = 'block';
  } else if (preview) {
    preview.removeAttribute('src');
    preview.style.display = 'none';
  }
  if (errEl && value && !url) {
    errEl.textContent = 'Bitte eine gueltige http(s)-Bild-URL verwenden.';
    errEl.style.display = 'block';
  } else if (errEl) {
    errEl.style.display = 'none';
  }
  updateCommentFormPreview();
  persistCommentDraft(true);
}

function isCommentFormOpen() {
  return document.getElementById('comment-form-overlay')?.classList.contains('active');
}

function getCommentDraftKey(threadId = getCurrentCommentThreadId()) {
  return threadId ? `${COMMENT_DRAFT_PREFIX}${threadId}` : '';
}

function showCommentDraftNote(message = '') {
  const note = document.getElementById('cf-draft-note');
  if (note) note.textContent = message;
}

function setCommentFormCounter() {
  const textarea = document.getElementById('cf-text');
  const counter = document.getElementById('cf-counter');
  if (!textarea || !counter) return;
  const length = textarea.value.length;
  counter.textContent = `${length} / ${COMMENT_MAX_LENGTH} Zeichen`;
  counter.classList.toggle('limit', length > COMMENT_MAX_LENGTH - 200);
}

function applyCommentCharacterFilter() {
  const input = document.getElementById('cf-char-search');
  const empty = document.getElementById('cf-char-search-empty');
  const needle = normalizeSearchText(input?.value || '');
  let visible = 0;

  document.querySelectorAll('#cf-char-picker .cf-char-option').forEach(el => {
    const char = getAvailableCommentCharacterById(el.dataset.id);
    const haystack = normalizeSearchText([
      char?.name,
      char?.title,
      ...(char?.emotes || []).map(emote => emote?.label)
    ].filter(Boolean).join(' '));
    const show = !needle || haystack.includes(needle);
    el.style.display = show ? '' : 'none';
    if (show) visible++;
  });

  if (empty) empty.style.display = visible ? 'none' : 'block';
}

function setCommentMode(mode) {
  _commentMode = mode;
  document.getElementById('cf-mode-char').classList.toggle('active', mode === 'charakter');
  document.getElementById('cf-mode-narrator').classList.toggle('active', mode === 'narrator');
  const charSection = document.getElementById('cf-char-section');
  const narratorHint = document.getElementById('cf-narrator-hint');
  if (mode === 'narrator') {
    charSection.style.display = 'none';
    narratorHint.style.display = 'block';
    _commentKind = 'action';
    coerceCommentSegmentsForMode(false);
    _selectedCharId = null;
    _manualMode = false;
    document.getElementById('cf-emote-section').style.display = 'none';
    document.getElementById('cf-selected-name').textContent = '';
  } else {
    charSection.style.display = 'block';
    narratorHint.style.display = 'none';
  }
  renderCommentSegmentActions(false);
  renderCommentSegmentList();
  updateCommentFormPreview();
  persistCommentDraft();
}
