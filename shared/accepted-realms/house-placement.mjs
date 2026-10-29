import { realmsById, houseTitle } from './catalog.mjs';

export function houseTerritory(realm, house) {
  return realm.territoriesById.get(house.isSeatRuler ? `${realm.id}-sitz-${house.seatId}` : `${realm.id}-hausbereich-${house.id}`);
}

export function housePlacement(realm, house) {
  const origin = realmsById.get(house.originRealm) || realm;
  const territory = houseTerritory(realm, house);
  const seat = realm.settlementsById.get(house.seatId);
  const region = realm.regions.find(r => r.id === house.regionId);
  const regionTerritory = realm.territoriesById.get(`${realm.id}-region-${house.regionId}`);
  const liege = realm.housesById.get(house.liegeId);
  const regionName = regionTerritory?.name || region?.name || region?.label || '';
  const path = [origin.name, ...(regionName && realm.id !== 'moinneach' ? [realm.occupied ? `Ehemals ${regionName}` : regionName] : []), seat.name];
  const icon = src => src?.startsWith('/Stammbäume/') ? src.slice('/Stammbäume/'.length) : src || '';
  return {
    rankId: house.rankId, seat: realm.historical ? `Ehemals ${seat.name}` : seat.name,
    kingdom: origin.name, county: realm.historical ? `Historisch · ${regionName}` : regionName,
    barony: territory.name, folderPath: path,
    folderIcons: [icon(origin.crest), ...(path.length === 3 ? [icon(regionTerritory?.banner)] : []), icon(territory.banner || house.crest)],
    liegeHouseId: liege?.houseId || '', liegeHouseName: liege ? houseTitle(liege) : '',
    regionEmblems: { kingdom: icon(origin.crest), county: icon(regionTerritory?.banner), barony: icon(territory.banner), seat: icon(house.crest) },
  };
}
