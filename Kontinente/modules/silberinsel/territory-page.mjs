import { createTerritoryData } from '../territory-page/territory-data.mjs?v=silberinsel-20261019';
import { placesById } from './places.mjs';
import { territoriesById } from '../../../Karten/Cenyr/silberinsel/places.mjs';

const context = Object.freeze({
  countyPath: '/Kontinente/Estryll/Königreich Cenyr/Grafschaft Silberinsel/',
  placesById, territoriesById,
  map: Object.freeze({
    title: 'Karte der Silberinsel',
    imageSrc: '/Kontinente/assets/images/silberinsel-map-preview.webp',
    imageAlt: 'Karte der Grafschaft Silberinsel',
    href: '/Karten/karte.html?map=cenyr-silberinsel',
  }),
});

export function createTerritory(source, data) {
  return createTerritoryData(source, context, data);
}
