import { allHouses, realmsById, houseTitle } from '../../../../shared/accepted-realms/catalog.mjs';
import { housePlacement } from '../../../../shared/accepted-realms/house-placement.mjs';
import { createBlankHouseFamily } from './blank-house-family-factory.js';
import { normalizeHouseProfile } from '../domain/house-profile.js';

const existing = new Set(['haus-sonnenfels', 'haus-weinlaub']);
export const ACCEPTED_REALM_FAMILIES = Object.freeze(allHouses.filter(h => !existing.has(h.familyId)).map(house => {
  const realm = realmsById.get(house.realmId);
  const placement = housePlacement(realm, house);
  const profile = normalizeHouseProfile(placement);
  const family = createBlankHouseFamily({ id: house.familyId, title: houseTitle(house),
    emblem: house.crest.replace(/^\/Stammbäume\//, ''), houseProfile: profile,
    description: `${houseTitle(house)} · ${house.rank} · ${placement.seat}. Familienakte mit bestätigter örtlicher Zuordnung; Genealogie noch offen.` });
  return Object.freeze({ ...family,
    houses: family.houses.map(h => ({ ...h, id: house.houseId })),
    lineage: { ...family.lineage, houseId: house.houseId, crestFrame: ['junker', 'ministerial', 'laird'].includes(house.rankId) ? 'silver' : 'gold' },
    extensions: { ...family.extensions, sourceRevision: 1, acceptedRealm: realm.id, acceptedOn: '2026-10-28',
      territorialSource: `shared/accepted-realms/data/${realm.id}.source.json`,
      historicalJurisdiction: !!realm.historical, occupiedHomeland: !!realm.occupied,
      identityReferences: house.identityReferences || [] },
  });
}));

const legacy = new Map(allHouses.filter(h => existing.has(h.familyId)).map(h => [h.familyId, h]));
const rodenRealm = realmsById.get('goldmund');
const rodenPlacement = housePlacement(rodenRealm, rodenRealm.housesById.get('roden'));
// Existing entities retain their owners, IDs, relationships and edited biographies.
export function withAcceptedRealmPlacement(family) {
  const house = legacy.get(family.document.id);
  const unlocatedGoldmund = family.document.id === 'haus-von-hochreuth';
  if (!house && !unlocatedGoldmund) return family;
  const placement = unlocatedGoldmund
    ? { ...rodenPlacement, rankId: 'ministerial', seat: 'Burg Hochreuth', liegeHouseId: 'house-roden', liegeHouseName: 'Haus Roden' }
    : housePlacement(realmsById.get(house.realmId), house);
  const revision = unlocatedGoldmund ? 8 : 4;
  const fields = Object.keys(placement);
  return Object.freeze({ ...family, document: { ...family.document,
    houseProfile: { ...family.document.houseProfile, ...placement } },
    extensions: { ...family.extensions, sourceRevision: Math.max(revision, family.extensions?.sourceRevision || 0), registryManagedEntitySourceRevision: 1,
      registryManagedHouseProfileFields: [...new Set([...(family.extensions?.registryManagedHouseProfileFields || []), ...fields])],
      registryManagedHouseProfileFieldRevisions: { ...family.extensions?.registryManagedHouseProfileFieldRevisions, ...Object.fromEntries(fields.map(field => [field, revision])) },
      registryManagedRecordFields: [...new Set([...(family.extensions?.registryManagedRecordFields || []), 'folderPath'])],
      acceptedRealmPlacement: 1 } });
}

export const ACCEPTED_REALM_FOLDERS = Object.freeze([...new Map(allHouses.map(house => {
  const realm = realmsById.get(house.realmId), profile = housePlacement(realm, house);
  return [JSON.stringify(profile.folderPath), { path: profile.folderPath, icon: profile.folderIcons.at(-1),
    description: `${profile.seat} · ${realmsById.get(house.originRealm)?.name || realm.name}${realm.historical ? ' · historische Ordnung' : realm.occupied ? ' · besetzte Heimat' : ''}`,
    searchTerms: [profile.seat, houseTitle(house)], plannedHouses: [] }];
})).values()]);
