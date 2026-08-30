import { createHouseProfileFromFolderPath } from '../domain/house-profile.js';
import {
  LEITHEACH_MANAGED_PROFILE_FIELDS,
  LEITHEACH_REGION_EMBLEMS
} from './leitheach-house-profiles.js';

const TERRITORY = 'Tir na Sinsear';
const GALLCHOBHAIR_REALM = 'Lehnsherrschaft der Fir An’Gallchobhair';
const NA_MHUIR_REALM = 'Tir na Fancha';

export { LEITHEACH_MANAGED_PROFILE_FIELDS as TIR_NA_SINSEAR_MANAGED_PROFILE_FIELDS };

export const TIR_NA_SINSEAR_HOUSE_EMBLEMS = Object.freeze({
  gallchobhair: 'assets/images/houses/Leitheach/clan-fir-an-gallchobhair.png',
  cleir: 'assets/images/houses/Leitheach/clan-ua-cleir.png',
  ghaiscioch: 'assets/images/houses/Leitheach/clan-ua-ghaiscioch.png',
  'dal-ceardaiocht': 'assets/images/houses/Leitheach/clan-dal-ceardaiocht.png',
  'na-mhuir': 'assets/images/houses/Leitheach/clan-na-mhuir.png',
  gruenhand: 'assets/images/houses/Leitheach/sept-gruenhand-aus-leith.png'
});

export const TIR_NA_SINSEAR_REGION_EMBLEMS = Object.freeze({
  'Tir na Fancha': 'assets/images/regions/Leitheach/tir-na-fancha.png'
});

export const TIR_NA_SINSEAR_HOUSE_DEFINITIONS = Object.freeze([
  Object.freeze({
    slug: 'gallchobhair',
    title: 'Fir An’Gallchobhair',
    rankId: 'dun-tiarna',
    realm: GALLCHOBHAIR_REALM,
    seat: 'Dun Laog',
    liegeHouseId: 'haus-ua-gaelach',
    liegeHouseName: 'Clan Ua’Gaelach'
  }),
  Object.freeze({
    slug: 'cleir',
    title: 'Clan Ua’Cleir',
    rankId: 'laird',
    realm: GALLCHOBHAIR_REALM,
    seat: 'Dun Laog',
    liegeHouseId: 'haus-gallchobhair',
    liegeHouseName: 'Fir An’Gallchobhair'
  }),
  Object.freeze({
    slug: 'ghaiscioch',
    title: 'Clan Ua’Ghaiscíoch',
    rankId: 'laird',
    realm: GALLCHOBHAIR_REALM,
    seat: 'Dun Laog',
    liegeHouseId: 'haus-gallchobhair',
    liegeHouseName: 'Fir An’Gallchobhair'
  }),
  Object.freeze({
    slug: 'dal-ceardaiocht',
    title: 'Clan Dál’Ceardaíocht',
    rankId: 'laird',
    realm: GALLCHOBHAIR_REALM,
    seat: 'Dun Laog',
    liegeHouseId: 'haus-gallchobhair',
    liegeHouseName: 'Fir An’Gallchobhair'
  }),
  Object.freeze({
    slug: 'na-mhuir',
    title: 'Clan Na’Mhuir',
    rankId: 'laird',
    realm: NA_MHUIR_REALM,
    seat: 'Broch an Coill',
    secondarySeats: Object.freeze(['Broch an Abhainn']),
    liegeHouseId: 'haus-ua-gaelach',
    liegeHouseName: 'Clan Ua’Gaelach',
    sourceSeatDiscrepancy: 'Die Familienübersicht nennt Broch an Abhainn; die ausführlichere Herrschaftsübersicht nennt Broch an Coill als Sitz.'
  }),
  Object.freeze({
    slug: 'gruenhand',
    title: 'Sept Grünhand aus Leith',
    rankId: 'sept-head',
    realm: NA_MHUIR_REALM,
    seat: 'Broch an Coill',
    liegeHouseId: 'haus-na-mhuir',
    liegeHouseName: 'Clan Na’Mhuir'
  })
]);

function createTirNaSinsearHouseProfile(definition) {
  const territoryEmblem = LEITHEACH_REGION_EMBLEMS.territories[TERRITORY];
  const realmEmblem = definition.realm === GALLCHOBHAIR_REALM
    ? TIR_NA_SINSEAR_HOUSE_EMBLEMS.gallchobhair
    : TIR_NA_SINSEAR_REGION_EMBLEMS[definition.realm] || '';
  const profile = createHouseProfileFromFolderPath([
    'Leitheach',
    TERRITORY,
    definition.realm,
    definition.seat
  ], {
    rankId: definition.rankId,
    secondarySeats: definition.secondarySeats || [],
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

export const TIR_NA_SINSEAR_HOUSE_PROFILES = Object.freeze(Object.fromEntries(
  TIR_NA_SINSEAR_HOUSE_DEFINITIONS.map(definition => [
    definition.slug,
    createTirNaSinsearHouseProfile(definition)
  ])
));
