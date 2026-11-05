import {MAP_VARIANT,SETTLEMENTS,REGIONS} from './map-data.mjs';
export {SETTLEMENTS,REGIONS};
export const MAP_CONTEXT=Object.freeze({
 namedOnOriginal:0,seatCount:44,capitalStatus:'Aus der größten Burg abgeleiteter Hauptstadtvorschlag',
 note:'Alle Stadtnamen und Ausgangssitze sind Vorschläge. Die markierte äußere Landeslinie bleibt Teil des unveränderten Kartenbildes; innere Verwaltungsgrenzen werden nicht ergänzt.'
});
export function createMapProposal({houses,placements}){
 return {...MAP_VARIANT,settlements:SETTLEMENTS,clans:houses.filter(house=>house.ready).map(house=>({...house,
  crest:house.crest.slice(7),seat:placements[house.id]}))};
}
