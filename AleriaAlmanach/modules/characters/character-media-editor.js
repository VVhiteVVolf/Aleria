// Media previews belong to the character editor. Storage continues to use the
// shared image-library model; loading a preview never gates an avatar import.
const characterMediaEditor = (() => {
  const portraitDelay = 300;
  let portraitTimer = null;
  let portraitRequest = null;
  let portraitRevision = 0;
  let emoteObserver = null;

  function resetPortraitPreview() {
    portraitRevision++;
    clearTimeout(portraitTimer);
    portraitTimer = null;
    if (!portraitRequest) return;
    portraitRequest.abort.abort();
    portraitRequest.image.removeAttribute('src');
    portraitRequest = null;
  }

  function previewPortrait(url) {
    resetPortraitPreview();
    const error = document.getElementById('cp-portrait-url-error');
    const safeUrl = normalizeImageUrlForStorage(url);
    if (error) error.style.display = 'none';
    if (!safeUrl) {
      _charPortraitUrl = null;
      syncPortraitDisplay(null, document.getElementById('cp-name')?.value || '?');
      if (String(url || '').trim()) {
        if (error) error.style.display = 'block';
      } else {
        scheduleCharacterImageLibraryPersistence('clear-portrait');
      }
      return;
    }
    if (safeUrl === _charPortraitUrl) return;

    const revision = portraitRevision;
    portraitTimer = setTimeout(() => {
      portraitTimer = null;
      const image = new Image();
      const abort = new AbortController();
      const isCurrent = () => revision === portraitRevision
        && normalizeImageUrlForStorage(document.getElementById('cp-portrait-url')?.value || '') === safeUrl;
      const finish = () => {
        abort.abort();
        if (portraitRequest?.image === image) portraitRequest = null;
      };
      portraitRequest = { image, abort };
      image.decoding = 'async';
      image.addEventListener('load', () => {
        if (isCurrent()) {
          if (error) error.style.display = 'none';
          _charPortraitUrl = safeUrl;
          syncPortraitDisplay(safeUrl, document.getElementById('cp-name')?.value || '?');
          scheduleCharacterImageLibraryPersistence('portrait');
        }
        finish();
      }, { once: true, signal: abort.signal });
      image.addEventListener('error', () => {
        if (isCurrent() && error) error.style.display = 'block';
        finish();
      }, { once: true, signal: abort.signal });
      image.src = safeUrl;
    }, portraitDelay);
  }

  function observeEmotePreview(image, grid) {
    if (typeof IntersectionObserver !== 'function') {
      image.src = image.dataset.emoteSrc;
      return;
    }
    if (!emoteObserver) {
      const observer = new IntersectionObserver(entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const preview = entry.target;
          observer.unobserve(preview);
          if (preview.isConnected) preview.src = preview.dataset.emoteSrc;
        }
      }, { root: grid.closest('.cp-images-panel'), rootMargin: '240px 0px' });
      emoteObserver = observer;
    }
    emoteObserver.observe(image);
  }

  function renderEmotes() {
    const grid = document.getElementById('cp-emote-grid');
    if (!grid) return;
    _emoteSlots.forEach((slot, index) => {
      const tile = grid.children[index] || document.createElement('div');
      const imageUrl = slot?.img || '';
      const label = slot?.label || '';
      const input = tile.querySelector('.emote-label-input');
      if (tile.dataset.imageUrl === imageUrl && input) {
        if (input.value !== label) input.value = label;
        return;
      }
      const previousPreview = tile.querySelector('img');
      if (previousPreview) emoteObserver?.unobserve(previousPreview);
      tile.className = 'emote-slot';
      tile.dataset.imageUrl = imageUrl;
      tile.innerHTML = `${imageUrl ? `
        <img data-emote-src="${sanitizeImageSrc(imageUrl)}" alt="Emote ${index + 1}"
          width="512" height="512" loading="lazy" decoding="async">
        <span class="emote-image-error" role="status">Vorschau nicht ladbar · Link bleibt erhalten</span>
        <button class="emote-remove-btn" type="button" data-char-profile-action="remove-emote" data-emote-index="${index}">✕</button>` : `
        <div class="emote-slot-placeholder" role="button" tabindex="0" data-char-profile-action="open-emote-url" data-emote-index="${index}" title="URL eingeben">
          <span>+</span>
        </div>`}
        <input class="emote-label-input" type="text" value="${escapeHtml(label)}" placeholder="Label" maxlength="20"
          data-char-profile-action="update-emote-label" data-emote-index="${index}">`;
      if (!tile.parentElement) grid.appendChild(tile);
      const preview = tile.querySelector('img');
      if (preview) observeEmotePreview(preview, grid);
    });
    while (grid.children.length > _emoteSlots.length) {
      const preview = grid.lastElementChild.querySelector('img');
      if (preview) emoteObserver?.unobserve(preview);
      grid.lastElementChild.remove();
    }
    updateCharacterAvatarImportSummary();
  }

  function dispose() {
    resetPortraitPreview();
    emoteObserver?.disconnect();
    emoteObserver = null;
    document.getElementById('cp-emote-grid')?.replaceChildren();
  }

  return Object.freeze({ previewPortrait, resetPortraitPreview, renderEmotes, dispose });
})();

function previewPortraitUrl(url) {
  characterMediaEditor.previewPortrait(url);
}

function openEmoteUrlInput(slotIndex) {
  if (!Number.isInteger(slotIndex) || slotIndex < 0 || slotIndex >= MAX_EMOTES) return;
  const url = prompt('Bild-URL für Emote:');
  if (!url) return;
  const safeUrl = normalizeImageUrlForStorage(url);
  if (!safeUrl) {
    alert('Bitte eine gültige Bild-URL verwenden.');
    return;
  }
  _emoteSlots[slotIndex] = { img: safeUrl, label: _emoteSlots[slotIndex]?.label || '' };
  renderEmoteGrid();
  scheduleCharacterImageLibraryPersistence('emote');
}

function initEmoteSlots(existingEmotes) {
  _emoteSlots = Array.from({ length: MAX_EMOTES }, (_, index) =>
    existingEmotes?.[index] ? { ...existingEmotes[index] } : null
  );
  renderEmoteGrid();
}

function renderEmoteGrid() {
  characterMediaEditor.renderEmotes();
}

function removeEmote(index) {
  if (!Number.isInteger(index) || index < 0 || index >= MAX_EMOTES) return;
  _emoteSlots[index] = null;
  renderEmoteGrid();
  scheduleCharacterImageLibraryPersistence('remove-emote');
}
