import { escapeHtml as e } from '../shared/country-workbench/render.mjs';
import { renderRealmContext, renderGovernment, renderInstitutions, renderMilitary, renderOpenQuestions } from './realm-context-view.mjs?v=20261103-leukonia-4';
import { renderArtButton, renderCastes, renderProvinceAndBanners, renderHouseGallery, renderClassPrototypes, artworkImage } from './art-view.mjs?v=20261103-leukonia-4';
import { renderPlacementArea } from './map-view.mjs?v=20261103-leukonia-4';

export function renderLeukoniaPage({ context, castes, artworks, houses, warriors, prototypes, archonates, settlements, variants }) {
  const provinceArt = artworks.find(item => item.kind === 'province' && artworkImage(item));
  const stats = [
    { label: 'Archonate', value: archonates.length },
    { label: 'Orte auf der Karte', value: settlements.length },
    { label: 'Hauswappen', value: houses.length },
  ].filter(item => item.value > 0);
  return `<a class="skip-link" href="#geschichte">Zum Inhalt</a><header class="toolbar"><a class="wordmark" href="#anfang">ALERIA <span>Werkstatt</span></a><span class="draft-label">Leukonia · Vorbereitung</span><nav aria-label="Seitenbereiche"><a href="#geschichte">Kontext</a><a href="#staende">Stände</a><a href="#regierung">Reichsordnung</a><a href="#karte">Karte</a><a href="#haeuser">Wappen</a><a href="#krieger">Krieger</a></nav></header><main>
  <section class="hero${provinceArt ? '' : ' hero-without-art'}" id="anfang"><div><p class="eyebrow">${e(context.empireTitle || 'Kaiserreich Argentum')} · Vorbereitungs- und Besprechungsseite</p><h1>${e(context.title)}</h1><p class="hero-line">${e(context.subtitle)}</p><p class="lead">${e(context.introduction)}</p><dl class="hero-stats">${stats.map(item => `<div><dt>${e(item.label)}</dt><dd>${e(item.value)}</dd></div>`).join('')}</dl></div>${provinceArt ? `<figure class="realm-crest">${renderArtButton(provinceArt)}<figcaption>Provinzwappen · Entwurf</figcaption></figure>` : ''}</section>
  <aside class="draft-note"><strong>Lokale Vorbereitung.</strong> ${e(context.scope)} Die Hausnamen sind den Wappen als Vorschläge zugeordnet; Sitze und neue Bildentwürfe bleiben bearbeitbar.</aside>
  ${renderRealmContext(context)}${renderCastes(castes)}${renderGovernment(context)}${renderInstitutions(context)}
  ${renderProvinceAndBanners(artworks, archonates, settlements)}
  ${renderPlacementArea({ variants, settlements })}${renderHouseGallery(houses, warriors)}${renderClassPrototypes(prototypes)}${renderMilitary(context)}${renderOpenQuestions(context)}
  <footer><span>Leukonia · Kaiserreich Argentum · Vorläufiger Entwurf</span><nav aria-label="Weitere Aktionen"><button data-action="print">Drucken</button><a href="../Venalys/">Venalys ↗</a></nav></footer></main>
  <dialog id="art-dialog" class="proposal-dialog art-dialog house-dialog leukonia-art-dialog" aria-labelledby="art-title"><div class="dialog-top"><span>Leukonia · Wappen, Figuren und Stände</span><button data-action="close-art" aria-label="Bildfenster schließen">✕</button></div><div class="art-dialog-content" data-role="art-details"></div></dialog><div class="notice" data-role="status" role="status" aria-live="polite" hidden></div>`;
}
