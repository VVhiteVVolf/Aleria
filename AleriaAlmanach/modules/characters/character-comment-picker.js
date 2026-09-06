let _selectedCharId = null;
let _manualMode = false;
let _selectedEmoteIdx = null;
let _selectedImageSetId = CHARACTER_IMAGE_SET_DEFAULT_ID;

function renderCharPickerInForm() {
  const picker = document.getElementById('cf-char-picker');
  if (!picker) return;
  const fragment = document.createDocumentFragment();
  const creatureMode = typeof _commentMode !== 'undefined' && _commentMode === 'creature';
  const characters = getAvailableCommentCharacters().filter(char => creatureMode
    ? char.entityType === 'creature'
    : char.entityType !== 'creature');
  const playerFilter = !creatureMode && typeof getCommentPlayerFilter === 'function'
    ? normalizeCharacterPlayerOwner(getCommentPlayerFilter())
    : '';
  picker.dataset.playerView = playerFilter ? 'true' : 'false';

  let grouped;
  if (creatureMode) {
    grouped = [{ label: 'Kreaturenregister', chars: characters, kind: 'creatures' }];
  } else if (playerFilter) {
    const playerCharacters = characters;
    const playerLabel = getCharacterPlayerOwnerLabel(playerFilter);
    const owned = playerCharacters.filter(char => normalizeCharacterPlayerOwner(char.playerOwner) === playerFilter);
    const unassigned = playerCharacters.filter(char => !normalizeCharacterPlayerOwner(char.playerOwner));
    grouped = [
      { label: `${playerLabel}s Charaktere`, chars: owned, kind: 'owned' },
      { label: 'Nicht zugewiesen', chars: unassigned, kind: 'unassigned' }
    ].filter(group => group.chars.length);
  } else {
    const active = characters.filter(isCharacterCommentedInCurrentModule);
    const inactive = characters.filter(char => !isCharacterCommentedInCurrentModule(char));
    grouped = [
      { label: active.length ? 'Bereits im Modul aktiv' : '', chars: active.length ? active : inactive },
      ...(active.length ? [{ label: 'Weitere Charaktere', chars: inactive }] : [])
    ].filter(group => group.chars.length);
  }

  const addCharacterOption = c => {
    const safeName = escapeHtml(c.name);
    const portraitSrc = sanitizeImageSrc(c.portrait);
    const hasCommented = isCharacterCommentedInCurrentModule(c);
    const playerOwner = normalizeCharacterPlayerOwner(c.playerOwner);
    const playerOwnerLabel = getCharacterPlayerOwnerLabel(playerOwner);
    const isPlayerBlocked = !creatureMode && !playerFilter && typeof isCommentCharacterAllowedForActivePlayer === 'function'
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
    fragment.appendChild(opt);
  };

  grouped.forEach(group => {
    if (group.label) {
      const label = document.createElement('div');
      label.className = 'cf-char-picker-group' + (group.kind ? ` ${group.kind}` : '');
      label.textContent = group.label;
      fragment.appendChild(label);
    }
    group.chars.forEach(addCharacterOption);
  });
  picker.replaceChildren(fragment);
  applyCommentCharacterFilter();
}

function getSelectedCommentCharacterPresentation(character) {
  if (!character || character.entityType === 'creature') return character;
  return applyCharacterImageSetPresentation(character, _selectedImageSetId);
}

function selectCharForComment(id, options = {}) {
  const c = getAvailableCommentCharacterById(id);
  if (!c || (typeof commentActorMatchesComposerMode === 'function' && !commentActorMatchesComposerMode(c, _commentMode))) {
    const errEl = document.getElementById('cf-error');
    if (errEl) {
      errEl.textContent = _commentMode === 'creature' ? 'Diese Kreatur ist nicht mehr verfügbar.' : 'Dieser Charakter ist nicht mehr verfügbar.';
      errEl.style.display = 'block';
    }
    return;
  }
  if (c && typeof isCommentCharacterAllowedForActivePlayer === 'function' && !isCommentCharacterAllowedForActivePlayer(c)) {
    const ownerLabel = getCharacterPlayerOwnerLabel(c.playerOwner);
    const errEl = document.getElementById('cf-error');
    if (errEl) {
      errEl.textContent = `${c.name} ist ${ownerLabel} zugewiesen.`;
      errEl.style.display = 'block';
    }
    return;
  }
  const characterChanged = _selectedCharId !== id;
  _selectedCharId = id;
  _selectedEmoteIdx = null;
  const requestedImageSetId = String(options.imageSetId || CHARACTER_IMAGE_SET_DEFAULT_ID);
  _selectedImageSetId = c?.entityType !== 'creature' && normalizeCharacterImageSets(c).some(set => set.id === requestedImageSetId)
    ? requestedImageSetId
    : CHARACTER_IMAGE_SET_DEFAULT_ID;
  if (Array.isArray(_commentSegments) && characterChanged && !options.preserveSegmentImageSets) {
    _commentSegments.forEach(segment => {
      if (segment.kind !== 'action') {
        segment.imageSetId = c?.entityType === 'creature' ? '' : _selectedImageSetId;
        segment.emoteIndex = null;
      }
    });
  }
  _manualMode = false;
  document.querySelectorAll('.cf-char-option').forEach(el => {
    el.classList.toggle('selected', el.dataset.id === id);
  });
  document.getElementById('cf-manual-fields').style.display = 'none';
  document.getElementById('cf-selected-name').textContent = c ? `Als ${c.name} kommentieren` : '';

  if (options.render !== false) {
    if (typeof renderCommentSegmentList === 'function') renderCommentSegmentList();
    window.AleriaCommentSceneCast?.render?.();
    updateCommentFormPreview();
  }
  if (options.persist !== false) persistCommentDraft();
}

function selectEmote(idx, options = {}) {
  _selectedEmoteIdx = idx;
  if (Array.isArray(_commentSegments) && _commentSegments.length && _commentSegments[0].kind !== 'action') {
    _commentSegments[0].emoteIndex = idx;
    _commentSegments[0].imageSetId = _selectedImageSetId;
    if (options.render !== false && typeof renderCommentSegmentList === 'function') renderCommentSegmentList();
  }
  if (options.render !== false) updateCommentFormPreview();
  if (options.persist !== false) persistCommentDraft();
}

function toggleManualMode(options = {}) {
  if (_commentMode === 'creature') return;
  _manualMode = !_manualMode;
  _selectedCharId = null;
  _selectedEmoteIdx = null;
  _selectedImageSetId = CHARACTER_IMAGE_SET_DEFAULT_ID;
  document.querySelectorAll('.cf-char-option').forEach(el => el.classList.remove('selected'));
  document.getElementById('cf-manual-fields').style.display = _manualMode ? 'block' : 'none';
  document.getElementById('cf-selected-name').textContent = _manualMode ? '' : '';
  document.getElementById('cf-manual-toggle').textContent = _manualMode
    ? '<- Charakter auswählen'
    : '+ Manuell eingeben';
  if (options.render !== false) {
    if (typeof renderCommentSegmentList === 'function') renderCommentSegmentList();
    updateCommentFormPreview();
  }
  if (options.persist !== false) persistCommentDraft();
}
