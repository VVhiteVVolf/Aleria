import {houses} from './house-data.mjs';
import {settlements} from './territory-data.mjs';
import {createPlacementState as createDraft} from '../shared/placement-state.mjs';
export const createPlacementState=()=>createDraft({realm:'talyndor',realmLabel:'Talyndor',houseIds:houses.map(h=>h.id),seatIds:settlements.map(s=>s.id),initialPlacements:Object.fromEntries(houses.map(h=>[h.id,h.sourceSeat]))});
export const createMapProposal=placements=>({number:1,short:'Talyndor',file:'Talyndor · gelieferte Vorbereitungskarte mit vorgeschlagenen Ortsnamen',map:'assets/map.webp',imageSize:[7036,8192],bakedNames:true,settlements,clans:houses.map(h=>({...h,crest:h.crest.replace(/^assets\//,''),seat:placements[h.id],liege:null}))});
