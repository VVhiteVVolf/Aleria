import {createTerritoryPageCatalog} from '../territory-page/territory-source-catalog.mjs?v=albische-lande-20261022';
import {territoriesById} from '../../../Karten/Dunkelhain/places.mjs';
import pages from './pages.source.json' with {type:'json'};
import {placesById} from './places.mjs';
export const createTerritory=createTerritoryPageCatalog(pages.pages,Object.freeze({countyPath:"/Kontinente/Estryll/Dunkelhain/",placesById,territoriesById,map:pages.pages[0].map}));
