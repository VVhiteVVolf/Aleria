import {houses} from './house-data.mjs?v=20261026-1';
import {settlements} from './territory-data.mjs?v=20261026-1';
import {createPlacementState as createDraft} from '../shared/placement-state.mjs?v=20261026-1';

export function createPlacementState(){
 return createDraft({realm:'aldingen',realmLabel:'Aldingen',houseIds:houses.map(h=>h.id),seatIds:settlements.map(s=>s.id),initialPlacements:Object.fromEntries(houses.map(h=>[h.id,h.sourceSeat]))});
}

export function createMapProposal(placements){
 return {number:1,short:'Aldingen',file:'Aldingen · Gelieferte Vorbereitungs- und Gebietskarte',map:'assets/map.webp',imageSize:[4096,2991],bakedNames:true,settlements,
  clans:houses.map(h=>({...h,crest:h.crest.replace(/^assets\//,''),seat:placements[h.id],liege:null}))};
}
