import {houses} from './house-data.mjs';
import {settlements} from './territory-data.mjs';
import {createPlacementState as createDraft} from '../shared/placement-state.mjs';
export function createPlacementState(){
 const draft=createDraft({realm:'blutstadt',realmLabel:'Blutstadt',houseIds:houses.map(h=>h.id),seatIds:settlements.map(s=>s.id),initialPlacements:Object.fromEntries(houses.map(h=>[h.id,null]))});
 function validate(placements){
  const occupied=new Set();
  for(const house of houses.filter(h=>h.rank==='aristocrat')){
   const id=placements[house.id];if(id===null)continue;
   const seat=settlements.find(s=>s.id===id);
   if(!seat?.principal)throw Error('Aristokraten benötigen einen der fünf äußeren Hauptsitze. Ihre Stadtresidenz steht bereits als Hausangabe fest.');
   if(house.seatRequirement==='castle'&&seat.seatType!=='castle')throw Error('Bismarck und Kastell benötigen einen Burgsitz.');
   if(occupied.has(id))throw Error('Ein äußerer Hauptsitz kann nur einem Aristokratenhaus zugeordnet werden.');
   occupied.add(id);
  }
 }
 return {...draft,move(id,seat){validate({...draft.current(),[id]:seat});return draft.move(id,seat);},restore(value){if(value?.schemaVersion===1&&value.realm==='blutstadt'&&value.placements)validate(value.placements);return draft.restore(value);}};
}
export const createMapProposal=placements=>({number:1,short:'Blutstadt',file:'Blutstadt · fünf freie aristokratische Herrschaftsgebiete',map:'assets/map.webp',imageSize:[4096,1943],bakedNames:false,settlements,clans:houses.map(h=>({...h,crest:h.crest.replace(/^assets\//,''),seat:placements[h.id],liege:null}))});
