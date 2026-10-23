import { createTerritoryPageCatalog } from '../territory-page/territory-source-catalog.mjs?v=heraldry-20261022';
import { territoriesById } from '../../../Karten/Aldrimar/ivarsheim/places.mjs';
import pages from './pages.source.json' with { type: 'json' };
import { placesById } from './places.mjs';

const context = Object.freeze({
  countyPath: '/Kontinente/Estryll/Königreich Aldrimar/Jarltum Ivarsheim/',
  placesById, territoriesById,
  map: Object.freeze({
    title: 'Karte des Jarltums Ivarsheim',
    imageSrc: '/Kontinente/assets/images/aldrimar/ivarsheim-map-preview.webp',
    imageAlt: 'Ivarsheim mit der westlichen Küste, Bergen und dem östlichen Grenzfluss nach Schwarzfenn',
    href: '/Karten/karte.html?map=aldrimar-ivarsheim',
  }),
});

export const createTerritory = createTerritoryPageCatalog(pages.pages, context);
