import { createHouseProfileFromFolderPath } from '../domain/house-profile.js';

export const CEITHEACH_MANAGED_PROFILE_FIELDS = Object.freeze([
  'rankId',
  'seat',
  'barony',
  'county',
  'kingdom',
  'secondarySeats',
  'liegeHouseId',
  'liegeHouseName',
  'folderIcons',
  'regionEmblems'
]);

export const CEITHEACH_REGION_EMBLEMS = Object.freeze({
  ceitheach: 'assets/images/regions/Ceitheach/ceitheach.png',
  tirNaCruach: 'assets/images/regions/Ceitheach/tir-na-cruach.png',
  tirNaScian: 'assets/images/regions/Ceitheach/tir-na-scian.png',
  tirNaDorcha: 'assets/images/regions/Ceitheach/tir-na-dorcha.png',
  tirNaDun: 'assets/images/regions/Ceitheach/tir-na-dun.png',
  tirNaCeo: 'assets/images/regions/Ceitheach/tir-na-ceo.png',
  tirNaToraidh: 'assets/images/regions/Ceitheach/tir-na-toraidh.png'
});

export const CEITHEACH_HOUSE_EMBLEMS = Object.freeze({
  'ui-rochraide': 'assets/images/houses/Ceitheach/clan-ui-rochraide.png',
  'nic-blar': 'assets/images/houses/Ceitheach/clan-nic-blar.png',
  'mac-tuirseach': 'assets/images/houses/Ceitheach/clan-mac-tuirseach.png',
  'dal-leite': 'assets/images/houses/Ceitheach/clan-dal-leite.png',
  'nic-holloran': 'assets/images/houses/Ceitheach/clan-nic-holloran.png',
  'ua-nic-ceinselaig': 'assets/images/houses/Ceitheach/clan-ua-nic-ceinselaig.png'
});

export const CEITHEACH_CLAN_DEFINITIONS = Object.freeze([
  Object.freeze({
    slug: 'ui-rochraide',
    primaryHouseId: 'house-rochraide',
    title: 'Clan Ui’Rochraide',
    territory: 'Tir na Cruach',
    territoryGloss: 'Land des Berges',
    territoryEmblem: CEITHEACH_REGION_EMBLEMS.tirNaCruach,
    seat: 'Carraigreach',
    rankId: 'ard-tiarna'
  }),
  Object.freeze({
    slug: 'nic-blar',
    primaryHouseId: 'house-nic-blar',
    title: 'Clan Nic Blar',
    territory: 'Tir na Scian',
    territoryGloss: 'Land der Heldinnen',
    territoryEmblem: CEITHEACH_REGION_EMBLEMS.tirNaScian,
    seat: 'Lochcoille',
    rankId: 'mor-tiarna'
  }),
  Object.freeze({
    slug: 'mac-tuirseach',
    primaryHouseId: 'house-mac-tuirseach',
    title: 'Clan Mac Tuirseach',
    territory: 'Tir na Dorcha',
    territoryGloss: 'Land der Hügel',
    territoryEmblem: CEITHEACH_REGION_EMBLEMS.tirNaDorcha,
    seat: 'Lochanach',
    rankId: 'mor-tiarna'
  }),
  Object.freeze({
    slug: 'dal-leite',
    primaryHouseId: 'house-dal-leite',
    title: 'Clan Dal’Leite',
    territory: 'Tir na Dun',
    territoryGloss: 'Land der Festungen',
    territoryEmblem: CEITHEACH_REGION_EMBLEMS.tirNaDun,
    seat: 'Greinmhar',
    rankId: 'mor-tiarna'
  }),
  Object.freeze({
    slug: 'nic-holloran',
    primaryHouseId: 'house-nic-holloran',
    title: 'Clan Nic Holloran',
    territory: 'Tir na Ceo',
    territoryGloss: 'Land des Nebels',
    territoryEmblem: CEITHEACH_REGION_EMBLEMS.tirNaCeo,
    seat: 'Tirscath',
    rankId: 'mor-tiarna'
  }),
  Object.freeze({
    slug: 'ua-nic-ceinselaig',
    primaryHouseId: 'house-ua-nic-ceinselaig',
    title: 'Clan Ua Nic Ceinselaig',
    territory: 'Tir na Toraidh',
    territoryGloss: 'Land der Jäger',
    territoryEmblem: CEITHEACH_REGION_EMBLEMS.tirNaToraidh,
    seat: 'Bruachan',
    rankId: 'mor-tiarna'
  })
]);

function createCeitheachClanProfile(definition) {
  return createHouseProfileFromFolderPath(['Ceitheach', definition.territory], {
    rankId: definition.rankId,
    seat: definition.seat,
    ...(definition.rankId === 'ard-tiarna'
      ? {}
      : {
          liegeHouseId: 'haus-ui-rochraide',
          liegeHouseName: 'Clan Ui’Rochraide'
        }),
    folderIcons: [CEITHEACH_REGION_EMBLEMS.ceitheach, definition.territoryEmblem, ''],
    regionEmblems: {
      kingdom: CEITHEACH_REGION_EMBLEMS.ceitheach,
      county: definition.territoryEmblem,
      barony: '',
      seat: ''
    }
  });
}

const clanProfiles = Object.fromEntries(CEITHEACH_CLAN_DEFINITIONS.map(definition => [
  definition.slug,
  createCeitheachClanProfile(definition)
]));

export const CEITHEACH_HOUSE_PROFILES = Object.freeze({
  ...clanProfiles,
  daire: createHouseProfileFromFolderPath(
    ['Ceitheach', 'Tir na Dorcha', 'Tír na Droma', 'Tulachinis'],
    {
      rankId: 'commoner',
      liegeHouseId: 'haus-mac-tuirseach',
      liegeHouseName: 'Clan Mac Tuirseach',
      folderIcons: [
        CEITHEACH_REGION_EMBLEMS.ceitheach,
        CEITHEACH_REGION_EMBLEMS.tirNaDorcha,
        '',
        ''
      ],
      regionEmblems: {
        kingdom: CEITHEACH_REGION_EMBLEMS.ceitheach,
        county: CEITHEACH_REGION_EMBLEMS.tirNaDorcha,
        barony: '',
        seat: ''
      }
    }
  )
});
