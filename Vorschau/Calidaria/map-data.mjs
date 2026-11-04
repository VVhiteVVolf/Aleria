import { MAP_VARIANTS, ARCHONATES, REGIONS, SETTLEMENTS } from './territory-data.mjs';

export { MAP_VARIANTS, ARCHONATES, REGIONS, SETTLEMENTS };

/** Residences form a separate overlay; the supplied map remains unchanged. */
export function createMapProposal({ houses, placements, variant = MAP_VARIANTS[0] }) {
  return {
    ...variant,
    settlements: SETTLEMENTS,
    clans: houses.filter(house => house.ready !== false && house.crest).map(house => ({ ...house,
      crest: house.crest.startsWith('assets/') ? house.crest.slice(7) : '../' + house.crest,
      seat: placements[house.id], liege: house.liege || null })),
  };
}
