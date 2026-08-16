import { createHouseProfileFromFolderPath } from '../domain/house-profile.js';
import {
  ALDRIMAR_HOUSE_EMBLEMS,
  ALDRIMAR_HOUSE_PROFILES,
  ALDRIMAR_REGION_EMBLEMS
} from './aldrimar-house-profiles.js';

const SCHWARZFENN_ROOT = Object.freeze(['Aldrimar', 'Schwarzfenn']);
const WOLFSKLAMM_PATH = Object.freeze([...SCHWARZFENN_ROOT, 'Wolfsfenn', 'Wolfsklamm']);
const FLUSSWALL_PATH = Object.freeze([...SCHWARZFENN_ROOT, 'Flussblick', 'Flusswall']);
const DUNKELMOOR_PATH = Object.freeze([...SCHWARZFENN_ROOT, 'Todesfenn', 'Dunkelmoor']);
const HALLSVALR_PATH = Object.freeze([...SCHWARZFENN_ROOT, 'Todesfenn', 'Hallsvalr']);
const FINSTERMOOR_PATH = Object.freeze([...SCHWARZFENN_ROOT, 'Lichtfenn', 'Finstermoor']);
const TRAUERWALD_PATH = Object.freeze([...SCHWARZFENN_ROOT, 'Gramfenn', 'Trauerwald']);
const EXTINCT_ROOT = Object.freeze([...SCHWARZFENN_ROOT, 'Ausgestorbene Clans']);

export const SCHWARZFENN_EXTINCT_HOUSE_GROUPS = Object.freeze({
  norrnaigh: 'Norrnaigh (Nordmänner)',
  aldrimar: 'Aldrimarer (jüngst ausradiert)',
  crannath: 'Antike Crannath Clans'
});

export const SCHWARZFENN_REGION_EMBLEMS = Object.freeze({
  wolfsfenn: 'assets/images/regions/aldrimar-schwarzfenn-wolfsfenn.png',
  flussblick: 'assets/images/regions/aldrimar-schwarzfenn-flussblick.png',
  todesfenn: 'assets/images/regions/aldrimar-schwarzfenn-todesfenn.png',
  lichtfenn: 'assets/images/regions/aldrimar-schwarzfenn-lichtfenn.png',
  gramfenn: 'assets/images/regions/aldrimar-schwarzfenn-gramfenn.png',
  city: 'assets/images/regions/aldrimar-stadt.png',
  extinct: 'assets/images/regions/Cenyr/Ährental/Ausgestorben.png'
});

const HOUSE_ROOT = 'assets/images/houses/Aldrimar/Schwarzfenn';

export const SCHWARZFENN_HOUSE_EMBLEMS = Object.freeze({
  ragnulf: ALDRIMAR_HOUSE_EMBLEMS.ragnulf,
  helgr: `${HOUSE_ROOT}/clan-helgr.png`,
  kummerherz: `${HOUSE_ROOT}/clan-kummerherz.png`,
  todbrand: `${HOUSE_ROOT}/clan-todbrand.png`,
  eisbrand: `${HOUSE_ROOT}/clan-eisbrand.png`,
  graumahne: `${HOUSE_ROOT}/clan-graumahne.png`,
  schmetterschild: `${HOUSE_ROOT}/clan-schmetterschild.png`,
  hrafn: `${HOUSE_ROOT}/clan-hrafn.png`,
  arnvild: `${HOUSE_ROOT}/clan-arnvild.png`,
  svartholmr: `${HOUSE_ROOT}/clan-svartholmr.png`,
  'mac-bronaigh': `${HOUSE_ROOT}/clan-mac-bronaigh.png`
});

function freezeProfile(profile) {
  return Object.freeze({
    ...profile,
    secondarySeats: Object.freeze([...profile.secondarySeats]),
    ...(profile.folderPath ? { folderPath: Object.freeze([...profile.folderPath]) } : {}),
    regionEmblems: Object.freeze({ ...profile.regionEmblems })
  });
}

function schwarzfennProfile(rankId, path, options = {}) {
  return freezeProfile(createHouseProfileFromFolderPath(path, {
    rankId,
    liegeHouseId: options.liegeHouseId === undefined ? 'house-ragnulf' : options.liegeHouseId,
    liegeHouseName: options.liegeHouseName === undefined ? 'Clan Ragnulf' : options.liegeHouseName,
    secondarySeats: options.secondarySeats || [],
    regionEmblems: {
      kingdom: ALDRIMAR_REGION_EMBLEMS.aldrimar,
      county: ALDRIMAR_REGION_EMBLEMS.schwarzfenn,
      barony: options.baronyEmblem || '',
      seat: options.seatEmblem || SCHWARZFENN_REGION_EMBLEMS.city
    }
  }));
}

function extinctProfile(group, place, rankId = 'unknown') {
  return schwarzfennProfile(rankId, [...EXTINCT_ROOT, group], {
    liegeHouseId: '',
    liegeHouseName: '',
    secondarySeats: [place],
    baronyEmblem: SCHWARZFENN_REGION_EMBLEMS.extinct,
    seatEmblem: SCHWARZFENN_REGION_EMBLEMS.extinct
  });
}

export const SCHWARZFENN_HOUSE_PROFILES = Object.freeze({
  ragnulf: ALDRIMAR_HOUSE_PROFILES.ragnulf,
  helgr: schwarzfennProfile('thane', FINSTERMOOR_PATH, {
    baronyEmblem: SCHWARZFENN_REGION_EMBLEMS.lichtfenn
  }),
  kummerherz: schwarzfennProfile('thane', TRAUERWALD_PATH, {
    baronyEmblem: SCHWARZFENN_REGION_EMBLEMS.gramfenn
  }),
  todbrand: schwarzfennProfile('thane', DUNKELMOOR_PATH, {
    baronyEmblem: SCHWARZFENN_REGION_EMBLEMS.todesfenn
  }),
  eisbrand: schwarzfennProfile('commoner', HALLSVALR_PATH, {
    liegeHouseId: '',
    liegeHouseName: '',
    baronyEmblem: SCHWARZFENN_REGION_EMBLEMS.todesfenn
  }),
  graumahne: schwarzfennProfile('hesire', WOLFSKLAMM_PATH, {
    baronyEmblem: SCHWARZFENN_REGION_EMBLEMS.wolfsfenn
  }),
  schmetterschild: schwarzfennProfile('hesire', WOLFSKLAMM_PATH, {
    baronyEmblem: SCHWARZFENN_REGION_EMBLEMS.wolfsfenn
  }),
  hrafn: schwarzfennProfile('hesire', FLUSSWALL_PATH, {
    baronyEmblem: SCHWARZFENN_REGION_EMBLEMS.flussblick
  }),
  arnvild: extinctProfile(SCHWARZFENN_EXTINCT_HOUSE_GROUPS.aldrimar, 'Flusswall', 'hesire'),
  svartholmr: extinctProfile(SCHWARZFENN_EXTINCT_HOUSE_GROUPS.norrnaigh, 'Stornborg'),
  'mac-bronaigh': extinctProfile(SCHWARZFENN_EXTINCT_HOUSE_GROUPS.crannath, 'Coil na Bróin')
});
