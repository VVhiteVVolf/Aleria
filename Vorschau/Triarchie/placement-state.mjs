import {houses} from './house-data.mjs';
import {settlements} from './territory-data.mjs';
import {context} from './realm-context.mjs';
import {createPlacementState as createDraft} from '../shared/placement-state.mjs';
export const createPlacementState=()=>createDraft({realm:context.realm,realmLabel:context.short,houseIds:houses.map(h=>h.id),seatIds:settlements.map(s=>s.id),initialPlacements:Object.fromEntries(houses.map(h=>[h.id,h.sourceSeat]))});
export const createMapProposal=placements=>({number:1,short:context.short,file:'Triarchie · Gelieferte Besatzungskarte Lothirs',map:'assets/map.webp',imageSize:context.imageSize,bakedNames:true,settlements,clans:houses.map(h=>({...h,crest:h.crest.replace(/^assets\//,''),seat:placements[h.id],liege:null}))});
