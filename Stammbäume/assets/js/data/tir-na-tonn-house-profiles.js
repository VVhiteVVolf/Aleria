import { createHouseProfileFromFolderPath } from '../domain/house-profile.js';
import {
  LEITHEACH_HOUSE_EMBLEMS,
  LEITHEACH_HOUSE_PROFILES,
  LEITHEACH_MANAGED_PROFILE_FIELDS,
  LEITHEACH_REGION_EMBLEMS
} from './leitheach-house-profiles.js';

const TERRITORY = 'Tir na Tonn';
const RUITHEACH_REALM = 'Herrschaft der Dál’Ruitheach';
const GORTACH_REALM = 'Herrschaft der Ru’Gortach';

export { LEITHEACH_MANAGED_PROFILE_FIELDS as TIR_NA_TONN_MANAGED_PROFILE_FIELDS };

export const TIR_NA_TONN_HOUSE_EMBLEMS = Object.freeze({
  'fir-an-tarvo': LEITHEACH_HOUSE_EMBLEMS['fir-an-tarvo'],
  ruitheach: 'assets/images/houses/Leitheach/clan-dal-ruitheach.png',
  gortach: 'assets/images/houses/Leitheach/clan-ru-gortach.png'
});

export const TIR_NA_TONN_REGION_EMBLEMS = Object.freeze({
  [RUITHEACH_REALM]: 'assets/images/regions/Leitheach/herrschaft-dal-ruitheach.png',
  [GORTACH_REALM]: 'assets/images/regions/Leitheach/herrschaft-ru-gortach.png'
});

export const TIR_NA_TONN_HOUSE_DEFINITIONS = Object.freeze([
  Object.freeze({
    slug: 'fir-an-tarvo',
    primaryHouseId: 'house-tarvo',
    title: 'Clan Fir An’Tarvo',
    rankId: 'mor-tiarna',
    seat: 'Dun Rothar',
    liegeHouseId: 'haus-mac-ard-cumhaill',
    liegeHouseName: 'Clan Mac Ard Cumhaill',
    directBarony: true,
    administrativeRole: 'Mor Tiarna von Tir na Tonn'
  }),
  Object.freeze({
    slug: 'ruitheach',
    primaryHouseId: 'house-ruitheach',
    title: 'Dál’Ruitheach',
    rankId: 'laird',
    realm: RUITHEACH_REALM,
    seat: 'Broch an Iar',
    liegeHouseId: 'haus-fir-an-tarvo',
    liegeHouseName: 'Clan Fir An’Tarvo',
    legacyTitles: Object.freeze(['Haus Ruitheach', "Dal'Ruitheach"]),
    administrativeRole: 'Laird der Herrschaft Dál’Ruitheach'
  }),
  Object.freeze({
    slug: 'gortach',
    primaryHouseId: 'house-gortach',
    title: 'Ru’Gortach',
    rankId: 'laird',
    realm: GORTACH_REALM,
    seat: 'Broch an Ear',
    liegeHouseId: 'haus-fir-an-tarvo',
    liegeHouseName: 'Clan Fir An’Tarvo',
    legacyTitles: Object.freeze(['Haus Gortach', "Ru'Gortach"]),
    administrativeRole: 'Laird der Herrschaft Ru’Gortach'
  })
]);

function createTirNaTonnHouseProfile(definition) {
  // Fir An’Tarvo bleibt das eine territoriale Profil aus dem Leitheach-Katalog.
  // Dadurch führt die regionale Vertiefung keine zweite Hausakte ein.
  if (definition.slug === 'fir-an-tarvo') return LEITHEACH_HOUSE_PROFILES['fir-an-tarvo'];

  const territoryEmblem = LEITHEACH_REGION_EMBLEMS.territories[TERRITORY];
  const realmEmblem = TIR_NA_TONN_REGION_EMBLEMS[definition.realm];
  const profile = createHouseProfileFromFolderPath([
    'Leitheach',
    TERRITORY,
    definition.realm,
    definition.seat
  ], {
    rankId: definition.rankId,
    liegeHouseId: definition.liegeHouseId,
    liegeHouseName: definition.liegeHouseName,
    folderIcons: [
      LEITHEACH_REGION_EMBLEMS.principality,
      territoryEmblem,
      realmEmblem,
      ''
    ],
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

export const TIR_NA_TONN_HOUSE_PROFILES = Object.freeze(Object.fromEntries(
  TIR_NA_TONN_HOUSE_DEFINITIONS.map(definition => [
    definition.slug,
    createTirNaTonnHouseProfile(definition)
  ])
));
