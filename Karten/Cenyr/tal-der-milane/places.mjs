import { createPlaceCatalog } from '../../modules/territory-places/place-catalog.mjs?v=tal-der-milane-20261019';
import territories from './territories.source.json' with { type: 'json' };
import places from './places.source.json' with { type: 'json' };

export const { territoriesById, descriptionsById, describePlace } = createPlaceCatalog(territories, places);
