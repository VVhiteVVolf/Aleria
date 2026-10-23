import { createPlaceCatalog } from '../../modules/territory-places/place-catalog.mjs';
import territories from './territories.import.json' with { type: 'json' };
import descriptions from './places.source.json' with { type: 'json' };

export const { territoriesById, descriptionsById, describePlace } = createPlaceCatalog(territories, descriptions);
