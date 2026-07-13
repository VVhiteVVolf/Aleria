const fs = require('fs');
const path = require('path');
const vm = require('vm');

const almanachRoot = path.resolve(__dirname, '..');
const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

const formFields = {
  'cf-name': { value: 'Testfigur' },
  'cf-title': { value: 'Sprachkundige' },
  'cf-text': { value: 'Shalom' },
  'ec-manual-name': { value: 'Testfigur' },
  'ec-manual-title': { value: 'Sprachkundige' }
};

const context = vm.createContext({
  console,
  escapeHtml: value => String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;'),
  parseCommentMarkup: value => String(value ?? ''),
  sanitizeImageSrc: value => String(value ?? ''),
  getInitialChar: value => String(value || '?').slice(0, 1),
  getCommentShowcaseItem: () => null,
  getCommentModuleInsertItem: () => null,
  getCommentAttachmentItem: () => null,
  normalizeSceneTimeDurationSeconds: value => Math.max(0, Number(value) || 0),
  getSceneTimeSegmentDuration: segment => Math.max(0, Number(segment?.durationSeconds) || 0),
  getAvailableCommentCharacterById: () => null,
  setCommentFormCounter() {},
  updateCommentFormPreview() {},
  isCommentFormOpen: () => false,
  document: {
    addEventListener() {},
    getElementById: id => formFields[id] || null
  },
  SCENE_TIME_DEFAULT_SEGMENT_SECONDS: 6,
  _commentSegmentSeq: 0,
  _commentMode: 'charakter',
  _editMode: 'charakter',
  _selectedCharId: null,
  _editSelectedCharId: null,
  _selectedEmoteIdx: null,
  _manualMode: true,
  _editManualMode: true,
  _portraitUrl: null,
  _editPortraitUrl: null,
  _editCommentData: null,
  _commentKind: 'speech'
});
context.window = context;

function loadScript(relativePath) {
  const filename = path.resolve(almanachRoot, relativePath);
  vm.runInContext(fs.readFileSync(filename, 'utf8'), context, { filename });
}

loadScript('modules/comments/comments-spell-fonts.js');
loadScript('modules/comments/comments-render.js');
loadScript('modules/comments/comments-segment-base.js');
loadScript('modules/comments/comments-segments.js');
loadScript('modules/comments/comments-draft.js');
loadScript('modules/comments/comments-reader-events.js');

const checks = vm.runInContext(`(() => {
  const foreign = {
    id: 'foreign-test',
    charName: 'Testfigur',
    charTitle: '',
    portrait: '',
    commentKind: 'foreign',
    language: 'kanaanith',
    languageColor: '#7b3fa1',
    text: 'Shalom',
    side: 'left',
    _hideActions: true
  };
  const spell = {
    ...foreign,
    id: 'spell-test',
    commentKind: 'spell',
    language: '',
    spellFont: 'infernal'
  };
  return {
    languageKeys: Object.keys(COMMENT_LANGUAGES),
    foreignKind: normalizeCommentKind('Fremdsprache'),
    kanaanith: transliterateKanaanith('Shalom'),
    futhark: transliterateElderFuthark('Thing'),
    invalidColor: normalizeCommentLanguageColor('not-a-color', 'foreign'),
    controls: getCommentLanguageControls({ id: 'segment-1', kind: 'foreign', language: 'ogham', languageColor: '#123456' }),
    foreignMarkup: renderCommentBubble(foreign, 0),
    legacySpellMarkup: renderCommentBubble(spell, 0),
    segmentKinds: getAllowedCommentSegmentKinds(false)
  };
})()`, context);

['rheunwaith', 'karnrith', 'infernal', 'kanaanith', 'argenti', 'stoicheia', 'runic', 'ogham', 'faehrtenlaut', 'hieroglyphs']
  .forEach(language => assert(checks.languageKeys.includes(language), `Sprache fehlt in der Registry: ${language}`));
assert(checks.foreignKind === 'foreign', 'Fremdsprache wird nicht normalisiert.');
assert(checks.segmentKinds.includes('foreign'), 'Fremdsprache fehlt in der Abschnittsauswahl.');
assert(checks.kanaanith.includes('𐤔'), 'Kana’anith-Digraph SH wird nicht transliteriert.');
assert(checks.futhark.startsWith('ᚦ'), 'Futhark-Digraph TH wird nicht transliteriert.');
assert(checks.invalidColor === '#526f91', 'Ungültige Fremdsprachenfarbe nutzt nicht den sicheren Standard.');
assert(checks.controls.includes('set-comment-segment-language'), 'Sprachauswahl fehlt im Segmenteditor.');
assert(checks.controls.includes('type="color"'), 'Farbauswahl fehlt im Segmenteditor.');
assert(checks.foreignMarkup.includes('comment-kind-foreign'), 'Fremdsprachenblase wird nicht gerendert.');
assert(checks.foreignMarkup.includes('data-comment-language="kanaanith"'), 'Gewählte Fremdsprache fehlt am Bubble-DOM.');
assert(checks.foreignMarkup.includes('--comment-language-color:#7b3fa1'), 'Gewählte Fremdsprachenfarbe fehlt am Bubble-DOM.');
assert(checks.foreignMarkup.includes('data-action="toggle-comment-language"'), 'Klick-Entschlüsselung fehlt.');
assert(checks.foreignMarkup.includes('comment-language-plain'), 'Klartext der Fremdsprache fehlt.');
assert(checks.legacySpellMarkup.includes('data-comment-language="infernal"'), 'Alte spellFont-Daten werden nicht übernommen.');

const persistenceChecks = vm.runInContext(`(() => {
  _commentSegments = [makeCommentSegment('foreign', 'Shalom', null, 'right', 9, 'kanaanith', '#7b3fa1')];
  setCommentSegmentLanguage(_commentSegments[0].id, 'argenti');
  setCommentSegmentLanguageColor(_commentSegments[0].id, '#123abc');
  const saved = buildCommentSegmentsForSave()[0];
  const draft = getCommentDraftPayload().segments[0];
  return { saved, draft };
})()`, context);
assert(persistenceChecks.saved.language === 'argenti', 'Gewählte Sprache wird beim Speichern nicht übernommen.');
assert(persistenceChecks.saved.languageColor === '#123abc', 'Gewählte Farbe wird beim Speichern nicht übernommen.');
assert(persistenceChecks.draft.language === 'argenti', 'Gewählte Sprache fehlt im lokalen Entwurf.');
assert(persistenceChecks.draft.languageColor === '#123abc', 'Gewählte Farbe fehlt im lokalen Entwurf.');

const readerToggle = vm.runInContext(`(() => {
  const state = { expanded: 'false', revealed: false };
  const trigger = {
    getAttribute: name => name === 'aria-expanded' ? state.expanded : '',
    setAttribute: (name, value) => { if (name === 'aria-expanded') state.expanded = value; },
    classList: { toggle: (name, enabled) => { if (name === 'revealed') state.revealed = enabled; } }
  };
  toggleCommentLanguageReveal(trigger);
  const opened = { ...state };
  toggleCommentLanguageReveal(trigger);
  return { opened, closed: state };
})()`, context);
assert(readerToggle.opened.expanded === 'true' && readerToggle.opened.revealed, 'Klick öffnet die Übersetzung nicht.');
assert(readerToggle.closed.expanded === 'false' && !readerToggle.closed.revealed, 'Zweiter Klick schließt die Übersetzung nicht.');

const bubbleCssPath = path.resolve(almanachRoot, 'styles/comment-bubbles.css');
const bubbleCss = fs.readFileSync(bubbleCssPath, 'utf8');
const fontUrls = [...bubbleCss.matchAll(/url\("([^"?#]+)"\)/g)].map(match => match[1]);
fontUrls.forEach(url => {
  const resolved = path.resolve(path.dirname(bubbleCssPath), url);
  assert(fs.existsSync(resolved), `Font-Asset fehlt: ${url}`);
});
assert(bubbleCss.includes('.comment-language-toggle:hover .comment-language-plain'), 'Hover-Entschlüsselung fehlt im CSS.');
assert(bubbleCss.includes('.comment-language-toggle.revealed .comment-language-plain'), 'Persistente Klick-Entschlüsselung fehlt im CSS.');

if (failures.length) {
  console.error('Comment-language checks failed:');
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Comment-language checks passed (${checks.languageKeys.length} scripts, ${fontUrls.length} verified font assets).`);
