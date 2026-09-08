export const escapeHtml = value => String(value ?? '').replace(
  /[&<>"']/g,
  character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character])
);

export function romanNumeral(number) {
  return ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'][number - 1] || String(number);
}

export function renderPicture(image, { className = '', eager = false } = {}) {
  return `<img class="${escapeHtml(className)}" src="${escapeHtml(image.src)}" alt="${escapeHtml(image.alt)}" width="${Number(image.width)}" height="${Number(image.height)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy" decoding="async"'}>`;
}
