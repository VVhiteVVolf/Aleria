import { createTerritoryPageCatalog } from '../territory-page/territory-source-catalog.mjs';
import { createPlaceRegister } from '../../../Karten/modules/territory-places/place-catalog.mjs';
import { pages } from './page-source.mjs';
import { territoriesById, realmPath } from '../../../Stammbäume/assets/js/data/uathneach-territorial-catalog.js';
import { markers, describePlace } from '../../../Karten/Uathneach/places.mjs';

export const createTerritory = createTerritoryPageCatalog(pages, {
  countyPath: realmPath, territoriesById, placesById: createPlaceRegister(markers, describePlace),
});
