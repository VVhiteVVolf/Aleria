import { WAR_EVENTS,FACTIONS } from './praetendenten-data.mjs';
import { WAR_EVENT_DOSSIERS } from './war-event-dossiers.mjs';
import { warSource,sourceFact,sourceHeadingLabel,readableSourceBlocks } from './war-sources.mjs';
import { renderSourceBlocks,renderSourceReference } from './war-source-render.mjs';
import { renderWarShell } from './war-shell.mjs';
import { warEventHref } from './war-links.mjs';
import { escapeEventText as e } from '../catalog/events-model.mjs';

function renderHero(event,dossier,isOutline){
  return `<header class="war-dossier-hero war-event-hero"><figure><img src="../../../assets/praetendenten/${e(event.image)}" width="1024" height="1536" alt="${e(dossier.imageAlt)}"><figcaption>${e(dossier.imageCaption)}<small>${e(dossier.imageNote)}</small></figcaption></figure><div><a class="war-back" href="../index.html#zeittafel">← Zur Zeittafel des Krieges</a><p class="war-kicker">${e(dossier.kicker)}</p><h1>${e(dossier.title[0])} <br><em>${e(dossier.title[1])}</em></h1><p class="war-dossier-lead">${e(dossier.lead)}</p><a class="war-text-link" href="#ueberlieferung">${isOutline?'Die überlieferten Eckdaten lesen':'Den vollständigen Bericht lesen'} ↓</a></div></header>`;
}

function renderRelatedDossiers(related){
  return `<nav class="war-event-relations" aria-label="Verknüpfte Ereignisse und Fraktionen"><span>Im Zusammenhang</span>${related.map(reference=>{
    const faction=reference.kind==='faction'?FACTIONS.find(entry=>entry.id===reference.id):null;
    const event=reference.kind==='event'?WAR_EVENTS.find(entry=>entry.id===reference.id):null;
    const href=faction?`../${faction.file}`:event?warEventHref(event,1):null;
    if(!href)throw new Error(`Related war dossier is not ready: ${reference.id}`);
    return `<a${faction?` class="war-color-${faction.color}"`:''} href="${e(href)}">${e(faction?.title||event.title)} <small>${faction?e(faction.leader):'Ereignisdossier'} ↗</small></a>`;
  }).join('')}</nav>`;
}

function renderEventInfo(event,dossier,source,isOutline){
  const chapters=readableSourceBlocks(source).filter(block=>block.type==='heading');
  const facts=dossier.facts.map(fact=>[fact.label,fact.source?sourceFact(source,fact.source):fact.text]);
  if(!dossier.facts.some(fact=>/Datum|Datierung|Zeitraum/.test(fact.label)))facts.unshift(['Datierung',event.date]);
  return `<aside class="war-event-info" aria-labelledby="ereignis-steckbrief"><div class="war-event-info-inner"><header><span class="war-kicker">Auf einen Blick</span><h2 id="ereignis-steckbrief">Das Ereignis</h2><p>${isOutline?'Eckdaten überliefert':'Mit ausführlichem Bericht'}</p></header>
  <dl class="war-event-facts">${facts.map(([label,value])=>`<div><dt>${e(label)}</dt><dd>${e(value)}</dd></div>`).join('')}</dl>
  <details class="war-event-original-facts"><summary>Teilnehmer & vollständige Angaben</summary><div>${renderSourceBlocks(source,{blocks:'tables'})}</div></details>
  <nav class="war-event-chapters" aria-label="Abschnitte der Ereignisüberlieferung"><span>${isOutline?'In der Vorlage':'In diesem Bericht'}</span>${chapters.map(chapter=>`<a href="#${source.id}-block-${chapter.index}">${e(sourceHeadingLabel(chapter.text))}</a>`).join('')}</nav></div></aside>`;
}

function renderEventReading(source,isOutline){
  return `<article class="war-source-prose war-event-prose" id="ueberlieferung"><header><span class="war-kicker">${isOutline?'Die überlieferten Eckdaten':'Die vollständige Ereignisüberlieferung'}</span>${renderSourceReference(source,'../sources')}</header>${renderSourceBlocks(source,{markEmptySections:isOutline,blocks:'text'})}</article>`;
}

export function renderWarEventPage(id){
  const event=WAR_EVENTS.find(entry=>entry.id===id),dossier=WAR_EVENT_DOSSIERS[id];
  if(!event?.file||!event.image||!dossier)throw new Error(`No completed renderer registered for war event: ${id}`);
  const source=warSource(event.source),isOutline=event.content==='Eckdaten';
  const content=`${renderHero(event,dossier,isOutline)}
  <div class="war-event-layout">${renderEventInfo(event,dossier,source,isOutline)}<div class="war-event-reading">
  <section class="war-event-context"><span class="war-kicker">Zur Einordnung</span><h2>${e(dossier.caveatTitle)}</h2><p>${e(dossier.caveat)}</p><p>${e(event.note)}</p></section>
  ${renderEventReading(source,isOutline)}
  ${renderRelatedDossiers(dossier.related)}</div></div>`;
  return renderWarShell({title:event.title,description:dossier.description,content,depth:1,kind:'event',color:dossier.color||''});
}

// Retain the entry point used by the first illustrated dossier.
export function renderRogerAstridPage(){return renderWarEventPage('roger-astrid');}
