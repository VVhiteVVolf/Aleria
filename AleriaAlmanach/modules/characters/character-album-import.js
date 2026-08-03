// Imgur album import for character image sets.
// Album expansion is delegated to the same-origin Netlify function so the
// Imgur Client-ID never becomes part of the browser bundle.

function extractImgurAlbumHash(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  try {
    const url = new URL(raw);
    const host = url.hostname.toLowerCase().replace(/^www\./, '');
    if (host !== 'imgur.com') return '';
    const parts = url.pathname.split('/').filter(Boolean);
    const markerIndex = parts.findIndex(part => part === 'a' || part === 'gallery');
    const candidate = markerIndex >= 0 ? parts[markerIndex + 1] : '';
    return /^[a-z0-9]{5,32}$/i.test(candidate || '') ? candidate : '';
  } catch {
    return '';
  }
}

function findImgurAlbumUrl(value) {
  const urls = String(value || '').match(/https?:\/\/[^\s<>"']+/gi) || [];
  return urls.find(url => extractImgurAlbumHash(String(url).replace(/[),.;]+$/, ''))) || '';
}

async function requestImgurAlbumImages(albumUrl, fetchImpl = fetch) {
  const albumHash = extractImgurAlbumHash(albumUrl);
  if (!albumHash) throw new Error('Bitte einen Imgur-Album-Link im Format imgur.com/a/… oder imgur.com/gallery/… verwenden.');
  const response = await fetchImpl(`/.netlify/functions/imgur-album?album=${encodeURIComponent(albumHash)}`, {
    method: 'GET',
    headers: { Accept: 'application/json' }
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.error || `Imgur-Album konnte nicht geladen werden (HTTP ${response.status}).`);
    error.status = response.status;
    throw error;
  }
  const images = (Array.isArray(payload.images) ? payload.images : [])
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
    setCharacterAvatarImportStatus('Kein gültiger Imgur-Album-Link erkannt.', true);
    return;
  }

  setCharacterAvatarImportStatus('Imgur-Album wird gelesen …');
  try {
    const albumImages = await requestImgurAlbumImages(albumUrl);
    const result = await buildCharacterAvatarImport({
      rawValue: albumImages.map(image => image.url).join('\n'),
      slots: _emoteSlots
    });
    _emoteSlots = result.slots;
    albumImages.forEach(image => {
      if (!image.label) return;
      const slot = _emoteSlots.find(candidate => candidate?.img === image.url);
      if (slot) slot.label = image.label;
    });
    renderEmoteGrid();
    if (input) input.value = '';
    const details = [];
    if (result.duplicateCount) details.push(`${result.duplicateCount} bereits vorhanden`);
    if (result.rejectedCount) details.push(`${result.rejectedCount} nicht ladbar`);
    if (result.skippedCapacityCount) details.push(`${result.skippedCapacityCount} über dem Set-Limit`);
    setCharacterAvatarImportStatus(
      `${result.addedCount} Bild${result.addedCount === 1 ? '' : 'er'} aus dem Album übernommen${details.length ? ` · ${details.join(' · ')}` : ''}.`,
      result.addedCount === 0
    );
  } catch (error) {
    setCharacterAvatarImportStatus(error.message || 'Imgur-Album konnte nicht importiert werden.', true);
  }
}

window.AleriaCharacterImgurImport = Object.freeze({
  extractAlbumHash: extractImgurAlbumHash,
  findAlbumUrl: findImgurAlbumUrl,
  requestImages: requestImgurAlbumImages,
  importAlbum: importCharacterImgurAlbum
});
