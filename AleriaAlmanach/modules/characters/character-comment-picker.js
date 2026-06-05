let _selectedCharId = null;
let _manualMode = false;

function renderCharPickerInForm() {
  const picker = document.getElementById('cf-char-picker');
  if (!picker) return;
  picker.innerHTML = '';
  const characters = getAvailableCommentCharacters();
  const playerFilter = typeof getCommentPlayerFilter === 'function'
    ? normalizeCharacterPlayerOwner(getCommentPlayerFilter())
    : '';
  picker.dataset.playerView = playerFilter ? 'true' : 'false';

  let grouped;
  if (playerFilter) {
    const playerLabel = getCharacterPlayerOwnerLabel(playerFilter);
    const owned = characters.filter(char => normalizeCharacterPlayerOwner(char.playerOwner) === playerFilter);
    const unassigned = characters.filter(char => !normalizeCharacterPlayerOwner(char.playerOwner));
    grouped = [
      { label: `${playerLabel}s Charaktere`, chars: owned, kind: 'owned' },
      { label: 'Nicht zugewiesen', chars: unassigned, kind: 'unassigned' }
    ].filter(group => group.chars.length);
  } else {
    const active = characters.filter(isCharacterCommentedInCurrentModule);
    const inactive = characters.filter(char => !isCharacterCommentedInCurrentModule(char));
    grouped = active.length
      ? [
          { label: 'Bereits im Modul aktiv', chars: active },
          { label: 'Weitere Charaktere', chars: inactive }
        ].filter(group => group.chars.length)
      : [{ label: '', chars: characters }];
  }

  const addCharacterOption = c => {
    const safeName = escapeHtml(c.name);
    const portraitSrc = sanitizeImageSrc(c.portrait);
    const hasCommented = isCharacterCommentedInCurrentModule(c);
    const playerOwner = normalizeCharacterPlayerOwner(c.playerOwner);
    const playerOwnerLabel = getCharacterPlayerOwnerLabel(playerOwner);
    const isPlayerBlocked = !playerFilter && typeof isCommentCharacterAllowedForActivePlayer === 'function'
      ? !isCommentCharacterAllowedForActivePlayer(c)
      : false;
    const opt = document.createElement('div');
    opt.className = 'cf-char-option'
      + (_selectedCharId === c.id ? ' selected' : '')
      + (hasCommented ? ' has-commented' : '')
      + (isPlayerBlocked ? ' player-blocked' : '');
    opt.dataset.id = c.id;
    opt.dataset.action = 'select-comment-character';
    if (isPlayerBlocked) {
      opt.setAttribute('aria-disabled', 'true');
      opt.title = `${c.name} wird von ${playerOwnerLabel} gespielt.`;
    }
    opt.innerHTML = `
      ${portraitSrc
        ? `<img src="${portraitSrc}" alt="${safeName}" loading="lazy" decoding="async">`
        : `<div class="cf-char-option-placeholder">${getInitialChar(c.name)}</div>`}
      <div class="cf-char-option-name">${safeName}</div>
      ${playerOwnerLabel ? `<div class="cf-char-player-badge">${escapeHtml(playerOwnerLabel)}</div>` : ''}
      ${hasCommented ? '<div class="cf-char-commented-badge">aktiv</div>' : ''}`;
    picker.appendChild(opt);
  };

  grouped.forEach(group => {
    if (group.label) {
      const label = document.createElement('div');
      label.className = 'cf-char-picker-group' + (group.kind ? ` ${group.kind}` : '');
      label.textContent = group.label;
      picker.appendChild(label);
    }
    group.chars.forEach(addCharacterOption);
  });
  applyCommentCharacterFilter();
}

function selectCharForComment(id) {
  const c = getAvailableCommentCharacterById(id);
  if (c && typeof isCommentCharacterAllowedForActivePlayer === 'function' && !isCommentCharacterAllowedForActivePlayer(c)) {
    const ownerLabel = getCharacterPlayerOwnerLabel(c.playerOwner);
    const errEl = document.getElementById('cf-error');
    if (errEl) {
      errEl.textContent = `${c.name} ist ${ownerLabel} zugewiesen.`;
      errEl.style.display = 'block';
    }
    return;
  }
  _selectedCharId = id;
  _selectedEmoteIdx = null;
  _manualMode = false;
  document.querySelectorAll('.cf-char-option').forEach(el => {
    el.classList.toggle('selected', el.dataset.id === id);
  });
  document.getElementById('cf-manual-fields').style.display = 'none';
  document.getElementById('cf-selected-name').textContent = c ? `Als ${c.name} kommentieren` : '';

  const emoteSection = document.getElementById('cf-emote-section');
  const emotePicker  = document.getElementById('cf-emote-picker');
  const emotes = (c && c.emotes && c.emotes.length) ? c.emotes : [];
  if (c) {
    const addDisabled = emotes.length >= MAX_EMOTES;
    emotePicker.innerHTML = emotes.map((e, i) => `
      <div class="cf-emote-option" data-action="select-comment-emote" data-emote-idx="${i}">
        <button class="cf-emote-remove-btn" type="button" title="Avatar löschen" aria-label="Avatar löschen" data-action="remove-comment-emote" data-emote-idx="${i}">x</button>
        <img src="${sanitizeImageSrc(e.img)}" alt="${escapeHtml(e.label || 'Emote ' + (i + 1))}" loading="lazy" decoding="async">
        <div class="cf-emote-option-label">${escapeHtml(e.label || '')}</div>
        <button class="cf-emote-break-btn" type="button" data-action="insert-comment-emote-break" data-emote-idx="${i}">Als Abschnitt</button>
      </div>`).join('') + `
      <div class="cf-emote-add-card">
        <div class="cf-emote-add-title">Avatar hinzufügen</div>
        <div class="cf-emote-add-help">Quadratisches 1:1-Bild als URL einfügen.</div>
        <input class="cf-emote-add-input" id="cf-emote-add-label" type="text" placeholder="Label, z.B. skeptisch" maxlength="20"${addDisabled ? ' disabled' : ''}>
        <input class="cf-emote-add-input" id="cf-emote-add-url" type="url" placeholder="https://i.imgur.com/..."${addDisabled ? ' disabled' : ''}>
        <button class="cf-emote-add-btn" type="button" data-action="add-comment-emote"${addDisabled ? ' disabled' : ''}>Hinzufügen</button>
        <div class="cf-emote-add-status" id="cf-emote-add-status">${addDisabled ? `Maximal ${MAX_EMOTES} Avatare pro Figur.` : ''}</div>
      </div>`;
    emoteSection.style.display = 'block';
  } else {
    emoteSection.style.display = 'none';
    emotePicker.innerHTML = '';
  }
  if (typeof renderCommentSegmentList === 'function') renderCommentSegmentList();
  updateCommentFormPreview();
  persistCommentDraft();
}

let _selectedEmoteIdx = null;

function buildCommentCharacterSaveData(char, emotes, portraitFallback = null) {
  return {
    name: char.name || 'Unbenannt',
    title: char.title || '',
    fraktion: char.fraktion || char.faction || '',
    playerOwner: normalizeCharacterPlayerOwner(char.playerOwner || char.playedBy || char.player),
    bio: char.bio || '',
    aliases: Array.isArray(char.aliases) ? char.aliases : [],
    archived: !!char.archived,
    portrait: normalizeImageUrlForStorage(char.portrait) || normalizeImageUrlForStorage(portraitFallback) || null,
    emotes: (Array.isArray(emotes) ? emotes : [])
      .map(emote => ({ img: normalizeImageUrlForStorage(emote.img), label: emote.label || '' }))
      .filter(emote => emote.img)
      .slice(0, MAX_EMOTES),
    emotesOverride: true
  };
}

async function saveCommentCharacterFromPicker(char, data) {
  const sourceId = char.id;
  const isBuiltin = isBuiltinCharacterId(sourceId);
  const saveTargetId = isBuiltin ? null : sourceId;
  const savedId = await window._fb.saveCharacter(saveTargetId, data);

  if (saveTargetId) {
    const idx = _characters.findIndex(item => item.id === saveTargetId);
    if (idx >= 0) _characters[idx] = { id: saveTargetId, ...data };
    else _characters.push({ id: saveTargetId, ...data });
    return saveTargetId;
  }

  if (isBuiltin && sourceId) {
    replaceCharacterIdInTabs(sourceId, savedId);
    saveCharTabs();
  }
  _characters.push({ id: savedId, ...data });
  return savedId;
}

async function addEmoteToSelectedCommentCharacter() {
  const status = document.getElementById('cf-emote-add-status');
  const labelInput = document.getElementById('cf-emote-add-label');
  const urlInput = document.getElementById('cf-emote-add-url');
  const char = _selectedCharId
    ? (getAvailableCommentCharacterById(_selectedCharId) || getCharacterById(_selectedCharId))
    : null;
  if (!char) return;

  const label = String(labelInput?.value || '').trim() || 'Avatar';
  const img = normalizeImageUrlForStorage(urlInput?.value || '');
  if (!img) {
    if (status) status.textContent = 'Bitte eine gültige http(s)-Bild-URL einfügen.';
    return;
  }

  const emotes = Array.isArray(char.emotes) ? char.emotes.slice() : [];
  if (emotes.length >= MAX_EMOTES) {
    if (status) status.textContent = `Maximal ${MAX_EMOTES} Avatare pro Figur.`;
    return;
  }

  if (status) status.textContent = 'Bild wird geprüft...';

  try {
    await new Promise((resolve, reject) => {
      const test = new Image();
      test.addEventListener('load', resolve, { once: true });
      test.addEventListener('error', reject, { once: true });
      test.src = img;
    });

    const data = buildCommentCharacterSaveData(char, [...emotes, { img, label }], img);

    if (status) status.textContent = 'Wird gespeichert...';
    _selectedCharId = await saveCommentCharacterFromPicker(char, data);

    const newEmoteIndex = data.emotes.length - 1;
    _selectedEmoteIdx = newEmoteIndex;
    renderCharPickerInForm();
    selectCharForComment(_selectedCharId);
    selectEmote(newEmoteIndex);
    renderCharGrid();
    const freshStatus = document.getElementById('cf-emote-add-status');
    if (freshStatus) freshStatus.textContent = 'Gespeichert.';
  } catch (error) {
    const message = error?.code
      ? getFriendlyErrorMessage(error, 'Avatar konnte nicht gespeichert werden.')
      : 'Bild konnte nicht geladen werden. Bitte prüfe die URL.';
    if (status) status.textContent = message;
    if (error?.code) showAppStatus(message, 'error');
  }
}

async function removeEmoteFromSelectedCommentCharacter(idx, event) {
  event?.preventDefault();
  event?.stopPropagation();

  const char = _selectedCharId
    ? (getAvailableCommentCharacterById(_selectedCharId) || getCharacterById(_selectedCharId))
    : null;
  if (!char) return;

  const emotes = Array.isArray(char.emotes) ? char.emotes.slice() : [];
  if (!emotes[idx]) return;
  const label = emotes[idx].label ? ` "${emotes[idx].label}"` : '';
  if (!confirm(`Avatar${label} wirklich löschen?`)) return;

  const status = document.getElementById('cf-emote-add-status');
  if (status) status.textContent = 'Avatar wird gelöscht...';

  try {
    const nextEmotes = emotes.filter((_, index) => index !== idx);
    const data = buildCommentCharacterSaveData(char, nextEmotes);
    _selectedCharId = await saveCommentCharacterFromPicker(char, data);
    const nextSelectedEmoteIdx = _selectedEmoteIdx === idx
      ? null
      : (_selectedEmoteIdx !== null && _selectedEmoteIdx > idx ? _selectedEmoteIdx - 1 : _selectedEmoteIdx);

    renderCharPickerInForm();
    selectCharForComment(_selectedCharId);
    if (nextSelectedEmoteIdx !== null && data.emotes[nextSelectedEmoteIdx]) selectEmote(nextSelectedEmoteIdx);
    renderCharGrid();
    const freshStatus = document.getElementById('cf-emote-add-status');
    if (freshStatus) freshStatus.textContent = 'Avatar gelöscht.';
  } catch (error) {
    const message = getFriendlyErrorMessage(error, 'Avatar konnte nicht gelöscht werden.');
    if (status) status.textContent = message;
    showAppStatus(message, 'error');
  }
}

function selectEmote(idx) {
  _selectedEmoteIdx = idx;
  document.querySelectorAll('.cf-emote-option').forEach(el => {
    el.classList.toggle('selected', parseInt(el.dataset.emoteIdx) === idx);
  });
  if (Array.isArray(_commentSegments) && _commentSegments.length && _commentSegments[0].kind !== 'action') {
    _commentSegments[0].emoteIndex = idx;
    if (typeof renderCommentSegmentList === 'function') renderCommentSegmentList();
  }
  updateCommentFormPreview();
  persistCommentDraft();
}

function toggleManualMode() {
  _manualMode = !_manualMode;
  _selectedCharId = null;
  _selectedEmoteIdx = null;
  document.querySelectorAll('.cf-char-option').forEach(el => el.classList.remove('selected'));
  document.getElementById('cf-manual-fields').style.display = _manualMode ? 'block' : 'none';
  document.getElementById('cf-selected-name').textContent = _manualMode ? '' : '';
  document.getElementById('cf-manual-toggle').textContent = _manualMode
    ? '<- Charakter auswählen'
    : '+ Manuell eingeben';
  document.getElementById('cf-emote-section').style.display = 'none';
  document.getElementById('cf-emote-picker').innerHTML = '';
  if (typeof renderCommentSegmentList === 'function') renderCommentSegmentList();
  updateCommentFormPreview();
  persistCommentDraft();
}

