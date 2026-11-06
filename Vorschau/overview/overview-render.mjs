import {escapeHtml as e} from '../shared/country-workbench/render.mjs';

function preparationCard(entry){
  return `<article class="preparation-card" data-preparation="${e(entry.id)}"><a class="preparation-card-link" href="${e(entry.href)}"><figure><img src="${e(entry.image)}" alt="Wappen ${e(entry.name)}" width="180" height="180" loading="lazy"></figure><div class="preparation-card-copy"><p class="eyebrow">${e(entry.kind)}</p><h3>${e(entry.name)}</h3><p>${e(entry.summary)}</p><span class="preparation-open">Vorbereitung öffnen <span aria-hidden="true">↗</span></span></div></a></article>`;
}

export function renderPreparationSections(groups,entries){
  return groups.map(group=>{
    const matching=entries.filter(entry=>entry.group===group.id);
    if(!matching.length)return '';
    return `<section class="section preparation-section" id="${e(group.id)}"><p class="eyebrow">${e(group.eyebrow)}</p><h2>${e(group.title)}</h2><p class="section-intro">${e(group.description)}</p><div class="preparation-grid">${matching.map(preparationCard).join('')}</div></section>`;
  }).join('');
}

export function renderOverview(groups,entries){
  return `<a class="overview-skip" href="#vorbereitungen">Zu den Vorbereitungen</a><header class="toolbar"><a class="wordmark" href="#anfang">ALERIA <span>Werkstatt</span></a><span class="draft-label">Länder und Provinzen</span><nav aria-label="Übersicht"><a href="#realms">Länder</a><a href="#argentum">Argentum</a><a href="../Kontinente/index.html">Kontinente ↗</a></nav></header><main><section class="overview-hero" id="anfang"><p class="eyebrow">Geschichte · Gesellschaft · Häuser · Karten</p><h1>Die offenen<br>Länderwerkstätten.</h1><p class="overview-lead">Alle Vorbereitungen, die noch nicht in reguläre Landes- und Herrschaftsseiten übernommen wurden, an einem Ort.</p><p class="overview-count"><strong>${entries.length}</strong> Werkstätten <span>·</span> Länder, Stadtrepubliken und Provinzen</p></section><aside class="draft-note"><strong>Entwürfe zum Weiterdenken.</strong> Neue Namen, Wappen und Sitzzuordnungen bleiben innerhalb ihrer jeweiligen Vorbereitung bearbeitbar. Bereits übernommene Länder findest du unter <a href="../Kontinente/index.html">Kontinente</a>.</aside><section class="overview-search" id="vorbereitungen" aria-label="Vorbereitungen suchen"><label for="preparation-search">Eine Werkstatt finden</label><div class="overview-search-row"><input id="preparation-search" type="search" autocomplete="off" placeholder="Land, Provinz oder Thema …" data-role="search"><button type="button" data-action="clear-search" disabled>Leeren</button></div><p class="overview-result" data-role="result-count" role="status" aria-live="polite">${entries.length} Vorbereitungen</p></section><div data-role="preparation-sections">${renderPreparationSections(groups,entries)}</div><p class="overview-empty" data-role="empty" hidden>Keine Vorbereitung passt zu dieser Suche.</p><footer><span>Aleria · Vorbereitungen und Besprechungsentwürfe</span><a href="../AleriaAlmanach/AleriaAlmanach.html">Zum Almanach ↗</a></footer></main>`;
}
