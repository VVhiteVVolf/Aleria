const CHARACTER_AVATAR_LIMIT = 80;

function extractCharacterAvatarUrls(rawValue, normalizeUrl = normalizeImageUrlForStorage) {
  const raw = String(rawValue || '').trim();
  if (!raw) return [];

  const tokens = raw.match(/https?:\/\/[^\s<>"']+/gi)
    || raw.split(/[\r\n]+/).map(value => value.trim()).filter(Boolean);
  const seen = new Set();
  return tokens.reduce((urls, token) => {
    const candidate = String(token || '').replace(/[),.;]+$/, '');
    const normalized = normalizeUrl(candidate);
    if (!normalized || seen.has(normalized)) return urls;
    seen.add(normalized);
    urls.push(normalized);
    return urls;
  }, []);
}

function deriveCharacterAvatarLabel(url, fallbackIndex = 0) {
  try {
    const pathname = new URL(url).pathname;
    const fileName = decodeURIComponent(pathname.split('/').filter(Boolean).at(-1) || '');
    const label = fileName
      .replace(/\.[a-z0-9]{2,5}$/i, '')
      .replace(/[-_]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (label) return label.slice(0, 20);
  } catch {
    // Der normalisierte Link kann auch projekt-relativ sein. Dann greift das
    // neutrale Label, statt den Import wegen der Beschriftung abzubrechen.
  }
  return `Avatar ${fallbackIndex + 1}`;
}

function loadCharacterAvatarImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(url), { once: true });
    image.addEventListener('error', () => reject(new Error(`Bild konnte nicht geladen werden: ${url}`)), { once: true });
    image.src = url;
  });
}

async function buildCharacterAvatarImport({
  rawValue,
  slots,
  normalizeUrl = normalizeImageUrlForStorage,
  loadImage = loadCharacterAvatarImage,
  limit = CHARACTER_AVATAR_LIMIT
}) {
  const nextSlots = Array.from({ length: limit }, (_, index) => slots?.[index] ? { ...slots[index] } : null);
  const occupiedUrls = new Set(nextSlots
    .filter(slot => slot?.img)
    .map(slot => normalizeUrl(slot.img))
    .filter(Boolean));
  const parsedUrls = extractCharacterAvatarUrls(rawValue, normalizeUrl);
  const uniqueUrls = parsedUrls.filter(url => !occupiedUrls.has(url));
  const duplicateCount = parsedUrls.length - uniqueUrls.length;
  const availableIndices = nextSlots
    .map((slot, index) => slot ? -1 : index)
    .filter(index => index >= 0);
  const candidateUrls = uniqueUrls.slice(0, availableIndices.length);
  const skippedCapacityCount = uniqueUrls.length - candidateUrls.length;
  const checkedUrls = await Promise.all(candidateUrls.map(async url => {
    try {
      await loadImage(url);
      return { url, valid: true };
    } catch {
      return { url, valid: false };
    }
  }));

  let addedCount = 0;
  checkedUrls.forEach(result => {
    if (!result.valid) return;
    const slotIndex = availableIndices[addedCount];
    nextSlots[slotIndex] = {
      img: result.url,
      label: deriveCharacterAvatarLabel(result.url, slotIndex)
    };
    addedCount += 1;
  });

  return {
    slots: nextSlots,
    parsedCount: parsedUrls.length,
    addedCount,
    duplicateCount,
    rejectedCount: checkedUrls.length - addedCount,
    skippedCapacityCount
  };
}

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
  const sourceUrls = source.match(/https?:\/\/[^\s<>"']+/gi) || [];
  if (albumUrl && sourceUrls.length === 1 && typeof importCharacterImgurAlbum === 'function') {
    await importCharacterImgurAlbum(albumUrl);
    return;
  }

  setCharacterAvatarImportStatus('Bilder werden geprüft …');
  const result = await buildCharacterAvatarImport({ rawValue: source, slots: _emoteSlots });
  _emoteSlots = result.slots;
  renderEmoteGrid();
  if (result.addedCount) scheduleCharacterImageLibraryPersistence('avatar-import');
  if (input) input.value = '';

  if (!result.parsedCount) {
    setCharacterAvatarImportStatus('Es wurde kein gültiger Bild-Link erkannt.', true);
    return;
  }
  const details = [];
  if (result.duplicateCount) details.push(`${result.duplicateCount} bereits vorhanden`);
  if (result.rejectedCount) details.push(`${result.rejectedCount} nicht ladbar`);
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

function readCharacterAvatarDropText(dataTransfer) {
  return dataTransfer?.getData('text/uri-list') || dataTransfer?.getData('text/plain') || '';
}

function setCharacterAvatarDropActive(active) {
  document.getElementById('cp-avatar-import-zone')?.classList.toggle('is-dragging', active);
}
