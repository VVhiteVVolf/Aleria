export const DOCUMENT_ROOT = '/Dokumente%20aus%20der%20Werkstatt';
export const ID_PATTERN = /^[a-z0-9][a-z0-9-]{0,79}$/;
export const MAX_BATCH_BYTES = 4 * 1024 * 1024;
export const FONT_DATA = /^data:font\/(woff2?|ttf|otf);base64,[A-Za-z0-9+/]+=*$/;
export const IMAGE_DATA = /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+=*$/;

export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

export function slugify(value) {
  return String(value || 'dokument').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'dokument';
}

export function clampNumber(value, fallback, min, max) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(min, Math.min(max, number)) : fallback;
}

export function documentLink(id, base) {
  if (typeof id !== 'string' || !ID_PATTERN.test(id)) throw new Error('Ungültige Dokument-ID.');
  const path = `${DOCUMENT_ROOT}/dokument.html?id=${encodeURIComponent(id)}`;
  return base ? new URL(path, base).href : path;
}

export function safeImageUrl(value) {
  const url = String(value || '').trim();
  if (IMAGE_DATA.test(url)) return url;
  if (/^\/(?!\/)[^\s"'<>\\]*$/.test(url) && !url.includes('..')) return url;
  if (!/^https?:\/\/[^\s"'<>\\]+$/i.test(url)) return '';
  try {
    const parsed = new URL(url);
    if (parsed.username || parsed.password) return '';
    if (['imgur.com', 'www.imgur.com', 'i.imgur.com'].includes(parsed.hostname)) {
      const last = parsed.pathname.split('/').filter(Boolean).at(-1) || '';
      if (/^[a-z0-9]+(?:\.(?:png|jpe?g|webp|gif))?$/i.test(last)) return `https://i.imgur.com/${last.includes('.') ? last : `${last}.jpg`}`;
    }
    return parsed.href;
  } catch { return ''; }
}

export function normalizeDocument(input = {}) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Ungültiges Dokument.');
  const text = (key, fallback = '', limit = 400) => String(input[key] ?? fallback).slice(0, limit);
  const choice = (key, values, fallback) => values.includes(input[key]) ? input[key] : fallback;
  const pages = Array.isArray(input.pages) && input.pages.length ? input.pages : ['<p></p>'];
  if (pages.length > 100 || pages.some(page => typeof page !== 'string' || page.length > 100000)) throw new Error('Maximal 100 Seiten mit je 100.000 Zeichen.');
  const media = {};
  for (const key of ['main', 'signature', 'emblem', 'watermark']) {
    const prefix = key === 'main' ? 'image' : `${key}Image`;
    const slot = input.media?.[key] || { image: input[prefix], size: input[key === 'main' ? 'imageSize' : `${key}Size`], position: input[key === 'main' ? 'imagePosition' : `${key}Position`], frame: input[key === 'main' ? 'imageFrame' : `${key}Frame`] };
    media[key] = {
      image: safeImageUrl(slot.image), size: clampNumber(slot.size, { main: 240, watermark: 420, signature: 180, emblem: 160 }[key], 80, 900),
      position: key === 'watermark' ? 'watermark' : ['left', 'center', 'right', 'watermark'].includes(slot.position) ? slot.position : 'right',
      frame: ['plain', 'none', 'heavy'].includes(slot.frame) ? slot.frame : 'none'
    };
  }
  const font = text('font', "'Eagle Lake'", 100);
  const customFont = input.customFont && FONT_DATA.test(input.customFont.data) && input.customFont.data.length < 2000000
    ? { name: String(input.customFont.name || 'Eigene Schrift').slice(0, 80), data: input.customFont.data } : null;
  const result = {
    schemaVersion: 2, slug: slugify(input.slug || input.title),
    template: choice('template', ['letter', 'book', 'note', 'wanted'], 'letter'),
    title: text('title', 'Unbenanntes Dokument'), subtitle: text('subtitle'), author: text('author'),
    recipient: text('recipient'), date: text('date'), location: text('location'), preset: text('preset'),
    font: /^[a-zA-Z0-9 '\-]+$/.test(font) ? font : "'Eagle Lake'", customFont,
    fontSize: clampNumber(input.fontSize, 20, 12, 48), lineHeight: clampNumber(input.lineHeight, 1.75, 1.1, 2.5),
    letterSpacing: clampNumber(input.letterSpacing, 0, 0, 5), padding: clampNumber(input.padding, 64, 32, 140),
    ink: /^#[a-f0-9]{6}$/i.test(input.ink) ? input.ink : '#302315',
    background: choice('background', ['parchment', 'aged', 'fibers', 'plain', 'dark', 'custom', 'generated'], 'parchment'),
    paperColor: choice('paperColor', ['ivory', 'honey', 'rose', 'sage', 'frost', 'ash'], input.background === 'dark' ? 'ash' : 'ivory'),
    paperEdge: choice('paperEdge', ['straight', 'deckle', 'torn', 'burnt'], input.template === 'note' ? 'torn' : 'straight'),
    paperAge: clampNumber(input.paperAge, 25, 0, 100), paperSeed: Math.round(clampNumber(input.paperSeed, 17, 1, 999999)),
    border: choice('border', ['thin', 'none', 'double', 'heavy', 'ornate'], 'thin'), texture: safeImageUrl(input.texture),
    width: Math.round(clampNumber(input.width, 820, 520, 1200)), height: Math.round(clampNumber(input.height, 1060, 360, 1800)),
    pages: [...pages], currentPage: Math.floor(clampNumber(input.currentPage, 0, 0, pages.length - 1)),
    translation: text('translation', '', 100000), category: text('category', '', 100), media,
    image: media.main.image, imagePosition: media.main.position, imageSize: media.main.size, imageFrame: media.main.frame
  };
  return result;
}

export function validateRecord(record) {
  if (!ID_PATTERN.test(record?.id || '') || !Number.isSafeInteger(record.expectedRevision) || record.expectedRevision < 0) throw new Error('Ungültige Dokument-ID oder Revision.');
  if (!record.document || typeof record.document !== 'object') throw new Error('Das Dokument fehlt.');
  if (record.document.customFont && (!FONT_DATA.test(record.document.customFont.data || '') || record.document.customFont.data.length >= 2000000)) throw new Error('Ungültige oder zu große Schriftdatei.');
  const document = normalizeDocument(record.document);
  if (document.slug !== record.id) throw new Error('Dokument-ID und Dateiname stimmen nicht überein.');
  return { id: record.id, expectedRevision: record.expectedRevision, document };
}
