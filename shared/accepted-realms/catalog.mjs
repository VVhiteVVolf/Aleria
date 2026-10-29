import aldingen from './data/aldingen.source.json' with { type: 'json' };
import goldmund from './data/goldmund.source.json' with { type: 'json' };
import weisenfluh from './data/weisenfluh.source.json' with { type: 'json' };
import moinneach from './data/moinneach.source.json' with { type: 'json' };
import iathneach from './data/iathneach.source.json' with { type: 'json' };
import deitheach from './data/deitheach.source.json' with { type: 'json' };
import triarchie from './data/triarchie.source.json' with { type: 'json' };
import legacy from './data/weisenfluh-legacy.source.json' with { type: 'json' };
import { enrichRealm } from './realm-enrichment.mjs';
import { compileTerritories, ancestors, houseTitle } from './territory-topology.mjs';

export { houseTitle, houseHref, familyHref, placeHref, placeId, slug } from './territory-topology.mjs';
export const realms = [aldingen, goldmund, weisenfluh, moinneach, iathneach, deitheach, triarchie].map(source => {
  const realm = enrichRealm(source, legacy);
  realm.territories = compileTerritories(realm);
  realm.territoriesById = new Map(realm.territories.map(t => [t.id, t]));
  realm.housesById = new Map(realm.houses.map(h => [h.id, h]));
  realm.settlementsById = new Map(realm.settlements.map(s => [s.id, s]));
  realm.ancestors = t => ancestors(t, realm.territoriesById);
  return realm;
});
export const realmsById = new Map(realms.map(realm => [realm.id, realm]));
// Historical jurisdiction has its own page; current occupation owns the one place.
const occupied = realmsById.get('triarchie');
for (const origin of ['aldingen', 'iathneach']) {
  const realm = realmsById.get(origin);
  const originals = occupied.territories.filter(t => t.originRealm === origin);
  const ids = new Map(originals.map(t => [t.id, `${origin}-ehemalig-${t.id}`]));
  for (const t of originals) {
    const region = occupied.regions.find(r => r.id === t.sourceId);
    const formerRuler = region?.formerHouseId ? realm.housesById.get(region.formerHouseId)
      : t.level === 'region' ? occupied.houses.find(h => h.regionId === t.sourceId && h.rankId === 'county') : null;
    const copy = { ...t, id: ids.get(t.id), realmId: origin, parentId: ids.get(t.parentId) || realm.rootId,
      name: t.level === 'region' ? `${t.name.startsWith('Grafschaft') ? 'Ehemalige' : 'Ehemaliges'} ${t.name}`
        : `Ehemalige Herrschaft ${occupied.settlementsById.get(t.sourceId)?.regionName || t.seat}`,
      type: 'Ehemaliges Herrschaftsgebiet', historical: true, occupied: true, sourceRealmId: 'triarchie',
      controlId: t.id, controlHref: t.href,
      href: `/Kontinente/${realm.continent}/${realm.name}/ehemalige-gebiete/${t.id}/index.html`,
      ...(formerRuler ? { rulerId: formerRuler.id, familyId: formerRuler.familyId, house: houseTitle(formerRuler), crest: formerRuler.crest } : {}) };
    realm.territories.push(copy); realm.territoriesById.set(copy.id, copy);
  }
}
export const allHouses = realms.flatMap(realm => realm.houses.map(house => ({ ...house, realmId: realm.id })));
export const housesByFamilyId = new Map(allHouses.map(house => [house.familyId, house]));
