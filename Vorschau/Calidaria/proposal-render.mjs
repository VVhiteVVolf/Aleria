import { escapeHtml as e } from '../shared/country-workbench/render.mjs';
import { renderGovernment, renderInstitutions, renderMilitary, renderOpenQuestions } from '../Leukonia/realm-context-view.mjs';
import { renderHouseGallery, renderClassPrototypes, renderProvinceHeraldry, renderArtButton } from './art-view.mjs';
import { renderPlacementArea } from './map-view.mjs';

const renderCopy = entries => entries.map(item => `<article><h3>${e(item.title)}</h3><p>${e(item.text)}</p></article>`).join('');

function renderRegions(regions, settlements) {
  return `<section class="section" id="gebiete"><p class="eyebrow">Sieben Archonate · Eine kaiserliche Domäne</p><h2>Die Räume des Archipels.</h2><p class="section-intro">Farben, Grenzen und die kaiserliche Domäne folgen den gelieferten Karten. Nummern unterscheiden die noch unbenannten Gebiete; aus den Markerformen werden keine zusätzlichen Ränge abgeleitet.</p><div class="region-grid">${regions.map(region => `<article class="region-card" style="--region-colour:${e(region.colour)}"><p class="eyebrow">${e(region.kindLabel)}</p><h3>${e(region.name)}</h3><p>${e(region.description)}</p><p class="region-cities">${e(settlements.filter(city => city.regionId === region.id).map(city => city.name).join(' · '))}</p></article>`).join('')}</div></section>`;
}

export function renderCalidariaPage({ context, houses, warriors = [], prototypes, artworks = [], regions, settlements, variants, castes }) {
  const provinceArt = artworks.find(item => item.kind === 'province' && item.ready);
  return `<a class="skip-link" href="#geschichte">Zum Inhalt</a><header class="toolbar"><a class="wordmark" href="#anfang">ALERIA <span>Werkstatt</span></a><span class="draft-label">Calidaria · Vorbereitung</span><nav aria-label="Seitenbereiche"><a href="#geschichte">Kontext</a><a href="#gebiete">Gebiete</a><a href="#karte">Karte</a><a href="#haeuser">Wappen</a><a href="#krieger">Krieger</a></nav></header><main>
  <section class="hero${provinceArt ? ' hero-with-art' : ''}" id="anfang"><div><p class="eyebrow">${e(context.empireTitle)} · Provinz</p><h1>${e(context.title)}</h1><p class="hero-line">${e(context.subtitle)}</p><p class="lead">${e(context.introduction)}</p><dl class="hero-stats"><div><dt>Archonate</dt><dd>7</dd></div><div><dt>Kaiserliche Domäne</dt><dd>1</dd></div><div><dt>Orte</dt><dd>${settlements.length}</dd></div><div><dt>Hauswappen</dt><dd>${houses.length}</dd></div><div><dt>Tlapanui-Prototypen</dt><dd>${prototypes.length}</dd></div></dl></div>${provinceArt ? `<figure class="realm-crest">${renderArtButton(provinceArt)}<figcaption>Provinzwappen · Entwurf</figcaption></figure>` : ''}</section>
  <aside class="draft-note"><strong>Lokale Vorbereitung.</strong> ${e(context.scope)}</aside>
  <section class="section" id="geschichte"><p class="eyebrow">Tlapatlan und das Kaiserreich</p><h2>Von den Tlapanui zu Calidaria.</h2><div class="history-grid">${renderCopy(context.history)}</div><div class="culture-grid">${renderCopy(context.culture)}</div></section>
  ${renderProvinceHeraldry(artworks)}${renderRegions(regions, settlements)}${renderPlacementArea({ variants, settlements })}${renderHouseGallery(houses, warriors)}${renderClassPrototypes(prototypes)}
  <details class="imperial-context"><summary>Die gemeinsame Reichsordnung Argentums</summary><section class="section" id="staende"><p class="eyebrow">Gesellschaftliche Stände</p><h2>Die sechs Schichten des Reiches.</h2><div class="caste-copy-grid">${castes.map(caste => `<article><h3>${e(caste.name)}</h3><p>${e(caste.description)}</p></article>`).join('')}</div></section>${renderGovernment(context)}${renderInstitutions(context)}${renderMilitary(context)}</details>${renderOpenQuestions(context)}
  <footer><span>Calidaria · Kaiserreich Argentum · Vorläufiger Entwurf</span><nav aria-label="Weitere Aktionen"><button data-action="print">Drucken</button><a href="../Leukonia/">Leukonia ↗</a></nav></footer></main>
  <dialog id="art-dialog" class="proposal-dialog art-dialog house-dialog calidaria-art-dialog" aria-labelledby="art-title"><div class="dialog-top"><span>Calidaria · Wappen und Prototypen</span><button data-action="close-art" aria-label="Bildfenster schließen">✕</button></div><div class="art-dialog-content" data-role="art-details"></div></dialog><div class="notice" data-role="status" role="status" aria-live="polite" hidden></div>`;
}
