import { escapeHtml as h } from '../../../Bestiarium/modules/book-shell/book-template-utils.mjs';

function renderArtHalf(deity, { infernal = false, eager = false } = {}) {
  const className = `zodiac-art-half${infernal ? ' zodiac-art-infernal' : ''}`;
  if (!deity?.portrait) {
    return `<div class="${className} zodiac-art-placeholder" data-role="zodiac-placeholder"><span aria-hidden="true">✧</span><strong>${h(deity?.title || 'Widersacher')}</strong><small>${deity ? 'Bild folgt' : 'Zuordnung noch offen'}</small></div>`;
  }
  const { src, alt, width, height } = deity.portrait;
  return `<div class="${className}"><img data-role="zodiac-theme-image" src="${h(src)}" alt="${h(alt)}" width="${width}" height="${height}" loading="${eager ? 'eager' : 'lazy'}" decoding="async"></div>`;
}

export function renderZodiacArt(sign, deities, { eager = false } = {}) {
  return `<div class="zodiac-art" data-role="zodiac-art">
    ${renderArtHalf(deities[sign.id], { eager })}
    <span class="zodiac-art-divider" aria-hidden="true">✧</span>
    ${renderArtHalf(deities[sign.shadowId], { infernal: true, eager })}
  </div>`;
}
