import structure from './uathneach-territories.source.json' with { type: 'json' };
import { reviewedFiefs, applyFiefReview } from '../modules/albic-territories/fief-catalog.js';

// The accepted territorial structure is shared by maps, pages and family files.
// Geographical map colour and feudal allegiance are deliberately separate.
export { structure };
export const realmPath = '/Kontinente/Estryll/Fürstentum Uathneach/';
export const clansById = new Map(structure.clans.map(clan => [clan.id, clan]));
export const settlementsById = new Map(structure.settlements.map(place => [place.id, place]));
export const regionsById = new Map(structure.regions.map(region => [region.id, region]));
export const familyHref = clan => `/Stammbäume/Stammbaum.html?family=${clan.familyId}&mode=view`;
export const houseHref = clan => `/Familien Häuser und Clans/kleinehaeuser.html?haus=${encodeURIComponent(clan.familyId)}`;

const root = { id: structure.realm.id, name: 'Fürstentum Uathneach', type: 'Fürstentum', parentId: '',
  rulerId: structure.realm.rulerId, banner: structure.realm.banner, href: realmPath + 'Fürstentum Uathneach.html' };
const regions = structure.regions.map(region => ({ ...region,
  type: region.key === 'laimhe' ? 'Fürstliche Domäne' : 'Oberherrschaft', parentId: root.id,
  // Public routes and identifiers survive a change to the displayed name.
  href: realmPath + (region.routeName || region.name) + '/' + (region.routeName || region.name) + '.html' }));
const fiefs = structure.clans.filter(clan => clan.territoryId !== clan.regionId).map(clan => {
  const seat = settlementsById.get(clan.seat), parent = regions.find(region => region.id === clan.regionId);
  const review = reviewedFiefs.find(fief => fief.id === clan.territoryId);
  if (!review) throw new Error(`Ungeprüftes Uathneach-Lehen: ${clan.territoryId}`);
  // The five existing town routes are public URLs. New fiefs use their proper name.
  const routeName = clan.rankId === 'dun-tiarna' ? `Herrschaft von ${seat.name}` : review.name;
  return applyFiefReview({ id: clan.territoryId, name: review.name, type: 'Herrschaft',
    parentId: parent.id, rulerId: clan.id, banner: '',
    href: realmPath + (parent.routeName || parent.name) + '/' + routeName + '/' + routeName + '.html' });
});
export const territories = [root, ...regions, ...fiefs].map(territory => {
  const clan = clansById.get(territory.rulerId);
  return Object.freeze({ ...territory, familyId: clan.familyId, house: clan.name,
    seat: settlementsById.get(clan.seat).name, crest: clan.crest,
    bannerAlt: territory.banner ? `Banner ${territory.name}` : '', mapId: 'uathneach' });
});
export const territoriesById = new Map(territories.map(territory => [territory.id, territory]));

export function territoryAncestors(territory) {
  const chain = [], visited = new Set();
  for (let entry = territory; entry; entry = territoriesById.get(entry.parentId)) {
    if (visited.has(entry.id)) throw new Error(`Kreiszuordnung: ${entry.id}`);
    visited.add(entry.id);
    chain.unshift(entry);
  }
  return chain;
}
