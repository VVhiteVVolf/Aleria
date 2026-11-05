import { escapeHtml as e } from './render.mjs';
import { renderArtButton,artworkImage,artworkOriginal } from './art-media.mjs';

/** Cultural facts remain in each country; this view owns only social-card presentation. */
export function renderEstates(estates,context) {
  if (!estates?.length || !context) return '';
  const customs = (context.addresses || []).map(item => `<article><h3>${e(item.title)}</h3><p>${e(item.text)}</p></article>`).join('');
  return `<section class="section country-estates" id="${e(context.sectionId || 'staende')}"><p class="eyebrow">${e(context.eyebrow || 'Gesellschaft und überlieferte Titel')}</p><h2>${e(context.title)}</h2><p class="section-intro">${e(context.introduction)}</p><div class="estate-grid">${estates.map(estate => `<article class="estate-card${estate.present ? '' : ' estate-absent'}"><div class="estate-art">${renderArtButton(estate,{ kind:'estate',label:`${estate.name} · ${estate.commonTitle}` })}</div><p class="eyebrow">${e(estate.commonTitle)}</p><h3>${e(estate.name)}</h3>${estate.present ? '' : `<p class="estate-status">${e(estate.statusLabel)}</p>`}<p>${e(estate.description)}</p></article>`).join('')}</div>${customs ? `<div class="estate-customs">${customs}</div>` : ''}</section>`;
}

export function renderEstateDetails(estate,{ source }) {
  const image = artworkImage(estate),original = artworkOriginal(estate);
  const art = image ? `<figure><a href="${e(original)}" target="_blank" rel="noopener"><img src="${e(image)}" alt="${e(estate.name)}"></a><figcaption><a href="${e(original)}" target="_blank" rel="noopener">Großansicht ↗</a></figcaption></figure>` : '<p class="art-pending">Die Illustration wird vorbereitet.</p>';
  return `<p class="eyebrow">${e(source)}</p><h2 id="art-title">${e(estate.name)}</h2><div class="art-detail-layout">${art}<div><p>${e(estate.description)}</p><dl class="art-facts"><div><dt>Einordnung</dt><dd>${e(estate.commonTitle)}</dd></div>${estate.statusLabel ? `<div><dt>Status</dt><dd>${e(estate.statusLabel)}</dd></div>` : ''}</dl></div></div>`;
}
