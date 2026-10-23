import {createTerritoryPageCatalog} from '../territory-page/territory-source-catalog.mjs?v=heraldry-20261022';
import {territoriesById} from '../../../Karten/Fjordheim/places.mjs';
import pages from './pages.source.json' with {type:'json'};
import {placesById} from './places.mjs';

export const createTerritory=createTerritoryPageCatalog(pages.pages,Object.freeze({
  countyPath:'/Kontinente/Estryll/Reiktum Fjordheim/',placesById,territoriesById,
  map:Object.freeze({title:'Karte von Fjordheim',imageSrc:'/Karten/Fjordheim/Kartenbilder/normal.webp',imageAlt:'Fjordheim: gelieferte unbeschriftete Karte',href:'/Karten/karte.html?map=fjordheim'}),
}));
