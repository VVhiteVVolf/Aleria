import source from './places.source.json' with { type: 'json' };
import territorySource from './territories.source.json' with { type: 'json' };
import { createPlaceCatalog } from '../../modules/territory-places/place-catalog.mjs?v=silberinsel-20261019';

export const { territoriesById, descriptionsById, describePlace } = createPlaceCatalog(territorySource, source);
