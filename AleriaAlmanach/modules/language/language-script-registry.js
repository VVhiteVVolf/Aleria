// Shared display-only language scripts. Plain saved text is never translated or rewritten.
(function () {
'use strict';
const entries = Object.freeze({
  arcane: {
    label: 'Arkanes Alphabet · Alte Zunge',
    cssFamily: 'Aleria Arcana',
    transliterator: identityCommentLanguageText
  },
  rheunwaith: {
    label: 'Rheunwaith · Avallornisch',
    cssFamily: 'Rheunwaith',
    transliterator: text => getLanguageScriptDisplayText(text, 'rheunwaith')
  },
  karnrith: {
    label: 'Morgar · Karnrith',
    cssFamily: 'Karnrith Tiefenrunen',
    transliterator: text => getLanguageScriptDisplayText(text, 'karnrith')
  },
  laerelis: {
    label: 'Laerelis · Lichtfluss',
    cssFamily: 'Laerelis Lichtfluss',
    transliterator: text => getLanguageScriptDisplayText(text, 'laerelis')
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


function identityCommentLanguageText(text) {
  return String(text || '');
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


function display(text, language) {
  const script = entries[language];
  return script ? script.transliterator(String(text ?? '')) : String(text ?? '');
}
window.AleriaLanguageScripts = Object.freeze({ entries, display });
})();
