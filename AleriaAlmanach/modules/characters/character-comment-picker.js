let _selectedCharId = null;
let _manualMode = false;
let _selectedEmoteIdx = null;
let _selectedImageSetId = CHARACTER_IMAGE_SET_DEFAULT_ID;

function renderCharPickerInForm() {
  const picker = document.getElementById('cf-char-picker');
  if (!picker) return;
  picker.innerHTML = '';
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

function getSelectedCommentCharacterPresentation(character) {
  if (!character || character.entityType === 'creature') return character;
  return applyCharacterImageSetPresentation(character, _selectedImageSetId);
}

function renderCommentCharacterImagePicker(character) {
  const emoteSection = document.getElementById('cf-emote-section');
  const emotePicker = document.getElementById('cf-emote-picker');
  if (!emoteSection || !emotePicker) return;
  const isCreature = character?.entityType === 'creature';
  const imageSets = isCreature ? [] : normalizeCharacterImageSets(character || {});
  if (!isCreature && !imageSets.some(set => set.id === _selectedImageSetId)) {
    _selectedImageSetId = CHARACTER_IMAGE_SET_DEFAULT_ID;
  }
  const presentation = isCreature ? character : getSelectedCommentCharacterPresentation(character);
  const emotes = Array.isArray(presentation?.emotes) ? presentation.emotes : [];
  if (!character || (isCreature && !emotes.length)) {
    emoteSection.style.display = 'none';
    emotePicker.innerHTML = '';
    return;
  }
  const addDisabled = emotes.length >= MAX_EMOTES;
  const setPicker = isCreature ? '' : `
    <div class="cf-image-set-picker" aria-label="Bilder-&-Emotes-Set wählen">
      <div class="cf-image-set-label">Set</div>
      ${imageSets.map(set => `
        <button type="button" class="cf-image-set-option${set.id === _selectedImageSetId ? ' selected' : ''}"
          data-action="select-comment-image-set" data-image-set-id="${escapeHtml(set.id)}">
          <span>${escapeHtml(set.name)}</span><small>${set.emotes.length}</small>
        </button>`).join('')}
    </div>`;
  emotePicker.innerHTML = setPicker + emotes.map((emote, index) => `
    <div class="cf-emote-option" data-action="select-comment-emote" data-emote-idx="${index}">
      ${isCreature ? '' : `<button class="cf-emote-remove-btn" type="button" title="Avatar löschen" aria-label="Avatar löschen" data-action="remove-comment-emote" data-emote-idx="${index}">x</button>`}
      <img src="${sanitizeImageSrc(emote.img)}" alt="${escapeHtml(emote.label || 'Emote ' + (index + 1))}" loading="lazy" decoding="async">
      <div class="cf-emote-option-label">${escapeHtml(emote.label || '')}</div>
      <button class="cf-emote-break-btn" type="button" data-action="insert-comment-emote-break" data-emote-idx="${index}">Als Abschnitt</button>
    </div>`).join('') + (isCreature ? '' : `
    <div class="cf-emote-add-card">
      <div class="cf-emote-add-title">Avatar zu „${escapeHtml(presentation.imageSetName || 'Standard')}“</div>
      <div class="cf-emote-add-help">Quadratisches 1:1-Bild als URL einfügen.</div>
      <input class="cf-emote-add-input" id="cf-emote-add-label" type="text" placeholder="Label, z.B. skeptisch" maxlength="20"${addDisabled ? ' disabled' : ''}>
      <input class="cf-emote-add-input" id="cf-emote-add-url" type="url" placeholder="https://i.imgur.com/..."${addDisabled ? ' disabled' : ''}>
      <button class="cf-emote-add-btn" type="button" data-action="add-comment-emote"${addDisabled ? ' disabled' : ''}>Hinzufügen</button>
      <div class="cf-emote-add-status" id="cf-emote-add-status">${addDisabled ? `Maximal ${MAX_EMOTES} Avatare pro Set.` : ''}</div>
    </div>`);
  emoteSection.style.display = 'block';
}

function selectCommentImageSet(setId) {
  const character = _selectedCharId ? getAvailableCommentCharacterById(_selectedCharId) : null;
  if (!character || character.entityType === 'creature') return;
  if (!normalizeCharacterImageSets(character).some(set => set.id === setId)) return;
  _selectedImageSetId = setId;
  _selectedEmoteIdx = null;
  _commentSegments.forEach(segment => {
    if (segment.kind !== 'action') {
      segment.imageSetId = setId;
      segment.emoteIndex = null;
    }
  });
  renderCommentCharacterImagePicker(character);
  renderCommentSegmentList();
  updateCommentFormPreview();
  persistCommentDraft();
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
  _selectedCharId = id;
  _selectedEmoteIdx = null;
  const requestedImageSetId = String(options.imageSetId || CHARACTER_IMAGE_SET_DEFAULT_ID);
  _selectedImageSetId = c?.entityType !== 'creature' && normalizeCharacterImageSets(c).some(set => set.id === requestedImageSetId)
    ? requestedImageSetId
    : CHARACTER_IMAGE_SET_DEFAULT_ID;
  if (Array.isArray(_commentSegments)) {
    _commentSegments.forEach(segment => {
      if (segment.kind !== 'action') segment.imageSetId = c?.entityType === 'creature' ? '' : _selectedImageSetId;
    });
  }
  _manualMode = false;
  document.querySelectorAll('.cf-char-option').forEach(el => {
    el.classList.toggle('selected', el.dataset.id === id);
  });
  document.getElementById('cf-manual-fields').style.display = 'none';
  document.getElementById('cf-selected-name').textContent = c ? `Als ${c.name} kommentieren` : '';

  renderCommentCharacterImagePicker(c);
  if (typeof renderCommentSegmentList === 'function') renderCommentSegmentList();
  window.AleriaCommentSceneCast?.render?.();
  updateCommentFormPreview();
  persistCommentDraft();
}

function buildCommentCharacterSaveData(char, emotes, portraitFallback = null, imageSetId = _selectedImageSetId) {
  const now = new Date().toISOString();
  const imageSets = normalizeCharacterImageSets(char);
  const selectedSet = imageSets.find(set => set.id === imageSetId) || imageSets[0];
  selectedSet.emotes = normalizeCharacterImageSetEmotes(emotes);
  if (!selectedSet.portrait && portraitFallback) selectedSet.portrait = normalizeImageUrlForStorage(portraitFallback) || null;
  selectedSet.updatedAt = now;
  const storedSets = buildCharacterImageSetStorage(imageSets);
  const standardSet = storedSets.find(set => set.id === CHARACTER_IMAGE_SET_DEFAULT_ID) || storedSets[0];
  return {
    name: char.name || 'Unbenannt',
    title: char.title || '',
    fraktion: char.fraktion || char.faction || '',
    role: char.role || '',
    status: getCharacterStatusValue(char.status),
    relevance: getCharacterRelevanceValue(char.relevance),
    taxonomyPath: char.taxonomyPath || '',
    currentLocation: char.currentLocation || '',
    origin: char.origin || '',
    plotNode: char.plotNode || '',
    profileLink: char.profileLink || '',
    playerOwner: normalizeCharacterPlayerOwner(char.playerOwner || char.playedBy || char.player),
    bio: char.bio || '',
    aliases: Array.isArray(char.aliases) ? char.aliases : [],
    archived: !!char.archived,
    createdAt: char.createdAt || now,
    updatedAt: now,
    portrait: standardSet?.portrait || null,
    emotes: (standardSet?.emotes || []).map(emote => ({ ...emote })),
    emotesOverride: true,
    imageSetSchemaVersion: CHARACTER_IMAGE_SET_SCHEMA_VERSION,
    imageSets: storedSets,
    activeImageSetId: imageSets.some(set => set.id === char.activeImageSetId)
      ? char.activeImageSetId
      : CHARACTER_IMAGE_SET_DEFAULT_ID,
    imageSetsOverride: true,
    // inventory/combatProfile werden hier bewusst NICHT mitgeschickt: Diese Aktion aendert nur
    // Bilder & Emotes (siehe Speichersystem-Checkup). Ein fehlendes Feld im Merge-Write laesst
    // den jeweils aktuellen Serverstand unangetastet, statt ihn aus dem moeglicherweise
    // veralteten Zwischenspeicher zurueckzuschreiben.
    identity: normalizeCharacterIdentityRecord(char.identity),
    genealogy: normalizeCharacterGenealogyRecord(char.genealogy)
  };
}

async function saveCommentCharacterFromPicker(char, data) {
  const sourceId = char.id;
  const isBuiltin = isBuiltinCharacterId(sourceId);
  const saveTargetId = isBuiltin ? null : sourceId;
  const savedId = await window._fb.saveCharacter(saveTargetId, data);

  if (saveTargetId) {
    const idx = _characters.findIndex(item => item.id === saveTargetId);
    // data laesst inventory/combatProfile bewusst aus (siehe buildCommentCharacterSaveData) - der
    // lokale Zwischenspeicher braucht trotzdem den vollstaendigen, zuvor bekannten Datensatz.
    if (idx >= 0) _characters[idx] = { ..._characters[idx], ...data, id: saveTargetId };
    else _characters.push({ ...char, id: saveTargetId, ...data });
    return saveTargetId;
  }

  if (isBuiltin && sourceId) {
    replaceCharacterIdInTabs(sourceId, savedId);
    saveCharTabs();
  }
  _characters.push({ ...char, id: savedId, ...data });
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
  if (char.entityType === 'creature') {
    if (status) status.textContent = 'Kreaturen verwenden ihr Portrait aus dem Kreaturenbogen.';
    return;
  }

  const label = String(labelInput?.value || '').trim() || 'Avatar';
  const img = normalizeImageUrlForStorage(urlInput?.value || '');
  if (!img) {
    if (status) status.textContent = 'Bitte eine gültige http(s)-Bild-URL einfügen.';
    return;
  }

  const presentation = getSelectedCommentCharacterPresentation(char);
  const emotes = Array.isArray(presentation?.emotes) ? presentation.emotes.slice() : [];
  if (emotes.length >= MAX_EMOTES) {
    if (status) status.textContent = `Maximal ${MAX_EMOTES} Avatare pro Figur.`;
    return;
  }

  if (status) status.textContent = 'Bild wird geprüft...';
  const selectedImageSetId = _selectedImageSetId;

  try {
    await new Promise((resolve, reject) => {
      const test = new Image();
      test.addEventListener('load', resolve, { once: true });
      test.addEventListener('error', reject, { once: true });
      test.src = img;
    });

    const data = buildCommentCharacterSaveData(char, [...emotes, { img, label }], img, _selectedImageSetId);

    if (status) status.textContent = 'Wird gespeichert...';
    _selectedCharId = await saveCommentCharacterFromPicker(char, data);

    const savedPresentation = getCharacterImageSetPresentation(data, selectedImageSetId);
    const newEmoteIndex = savedPresentation.emotes.length - 1;
    _selectedEmoteIdx = newEmoteIndex;
    renderCharPickerInForm();
    selectCharForComment(_selectedCharId, { imageSetId: selectedImageSetId });
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
  if (char.entityType === 'creature') return;

  const presentation = getSelectedCommentCharacterPresentation(char);
  const emotes = Array.isArray(presentation?.emotes) ? presentation.emotes.slice() : [];
  if (!emotes[idx]) return;
  const label = emotes[idx].label ? ` "${emotes[idx].label}"` : '';
  if (!confirm(`Avatar${label} wirklich löschen?`)) return;

  const status = document.getElementById('cf-emote-add-status');
  if (status) status.textContent = 'Avatar wird gelöscht...';
  const selectedImageSetId = _selectedImageSetId;

  try {
    const nextEmotes = emotes.filter((_, index) => index !== idx);
    const data = buildCommentCharacterSaveData(char, nextEmotes, null, _selectedImageSetId);
    _selectedCharId = await saveCommentCharacterFromPicker(char, data);
    const nextSelectedEmoteIdx = _selectedEmoteIdx === idx
      ? null
      : (_selectedEmoteIdx !== null && _selectedEmoteIdx > idx ? _selectedEmoteIdx - 1 : _selectedEmoteIdx);

    renderCharPickerInForm();
    selectCharForComment(_selectedCharId, { imageSetId: selectedImageSetId });
    const savedPresentation = getCharacterImageSetPresentation(data, selectedImageSetId);
    if (nextSelectedEmoteIdx !== null && savedPresentation.emotes[nextSelectedEmoteIdx]) selectEmote(nextSelectedEmoteIdx);
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
    _commentSegments[0].imageSetId = _selectedImageSetId;
    if (typeof renderCommentSegmentList === 'function') renderCommentSegmentList();
  }
  updateCommentFormPreview();
  persistCommentDraft();
}

function toggleManualMode() {
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
  document.getElementById('cf-emote-section').style.display = 'none';
  document.getElementById('cf-emote-picker').innerHTML = '';
  if (typeof renderCommentSegmentList === 'function') renderCommentSegmentList();
  updateCommentFormPreview();
  persistCommentDraft();
}
