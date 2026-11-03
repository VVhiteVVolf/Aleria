import { MAP_VARIANTS, ARCHONATES, SETTLEMENTS } from './territory-data.mjs?v=20261103-leukonia-4';

export { MAP_VARIANTS, ARCHONATES, SETTLEMENTS };

/** The original map is unchanged; current house residences are separate overlays. */
export function createMapProposal({ houses, placements, variant = MAP_VARIANTS[0] }) {
  return {
    ...variant,
    settlements: SETTLEMENTS.map(city => ({ ...city, pin: city.pin || city.point })),
    clans: houses.map(house => ({ ...house, crest: house.crest?.replace(/^assets\//, ''), seat: placements[house.id], liege: house.liege || null })),
  };
}
