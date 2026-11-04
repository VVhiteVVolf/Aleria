import { createPlacementState } from '../shared/placement-state.mjs';

export function createHousePlacementState({ houses, settlements }) {
  return createPlacementState({
    realm: 'calidaria', realmLabel: 'Calidaria-Sitzentwurf',
    houseIds: houses.map(house => house.id), seatIds: settlements.map(city => city.id),
    initialPlacements: Object.fromEntries(houses.map(house => [house.id, house.sourceSeat ?? null])),
  });
}
