import {houses,settlements} from './realm-data.mjs';
import {createPlacementState as createDraftPlacements} from '../shared/placement-state.mjs?v=20261026-1';

export function createPlacementState() {
 return createDraftPlacements({
  realm:'weisenfluh',
  realmLabel:'Weisenfluh',
  houseIds:houses.map(house=>house.id),
  seatIds:settlements.map(seat=>seat.id),
  initialPlacements:Object.fromEntries(houses.map(house=>[house.id,house.sourceSeat]))
 });
}
