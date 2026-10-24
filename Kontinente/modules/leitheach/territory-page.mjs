import { createTerritoryPageCatalog } from '../territory-page/territory-source-catalog.mjs?v=heraldry-20261022';
import pages from './pages.source.json' with { type: 'json' };
import catalog from '../../../Karten/Leitheach/territories.import.json' with { type: 'json' };
import definitions from '../../../Karten/Leitheach/map-definitions.json' with { type: 'json' };
import { describePlace } from '../../../Karten/Leitheach/places.mjs';
import { createPlaceRegister } from '../../../Karten/modules/territory-places/place-catalog.mjs';

const sources = await Promise.all(definitions.maps.filter(map => map.slug !== 'leitheach').map(async map =>
  (await import(`../../../Karten/Leitheach/${map.slug}/markers.source.json`, { with: { type: 'json' } })).default));
const markers = sources.flatMap(source => source.markers);
const withPlaces = pages.pages.map(page => {
  const own = markers.filter(marker => marker.territoryId === page.id);
  const categories = [...new Set(own.map(marker => marker.category))];
  return { ...page, domains: own.length ? [{ territoryId: page.id, title: page.title,
    sections: categories.map(category => ({ title: category, placeIds: own.filter(marker => marker.category === category).map(marker => marker.id) })) }] : [] };
});

// Only a page's own settlements are expanded; subordinate domains stay linked.
export const createTerritory = createTerritoryPageCatalog(withPlaces, Object.freeze({
  countyPath: '/Kontinente/Estryll/Fürstentum Leitheach/',
  territoriesById: new Map(catalog.territories.map(territory => [territory.id, territory])),
  placesById: createPlaceRegister(markers, describePlace),
}));
