import { createPlaceCatalog } from '../../modules/territory-places/place-catalog.mjs?v=roriksheim-20261020';
import territories from './territories.import.json' with { type: 'json' };
import places from './places.source.json' with { type: 'json' };

export const { territoriesById, descriptionsById, describePlace } = createPlaceCatalog(territories, places);
