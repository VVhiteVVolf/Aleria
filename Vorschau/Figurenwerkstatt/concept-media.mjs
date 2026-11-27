import { escapeHtml as e } from '../shared/country-workbench/render.mjs';

const workbenchArt = name => `../../shared/cenyr-administration/assets/icons/${name}.webp`;

export const MEDIA_FORMATS = {
  portrait: 'Porträt · 2:3',
  square: 'Wappen / Item · 1:1',
  landscape: 'Ort oder Szene · 3:2'
};

export function inferMediaFormat(width, height) {
  if (!width || !height) return '';
  const ratio = width / height;
  if (ratio >= 1.2) return 'landscape';
  return ratio <= 1 / 1.2 ? 'portrait' : 'square';
}

export function updateMediaFormat(media, format) {
  const explicit = Object.hasOwn(MEDIA_FORMATS, format);
  const image = media.querySelector('button img');
  media.toggleAttribute('data-media-auto', !explicit);
  media.dataset.mediaFormat = explicit ? format
    : inferMediaFormat(image?.naturalWidth, image?.naturalHeight) || media.dataset.mediaDefault;
}

export function safeConceptUrl(input) {
  const value = String(input ?? '').trim();
  if (!value || /[\u0000-\u001f\u007f\\]/.test(value)) return '';
  if (/^(?:\/|\.{1,2}\/)(?!\/)/.test(value)) return value;
  if (!/^https?:\/\/[^/]/i.test(value)) return '';
  try {
    const url = new URL(value);
    return url.username || url.password ? '' : url.href;
  } catch { return ''; }
}

export function artImage(art, size = 24) {
  return `<img src="${e(workbenchArt(art))}" alt="" width="${size}" height="${size}">`;
}

export function renderMedia(url, title, {
  empty = 'Bildlink einfügen', preview = true, format, fallbackFormat = 'portrait'
} = {}) {
  const safe = safeConceptUrl(url);
  const explicit = Object.hasOwn(MEDIA_FORMATS, format);
  const frame = preview ? ` data-media-default="${e(fallbackFormat)}" data-media-format="${e(explicit ? format : fallbackFormat)}"${explicit ? '' : ' data-media-auto'}` : '';
  const message = url?.trim() && !safe ? 'Ungültiger Bildlink' : empty;
  if (!safe) {
    return `<div class="concept-media concept-media--empty" data-media${frame}>${artImage('inquiry', 36)}<span>${e(message)}</span></div>`;
  }
  const picture = `<img src="${e(safe)}" alt="${e(title)}" referrerpolicy="no-referrer" decoding="async">`;
  const previewButton = `<button type="button" data-action="show-image" data-image="${e(safe)}" data-title="${e(title)}" aria-label="${e(title)} groß ansehen">${picture}</button>`;
  return `<div class="concept-media" data-media${frame}>${preview ? previewButton : picture}<span data-role="image-error" hidden>Bild konnte nicht geladen werden.</span></div>`;
}
