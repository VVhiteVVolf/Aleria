import { MAP_VARIANTS, REGIONS, ARCHONATES, SETTLEMENTS } from './territory-data.mjs';
export { MAP_VARIANTS, REGIONS, ARCHONATES, SETTLEMENTS };

export function createMapProposal({ houses, placements }) {
  return { ...MAP_VARIANTS[0], settlements: SETTLEMENTS,
    clans: houses.filter(house => house.ready !== false && house.crest).map(house => ({ ...house,
      crest: house.crest.startsWith('assets/') ? house.crest.slice(7) : '../' + house.crest,
      seat: placements[house.id], liege: house.liege || null })) };
}
