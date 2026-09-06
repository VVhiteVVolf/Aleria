// Character and portrait selection for the edit-comment dialog.
function setEditPortraitUrl(value) {
  const url = normalizeImageUrlForStorage(value);
  _editPortraitUrl = url;
  const input = document.getElementById('ec-portrait-url');
  const preview = document.getElementById('ec-portrait-preview');
  const errEl = document.getElementById('ec-form-error');
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
  updateEditFormPreview();
}

function applyEditCharacterFilter() {
  const input = document.getElementById('ec-char-search');
  const empty = document.getElementById('ec-char-search-empty');
  const needle = normalizeSearchText(input?.value || '');
  let visible = 0;

  const charById = new Map(getAvailableCommentCharacters().map(char => [String(char.id || '').trim(), char]));

  document.querySelectorAll('#ec-char-picker .cf-char-option').forEach(el => {
    const char = charById.get(String(el.dataset.id || '').trim());
    const haystack = normalizeSearchText([
      char?.name,
      char?.title,
      ...normalizeCharacterImageSets(char || {}).flatMap(set => [set.name, ...set.emotes.map(emote => emote.label)])
    ].filter(Boolean).join(' '));
    const show = !needle || haystack.includes(needle);
    el.style.display = show ? '' : 'none';
    if (show) visible++;
  });

  if (empty) empty.style.display = visible ? 'none' : 'block';
}

function selectEditChar(id, options = {}) {
  const char = getAvailableCommentCharacterById(id);
  if (!char || !commentActorMatchesComposerMode(char, _editMode)) {
    const errEl = document.getElementById('ec-form-error');
    if (errEl) {
      errEl.textContent = _editMode === 'creature' ? 'Diese Kreatur ist nicht mehr verfügbar.' : 'Dieser Charakter ist nicht mehr verfügbar.';
      errEl.style.display = 'block';
    }
    return;
  }
  const characterChanged = _editSelectedCharId !== id;
  _editSelectedCharId = id;
  _editSelectedEmoteIdx = null;
  _editImageSetChangedByUser = true;
  const requestedImageSetId = String(options.imageSetId || CHARACTER_IMAGE_SET_DEFAULT_ID);
  _editSelectedImageSetId = char.entityType !== 'creature' && normalizeCharacterImageSets(char).some(set => set.id === requestedImageSetId)
    ? requestedImageSetId
    : CHARACTER_IMAGE_SET_DEFAULT_ID;
  if (characterChanged && !options.preserveSegmentImageSets) {
    _editCommentSegments.forEach(segment => {
      if (segment.kind !== 'action') {
        segment.imageSetId = char.entityType === 'creature' ? '' : _editSelectedImageSetId;
        segment.emoteIndex = null;
      }
    });
  }
  _editManualMode = false;
  _editPortraitUrl = null;
  document.getElementById('ec-portrait-url').value = '';
  document.querySelectorAll('#ec-char-picker .cf-char-option').forEach(el =>
    el.classList.toggle('selected', el.dataset.id === id));
  document.getElementById('ec-manual-fields').style.display = 'none';
  document.getElementById('ec-manual-toggle').textContent = '+ Manuell';
  document.getElementById('ec-portrait-preview').style.display = 'none';
  document.getElementById('ec-selected-name').textContent = char ? `Als ${char.name} bearbeiten` : '';
  renderEditCommentSegmentList();
  updateEditFormPreview();
}

function renderEditCharPicker() {
  const picker = document.getElementById('ec-char-picker');
  if (!picker) return;
  picker.innerHTML = '';
  getAvailableCommentCharacters().filter(c => _editMode === 'creature'
    ? c.entityType === 'creature'
    : c.entityType !== 'creature').forEach(c => {
    const safeName = escapeHtml(c.name);
    const portraitSrc = sanitizeImageSrc(c.portrait);
    const opt = document.createElement('div');
    opt.className = 'cf-char-option' + (_editSelectedCharId === c.id ? ' selected' : '');
    opt.dataset.id = c.id;
    opt.dataset.action = 'select-edit-character';
    opt.innerHTML = `
      ${portraitSrc
        ? `<img src="${portraitSrc}" alt="${safeName}" loading="lazy" decoding="async">`
        : `<div class="cf-char-option-placeholder">${getInitialChar(c.name)}</div>`}
      <div class="cf-char-option-name">${safeName}</div>`;
    picker.appendChild(opt);
  });
  applyEditCharacterFilter();
}

function toggleEditManualMode() {
  if (_editMode === 'creature') return;
  _editManualMode = !_editManualMode;
  _editSelectedCharId = null;
  _editSelectedEmoteIdx = null;
  _editSelectedImageSetId = CHARACTER_IMAGE_SET_DEFAULT_ID;
  document.querySelectorAll('#ec-char-picker .cf-char-option').forEach(el => el.classList.remove('selected'));
  document.getElementById('ec-manual-fields').style.display = _editManualMode ? 'block' : 'none';
  document.getElementById('ec-manual-toggle').textContent = _editManualMode ? '<- Charakter waehlen' : '+ Manuell';
  document.getElementById('ec-selected-name').textContent = '';
  const portraitPreview = document.getElementById('ec-portrait-preview');
  const portraitSrc = _editPortraitUrl || normalizeImageUrlForStorage(_editCommentData?.portrait || '') || '';
  if (_editManualMode && portraitSrc) {
    portraitPreview.src = portraitSrc;
    portraitPreview.style.display = 'block';
  } else {
    portraitPreview.removeAttribute('src');
    portraitPreview.style.display = 'none';
  }
  updateEditFormPreview();
}
