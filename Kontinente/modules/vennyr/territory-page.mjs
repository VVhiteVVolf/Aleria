import {createTerritoryPageCatalog} from '../territory-page/territory-source-catalog.mjs?v=heraldry-20261022';
import {territoriesById} from '../../../Karten/Vennyr/places.mjs';
import pages from './pages.source.json' with {type:'json'};
import {placesById} from './places.mjs';

export const createTerritory=createTerritoryPageCatalog(pages.pages,Object.freeze({
  countyPath:'/Kontinente/Estryll/Königreich Vennyr/',placesById,territoriesById,
  map:Object.freeze({title:'Karte von Vennyr',imageSrc:'/Karten/Vennyr/Kartenbilder/normal.webp',imageAlt:'Vennyr: gelieferte unbeschriftete Karte',href:'/Karten/karte.html?map=vennyr'}),
}));
