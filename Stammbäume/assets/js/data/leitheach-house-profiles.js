import { createHouseProfileFromFolderPath } from '../domain/house-profile.js';

export const LEITHEACH_MANAGED_PROFILE_FIELDS = Object.freeze([
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

export const LEITHEACH_REGION_EMBLEMS = Object.freeze({
  principality: 'assets/images/regions/Leitheach/leitheach.png',
  territories: Object.freeze({
    'Tir na Sleagh': 'assets/images/regions/Leitheach/tir-na-sleagh.png',
    'Tir na Sinsear': 'assets/images/regions/Leitheach/tir-na-sinsear.png',
    'Tir na Gortanna': 'assets/images/regions/Leitheach/tir-na-gortanna.png',
    'Tir na Tonn': 'assets/images/regions/Leitheach/tir-na-tonn.png',
    'Tir an Comhchuibhis': 'assets/images/regions/Leitheach/tir-na-comhchuibhis.png',
    'Tir na Sruth': 'assets/images/regions/Leitheach/tir-na-sruth.png'
  })
});

export const LEITHEACH_HOUSE_EMBLEMS = Object.freeze({
  'mac-ard-cumhaill': 'assets/images/houses/Leitheach/clan-mac-ard-cumhaill.png',
  'ua-gaelach': 'assets/images/houses/Leitheach/clan-ua-gaelach.png',
  'dal-cruthin': 'assets/images/houses/Leitheach/clan-dal-cruthin.png',
  'fir-an-tarvo': 'assets/images/houses/Leitheach/clan-fir-an-tarvo.png',
  'mac-airt': 'assets/images/houses/Leitheach/clan-mac-airt.png',
  'tir-an-cuinn': 'assets/images/houses/Leitheach/clan-tir-an-cuinn.png'
});

export const LEITHEACH_CADET_HOUSE_EMBLEMS = Object.freeze({
  'ua-eirce': 'assets/images/houses/Leitheach/clan-ua-eirce.png',
  'ruin-ua-laoch': 'assets/images/houses/Leitheach/clan-ruin-ua-laoch.png'
});

export const LEITHEACH_LAIRD_HOUSE_EMBLEMS = Object.freeze({
  'ua-eirce': LEITHEACH_CADET_HOUSE_EMBLEMS['ua-eirce'],
  'ui-fiachrach': 'assets/images/houses/Leitheach/clan-ui-fiachrach.png',
  'ruin-ua-laoch': LEITHEACH_CADET_HOUSE_EMBLEMS['ruin-ua-laoch']
});

const LEITHEACH_LAIRD_HOUSE_DEFINITIONS = Object.freeze([
  Object.freeze({ slug: 'ua-eirce', title: 'Clan Ua’Eirce' }),
  Object.freeze({ slug: 'ui-fiachrach', title: 'Clan Uí Fiachrach' }),
  Object.freeze({ slug: 'ruin-ua-laoch', title: 'Ruin Ua Laoch' })
]);

function createLeitheachLairdHouseProfile() {
  return createHouseProfileFromFolderPath(['Leitheach', 'Tir na Sleagh'], {
    rankId: 'laird',
    liegeHouseId: 'haus-mac-ard-cumhaill',
    liegeHouseName: 'Clan Mac Ard Cumhaill',
    folderIcons: [
      LEITHEACH_REGION_EMBLEMS.principality,
      LEITHEACH_REGION_EMBLEMS.territories['Tir na Sleagh'],
      ''
    ],
    regionEmblems: {
      kingdom: LEITHEACH_REGION_EMBLEMS.principality,
      county: LEITHEACH_REGION_EMBLEMS.territories['Tir na Sleagh'],
      barony: '',
      seat: ''
    }
  });
}

export const LEITHEACH_LAIRD_HOUSE_PROFILES = Object.freeze(Object.fromEntries(
  LEITHEACH_LAIRD_HOUSE_DEFINITIONS.map(definition => [
    definition.slug,
    createLeitheachLairdHouseProfile(definition)
  ])
));

export const LEITHEACH_CLAN_DEFINITIONS = Object.freeze([
  Object.freeze({
    slug: 'mac-ard-cumhaill',
    title: 'Clan Mac Ard Cumhaill',
    territory: 'Tir na Sleagh',
    territoryGloss: 'Land der Speere',
    seat: 'Dun Athar',
    rankId: 'ard-tiarna'
  }),
  Object.freeze({
    slug: 'ua-gaelach',
    title: 'Clan Ua’Gaelach',
    territory: 'Tir na Sinsear',
    territoryGloss: 'Land der Ahnen',
    seat: 'Nossail',
    rankId: 'mor-tiarna'
  }),
  Object.freeze({
    slug: 'dal-cruthin',
    title: 'Clan Dál’Cruthin',
    territory: 'Tir na Gortanna',
    territoryGloss: 'Land der Felder',
    seat: 'Lochansail',
    rankId: 'mor-tiarna'
  }),
  Object.freeze({
    slug: 'fir-an-tarvo',
    title: 'Clan Fir An’Tarvo',
    territory: 'Tir na Tonn',
    territoryGloss: 'Land der Wellen',
    seat: 'Dun Rothar',
    rankId: 'mor-tiarna'
  }),
  Object.freeze({
    slug: 'mac-airt',
    title: 'Clan Mac Airt',
    territory: 'Tir an Comhchuibhis',
    territoryGloss: 'Land der Harmonie',
    seat: 'Sruthlann',
    rankId: 'mor-tiarna'
  }),
  Object.freeze({
    slug: 'tir-an-cuinn',
    title: 'Clan Tir An’Cuinn',
    territory: 'Tir na Sruth',
    territoryGloss: 'Land des Stroms',
    seat: 'Ceanntire',
    rankId: 'mor-tiarna'
  })
]);

function createLeitheachClanProfile(definition) {
  const territoryEmblem = LEITHEACH_REGION_EMBLEMS.territories[definition.territory];
  return createHouseProfileFromFolderPath(['Leitheach', definition.territory], {
    rankId: definition.rankId,
    seat: definition.seat,
    ...(definition.rankId === 'ard-tiarna'
      ? {}
      : {
          liegeHouseId: 'haus-mac-ard-cumhaill',
          liegeHouseName: 'Clan Mac Ard Cumhaill'
        }),
    folderIcons: [
      LEITHEACH_REGION_EMBLEMS.principality,
      territoryEmblem,
      ''
    ],
    regionEmblems: {
      kingdom: LEITHEACH_REGION_EMBLEMS.principality,
      county: territoryEmblem,
      barony: '',
      seat: ''
    }
  });
}

export const LEITHEACH_HOUSE_PROFILES = Object.freeze(Object.fromEntries(
  LEITHEACH_CLAN_DEFINITIONS.map(definition => [
    definition.slug,
    createLeitheachClanProfile(definition)
  ])
));
