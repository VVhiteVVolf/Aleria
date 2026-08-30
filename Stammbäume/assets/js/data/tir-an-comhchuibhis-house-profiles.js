import {
  createHouseProfileFromFolderPath
} from '../domain/house-profile.js';
import {
  CEITHEACH_HOUSE_EMBLEMS,
  CEITHEACH_REGION_EMBLEMS
} from './ceitheach-house-profiles.js';
import {
  LEITHEACH_HOUSE_EMBLEMS,
  LEITHEACH_HOUSE_PROFILES,
  LEITHEACH_MANAGED_PROFILE_FIELDS,
  LEITHEACH_REGION_EMBLEMS
} from './leitheach-house-profiles.js';

const TERRITORY = 'Tir an Comhchuibhis';
const CHOINNICH_REALM = 'Herrschaft der Ua’Choinnich';
const NIC_BLAR_REALM = 'Herrschaft der Nic’Blar';
const LAIDIR_REALM = 'Lehensherrschaft der Ruin’Laidir';

export { LEITHEACH_MANAGED_PROFILE_FIELDS as TIR_AN_COMHCHUIBHIS_MANAGED_PROFILE_FIELDS };

export const TIR_AN_COMHCHUIBHIS_HOUSE_EMBLEMS = Object.freeze({
  'mac-airt': LEITHEACH_HOUSE_EMBLEMS['mac-airt'],
  choinnich: 'assets/images/houses/Leitheach/clan-ua-choinnich.png',
  'nic-blar': CEITHEACH_HOUSE_EMBLEMS['nic-blar'],
  laidir: 'assets/images/houses/Leitheach/clan-ruin-laidir.png',
  'dal-t-saor': 'assets/images/houses/Leitheach/clan-dal-t-saor.png'
});

export const TIR_AN_COMHCHUIBHIS_REGION_EMBLEMS = Object.freeze({
  [CHOINNICH_REALM]: 'assets/images/regions/Leitheach/herrschaft-ua-choinnich.png',
  [NIC_BLAR_REALM]: 'assets/images/regions/Leitheach/herrschaft-nic-blar.png',
  [LAIDIR_REALM]: 'assets/images/regions/Leitheach/lehensherrschaft-ruin-laidir.png'
});

export const NIC_BLAR_CEITHEACH_ORIGIN = Object.freeze({
  principality: 'Ceitheach',
  territory: 'Tir na Scian',
  territoryGloss: 'Land der Heldinnen',
  seat: 'Lochcoille',
  principalityEmblem: CEITHEACH_REGION_EMBLEMS.ceitheach,
  territoryEmblem: CEITHEACH_REGION_EMBLEMS.tirNaScian
});

export const TIR_AN_COMHCHUIBHIS_HOUSE_DEFINITIONS = Object.freeze([
  Object.freeze({
    slug: 'mac-airt',
    primaryHouseId: 'house-mac-airt',
    title: 'Clan Mac Airt',
    rankId: 'mor-tiarna',
    seat: 'Sruthlann',
    liegeHouseId: 'haus-mac-ard-cumhaill',
    liegeHouseName: 'Clan Mac Ard Cumhaill',
    directBarony: true,
    administrativeRole: 'Mor Tiarna von Tir an Comhchuibhis'
  }),
  Object.freeze({
    slug: 'choinnich',
    primaryHouseId: 'house-choinnich',
    title: 'Ua’Choinnich',
    rankId: 'laird',
    seat: 'Sruthlann',
    liegeHouseId: 'haus-mac-airt',
    liegeHouseName: 'Clan Mac Airt',
    legacyTitles: Object.freeze(['Haus Choinnich', "Ua'Choinnich"]),
    administrativeRole: 'Laird in Sruthlann'
  }),
  Object.freeze({
    slug: 'nic-blar',
    familyId: 'haus-nic-blar-leitheach',
    primaryHouseId: 'house-nic-blar',
    title: 'Clan Nic Blar',
    regionalTitle: 'Nic’Blar',
    rankId: 'laird',
    seat: 'Sruthlann',
    liegeHouseId: 'haus-mac-airt',
    liegeHouseName: 'Clan Mac Airt',
    origin: NIC_BLAR_CEITHEACH_ORIGIN,
    legacyTitles: Object.freeze(["Nic'Blar"]),
    administrativeRole: 'Laird in Sruthlann'
  }),
  Object.freeze({
    slug: 'laidir',
    primaryHouseId: 'house-laidir',
    title: 'Ruin’Laidir',
    rankId: 'dun-tiarna',
    realm: LAIDIR_REALM,
    seat: 'Claisean',
    liegeHouseId: 'haus-mac-airt',
    liegeHouseName: 'Clan Mac Airt',
    legacyTitles: Object.freeze(['Haus Laidir', "Ruin'Laidir"]),
    administrativeRole: 'Dún Tiarna der Lehensherrschaft der Ruin’Laidir'
  }),
  Object.freeze({
    slug: 'dal-t-saor',
    primaryHouseId: 'house-dal-t-saor',
    title: 'Dal T’Saor',
    rankId: 'laird',
    seat: 'Sruthlann',
    liegeHouseId: 'haus-mac-airt',
    liegeHouseName: 'Clan Mac Airt',
    extinct: true,
    legacyTitles: Object.freeze(["Dal T'Saor"]),
    administrativeRole: 'Erloschener ehemaliger Laird aus Sruthlann'
  })
]);

function createTirAnComhchuibhisHouseProfile(definition) {
  // Mac Airt bleibt das eine territoriale Profil des Leitheach-Gesamtkatalogs.
  if (definition.slug === 'mac-airt') return LEITHEACH_HOUSE_PROFILES['mac-airt'];

  const territoryEmblem = LEITHEACH_REGION_EMBLEMS.territories[TERRITORY];
  const realmEmblem = definition.realm
    ? TIR_AN_COMHCHUIBHIS_REGION_EMBLEMS[definition.realm]
    : '';
  const folderPath = definition.realm
    ? ['Leitheach', TERRITORY, definition.realm, definition.seat]
    : ['Leitheach', TERRITORY];
  const profile = createHouseProfileFromFolderPath(folderPath, {
    rankId: definition.rankId,
    seat: definition.seat,
    liegeHouseId: definition.liegeHouseId,
    liegeHouseName: definition.liegeHouseName,
    folderIcons: definition.realm
      ? [LEITHEACH_REGION_EMBLEMS.principality, territoryEmblem, realmEmblem, '']
      : [LEITHEACH_REGION_EMBLEMS.principality, territoryEmblem, ''],
    regionEmblems: {
      kingdom: LEITHEACH_REGION_EMBLEMS.principality,
      county: territoryEmblem,
      barony: realmEmblem,
      seat: ''
    }
  });

  return Object.freeze({
    ...profile,
    secondarySeats: Object.freeze([...profile.secondarySeats]),
    folderIcons: Object.freeze([...profile.folderIcons]),
    regionEmblems: Object.freeze({ ...profile.regionEmblems })
  });
}

export const TIR_AN_COMHCHUIBHIS_HOUSE_PROFILES = Object.freeze(Object.fromEntries(
  TIR_AN_COMHCHUIBHIS_HOUSE_DEFINITIONS.map(definition => [
    definition.slug,
    createTirAnComhchuibhisHouseProfile(definition)
  ])
));
