export const html = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
export const button = (action, label, attributes = '', primary = false) => `<button type="button" class="group-button${primary ? ' group-button-primary' : ''}" data-group-action="${action}" ${attributes}>${label}</button>`;
export const empty = text => `<p class="group-empty">${html(text)}</p>`;

function imageSource(src) {
  if (globalThis.sanitizeImageSrc) return globalThis.sanitizeImageSrc(src || '');
  return /^(?:https?:\/\/|\.?\.?\/|[\wÀ-ž /-]+\.(?:png|jpe?g|webp))/i.test(src || '') ? src : '';
}

export function groupPortrait(src, name, className = 'group-member-portrait') {
  const safe = imageSource(src);
  return safe ? `<img class="${className}" src="${html(safe)}" alt="${html(name)}" loading="lazy" decoding="async">` : `<span class="${className} group-initial" aria-hidden="true">${html(name?.slice(0, 1) || '·')}</span>`;
}

export function groupIcon(value, fallback = '◇') {
  const safe = imageSource(value);
  return `<span class="group-icon" aria-hidden="true">${safe ? `<img src="${html(safe)}" alt="" loading="lazy">` : html(value || fallback)}</span>`;
}
