import { createTerritoryPageCatalog } from '../territory-page/territory-source-catalog.mjs?v=heraldry-20261022';
import { territoriesById } from '../../../Karten/Aldrimar/heldenwacht/places.mjs';
import pages from './pages.source.json' with { type: 'json' };
import { placesById } from './places.mjs';

const context = Object.freeze({
  countyPath: '/Kontinente/Estryll/Königreich Aldrimar/Jarltum Heldenwacht/',
  placesById, territoriesById,
  map: Object.freeze({
    title: 'Karte des Jarltums Heldenwacht',
    imageSrc: '/Kontinente/assets/images/aldrimar/heldenwacht-map-preview.webp',
    imageAlt: 'Heldenwacht mit Tal der Helden, Torrenwacht, Wellenklang, Möwenfels und den Klageschild-Inseln',
    href: '/Karten/karte.html?map=aldrimar-heldenwacht',
  }),
});

export const createTerritory = createTerritoryPageCatalog(pages.pages, context);
