/** Read-only evidence presentation; ownership of source claims stays with their archives. */
import {escapeHtml as e} from '../shared/country-workbench/render.mjs';

const PERSPECTIVES={
  'user-canon':'Neue Nutzerfestlegung',
  'source-statement':'Quellenaussage',
  'klythesian-belief':'Klythesische Glaubensüberlieferung',
  'phalantian-external-view':'Phalantische Fremdsicht'
};
const FAITH_ROOT='Religionen/religionen/';
export function sourceLink(source){
  const path=source.path??'';
  if(path.startsWith('Vorschau/Klythesia/sources/lore-amendment'))return '#geschichte';
  if(path.startsWith(FAITH_ROOT))return '../../'+path.slice(0,path.lastIndexOf('/')+1);
  if(path.startsWith('Bestiarium/tiere/pferde/xanathos/'))return '../../Bestiarium/tiere/pferde/xanathos/';
  if(path.startsWith('Markt/Rossmarkt/'))return '../../Markt/Rossmarkt/Rossmarkt.html';
  if(path.startsWith('AleriaAlmanach/modules/language/')||path.startsWith('Fonts/Stoicheia')||path.includes('name-list'))return '../../AleriaAlmanach/AleriaAlmanach.html';
  return null;
}
const sourceTitle=source=>source.path?.startsWith(FAITH_ROOT+'zirkel')?'Zirkel des Ewigen Waldes':
  source.path?.startsWith('Vorschau/Klythesia/sources/lore-amendment')?'Neue Landesfestlegung':
  source.path?.startsWith(FAITH_ROOT+'phalantischer')?'Phalantischer Bund':
  source.path?.startsWith('Bestiarium/')?'Xanathos im Bestiarium':
  source.path?.startsWith('Markt/')?'Rossmarkt':'Stoicheia-Spracharchiv';
export function renderSource(source){
  if(!source)return '';
  const href=sourceLink(source);
  return `<span class="source-reference">${href?`<a href="${e(href)}" target="_blank" rel="noopener">${e(sourceTitle(source))} ↗</a>`:e(sourceTitle(source))}${source.section?` · ${e(source.section)}`:''}${source.pointer?` <code>${e(source.pointer)}</code>`:''}</span>`;
}
export function renderFact(fact){
  const sources=[fact.source,...(fact.additionalSources??fact.relatedSources??[])].filter(Boolean);
  return `<article class="evidence-card" id="fact-${e(fact.id)}" data-fact-id="${e(fact.id)}"><p class="evidence-label">${e(PERSPECTIVES[fact.perspective]??fact.kind??'Quellenaussage')}</p><h3>${e(fact.title)}</h3><p>${e(fact.text)}</p>${fact.scope?`<p class="scope-note">Geltungsbereich: ${e(fact.scope)}</p>`:''}${fact.limits?`<p class="limit-note">${e(fact.limits)}</p>`:''}<details class="source-detail"><summary>Fundstelle${sources.length>1?'n':''}</summary>${sources.map(renderSource).join('')}</details></article>`;
}
export function renderFactGroup(title,facts,{open=false,intro=''}={}){
  if(!facts.length)return '';
  return `<details class="evidence-group" ${open?'open':''}><summary><span>${e(title)}</span><small>${facts.length} Belege</small></summary>${intro?`<p class="group-intro">${e(intro)}</p>`:''}<div class="evidence-grid">${facts.map(renderFact).join('')}</div></details>`;
}
export function renderDeities(deities){
  const labels={ahnengott:'Ahnengott',goettin:'Göttinnen',patrongott:'Patrongott',feindbild:'Göttliche Feindbilder'};
  return Object.entries(labels).map(([group,label])=>`<div class="deity-group"><h3>${e(label)}</h3><div class="deity-grid">${deities.filter(deity=>deity.group===group).map(deity=>`<article data-deity-id="${e(deity.id)}"><h4>${e(deity.name)}</h4><p class="deity-epithet">${e(deity.epithet)}</p><p>${e(deity.text)}</p><p class="deity-domains">${deity.domains.map(e).join(' · ')}</p>${renderSource(deity.source)}</article>`).join('')}</div></div>`).join('');
}
export function renderRanks(ranks,roles){
  return `<p class="group-intro">Reihenfolge des vorhandenen Glaubenskatalogs. Dies sind religiöse Bezeichnungen; daraus wird kein weltliches Kastensystem abgeleitet.</p><ol class="rank-list">${ranks.map(rank=>`<li data-rank-id="${e(rank.id)}"><h3>${e(rank.title)}</h3><p>${e(rank.text)}</p>${renderSource(rank.source)}</li>`).join('')}</ol><div class="role-note">${roles.map(role=>`<h3>${e(role.title)} als Clanrolle</h3><p>${e(role.text)}</p>${renderSource(role.source)}`).join('')}</div>`;
}
const issueLabel=issue=>issue.type==='source-contradiction'?'Quellenwiderspruch':issue.type==='name-variant'?'Namensvariante':issue.type==='perspective-boundary'?'Perspektive':'Offene Einordnung';
export function renderIssue(issue){
  return `<article class="question-card" id="question-${e(issue.id)}" data-question-id="${e(issue.id)}"><p class="evidence-label">${e(issueLabel(issue))}</p><h3>${e(issue.title??issue.question)}</h3><p>${e(issue.text??issue.reason)}</p>${issue.handling?`<p class="handling">${e(issue.handling)}</p>`:''}${issue.sources?.length?`<details class="source-detail"><summary>Fundstellen</summary>${issue.sources.map(renderSource).join('')}</details>`:''}</article>`;
}
export function renderSourceRegister(sources){
  const unique=[...new Map(sources.map(source=>[source.path,source])).values()];
  return `<ul class="source-register">${unique.map(source=>`<li>${renderSource(source)}<code>${e(source.path)}</code>${source.note?`<p>${e(source.note)}</p>`:''}</li>`).join('')}<li><a href="assets/originals/klythesia-map.png" target="_blank" rel="noopener">Gelieferte Karte und sechs Zeichen ↗</a><p>Sieben unveränderte PNG-Originale aus dem bereitgestellten Klythesia-Ordner. Ortsnamen, Landschaft und Motive wurden am Bild geprüft.</p></li></ul>`;
}
