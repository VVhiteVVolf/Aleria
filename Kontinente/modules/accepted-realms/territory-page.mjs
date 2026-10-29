import { realms, realmsById } from '../../../shared/accepted-realms/catalog.mjs';
import { createTerritoryArticle } from '../../../shared/accepted-realms/territory-article.mjs';
import { realmPlaces } from '../../../shared/accepted-realms/map-places.mjs';
import { createPlaceRegister } from '../../../Karten/modules/territory-places/place-catalog.mjs';
import { createTerritoryPageCatalog } from '../territory-page/territory-source-catalog.mjs';

const allPlaces = new Map(realms.flatMap(realm => {
  const { markers, describePlace } = realmPlaces(realm);
  return [...createPlaceRegister(markers, describePlace)];
}));
const catalogs = new Map(realms.map(realm => [realm.id, createTerritoryPageCatalog(
  realm.territories.map(t => createTerritoryArticle(realm, t)),
  { territoriesById: realm.territoriesById, placesById: allPlaces, countyPath: `/Kontinente/${realm.continent}/${realm.name}/` },
)]));
export function createAcceptedTerritory(realmId, id, data) {
  if (!realmsById.has(realmId)) throw Error(`Unbekanntes Land ${realmId}`);
  return catalogs.get(realmId)(id, data);
}
