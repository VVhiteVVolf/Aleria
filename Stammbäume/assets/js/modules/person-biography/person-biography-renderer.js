import { resolvePortraitSource } from '../../config/portrait-placeholders.js';
import { escapeHtml, initials } from '../../ui/dom.js';
import {
  sanitizeBiographyHref,
  sanitizeBiographyImageSource,
  sanitizeBiographyRichText
} from './person-biography-content.js';
import { normalizePersonBiographyModule } from './person-biography-model.js';

function heading(title) {
  return `<h3 class="biography-section-title">${escapeHtml(title)}<span></span></h3>`;
}

function lines(items, className, documentRef) {
  if (!items.length) return '';
  return `<ul class="biography-list ${className}">${items.map(item => (
    `<li>${sanitizeBiographyRichText(item, documentRef)}</li>`
  )).join('')}</ul>`;
}

function abilityIcon(icon) {
  const image = sanitizeBiographyImageSource(icon);
  return image
    ? `<img src="${escapeHtml(image)}" alt="" loading="lazy" decoding="async">`
    : escapeHtml(icon || '✦');
}

function extraSections(items, position, documentRef) {
  return items.filter(item => item.position === position).map(section => {
    const body = section.mode === 'list'
      ? lines(section.text.split(/\r?\n/).map(item => item.trim()).filter(Boolean), 'compact', documentRef)
      : `<div class="biography-copy">${sanitizeBiographyRichText(section.text, documentRef)}</div>`;
    return `<section class="biography-extra-section">${section.title ? heading(section.title) : ''}${body}</section>`;
  }).join('');
}

function connections(items) {
  if (!items.length) return '';
  return `<div class="biography-connections">${items.map(item => {
    if (item.type === 'heading') {
      return `<div class="biography-connection-heading"><strong>${escapeHtml(item.title)}</strong>${item.detail ? `<span>${escapeHtml(item.detail)}</span>` : ''}</div>`;
    }
    const image = sanitizeBiographyImageSource(item.image);
    return `<div class="biography-connection ${escapeHtml(item.imageFormat)}">
      ${image
        ? `<img class="${escapeHtml(item.imageFormat)}" src="${escapeHtml(image)}" alt="" loading="lazy" decoding="async">`
        : `<div class="biography-connection-placeholder ${escapeHtml(item.imageFormat)}">${escapeHtml(initials(item.name).slice(0, 1))}</div>`}
      <div><strong>${escapeHtml(item.name)}</strong><span>${escapeHtml(item.detail)}</span></div>
    </div>`;
  }).join('')}</div>`;
}

function documents(items) {
  if (!items.length) return '';
  return `<div class="biography-ability-list documents">${items.map(item => {
    const href = sanitizeBiographyHref(item.link);
    const title = item.title || item.text || href;
    const detail = item.title ? item.text : '';
    const titleHtml = href
      ? `<a href="${escapeHtml(href)}"${/^https?:\/\//i.test(href) ? ' target="_blank" rel="noopener noreferrer"' : ''}>${escapeHtml(title)}</a>`
      : escapeHtml(title);
    return `<div class="biography-ability document">
      <div class="biography-ability-icon">${abilityIcon(item.icon || '▧')}</div>
      <div><strong>${titleHtml}</strong>${detail ? `<span>${escapeHtml(detail)}</span>` : ''}</div>
    </div>`;
  }).join('')}</div>`;
}

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
  const data = module.biography;
  const portraitHtml = biographyPortrait(person, data);
  const quote = module.quote
    ? `<div class="biography-quote-card"><div class="biography-quote-mark">“</div><div>${sanitizeBiographyRichText(module.quote, documentRef)}</div>${module.quoteBy ? `<span>${escapeHtml(module.quoteBy)}</span>` : ''}</div>`
    : '';
  const abilities = data.abilities.length
    ? `<div class="biography-ability-list">${data.abilities.map(item => `<div class="biography-ability"><div class="biography-ability-icon">${abilityIcon(item.icon)}</div><div><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.detail)}</span></div></div>`).join('')}</div>`
    : '';

  return `<div class="biography-page" style="--biography-side-width:${data.sideWidth}%;--biography-connection-height:${data.connectionPortraitHeight}px;--biography-connection-text-offset:${data.connectionTextOffset}px;">
    <aside class="biography-left">
      ${portraitHtml}
      ${module.stats.length ? `<div class="biography-info-table"><div class="biography-side-label">Infotabelle</div>${module.stats.map(([label, value]) => `<div class="biography-info-row"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join('')}</div>` : ''}
      ${quote}
    </aside>
    <main class="biography-main">
      ${heading(data.biographyTitle)}
      <div class="biography-copy">${sanitizeBiographyRichText(data.biographyText, documentRef)}</div>
      ${extraSections(data.extraSections, 'afterIntro', documentRef)}
      ${heading(data.abilitiesTitle)}${abilities}
      ${heading(data.historyTitle)}
      <div class="biography-copy">${sanitizeBiographyRichText(data.historyText, documentRef)}</div>
      ${heading(data.worksTitle)}${lines(data.works, 'compact', documentRef)}
      ${extraSections(data.extraSections, 'afterWorks', documentRef)}
    </main>
    <aside class="biography-right">
      ${heading(data.triviaTitle)}${lines(data.trivia, '', documentRef)}
      ${heading(data.quotesTitle)}${lines(data.quotes, 'quotes', documentRef)}
      ${heading(data.connectionsTitle)}${connections(data.connections)}
      ${heading(data.documentsTitle)}${documents(data.documents)}
    </aside>
    ${data.footer ? `<div class="biography-footer">${escapeHtml(data.footer)}</div>` : ''}
  </div>`;
}
