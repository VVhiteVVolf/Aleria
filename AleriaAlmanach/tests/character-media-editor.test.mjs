import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

function loadEditor() {
  const timers = new Map();
  const images = [];
  const saves = [];
  const displays = [];
  const nodes = new Map(['cp-portrait-url', 'cp-portrait-url-error', 'cp-name'].map(id => [id, { value: '', style: {} }]));
  let nextTimerId = 0;
  const context = vm.createContext({
    URL, Date, AbortController,
    _charPortraitUrl: null, _emoteSlots: [], MAX_EMOTES: 80,
    window: {},
    document: { getElementById: id => nodes.get(id) || null },
    setTimeout(callback) { const id = ++nextTimerId; timers.set(id, callback); return id; },
    clearTimeout(id) { timers.delete(id); },
    Image: class extends EventTarget {
      constructor() { super(); images.push(this); }
      removeAttribute(name) { if (name === 'src') this.src = ''; }
    },
    syncPortraitDisplay(...args) { displays.push(args); },
    prompt: () => 'https://example.com/emote.png',
    alert: message => { throw new Error(message); },
    normalizeSearchText: value => String(value).toLowerCase()
  });
  for (const file of ['image-library/image-library-model', 'image-library/image-library-import',
    'characters/character-image-sets', 'characters/character-avatar-import',
    'characters/character-image-set-editor', 'characters/character-media-editor']) {
    vm.runInContext(fs.readFileSync(new URL(`../modules/${file}.js`, import.meta.url), 'utf8'), context);
  }
  context.normalizeImageUrlForStorage = context.normalizeCharacterImageSetImageUrl;
  context.scheduleCharacterImageLibraryPersistence = reason => saves.push(reason);
  return {
    context, images, nodes, saves, displays,
    preview(url) { nodes.get('cp-portrait-url').value = url; context.previewPortraitUrl(url); },
    runTimers() {
      const callbacks = [...timers.values()];
      timers.clear();
      callbacks.forEach(callback => callback());
    }
  };
}

test('typing a portrait URL starts one asynchronous preview after the typing pause', () => {
  const editor = loadEditor();
  for (let index = 0; index < 20; index++) editor.preview(`https://example.com/portrait-${index}.png`);
  assert.equal(editor.images.length, 0);
  editor.runTimers();
  assert.equal(editor.images.length, 1);
  assert.equal(editor.images[0].src, 'https://example.com/portrait-19.png');
  assert.equal(editor.images[0].decoding, 'async');
  editor.images[0].dispatchEvent(new Event('load'));
  assert.equal(editor.context._charPortraitUrl, 'https://example.com/portrait-19.png');
  assert.deepEqual(editor.saves, ['portrait']);
  editor.preview('https://example.com/portrait-19.png');
  editor.runTimers();
  assert.equal(editor.images.length, 1);
});

test('replaced portrait requests cannot display stale successes or errors', () => {
  const editor = loadEditor();
  editor.preview('https://example.com/old.png');
  editor.runTimers();
  const oldImage = editor.images[0];
  editor.preview('https://example.com/new.png');
  editor.runTimers();
  assert.equal(oldImage.src, '');
  oldImage.dispatchEvent(new Event('error'));
  oldImage.dispatchEvent(new Event('load'));
  assert.equal(editor.nodes.get('cp-portrait-url-error').style.display, 'none');
  assert.deepEqual(editor.saves, []);
  editor.images[1].dispatchEvent(new Event('load'));
  assert.equal(editor.context._charPortraitUrl, 'https://example.com/new.png');
  assert.deepEqual(editor.saves, ['portrait']);
});

test('set changes cancel scheduled and loading portrait previews, even when the next set has the same URL', () => {
  for (const startRequest of [false, true]) {
    const editor = loadEditor();
    editor.context.initCharacterImageSetEditor({ imageSets: [
      { id: 'standard' }, { id: 'kampf', name: 'Kampf', portrait: 'https://example.com/same.png' }
    ] });
    editor.preview('https://example.com/same.png');
    if (startRequest) editor.runTimers();
    editor.context.selectCharacterImageSet('kampf');
    editor.runTimers();
    for (const image of editor.images) {
      image.dispatchEvent(new Event('load'));
      image.dispatchEvent(new Event('error'));
    }
    assert.equal(editor.images.length, startRequest ? 1 : 0);
    assert.deepEqual(editor.saves, ['active-image-set']);
    assert.equal(editor.context.getActiveCharacterImageSet().id, 'kampf');
  }
});

test('clearing a portrait cancels its preview and persists the empty field immediately', () => {
  const editor = loadEditor();
  editor.preview('https://example.com/old.png');
  editor.preview('');
  editor.runTimers();
  assert.equal(editor.images.length, 0);
  assert.equal(editor.context._charPortraitUrl, null);
  assert.deepEqual(editor.saves, ['clear-portrait']);
});

test('single emote insertion stores the URL without waiting for the image server', () => {
  const editor = loadEditor();
  editor.context._emoteSlots = [{ label: 'Eigene Beschriftung' }];
  editor.context.openEmoteUrlInput(0);
  assert.equal(editor.images.length, 0);
  assert.equal(editor.context._emoteSlots[0].img, 'https://example.com/emote.png');
  assert.equal(editor.context._emoteSlots[0].label, 'Eigene Beschriftung');
  assert.deepEqual(editor.saves, ['emote']);
});

test('rendering the avatar summary does not consume the change before persistence updates its timestamp', () => {
  const editor = loadEditor();
  const oldTimestamp = '2026-07-01T10:00:00.000Z';
  editor.context.initCharacterImageSetEditor({ imageSets: [
    { id: 'standard', emotes: [], createdAt: oldTimestamp, updatedAt: oldTimestamp }
  ] });
  editor.context._emoteSlots[0] = { img: 'https://example.com/new.png', label: 'Neu' };
  editor.context.updateCharacterAvatarImportSummary();
  const saved = editor.context.collectCharacterImageSetEditorData();
  assert.equal(saved.imageSets[0].emotes[0].label, 'Neu');
  assert.equal(saved.imageSets[0].createdAt, oldTimestamp);
  assert.notEqual(saved.imageSets[0].updatedAt, oldTimestamp);
  assert.equal(editor.context.collectCharacterImageSetEditorData().imageSets[0].updatedAt, saved.imageSets[0].updatedAt);
});
