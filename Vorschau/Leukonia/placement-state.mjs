import { createPlacementState } from '../shared/placement-state.mjs';

/** Leukonia owns its identities; shared state owns history and atomic imports. */
export function createHousePlacementState({ houses, settlements }) {
  return createPlacementState({
    realm: 'leukonia',
    realmLabel: 'Leukonia-Sitzentwurf',
    houseIds: houses.map(house => house.id),
    seatIds: settlements.map(city => city.id),
    initialPlacements: Object.fromEntries(houses.map(house => [house.id,
      Object.hasOwn(house, 'initialSeatId') ? house.initialSeatId : house.sourceSeat ?? null])),
  });
}
