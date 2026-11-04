import { escapeHtml as e } from '../shared/country-workbench/render.mjs';
import { renderHistoricalEmblems,renderHouseGallery,renderClassPrototypes,renderArtButton } from './art-view.mjs';
import { renderPlacementArea } from './map-view.mjs';
import { renderEstates } from './estate-view.mjs';

const paragraphs = entries => entries.map(item => `<article><h3>${e(item.title)}</h3><p>${e(item.text)}</p></article>`).join('');

function renderRegions(regions,houses,settlements) {
  return `<section class="section" id="gebiete"><p class="eyebrow">Herzogliche Domäne und neun Baronien</p><h2>Zwischen Gebirge und Meer.</h2><p class="section-intro">Die Grenzen folgen der Regionenkarte. Das Hauswappen bezeichnet den Ausgangsvorschlag des jeweiligen Gebiets; der Sitzentwurf darunter bleibt frei veränderbar.</p><div class="region-grid">${regions.map(region => {
    const house = houses.find(item => item.id === region.houseId);
    const city = settlements.find(item => item.id === region.capitalId);
    return `<article class="region-card">${house ? renderArtButton({ ...house,image:house.crest },{ kind:'house' }) : ''}<p class="eyebrow">${e(region.kindLabel)}</p><h3>${e(region.name)}</h3><p>${e(region.description)}</p>${city ? `<p class="region-city">Hauptort: ${e(city.name)}</p>` : ''}${house ? `<p class="region-house">Hausvorschlag: ${e(house.name)}</p>` : ''}</article>`;
  }).join('')}</div></section>`;
}

export function renderSolestiaPage({ context,houses,warriors,prototypes,artworks,estates = [],estateContext,regions,settlements,variants }) {
  const realm = artworks.find(art => art.kind === 'realm' && art.ready);
  return `<a class="skip-link" href="#geschichte">Zum Inhalt</a><header class="toolbar"><a class="wordmark" href="#anfang">ALERIA <span>Werkstatt</span></a><span class="draft-label">Solestia · Vorbereitung</span><nav aria-label="Seitenbereiche"><a href="#geschichte">Herkunft</a>${estates.length ? '<a href="#staende">Stände</a>' : ''}<a href="#gebiete">Gebiete</a><a href="#karte">Karte</a><a href="#haeuser">Häuser</a><a href="#krieger">Krieger</a></nav></header><main>
  <section class="hero${realm ? ' hero-with-art' : ''}" id="anfang"><div><p class="eyebrow">Die Erben Grianeachs</p><h1>${e(context.title)}</h1><p class="hero-line">${e(context.subtitle)}</p><p class="lead">${e(context.introduction)}</p><dl class="hero-stats"><div><dt>Häuser</dt><dd>${houses.length}</dd></div><div><dt>Städte</dt><dd>${settlements.length}</dd></div><div><dt>Baronien</dt><dd>${regions.filter(region => !region.ducalDomain).length}</dd></div></dl></div>${realm ? `<figure class="realm-crest">${renderArtButton(realm)}<figcaption>Das gelieferte Landeswappen Solestias</figcaption></figure>` : ''}</section>
  <aside class="draft-note"><strong>Vorbereitung und Sitzvorschlag.</strong> ${e(context.scope)}</aside>
  <section class="section" id="geschichte"><p class="eyebrow">Tarranath → Grianeach → Solestia</p><h2>Ein alter Ursprung.<br>Ein eigener Weg.</h2><div class="history-grid">${paragraphs(context.history)}</div><div class="culture-grid">${paragraphs(context.culture)}</div></section>
  ${renderEstates(estates,estateContext)}${renderHistoricalEmblems(artworks)}${renderRegions(regions,houses,settlements)}${renderPlacementArea({ variants,settlements })}${renderHouseGallery(houses,warriors)}${renderClassPrototypes(prototypes)}
  <footer><span>Herzogtum Solestia · Vorläufiger Entwurf</span><nav aria-label="Weitere Aktionen"><button data-action="print">Drucken</button><a href="../Weisenfluh/">Weisenfluh ↗</a><a href="../Leukonia/">Leukonia ↗</a><a href="../Sylvarant/">Sylvarant ↗</a></nav></footer></main>
  <dialog id="art-dialog" class="proposal-dialog art-dialog house-dialog solestia-art-dialog" aria-labelledby="art-title"><div class="dialog-top"><span>Solestia · Wappen, Krieger und Stände</span><button data-action="close-art" aria-label="Bildfenster schließen">✕</button></div><div class="art-dialog-content" data-role="art-details"></div></dialog><div class="notice" data-role="status" role="status" aria-live="polite" hidden></div>`;
}
