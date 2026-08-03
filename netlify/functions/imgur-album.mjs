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
    return json(503, { error: 'Der Imgur-Albumimport ist noch nicht konfiguriert. In Netlify fehlt ALERIA_IMGUR_CLIENT_ID.' });
  }

  try {
    const response = await fetch(`${IMGUR_API_ROOT}/album/${encodeURIComponent(albumHash)}/images`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Client-ID ${clientId}`,
        'User-Agent': 'Aleria-Almanach-Album-Importer'
      }
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || payload.success === false) {
      const message = response.status === 404
        ? 'Das Imgur-Album wurde nicht gefunden oder ist nicht öffentlich erreichbar.'
        : 'Imgur konnte das Album derzeit nicht liefern.';
      return json(response.status === 404 ? 404 : 502, { error: message });
    }
    const images = (Array.isArray(payload.data) ? payload.data : [])
      .filter(image => /^https:\/\/i\.imgur\.com\//i.test(String(image?.link || '')))
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
