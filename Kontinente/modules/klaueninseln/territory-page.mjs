import { createTerritoryData } from '../territory-page/territory-data.mjs?v=klaueninseln-20261019';
import { placesById } from './places.mjs';
import { territoriesById } from '../../../Karten/Cenyr/klaueninseln/places.mjs';

const context = Object.freeze({
  countyPath: '/Kontinente/Estryll/Königreich Cenyr/Grafschaft Klaueninsel/',
  placesById, territoriesById,
  map: Object.freeze({
    title: 'Karte der Klaueninsel',
    imageSrc: '/Kontinente/assets/images/klaueninseln-map-preview.webp',
    imageAlt: 'Karte der Grafschaft Klaueninsel',
    href: '/Karten/karte.html?map=cenyr-klaueninseln',
  }),
});

export function createTerritory(source, data) {
  return createTerritoryData(source, context, data);
}
