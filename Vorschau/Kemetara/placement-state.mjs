import {createPlacementState} from '../shared/placement-state.mjs';
export const PLACEMENT_STORAGE_KEY='aleria:proposal:kemetara:placements:v1';
export function createHousePlacementState({houses,settlements}){
 return createPlacementState({realm:'kemetara',realmLabel:'Kemetara',houseIds:houses.map(h=>h.id),seatIds:settlements.map(c=>c.id),initialPlacements:Object.fromEntries(houses.map(h=>[h.id,h.sourceSeat??null]))});
}
