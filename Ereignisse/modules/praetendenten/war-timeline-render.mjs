import { WAR_ACTS,WAR_EVENTS,FACTIONS } from './praetendenten-data.mjs';
import { warSource,sourceFact } from './war-sources.mjs';
import { escapeEventText as e } from '../catalog/events-model.mjs';
import { warEventHref } from './war-links.mjs';

function eventRow(event){
  const href=warEventHref(event),source=warSource(event.source),result=sourceFact(source,'Resultat');
  return `<article class="war-timeline-entry" id="ereignis-${event.id}" data-war-event data-parties="${event.sides.join(' ')}" data-ready="${Boolean(href)}" data-search="${e([event.title,event.date,result,...event.sides].join(' '))}">
    <div class="war-timeline-date"><span>${e(event.date)}</span><small>${e(event.content==='Eckdaten'?'Eckdaten überliefert':'Textüberlieferung vorhanden')}</small></div>
    <div><h4>${href?`<a href="${href}">${e(event.title)} <span aria-hidden="true">↗</span></a>`:e(event.title)}</h4><p>${e(result)}</p>${event.note?`<details class="war-timeline-note"><summary>Hinweis zur Überlieferung</summary><p>${e(event.note)}</p></details>`:''}<div class="war-timeline-links">${href?`<a href="${href}">${event.existingHref?'Animiertes Schlachtdossier öffnen':'Ereignisdossier öffnen'} →</a>`:'<span>Dossier folgt im nächsten Ausbau</span>'}<a href="sources/${source.file.replace('.html','.txt')}">Quelle ${source.id.slice(-2)} lesen ↗</a></div></div>
  </article>`;
}

export function renderWarTimeline(){
  return `<section class="war-timeline" id="zeittafel" data-war-timeline><header class="war-section-head"><span>II · Ereignisse & Schlachten</span><h2>Zwanzig Jahre.<br>Kein gerader Weg.</h2><p>Die Überlieferung wächst nicht überall gleich dicht. Wo nur Eckdaten vorliegen, bleibt der Verlauf offen. Widersprüchliche Zeitangaben stehen ausdrücklich dabei.</p></header>
  <div class="war-timeline-tools"><div class="war-filters" role="group" aria-label="Ereignisse nach Kriegspartei filtern"><button type="button" data-war-filter="all" aria-pressed="true">Alle Ereignisse</button>${FACTIONS.map(faction=>`<button type="button" data-war-filter="${faction.id}" aria-pressed="false">${e(faction.title)}</button>`).join('')}<button type="button" data-war-filter="ready" aria-pressed="false">Vorhandene Dossiers</button></div><label>In der Zeittafel suchen<input type="search" data-war-search placeholder="Ort oder Ereignis…"></label><p role="status" data-war-result-count>17 Ereignisse</p></div>
  ${WAR_ACTS.map((act,index)=>`<section class="war-act" data-war-act><header><span>${String(index+1).padStart(2,'0')}</span><p>${e(act.years)}</p><h3>${e(act.title)}</h3></header><div>${WAR_EVENTS.filter(event=>event.act===act.id).map(eventRow).join('')}</div></section>`).join('')}
  <p class="war-empty" data-war-empty hidden>Zu dieser Auswahl liegt kein Ereignis vor. Andere Begriffe oder eine andere Partei auswählen.</p>
  <div class="war-ending"><span>1647 · Das Ende der Ansprüche</span><h3>Die Krone fällt Galmar zu.</h3><p>Sinding stirbt an Fieber; die Roten kapitulieren am 24.02.1647. Arn stirbt am 30.03.1647 vor seiner Krönung. Galmar wird gegen Ende des Krieges Hochkönig.</p><a href="#lesebuch">Die Überlieferung zum Kriegsende aufschlagen ↓</a></div></section>`;
}
