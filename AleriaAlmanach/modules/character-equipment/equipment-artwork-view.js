import { resolveEquipmentImage } from './equipment-artwork.js?v=20260928-equipment-art-v4';

const escape = value => String(value || '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

export function renderEquipmentArtwork(item, context = {}) {
  const image = resolveEquipmentImage(item, context);
  if (!/^(?:https?:\/\/|\/(?!\/)|\.\.?\/|data:image\/(?:png|jpeg|webp);)/i.test(image)) return '';
  return `<figure class="cp-equipment-art"><img src="${escape(image)}" alt="${escape(item.name)}" loading="lazy" decoding="async"></figure>`;
}
