import { createTerritoryData } from '../territory-page/territory-data.mjs?v=weidebucht-20261019';
import { placesById } from './places.mjs';
import { territoriesById } from '../../../Karten/Cenyr/weidebucht/places.mjs';

const context = Object.freeze({
  countyPath: '/Kontinente/Estryll/Königreich Cenyr/Grafschaft Weidebucht/',
  placesById, territoriesById,
  map: Object.freeze({
    title: 'Karte der Weidebucht',
    imageSrc: '/Kontinente/assets/images/weidebucht-map-preview.webp',
    imageAlt: 'Karte der Grafschaft Weidebucht',
    href: '/Karten/karte.html?map=cenyr-weidebucht',
  }),
});

export function createTerritory(source, data) {
  return createTerritoryData(source, context, data);
}
