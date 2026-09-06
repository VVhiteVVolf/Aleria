import { createHouseProfileFromFolderPath } from '../domain/house-profile.js';
import {
  ALDRIMAR_HOUSE_EMBLEMS,
  ALDRIMAR_HOUSE_PROFILES,
  ALDRIMAR_REGION_EMBLEMS
} from './aldrimar-house-profiles.js';

const KRAEHENMOOR_ROOT = Object.freeze(['Aldrimar', 'Krähenmoor']);
const MOORTAL_PATH = Object.freeze([
  ...KRAEHENMOOR_ROOT,
  'Jarltümliche Herrschaft von Nebelmoor',
  'Moortal'
]);
const RABENFURT_PATH = Object.freeze([
  ...KRAEHENMOOR_ROOT,
  'Thanentum Rabenweide',
  'Rabenfurt'
]);
const RABENHAIN_PATH = Object.freeze([
  ...KRAEHENMOOR_ROOT,
  'Thanentum Rabenweide',
  'Rabenforst',
  'Rabenhain'
]);
const SILBERQUELL_PATH = Object.freeze([
  ...KRAEHENMOOR_ROOT,
  'Thanentum Schimmerküste',
  'Silberquell'
]);
const NEBELWACHT_PATH = Object.freeze([
  ...KRAEHENMOOR_ROOT,
  'Hesirentum von Schwarzfjord',
  'Nebelwacht'
]);
const ELDVIK_PATH = Object.freeze([
  ...KRAEHENMOOR_ROOT,
  'Hesirentum von Schwarzfjord',
  'Eldvik'
]);
const EXTINCT_ROOT = Object.freeze([...KRAEHENMOOR_ROOT, 'Ausgestorbene Clans']);

export const KRAEHENMOOR_EXTINCT_CLAN_GROUPS = Object.freeze({
  norrnaigh: 'Norrnaigh (Nordmänner)',
  glaennath: 'Glaennath (Alben)'
});

export const KRAEHENMOOR_REGION_EMBLEMS = Object.freeze({
  nebelmoor: 'assets/images/regions/aldrimar-kraehenmoor-nebelmoor.png',
  rabenweide: 'assets/images/regions/aldrimar-kraehenmoor-rabenweide.png',
  rabenforst: 'assets/images/regions/aldrimar-kraehenmoor-rabenforst.png',
  rabenhain: 'assets/images/regions/aldrimar-kraehenmoor-rabenhain.png',
  schimmerkueste: 'assets/images/regions/aldrimar-kraehenmoor-schimmerkueste.png',
  schwarzfjord: 'assets/images/regions/aldrimar-kraehenmoor-schwarzfjord.png',
  city: 'assets/images/regions/aldrimar-stadt.png',
  extinct: 'assets/images/regions/Cenyr/Ährental/Ausgestorben.png'
});

const HOUSE_ROOT = 'assets/images/houses/Aldrimar/Kraehenmoor';

export const KRAEHENMOOR_HOUSE_EMBLEMS = Object.freeze({
  varangr: ALDRIMAR_HOUSE_EMBLEMS.varangr,
  schattenherz: `${HOUSE_ROOT}/clan-schattenherz.png`,
  blutstahl: `${HOUSE_ROOT}/clan-blutstahl.png`,
  silberblut: `${HOUSE_ROOT}/clan-silberblut.png`,
  kaltherz: `${HOUSE_ROOT}/clan-kaltherz.png`,
  feuerherz: `${HOUSE_ROOT}/clan-feuerherz.png`,
  vragi: `${HOUSE_ROOT}/clan-vragi.png`,
  schwarzblut: `${HOUSE_ROOT}/clan-schwarzblut.png`,
  schwarzstolz: `${HOUSE_ROOT}/clan-schwarzstolz.png`,
  goldglanz: `${HOUSE_ROOT}/clan-goldglanz.png`,
  goldschwur: `${HOUSE_ROOT}/clan-goldschwur.png`,
  goldhand: `${HOUSE_ROOT}/clan-goldhand.png`,
  guldskar: `${HOUSE_ROOT}/clan-guldskar.png`,
  aurangr: `${HOUSE_ROOT}/clan-aurangr.png`,
  fenngrim: `${HOUSE_ROOT}/clan-fenngrim.png`,
  brackwasser: `${HOUSE_ROOT}/clan-brackwasser.png`,
  sumpfgeborener: `${HOUSE_ROOT}/clan-sumpfgeborener.png`,
  helmyr: `${HOUSE_ROOT}/clan-helmyr.png`,
  taufwolf: `${HOUSE_ROOT}/clan-taufwolf.png`,
  myrskarn: `${HOUSE_ROOT}/clan-myrskarn.png`,
  goldzunge: `${HOUSE_ROOT}/clan-goldzunge.png`,
  hjerte: `${HOUSE_ROOT}/clan-hjerte.png`,
  jaernblod: `${HOUSE_ROOT}/clan-jaernblod.png`,
  kaldhrafn: `${HOUSE_ROOT}/clan-kaldhrafn.png`,
  'mac-morfhia': `${HOUSE_ROOT}/clan-mac-morfhia.png`,
  'mac-corcaigh': `${HOUSE_ROOT}/clan-mac-corcaigh.png`
});

const VARANGR_LIEGE = Object.freeze({
  liegeHouseId: 'house-varangr',
  liegeHouseName: 'Clan Varangr'
});

function freezeProfile(profile) {
  return Object.freeze({
    ...profile,
    secondarySeats: Object.freeze([...profile.secondarySeats]),
    ...(profile.folderPath ? { folderPath: Object.freeze([...profile.folderPath]) } : {}),
    ...(profile.folderIcons ? { folderIcons: Object.freeze([...profile.folderIcons]) } : {}),
    ...(profile.liegeHouses
      ? { liegeHouses: Object.freeze(profile.liegeHouses.map(entry => Object.freeze({ ...entry }))) }
      : {}),
    regionEmblems: Object.freeze({ ...profile.regionEmblems })
  });
}

function kraehenmoorProfile(rankId, path, options = {}) {
  return freezeProfile(createHouseProfileFromFolderPath(path, {
    rankId,
    liegeHouseId: options.liegeHouseId === undefined
      ? VARANGR_LIEGE.liegeHouseId
      : options.liegeHouseId,
    liegeHouseName: options.liegeHouseName === undefined
      ? VARANGR_LIEGE.liegeHouseName
      : options.liegeHouseName,
    ...(options.liegeHouses ? { liegeHouses: options.liegeHouses } : {}),
    secondarySeats: options.secondarySeats || [],
    ...(options.folderIcons ? { folderIcons: options.folderIcons } : {}),
    regionEmblems: {
      kingdom: ALDRIMAR_REGION_EMBLEMS.aldrimar,
      county: ALDRIMAR_REGION_EMBLEMS.kraehenmoor,
      barony: options.baronyEmblem || '',
      seat: options.seatEmblem || KRAEHENMOOR_REGION_EMBLEMS.city
    }
  }));
}

function extinctProfile(group, rankId = 'unknown', options = {}) {
  return kraehenmoorProfile(rankId, [...EXTINCT_ROOT, group], {
    liegeHouseId: '',
    liegeHouseName: '',
    secondarySeats: options.secondarySeats || [],
    baronyEmblem: KRAEHENMOOR_REGION_EMBLEMS.extinct,
    seatEmblem: KRAEHENMOOR_REGION_EMBLEMS.extinct
  });
}

const MOORTAL_HUSKARL_LIEGES = Object.freeze({
  goldschwur: VARANGR_LIEGE,
  goldhand: VARANGR_LIEGE,
  guldskar: VARANGR_LIEGE,
  aurangr: VARANGR_LIEGE,
  fenngrim: Object.freeze({ liegeHouseId: 'house-feuerherz', liegeHouseName: 'Clan Feuerherz' }),
  brackwasser: Object.freeze({ liegeHouseId: 'house-feuerherz', liegeHouseName: 'Clan Feuerherz' }),
  sumpfgeborener: Object.freeze({ liegeHouseId: 'house-feuerherz', liegeHouseName: 'Clan Feuerherz' }),
  helmyr: Object.freeze({ liegeHouseId: 'house-kaltherz', liegeHouseName: 'Clan Kaltherz' }),
  taufwolf: Object.freeze({ liegeHouseId: 'house-kaltherz', liegeHouseName: 'Clan Kaltherz' }),
  myrskarn: Object.freeze({ liegeHouseId: 'house-kaltherz', liegeHouseName: 'Clan Kaltherz' })
});

const MOORTAL_HUSKARL_PROFILES = Object.freeze(Object.fromEntries(
  Object.entries(MOORTAL_HUSKARL_LIEGES).map(([slug, liege]) => [slug, kraehenmoorProfile(
    'huskarl',
    MOORTAL_PATH,
    {
      ...liege,
      baronyEmblem: KRAEHENMOOR_REGION_EMBLEMS.nebelmoor
    }
  )])
));

export const KRAEHENMOOR_HOUSE_PROFILES = Object.freeze({
  varangr: ALDRIMAR_HOUSE_PROFILES.varangr,
  schattenherz: kraehenmoorProfile('thane', RABENFURT_PATH, {
    baronyEmblem: KRAEHENMOOR_REGION_EMBLEMS.rabenweide
  }),
  blutstahl: kraehenmoorProfile('thane', SILBERQUELL_PATH, {
    baronyEmblem: KRAEHENMOOR_REGION_EMBLEMS.schimmerkueste
  }),
  silberblut: kraehenmoorProfile('thane', SILBERQUELL_PATH, {
    baronyEmblem: KRAEHENMOOR_REGION_EMBLEMS.schimmerkueste
  }),
  kaltherz: kraehenmoorProfile('hesire', MOORTAL_PATH, {
    baronyEmblem: KRAEHENMOOR_REGION_EMBLEMS.nebelmoor
  }),
  feuerherz: kraehenmoorProfile('hesire', MOORTAL_PATH, {
    baronyEmblem: KRAEHENMOOR_REGION_EMBLEMS.nebelmoor
  }),
  vragi: kraehenmoorProfile('hesire', RABENHAIN_PATH, {
    liegeHouseId: 'house-schattenherz',
    liegeHouseName: 'Clan Schattenherz',
    folderIcons: [
      ALDRIMAR_REGION_EMBLEMS.aldrimar,
      ALDRIMAR_REGION_EMBLEMS.kraehenmoor,
      KRAEHENMOOR_REGION_EMBLEMS.rabenweide,
      KRAEHENMOOR_REGION_EMBLEMS.rabenforst,
      KRAEHENMOOR_REGION_EMBLEMS.rabenhain
    ],
    baronyEmblem: KRAEHENMOOR_REGION_EMBLEMS.rabenweide,
    seatEmblem: KRAEHENMOOR_REGION_EMBLEMS.rabenhain
  }),
  schwarzblut: kraehenmoorProfile('hesire', NEBELWACHT_PATH, {
    baronyEmblem: KRAEHENMOOR_REGION_EMBLEMS.schwarzfjord
  }),
  schwarzstolz: kraehenmoorProfile('unknown', ELDVIK_PATH, {
    liegeHouseId: '',
    liegeHouseName: '',
    baronyEmblem: KRAEHENMOOR_REGION_EMBLEMS.schwarzfjord
  }),
  goldglanz: kraehenmoorProfile('hesire', SILBERQUELL_PATH, {
    liegeHouseId: 'house-blutstahl',
    liegeHouseName: 'Clan Blutstahl',
    liegeHouses: [
      { id: 'house-blutstahl', name: 'Clan Blutstahl' },
      { id: 'house-silberblut', name: 'Clan Silberblut' }
    ],
    baronyEmblem: KRAEHENMOOR_REGION_EMBLEMS.schimmerkueste
  }),
  ...MOORTAL_HUSKARL_PROFILES,
  goldzunge: kraehenmoorProfile('commoner', MOORTAL_PATH, {
    liegeHouseId: '',
    liegeHouseName: '',
    baronyEmblem: KRAEHENMOOR_REGION_EMBLEMS.nebelmoor
  }),
  hjerte: extinctProfile(KRAEHENMOOR_EXTINCT_CLAN_GROUPS.norrnaigh, 'thane'),
  jaernblod: extinctProfile(KRAEHENMOOR_EXTINCT_CLAN_GROUPS.norrnaigh, 'thane', {
    secondarySeats: ['Silberquell']
  }),
  kaldhrafn: extinctProfile(KRAEHENMOOR_EXTINCT_CLAN_GROUPS.norrnaigh),
  'mac-morfhia': extinctProfile(KRAEHENMOOR_EXTINCT_CLAN_GROUPS.glaennath, 'unknown', {
    secondarySeats: ['Silberquell']
  }),
  'mac-corcaigh': extinctProfile(KRAEHENMOOR_EXTINCT_CLAN_GROUPS.glaennath, 'unknown', {
    secondarySeats: ['Moortal']
  })
});
