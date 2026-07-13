// Shared language-script registry for spell formulas and foreign-language speech.
// Stored text remains readable; the selected script is only applied while rendering.

const COMMENT_LANGUAGE_DEFAULT = 'rheunwaith';
const COMMENT_LANGUAGE_DEFAULT_COLORS = Object.freeze({
  spell: '#2d6b78',
  foreign: '#526f91'
});

const COMMENT_LANGUAGES = Object.freeze({
  rheunwaith: {
    label: 'Rheunwaith · Avallornisch',
    cssFamily: 'Rheunwaith',
    transliterator: identityCommentLanguageText
  },
  karnrith: {
    label: 'Morgar · Karnrith',
    cssFamily: 'Karnrith Hochschnitt',
    transliterator: identityCommentLanguageText
  },
  infernal: {
    label: 'Infernal · Nharazim',
    cssFamily: 'Nharazim',
    transliterator: identityCommentLanguageText
  },
  kanaanith: {
    label: 'Kana’anith',
    cssFamily: 'Kanaanith Monumental',
    direction: 'rtl',
    transliterator: transliterateKanaanith
  },
  argenti: {
    label: 'Lingua Argenti · Argentisch',
    cssFamily: 'Lingua Argenti',
    transliterator: identityCommentLanguageText
  },
  stoicheia: {
    label: 'Stoicheia · Phalantisch & Klythesisch',
    cssFamily: 'Stoicheia',
    transliterator: identityCommentLanguageText
  },
  runic: {
    label: 'Futhark · Runisch',
    cssFamily: 'Noto Sans Runic',
    transliterator: transliterateElderFuthark
  },
  ogham: {
    label: 'Ogham',
    cssFamily: 'Noto Sans Ogham',
    transliterator: transliterateOgham
  },
  faehrtenlaut: {
    label: 'Fährtenlaut · Tiersprache',
    cssFamily: 'Faehrtenlaut',
    transliterator: identityCommentLanguageText
  },
  hieroglyphs: {
    label: 'Hieroglyphen',
    cssFamily: 'Noto Sans Egyptian Hieroglyphs',
    transliterator: transliterateEgyptian
  }
});

// Compatibility aliases keep existing saved spell comments readable.
const COMMENT_SPELL_FONT_DEFAULT = COMMENT_LANGUAGE_DEFAULT;
const COMMENT_SPELL_FONTS = COMMENT_LANGUAGES;

function identityCommentLanguageText(text) {
  return String(text || '');
}

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

function replaceCommentLanguageText(text, pairs, characters) {
  let value = String(text || '').toLowerCase();
  Object.entries(pairs).forEach(([source, target]) => { value = value.replaceAll(source, target); });
  return Array.from(value).map(character => characters[character] || character).join('');
}

function transliterateElderFuthark(text) {
  return replaceCommentLanguageText(text, { th: 'ᚦ', ng: 'ᛜ' }, {
    a:'ᚨ', b:'ᛒ', c:'ᚲ', d:'ᛞ', e:'ᛖ', f:'ᚠ', g:'ᚷ', h:'ᚺ', i:'ᛁ', j:'ᛃ', k:'ᚲ', l:'ᛚ', m:'ᛗ', n:'ᚾ', o:'ᛟ', p:'ᛈ', q:'ᚲ', r:'ᚱ', s:'ᛊ', t:'ᛏ', u:'ᚢ', v:'ᚹ', w:'ᚹ', x:'ᚲᛊ', y:'ᛃ', z:'ᛉ', ä:'ᚨ', ö:'ᛟ', ü:'ᚢ', ß:'ᛊᛊ'
  });
}

function transliterateOgham(text) {
  return replaceCommentLanguageText(text, { ng: 'ᚍ', qu: 'ᚊ' }, {
    a:'ᚐ', b:'ᚁ', c:'ᚉ', d:'ᚇ', e:'ᚓ', f:'ᚃ', g:'ᚌ', h:'ᚆ', i:'ᚔ', j:'ᚎ', k:'ᚉ', l:'ᚂ', m:'ᚋ', n:'ᚅ', o:'ᚑ', p:'ᚚ', q:'ᚊ', r:'ᚏ', s:'ᚄ', t:'ᚈ', u:'ᚒ', v:'ᚃ', w:'ᚒ', x:'ᚕ', y:'ᚔ', z:'ᚎ', ä:'ᚐ', ö:'ᚑ', ü:'ᚒ', ß:'ᚄᚄ'
  });
}

function transliterateEgyptian(text) {
  return replaceCommentLanguageText(text, { sch: '𓈙', ch: '𓐍', th: '𓍿' }, {
    a:'𓄿', b:'𓃀', c:'𓎡', d:'𓂧', e:'𓇋', f:'𓆑', g:'𓎼', h:'𓉔', i:'𓇋', j:'𓇌', k:'𓎡', l:'𓃭', m:'𓅓', n:'𓈖', o:'𓅱', p:'𓊪', q:'𓈎', r:'𓂋', s:'𓋴', t:'𓏏', u:'𓅱', v:'𓆑', w:'𓅱', x:'𓐍𓋴', y:'𓇌', z:'𓊃', ä:'𓄿', ö:'𓅱', ü:'𓅱', ß:'𓋴𓋴'
  });
}

function transliterateKanaanith(text) {
  const signs = {
    A:'𐤀', B:'𐤁', C:'𐤇', D:'𐤃', E:'𐤏', F:'𐤐', G:'𐤂', H:'𐤄', I:'𐤉', J:'𐤉',
    K:'𐤊', L:'𐤋', M:'𐤌', N:'𐤍', O:'𐤏', P:'𐤐', Q:'𐤒', R:'𐤓', S:'𐤎', T:'𐤕',
    U:'𐤅', V:'𐤅', W:'𐤅', X:'𐤑', Y:'𐤉', Z:'𐤆', Ä:'𐤀', Ö:'𐤏', Ü:'𐤅', ẞ:'𐤑'
  };
  const pairs = { SH:'𐤔', HH:'𐤇', TT:'𐤈', SS:'𐤑' };
  const value = String(text || '').toUpperCase();
  let result = '';
  for (let index = 0; index < value.length;) {
    const pair = value.slice(index, index + 2);
    if (pairs[pair]) {
      result += pairs[pair];
      index += 2;
    } else {
      result += signs[value[index]] || value[index];
      index += 1;
    }
  }
  return result;
}

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
