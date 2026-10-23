import {createTerritoryPageCatalog} from '../territory-page/territory-source-catalog.mjs?v=heraldry-20261022';
import {territoriesById} from '../../../Karten/Faelaorn/places.mjs';
import source from './pages.source.json' with {type:'json'};
import {placesById} from './places.mjs';
export const createTerritory=createTerritoryPageCatalog(source.pages,{countyPath:'/Kontinente/Estryll/Fürstentum Faelaorn/',territoriesById,placesById});
