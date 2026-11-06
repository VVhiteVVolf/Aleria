import {escapeHtml as e} from '../shared/country-workbench/render.mjs';
import {renderArtButton,textList} from '../shared/country-workbench/art-media.mjs';
import {renderEstates} from '../shared/country-workbench/estate-view.mjs';

export const searchText=value=>String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('de');
export function filterClans(houses,query=''){
  const terms=searchText(query).trim().split(/\s+/).filter(Boolean);
  return houses.filter(house=>terms.every(term=>searchText([house.name,house.motif,textList(house.palette||house.colors)].join(' ')).includes(term)));
}

function textArticles(entries,cssClass){
  return `<div class="${e(cssClass)}">${entries.map(entry=>`<article><h3>${e(entry.title)}</h3><p>${e(entry.text)}</p></article>`).join('')}</div>`;
}

export function renderClanCards(houses){
  if(!houses.length)return '<p class="empty-clans">Für diese Suche wurde kein Stamm gefunden.</p>';
  return houses.map(house=>`<article class="house-art-card" data-clan="${e(house.id)}"><p class="eyebrow">Nomadischer Stamm · Namensvorschlag</p>${renderArtButton(house,{kind:'house',label:`${house.name} · Stammeswappen`})}<h3>${e(house.name)}</h3><p>${e(house.motif)}</p><p class="art-palette">${e(textList(house.palette||house.colors))}</p><p class="house-note">${e(house.note||'Neuer albischer Nachname ohne Präfix; als Vorschlag zur gemeinsamen Ausarbeitung.')}</p></article>`).join('');
}

function renderPrototypes(prototypes){
  return `<section class="section" id="krieger"><p class="eyebrow">${prototypes.length} eigenständige Klassenentwürfe</p><h2>Krieger der wandernden Stämme</h2><p class="section-intro">Die Ausrüstung verbindet das albische Erbe mit dem Leben in der Wüste. Die Figuren sind gemeinsame Klassenprototypen, keine Personen oder eigenen Hauskrieger.</p><div class="prototype-grid">${prototypes.map(prototype=>`<article data-prototype="${e(prototype.id)}">${renderArtButton(prototype,{kind:'prototype',figure:true})}<h3>${e(prototype.name)}</h3><p>${e(prototype.description)}</p><p class="art-equipment">${e(textList(prototype.equipment))}</p></article>`).join('')}</div></section>`;
}

function renderSources(sources){
  if(!sources?.length)return '';
  return `<section class="section source-notes" id="quellen"><p class="eyebrow">Sprachliche Einordnung</p><h2>Begriffe und Quellen</h2><p>Die Titel sind gälisch begründet. Ihre Verwendung als Rangordnung der Adharath ist eine Ausgestaltung für Aleria; die neuen Stammesnamen sind freie Namenserfindungen.</p><ul>${sources.map(source=>`<li><a href="${e(source.url)}" target="_blank" rel="noopener">${e(source.title)}</a>${source.note?` · ${e(source.note)}`:''}</li>`).join('')}</ul></section>`;
}

export function renderPreparation({context,houses,prototypes,estates,realmArtwork}){
  return `<a class="skip-link" href="#inhalt">Zum Inhalt</a><header class="toolbar"><a class="wordmark" href="../">ALERIA <span>Werkstätten</span></a><span class="draft-label">Vorbereitung · Adharath</span><nav aria-label="Abschnitte"><a href="#geschichte">Herkunft</a><a href="#staende">Titel</a><a href="#staemme">Stämme</a><a href="#krieger">Krieger</a></nav></header><main id="inhalt"><section class="hero"><div><p class="eyebrow">Adharath → Fürstentum Dúinreach</p><h1>${e(context.name||'Adharath')}</h1><p class="hero-line">${e(context.subtitle)}</p><p class="lead">${e(context.lead)}</p><dl class="hero-stats"><div><dt>Heute</dt><dd>Nomadisches Volk</dd></div><div><dt>Große Stämme</dt><dd>${houses.length}</dd></div><div><dt>Das alte Fürstentum</dt><dd>Dúinreach · untergegangen</dd></div></dl></div><figure class="realm-crest">${renderArtButton(realmArtwork,{kind:'realm'})}<figcaption>Antikes Fürstentumswappen · zugleich Volkszeichen</figcaption></figure></section><aside class="draft-note"><strong>Werkstattstand.</strong> Geschichte und Lebensweise folgen den festgelegten Angaben. Stammesnamen, neue Wappen und Titel sind ausgearbeitete Vorschläge. Ohne eigene heutige Grenzen und ohne festen Fürstensitz: Die zwölf Stämme sind keine zwölf Provinzen.</aside><section class="section" id="geschichte"><p class="eyebrow">Von den Ebenen Shirazads in die Zerstreuung</p><h2>Das Erbe Dúinreachs</h2>${textArticles(context.history,'history-grid')}</section><section class="section" id="lebensweise"><p class="eyebrow">Albisches Erbe und Wüstenleben</p><h2>Ein Volk auf Wanderschaft</h2>${textArticles(context.culture,'culture-grid')}${context.language?`<div class="language-note"><h3>${e(context.language.title)}</h3><p>${e(context.language.text)}</p></div>`:''}</section>${renderEstates(estates,context.society)}<section class="section" id="staemme"><p class="eyebrow">Zwölf größere Nomadenstämme</p><h2>Clans ohne feste Grenzen</h2><p class="section-intro">Die Stammeszeichen werden unterwegs bewahrt und weitergegeben. Kleinere Sippen und ihre Zugehörigkeiten bleiben für eine spätere Ausarbeitung offen. Alle Namen stehen vorerst ohne die üblichen albischen Präfixe.</p><form class="clan-search" role="search"><label for="clan-filter">Stamm oder Wappenmotiv suchen</label><div><input id="clan-filter" type="search" data-role="clan-filter" autocomplete="off" placeholder="Name, Tier oder Farbe"><button type="button" data-action="clear-search">Zurücksetzen</button></div></form><p class="clan-count" aria-live="polite" data-role="clan-count">${houses.length} Stämme</p><div class="house-art-grid" data-role="clan-gallery">${renderClanCards(houses)}</div></section>${renderPrototypes(prototypes)}${renderSources(context.language?.sources||context.sources)}<footer><p>Adharath · Dúinreach · lokale Vorbereitungsseite</p><nav><a href="../">Alle offenen Werkstätten</a><a href="#inhalt">Nach oben ↑</a></nav></footer></main><dialog class="proposal-dialog art-dialog" data-role="art-dialog" aria-labelledby="art-title"><div class="dialog-top"><span>Adharath · Bild und Einordnung</span><button type="button" data-action="close-art" aria-label="Bildfenster schließen">×</button></div><div class="art-dialog-content" data-role="art-details"></div></dialog>`;
}
