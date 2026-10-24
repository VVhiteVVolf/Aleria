import { WAR_MAP,WAR_MAP_EVENT_PLACES } from './war-map-data.mjs';
import { warMapEvents,warMapSelection,warMapSiteEvents,clampWarMapYear } from './war-map-model.mjs';

export function createWarMap(root){
  const cleanup=new AbortController();
  const range=root.querySelector('[data-war-map-year]'),label=root.querySelector('[data-war-map-year-label]');
  const parties=[...root.querySelectorAll('[data-war-map-party]')],picks=[...root.querySelectorAll('[data-war-map-select]')];
  const markers=[...root.querySelectorAll('[data-war-map-site]')],details=[...root.querySelectorAll('[data-war-map-detail]')];
  const count=root.querySelector('[data-war-map-count]'),empty=root.querySelector('[data-war-map-empty]');
  const all=root.querySelector('[data-war-map-action="all"]');
  let year=null,selected=null;
  const visibleEvents=()=>warMapEvents({year,parties:parties.filter(input=>input.checked).map(input=>input.dataset.warMapParty)});
  function render(){
    const events=visibleEvents(),ids=new Set(events.map(event=>event.id));
    selected=warMapSelection(events,selected);
    label.value=year===null?'1627–1647':String(year);
    range.setAttribute('aria-valuetext',year===null?'Alle Kriegsjahre':String(year));
    all.setAttribute('aria-pressed',String(year===null));
    root.querySelector('[data-war-map-action="previous"]').disabled=year===WAR_MAP.firstYear;
    root.querySelector('[data-war-map-action="next"]').disabled=year===WAR_MAP.lastYear;
    picks.forEach(button=>{button.hidden=!ids.has(button.dataset.warMapSelect);button.setAttribute('aria-pressed',String(button.dataset.warMapSelect===selected));});
    markers.forEach(button=>{
      const siteEvents=warMapSiteEvents(events,button.dataset.warMapSite);
      button.hidden=!siteEvents.length;
      button.setAttribute('aria-pressed',String(Boolean(selected)&&WAR_MAP_EVENT_PLACES[selected]===button.dataset.warMapSite));
      button.querySelector('[data-war-map-pin-count]').textContent=siteEvents.length;
    });
    details.forEach(detail=>detail.hidden=detail.dataset.warMapDetail!==selected);
    empty.hidden=Boolean(selected);
    const unplaced=events.filter(event=>!WAR_MAP_EVENT_PLACES[event.id]).length;
    count.textContent=`${year===null?'Alle Jahre':year} · ${events.length} von ${picks.length} Ereignissen${unplaced?` · ${unplaced} ohne sichere Ortszuordnung`:''}`;
  }
  function setYear(value){year=clampWarMapYear(value);range.value=year??WAR_MAP.firstYear;render();}
  root.addEventListener('input',event=>{if(event.target===range)setYear(range.value);},{signal:cleanup.signal});
  root.addEventListener('change',event=>{if(parties.includes(event.target))render();},{signal:cleanup.signal});
  root.addEventListener('click',event=>{
    const target=event.target.closest('button');if(!target||!root.contains(target))return;
    if(target.dataset.warMapSelect||target.dataset.warMapSite){
      selected=target.dataset.warMapSelect||warMapSiteEvents(visibleEvents(),target.dataset.warMapSite)[0]?.id||null;
      render();
      if(matchMedia('(max-width:900px)').matches)root.querySelector('.war-map-details').scrollIntoView({block:'start'});
    }
    else if(target.dataset.warMapAction==='all'){year=null;render();}
    else if(target.dataset.warMapAction)setYear(year===null?WAR_MAP.firstYear:year+(target.dataset.warMapAction==='next'?1:-1));
  },{signal:cleanup.signal});
  root.querySelector('[data-war-map-controls]').hidden=false;
  root.querySelector('[data-war-map-markers]').hidden=false;
  root.querySelector('[data-war-map-picks]').hidden=false;
  render();
  return Object.freeze({destroy(){cleanup.abort();}});
}
