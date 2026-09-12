import test from 'node:test';
import assert from 'node:assert/strict';
import { ImgurEmbedError, parseEmbeddedAlbumImages, requestEmbeddedAlbumImages } from '../../netlify/lib/imgur-albums/embed-source.mjs';

const albumId = 'AbC123';
const image = { hash: 'Image01', ext: '.png', title: 'Lächeln', description: null };
const embed = (images = [image], count = images.length, id = albumId) =>
  `<script>var images = ${JSON.stringify({ count, images }, null, 2)},\n albumHash = '${id}', currentIndex = 0;</script>`;
const response = html => new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });

test('liest vollständige JSON-Navigationsdaten mit Escapes und verwendet Originalbilder', () => {
  const description = 'Ein {Text} mit "Zitaten", \\ und\nZeilenumbruch';
  const html = embed([{ ...image, description }, { hash: 'Image02', ext: '.gif' }]);
  const images = parseEmbeddedAlbumImages(html, albumId);
  assert.deepEqual(images, [
    { link: 'https://i.imgur.com/Image01.png', title: 'Lächeln', description },
    { link: 'https://i.imgur.com/Image02.gif', title: '', description: '' }
  ]);
});

test('führt eingebettetes JavaScript niemals aus', () => {
  const html = embed() + '<script>throw new Error("must not run");</script>';
  assert.equal(parseEmbeddedAlbumImages(html, albumId).length, 1);
  assert.throws(() => parseEmbeddedAlbumImages(`<script>var images = {count: (() => 1)(), images: []}, albumHash = '${albumId}', currentIndex = 0;</script>`, albumId), ImgurEmbedError);
});

test('verwirft fremde Album-IDs, Teilantworten und geänderte Einbettungsformate', () => {
  for (const html of [
    embed([image], 1, 'Other01'), embed([image], 9), embed([image], '1'),
    embed([image], -1), embed([image]).replace('albumHash', 'renamedHash'),
    '<html>Imgur: The magic of the Internet</html>',
    '<script>var images = {"count":1,"images":[</script>',
    `<script>var images = {"count":1,"images":{}}, albumHash = '${albumId}', currentIndex = 0;</script>`
  ]) assert.throws(() => parseEmbeddedAlbumImages(html, albumId), ImgurEmbedError);
});

test('leere Alben bleiben leer und Metadaten können keine Bildadresse einschleusen', () => {
  assert.deepEqual(parseEmbeddedAlbumImages(embed([]), albumId), []);
  const [result] = parseEmbeddedAlbumImages(embed([{ ...image, link: 'https://example.com/tracker.png', title: {}, description: [] }]), albumId);
  assert.deepEqual(result, { link: 'https://i.imgur.com/Image01.png', title: '', description: '' });
  for (const item of [null, {}, { ext: '.png' }, { ...image, hash: '../other' }, { ...image, ext: '.png?x=1' }, { ...image, hash: { toString: 'Image01' } }]) {
    assert.throws(() => parseEmbeddedAlbumImages(embed([item]), albumId), ImgurEmbedError);
  }
});

test('ungültige IDs werden vor jedem Netzwerkzugriff abgewiesen', async () => {
  let requests = 0;
  for (const id of [undefined, null, {}, '', '../example.com', 'https://imgur.com/a/AbC123']) {
    await assert.rejects(requestEmbeddedAlbumImages(id, async () => { requests++; }), ImgurEmbedError);
  }
  assert.equal(requests, 0);
});

test('liest UTF-8-Daten auch über Chunkgrenzen hinweg', async () => {
  const bytes = new TextEncoder().encode(embed());
  const stream = new ReadableStream({
    start(controller) {
      for (let index = 0; index < bytes.length; index++) controller.enqueue(bytes.slice(index, index + 1));
      controller.close();
    }
  });
  const images = await requestEmbeddedAlbumImages(albumId, async () => response(stream));
  assert.equal(images[0].title, 'Lächeln');
});

test('unterscheidet nicht erreichbare Alben, Anfragelimits und Serverfehler', async () => {
  for (const [status, expectedStatus, code] of [
    [404, 404, 'IMGUR_ALBUM_NOT_FOUND'], [429, 429, 'IMGUR_RATE_LIMITED'],
    [403, 502, 'IMGUR_UPSTREAM_ERROR'], [500, 502, 'IMGUR_UPSTREAM_ERROR']
  ]) {
    await assert.rejects(requestEmbeddedAlbumImages(albumId, async () => new Response('', { status })),
      error => error.status === expectedStatus && error.code === code);
  }
});

test('folgt weder Weiterleitungen auf die Startseite noch zu fremden Hosts', async () => {
  for (const location of ['https://imgur.com/', 'https://example.com/private']) {
    let requests = 0;
    await assert.rejects(requestEmbeddedAlbumImages(albumId, async (url, options) => {
      requests++;
      assert.equal(options.redirect, 'manual');
      return new Response('', { status: 302, headers: { Location: location } });
    }), error => error.code === 'IMGUR_EMBED_UNAVAILABLE');
    assert.equal(requests, 1);
  }
});

test('lehnt JSON-Antworten und übergroße HTML-Antworten ab und beendet den Stream', async () => {
  await assert.rejects(requestEmbeddedAlbumImages(albumId, async () => new Response('{}', { headers: { 'Content-Type': 'application/json' } })), ImgurEmbedError);
  const tooLarge = new Uint8Array(2 * 1024 * 1024 + 1);
  for (const declared of [true, false]) {
    let cancelled = false;
    const stream = new ReadableStream({ start(controller) { controller.enqueue(tooLarge); }, cancel() { cancelled = true; } });
    const headers = { 'Content-Type': 'text/html' };
    if (declared) headers['Content-Length'] = String(tooLarge.length);
    await assert.rejects(requestEmbeddedAlbumImages(albumId, async () => new Response(stream, { headers })), ImgurEmbedError);
    assert.equal(cancelled, true);
  }
});
