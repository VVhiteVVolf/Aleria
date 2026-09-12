import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

import { handler as imgurAlbumHandler } from '../../netlify/functions/imgur-album.mjs';

function loadImageSetModel() {
  const context = {
    window: {},
    Date,
    URL,
    sanitizeImageSrc(value) {
      const raw = String(value || '').trim();
      return /^https?:\/\//.test(raw) ? raw : '';
    }
  };
  vm.runInNewContext(
    fs.readFileSync(new URL('../modules/characters/character-image-sets.js', import.meta.url), 'utf8'),
    context
  );
  return context.window.AleriaCharacterImageSets;
}

test('alte Portrait- und Emotedaten werden als kompatibles Standard-Set gelesen', () => {
  const model = loadImageSetModel();
  const sets = model.normalize({
    portrait: 'https://i.imgur.com/main.png',
    emotes: [{ img: 'https://i.imgur.com/smile.png', label: 'Lächeln' }]
  });
  assert.equal(sets.length, 1);
  assert.equal(sets[0].id, 'standard');
  assert.equal(sets[0].portrait, 'https://i.imgur.com/main.png');
  assert.equal(sets[0].emotes[0].label, 'Lächeln');
});

test('benannte Sets bleiben getrennt und können leer beginnen', () => {
  const model = loadImageSetModel();
  const character = {
    portrait: 'https://i.imgur.com/default.png',
    emotes: [],
    imageSets: [
      { id: 'standard', name: 'Standard', portrait: 'https://i.imgur.com/default.png', emotes: [] },
      { id: 'hochzeit', name: 'Hochzeit', portrait: null, emotes: [] },
      { id: 'kampf', name: 'Kampf', portrait: 'https://i.imgur.com/combat.png', emotes: [{ img: 'https://i.imgur.com/angry.png', label: 'Wütend' }] }
    ]
  };
  assert.equal(model.getPresentation(character, 'hochzeit').emotes.length, 0);
  assert.equal(model.getPresentation(character, 'hochzeit').portrait, null);
  assert.equal(model.applyPresentation(character, 'kampf').portrait, 'https://i.imgur.com/combat.png');
  assert.equal(model.applyPresentation(character, 'kampf').emotes[0].label, 'Wütend');
  assert.equal(model.applyPresentation(character, 'unbekannt').selectedImageSetId, 'standard');
});

test('Set-IDs sind stabil, eindeutig und das Set-Limit wird eingehalten', () => {
  const model = loadImageSetModel();
  assert.equal(model.createId('Gawain im Hochzeitskleid', ['gawain-im-hochzeitskleid']), 'gawain-im-hochzeitskleid-2');
  const imageSets = [{ id: 'standard', name: 'Standard' }, ...Array.from({ length: 30 }, (_, index) => ({ id: `set-${index}`, name: `Set ${index}` }))];
  assert.equal(model.normalize({ imageSets }).length, model.limit);
});

test('reines Serialisieren bewahrt bestehende Set-Zeitstempel', () => {
  const model = loadImageSetModel();
  const createdAt = '2026-07-01T10:00:00.000Z';
  const updatedAt = '2026-07-02T11:00:00.000Z';
  const stored = model.buildStorage([{
    id: 'standard',
    name: 'Standard',
    portrait: 'https://i.imgur.com/main.png',
    emotes: [],
    createdAt,
    updatedAt
  }]);
  assert.equal(stored[0].createdAt, createdAt);
  assert.equal(stored[0].updatedAt, updatedAt);
});

test('neue Sets erhalten beim ersten Serialisieren stabile Zeitstempel', () => {
  const model = loadImageSetModel();
  const first = model.buildStorage([{ id: 'standard', name: 'Standard', emotes: [] }]);
  const second = model.buildStorage(first);
  assert.ok(first[0].createdAt);
  assert.equal(first[0].updatedAt, first[0].createdAt);
  assert.equal(second[0].createdAt, first[0].createdAt);
  assert.equal(second[0].updatedAt, first[0].updatedAt);
});

test('Imgur-Proxy verwendet den offiziellen Album-Endpunkt und gibt nur direkte Bildlinks zurück', async () => {
  const previousClientId = process.env.ALERIA_IMGUR_CLIENT_ID;
  const previousFetch = globalThis.fetch;
  process.env.ALERIA_IMGUR_CLIENT_ID = 'test-client';
  let request = null;
  globalThis.fetch = async (url, options) => {
    request = { url, options };
    return {
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: [
          { link: 'https://i.imgur.com/one.png', title: 'Eins' },
          { link: 'https://i.imgur.com/clip.mp4', type: 'video/mp4' },
          { link: 'https://example.com/not-imgur.png', title: 'Fremd' }
        ]
      })
    };
  };
  try {
    const response = await imgurAlbumHandler({ httpMethod: 'GET', queryStringParameters: { album: 'AbC123' } });
    const body = JSON.parse(response.body);
    assert.equal(response.statusCode, 200);
    assert.match(request.url, /\/album\/AbC123\/images$/);
    assert.equal(request.options.headers.Authorization, 'Client-ID test-client');
    assert.ok(request.options.signal);
    assert.deepEqual(body.images, [{ url: 'https://i.imgur.com/one.png', title: 'Eins', description: '' }]);
  } finally {
    globalThis.fetch = previousFetch;
    if (previousClientId === undefined) delete process.env.ALERIA_IMGUR_CLIENT_ID;
    else process.env.ALERIA_IMGUR_CLIENT_ID = previousClientId;
  }
});

test('Imgur-Proxy liest ohne Client-ID die öffentliche Einbettung und bewahrt Reihenfolge und Bildlimit', async () => {
  const previousClientId = process.env.ALERIA_IMGUR_CLIENT_ID;
  const previousFetch = globalThis.fetch;
  delete process.env.ALERIA_IMGUR_CLIENT_ID;
  const images = [
    { hash: 'Video01', ext: '.mp4' },
    ...Array.from({ length: 82 }, (_, index) => ({ hash: `Image${index}`, ext: '.png', title: `Bild ${index}` }))
  ];
  globalThis.fetch = async (url, options) => {
    assert.equal(url, 'https://imgur.com/a/AbC123/embed?pub=true');
    assert.equal(options.headers.Authorization, undefined);
    assert.equal(options.redirect, 'manual');
    assert.ok(options.signal);
    return new Response(`<script>var images = ${JSON.stringify({ count: images.length, images })}, albumHash = 'AbC123', currentIndex = 0;</script>`, {
      headers: { 'Content-Type': 'text/html;charset=UTF-8' }
    });
  };
  try {
    const response = await imgurAlbumHandler({ httpMethod: 'GET', queryStringParameters: { album: 'AbC123' } });
    assert.equal(response.statusCode, 200);
    const body = JSON.parse(response.body);
    assert.equal(body.images.length, 80);
    assert.deepEqual(body.images[0], { url: 'https://i.imgur.com/Image0.png', title: 'Bild 0', description: '' });
    assert.equal(body.images.at(-1).url, 'https://i.imgur.com/Image79.png');
    assert.equal(response.headers['Cache-Control'], 'public, max-age=300');
  } finally {
    globalThis.fetch = previousFetch;
    if (previousClientId !== undefined) process.env.ALERIA_IMGUR_CLIENT_ID = previousClientId;
  }
});

test('Imgur-Proxy gibt bei unvollständiger Einbettung keine Teilimporte zurück', async () => {
  const previousClientId = process.env.ALERIA_IMGUR_CLIENT_ID;
  const previousFetch = globalThis.fetch;
  delete process.env.ALERIA_IMGUR_CLIENT_ID;
  globalThis.fetch = async () => new Response(`<script>var images = {"count":9,"images":[]}, albumHash = 'AbC123', currentIndex = 0;</script>`, {
    headers: { 'Content-Type': 'text/html' }
  });
  try {
    const response = await imgurAlbumHandler({ queryStringParameters: { album: 'AbC123' } });
    assert.equal(response.statusCode, 502);
    assert.equal(JSON.parse(response.body).code, 'IMGUR_EMBED_UNAVAILABLE');
    assert.equal(JSON.parse(response.body).images, undefined);
    assert.equal(response.headers['Cache-Control'], 'no-store');
  } finally {
    globalThis.fetch = previousFetch;
    if (previousClientId !== undefined) process.env.ALERIA_IMGUR_CLIENT_ID = previousClientId;
  }
});

test('Imgur-Proxy unterscheidet Zugang, Anfragelimits und fehlerhafte Antworten', async () => {
  const previousClientId = process.env.ALERIA_IMGUR_CLIENT_ID;
  const previousFetch = globalThis.fetch;
  process.env.ALERIA_IMGUR_CLIENT_ID = 'test-client';
  try {
    for (const [upstreamStatus, payload, expectedStatus, code] of [
      [401, {}, 503, 'IMGUR_AUTH_FAILED'],
      [403, {}, 503, 'IMGUR_AUTH_FAILED'],
      [429, {}, 429, 'IMGUR_RATE_LIMITED'],
      [404, {}, 404, 'IMGUR_ALBUM_NOT_FOUND'],
      [500, {}, 502, 'IMGUR_UPSTREAM_ERROR'],
      [200, null, 502, 'IMGUR_INVALID_RESPONSE'],
      [200, { data: {} }, 502, 'IMGUR_INVALID_RESPONSE']
    ]) {
      globalThis.fetch = async () => ({
        ok: upstreamStatus === 200, status: upstreamStatus, json: async () => payload
      });
      const response = await imgurAlbumHandler({ queryStringParameters: { album: 'AbC123' } });
      assert.equal(response.statusCode, expectedStatus);
      assert.equal(JSON.parse(response.body).code, code);
      assert.equal(response.headers['Cache-Control'], 'no-store');
    }
  } finally {
    globalThis.fetch = previousFetch;
    if (previousClientId === undefined) delete process.env.ALERIA_IMGUR_CLIENT_ID;
    else process.env.ALERIA_IMGUR_CLIENT_ID = previousClientId;
  }
});

test('Imgur-Proxy lehnt ungültige IDs und schreibende Anfragen vor dem API-Aufruf ab', async () => {
  const previousFetch = globalThis.fetch;
  let requests = 0;
  globalThis.fetch = async () => { requests++; throw new Error('Unexpected request'); };
  try {
    assert.equal((await imgurAlbumHandler({ httpMethod: 'POST' })).statusCode, 405);
    for (const album of ['', '../../example.com', 'https://imgur.com/a/AbC123']) {
      assert.equal((await imgurAlbumHandler({ queryStringParameters: { album } })).statusCode, 400);
    }
    assert.equal(requests, 0);
  } finally {
    globalThis.fetch = previousFetch;
  }
});
