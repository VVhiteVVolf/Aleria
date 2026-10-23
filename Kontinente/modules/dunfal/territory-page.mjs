import {createTerritoryPageCatalog} from '../territory-page/territory-source-catalog.mjs?v=heraldry-20261022';
import {territoriesById} from '../../../Karten/Dunfal/places.mjs';
import pages from './pages.source.json' with {type:'json'};
import {placesById} from './places.mjs';

export const createTerritory=createTerritoryPageCatalog(pages.pages,Object.freeze({
  countyPath:'/Kontinente/Estryll/Fürstentum Dunfal/',placesById,territoriesById,
  map:Object.freeze({title:'Karte des Fürstentums Dunfal',imageSrc:'/Karten/Dunfal/Kartenbilder/normal.webp',imageAlt:'Dunfal zwischen Leitheach und Aislearneach',href:'/Karten/karte.html?map=dunfal'}),
}));
