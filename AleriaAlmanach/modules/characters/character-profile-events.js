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

  if (action === 'import') {
    openCurrentCharacterImportFilePicker();
    return;
  }

  if (action === 'import-biography-module') {
    if (typeof openCurrentCharacterBiographyImportFilePicker === 'function') openCurrentCharacterBiographyImportFilePicker();
    return;
  }

  if (action === 'export-biography-module') {
    if (typeof exportCurrentCharacterBiographyModule === 'function') exportCurrentCharacterBiographyModule();
    return;
  }

  if (action === 'save') {
    void saveCharacter().catch(error => {
      const message = getFriendlyErrorMessage(error, 'Charakter konnte nicht gespeichert werden.');
      const status = document.getElementById('cp-save-status');
      if (status) {
        status.style.color = 'var(--red-wax)';
        status.textContent = message;
      }
      showAppStatus(message, 'error');
    });
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

  if (action === 'select-image-set') {
    selectCharacterImageSet(actionTarget.dataset.imageSetId || CHARACTER_IMAGE_SET_DEFAULT_ID);
    return;
  }

  if (action === 'add-image-set') {
    addCharacterImageSet();
    return;
  }

  if (action === 'delete-image-set') {
    deleteActiveCharacterImageSet();
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

  if (action === 'import-imgur-album') {
    void importCharacterImgurAlbum();
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

  if (target.dataset.charProfileAction === 'rename-image-set') {
    renameActiveCharacterImageSet(target.value);
    return;
  }

  if (target.dataset.charProfileAction !== 'update-emote-label') return;

  const index = Number(target.dataset.emoteIndex);
  if (!Number.isInteger(index) || index < 0) return;
  _emoteSlots[index] = _emoteSlots[index] || {};
  _emoteSlots[index].label = target.value;
  scheduleCharacterImageLibraryPersistence('emote-label');
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

function handleCharacterAvatarDrag(event) {
  if (!event.target.closest('#cp-avatar-import-zone')) return;
  event.preventDefault();
  if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
  setCharacterAvatarDropActive(true);
}

document.addEventListener('dragenter', handleCharacterAvatarDrag);
document.addEventListener('dragover', handleCharacterAvatarDrag);

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

// Image load/error events do not bubble. Capture them in one delegated listener
// so previews report failures without delaying storage or adding inline handlers.
document.addEventListener('error', event => {
  const preview = event.target;
  if (!preview.matches?.('#cp-emote-grid .emote-slot > img')) return;
  preview.closest('.emote-slot').classList.add('is-image-error');
}, true);

document.addEventListener('load', event => {
  const preview = event.target;
  if (!preview.matches?.('#cp-emote-grid .emote-slot > img')) return;
  preview.closest('.emote-slot').classList.remove('is-image-error');
}, true);
