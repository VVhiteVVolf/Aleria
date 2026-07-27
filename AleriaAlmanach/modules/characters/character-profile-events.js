function getCharacterProfileActionTarget(event) {
  return event.target.closest('[data-char-profile-action]');
}

function handleCharacterProfileClick(event) {
  const actionTarget = getCharacterProfileActionTarget(event);
  if (!actionTarget) return;

  const action = actionTarget.dataset.charProfileAction;
  if (!action) return;

  event.preventDefault();

  if (action === 'switch-tab') {
    switchCharTab(actionTarget.dataset.charProfileTab || 'info');
    return;
  }

  if (action === 'close') {
    closeCharProfile();
    return;
  }

  if (action === 'delete') {
    deleteCharacter();
    return;
  }

  if (action === 'export') {
    exportCurrentCharacterProfile();
    return;
  }

  if (action === 'save') {
    saveCharacter();
    return;
  }

  if (action === 'edit-inventory-profile') {
    if (typeof editCharacterInventoryProfile === 'function') editCharacterInventoryProfile();
    return;
  }

  if (action === 'show-inventory-profile') {
    if (typeof showCharacterInventoryProfileView === 'function') showCharacterInventoryProfileView();
    return;
  }

  if (action === 'sync-inventory-profile') {
    if (typeof resetCharacterInventoryFromCurrentProfile === 'function') resetCharacterInventoryFromCurrentProfile();
    return;
  }

  if (action === 'export-inventory-template') {
    if (typeof exportCharacterInventoryProfileTemplate === 'function') exportCharacterInventoryProfileTemplate();
    return;
  }

  if (action === 'stamp-inventory-template') {
    if (typeof stampCharacterInventoryProfileTemplateToAll === 'function') stampCharacterInventoryProfileTemplateToAll();
    return;
  }

  if (action === 'open-emote-url') {
    openEmoteUrlInput(Number(actionTarget.dataset.emoteIndex));
    return;
  }

  if (action === 'import-avatar-links') {
    void importCharacterAvatarLinks();
    return;
  }

  if (action === 'paste-avatar-links') {
    void pasteCharacterAvatarLinks();
    return;
  }

  if (action === 'paste-portrait-link') {
    void pasteCharacterPortraitLink();
    return;
  }

  if (action === 'remove-emote') {
    removeEmote(Number(actionTarget.dataset.emoteIndex));
  }
}

function handleCharacterProfileInput(event) {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) return;

  if (target.id === 'cp-portrait-url') {
    previewPortraitUrl(target.value);
    return;
  }

  if (target.id === 'cp-profile-link-url') {
    syncProfileLinkDisplay(target.value, document.getElementById('cp-name')?.value || '');
    return;
  }

  if (target.dataset.charProfileAction !== 'update-emote-label') return;

  const index = Number(target.dataset.emoteIndex);
  if (!Number.isInteger(index) || index < 0) return;
  _emoteSlots[index] = _emoteSlots[index] || {};
  _emoteSlots[index].label = target.value;
}

document.addEventListener('click', event => {
  if (!event.target.closest('#char-profile-overlay')) return;
  handleCharacterProfileClick(event);
});

document.addEventListener('keydown', event => {
  if (event.key !== 'Enter' && event.key !== ' ') return;
  if (!event.target.closest('#char-profile-overlay')) return;
  if (!getCharacterProfileActionTarget(event)) return;
  handleCharacterProfileClick(event);
});

document.addEventListener('input', event => {
  if (!event.target.closest('#char-profile-overlay')) return;
  handleCharacterProfileInput(event);
});

document.addEventListener('dragover', event => {
  if (!event.target.closest('#cp-avatar-import-zone')) return;
  event.preventDefault();
  setCharacterAvatarDropActive(true);
});

document.addEventListener('dragleave', event => {
  if (!event.target.closest('#cp-avatar-import-zone')) return;
  if (event.relatedTarget?.closest?.('#cp-avatar-import-zone')) return;
  setCharacterAvatarDropActive(false);
});

document.addEventListener('drop', event => {
  if (!event.target.closest('#cp-avatar-import-zone')) return;
  event.preventDefault();
  setCharacterAvatarDropActive(false);
  const rawValue = readCharacterAvatarDropText(event.dataTransfer);
  const input = document.getElementById('cp-avatar-links');
  if (input) input.value = rawValue;
  void importCharacterAvatarLinks(rawValue);
});
