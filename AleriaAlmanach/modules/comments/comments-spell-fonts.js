// Spell-script registry and transliteration.
// Keeps the stored comment text readable while rendering a selected historic script.

const COMMENT_SPELL_FONT_DEFAULT = 'rheunwaith';
const COMMENT_SPELL_FONTS = Object.freeze({
  rheunwaith: { label: 'Rheunwaith', cssFamily: 'Rheunwaith', transliterator: text => String(text || '') },
  infernal: { label: 'Infernale Schrift (Nharazim)', cssFamily: 'Nharazim', transliterator: text => String(text || '') },
  runic: { label: 'Elder Futhark', cssFamily: 'Noto Sans Runic', transliterator: transliterateElderFuthark },
  ogham: { label: 'Irisches Ogham', cssFamily: 'Noto Sans Ogham', transliterator: transliterateOgham },
  hieroglyphs: { label: 'Hieroglyphen', cssFamily: 'Noto Sans Egyptian Hieroglyphs', transliterator: transliterateEgyptian }
});

function normalizeCommentSpellFont(value) {
  const key = String(value || COMMENT_SPELL_FONT_DEFAULT).toLowerCase();
  return Object.prototype.hasOwnProperty.call(COMMENT_SPELL_FONTS, key) ? key : COMMENT_SPELL_FONT_DEFAULT;
}

function replaceSpellScriptText(text, pairs, characters) {
  let value = String(text || '').toLowerCase();
  Object.entries(pairs).forEach(([source, target]) => { value = value.replaceAll(source, target); });
  return Array.from(value).map(character => characters[character] || character).join('');
}

function transliterateElderFuthark(text) {
  return replaceSpellScriptText(text, { th: 'ᚦ', ng: 'ᛜ' }, {
    a:'ᚨ', b:'ᛒ', c:'ᚲ', d:'ᛞ', e:'ᛖ', f:'ᚠ', g:'ᚷ', h:'ᚺ', i:'ᛁ', j:'ᛃ', k:'ᚲ', l:'ᛚ', m:'ᛗ', n:'ᚾ', o:'ᛟ', p:'ᛈ', q:'ᚲ', r:'ᚱ', s:'ᛊ', t:'ᛏ', u:'ᚢ', v:'ᚹ', w:'ᚹ', x:'ᚲᛊ', y:'ᛃ', z:'ᛉ', ä:'ᚨ', ö:'ᛟ', ü:'ᚢ', ß:'ᛊᛊ'
  });
}

function transliterateOgham(text) {
  return replaceSpellScriptText(text, { ng: 'ᚍ', qu: 'ᚊ' }, {
    a:'ᚐ', b:'ᚁ', c:'ᚉ', d:'ᚇ', e:'ᚓ', f:'ᚃ', g:'ᚌ', h:'ᚆ', i:'ᚔ', j:'ᚎ', k:'ᚉ', l:'ᚂ', m:'ᚋ', n:'ᚅ', o:'ᚑ', p:'ᚚ', q:'ᚊ', r:'ᚏ', s:'ᚄ', t:'ᚈ', u:'ᚒ', v:'ᚃ', w:'ᚒ', x:'ᚕ', y:'ᚔ', z:'ᚎ', ä:'ᚐ', ö:'ᚑ', ü:'ᚒ', ß:'ᚄᚄ'
  });
}

function transliterateEgyptian(text) {
  return replaceSpellScriptText(text, { sch: '𓈙', ch: '𓐍', th: '𓍿' }, {
    a:'𓄿', b:'𓃀', c:'𓎡', d:'𓂧', e:'𓇋', f:'𓆑', g:'𓎼', h:'𓉔', i:'𓇋', j:'𓇌', k:'𓎡', l:'𓃭', m:'𓅓', n:'𓈖', o:'𓅱', p:'𓊪', q:'𓈎', r:'𓂋', s:'𓋴', t:'𓏏', u:'𓅱', v:'𓆑', w:'𓅱', x:'𓐍𓋴', y:'𓇌', z:'𓊃', ä:'𓄿', ö:'𓅱', ü:'𓅱', ß:'𓋴𓋴'
  });
}

function transliterateCommentSpellText(text, font) {
  const normalized = normalizeCommentSpellFont(font);
  return COMMENT_SPELL_FONTS[normalized].transliterator(text);
}

function getCommentSpellFontOptions(selected) {
  const normalized = normalizeCommentSpellFont(selected);
  return Object.entries(COMMENT_SPELL_FONTS).map(([value, config]) =>
    `<option value="${value}"${value === normalized ? ' selected' : ''}>${escapeHtml(config.label)}</option>`
  ).join('');
}

function getCommentSpellFontControl(segment, edit = false) {
  if (normalizeCommentKind(segment?.kind) !== 'spell') return '';
  const action = edit ? 'set-edit-comment-segment-spell-font' : 'set-comment-segment-spell-font';
  return `<label class="comment-segment-spell-font"><span>Zauberschrift</span><select data-action="${action}" data-segment-id="${escapeHtml(segment.id)}">${getCommentSpellFontOptions(segment.spellFont)}</select></label>`;
}

function buildSpellCommentTextMarkup(text, font) {
  const normalized = normalizeCommentSpellFont(font);
  const cipher = parseCommentMarkup(transliterateCommentSpellText(text, normalized));
  const plain = parseCommentMarkup(text);
  return `<span class="comment-text comment-spell-text" tabindex="0" data-spell-translation data-spell-font="${normalized}" title="Zum Übersetzen mit der Maus darüberfahren oder fokussieren"><span class="comment-spell-script" aria-hidden="true">${cipher}</span><span class="comment-spell-plain">${plain}</span></span>`;
}
