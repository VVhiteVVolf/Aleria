// Stateless imports shared by the classic character editor and creature modules.
(function installAvatarImport(global) {
  if (global.AleriaAvatarImport) return;
function normalizeAvatarUrl(value) {
  const raw = global.AleriaCharacterImageSets.normalizeImageUrl(value);
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (/^(?:(?:www|m)\.)?imgur\.com$/i.test(url.hostname)) {
      const match = url.pathname.match(/^\/([a-z0-9]{5,32})(?:\.(png|jpe?g|gif|webp))?\/?$/i);
      if (!match || url.username || url.password) return null;
      return `https://i.imgur.com/${match[1]}.${match[2] || 'png'}`;
    }
  } catch { /* Safe project-relative path. */ }
  return raw;
}
const CHARACTER_AVATAR_LIMIT = 80;

function extractCharacterAvatarUrls(rawValue, normalizeUrl = normalizeAvatarUrl) {
  const raw = String(rawValue || '').trim();
  if (!raw) return [];

  const tokens = raw.match(/(?<![\w:])https?:\/\/[^\s<>"']+/gi)
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

// Store valid links immediately. Preview loading belongs to the grid and must
// neither block an import nor discard a link during a temporary host failure.
function buildCharacterAvatarImport({
  rawValue,
  slots,
  normalizeUrl = normalizeAvatarUrl,
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
  candidateUrls.forEach((url, index) => {
    const slotIndex = availableIndices[index];
    nextSlots[slotIndex] = {
      img: url,
      label: deriveCharacterAvatarLabel(url, slotIndex)
    };
  });

  return {
    slots: nextSlots,
    parsedCount: parsedUrls.length,
    addedCount: candidateUrls.length,
    duplicateCount,
    skippedCapacityCount
  };
}

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
      url: normalizeAvatarUrl(image?.url || ''),
      label: global.AleriaCharacterImageSets.normalizeText(image?.title || image?.description || '', 20)
    }))
    .filter(image => image.url)
    .slice(0, CHARACTER_AVATAR_LIMIT);
  if (!images.length) throw new Error('Das Imgur-Album enthält keine importierbaren Bilder.');
  return images;
}

function readCharacterAvatarDropText(dataTransfer, normalizeUrl = normalizeAvatarUrl) {
  if (!dataTransfer) return '';
  // Dragging a linked image often supplies the surrounding page as uri-list.
  // Prefer the actual image source carried by the browser's HTML fragment.
  const html = dataTransfer.getData('text/html');
  if (html) {
    const fragment = new DOMParser().parseFromString(html, 'text/html');
    const images = Array.from(fragment.querySelectorAll('img[src]'))
      .map(image => normalizeUrl(image.getAttribute('src')))
      .filter(Boolean);
    if (images.length) return images.join('\n');
  }
  const uriList = dataTransfer.getData('text/uri-list')
    .split(/\r?\n/).filter(line => line.trim() && !line.trim().startsWith('#')).join('\n');
  return uriList || dataTransfer.getData('text/plain')
    || dataTransfer.getData('text/x-moz-url').split(/\r?\n/)[0] || '';
}

global.AleriaAvatarImport = Object.freeze({
  normalizeUrl: normalizeAvatarUrl, extractUrls: extractCharacterAvatarUrls,
  deriveLabel: deriveCharacterAvatarLabel, merge: buildCharacterAvatarImport,
  extractAlbumHash: extractImgurAlbumHash, findAlbumUrl: findImgurAlbumUrl,
  requestImages: requestImgurAlbumImages, readDrop: readCharacterAvatarDropText
});
})(globalThis);
