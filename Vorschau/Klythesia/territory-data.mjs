import {MAP} from './map-data.mjs';
export const SETTLEMENTS=Object.freeze(MAP.settlements.map(city=>Object.freeze({
  ...city,capital:city.id==='kallisteia',
  kindLabel:city.id==='kallisteia'?'Hauptstadt · Herrscherfamilie':'Stadtsitz eines Frauenclans',
  regionId:city.id==='kallisteia'?'royal-domain':`seat-${city.id}`,
  description:city.observation,
  capitalStatus:undefined,
  pin:city.point
})));
export const REGIONS=Object.freeze(SETTLEMENTS.map(city=>Object.freeze({
  id:city.regionId,name:city.capital?'Hauptstadtdomäne':`Stadtherrschaft ${city.name}`,
  cityIds:[city.id],capitalId:city.id,kindLabel:city.kindLabel,description:city.description,
  boundaryStatus:'Sitzraum ohne neu erfundene Grenzlinie'
})));
export function createMapProposal({houses,placements}){
  return {...MAP,settlements:SETTLEMENTS,clans:houses.map(house=>({...house,
    crest:house.crest.startsWith('assets/')?house.crest.slice(7):'../'+house.crest,
    seat:placements[house.id],liege:null
  }))};
}
