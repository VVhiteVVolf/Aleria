import {houses} from './house-data.mjs';
import {settlements,mapImageSize} from './territory-data.mjs';
import {createPlacementState as createDraft} from '../shared/placement-state.mjs';
export const createPlacementState=()=>createDraft({realm:'brevanor',realmLabel:'Brevanor',houseIds:houses.map(h=>h.id),seatIds:settlements.map(s=>s.id),initialPlacements:Object.fromEntries(houses.map(h=>[h.id,h.sourceSeat]))});
export const createMapProposal=placements=>({number:1,short:'Brevanor',file:'Brevanor · historische Vorbereitungskarte mit Ortsvorschlägen',map:'assets/map.webp',imageSize:mapImageSize,bakedNames:true,settlements,clans:houses.map(h=>({...h,crest:h.crest.replace(/^assets\//,''),seat:placements[h.id],liege:null}))});
