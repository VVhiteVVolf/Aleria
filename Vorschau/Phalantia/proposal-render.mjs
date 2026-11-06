import { escapeHtml as e } from '../shared/country-workbench/render.mjs';
import { renderEstates } from '../shared/country-workbench/estate-view.mjs';
import { renderArtButton,renderHouseGallery,renderClassPrototypes } from './art-view.mjs';
import { renderPlacementArea } from './map-view.mjs';

const articles = entries => entries.map(item => `<article><h3>${e(item.title)}</h3><p>${e(item.text)}</p></article>`).join('');

function renderGovernment(context) {
  return `<section class="section" id="regierung"><p class="eyebrow">Königshäuser und Periöken</p><h2>Die gemeinsame Staatsordnung.</h2><div class="government-grid">${articles(context.government)}</div><div class="culture-grid">${articles(context.culture)}</div><p class="subtle"><a href="../../Religionen/religionen/phalantischer-bund/index.html">Der dokumentierte Krathos-Bund ↗</a></p></section>`;
}

function renderMarriage(marriage) {
  return `<section class="section marriage-proposal" id="eheordnung"><p class="eyebrow">${e(marriage.status)}</p><h2>${e(marriage.title)}</h2><p class="section-intro">${e(marriage.introduction)}</p><div class="government-grid">${articles(marriage.rules)}</div></section>`;
}

function renderRegions(regions,houses,settlements,shields) {
  return `<section class="section" id="gebiete"><p class="eyebrow">Sitzräume ohne erfundene Grenzlinien</p><h2>Eine Hauptstadt und sieben Periökenstädte.</h2><p class="section-intro">Die Karte verzeichnet die großen Städte. Die übrigen tausenden Siedlungen werden nicht vollständig dargestellt. Die Ortsräume beschreiben die Sitze; auf der gelieferten Karte sind keine verbindlichen Herrschaftsgrenzen eingezeichnet.</p><div class="region-grid">${regions.map(region => {
    const city = settlements.find(item => item.id === region.capitalId);
    const occupants = houses.filter(house => house.sourceSeat === city.id);
    const shield = shields.find(item => item.regionId === region.id);
    return `<article class="region-card">${shield ? renderArtButton(shield,{kind:'region',label:`Regionsschild ${city.name}`}) : ''}<p class="eyebrow">${e(region.kindLabel)}</p><h3>${e(city.name)}</h3><p>${e(region.description)}</p><p class="region-house">Ausgangsvorschlag: ${e(occupants.map(house => house.name).join(' · '))}</p></article>`;
  }).join('')}</div></section>`;
}

export function renderPhalantiaPage({context,houses,prototypes,artworks,estates,estateContext,regions,settlements,warriors,regionShields}) {
  const realm = artworks.find(art => art.kind === 'realm');
  return `<a class="skip-link" href="#geschichte">Zum Inhalt</a><header class="toolbar"><a class="wordmark" href="#anfang">ALERIA <span>Werkstatt</span></a><span class="draft-label">Phalantia · Vorbereitung</span><nav aria-label="Seitenbereiche"><a href="#geschichte">Kontext</a><a href="#regierung">Regierung</a><a href="#staende">Stände</a><a href="#gebiete">Regionen</a><a href="#karte">Karte</a><a href="#haeuser">Häuser</a><a href="#krieger">Krieger</a></nav></header><main>
  <section class="hero" id="anfang"><div><p class="eyebrow">Tirnara · Zweikönigtum und Kriegerkultur</p><h1>${e(context.title)}</h1><p class="hero-line">${e(context.subtitle)}</p><p class="lead">${e(context.introduction)}</p><dl class="hero-stats"><div><dt>Königshäuser</dt><dd>2</dd></div><div><dt>Periökenhäuser</dt><dd>7</dd></div><div><dt>Städte</dt><dd>${settlements.length}</dd></div></dl></div><figure class="realm-crest">${renderArtButton(realm)}<figcaption>Das gelieferte Landeswappen Phalantias</figcaption></figure></section>
  <aside class="draft-note"><strong>Vorbereitung und Vorschläge.</strong> ${e(context.scope)}</aside>
  <section class="section" id="geschichte"><p class="eyebrow">Polis, Land und gemeinsamer Glaube</p><h2>Phalantia im Zusammenhang.</h2><div class="history-grid">${articles(context.history)}</div></section>
  ${renderGovernment(context)}${renderMarriage(context.marriage)}${renderEstates(estates,estateContext)}${renderRegions(regions,houses,settlements,regionShields)}${renderPlacementArea()}${renderHouseGallery(houses,warriors)}${renderClassPrototypes(prototypes)}
  <footer><span>Phalantia · Vorläufige Haus-, Wappen- und Sitzvorschläge</span><nav aria-label="Weitere Aktionen"><button data-action="print">Drucken</button><a href="../Leukonia/">Leukonia ↗</a><a href="../Sylvarant/">Vardentia ↗</a><a href="../Solestia/">Solestia ↗</a></nav></footer></main>
  <dialog id="art-dialog" class="proposal-dialog art-dialog phalantia-art-dialog" aria-labelledby="art-title"><div class="dialog-top"><span>Phalantia · Wappen, Krieger und Stände</span><button data-action="close-art" aria-label="Bildfenster schließen">✕</button></div><div class="art-dialog-content" data-role="art-details"></div></dialog><div class="notice" data-role="status" role="status" aria-live="polite" hidden></div>`;
}
