import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

function loadSegmentEditors() {
  const character = {
    id: 'char-1',
    name: 'Testfigur',
    portrait: 'https://i.imgur.com/standard.png',
    emotes: [{ img: 'https://i.imgur.com/standard-emote.png', label: 'Standard' }],
    imageSets: [
      {
        id: 'standard',
        name: 'Standard',
        portrait: 'https://i.imgur.com/standard.png',
        emotes: [{ img: 'https://i.imgur.com/standard-emote.png', label: 'Standard' }]
      },
      {
        id: 'kampf',
        name: 'Kampf',
        portrait: 'https://i.imgur.com/kampf.png',
        emotes: [{ img: 'https://i.imgur.com/kampf-emote.png', label: 'Entschlossen' }]
      }
    ]
  };
  const context = vm.createContext({
    window: { AleriaCommentSceneCast: { getActor: () => null } },
    document: { getElementById: () => null },
    Date,
    URL,
    console,
    setTimeout,
    clearTimeout,
    sanitizeImageSrc(value) {
      return /^https?:\/\//.test(String(value || '')) ? String(value) : '';
    },
    escapeHtml(value) {
      return String(value || '').replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
    },
    getInitialChar(value) {
      return String(value || '?').charAt(0);
    },
    normalizeCommentKind(value) {
      return String(value || 'speech');
    },
    getAvailableCommentCharacterById(id) {
      return id === character.id ? character : null;
    },
    updateCommentFormPreview() {},
    updateEditFormPreview() {},
    persistCommentDraft() {}
  });

  vm.runInContext(`
    const SCENE_TIME_DEFAULT_SEGMENT_SECONDS = 5;
    const COMMENT_LANGUAGE_DEFAULT = 'common';
    let _commentMode = 'charakter';
    let _editMode = 'charakter';
    let _selectedCharId = 'char-1';
    let _editSelectedCharId = 'char-1';
    let _selectedImageSetId = 'standard';
    let _editSelectedImageSetId = 'standard';
    let _commentSegments = [
      { id: 'create-a', kind: 'speech', imageSetId: 'standard', emoteIndex: 0 },
      { id: 'create-b', kind: 'speech', imageSetId: 'standard', emoteIndex: 0 }
    ];
    let _editCommentSegments = [
      { id: 'edit-a', kind: 'speech', imageSetId: 'standard', emoteIndex: 0 },
      { id: 'edit-b', kind: 'speech', imageSetId: 'standard', emoteIndex: 0 }
    ];
    let _commentSegmentSeq = 0;
  `, context);

  for (const relativePath of [
    '../modules/characters/character-image-sets.js',
    '../modules/comments/comments-segment-base.js',
    '../modules/comments/comments-segments.js',
    '../modules/comments/comments-edit-segments.js'
  ]) {
    vm.runInContext(fs.readFileSync(new URL(relativePath, import.meta.url), 'utf8'), context);
  }
  return context;
}

test('Avatar-Sets werden im neuen Kommentar nur für den gewählten Abschnitt geändert', () => {
  const context = loadSegmentEditors();
  vm.runInContext("setCommentSegmentImageSet('create-a', 'kampf')", context);
  const segments = vm.runInContext('_commentSegments.map(segment => ({ ...segment }))', context);

  assert.equal(segments[0].imageSetId, 'kampf');
  assert.equal(segments[0].emoteIndex, null);
  assert.equal(segments[1].imageSetId, 'standard');
  assert.equal(segments[1].emoteIndex, 0);
  assert.equal(vm.runInContext('_selectedImageSetId', context), 'standard');
});

test('Avatar-Sets werden beim Bearbeiten nur für den gewählten Abschnitt geändert', () => {
  const context = loadSegmentEditors();
  vm.runInContext("setEditCommentSegmentImageSet('edit-b', 'kampf')", context);
  const segments = vm.runInContext('_editCommentSegments.map(segment => ({ ...segment }))', context);

  assert.equal(segments[0].imageSetId, 'standard');
  assert.equal(segments[0].emoteIndex, 0);
  assert.equal(segments[1].imageSetId, 'kampf');
  assert.equal(segments[1].emoteIndex, null);
  assert.equal(vm.runInContext('_editSelectedImageSetId', context), 'standard');
});

test('Avatarwahl behaelt das Set des neuen Kommentarabschnitts bei', () => {
  const context = loadSegmentEditors();
  vm.runInContext("setCommentSegmentImageSet('create-a', 'kampf')", context);
  vm.runInContext("setCommentSegmentEmote('create-a', '0')", context);

  const segment = vm.runInContext('({ ..._commentSegments[0] })', context);
  const actor = vm.runInContext('getCommentSegmentActor(_commentSegments[0], false)', context);

  assert.equal(segment.imageSetId, 'kampf');
  assert.equal(segment.emoteIndex, 0);
  assert.equal(actor.selectedImageSetId, 'kampf');
  assert.equal(actor.emotes[0].img, 'https://i.imgur.com/kampf-emote.png');
  assert.equal(vm.runInContext('_selectedImageSetId', context), 'standard');
});

test('Avatarwahl behaelt das Set des bearbeiteten Kommentarabschnitts bei', () => {
  const context = loadSegmentEditors();
  vm.runInContext("setEditCommentSegmentImageSet('edit-b', 'kampf')", context);
  vm.runInContext("setEditCommentSegmentEmote('edit-b', '0')", context);

  const segment = vm.runInContext('({ ..._editCommentSegments[1] })', context);
  const actor = vm.runInContext('getCommentSegmentActor(_editCommentSegments[1], true)', context);

  assert.equal(segment.imageSetId, 'kampf');
  assert.equal(segment.emoteIndex, 0);
  assert.equal(actor.selectedImageSetId, 'kampf');
  assert.equal(actor.emotes[0].img, 'https://i.imgur.com/kampf-emote.png');
  assert.equal(vm.runInContext('_editSelectedImageSetId', context), 'standard');
});

test('Abschnittsauswahl rendert alle Sets und markiert nur das aktive', () => {
  const context = loadSegmentEditors();
  const markup = vm.runInContext("getCommentSegmentImageSetPicker(_commentSegments[0], false)", context);

  assert.match(markup, /Avatar-Set/);
  assert.match(markup, /data-action="set-comment-segment-image-set"/);
  assert.match(markup, /data-image-set-id="standard"/);
  assert.match(markup, /data-image-set-id="kampf"/);
  assert.equal((markup.match(/aria-pressed="true"/g) || []).length, 1);
});
