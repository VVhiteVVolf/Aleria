// Shared, escaped markup for the register and its provider directory.
export const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
export function safeImage(value) {
  const source = String(value || '').trim();
  return /^(?:https?:\/\/|\.?\.?\/|data:image\/(?:png|jpeg|webp|gif);base64,)/i.test(source) ? source : '';
}
export function listEmblem(list, { fallback = true } = {}) {
  const image = (list?.images || []).map(safeImage).find(Boolean);
  if (image) return `<span class="ir-provider-emblem" aria-hidden="true"><img src="${escape(image)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer"></span>`;
  return fallback ? `<span class="ir-list-initial" aria-hidden="true">${escape(list?.title?.[0] || '◇')}</span>` : '';
}
