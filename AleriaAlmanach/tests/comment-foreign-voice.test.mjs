import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createCommentActivityPreview } from '../modules/comments/comment-activity-preview.js';

const source = name => fs.readFileSync(new URL(`../modules/comments/${name}.js`, import.meta.url), 'utf8');
const plain = value => JSON.parse(JSON.stringify(value));
const roleAvatars = {
  'elderly-woman': 'Alte Frau', 'elderly-citizen': 'Alter Bürger', courtesan: 'Dirne', servant: 'Diener',
  'city-guard': 'Stadtwache', knight: 'Ritter', mercenary: 'Söldner', robber: 'Räuber', 'knight-2': 'Ritter Variante', 'mercenary-2': 'Söldner Variante'
};
const avatarIds = ['boy', 'boy-2', 'boy-3', 'girl', 'girl-2', 'girl-3', 'woman', 'woman-2', 'woman-3', 'man', 'man-2', 'man-3', ...Object.keys(roleAvatars), 'person'];
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

function createContext() {
  const character = { id: 'hero', name: 'Hauptfigur', portrait: './hero.png',
    emotes: [{ img: './hero-happy.png', label: 'Fröhlich' }], selectedImageSetId: 'standard' };
  const nodes = new Map();
  const context = vm.createContext({
    console, Date, setTimeout, clearTimeout, escapeHtml,
    sanitizeImageSrc: value => String(value || ''),
    document: { getElementById: id => nodes.get(id) || null, querySelectorAll: () => [], querySelector: () => null, addEventListener() {} },
    getInitialChar: name => String(name || '?')[0],
    normalizeSceneTimeDurationSeconds: value => Math.max(0, Number(value) || 0),
    getSceneTimeSegmentDuration: value => Number(value.durationSeconds) || 5,
    normalizeCommentLanguage: () => 'common', commentKindUsesLanguage: () => false,
    getCommentLanguage: () => 'common', getCommentLanguageColor: () => '',
    getCommentLanguageControls: () => '', getCommentLanguageBubbleAttributes: () => '',
    getAvailableCommentCharacterById: id => ['hero', 'other'].includes(id) ? { ...character, id } : null,
    commentActorMatchesComposerMode: () => true,
    getAvailableCommentCharacterByName: () => character,
    applyCharacterImageSetPresentation: char => char,
    normalizeCharacterImageSets: () => [{ id: 'standard', name: 'Standard', emotes: character.emotes }],
    getSelectedCommentCharacterPresentation: char => char,
    updateCommentFormPreview() {}, updateEditFormPreview() {},
    scheduleCommentFormPreviewUpdate() {}, scheduleEditFormPreviewUpdate() {}, persistCommentDraft() {},
    setCommentFormCounter() {}, setEditFormCounter() {},
    getCurrentCommentThreadId: () => 'fixture',
    getCommentShowcaseItem: () => null, getCommentFazitItem: () => null,
    getCommentModuleInsertItem: () => null, getCommentAttachmentItem: () => null,
    parseCommentMarkup: escapeHtml, rememberCommentTextareaSelection() {}
  });
  context.window = context;
  vm.runInContext(`
    const SCENE_TIME_DEFAULT_SEGMENT_SECONDS = 5, COMMENT_LANGUAGE_DEFAULT = 'common', CHARACTER_IMAGE_SET_DEFAULT_ID = 'standard';
    let _commentMode = 'charakter', _editMode = 'charakter', _commentKind = 'speech';
    let _editSelectedCharId = 'hero', _editSelectedImageSetId = 'standard';
    let _editSelectedEmoteIdx = 0, _editImageSetChangedByUser = false;
    let _editManualMode = false, _portraitUrl = null, _editPortraitUrl = null;
    let _commentSegments = [], _editCommentSegments = [], _commentSegmentSeq = 0;
  `, context);
  vm.runInContext(fs.readFileSync(new URL('../modules/characters/character-comment-picker.js', import.meta.url), 'utf8'), context);
  vm.runInContext("_selectedCharId = 'hero'; _selectedEmoteIdx = 0;", context);
  for (const name of ['comments-foreign-voice', 'comments-render', 'comments-segment-base', 'comments-foreign-voice-ui', 'comments-segments', 'comments-edit-segments', 'comments-segment-events']) {
    vm.runInContext(source(name), context);
  }
  return { context, nodes, run: expression => vm.runInContext(expression, context) };
}

test('twenty-three fixed silhouettes, bounded names and safe fallback are owned by one model', () => {
  const { context } = createContext();
  const model = context.AleriaCommentForeignVoice;
  assert.deepEqual(plain(model.avatars.map(avatar => avatar.id)), avatarIds);
  assert.equal(model.avatars.length, 23);
  for (const [id, label] of Object.entries(roleAvatars)) assert.equal(model.avatars.find(avatar => avatar.id === id).label, label);
  for (const id of avatarIds) {
    assert.equal(model.normalize({ foreignVoiceAvatarId: id }).foreignVoiceAvatarId, id);
    assert.equal(model.getPresentation({ foreignVoiceAvatarId: id }).portrait, `./public/assets/comment-foreign-voice/${id}.png`);
  }
  for (const id of ['boy-4', 'girl-1', 'woman-0', 'man-99', 'merchant', 'traveler', 'craftsperson', 'hero', './hero.png']) {
    assert.equal(model.normalize({ foreignVoiceAvatarId: id }).foreignVoiceAvatarId, 'person');
  }
  assert.equal(model.avatars.find(avatar => avatar.id === 'boy-2').label, 'Junge 2');
  assert.equal(model.avatars.find(avatar => avatar.id === 'girl-3').label, 'Mädchen 3');
  assert.equal(model.avatars.find(avatar => avatar.id === 'woman-2').label, 'Frau 2');
  assert.equal(model.avatars.find(avatar => avatar.id === 'man-3').label, 'Mann 3');
  assert.equal(model.getPresentation(null).charName, 'Fremde/r');
  assert.equal(model.normalize({ foreignVoiceName: '  Runa\n vom Tor  ' }).foreignVoiceName, 'Runa  vom Tor');
  assert.equal(model.normalize({ foreignVoiceName: 'x'.repeat(200) }).foreignVoiceName.length, 80);
  assert.equal(model.normalize({ foreignVoiceName: {}, foreignVoiceAvatarId: '../../hero' }).foreignVoiceAvatarId, 'person');
  assert.ok(Object.isFrozen(model.avatars) && Object.isFrozen(model.avatars[0]));
});

test('foreign voice controls offer only twenty-three silhouettes and escape each individual name', () => {
  const { run } = createContext();
  const markup = run(`getCommentForeignVoiceControls(makeCommentSegment('foreignvoice', '', null, 'left', 5, 'common', '', {
    foreignVoiceName: '\"<Runa>', foreignVoiceAvatarId: 'woman'
  }))`);
  assert.equal((markup.match(/data-avatar-id=/g) || []).length, 23);
  assert.equal((markup.match(/aria-pressed="true"/g) || []).length, 1);
  assert.match(markup, /data-avatar-id="woman"/);
  assert.match(markup, /value="&quot;&lt;Runa&gt;"/);
  assert.doesNotMatch(markup, /hero|Standardportrait|image-set|set-comment-segment-emote/);
});

test('all original and additional silhouettes survive create and edit serialization without own avatar fields', () => {
  const { context, run } = createContext();
  context.expectedAvatarIds = avatarIds;
  run(`_commentSegments = expectedAvatarIds.map(foreignVoiceAvatarId => makeCommentSegment('foreignvoice', 'Stimme', 0, 'left', 5, 'common', '', {
      foreignVoiceName: foreignVoiceAvatarId, foreignVoiceAvatarId, imageSetId: 'hero-set', actorId: 'hero'
    }));
    _editCommentSegments = _commentSegments.map(segment => ({...segment}));`);
  for (const fn of ['buildCommentSegmentsForSave', 'buildEditCommentSegmentsForSave']) {
    const segments = plain(run(`${fn}()`));
    assert.equal(segments.length, 23);
    for (const [index, segment] of segments.entries()) {
      assert.equal(segment.foreignVoiceAvatarId, avatarIds[index]);
      assert.equal(segment.portrait, `./public/assets/comment-foreign-voice/${avatarIds[index]}.png`);
      assert.equal(segment.characterId, '');
      assert.equal(segment.imageSetId, '');
      assert.equal(segment.emoteIndex, null);
    }
  }
});

test('create and edit serialization isolate foreign identity while preserving the main actor and normal neighbours', () => {
  const { run } = createContext();
  run(`_commentSegments = [makeCommentSegment('speech', 'Eigene Worte', 0),
    makeCommentSegment('foreignvoice', 'Willkommen!', 0, 'right', 8, 'common', '', {
      foreignVoiceName: 'Wirtin', foreignVoiceAvatarId: 'woman', imageSetId: 'hero-set', actorId: 'hero', mechanicMode: 'combat'
    })]; _editCommentSegments = _commentSegments.map(segment => ({ ...segment }));`);
  for (const fn of ['buildCommentSegmentsForSave', 'buildEditCommentSegmentsForSave']) {
    const [normal, voice] = plain(run(`${fn}()`));
    assert.equal(normal.charName, 'Hauptfigur');
    assert.equal(normal.portrait, './hero-happy.png');
    assert.equal(normal.characterId, 'hero');
    assert.equal(voice.foreignVoiceName, 'Wirtin');
    assert.equal(voice.foreignVoiceAvatarId, 'woman');
    assert.equal(voice.charName, 'Wirtin');
    assert.equal(voice.portrait, './public/assets/comment-foreign-voice/woman.png');
    assert.equal(voice.characterId, '');
    assert.equal(voice.imageSetId, '');
    assert.equal(voice.emoteIndex, null);
    assert.equal(voice.mechanicMode, 'normal');
    assert.equal(voice.side, 'right');
    assert.equal(voice.durationSeconds, 8);
    assert.equal(voice.sceneActorId, undefined);
  }
  assert.equal(run('_selectedCharId'), 'hero');
  assert.equal(run('_selectedImageSetId'), 'standard');
});

test('forced own-avatar, image-set and scene-actor events are rejected in both editors', () => {
  const { context, run } = createContext();
  context.AleriaCommentSceneCast = { getActor: () => ({ id: 'intruder', emotes: [{ img: './intruder.png' }] }) };
  run(`_commentSegments = [makeCommentSegment('foreignvoice', 'Stimme')]; _editCommentSegments = _commentSegments.map(segment => ({ ...segment }));`);
  for (const edit of [false, true]) {
    const prefix = edit ? 'setEditCommentSegment' : 'setCommentSegment';
    const segment = edit ? '_editCommentSegments[0]' : '_commentSegments[0]';
    run(`${prefix}Emote(${segment}.id, '0'); ${prefix}ImageSet(${segment}.id, 'standard'); ${prefix}Actor(${segment}.id, 'intruder')`);
    assert.equal(run(`${segment}.emoteIndex`), null);
    assert.equal(run(`${segment}.imageSetId`), '');
    assert.equal(run(`${segment}.actorId`), '');
    assert.equal(run(`getCommentSegmentImageSetPicker(${segment}, ${edit})`), '');
    assert.equal(run(`getCommentSegmentActorControl(${segment}, ${edit})`), '');
  }
});

test('multiple foreign voices retain separate names and avatars and ignore edits to other kinds', () => {
  const { run } = createContext();
  run(`_commentSegments = [makeCommentSegment('foreignvoice', 'A'), makeCommentSegment('foreignvoice', 'B'), makeCommentSegment('speech', 'C')];
    setCommentSegmentForeignVoice(_commentSegments[0].id, 'name', 'Torwache');
    setCommentSegmentForeignVoice(_commentSegments[1].id, 'name', 'Kind');
    setCommentSegmentForeignVoice(_commentSegments[0].id, 'avatar', 'man');
    setCommentSegmentForeignVoice(_commentSegments[1].id, 'avatar', 'girl');
    setCommentSegmentForeignVoice(_commentSegments[2].id, 'name', 'Falsch');`);
  const segments = plain(run('buildCommentSegmentsForSave()'));
  assert.deepEqual(segments.map(segment => segment.charName), ['Torwache', 'Kind', 'Hauptfigur']);
  assert.deepEqual(segments.slice(0, 2).map(segment => segment.foreignVoiceAvatarId), ['man', 'girl']);
  assert.equal(segments[2].foreignVoiceName, undefined);
});

test('saved rendering never borrows a hero portrait, title, profile or emote from a foreign voice', () => {
  const { run } = createContext();
  const markup = run(`renderCommentBubble({ id:'post', commentKind:'speech', charName:'Hauptfigur', charTitle:'Held', portrait:'./hero.png', characterId:'hero',
    commentSegments:[{ kind:'foreignvoice', text:'Hallo {emote:0} wieder!', foreignVoiceName:'Hauptfigur', foreignVoiceAvatarId:'boy',
      charName:'Falsch', charTitle:'Falscher Titel', portrait:'./intruder.png', characterId:'hero', imageSetId:'secret', narrator:true }], _hideActions:true }, 0)`);
  assert.match(markup, /comment-kind-foreignvoice/);
  assert.match(markup, /comment-foreign-voice-speaker">Hauptfigur/);
  assert.match(markup, /comment-foreign-voice\/boy.png/);
  assert.doesNotMatch(markup, /hero\.png|hero-happy|intruder|Falscher Titel|open-speaker-profile|data-speaker-character-id/);
  const fallback = run(`renderCommentBubble({id:'unknown', commentKind:'foreignvoice', text:'Hallo', charName:'Hauptfigur', portrait:'./hero.png', _hideActions:true}, 0)`);
  assert.match(fallback, /Fremde\/r/);
  assert.match(fallback, /comment-foreign-voice\/person.png/);
});

test('draft payload and restore retain the individual silhouette fields', () => {
  const { context, nodes, run } = createContext();
  nodes.set('cf-text', { value: 'Entwurf' });
  for (const id of ['cf-name', 'cf-title', 'cf-char-search', 'cf-portrait-url', 'cf-manual-fields', 'cf-selected-name']) {
    nodes.set(id, { value:'', style:{}, textContent:'' });
  }
  vm.runInContext(source('comments-draft'), context);
  run(`_commentSegments = [makeCommentSegment('foreignvoice', 'Entwurf', 0, 'left', 5, 'common', '', {
    foreignVoiceName:'Runa', foreignVoiceAvatarId:'girl', imageSetId:'hero-set'
  })]`);
  const payload = plain(run('getCommentDraftPayload()'));
  assert.equal(payload.segments[0].foreignVoiceName, 'Runa');
  assert.equal(payload.segments[0].foreignVoiceAvatarId, 'girl');
  assert.equal(payload.segments[0].imageSetId, '');
  assert.equal(payload.segments[0].emoteIndex, null);
  context.localStorage = { getItem: () => JSON.stringify(payload) };
  context.getCommentDraftKey = () => 'fixture-draft';
  context.setRichEditorContent = (id, value) => { nodes.get(id).value = value; };
  context.setCommentKind = () => {};
  context.setCommentMode = () => {};
  context.normalizeImageUrlForStorage = () => '';
  context.showCommentDraftNote = () => {};
  run('_commentSegments = []; _selectedCharId = null;');
  assert.equal(run('restoreCommentDraft({render:false})'), true);
  const restored = plain(run('buildCommentSegmentsForSave()'))[0];
  assert.equal(restored.foreignVoiceName, 'Runa');
  assert.equal(restored.foreignVoiceAvatarId, 'girl');
  assert.equal(restored.portrait, './public/assets/comment-foreign-voice/girl.png');
  assert.equal(run('_selectedCharId'), 'hero');
});

test('activity preview derives the same foreign speaker instead of inherited actor fields', () => {
  const preview = createCommentActivityPreview({ id:'post', entryId:'thread', charName:'Hauptfigur',
    commentSegments:[{kind:'foreignvoice', foreignVoiceName:'Torwache', foreignVoiceAvatarId:'man', portrait:'./hero.png', charName:'Hauptfigur', text:'Halt!'}] });
  assert.equal(preview.charName, 'Hauptfigur');
  assert.equal(preview.commentSegments[0].charName, 'Torwache');
  assert.equal(preview.commentSegments[0].portrait, './public/assets/comment-foreign-voice/man.png');
});

test('main actor and global emote selection do not overwrite foreign voice controls', () => {
  const { context, nodes, run } = createContext();
  for (const id of ['cf-manual-fields', 'cf-selected-name', 'ec-portrait-url', 'ec-manual-fields', 'ec-manual-toggle', 'ec-portrait-preview', 'ec-selected-name']) {
    nodes.set(id, { value:'', style:{}, textContent:'' });
  }
  vm.runInContext(source('comments-edit-character-picker'), context);
  run(`_commentSegments = [makeCommentSegment('foreignvoice', 'Hallo', null, 'left', 5, 'common', '', {foreignVoiceName:'Kind',foreignVoiceAvatarId:'boy'})];
    _editCommentSegments = _commentSegments.map(segment => ({...segment}));
    selectCharForComment('other', {render:false,persist:false}); selectEmote(0, {render:false,persist:false});
    selectEditChar('other');`);
  for (const name of ['_commentSegments', '_editCommentSegments']) {
    const segment = plain(run(`${name}[0]`));
    assert.equal(segment.foreignVoiceName, 'Kind');
    assert.equal(segment.foreignVoiceAvatarId, 'boy');
    assert.equal(segment.imageSetId, '');
    assert.equal(segment.emoteIndex, null);
  }
});

test('empty new and edit previews show the silhouette before any words are entered', () => {
  const { context, run } = createContext();
  vm.runInContext(source('comments-preview'), context);
  vm.runInContext(source('comments-edit-preview'), context);
  run(`_commentSegments = [makeCommentSegment('foreignvoice', '', null, 'left', 5, 'common', '', { foreignVoiceAvatarId:'woman' })];
    _editCommentSegments = _commentSegments.map(segment => ({...segment}));`);
  for (const fn of ['getCommentPreviewState', 'getEditPreviewState']) {
    const preview = plain(run(`${fn}()`));
    assert.equal(preview.commentKind, 'foreignvoice');
    assert.equal(preview.name, 'Fremde/r');
    assert.equal(preview.portrait, './public/assets/comment-foreign-voice/woman.png');
  }
  assert.equal(run('_selectedCharId'), 'hero');
});

test('narrators can compose and edit foreign voices and secret actions with independent sides', () => {
  const { run } = createContext();
  run("_commentMode = 'narrator'; _editMode = 'narrator';");
  assert.deepEqual(plain(run('getAllowedCommentSegmentKinds(false)')), ['action', 'sceneitem', 'foreignvoice', 'secretaction']);
  assert.deepEqual(plain(run('getAllowedCommentSegmentKinds(true)')), ['action', 'foreignvoice', 'secretaction']);
  for (const edit of [false, true]) {
    assert.equal(run(`commentSegmentUsesSide('foreignvoice', ${edit})`), true);
    assert.equal(run(`commentSegmentUsesSide('secretaction', ${edit})`), true);
    assert.equal(run(`commentSegmentUsesSide('action', ${edit})`), false);
    assert.equal(run(`commentSegmentUsesSide('sceneitem', ${edit})`), false);
  }
});

test('mixed narrator posts preserve each bubble and discard stale selected actor fields', () => {
  const { run } = createContext();
  run(`_commentMode = 'narrator'; _editMode = 'narrator';
    _commentSegments = [makeCommentSegment('action', 'Der Abend bricht an.'),
      makeCommentSegment('foreignvoice', 'Willkommen!', 0, 'right', 8, 'common', '', {foreignVoiceName:'Torwache',foreignVoiceAvatarId:'man-2'}),
      makeCommentSegment('secretaction', 'Eine Hand greift nach dem Brief.', 0, 'left', 9, 'common', '', {actorId:'hero',imageSetId:'standard'})];
    _editCommentSegments = _commentSegments.map(segment => ({...segment}));
    coerceCommentSegmentsForMode(false); coerceCommentSegmentsForMode(true);`);
  for (const fn of ['buildCommentSegmentsForSave', 'buildEditCommentSegmentsForSave']) {
    const [action, voice, secret] = plain(run(`${fn}()`));
    assert.equal(action.kind, 'action');
    assert.equal(action.narrator, true);
    assert.equal(voice.kind, 'foreignvoice');
    assert.equal(voice.narrator, false);
    assert.equal(voice.charName, 'Torwache');
    assert.equal(voice.foreignVoiceAvatarId, 'man-2');
    assert.equal(voice.side, 'right');
    assert.equal(secret.kind, 'secretaction');
    assert.equal(secret.commentMode, 'narrator');
    assert.equal(secret.narrator, false);
    assert.equal(secret.charName, 'Unbekannte Gestalt');
    assert.equal(secret.portrait, null);
    assert.equal(secret.characterId, '');
    assert.equal(secret.imageSetId, '');
    assert.equal(secret.emoteIndex, null);
    assert.equal(secret.side, 'left');
    assert.equal(secret.durationSeconds, 9);
    assert.equal(secret.mechanicMode, 'normal');
  }
  assert.equal(run('getBaseCommentActorState().narrator'), true);
  assert.equal(run('getEditBaseCommentActorState().narrator'), true);
  assert.equal(run('getCommentSegmentActor(_commentSegments[2])'), null);
  assert.equal(run("applyCommentSegmentEmoteSelection(_commentSegments[2], '0')"), false);
});

test('narrator secret rendering rejects inherited identity, name lookup, inline emotes and profile links', () => {
  const { context, run } = createContext();
  context.AleriaCommentCombatMiniProfile = { renderPortrait() { throw new Error('anonymous speaker must not open a combat profile'); } };
  const markup = run(`renderCommentBubble({id:'narrator-post', narrator:true, commentMode:'narrator', charName:'Hauptfigur',
    charTitle:'Held', portrait:'./hero.png', characterId:'hero', _hideActions:true,
    commentSegments:[{kind:'secretaction',commentKind:'secretaction',narrator:false,text:'Eine Hand {emote:0} greift nach dem Brief.',
      charName:'Hauptfigur',charTitle:'Held',portrait:'./hero-happy.png',characterId:'hero',sceneActorId:'hero'}]}, 0)`);
  assert.match(markup, /comment-kind-secretaction/);
  assert.match(markup, /comment-entry-narrator-secret/);
  assert.match(markup, /Unbekannte Gestalt/);
  assert.match(markup, /comment-portrait-silhouette/);
  assert.doesNotMatch(markup, /Hauptfigur|hero|Held|open-speaker-profile|data-speaker-character-id|comment-narrator-text/);
});

test('empty narrator foreign voice and secret action previews retain their own anonymous presentation', () => {
  const { context, nodes, run } = createContext();
  vm.runInContext(source('comments-preview'), context);
  vm.runInContext(source('comments-edit-preview'), context);
  nodes.set('cf-preview', {innerHTML:''});
  nodes.set('ec-preview', {innerHTML:''});
  run("_commentMode = 'narrator'; _editMode = 'narrator';");
  for (const kind of ['foreignvoice', 'secretaction']) {
    run(`_commentSegments = [makeCommentSegment('${kind}')]; _editCommentSegments = _commentSegments.map(segment => ({...segment}));`);
    for (const fn of ['getCommentPreviewState', 'getEditPreviewState']) {
      const preview = plain(run(`${fn}()`));
      assert.equal(preview.commentKind, kind);
      assert.equal(preview.narrator, false);
      assert.equal(preview.name, kind === 'foreignvoice' ? 'Fremde/r' : 'Unbekannte Gestalt');
    }
    run('updateCommentFormPreview(); updateEditFormPreview();');
    for (const id of ['cf-preview', 'ec-preview']) {
      assert.match(nodes.get(id).innerHTML, new RegExp(`comment-kind-${kind}`));
      assert.doesNotMatch(nodes.get(id).innerHTML, /hero\.png|Hauptfigur|open-speaker-profile/);
    }
  }
});

test('narrator drafts restore both extra kinds with names, avatars and sides', () => {
  const { context, nodes, run } = createContext();
  for (const id of ['cf-text','cf-name','cf-title','cf-char-search','cf-portrait-url','cf-manual-fields','cf-selected-name']) {
    nodes.set(id, {value:'',style:{},textContent:''});
  }
  vm.runInContext(source('comments-draft'), context);
  run(`_commentMode = 'narrator'; _commentSegments = [makeCommentSegment('foreignvoice', 'Hallo', 0, 'right', 5, 'common', '', {
    foreignVoiceName:'Wirtin', foreignVoiceAvatarId:'woman-3'}), makeCommentSegment('secretaction', 'Eine Tür öffnet sich.', 0, 'left')];`);
  const payload = plain(run('getCommentDraftPayload()'));
  assert.equal(payload.mode, 'narrator');
  assert.deepEqual(payload.segments.map(segment => segment.side), ['right','left']);
  context.localStorage = {getItem: () => JSON.stringify(payload)};
  context.getCommentDraftKey = () => 'narrator-draft';
  context.setRichEditorContent = (id, value) => {nodes.get(id).value = value;};
  context.setCommentKind = () => {};
  context.setCommentMode = mode => run(`_commentMode = '${mode}'; coerceCommentSegmentsForMode(false);`);
  context.normalizeImageUrlForStorage = () => '';
  context.showCommentDraftNote = () => {};
  run("_commentMode = 'charakter'; _commentSegments = [];");
  assert.equal(run('restoreCommentDraft({render:false})'), true);
  const [voice, secret] = plain(run('buildCommentSegmentsForSave()'));
  assert.equal(run('_commentMode'), 'narrator');
  assert.equal(voice.foreignVoiceName, 'Wirtin');
  assert.equal(voice.foreignVoiceAvatarId, 'woman-3');
  assert.equal(voice.side, 'right');
  assert.equal(secret.kind, 'secretaction');
  assert.equal(secret.side, 'left');
  assert.equal(secret.portrait, null);
});

test('narrator kind switches preserve foreign voice choice and ordinary character secrecy stays unchanged', () => {
  const { run } = createContext();
  run(`_commentMode = 'narrator'; _editMode = 'narrator';
    _commentSegments = [makeCommentSegment('action','Text')]; _editCommentSegments = _commentSegments.map(segment => ({...segment}));`);
  for (const edit of [false,true]) {
    const segment = edit ? '_editCommentSegments[0]' : '_commentSegments[0]';
    const setter = edit ? 'setEditCommentSegmentKind' : 'setCommentSegmentKind';
    run(`${setter}(${segment}.id,'foreignvoice'); setCommentSegmentForeignVoice(${segment}.id,'name','Runa',${edit});
      ${setter}(${segment}.id,'secretaction'); ${setter}(${segment}.id,'foreignvoice');`);
    assert.equal(run(`${segment}.kind`), 'foreignvoice');
    assert.equal(run(`${segment}.foreignVoiceName`), 'Runa');
  }
  run(`_commentMode = 'charakter'; _editMode = 'charakter';
    _commentSegments = [makeCommentSegment('secretaction','Die Figur handelt.',0)]; _editCommentSegments = _commentSegments.map(segment => ({...segment}));`);
  for (const fn of ['buildCommentSegmentsForSave','buildEditCommentSegmentsForSave']) {
    const [secret] = plain(run(`${fn}()`));
    assert.equal(secret.kind,'secretaction');
    assert.equal(secret.characterId,'hero');
    assert.equal(secret.portrait,'./hero-happy.png');
    assert.equal(secret.commentMode,undefined);
  }
});

test('narrator scene-item serialization keeps its existing path beside extra bubble kinds', () => {
  const { context, run } = createContext();
  context.AleriaSceneItems = {serializeSegment: segment => ({kind:'sceneitem', operationId:segment.sceneItemOperationId})};
  run(`_commentMode = 'narrator'; _commentSegments = [makeCommentSegment('sceneitem','',null,'left',5,'common','',{sceneItemOperationId:'keep-operation'})];`);
  assert.deepEqual(plain(run('buildCommentSegmentsForSave()')), [{kind:'sceneitem',operationId:'keep-operation'}]);
});
