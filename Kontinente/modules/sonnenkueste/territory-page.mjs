import { createTerritoryData } from '../territory-page/territory-data.mjs?v=sonnenkueste-20261019';
import { placesById } from './places.mjs';
import { territoriesById } from '../../../Karten/Cenyr/sonnenkueste/places.mjs';

const context = Object.freeze({
  countyPath: '/Kontinente/Estryll/Königreich Cenyr/Grafschaft Sonnenküste/',
  placesById, territoriesById,
  map: Object.freeze({
    title: 'Karte der Sonnenküste',
    imageSrc: '/Kontinente/assets/images/sonnenkueste-map-preview.webp',
    imageAlt: 'Karte der Grafschaft Sonnenküste',
    href: '/Karten/karte.html?map=cenyr-sonnenkueste',
  }),
});

export function createTerritory(source, data) {
  return createTerritoryData(source, context, data);
}
