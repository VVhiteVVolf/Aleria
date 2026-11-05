import {createPlacementState} from '../shared/placement-state.mjs';
export const PLACEMENT_STORAGE_KEY='aleria:proposal:klythesia:placements:v1';
export function createHousePlacementState({houses,settlements}){
  return createPlacementState({realm:'klythesia',realmLabel:'Klythesia-Sitzentwurf',
    houseIds:houses.map(house=>house.id),seatIds:settlements.map(city=>city.id),
    initialPlacements:Object.fromEntries(houses.map(house=>[house.id,house.sourceSeat??null]))});
}
