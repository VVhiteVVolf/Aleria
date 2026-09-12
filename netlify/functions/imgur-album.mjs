const IMGUR_API_ROOT = 'https://api.imgur.com/3';
const MAX_ALBUM_IMAGES = 80;

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': statusCode === 200 ? 'public, max-age=300' : 'no-store',
      'X-Content-Type-Options': 'nosniff'
    },
    body: JSON.stringify(body)
  };
}

function getAlbumHash(event = {}) {
  const candidate = String(event.queryStringParameters?.album || '').trim();
  return /^[a-z0-9]{5,32}$/i.test(candidate) ? candidate : '';
}

export async function handler(event = {}) {
  if (String(event.httpMethod || 'GET').toUpperCase() !== 'GET') {
    return json(405, { error: 'Nur GET ist für den Albumimport erlaubt.' });
  }
  const albumHash = getAlbumHash(event);
  if (!albumHash) return json(400, { error: 'Die Imgur-Album-ID ist ungültig.' });

  const clientId = String(process.env.ALERIA_IMGUR_CLIENT_ID || '').trim();
  if (!clientId) {
    return json(503, {
      code: 'IMGUR_NOT_CONFIGURED',
      error: 'Der Albumimport ist auf dieser Website noch nicht eingerichtet. Einzelne Bildlinks kannst du bereits hinzufügen.'
    });
  }

  try {
    const response = await fetch(`${IMGUR_API_ROOT}/album/${encodeURIComponent(albumHash)}/images`, {
      signal: AbortSignal.timeout(10000),
      headers: {
        Accept: 'application/json',
        Authorization: `Client-ID ${clientId}`,
        'User-Agent': 'Aleria-Almanach-Album-Importer'
      }
    });
    const payload = await response.json().catch(() => ({}));
    if (response.status === 401 || response.status === 403) {
      return json(503, { code: 'IMGUR_AUTH_FAILED', error: 'Der Imgur-Zugang der Website wurde abgelehnt. Die Albumimport-Einrichtung muss geprüft werden.' });
    }
    if (response.status === 429) {
      return json(429, { code: 'IMGUR_RATE_LIMITED', error: 'Imgur erhält gerade zu viele Albumanfragen. Bitte versuche es später erneut.' });
    }
    if (!response.ok || payload?.success === false) {
      const message = response.status === 404
        ? 'Das Imgur-Album wurde nicht gefunden oder ist nicht öffentlich erreichbar.'
        : 'Imgur konnte das Album derzeit nicht liefern.';
      return json(response.status === 404 ? 404 : 502, { code: response.status === 404 ? 'IMGUR_ALBUM_NOT_FOUND' : 'IMGUR_UPSTREAM_ERROR', error: message });
    }
    if (!Array.isArray(payload?.data)) {
      return json(502, { code: 'IMGUR_INVALID_RESPONSE', error: 'Imgur hat keine gültige Bilderliste geliefert. Bitte versuche es erneut.' });
    }
    const images = payload.data
      .filter(image => /^https:\/\/i\.imgur\.com\/[^?#]+\.(?:png|jpe?g|gif|webp|avif)(?:[?#]|$)/i.test(String(image?.link || '')))
      .slice(0, MAX_ALBUM_IMAGES)
      .map(image => ({
        url: String(image.link),
        title: String(image.title || '').slice(0, 80),
        description: String(image.description || '').slice(0, 120)
      }));
    return json(200, { albumHash, images });
  } catch (error) {
    console.error('imgur album import failed:', error);
    return json(502, { error: 'Imgur ist für den Albumimport momentan nicht erreichbar.' });
  }
}
