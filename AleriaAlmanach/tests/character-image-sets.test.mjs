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
    assert.deepEqual(body.images, [{ url: 'https://i.imgur.com/one.png', title: 'Eins', description: '' }]);
  } finally {
    globalThis.fetch = previousFetch;
    if (previousClientId === undefined) delete process.env.ALERIA_IMGUR_CLIENT_ID;
    else process.env.ALERIA_IMGUR_CLIENT_ID = previousClientId;
  }
});

test('Imgur-Proxy meldet eine fehlende Serverkonfiguration verständlich', async () => {
  const previousClientId = process.env.ALERIA_IMGUR_CLIENT_ID;
  delete process.env.ALERIA_IMGUR_CLIENT_ID;
  try {
    const response = await imgurAlbumHandler({ httpMethod: 'GET', queryStringParameters: { album: 'AbC123' } });
    assert.equal(response.statusCode, 503);
    assert.match(JSON.parse(response.body).error, /ALERIA_IMGUR_CLIENT_ID/);
  } finally {
    if (previousClientId !== undefined) process.env.ALERIA_IMGUR_CLIENT_ID = previousClientId;
  }
});
