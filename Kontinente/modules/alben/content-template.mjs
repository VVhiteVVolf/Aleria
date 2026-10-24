import { escapeHtml as esc, paragraphs } from '../kingdom-court/page-template.mjs';
import { albenHome, principalityHref } from './principality-links.mjs';

export function principalityCards(principalities, registry) {
  return `<div class="alben-principalities">${principalities.map(p => `<article class="alben-principality-card${p.historical ? ' is-historical' : ''}">
    ${p.imageSrc ? `<a data-alben-principality="${p.id}" href="${esc(principalityHref(p,registry))}" aria-label="Zum Eintrag ${esc(p.name)}"><img src="${esc(p.imageSrc)}" width="88" height="88" alt="Wappen ${esc(p.name)}" loading="lazy"></a>` : '<span class="alben-open-crest">Wappen offen</span>'}
    <div><p class="alben-label">${p.historical ? 'Historisches Fürstentum' : p.type}</p><h3><a data-alben-principality="${p.id}" href="${esc(principalityHref(p,registry))}">${esc(p.name)}</a></h3><p>${esc(p.seat ? 'Sitz: '+p.seat : 'Angaben im Aufbau')}</p><a class="alben-entry-link" data-alben-principality="${p.id}" href="${esc(principalityHref(p,registry))}">Zum Eintrag →</a>${p.mapId ? ` · <a class="alben-entry-link" href="/Karten/karte.html?map=${encodeURIComponent(p.mapId)}">Karte →</a>` : ''}</div>
  </article>`).join('')}</div>`;
}

export function cultureContents(culture) {
  const headings={language:'Ogham',clan:'Der Clan',sept:'Die Sept'};
  return Object.entries(headings).map(([key,title])=>`<details class="alben-topic"><summary>${title}</summary>${paragraphs(culture[key] || [])}</details>`).join('')+
    culture.prefixGroups.map(group=>`<h3>${esc(group.title)}</h3>${group.entries.map(entry=>`<details class="alben-topic"><summary>${esc(entry.title)}</summary>${paragraphs(entry.paragraphs)}</details>`).join('')}`).join('');
}

export function preparedPrincipality(p, registry = []) {
  const page = registry.find(entry=>entry.id===p.pageId && entry.page);
  if (page) return `<section class="alben-entry" data-principality="${p.id}" id="${p.id}"><p class="alben-label">${p.historical ? 'Historisches Fürstentum' : p.type}</p><h2>${esc(p.name)}</h2><p>${esc(p.summary)}</p><p><a href="${esc(principalityHref(p,registry))}">Fürstentumsseite von ${esc(p.name)} öffnen →</a></p><p><a href="${esc(albenHome)}#fuerstentuemer">← Alle Fürstentümer der Alben</a></p></section>`;
  return `<section class="alben-entry" data-principality="${p.id}" id="${p.id}">
    <p class="alben-label">${p.historical ? 'Untergegangenes Fürstentum' : 'Fürstlicher Eintrag · im Aufbau'}</p><h2>${esc(p.name)}</h2>
    ${p.imageSrc ? `<img class="alben-entry-crest" src="${esc(p.imageSrc)}" width="140" height="140" alt="Wappen ${esc(p.name)}">` : ''}
    <p>${esc(p.summary)}</p><dl class="court-facts">${p.seat?`<div><dt>Belegter Sitz</dt><dd>${esc(p.seat)}</dd></div>`:''}${p.familyId?`<div><dt>${p.historical?'Ehemaliger Fürstenclan':'Fürstenclan'}</dt><dd><a href="/Stammbäume/Stammbaum.html?family=${p.familyId}&amp;mode=view">${esc(p.familyName)}</a></dd></div>`:''}<div><dt>Ausarbeitung</dt><dd>Die ausführliche Fürstentumsseite folgt.</dd></div></dl>
    ${p.mapId ? `<p><a href="/Karten/karte.html?map=${encodeURIComponent(p.mapId)}">Karte und Regionen von ${esc(p.name)} öffnen →</a></p>` : ''}
    <p>Geschichte, Herrschaften, Orte und weitere Themen werden schrittweise ergänzt. Die einzelnen Fürstentümer bleiben auch über ihre Kontinentübersicht erreichbar.</p><p><a href="${esc(albenHome)}#fuerstentuemer">← Alle Fürstentümer der Alben</a></p>
  </section>`;
}
