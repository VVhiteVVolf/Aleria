// Character profile editor state for named image and emote sets.

let _characterImageSets = [];
let _activeCharacterImageSetId = CHARACTER_IMAGE_SET_DEFAULT_ID;

function getActiveCharacterImageSet() {
  return _characterImageSets.find(set => set.id === _activeCharacterImageSetId) || _characterImageSets[0] || null;
}

function syncActiveCharacterImageSetFromForm() {
  const active = getActiveCharacterImageSet();
  if (!active) return;
  active.portrait = normalizeCharacterImageSetImageUrl(document.getElementById('cp-portrait-url')?.value || '') || null;
  active.emotes = normalizeCharacterImageSetEmotes((_emoteSlots || []).filter(Boolean));
  active.updatedAt = new Date().toISOString();
}

function renderCharacterImageSetTabs() {
  const tabs = document.getElementById('cp-image-set-tabs');
  const nameInput = document.getElementById('cp-active-image-set-name');
  const deleteButton = document.getElementById('cp-delete-image-set');
  const active = getActiveCharacterImageSet();
  if (!tabs || !active) return;
  tabs.innerHTML = _characterImageSets.map(set => `
    <button type="button" role="tab" class="cp-image-set-tab${set.id === active.id ? ' active' : ''}"
      aria-selected="${set.id === active.id ? 'true' : 'false'}"
      data-char-profile-action="select-image-set" data-image-set-id="${escapeHtml(set.id)}">
      <span>${escapeHtml(set.name)}</span>
      <small>${set.emotes.length}/${CHARACTER_AVATAR_LIMIT}</small>
    </button>
  `).join('');
  if (nameInput) {
    if (nameInput.value !== active.name) nameInput.value = active.name;
    nameInput.disabled = active.id === CHARACTER_IMAGE_SET_DEFAULT_ID;
    nameInput.title = nameInput.disabled ? 'Das Standard-Set behält seinen festen Namen.' : '';
  }
  if (deleteButton) deleteButton.disabled = active.id === CHARACTER_IMAGE_SET_DEFAULT_ID;
}

function loadActiveCharacterImageSetIntoForm() {
  const active = getActiveCharacterImageSet();
  if (!active) return;
  const portraitField = document.getElementById('cp-portrait-url');
  if (portraitField) portraitField.value = active.portrait || '';
  _charPortraitUrl = active.portrait || null;
  syncPortraitDisplay(active.portrait || null, document.getElementById('cp-name')?.value || '?');
  initEmoteSlots(active.emotes || []);
  const links = document.getElementById('cp-avatar-links');
  if (links) links.value = '';
  setCharacterAvatarImportStatus(`Set „${active.name}“ geöffnet. Importe werden nur hier eingefügt.`);
  renderCharacterImageSetTabs();
}

function initCharacterImageSetEditor(character = {}) {
  _characterImageSets = normalizeCharacterImageSets(character);
  const requestedId = String(character.activeImageSetId || CHARACTER_IMAGE_SET_DEFAULT_ID);
  _activeCharacterImageSetId = _characterImageSets.some(set => set.id === requestedId)
    ? requestedId
    : CHARACTER_IMAGE_SET_DEFAULT_ID;
  loadActiveCharacterImageSetIntoForm();
}

function selectCharacterImageSet(setId) {
  const nextId = String(setId || '');
  if (!_characterImageSets.some(set => set.id === nextId) || nextId === _activeCharacterImageSetId) return;
  syncActiveCharacterImageSetFromForm();
  _activeCharacterImageSetId = nextId;
  loadActiveCharacterImageSetIntoForm();
}

function addCharacterImageSet() {
  const input = document.getElementById('cp-new-image-set-name');
  const name = normalizeCharacterImageSetText(input?.value || '');
  if (!name) {
    setCharacterAvatarImportStatus('Gib dem neuen Set zuerst einen Namen.', true);
    input?.focus();
    return;
  }
  if (_characterImageSets.length >= CHARACTER_IMAGE_SET_LIMIT) {
    setCharacterAvatarImportStatus(`Maximal ${CHARACTER_IMAGE_SET_LIMIT} Bilder-&-Emotes-Sets pro Charakter.`, true);
    return;
  }
  if (_characterImageSets.some(set => normalizeSearchText(set.name) === normalizeSearchText(name))) {
    setCharacterAvatarImportStatus('Ein Set mit diesem Namen existiert bereits.', true);
    return;
  }
  syncActiveCharacterImageSetFromForm();
  const now = new Date().toISOString();
  const set = {
    id: createCharacterImageSetId(name, _characterImageSets.map(item => item.id)),
    name,
    portrait: null,
    emotes: [],
    createdAt: now,
    updatedAt: now
  };
  _characterImageSets.push(set);
  _activeCharacterImageSetId = set.id;
  if (input) input.value = '';
  loadActiveCharacterImageSetIntoForm();
}

function renameActiveCharacterImageSet(value) {
  const active = getActiveCharacterImageSet();
  if (!active || active.id === CHARACTER_IMAGE_SET_DEFAULT_ID) return;
  const name = normalizeCharacterImageSetText(value);
  if (!name) return;
  const duplicate = _characterImageSets.some(set => set.id !== active.id && normalizeSearchText(set.name) === normalizeSearchText(name));
  if (duplicate) {
    setCharacterAvatarImportStatus('Ein anderes Set trägt bereits diesen Namen.', true);
    return;
  }
  active.name = name;
  active.updatedAt = new Date().toISOString();
  renderCharacterImageSetTabs();
}

function deleteActiveCharacterImageSet() {
  const active = getActiveCharacterImageSet();
  if (!active || active.id === CHARACTER_IMAGE_SET_DEFAULT_ID) return;
  if (!confirm(`Bilder-&-Emotes-Set „${active.name}“ wirklich löschen?`)) return;
  _characterImageSets = _characterImageSets.filter(set => set.id !== active.id);
  _activeCharacterImageSetId = CHARACTER_IMAGE_SET_DEFAULT_ID;
  loadActiveCharacterImageSetIntoForm();
}

function collectCharacterImageSetEditorData() {
  syncActiveCharacterImageSetFromForm();
  const imageSets = buildCharacterImageSetStorage(_characterImageSets);
  const standard = imageSets.find(set => set.id === CHARACTER_IMAGE_SET_DEFAULT_ID) || imageSets[0];
  return {
    imageSetSchemaVersion: CHARACTER_IMAGE_SET_SCHEMA_VERSION,
    imageSets,
    activeImageSetId: _activeCharacterImageSetId,
    portrait: standard?.portrait || null,
    emotes: (standard?.emotes || []).map(emote => ({ ...emote })),
    emotesOverride: true,
    imageSetsOverride: true
  };
}
