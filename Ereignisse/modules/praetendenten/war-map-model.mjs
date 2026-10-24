import { WAR_EVENTS } from './praetendenten-data.mjs';
import { WAR_MAP,WAR_MAP_EVENT_PLACES,WAR_MAP_DATE_EXCEPTIONS } from './war-map-data.mjs';

export function warMapPeriod(event){
  const exception=WAR_MAP_DATE_EXCEPTIONS[event.id];
  if(exception)return exception;
  return {firstYear:event.year,lastYear:event.year};
}

export function warMapEvents({year=null,parties=['gruene','rote','blaue']}={}){
  const enabled=new Set(parties);
  return WAR_EVENTS.filter(event=>{
    const period=warMapPeriod(event);
    const inYear=year===null||(period.years?period.years.includes(year):year>=period.firstYear&&year<=period.lastYear);
    return inYear&&(!event.sides.length||event.sides.some(side=>enabled.has(side)));
  });
}

export function warMapSelection(events,preferredId){
  return events.find(event=>event.id===preferredId)?.id||events[0]?.id||null;
}

export function warMapSiteEvents(events,site){
  return events.filter(event=>WAR_MAP_EVENT_PLACES[event.id]===site);
}

export function clampWarMapYear(value){
  if(value===null||value===undefined||value==='')return null;
  const year=Number(value);
  return Number.isInteger(year)?Math.max(WAR_MAP.firstYear,Math.min(WAR_MAP.lastYear,year)):null;
}
