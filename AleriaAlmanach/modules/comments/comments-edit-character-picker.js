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

  document.querySelectorAll('#ec-char-picker .cf-char-option').forEach(el => {
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

function renderEditEmotePicker() {
  const section = document.getElementById('ec-emote-section');
  const picker = document.getElementById('ec-emote-picker');
  if (!section || !picker) return;
  const char = _editSelectedCharId ? getAvailableCommentCharacterById(_editSelectedCharId) : null;
  if (!char?.emotes?.length) {
    section.style.display = 'none';
    picker.innerHTML = '';
    return;
  }
  section.style.display = 'block';
  picker.innerHTML = char.emotes.map((e, i) => `
    <div class="cf-emote-option ${_editSelectedEmoteIdx === i ? 'selected' : ''}" data-action="select-edit-emote" data-edit-emote-idx="${i}">
      <img src="${sanitizeImageSrc(e.img)}" alt="${escapeHtml(e.label || 'Emote ' + (i + 1))}" loading="lazy" decoding="async">
      <div class="cf-emote-option-label">${escapeHtml(e.label || '')}</div>
      <button class="cf-emote-break-btn" type="button" data-action="insert-edit-comment-emote-break" data-edit-emote-idx="${i}">Als Abschnitt</button>
    </div>
  `).join('');
}

function selectEditChar(id) {
  _editSelectedCharId = id;
  _editSelectedEmoteIdx = null;
  _editManualMode = false;
  _editPortraitUrl = null;
  document.getElementById('ec-portrait-url').value = '';
  document.querySelectorAll('#ec-char-picker .cf-char-option').forEach(el =>
    el.classList.toggle('selected', el.dataset.id === id));
  document.getElementById('ec-manual-fields').style.display = 'none';
  document.getElementById('ec-manual-toggle').textContent = '+ Manuell';
  document.getElementById('ec-portrait-preview').style.display = 'none';
  const char = getAvailableCommentCharacterById(id);
  document.getElementById('ec-selected-name').textContent = char ? `Als ${char.name} bearbeiten` : '';
  renderEditEmotePicker();
  renderEditCommentSegmentList();
  updateEditFormPreview();
}

function selectEditEmote(idx) {
  _editSelectedEmoteIdx = idx;
  document.querySelectorAll('#ec-emote-picker .cf-emote-option').forEach(el => {
    el.classList.toggle('selected', Number(el.dataset.editEmoteIdx) === idx);
  });
  if (_editCommentSegments.length && _editCommentSegments[0].kind !== 'action') {
    _editCommentSegments[0].emoteIndex = idx;
    renderEditCommentSegmentList();
  }
  updateEditFormPreview();
}

function renderEditCharPicker() {
  const picker = document.getElementById('ec-char-picker');
  if (!picker) return;
  picker.innerHTML = '';
  getAvailableCommentCharacters().forEach(c => {
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
  renderEditEmotePicker();
}

function toggleEditManualMode() {
  _editManualMode = !_editManualMode;
  _editSelectedCharId = null;
  _editSelectedEmoteIdx = null;
  document.querySelectorAll('#ec-char-picker .cf-char-option').forEach(el => el.classList.remove('selected'));
  document.getElementById('ec-manual-fields').style.display = _editManualMode ? 'block' : 'none';
  document.getElementById('ec-manual-toggle').textContent = _editManualMode ? '<- Charakter waehlen' : '+ Manuell';
  document.getElementById('ec-selected-name').textContent = '';
  document.getElementById('ec-emote-section').style.display = 'none';
  document.getElementById('ec-emote-picker').innerHTML = '';
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
