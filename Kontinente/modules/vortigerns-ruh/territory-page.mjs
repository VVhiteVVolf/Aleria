import { royalCouncil } from '../cenyr-court/royal-council.mjs?v=vortigern-20261018';
import { createTerritoryData } from '../territory-page/territory-data.mjs?v=sonnenkueste-20261018';
import { placesById } from './places.mjs';
import { territoriesById } from '../../../Karten/Cenyr/vortigerns-ruh/places.mjs';

const context = Object.freeze({
  countyPath: '/Kontinente/Estryll/Königreich Cenyr/Grafschaft Vortigerns Ruh/',
  placesById, territoriesById,
  sharedCouncilGroups: new Map([['cenyr-royal', royalCouncil]]),
  map: Object.freeze({
    title: 'Karte von Vortigerns Ruh',
    imageSrc: '/Kontinente/assets/images/vortigerns-ruh-map-preview.webp',
    imageAlt: 'Karte der Königlichen Grafschaft Vortigerns Ruh',
    href: '/Karten/karte.html?map=cenyr-vortigerns-ruh',
  }),
});
export function createTerritory(source, data) {
  return createTerritoryData(source, context, data);
}
