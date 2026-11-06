import {createPlacementState} from '../shared/placement-state.mjs';
export const PLACEMENT_STORAGE_KEY='aleria:proposal:mathringen:placements:v1';
export function createHousePlacementState({houses,settlements}){
 const state=createPlacementState({realm:'mathringen',realmLabel:'Mathringen',
  houseIds:houses.map(h=>h.id),seatIds:settlements.map(s=>s.id),
  initialPlacements:Object.fromEntries(houses.map(h=>[h.id,h.sourceSeat??null]))});
 const legacyIds=houses.filter(house=>house.id!=='splettinger').map(house=>house.id);
 return {...state,restore(value){
  const placements=value?.placements;
  const completeLegacy=value?.schemaVersion===1&&value.realm==='mathringen'
   &&placements&&typeof placements==='object'&&!Array.isArray(placements)
   &&Object.keys(placements).length===legacyIds.length&&legacyIds.every(id=>Object.hasOwn(placements,id));
  state.restore(completeLegacy?{...value,placements:{...placements,splettinger:null}}:value);
 }};
}
