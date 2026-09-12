// Imgur album import for character image sets.
// Album expansion is delegated to the same-origin Netlify function so the
// optional Imgur Client-ID never becomes part of the browser bundle.

function extractImgurAlbumHash(value) {
  const raw = String(value || '').trim().replace(/[),.;]+$/, '');
  if (!raw) return '';
  try {
    const url = new URL(/^(?:(?:www|m)\.)?imgur\.com\//i.test(raw) ? `https://${raw}` : raw);
    const host = url.hostname.toLowerCase().replace(/^(?:www|m)\./, '');
    if (!/^https?:$/.test(url.protocol) || host !== 'imgur.com' || url.username || url.password) return '';
    const parts = url.pathname.split('/').filter(Boolean);
    if (parts.length !== 2 || !['a', 'gallery'].includes(parts[0])) return '';
    // Shared links may include a readable title before the final album ID.
    const candidate = parts[1].split('-').at(-1);
    return /^[a-z0-9]{5,32}$/i.test(candidate || '') ? candidate : '';
  } catch {
    return '';
  }
}

function findImgurAlbumUrl(value) {
  const urls = String(value || '').match(/https?:\/\/[^\s<>"']+|\b(?:(?:www|m)\.)?imgur\.com\/[^\s<>"']+/gi) || [];
  return urls.map(url => url.replace(/[),.;]+$/, '')).find(url => extractImgurAlbumHash(url)) || '';
}

async function requestImgurAlbumImages(albumUrl, fetchImpl = fetch) {
  const albumHash = extractImgurAlbumHash(albumUrl);
  if (!albumHash) throw new Error('Bitte einen Imgur-Album-Link im Format imgur.com/a/… oder imgur.com/gallery/… verwenden.');
  let response;
  let payload;
  try {
    response = await fetchImpl(`/.netlify/functions/imgur-album?album=${encodeURIComponent(albumHash)}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(15000)
    });
    payload = await response.json().catch(() => null);
  } catch {
    throw new Error('Der Albumdienst antwortet nicht. Bitte versuche es erneut; einzelne Bildlinks kannst du weiterhin hinzufügen.');
  }
  if (!payload || typeof payload !== 'object') {
    throw new Error('Der Albumdienst ist unter dieser Website-Adresse nicht verfügbar. Öffne den Almanach auf seiner Netlify-Seite.');
  }
  if (!response.ok) {
    const error = new Error(payload.error || `Imgur-Album konnte nicht geladen werden (HTTP ${response.status}).`);
    error.status = response.status;
    throw error;
  }
  if (!Array.isArray(payload.images)) throw new Error('Der Albumdienst hat keine gültige Bilderliste geliefert. Bitte versuche es erneut.');
  const images = payload.images
    .map(image => ({
      url: normalizeCharacterImageSetImageUrl(image?.url || ''),
      label: normalizeCharacterImageSetText(image?.title || image?.description || '', 20)
    }))
    .filter(image => image.url)
    .slice(0, CHARACTER_AVATAR_LIMIT);
  if (!images.length) throw new Error('Das Imgur-Album enthält keine importierbaren Bilder.');
  return images;
}

async function importCharacterImgurAlbum(rawValue) {
  const input = document.getElementById('cp-avatar-links');
  const source = String(rawValue ?? input?.value ?? '').trim();
  const albumUrl = findImgurAlbumUrl(source) || source;
  if (!extractImgurAlbumHash(albumUrl)) {
    setCharacterAvatarImportStatus('Füge einen Imgur-Album-Link ein: https://imgur.com/a/… oder https://imgur.com/gallery/…', true);
    input?.focus();
    return;
  }

  const targetSet = getActiveCharacterImageSet();
  const characterId = _editingChar;
  const inputValue = input?.value;
  const isCurrentTarget = () => _editingChar === characterId && getActiveCharacterImageSet() === targetSet;
  setCharacterAvatarImportStatus('Imgur-Album wird gelesen …');
  try {
    const albumImages = await requestImgurAlbumImages(albumUrl);
    if (!isCurrentTarget()) return;
    const existingUrls = new Set(_emoteSlots.filter(slot => slot?.img).map(slot => slot.img));
    const result = buildCharacterAvatarImport({
      rawValue: albumImages.map(image => image.url).join('\n'),
      slots: _emoteSlots
    });
    _emoteSlots = result.slots;
    albumImages.forEach(image => {
      if (!image.label || existingUrls.has(image.url)) return;
      const slot = _emoteSlots.find(candidate => candidate?.img === image.url);
      if (slot) slot.label = image.label;
    });
    renderEmoteGrid();
    if (result.addedCount) scheduleCharacterImageLibraryPersistence('album-import');
    if (input && input.value === inputValue && result.addedCount) input.value = '';
    const details = [];
    if (result.duplicateCount) details.push(`${result.duplicateCount} bereits vorhanden`);
    if (result.skippedCapacityCount) details.push(`${result.skippedCapacityCount} über dem Set-Limit`);
    setCharacterAvatarImportStatus(
      `${result.addedCount} Bild${result.addedCount === 1 ? '' : 'er'} aus dem Album übernommen${details.length ? ` · ${details.join(' · ')}` : ''}.`,
      result.addedCount === 0
    );
  } catch (error) {
    if (!isCurrentTarget()) return;
    setCharacterAvatarImportStatus(error.message || 'Imgur-Album konnte nicht importiert werden.', true);
  }
}

window.AleriaCharacterImgurImport = Object.freeze({
  extractAlbumHash: extractImgurAlbumHash,
  findAlbumUrl: findImgurAlbumUrl,
  requestImages: requestImgurAlbumImages,
  importAlbum: importCharacterImgurAlbum
});
