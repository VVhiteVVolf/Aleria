import { createTerritoryData } from '../territory-page/territory-data.mjs?v=graue-weite-20261019';
import { placesById } from './places.mjs';
import { territoriesById } from '../../../Karten/Cenyr/graue-weite/places.mjs';

const context = Object.freeze({
  countyPath: '/Kontinente/Estryll/Königreich Cenyr/Grafschaft Graue Weite/',
  placesById, territoriesById,
  map: Object.freeze({
    title: 'Karte der Grauen Weite',
    imageSrc: '/Kontinente/assets/images/graue-weite-map-preview.webp',
    imageAlt: 'Karte der Grafschaft Graue Weite',
    href: '/Karten/karte.html?map=cenyr-graue-weite',
  }),
});

export function createTerritory(source, data) {
  return createTerritoryData(source, context, data);
}
