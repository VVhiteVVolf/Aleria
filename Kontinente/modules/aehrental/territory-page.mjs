import { createTerritoryData } from '../territory-page/territory-data.mjs?v=aehrental-20261019';
import { placesById } from './places.mjs';
import { territoriesById } from '../../../Karten/Cenyr/aehrental/places.mjs';

const context = Object.freeze({
  countyPath: '/Kontinente/Estryll/Königreich Cenyr/Grafschaft Ährental/',
  placesById, territoriesById,
  map: Object.freeze({
    title: 'Karte des Ährentals',
    imageSrc: '/Kontinente/assets/images/aehrental-map-preview.webp',
    imageAlt: 'Karte der Grafschaft Ährental',
    href: '/Karten/karte.html?map=cenyr-aehrental',
  }),
});

export function createTerritory(source, data) {
  return createTerritoryData(source, context, data);
}
