import { escapeHtml as e } from './render.mjs';

/** Shared artwork links and buttons; each country owns its cultural content. */
export const artworkImage = item => item?.ready === false ? null : item?.image || item?.crest || null;
export const artworkOriginal = item => item?.fullsize || item?.original || artworkImage(item);
export const textList = value => Array.isArray(value) ? value.join(' · ') : value || '';

export function renderArtButton(item, { kind = 'artwork', id = item.id, label = item.name, figure = false } = {}) {
  const image = artworkImage(item);
  if (!image) return '<p class="art-pending">Die Illustration wird vorbereitet.</p>';
  return `<button class="art-button${figure ? ' figure-art-button' : ''}" data-action="show-art" data-art-kind="${e(kind)}" data-art-id="${e(id)}" aria-label="${e(label)} ansehen"><img src="${e(image)}" alt="${e(label)}" width="${figure ? 768 : 480}" height="${figure ? 1152 : 480}" loading="lazy"><span>Großansicht und Details ↗</span></button>`;
}
