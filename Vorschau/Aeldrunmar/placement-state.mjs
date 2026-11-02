import {houses} from './house-data.mjs';
import {settlements} from './territory-data.mjs';
import {createPlacementState as createDraft} from '../shared/placement-state.mjs';
import {additionalInitialPlacements} from './additional-houses.mjs';

const originalHouseIds=houses.filter(h=>!Object.hasOwn(additionalInitialPlacements,h.id)).map(h=>h.id);

// Upgrade only the complete original 35-house format. Existing assignments and
// strict validation remain owned by the shared state; malformed drafts still fail.
function withAdditionalPlacements(value){
 const placements=value?.placements;
 if(value?.schemaVersion!==1||value.realm!=='aeldrunmar'||!placements||typeof placements!=='object'||Array.isArray(placements))return value;
 const keys=Object.keys(placements);
 if(keys.length!==originalHouseIds.length||!originalHouseIds.every(id=>Object.hasOwn(placements,id)))return value;
 return {...value,placements:{...placements,...additionalInitialPlacements}};
}

export function createPlacementState(){
 const draft=createDraft({realm:'aeldrunmar',realmLabel:'Aeldrunmar',houseIds:houses.map(h=>h.id),seatIds:settlements.map(s=>s.id),initialPlacements:Object.fromEntries(houses.map(h=>[h.id,h.sourceSeat]))});
 return {...draft,restore:value=>draft.restore(withAdditionalPlacements(value))};
}
export const createMapProposal=placements=>({number:1,short:'Aeldrunmar',file:'Aeldrunmar · Earltümer und bestätigte Gebietsbezeichnungen',map:'assets/map.svg',imageSize:[8192,6072],bakedNames:true,settlements:settlements.map(s=>({...s,overlayLabel:false})),clans:houses.map(h=>({...h,crest:h.crest.replace(/^assets\//,''),seat:placements[h.id],liege:null}))});
