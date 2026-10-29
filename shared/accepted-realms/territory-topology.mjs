export const slug = name => String(name).replaceAll('ß', 'ss').normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export const houseTitle = house => house.clan ? house.name : /^(Die Ritter|Haus )/.test(house.name) ? house.name : `Haus ${house.name}`;
export const houseHref = house => `/Familien%20H%C3%A4user%20und%20Clans/kleinehaeuser.html?haus=${encodeURIComponent(house.familyId)}`;
export const familyHref = house => `/Stammbäume/Stammbaum.html?family=${encodeURIComponent(house.familyId)}&mode=view`;
export const placeId = (realm, seat) => `${seat.originRealm || realm.id}-${seat.id}`;
export const placeHref = (realm, seat) => `/Orte/grossstadt.html?id=${placeId(realm, seat)}`;

const typeForRank = rank => ({ royal: 'Königliche Domäne', ducal: 'Herzogliche Domäne', county: 'Gräfliche Herrschaft', freiherr: 'Freiherrentum', junker: 'Junkerherrschaft', ministerial: 'Ministerialensitz', 'ard-tiarna': 'Fürstliche Domäne', 'mor-tiarna': 'Mor Tiarnatum', 'dun-tiarna': 'Dún Tiarnatum', laird: 'Lairdherrschaft', 'knightly-order': 'Ordensgebiet' })[rank] || 'Herrschaft';

function regionRuler(realm, region) {
  if (realm.occupied) return null;
  const mainSeat = region.capital || (realm.id === 'deitheach' ? region.seats[0] : region.id);
  if (realm.id === 'iathneach' && region.id !== realm.settlements.find(s => s.id === realm.capital)?.county) return null;
  if (realm.id === 'goldmund' && region.id !== 'kronenau') return null;
  return realm.houses.find(h => h.id === region.ruler) || realm.houses.find(h => h.seatId === mainSeat && h.isSeatRuler) || null;
}

export function compileTerritories(realm) {
  const base = `/Kontinente/${realm.continent}/${realm.name}`;
  const rootHouse = realm.houses.find(h => h.id === realm.ruler);
  const territories = [];
  const make = (id, name, type, parentId, house, extra = {}) => {
    const item = { id, name, type, realmId: realm.id, parentId, rulerId: house?.id || '', familyId: house?.familyId || '', house: house ? houseTitle(house) : '', seat: house ? realm.settlements.find(s => s.id === house.seatId)?.name || '' : '', crest: house?.crest || '', banner: '', mapId: realm.id, href: `${base}/${id}/index.html`, ...extra };
    territories.push(item); return item;
  };
  make(realm.rootId, realm.title, realm.type, '', rootHouse, { level: 'realm', banner: realm.crest, historical: !!realm.historical, occupied: !!realm.occupied });
  // Moinneach's accepted first variant is ten city territories, not an extra regional tier.
  if (realm.id !== 'moinneach') for (const region of realm.regions) {
    const ruler = regionRuler(realm, region);
    const name = realm.id === 'weisenfluh' ? (region.royal ? 'Königliche Provinz ' : 'Freiherrentum ') + region.name
      : realm.id === 'goldmund' ? (region.id === 'kronenau' ? 'Herzogliche Grafschaft ' : 'Grafschaft ') + region.name
      : realm.id === 'iathneach' ? region.name : region.name || region.label;
    const art = realm.territoryArt[region.art || region.shield || `county-${region.id}`] || realm.territoryArt[`province-${region.id}`] || realm.territoryArt[region.id];
    make(`${realm.id}-region-${region.id}`, name, realm.occupied ? 'Besetzte Region' : realm.id === 'weisenfluh' ? region.royal ? 'Königliche Provinz' : 'Freiherrentum' : /Mor|Iathneach/.test(region.title || '') || realm.id === 'iathneach' ? 'Mor Tiarnatum' : realm.id === 'deitheach' ? 'Mor Tiarnatum' : 'Grafschaft', realm.rootId, ruler, { level: 'region', sourceId: region.id, banner: art?.image || ruler?.crest || '', geography: region.design?.landscape || '', originRealm: region.originRealm || '', historical: !!realm.historical, occupied: !!realm.occupied });
  }
  for (const seat of realm.settlements) {
    const ruler = realm.houses.find(h => h.seatId === seat.id && h.isSeatRuler);
    const regionId = seat.county || seat.province || '';
    let parentId = realm.id === 'moinneach' || !regionId ? realm.rootId : `${realm.id}-region-${regionId}`;
    if (realm.id === 'aldingen' && seat.id === 'hasselt') parentId = realm.rootId;
    const art = realm.territoryArt[seat.art || seat.shield || seat.region || seat.id];
    const type = realm.occupied ? 'Besetzte Herrschaft' : typeForRank(ruler?.rankId);
    const name = `${type} ${seat.regionName || seat.name}`;
    make(`${realm.id}-sitz-${seat.id}`, name, type, parentId, ruler, { level: 'seat', sourceId: seat.id, seat: seat.name, banner: art?.image || ruler?.crest || '', extent: 'territorial', geography: seat.geography || '', originRealm: seat.originRealm || '', historical: !!realm.historical, occupied: !!realm.occupied, mapRegionId: regionId ? `${realm.id}-region-${regionId}` : realm.rootId });
  }
  for (const house of realm.houses) {
    if (house.isSeatRuler) continue;
    make(`${realm.id}-hausbereich-${house.id}`, `${house.rankId === 'ministerial' ? 'Hausdienst' : 'Herrschaft'} ${houseTitle(house)} in ${realm.settlements.find(s => s.id === house.seatId).name}`, house.rankId === 'ministerial' ? 'Ministerialenhaus' : 'Örtliche Herrschaft', `${realm.id}-sitz-${house.seatId}`, house, { level: 'house', sourceId: house.id, extent: 'urban', historical: !!realm.historical, occupied: !!realm.occupied });
  }
  return territories;
}

export function ancestors(territory, byId) {
  const result = [], visited = new Set();
  for (let current = territory; current; current = byId.get(current.parentId)) {
    if (visited.has(current.id)) throw Error(`Territorialer Zyklus ${current.id}`);
    visited.add(current.id); result.unshift(current);
  }
  return result;
}
