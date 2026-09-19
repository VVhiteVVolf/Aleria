const CHARACTER_AVATAR_LIMIT = 80;
function extractCharacterAvatarUrls(rawValue, normalizeUrl = normalizeImageUrlForStorage) { return globalThis.AleriaAvatarImport.extractUrls(rawValue, normalizeUrl); }
function deriveCharacterAvatarLabel(...args) { return globalThis.AleriaAvatarImport.deriveLabel(...args); }
function buildCharacterAvatarImport(options) { return globalThis.AleriaAvatarImport.merge({ normalizeUrl: normalizeImageUrlForStorage, ...options }); }

function setCharacterAvatarImportStatus(message, isError = false) {
  const status = document.getElementById('cp-avatar-import-status');
  if (!status) return;
  status.textContent = message;
  status.classList.toggle('is-error', isError);
}

function updateCharacterAvatarImportSummary() {
  const count = (_emoteSlots || []).filter(slot => slot?.img).length;
  const countNode = document.getElementById('cp-avatar-count');
  const limitNode = document.getElementById('cp-avatar-limit');
  if (countNode) countNode.textContent = String(count);
  if (limitNode) limitNode.textContent = String(CHARACTER_AVATAR_LIMIT);
  if (typeof getActiveCharacterImageSet === 'function') {
    const activeSet = getActiveCharacterImageSet();
    if (activeSet) activeSet.emotes = normalizeCharacterImageSetEmotes((_emoteSlots || []).filter(Boolean));
  }
  if (typeof renderCharacterImageSetTabs === 'function') renderCharacterImageSetTabs();
}

async function importCharacterAvatarLinks(rawValue) {
  const input = document.getElementById('cp-avatar-links');
  const source = String(rawValue ?? input?.value ?? '').trim();
  if (!source) {
    setCharacterAvatarImportStatus('Füge mindestens einen Bild-Link ein.', true);
    return;
  }

  const albumUrl = typeof findImgurAlbumUrl === 'function' ? findImgurAlbumUrl(source) : '';
  const sourceUrls = extractCharacterAvatarUrls(source);
  if (albumUrl && sourceUrls.length > 1) {
    setCharacterAvatarImportStatus('Bitte einen Album-Link einzeln übernehmen. Mehrere direkte Bildlinks können gemeinsam importiert werden.', true);
    return;
  }
  if (albumUrl && sourceUrls.length <= 1 && typeof importCharacterImgurAlbum === 'function') {
    await importCharacterImgurAlbum(albumUrl);
    return;
  }

  const result = buildCharacterAvatarImport({ rawValue: source, slots: _emoteSlots });
  _emoteSlots = result.slots;
  renderEmoteGrid();
  if (result.addedCount) scheduleCharacterImageLibraryPersistence('avatar-import');
  if (input && result.addedCount) input.value = '';

  if (!result.parsedCount) {
    setCharacterAvatarImportStatus('Es wurde kein gültiger Bild-Link erkannt.', true);
    return;
  }
  const details = [];
  if (result.duplicateCount) details.push(`${result.duplicateCount} bereits vorhanden`);
  if (result.skippedCapacityCount) details.push(`${result.skippedCapacityCount} über dem Limit`);
  setCharacterAvatarImportStatus(
    `${result.addedCount} Avatar${result.addedCount === 1 ? '' : 'e'} übernommen${details.length ? ` · ${details.join(' · ')}` : ''}.`,
    result.addedCount === 0
  );
}

async function pasteCharacterAvatarLinks() {
  if (!navigator.clipboard?.readText) {
    setCharacterAvatarImportStatus('Zwischenablage nicht verfügbar. Füge die Links mit Strg+V in das Feld ein.', true);
    document.getElementById('cp-avatar-links')?.focus();
    return;
  }
  try {
    const text = await navigator.clipboard.readText();
    const input = document.getElementById('cp-avatar-links');
    if (input) input.value = text;
    await importCharacterAvatarLinks(text);
  } catch {
    setCharacterAvatarImportStatus('Zwischenablage konnte nicht gelesen werden. Füge die Links mit Strg+V ein.', true);
  }
}

async function pasteCharacterPortraitLink() {
  const field = document.getElementById('cp-portrait-url');
  if (!field) return;
  if (!navigator.clipboard?.readText) {
    field.focus();
    return;
  }
  try {
    const [url] = extractCharacterAvatarUrls(await navigator.clipboard.readText());
    if (!url) throw new Error('Kein Bild-Link erkannt.');
    field.value = url;
    field.dispatchEvent(new Event('input', { bubbles: true }));
  } catch {
    const error = document.getElementById('cp-portrait-url-error');
    if (error) {
      error.textContent = 'In der Zwischenablage wurde kein gültiger Bild-Link gefunden.';
      error.style.display = 'block';
    }
  }
}

function readCharacterAvatarDropText(dataTransfer) { return globalThis.AleriaAvatarImport.readDrop(dataTransfer, normalizeImageUrlForStorage); }

function setCharacterAvatarDropActive(active) {
  document.getElementById('cp-avatar-import-zone')?.classList.toggle('is-dragging', active);
}
