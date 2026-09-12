// Imgur's public album embed contains the complete navigation data as JSON.
// Keep its format-dependent reader separate from the supported API integration.
const MAX_EMBED_BYTES = 2 * 1024 * 1024;
const ALBUM_ID_PATTERN = /^[a-z0-9]{5,32}$/i;

export class ImgurEmbedError extends Error {
  constructor(message, code = 'IMGUR_EMBED_UNAVAILABLE', status = 502) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

function invalidEmbed() {
  return new ImgurEmbedError('Das Imgur-Album ist nicht öffentlich erreichbar oder liefert keine vollständige Bilderliste. Einzelne Bildlinks kannst du weiterhin hinzufügen.');
}

function readJsonObject(source, start) {
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let index = start; index < source.length; index++) {
    const char = source[index];
    if (inString) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === '"') inString = false;
      continue;
    }
    if (char === '"') inString = true;
    else if (char === '{') depth++;
    else if (char === '}' && --depth === 0) {
      try {
        return { value: JSON.parse(source.slice(start, index + 1)), end: index + 1 };
      } catch {
        throw invalidEmbed();
      }
    }
  }
  throw invalidEmbed();
}

export function parseEmbeddedAlbumImages(html, albumHash) {
  if (typeof html !== 'string' || html.length > MAX_EMBED_BYTES
    || typeof albumHash !== 'string' || !ALBUM_ID_PATTERN.test(albumHash)) throw invalidEmbed();
  const assignment = /\b(?:var|let|const)\s+images\s*=\s*(?=\{)/.exec(html);
  if (!assignment) throw invalidEmbed();
  const { value: album, end } = readJsonObject(html, assignment.index + assignment[0].length);
  const identity = /^\s*,\s*albumHash\s*=\s*(['"])([a-z0-9]{5,32})\1\s*[,;]/i.exec(html.slice(end));
  if (identity?.[2] !== albumHash || !Number.isSafeInteger(album.count)
    || !Array.isArray(album.images) || album.count !== album.images.length) throw invalidEmbed();

  return album.images.map(image => {
    if (!image || typeof image.hash !== 'string' || !ALBUM_ID_PATTERN.test(image.hash)
      || typeof image.ext !== 'string' || !/^\.[a-z0-9]{2,5}$/i.test(image.ext)) throw invalidEmbed();
    return {
      link: `https://i.imgur.com/${image.hash}${image.ext}`,
      title: typeof image.title === 'string' ? image.title : '',
      description: typeof image.description === 'string' ? image.description : ''
    };
  });
}

async function readEmbedResponse(response) {
  if (!/^text\/html\b/i.test(response.headers.get('content-type') || '') || !response.body) {
    await response.body?.cancel();
    throw invalidEmbed();
  }
  if (Number(response.headers.get('content-length')) > MAX_EMBED_BYTES) {
    await response.body.cancel();
    throw invalidEmbed();
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8', { fatal: true });
  let bytes = 0;
  let html = '';
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) return html + decoder.decode();
      bytes += value.byteLength;
      if (bytes > MAX_EMBED_BYTES) {
        await reader.cancel();
        throw invalidEmbed();
      }
      html += decoder.decode(value, { stream: true });
    }
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}

export async function requestEmbeddedAlbumImages(albumHash, fetchImpl = fetch) {
  if (typeof albumHash !== 'string' || !ALBUM_ID_PATTERN.test(albumHash)) throw invalidEmbed();
  const response = await fetchImpl(`https://imgur.com/a/${albumHash}/embed?pub=true`, {
    signal: AbortSignal.timeout(10000),
    redirect: 'manual',
    headers: { Accept: 'text/html', 'User-Agent': 'Aleria-Almanach-Album-Importer' }
  });
  if (response.status >= 300 && response.status < 400) {
    await response.body?.cancel();
    throw invalidEmbed();
  }
  if (response.status === 404) throw new ImgurEmbedError('Das Imgur-Album wurde nicht gefunden oder ist nicht öffentlich erreichbar.', 'IMGUR_ALBUM_NOT_FOUND', 404);
  if (response.status === 429) throw new ImgurEmbedError('Imgur erhält gerade zu viele Albumanfragen. Bitte versuche es später erneut.', 'IMGUR_RATE_LIMITED', 429);
  if (!response.ok) throw new ImgurEmbedError('Imgur konnte das Album derzeit nicht liefern.', 'IMGUR_UPSTREAM_ERROR');
  return parseEmbeddedAlbumImages(await readEmbedResponse(response), albumHash);
}
