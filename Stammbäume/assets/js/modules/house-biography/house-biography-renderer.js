import { escapeHtml, initials } from '../../ui/dom.js';
import {
  renderBiographyImage,
  renderBiographyPage
} from '../biography-page/biography-page-renderer.js';
import {
  sanitizeBiographyImageSource,
  sanitizeBiographyRichText
} from '../person-biography/person-biography-content.js';
import { normalizeHouseBiographyModule } from './house-biography-model.js';

export function renderHouseBiographyHeader(family, biographyModule, documentRef = globalThis.document) {
  const module = normalizeHouseBiographyModule(biographyModule);
  const crest = sanitizeBiographyImageSource(module.house.crestImage);
  const title = family?.document?.title || module.pageTitle || 'Haus';
  const motto = module.quote ? sanitizeBiographyRichText(module.quote, documentRef) : '';
  return `<div class="house-header">
    <div class="house-header-copy">
      <h2 class="house-header-title">${escapeHtml(title)}</h2>
      ${motto ? `<p class="house-header-motto">${motto}${module.quoteBy ? ` <span>— ${escapeHtml(module.quoteBy)}</span>` : ''}</p>` : ''}
    </div>
    <div class="house-header-crest">
      ${crest
        ? `<img src="${escapeHtml(crest)}" alt="" loading="lazy" decoding="async">`
        : '<div class="house-header-crest-placeholder"></div>'}
    </div>
  </div>`;
}

export function renderHouseBiography({
  family,
  biographyModule,
  documentRef = globalThis.document,
  includeHeader = true
}) {
  const module = normalizeHouseBiographyModule(biographyModule);
  const title = family?.document?.title || module.pageTitle || 'Haus';
  const body = renderBiographyPage({
    portraitHtml: renderBiographyImage({
      source: module.image,
      title,
      placeholder: initials(title).slice(0, 1)
    }),
    stats: module.stats,
    quote: '',
    quoteBy: '',
    data: module.house,
    documentRef
  });
  return `${includeHeader ? renderHouseBiographyHeader(family, module, documentRef) : ''}${body}`;
}
