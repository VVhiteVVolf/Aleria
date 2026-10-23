import { createTerritoryPageCatalog } from '../territory-page/territory-source-catalog.mjs?v=heraldry-20261022';
import { territoriesById } from '../../../Karten/Aldrimar/schwarzfenn/places.mjs';
import pages from './pages.source.json' with { type: 'json' };
import { placesById } from './places.mjs';

const context = Object.freeze({
  countyPath: '/Kontinente/Estryll/Königreich Aldrimar/Jarltum Schwarzfenn/',
  placesById, territoriesById,
  map: Object.freeze({
    title: 'Karte des Jarltums Schwarzfenn',
    imageSrc: '/Kontinente/assets/images/aldrimar/schwarzfenn-map-preview.webp',
    imageAlt: 'Schwarzfenn zwischen Vánlauf, Fenriszahn-Gebirge, Düstersumpf und Dvergskjær',
    href: '/Karten/karte.html?map=aldrimar-schwarzfenn',
  }),
});

export const createTerritory = createTerritoryPageCatalog(pages.pages, context);
