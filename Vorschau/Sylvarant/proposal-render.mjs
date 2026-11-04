import { escapeHtml as e } from '../shared/country-workbench/render.mjs';
import { renderGovernment, renderInstitutions, renderMilitary, renderOpenQuestions } from '../Leukonia/realm-context-view.mjs';
import { renderRealmHeraldry, renderHouseGallery, renderClassPrototypes, renderArtButton } from './art-view.mjs';
import { renderPlacementArea } from './map-view.mjs';

const copy = entries => entries.map(item => `<article><h3>${e(item.title)}</h3><p>${e(item.text)}</p></article>`).join('');

function renderRegions(regions, settlements) {
  return `<section class="section" id="gebiete"><p class="eyebrow">Archonate und kaiserliche Domäne</p><h2>Die Regionen Sylvarants.</h2><p class="section-intro">Farben und Grenzen folgen der gelieferten Karte. Nummern sind Arbeitsbezeichnungen; Regionalbanner werden ausgelassen.</p><div class="region-grid">${regions.map(region => `<article class="region-card" style="--region-colour:${e(region.colour)}"><p class="eyebrow">${e(region.kindLabel)}</p><h3>${e(region.name)}</h3><p>${e(region.description)}</p><p class="region-cities">${e(settlements.filter(city => city.regionId === region.id).map(city => city.name).join(' · '))}</p></article>`).join('')}</div></section>`;
}

export function renderSylvarantPage({ context, houses, warriors, prototypes, artworks, regions, settlements, variants, castes }) {
  const heroArt = artworks.find(item => item.kind === 'province' && item.ready) || artworks.find(item => item.kind === 'realm' && item.ready);
  const stats = [
    {label:'Archonate',value:regions.filter(region => !region.imperialDomain).length},
    {label:'Kaiserliche Domäne',value:regions.filter(region => region.imperialDomain).length},
    {label:'Orte',value:settlements.length},{label:'Häuser',value:houses.length},
  ];
  return `<a class="skip-link" href="#geschichte">Zum Inhalt</a><header class="toolbar"><a class="wordmark" href="#anfang">ALERIA <span>Werkstatt</span></a><span class="draft-label">Sylvarant · Vorbereitung</span><nav aria-label="Seitenbereiche"><a href="#geschichte">Kontext</a><a href="#gebiete">Gebiete</a><a href="#karte">Karte</a><a href="#haeuser">Häuser</a><a href="#krieger">Krieger</a></nav></header><main>
  <section class="hero${heroArt ? ' hero-with-art' : ''}" id="anfang"><div><p class="eyebrow">${e(context.empireTitle)} · Provinz</p><h1>${e(context.title)}</h1><p class="hero-line">${e(context.subtitle)}</p><p class="lead">${e(context.introduction)}</p><dl class="hero-stats">${stats.map(stat => `<div><dt>${e(stat.label)}</dt><dd>${stat.value}</dd></div>`).join('')}</dl></div>${heroArt ? `<figure class="realm-crest">${renderArtButton(heroArt)}<figcaption>${heroArt.kind === 'province' ? 'Provinzwappen · Entwurf' : 'Geliefertes Reichswappen Argentums'}</figcaption></figure>` : ''}</section>
  <aside class="draft-note"><strong>Lokale Vorbereitung.</strong> ${e(context.scope)}</aside>
  <section class="section" id="geschichte"><p class="eyebrow">Sylvarant und das Silberne Reich</p><h2>Herkunft und Gegenwart.</h2><div class="history-grid">${copy(context.history)}</div><div class="culture-grid">${copy(context.culture)}</div></section>
  ${renderRealmHeraldry(artworks)}${renderRegions(regions,settlements)}${renderPlacementArea({map:variants[0],settlements})}${renderHouseGallery(houses,warriors)}${renderClassPrototypes(prototypes)}
  <details class="imperial-context"><summary>Die gemeinsame Reichsordnung Argentums</summary><section class="section" id="staende"><p class="eyebrow">Gesellschaftliche Stände</p><h2>Die sechs Schichten des Reiches.</h2><div class="caste-copy-grid">${castes.map(caste => `<article><h3>${e(caste.name)}</h3><p>${e(caste.description)}</p></article>`).join('')}</div></section>${renderGovernment(context)}${renderInstitutions(context)}${renderMilitary(context)}</details>${renderOpenQuestions(context)}
  <footer><span>Sylvarant · Kaiserreich Argentum · Vorläufiger Entwurf</span><nav aria-label="Weitere Aktionen"><button data-action="print">Drucken</button><a href="../Leukonia/">Leukonia ↗</a><a href="../Calidaria/">Calidaria ↗</a></nav></footer></main>
  <dialog id="art-dialog" class="proposal-dialog art-dialog house-dialog sylvarant-art-dialog" aria-labelledby="art-title"><div class="dialog-top"><span>Sylvarant · Wappen und Krieger</span><button data-action="close-art" aria-label="Bildfenster schließen">✕</button></div><div class="art-dialog-content" data-role="art-details"></div></dialog><div class="notice" data-role="status" role="status" aria-live="polite" hidden></div>`;
}
