// Display projection only. Stored descriptions remain untouched and the caller
// still escapes the resulting text before inserting its own trusted markup.
const entities = Object.freeze({
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  ndash: '–', mdash: '—', hellip: '…', bull: '•', euro: '€',
  laquo: '«', raquo: '»', copy: '©', reg: '®', trade: '™',
  auml: 'ä', ouml: 'ö', uuml: 'ü', Auml: 'Ä', Ouml: 'Ö', Uuml: 'Ü', szlig: 'ß'
});

export function registerDisplayText(value) {
  return String(value ?? '')
    .replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (entity, code) => {
      if (code[0] !== '#') return entities[code] ?? entity;
      const point = Number.parseInt(code.slice(code[1]?.toLowerCase() === 'x' ? 2 : 1), code[1]?.toLowerCase() === 'x' ? 16 : 10);
      return point > 0 && point <= 0x10ffff && !(point >= 0xd800 && point <= 0xdfff) ? String.fromCodePoint(point) : '�';
    })
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<(script|style|iframe|object|template|noscript)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, '')
    .replace(/<br\b[^>]*>/gi, '\n')
    .replace(/<li\b[^>]*>/gi, '• ')
    .replace(/<\/(?:li|tr)\s*>/gi, '\n')
    .replace(/<\/(?:p|div|section|article|blockquote|h[1-6]|ul|ol)\s*>/gi, '\n\n')
    .replace(/<\/(?:td|th)\s*>/gi, ' ')
    .replace(/<\/?[a-z][^>]*>/gi, '')
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
