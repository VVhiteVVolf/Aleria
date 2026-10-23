import { createTerritoryPageCatalog } from '../territory-page/territory-source-catalog.mjs?v=heraldry-20261022';
import { territoriesById } from '../../../Karten/Aldrimar/roriksheim/places.mjs?v=roriksheim-20261020';
import pages from './pages.source.json' with { type: 'json' };
import { placesById } from './places.mjs?v=roriksheim-20261020b';

const context = Object.freeze({
  countyPath: '/Kontinente/Estryll/Königreich Aldrimar/Jarltum Roriksheim/',
  placesById, territoriesById,
  map: Object.freeze({
    title: 'Karte des Jarltums Roriksheim',
    imageSrc: '/Kontinente/assets/images/aldrimar/roriksheim-map-preview.webp',
    imageAlt: 'Roriksheim mit seinen Flüssen, Wäldern und Siedlungen',
    href: '/Karten/karte.html?map=aldrimar-roriksheim',
  }),
});

export const createTerritory = createTerritoryPageCatalog(pages.pages, context);
