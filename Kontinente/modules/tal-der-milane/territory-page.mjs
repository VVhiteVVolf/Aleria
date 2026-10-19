import { createTerritoryData } from '../territory-page/territory-data.mjs?v=tal-der-milane-20261019';
import { placesById } from './places.mjs';
import { territoriesById } from '../../../Karten/Cenyr/tal-der-milane/places.mjs';

const context = Object.freeze({
  countyPath: '/Kontinente/Estryll/Königreich Cenyr/Grafschaft Tal der Milane/',
  placesById, territoriesById,
  map: Object.freeze({
    title: 'Karte der Grafschaft Tal der Milane',
    imageSrc: '/Kontinente/assets/images/tal-der-milane-map-preview.webp',
    imageAlt: 'Karte der Grafschaft Tal der Milane',
    href: '/Karten/karte.html?map=cenyr-tal-der-milane',
  }),
});

export function createTerritory(source, data) {
  return createTerritoryData(source, context, data);
}
