// Character profile editor state for named image and emote sets.

let _characterImageSets = [];
let _activeCharacterImageSetId = CHARACTER_IMAGE_SET_DEFAULT_ID;

function scheduleCharacterImageLibraryPersistence(reason) {
  window.AleriaCharacterImageLibraryAutosave?.schedule?.(reason);
}

function getActiveCharacterImageSet() {
  return _characterImageSets.find(set => set.id === _activeCharacterImageSetId) || _characterImageSets[0] || null;
}

function syncActiveCharacterImageSetFromForm() {
  const active = getActiveCharacterImageSet();
  if (!active) return;
  const portrait = normalizeCharacterImageSetImageUrl(document.getElementById('cp-portrait-url')?.value || '') || null;
  const emotes = normalizeCharacterImageSetEmotes((_emoteSlots || []).filter(Boolean));
  const contentChanged = active.portrait !== portrait
    || JSON.stringify(active.emotes || []) !== JSON.stringify(emotes);
  active.portrait = portrait;
  active.emotes = emotes;
  if (contentChanged) active.updatedAt = new Date().toISOString();
}

function renderCharacterImageSetTabs({ preserveNameInput = false } = {}) {
  const tabs = document.getElementById('cp-image-set-tabs');
  const nameInput = document.getElementById('cp-active-image-set-name');
  const deleteButton = document.getElementById('cp-delete-image-set');
  const active = getActiveCharacterImageSet();
  if (!tabs || !active) return;
  const existingTabs = new Map(Array.from(tabs.children, button => [button.dataset.imageSetId, button]));
  const activeEmoteCount = _emoteSlots.filter(slot => slot?.img).length;
  _characterImageSets.forEach((set, index) => {
    const button = existingTabs.get(set.id) || document.createElement('button');
    if (!existingTabs.has(set.id)) {
      button.type = 'button';
      button.className = 'cp-image-set-tab';
      button.setAttribute('role', 'tab');
      button.dataset.charProfileAction = 'select-image-set';
      button.dataset.imageSetId = set.id;
      button.innerHTML = '<span></span><small></small>';
    }
    const isActive = set.id === active.id;
    if (button.classList.contains('active') !== isActive) button.classList.toggle('active', isActive);
    const selected = String(isActive);
    if (button.getAttribute('aria-selected') !== selected) button.setAttribute('aria-selected', selected);
    const label = button.querySelector('span');
    const count = button.querySelector('small');
    const countText = `${isActive ? activeEmoteCount : set.emotes.length}/${CHARACTER_AVATAR_LIMIT}`;
    if (label.textContent !== set.name) label.textContent = set.name;
    if (count.textContent !== countText) count.textContent = countText;
    if (tabs.children[index] !== button) tabs.insertBefore(button, tabs.children[index] || null);
    existingTabs.delete(set.id);
  });
  existingTabs.forEach(button => button.remove());
  if (nameInput) {
    if (!preserveNameInput && nameInput.value !== active.name) nameInput.value = active.name;
    const isStandard = active.id === CHARACTER_IMAGE_SET_DEFAULT_ID;
    const title = isStandard ? 'Das Standard-Set behält seinen festen Namen.' : '';
    if (nameInput.disabled !== isStandard) nameInput.disabled = isStandard;
    if (nameInput.title !== title) nameInput.title = title;
  }
  if (deleteButton && deleteButton.disabled !== (active.id === CHARACTER_IMAGE_SET_DEFAULT_ID)) {
    deleteButton.disabled = active.id === CHARACTER_IMAGE_SET_DEFAULT_ID;
  }
}

function loadActiveCharacterImageSetIntoForm() {
  const active = getActiveCharacterImageSet();
  if (!active) return;
  characterMediaEditor.resetPortraitPreview();
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
  scheduleCharacterImageLibraryPersistence('active-image-set');
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
  scheduleCharacterImageLibraryPersistence('add-image-set');
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
  if (active.name === name) return;
  active.name = name;
  active.updatedAt = new Date().toISOString();
  renderCharacterImageSetTabs({ preserveNameInput: true });
  scheduleCharacterImageLibraryPersistence('rename-image-set');
}

function deleteActiveCharacterImageSet() {
  const active = getActiveCharacterImageSet();
  if (!active || active.id === CHARACTER_IMAGE_SET_DEFAULT_ID) return;
  if (!confirm(`Bilder-&-Emotes-Set „${active.name}“ wirklich löschen?`)) return;
  _characterImageSets = _characterImageSets.filter(set => set.id !== active.id);
  _activeCharacterImageSetId = CHARACTER_IMAGE_SET_DEFAULT_ID;
  loadActiveCharacterImageSetIntoForm();
  scheduleCharacterImageLibraryPersistence('delete-image-set');
}

function collectCharacterImageSetEditorData() {
  syncActiveCharacterImageSetFromForm();
  const imageSets = buildCharacterImageSetStorage(_characterImageSets);
  // Beim ersten Lesen alter Datensätze ergänzt buildStorage fehlende Zeitstempel. Diese
  // normalisierte Fassung wird zum lokalen Editorstand, damit ein zweites Einsammeln nicht
  // allein wegen neu erzeugter Zeitstempel fälschlich als Avataränderung gilt.
  _characterImageSets = imageSets.map(set => ({
    ...set,
    emotes: set.emotes.map(emote => ({ ...emote }))
  }));
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
