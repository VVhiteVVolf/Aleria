import { createTerritoryData } from '../territory-page/territory-data.mjs?v=roriksheim-20261020c';
import { territoriesById } from '../../../Karten/Aldrimar/roriksheim/places.mjs?v=roriksheim-20261020';
import pages from './pages.source.json' with { type: 'json' };
import { placesById } from './places.mjs?v=roriksheim-20261020b';

const pagesById = new Map(pages.pages.map(page => [page.id, page]));
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

export function createTerritory(id, data) {
  const source = pagesById.get(id);
  if (!source) throw new Error(`Unbekannte Roriksheim-Seite: ${id}`);
  // The Jarltum expands selected primary domains from their own page data.
  // Resolving only the matching domain keeps subordinate registers on their pages.
  const domains = [...source.domains, ...(source.domainReferences || []).map(territoryId => {
    const domain = pagesById.get(territoryId)?.domains.find(entry => entry.territoryId === territoryId);
    if (!domain) throw new Error(`Fehlendes eigenes Ortsregister: ${territoryId}`);
    return domain;
  })];
  return createTerritoryData({ ...source, domains }, context, data);
}
