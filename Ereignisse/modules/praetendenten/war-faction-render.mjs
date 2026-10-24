import { FACTIONS,WAR_EVENTS } from './praetendenten-data.mjs';
import { warSource } from './war-sources.mjs';
import { renderSourceBlocks,renderSourceReference } from './war-source-render.mjs';
import { renderWarShell } from './war-shell.mjs';
import { warEventHref } from './war-links.mjs';
import { escapeEventText as e } from '../catalog/events-model.mjs';

export function renderFactionPage(id){
  const faction=FACTIONS.find(entry=>entry.id===id);
  if(!faction)throw new Error(`Unknown war faction: ${id}`);
  const source=warSource(faction.source);
  const relatedEvents=WAR_EVENTS.filter(event=>event.sides.includes(id));
  const readyEvents=relatedEvents.filter(event=>warEventHref(event,1));
  const headings=source.blocks.filter(block=>block.type==='heading').map(block=>({text:block.text,index:source.blocks.indexOf(block)}));
  const content=`<header class="war-dossier-hero"><figure><img src="../../../assets/praetendenten/${faction.image}" width="1024" height="1536" alt="${e(faction.leader)} im Jahr 1627, ungefähr ${faction.age} Jahre alt."><figcaption>${e(faction.leader)} · 1627 · ca. ${faction.age} Jahre<small>Nach dem Stammbaumporträt, dem Kriegsbeginn entsprechend verjüngt.</small></figcaption></figure><div><a class="war-back" href="../index.html#fraktionen">← Die drei Kriegsparteien</a><p class="war-kicker">${e(faction.epithet)}</p><h1>${e(faction.title)}</h1><p class="war-dossier-lead">${e(faction.summary)}</p><dl class="war-dossier-facts">${[['Prätendent',faction.leader],['Hauptsitze',faction.seat],['Ziel',faction.aim],['Rückhalt',faction.support],['Streitmacht',faction.strength],['Ausgang',faction.ending]].map(([label,value])=>`<div><dt>${label}</dt><dd>${e(value)}</dd></div>`).join('')}</dl><a class="war-text-link" href="../index.html?fraktion=${faction.id}#zeittafel">Ereignisse dieser Kriegspartei ansehen →</a></div></header>
  <div class="war-dossier-body"><aside class="war-reading-index"><p>In diesem Dossier</p><nav aria-label="Abschnitte der Fraktionsüberlieferung">${headings.map(heading=>`<a href="#${source.id}-block-${heading.index}">${e(heading.text)}</a>`).join('')}</nav><hr><a href="../../../../Stammbäume/Stammbaum.html?family=haus-vaeren&mode=view">Zum Stammbaum der Vaeren ↗</a><small>Geburtsjahr ${faction.birth}. Da kein Geburtstag überliefert ist, bleibt das Bildalter eine Näherung.</small></aside><article class="war-source-prose"><header><span class="war-kicker">Die vollständige Fraktionsüberlieferung</span><p>Die Zusammenfassung oben verdichtet die vorliegende Fraktionsquelle. Der Text darunter bewahrt auch ihre Wertungen und offenen Stellen.</p>${renderSourceReference(source,'../sources')}</header>${renderSourceBlocks(source)}</article></div>
  <section class="war-faction-events"><h2>Die Partei im Geschehen</h2><nav aria-label="Vorhandene Ereignisdossiers dieser Kriegspartei">${readyEvents.map(event=>`<a href="${warEventHref(event,1)}"><span>${e(event.title)}</span><small>${e(event.date)} ↗</small></a>`).join('')}</nav><p>${relatedEvents.length} verknüpfte Ereignisse in der gemeinsamen Zeittafel; ${readyEvents.length} davon mit vorhandenem Dossier.</p><a href="../index.html?fraktion=${faction.id}#zeittafel">Alle Ereignisse dieser Kriegspartei ansehen →</a></section>
  <section class="war-faction-crosslinks"><h2>Die anderen Ansprüche</h2>${FACTIONS.filter(entry=>entry.id!==id).map(entry=>`<a class="war-color-${entry.color}" href="${entry.file.split('/').at(-1)}"><span>${e(entry.epithet)}</span><strong>${e(entry.title)}</strong><small>${e(entry.leader)} ↗</small></a>`).join('')}</section>`;
  return renderWarShell({title:faction.title,description:faction.summary,content,depth:1,kind:'faction',color:faction.color});
}
