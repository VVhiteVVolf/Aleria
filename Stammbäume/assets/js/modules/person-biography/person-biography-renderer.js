import { resolvePortraitSource } from '../../config/portrait-placeholders.js';
import { escapeHtml, initials } from '../../ui/dom.js';
import { renderBiographyPage } from '../biography-page/biography-page-renderer.js';
import { sanitizeBiographyImageSource } from './person-biography-content.js';
import { normalizePersonBiographyModule } from './person-biography-model.js';

function biographyPortrait(person, data) {
  const mainPortrait = sanitizeBiographyImageSource(resolvePortraitSource(person));
  const stages = (Array.isArray(data.portraitStages) ? data.portraitStages : [])
    .map((source, index) => ({
      label: `[${index + 2}]`,
      image: sanitizeBiographyImageSource(source)
    }))
    .filter(stage => stage.image);

  if (!stages.length) {
    return mainPortrait
      ? `<img class="biography-portrait" src="${escapeHtml(mainPortrait)}" alt="Portrait von ${escapeHtml(person.name)}" loading="lazy" decoding="async">`
      : `<div class="biography-portrait placeholder" role="img" aria-label="Kein Portrait vorhanden">${escapeHtml(initials(person.name))}</div>`;
  }

  const portraits = [{ label: '[1]', image: mainPortrait }, ...stages];
  return `<div class="person-biography-portrait-tabs" data-biography-portrait-tabs>
    <div class="person-biography-portrait-tab-bar" role="tablist" aria-label="Portrait-Altersstufen">
      ${portraits.map((portrait, index) => `<button class="person-biography-portrait-tab${index === 0 ? ' is-active' : ''}" type="button" role="tab" aria-selected="${index === 0 ? 'true' : 'false'}" data-biography-portrait-tab="${index}">${escapeHtml(portrait.label)}</button>`).join('')}
    </div>
    ${portraits.map((portrait, index) => portrait.image
      ? `<img class="biography-portrait person-biography-portrait-pane${index === 0 ? ' is-active' : ''}" data-biography-portrait-pane="${index}" src="${escapeHtml(portrait.image)}" alt="${escapeHtml(portrait.label)} · Portrait von ${escapeHtml(person.name)}" loading="${index === 0 ? 'eager' : 'lazy'}" decoding="async">`
      : `<div class="biography-portrait person-biography-portrait-pane placeholder${index === 0 ? ' is-active' : ''}" data-biography-portrait-pane="${index}" role="img" aria-label="Kein Portrait vorhanden">${escapeHtml(initials(person.name))}</div>`).join('')}
  </div>`;
}

export function renderPersonBiography({ person, biographyModule, documentRef = globalThis.document }) {
  const module = normalizePersonBiographyModule(biographyModule);
  return renderBiographyPage({
    portraitHtml: biographyPortrait(person, module.biography),
    stats: module.stats,
    quote: module.quote,
    quoteBy: module.quoteBy,
    data: module.biography,
    documentRef
  });
}
