import {createPlacementState} from '../shared/placement-state.mjs';
export const PLACEMENT_STORAGE_KEY='aleria:proposal:mathringen:placements:v1';
export function createHousePlacementState({houses,settlements}){
 return createPlacementState({realm:'mathringen',realmLabel:'Mathringen',
  houseIds:houses.map(h=>h.id),seatIds:settlements.map(s=>s.id),
  initialPlacements:Object.fromEntries(houses.map(h=>[h.id,h.sourceSeat??null]))});
}
