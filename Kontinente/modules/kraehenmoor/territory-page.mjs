import { createTerritoryPageCatalog } from '../territory-page/territory-source-catalog.mjs?v=heraldry-20261022';
import { territoriesById } from '../../../Karten/Aldrimar/kraehenmoor/places.mjs';
import pages from './pages.source.json' with { type: 'json' };
import { placesById } from './places.mjs';

const sharedCouncilGroups = new Map([
  ['jarltum-kraehenmoor', 'jarlsrat'],
  ['thanentum-schimmerkueste', 'schimmerkuestenrat'],
].flatMap(([id, key]) => pages.pages.find(page => page.id === id).councilGroups
  .map((group, index) => [`${key}-${index}`, group])));

const context = Object.freeze({
  countyPath: '/Kontinente/Estryll/Königreich Aldrimar/Jarltum Krähenmoor/',
  placesById, territoriesById, sharedCouncilGroups,
  map: Object.freeze({
    title: 'Karte des Jarltums Krähenmoor',
    imageSrc: '/Kontinente/assets/images/aldrimar/kraehenmoor-map-preview.webp',
    imageAlt: 'Krähenmoor mit Nebelmoor, Rabenweide, Rabenforst, Schwarzfjord und Schimmerküste',
    href: '/Karten/karte.html?map=aldrimar-kraehenmoor',
  }),
});

export const createTerritory = createTerritoryPageCatalog(pages.pages, context);
