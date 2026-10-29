import {houses} from './house-data.mjs';
import {settlements} from './territory-data.mjs';
import {createPlacementState as createDraft} from '../shared/placement-state.mjs';
export const createPlacementState=()=>createDraft({realm:'aeldrunmar',realmLabel:'Aeldrunmar',houseIds:houses.map(h=>h.id),seatIds:settlements.map(s=>s.id),initialPlacements:Object.fromEntries(houses.map(h=>[h.id,h.sourceSeat]))});
export const createMapProposal=placements=>({number:1,short:'Aeldrunmar',file:'Aeldrunmar · gelieferte Earltums- und Regionenkarte',map:'assets/map.webp',imageSize:[8192,6072],bakedNames:true,settlements,clans:houses.map(h=>({...h,crest:h.crest.replace(/^assets\//,''),seat:placements[h.id],liege:null}))});
