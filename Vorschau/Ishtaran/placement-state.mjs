import { createPlacementState } from '../shared/placement-state.mjs';

const allowedRanks = {
  capital: new Set(['Sultan', 'Tarkan']),
  pascha: new Set(['Pascha', 'Tarkan']),
  tarkan: new Set(['Tarkan']),
};

/** Ishtaran owns rank/capacity rules; shared state owns snapshots and history. */
export function createHousePlacementState({ houses, settlements }) {
  const cities = new Map(settlements.map(city => [city.id, city]));
  for (const house of houses) {
    if (!['Sultan', 'Pascha', 'Tarkan'].includes(house.rank)) throw Error(`Unbekannter Hausrang: ${house.name}.`);
  }
  for (const city of settlements) {
    if (!allowedRanks[city.tier] || (city.capacity !== null && (!Number.isInteger(city.capacity) || city.capacity < 0 || (city.capacity === 0 && !city.destroyed)))) {
      throw Error(`Ungültige Ortskonfiguration: ${city.name}.`);
    }
  }
  const config = {
    realm: 'ishtaran', realmLabel: 'Ishtaran-Zuordnungsentwurf',
    houseIds: houses.map(house => house.id), seatIds: settlements.map(city => city.id),
    initialPlacements: Object.fromEntries(houses.map(house => [house.id,
      Object.hasOwn(house, 'initialSeatId') ? house.initialSeatId : house.sourceSeat ?? null])),
  };

  function validate(placements) {
    const occupants = new Map(settlements.map(city => [city.id, []]));
    for (const house of houses) {
      const seat = placements[house.id];
      if (seat === null) continue;
      const city = cities.get(seat);
      if (!city) throw Error('Unbekannter Ort im Zuordnungsentwurf.');
      if (city.destroyed) throw Error(`${city.name} ist zerstört und kann keine Häuser aufnehmen.`);
      if (!allowedRanks[city.tier].has(house.rank)) throw Error(`Haus ${house.name} (${house.rank}) passt nicht zum Rang von ${city.name}.`);
      occupants.get(city.id).push(house);
    }
    for (const city of settlements) {
      const current = occupants.get(city.id);
      const leaderRank = city.tier === 'capital' ? 'Sultan' : city.tier === 'pascha' ? 'Pascha' : null;
      if (leaderRank && current.filter(house => house.rank === leaderRank).length > 1) {
        throw Error(`${city.name} kann nur ein ${leaderRank}-Haus aufnehmen.`);
      }
      if (city.tier === 'pascha' && current.filter(house => house.rank === 'Tarkan').length > 2) {
        throw Error(`${city.name} nimmt höchstens zwei Tarkan-Häuser auf.`);
      }
      if (city.capacity !== null && current.length > city.capacity) throw Error(`${city.name} nimmt höchstens ${city.capacity} ${city.capacity === 1 ? 'Haus' : 'Häuser'} auf.`);
    }
  }
  const state = createPlacementState(config);
  validate(state.current());
  return {
    ...state,
    move(id, seat) {
      validate({ ...state.current(), [id]: seat });
      return state.move(id, seat);
    },
    restore(value) {
      // Reuse shared schema validation in an isolated candidate before committing.
      const candidate = createPlacementState({ ...config, trackHistory: false });
      candidate.restore(value);
      validate(candidate.current());
      state.restore(value);
    },
  };
}
