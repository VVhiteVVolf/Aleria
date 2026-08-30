import { createHouseProfileFromFolderPath } from '../domain/house-profile.js';
import {
  LEITHEACH_HOUSE_EMBLEMS,
  LEITHEACH_HOUSE_PROFILES,
  LEITHEACH_MANAGED_PROFILE_FIELDS,
  LEITHEACH_REGION_EMBLEMS
} from './leitheach-house-profiles.js';

const TERRITORY = 'Tir na Sruth';
const AIRGID_REALM = 'Lehensherrschaft der Tir An’Airgid';

export { LEITHEACH_MANAGED_PROFILE_FIELDS as TIR_NA_SRUTH_MANAGED_PROFILE_FIELDS };

export const TIR_NA_SRUTH_HOUSE_EMBLEMS = Object.freeze({
  'tir-an-cuinn': LEITHEACH_HOUSE_EMBLEMS['tir-an-cuinn'],
  airgid: 'assets/images/houses/Leitheach/clan-tir-an-airgid.png',
  amrhan: 'assets/images/houses/Leitheach/clan-ua-amrhan.png'
});

export const TIR_NA_SRUTH_REGION_EMBLEMS = Object.freeze({
  [AIRGID_REALM]: 'assets/images/regions/Leitheach/lehensherrschaft-tir-an-airgid.png'
});

export const TIR_NA_SRUTH_HOUSE_DEFINITIONS = Object.freeze([
  Object.freeze({
    slug: 'tir-an-cuinn',
    primaryHouseId: 'house-cuinn',
    title: 'Clan Tir An’Cuinn',
    rankId: 'mor-tiarna',
    seat: 'Ceanntire',
    liegeHouseId: 'haus-mac-ard-cumhaill',
    liegeHouseName: 'Clan Mac Ard Cumhaill',
    directBarony: true,
    administrativeRole: 'Mor Tiarna von Tir na Sruth'
  }),
  Object.freeze({
    slug: 'airgid',
    primaryHouseId: 'house-airgid',
    title: 'Tir An’Airgid',
    rankId: 'dun-tiarna',
    realm: AIRGID_REALM,
    seat: 'Cel Leagan',
    liegeHouseId: 'haus-tir-an-cuinn',
    liegeHouseName: 'Clan Tir An’Cuinn',
    legacyTitles: Object.freeze(['Haus Airgid', "Tir An'Airgid"]),
    administrativeRole: 'Dún Tiarna der Lehensherrschaft Tir An’Airgid'
  }),
  Object.freeze({
    slug: 'amrhan',
    primaryHouseId: 'house-amrhan',
    title: 'Ua’Amhran',
    rankId: 'laird',
    seat: 'Ceanntire',
    liegeHouseId: 'haus-tir-an-cuinn',
    liegeHouseName: 'Clan Tir An’Cuinn',
    legacyTitles: Object.freeze(['Haus Amrhan', "Ua'Amrhan"]),
    administrativeRole: 'Laird in Ceanntire'
  })
]);

function createTirNaSruthHouseProfile(definition) {
  // Tir An’Cuinn bleibt das eine territoriale Profil des Leitheach-Katalogs.
  if (definition.slug === 'tir-an-cuinn') return LEITHEACH_HOUSE_PROFILES['tir-an-cuinn'];

  const territoryEmblem = LEITHEACH_REGION_EMBLEMS.territories[TERRITORY];
  const realmEmblem = definition.realm
    ? TIR_NA_SRUTH_REGION_EMBLEMS[definition.realm]
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

export const TIR_NA_SRUTH_HOUSE_PROFILES = Object.freeze(Object.fromEntries(
  TIR_NA_SRUTH_HOUSE_DEFINITIONS.map(definition => [
    definition.slug,
    createTirNaSruthHouseProfile(definition)
  ])
));
