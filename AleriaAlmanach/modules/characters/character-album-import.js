// Character UI adapter; request/URL handling is shared with creature image sets.
function extractImgurAlbumHash(...args) { return globalThis.AleriaAvatarImport.extractAlbumHash(...args); }
function findImgurAlbumUrl(...args) { return globalThis.AleriaAvatarImport.findAlbumUrl(...args); }
function requestImgurAlbumImages(...args) { return globalThis.AleriaAvatarImport.requestImages(...args); }

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
