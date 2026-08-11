import { createHouseProfileFromFolderPath } from '../domain/house-profile.js';
import {
  ALDRIMAR_HOUSE_PROFILES,
  ALDRIMAR_REGION_EMBLEMS
} from './aldrimar-house-profiles.js';

export const RORIKSHEIM_REGION_EMBLEMS = Object.freeze({
  rorikstal: 'assets/images/regions/aldrimar-rorikstal.png',
  winterfaenge: 'assets/images/regions/aldrimar-winterfaenge.png',
  schwerthohn: 'assets/images/regions/aldrimar-schwerthohn.png',
  schwarzacker: 'assets/images/regions/aldrimar-schwarzacker.png',
  daemmergrund: 'assets/images/regions/aldrimar-daemmergrund.png',
  daemmertal: 'assets/images/regions/aldrimar-daemmertal.png',
  skaldenheim: 'assets/images/regions/aldrimar-skaldenheim.png',
  city: 'assets/images/regions/aldrimar-roriksheim-stadt.png'
});

const HOUSE_ROOT = 'assets/images/houses/Aldrimar/Roriksheim';

export const RORIKSHEIM_HOUSE_EMBLEMS = Object.freeze({
  freiwinter: `${HOUSE_ROOT}/clan-freiwinter.png`,
  vangandr: `${HOUSE_ROOT}/clan-vangandr.png`,
  skaal: `${HOUSE_ROOT}/clan-skaal.png`,
  brathfengr: `${HOUSE_ROOT}/clan-brathfengr.png`,
  schwarzdorn: `${HOUSE_ROOT}/clan-schwarzdorn.png`,
  kampfgeborene: `${HOUSE_ROOT}/clan-kampfgeborene.png`,
  frostgeborene: `${HOUSE_ROOT}/haus-frostgeborene.png`,
  nachtjaeger: `${HOUSE_ROOT}/clan-nachtjaeger.png`,
  skjegg: `${HOUSE_ROOT}/clan-skjegg.png`,
  sterkr: `${HOUSE_ROOT}/clan-sterkr.png`,
  soekeren: `${HOUSE_ROOT}/clan-soekeren.png`,
  skald: `${HOUSE_ROOT}/clan-skald.png`,
  gruenklang: `${HOUSE_ROOT}/clan-gruenklang.png`,
  flammenschritt: `${HOUSE_ROOT}/clan-flammenschritt.png`,
  runensaenger: `${HOUSE_ROOT}/clan-runensaenger.png`,
  sturmsaenger: `${HOUSE_ROOT}/clan-sturmsaenger.png`,
  liedtrinker: `${HOUSE_ROOT}/clan-liedtrinker.png`,
  spottzunge: `${HOUSE_ROOT}/clan-spottzunge.png`,
  eisenjungfer: `${HOUSE_ROOT}/clan-eisenjungfer.png`,
  blutdorn: `${HOUSE_ROOT}/clan-blutdorn.png`,
  dornacker: `${HOUSE_ROOT}/clan-dornacker.png`,
  baerenherz: `${HOUSE_ROOT}/clan-baerenherz.png`,
  kraehenrufer: `${HOUSE_ROOT}/clan-kraehenrufer.png`,
  unholdbann: `${HOUSE_ROOT}/clan-unholdbann.png`,
  rotstahl: `${HOUSE_ROOT}/clan-rotstahl.png`,
  bogenhand: `${HOUSE_ROOT}/clan-bogenhand.png`,
  ulvasar: `${HOUSE_ROOT}/clan-ulvasar.png`,
  bjornskar: `${HOUSE_ROOT}/clan-bjornskar.png`,
  vanir: `${HOUSE_ROOT}/clan-vanir.png`,
  tiogar: `${HOUSE_ROOT}/clan-tiogar.png`,
  fiadhrach: `${HOUSE_ROOT}/clan-fiadhrach.png`
});

function createRoriksheimProfile({
  path,
  rankId,
  liegeHouseId = '',
  liegeHouseName = '',
  secondarySeats = [],
  baronyEmblem = '',
  seatEmblem = RORIKSHEIM_REGION_EMBLEMS.city
}) {
  return createHouseProfileFromFolderPath(path, {
    rankId,
    liegeHouseId,
    liegeHouseName,
    secondarySeats,
    regionEmblems: {
      kingdom: ALDRIMAR_REGION_EMBLEMS.aldrimar,
      county: ALDRIMAR_REGION_EMBLEMS.roriksheim,
      barony: baronyEmblem,
      seat: seatEmblem
    }
  });
}

const VARULV_LIEGE = Object.freeze({
  liegeHouseId: 'house-varulv',
  liegeHouseName: 'Clan Varulv'
});

const BRATHFENGR_LIEGE = Object.freeze({
  liegeHouseId: 'house-brathfengr',
  liegeHouseName: 'Clan Brathfengr'
});

const SKALD_LIEGE = Object.freeze({
  liegeHouseId: 'house-skald',
  liegeHouseName: 'Clan Skald'
});

const VANGANDR_LIEGE = Object.freeze({
  liegeHouseId: 'house-vangandr',
  liegeHouseName: 'Clan Vangandr'
});

const SKAAL_LIEGE = Object.freeze({
  liegeHouseId: 'house-skaal',
  liegeHouseName: 'Clan Skaal'
});

const KLANGHEIM_HUSKARL_SLUGS = Object.freeze([
  'gruenklang',
  'flammenschritt',
  'runensaenger',
  'sturmsaenger',
  'liedtrinker',
  'spottzunge',
  'eisenjungfer'
]);

const RORIKSHALL_HUSKARL_SLUGS = Object.freeze([
  'blutdorn',
  'dornacker',
  'baerenherz',
  'kraehenrufer',
  'unholdbann',
  'rotstahl',
  'bogenhand'
]);

const HUSKARL_PROFILES = Object.freeze(Object.fromEntries([
  ...KLANGHEIM_HUSKARL_SLUGS.map(slug => [slug, createRoriksheimProfile({
    path: ['Aldrimar', 'Roriksheim', 'Skaldenheim', 'Klangheim'],
    rankId: 'huskarl',
    ...BRATHFENGR_LIEGE,
    baronyEmblem: RORIKSHEIM_REGION_EMBLEMS.skaldenheim
  })]),
  ...RORIKSHALL_HUSKARL_SLUGS.map(slug => [slug, createRoriksheimProfile({
    path: ['Aldrimar', 'Roriksheim', 'Rorikstal', 'Rorikshall'],
    rankId: 'huskarl',
    ...VARULV_LIEGE,
    baronyEmblem: RORIKSHEIM_REGION_EMBLEMS.rorikstal
  })])
]));

function extinctCultureProfile(culture, secondarySeats = []) {
  const cultureFolder = culture === 'Norrnaigh'
    ? 'Norrnaigh (Nordmänner)'
    : 'Glaennath (Alben)';
  return createRoriksheimProfile({
    path: ['Aldrimar', 'Roriksheim', 'Ausgestorbene Clans', cultureFolder],
    rankId: 'unknown',
    secondarySeats,
    seatEmblem: ''
  });
}

export const RORIKSHEIM_HOUSE_PROFILES = Object.freeze({
  varulv: ALDRIMAR_HOUSE_PROFILES.varulv,
  schwarzdorn: createRoriksheimProfile({
    path: ['Aldrimar', 'Roriksheim', 'Rorikstal', 'Rorikshall'],
    rankId: 'hesire',
    ...VARULV_LIEGE,
    baronyEmblem: RORIKSHEIM_REGION_EMBLEMS.rorikstal
  }),
  kampfgeborene: createRoriksheimProfile({
    path: ['Aldrimar', 'Roriksheim', 'Rorikstal', 'Rorikshall'],
    rankId: 'hesire',
    ...VARULV_LIEGE,
    baronyEmblem: RORIKSHEIM_REGION_EMBLEMS.rorikstal
  }),
  frostgeborene: createRoriksheimProfile({
    path: ['Aldrimar', 'Roriksheim', 'Rorikstal', 'Rorikshall'],
    rankId: 'commoner',
    baronyEmblem: RORIKSHEIM_REGION_EMBLEMS.rorikstal
  }),
  brathfengr: createRoriksheimProfile({
    path: ['Aldrimar', 'Roriksheim', 'Skaldenheim', 'Klangheim'],
    rankId: 'thane',
    ...VARULV_LIEGE,
    baronyEmblem: RORIKSHEIM_REGION_EMBLEMS.skaldenheim
  }),
  sterkr: createRoriksheimProfile({
    path: ['Aldrimar', 'Roriksheim', 'Skaldenheim', 'Klangheim'],
    rankId: 'hesire',
    ...BRATHFENGR_LIEGE,
    baronyEmblem: RORIKSHEIM_REGION_EMBLEMS.skaldenheim
  }),
  soekeren: createRoriksheimProfile({
    path: ['Aldrimar', 'Roriksheim', 'Skaldenheim', 'Klangheim'],
    rankId: 'hesire',
    ...BRATHFENGR_LIEGE,
    baronyEmblem: RORIKSHEIM_REGION_EMBLEMS.skaldenheim
  }),
  skald: createRoriksheimProfile({
    path: ['Aldrimar', 'Roriksheim', 'Skaldenheim', 'Klangheim'],
    rankId: 'hesire',
    ...BRATHFENGR_LIEGE,
    baronyEmblem: RORIKSHEIM_REGION_EMBLEMS.skaldenheim
  }),
  ...HUSKARL_PROFILES,
  eisenjungfer: createRoriksheimProfile({
    path: ['Aldrimar', 'Roriksheim', 'Skaldenheim', 'Klangheim'],
    rankId: 'huskarl',
    ...SKALD_LIEGE,
    secondarySeats: ['Forsthain'],
    baronyEmblem: RORIKSHEIM_REGION_EMBLEMS.skaldenheim
  }),
  vangandr: createRoriksheimProfile({
    path: ['Aldrimar', 'Roriksheim', 'Dämmergrund', 'Wolfspfad'],
    rankId: 'thane',
    ...VARULV_LIEGE,
    baronyEmblem: RORIKSHEIM_REGION_EMBLEMS.daemmergrund
  }),
  nachtjaeger: createRoriksheimProfile({
    path: ['Aldrimar', 'Roriksheim', 'Dämmergrund', 'Dämmertal', 'Horunn'],
    rankId: 'hesire',
    ...VANGANDR_LIEGE,
    baronyEmblem: RORIKSHEIM_REGION_EMBLEMS.daemmergrund,
    seatEmblem: RORIKSHEIM_REGION_EMBLEMS.daemmertal
  }),
  skaal: createRoriksheimProfile({
    path: ['Aldrimar', 'Roriksheim', 'Schwerthohn', 'Schwertfall'],
    rankId: 'thane',
    ...VARULV_LIEGE,
    baronyEmblem: RORIKSHEIM_REGION_EMBLEMS.schwerthohn
  }),
  skjegg: createRoriksheimProfile({
    path: ['Aldrimar', 'Roriksheim', 'Schwarzacker', 'Grabesruh'],
    rankId: 'hesire',
    ...SKAAL_LIEGE,
    secondarySeats: ['Klangheim'],
    baronyEmblem: RORIKSHEIM_REGION_EMBLEMS.schwarzacker
  }),
  freiwinter: createRoriksheimProfile({
    path: ['Aldrimar', 'Roriksheim', 'Rorikstal', 'Winterfänge', 'Wolfswacht'],
    rankId: 'hesire',
    ...VARULV_LIEGE,
    baronyEmblem: RORIKSHEIM_REGION_EMBLEMS.rorikstal
  }),
  ulvasar: extinctCultureProfile('Norrnaigh'),
  bjornskar: extinctCultureProfile('Norrnaigh'),
  vanir: extinctCultureProfile('Norrnaigh', ['Connair bei Wolfspfad']),
  tiogar: extinctCultureProfile('Glaennath', ['Tigairan bei Rorikshall']),
  fiadhrach: extinctCultureProfile('Glaennath', ['Connair bei Wolfspfad'])
});
