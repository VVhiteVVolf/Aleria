import '../../../../../AleriaAlmanach/modules/biography/biography-card-rendering.js';
import { escapeHtml, initials } from '../../ui/dom.js';
import {
  sanitizeBiographyHref,
  sanitizeBiographyImageSource,
  sanitizeBiographyRichText
} from '../person-biography/person-biography-content.js';

export function renderBiographyImage({ source, title, placeholder = '' }) {
  const image = sanitizeBiographyImageSource(source);
  return image
    ? `<img class="biography-portrait" src="${escapeHtml(image)}" alt="${escapeHtml(title)}" loading="eager" decoding="async" fetchpriority="high">`
    : `<div class="biography-portrait placeholder" role="img" aria-label="Kein Bild vorhanden">${escapeHtml(placeholder || initials(title))}</div>`;
}

export function renderBiographyPage({ documentRef = globalThis.document, ...page }) {
  return globalThis.AleriaBiographyCards.renderPage(page, {
    escape: escapeHtml,
    imageSource: value => escapeHtml(sanitizeBiographyImageSource(value)),
    href: value => escapeHtml(sanitizeBiographyHref(value)),
    richText: value => sanitizeBiographyRichText(value, documentRef),
    documentRef
  });
}
