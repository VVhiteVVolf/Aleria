import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

function loadImporter() {
  const nodes = new Map();
  const listeners = new Map();
  const saves = [];
  const context = vm.createContext({
    URL, AbortSignal, window: {},
    _emoteSlots: [], _editingChar: 'figure-a', activeSet: { id: 'standard' },
    Image: class { constructor() { throw new Error('Import must not wait for image loading'); } },
    document: {
      getElementById(id) {
        if (!nodes.has(id)) nodes.set(id, {
          value: '', textContent: '', classList: { toggle() {} }, focus() {}
        });
        return nodes.get(id);
      },
      addEventListener(type, listener) { listeners.set(type, listener); }
    },
    normalizeImageUrlForStorage(value) {
      try {
        const url = new URL(value);
        return /^https?:$/.test(url.protocol) ? String(value).trim() : null;
      } catch { return null; }
    },
    normalizeCharacterImageSetText: value => String(value).slice(0, 20),
    renderEmoteGrid() {},
    scheduleCharacterImageLibraryPersistence(reason) { saves.push(reason); }
  });
  context.normalizeCharacterImageSetImageUrl = context.normalizeImageUrlForStorage;
  context.getActiveCharacterImageSet = () => context.activeSet;
  for (const name of ['character-avatar-import', 'character-album-import', 'character-profile-events']) {
    vm.runInContext(fs.readFileSync(new URL(`../modules/characters/${name}.js`, import.meta.url), 'utf8'), context);
  }
  return { context, nodes, listeners, saves };
}

function albumResponse(images = [{ url: 'https://i.imgur.com/album.png', title: 'Album' }]) {
  return { ok: true, status: 200, json: async () => ({ images }) };
}

test('links are stored synchronously with no image request; limits and existing labels survive', () => {
  const { context } = loadImporter();
  const slots = [{ img: 'https://i.imgur.com/old.png', label: 'Eigener Name' }, null];
  const result = context.buildCharacterAvatarImport({
    slots, limit: 2,
    rawValue: 'https://i.imgur.com/old.png\nhttps://i.imgur.com/slow.png\nhttps://i.imgur.com/slow.png\nhttps://i.imgur.com/extra.png'
  });
  assert.equal(result.then, undefined);
  assert.equal(result.addedCount, 1);
  assert.equal(result.duplicateCount, 1);
  assert.equal(result.skippedCapacityCount, 1);
  assert.equal(result.slots[0].label, 'Eigener Name');
  assert.equal(result.slots[1].img, 'https://i.imgur.com/slow.png');
  assert.equal(slots[1], null);
});

test('consecutive drops update slots and queue persistence before either promise is awaited', async () => {
  const { context, saves } = loadImporter();
  const first = context.importCharacterAvatarLinks('https://i.imgur.com/first.png');
  const second = context.importCharacterAvatarLinks('https://i.imgur.com/second.png');
  assert.deepEqual(Array.from(context._emoteSlots.filter(Boolean), slot => slot.img), [
    'https://i.imgur.com/first.png', 'https://i.imgur.com/second.png'
  ]);
  assert.equal(saves.length, 2);
  await Promise.all([first, second]);
});

test('unsafe protocols and empty input do not import links', () => {
  const { context } = loadImporter();
  for (const rawValue of ['', 'javascript:alert(1)', 'data:image/png;base64,abc', 'blob:https://example.com/id']) {
    assert.equal(context.buildCharacterAvatarImport({ rawValue, slots: [] }).addedCount, 0);
  }
});

test('linked-image drag prefers its actual source over the surrounding Imgur page', () => {
  const { context } = loadImporter();
  const html = '<a href="https://imgur.com/a/AbC123"><img src="https://i.imgur.com/photo.png"></a>';
  context.DOMParser = class {
    parseFromString(value, type) {
      assert.equal(value, html);
      assert.equal(type, 'text/html');
      return { querySelectorAll: () => [{ getAttribute: () => 'https://i.imgur.com/photo.png' }] };
    }
  };
  const transfer = { getData: type => ({ 'text/html': html, 'text/uri-list': 'https://imgur.com/a/AbC123' })[type] || '' };
  assert.equal(context.readCharacterAvatarDropText(transfer), 'https://i.imgur.com/photo.png');
});

test('plain URL drops ignore uri-list comments and accept Firefox URL data', () => {
  const { context } = loadImporter();
  const transfer = values => ({ getData: type => values[type] || '' });
  assert.equal(context.readCharacterAvatarDropText(transfer({
    'text/uri-list': '# https://example.com/page\r\nhttps://i.imgur.com/photo.png\r\n'
  })), 'https://i.imgur.com/photo.png');
  assert.equal(context.readCharacterAvatarDropText(transfer({
    'text/x-moz-url': 'https://i.imgur.com/photo.png\nBildtitel'
  })), 'https://i.imgur.com/photo.png');
  assert.equal(context.readCharacterAvatarDropText(null), '');
});

test('drag feedback is immediate on entry and drop immediately adds the link', () => {
  const { context, nodes, listeners, saves } = loadImporter();
  const classes = [];
  context.document.getElementById('cp-avatar-import-zone').classList.toggle = (...args) => classes.push(args);
  let prevented = 0;
  const event = {
    target: { closest: () => ({}) },
    preventDefault() { prevented++; },
    dataTransfer: { getData: type => type === 'text/uri-list' ? 'https://i.imgur.com/drop.png' : '' }
  };
  listeners.get('dragenter')(event);
  assert.equal(event.dataTransfer.dropEffect, 'copy');
  assert.deepEqual(classes.at(-1), ['is-dragging', true]);
  listeners.get('drop')(event);
  assert.deepEqual(classes.at(-1), ['is-dragging', false]);
  assert.equal(prevented, 2);
  assert.equal(context._emoteSlots[0].img, 'https://i.imgur.com/drop.png');
  assert.match(nodes.get('cp-avatar-import-status').textContent, /1 Avatar übernommen/);
  assert.equal(saves.length, 1);
});

test('album links accept title slugs, mobile hosts, pasted punctuation and no scheme', () => {
  const { context } = loadImporter();
  for (const url of [
    'https://imgur.com/a/AbC123', 'https://imgur.com/gallery/mein-album-AbC123?share=1',
    'https://m.imgur.com/a/AbC123#one', 'imgur.com/a/AbC123', 'https://www.imgur.com/a/AbC123).'
  ]) assert.equal(context.extractImgurAlbumHash(url), 'AbC123', url);
  assert.equal(context.findImgurAlbumUrl('Mein Album: https://imgur.com/a/AbC123).'), 'https://imgur.com/a/AbC123');
  for (const url of [
    'https://evil.example/a/AbC123', 'https://imgur.com.evil.example/a/AbC123',
    'https://i.imgur.com/AbC123.png', 'https://imgur.com/user/a/AbC123',
    'https://imgur.com/a/AbC123/extra', 'ftp://imgur.com/a/AbC123'
  ]) assert.equal(context.extractImgurAlbumHash(url), '', url);
});

test('album requests distinguish a missing service, configuration errors and an empty album', async () => {
  const { context } = loadImporter();
  const url = 'https://imgur.com/a/AbC123';
  await assert.rejects(context.requestImgurAlbumImages(url, async () => ({
    ok: false, status: 404, json: async () => { throw new Error('HTML page'); }
  })), /Website-Adresse nicht verfügbar/);
  await assert.rejects(context.requestImgurAlbumImages(url, async () => ({
    ok: false, status: 503, json: async () => ({ error: 'Noch nicht eingerichtet' })
  })), error => error.status === 503 && /Noch nicht eingerichtet/.test(error.message));
  await assert.rejects(context.requestImgurAlbumImages(url, async () => albumResponse([])), /keine importierbaren Bilder/);
  await assert.rejects(context.requestImgurAlbumImages(url, async () => { throw new Error('Network'); }), /antwortet nicht/);
});

test('a slow album merges into the latest slots without replacing an intervening drop or labels', async () => {
  const { context, nodes } = loadImporter();
  let release;
  context.fetch = async (url, options) => {
    assert.match(url, /album=AbC123$/);
    assert.ok(options.signal);
    return new Promise(resolve => { release = resolve; });
  };
  const input = context.document.getElementById('cp-avatar-links');
  input.value = 'imgur.com/a/mein-album-AbC123';
  const importing = context.importCharacterAvatarLinks();
  await context.importCharacterAvatarLinks('https://i.imgur.com/drop.png');
  context._emoteSlots[0].label = 'Eigener Name';
  input.value = 'https://i.imgur.com/next.png';
  release(albumResponse([
    { url: 'https://i.imgur.com/drop.png', title: 'Anderer Name' },
    { url: 'https://i.imgur.com/album.png', title: 'Albumname' }
  ]));
  await importing;
  assert.equal(context._emoteSlots[0].label, 'Eigener Name');
  assert.equal(context._emoteSlots[1].label, 'Albumname');
  assert.equal(input.value, 'https://i.imgur.com/next.png');
  assert.match(nodes.get('cp-avatar-import-status').textContent, /1 Bild.*1 bereits vorhanden/);
});

test('album responses never enter a different set or a reopened character editor', async () => {
  for (const change of ['set', 'character', 'reopen']) {
    const { context, saves } = loadImporter();
    let release;
    context.fetch = () => new Promise(resolve => { release = resolve; });
    const importing = context.importCharacterImgurAlbum('https://imgur.com/a/AbC123');
    if (change === 'character') context._editingChar = 'figure-b';
    else context.activeSet = { id: change === 'set' ? 'wedding' : 'standard' };
    release(albumResponse());
    await importing;
    assert.equal(context._emoteSlots.length, 0);
    assert.equal(saves.length, 0);
  }
});

test('grid updates keep existing image and label nodes when another slot changes', () => {
  const { context } = loadImporter();
  const grid = {
    children: [],
    appendChild(node) { node.parentElement = this; this.children.push(node); }
  };
  context.document.createElement = () => ({
    dataset: {}, writes: 0,
    set innerHTML(html) { this.writes++; this.input = { value: html.match(/type="text" value="([^"]*)"/)?.[1] || '' }; },
    querySelector() { return this.input; }
  });
  context.document.getElementById = id => id === 'cp-emote-grid' ? grid : null;
  vm.runInContext(fs.readFileSync(new URL('../modules/characters/character-profile.js', import.meta.url), 'utf8'), context);
  vm.runInContext(`_emoteSlots = [{ img: 'https://i.imgur.com/first.png', label: 'Name' }, null];`, context);
  context.updateCharacterAvatarImportSummary = () => {};
  context.escapeHtml = value => value;
  context.sanitizeImageSrc = value => value;
  context.renderEmoteGrid();
  const originalInput = grid.children[0].input;
  vm.runInContext(`_emoteSlots[1] = { img: 'https://i.imgur.com/next.png', label: 'Neu' };`, context);
  context.renderEmoteGrid();
  assert.equal(grid.children[0].writes, 1);
  assert.equal(grid.children[0].input, originalInput);
  assert.equal(grid.children[1].writes, 2);
});
