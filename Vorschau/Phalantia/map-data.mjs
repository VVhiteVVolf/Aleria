import { MAP_VARIANTS,REGIONS,SETTLEMENTS } from './territory-data.mjs';
import { MAP_LABEL_REPLACEMENTS } from './map-label-data.mjs';
export { MAP_VARIANTS,REGIONS,SETTLEMENTS };

export function createMapProposal({ houses,placements,variant=MAP_VARIANTS[0] }) {
  return { ...variant,settlements:SETTLEMENTS,labelReplacements:MAP_LABEL_REPLACEMENTS,
    clans:houses.filter(house => house.crest).map(house => ({ ...house,
      crest:house.crest.startsWith('assets/') ? house.crest.slice(7) : '../'+house.crest,
      seat:placements[house.id],liege:house.liege || null,
    })) };
}
