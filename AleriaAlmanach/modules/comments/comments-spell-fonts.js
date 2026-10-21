// Shared language-script registry for spell formulas and foreign-language speech.
// Stored text remains readable; the selected script is only applied while rendering.

const COMMENT_LANGUAGE_DEFAULT = 'rheunwaith';
const COMMENT_LANGUAGE_DEFAULT_COLORS = Object.freeze({
  spell: '#2d6b78',
  foreign: '#526f91'
});

const COMMENT_LANGUAGES = window.AleriaLanguageScripts.entries;

// Compatibility aliases keep existing saved spell comments readable.
const COMMENT_SPELL_FONT_DEFAULT = COMMENT_LANGUAGE_DEFAULT;
const COMMENT_SPELL_FONTS = COMMENT_LANGUAGES;

function normalizeCommentLanguage(value) {
  const key = String(value || COMMENT_LANGUAGE_DEFAULT).toLowerCase();
  return Object.prototype.hasOwnProperty.call(COMMENT_LANGUAGES, key) ? key : COMMENT_LANGUAGE_DEFAULT;
}

function normalizeCommentSpellFont(value) {
  return normalizeCommentLanguage(value);
}

function commentKindUsesLanguage(kind) {
  const normalized = normalizeCommentKind(kind);
  return normalized === 'spell' || normalized === 'foreign';
}

function getCommentLanguage(source) {
  if (source && typeof source === 'object') {
    return normalizeCommentLanguage(source.language || source.spellFont);
  }
  return normalizeCommentLanguage(source);
}

function getDefaultCommentLanguageColor(kind = 'spell') {
  return normalizeCommentKind(kind) === 'foreign'
    ? COMMENT_LANGUAGE_DEFAULT_COLORS.foreign
    : COMMENT_LANGUAGE_DEFAULT_COLORS.spell;
}

function normalizeCommentLanguageColor(value, kind = 'spell') {
  const fallback = getDefaultCommentLanguageColor(kind);
  const color = String(value || '').trim().toLowerCase();
  if (/^#[0-9a-f]{6}$/.test(color)) return color;
  if (/^#[0-9a-f]{3}$/.test(color)) {
    return `#${color.slice(1).split('').map(part => part + part).join('')}`;
  }
  return fallback;
}

function getCommentLanguageColor(source, kind = 'spell') {
  const value = source && typeof source === 'object' ? source.languageColor : source;
  return normalizeCommentLanguageColor(value, kind);
}

function getCommentLanguageColorChannels(value, kind = 'spell') {
  const color = normalizeCommentLanguageColor(value, kind);
  return [1, 3, 5].map(index => Number.parseInt(color.slice(index, index + 2), 16)).join(', ');
}

// Compatibility wrappers keep existing language probes and consumers stable.
function transliterateElderFuthark(text) { return window.AleriaLanguageScripts.display(text, 'runic'); }
function transliterateOgham(text) { return window.AleriaLanguageScripts.display(text, 'ogham'); }
function transliterateEgyptian(text) { return window.AleriaLanguageScripts.display(text, 'hieroglyphs'); }
function transliterateKanaanith(text) { return window.AleriaLanguageScripts.display(text, 'kanaanith'); }

function transliterateCommentLanguageText(text, language) {
  const normalized = normalizeCommentLanguage(language);
  return COMMENT_LANGUAGES[normalized].transliterator(text);
}

function transliterateCommentSpellText(text, font) {
  return transliterateCommentLanguageText(text, font);
}

function getCommentLanguageOptions(selected) {
  const normalized = normalizeCommentLanguage(selected);
  return Object.entries(COMMENT_LANGUAGES).map(([value, config]) =>
    `<option value="${value}"${value === normalized ? ' selected' : ''}>${escapeHtml(config.label)}</option>`
  ).join('');
}

function getCommentLanguageControls(segment, edit = false) {
  const kind = normalizeCommentKind(segment?.kind);
  if (!commentKindUsesLanguage(kind)) return '';
  const languageAction = edit ? 'set-edit-comment-segment-language' : 'set-comment-segment-language';
  const colorAction = edit ? 'set-edit-comment-segment-language-color' : 'set-comment-segment-language-color';
  const segmentId = escapeHtml(segment.id);
  const language = getCommentLanguage(segment);
  const color = getCommentLanguageColor(segment, kind);
  return `
    <div class="comment-segment-language-settings" aria-label="Sprache und Farbe">
      <label class="comment-segment-language-field">
        <span>Sprache</span>
        <select data-action="${languageAction}" data-segment-id="${segmentId}">${getCommentLanguageOptions(language)}</select>
      </label>
      <label class="comment-segment-language-field comment-segment-language-color">
        <span>Farbe</span>
        <input type="color" value="${color}" data-action="${colorAction}" data-segment-id="${segmentId}" aria-label="Farbe der ${kind === 'spell' ? 'Zauberformel' : 'Fremdsprache'}">
      </label>
    </div>`;
}

function getCommentSpellFontControl(segment, edit = false) {
  return getCommentLanguageControls(segment, edit);
}

function getCommentLanguageBubbleAttributes(source, kind) {
  if (!commentKindUsesLanguage(kind)) return '';
  const language = getCommentLanguage(source);
  const color = getCommentLanguageColor(source, kind);
  const channels = getCommentLanguageColorChannels(color, kind);
  return ` data-comment-language="${language}" data-spell-font="${language}" style="--comment-language-color:${color};--comment-language-rgb:${channels}"`;
}

function buildCommentLanguageTextMarkup(text, source, kind, commentId = '', partIdx = 0) {
  const language = getCommentLanguage(source);
  const config = COMMENT_LANGUAGES[language];
  const cipher = parseCommentMarkup(transliterateCommentLanguageText(text, language));
  const plain = parseCommentMarkup(text);
  const translationId = escapeHtml(`${commentId || 'comment'}-language-${partIdx}`);
  const direction = config.direction === 'rtl' ? ' dir="rtl"' : '';
  return `
    <button type="button" class="comment-language-toggle comment-text" data-action="toggle-comment-language" data-comment-language="${language}" aria-expanded="false" aria-controls="${translationId}" title="Zum Übersetzen mit der Maus darüberfahren, antippen oder fokussieren">
      <span class="comment-language-script" aria-hidden="true"${direction}>${cipher}</span>
      <span id="${translationId}" class="comment-language-plain">${plain}</span>
    </button>`;
}

function buildSpellCommentTextMarkup(text, font, commentId = '', partIdx = 0) {
  return buildCommentLanguageTextMarkup(text, { language: font }, 'spell', commentId, partIdx);
}
