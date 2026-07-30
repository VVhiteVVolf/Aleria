import { createHouseProfileFromFolderPath } from '../domain/house-profile.js';

const COUNTY_PATH = Object.freeze(['Cenyr', 'Vortigerns Ruh']);
const CALON_PATH = Object.freeze([...COUNTY_PATH, 'Uthers Aufstieg', 'Calon']);
const MATHRAGON_PATH = Object.freeze([...COUNTY_PATH, 'Tanwens Flamme', 'Mathragon']);
const ANCIENT_CALON_PATH = Object.freeze([...COUNTY_PATH, 'Antike Häuser', 'Antikes Calon']);

export const VORTIGERNS_RUH_REGION_EMBLEMS = Object.freeze({
  kingdom: 'assets/images/regions/koenigreich-cenyr.png',
  county: 'assets/images/regions/vortigerns-ruh.png',
  baronies: Object.freeze({
    'Uthers Aufstieg': 'assets/images/regions/Cenyr/Vortigerns Ruh/Uthers Aufstieg.png',
    'Tanwens Flamme': 'assets/images/regions/Cenyr/Vortigerns Ruh/Tanwens Flamme.png',
    'Antike Häuser': 'assets/images/regions/AntikeIcon.png'
  }),
  seats: Object.freeze({
    Calon: 'assets/images/regions/Cenyr/Vortigerns Ruh/Calon.png',
    Mathragon: 'assets/images/regions/Cenyr/Vortigerns Ruh/Mathragon.png',
    'Antikes Calon': 'assets/images/regions/AntikeIcon.png'
  })
});

export const VORTIGERNS_RUH_HOUSE_EMBLEMS = Object.freeze({
  pendrag: 'assets/images/houses/Vortigerns Ruh/haus-pendrag.png',
  ceirwyn: 'assets/images/houses/Vortigerns Ruh/Uthers Aufstieg/haus-ceirwyn.png',
  cath: 'assets/images/houses/Vortigerns Ruh/Tanwens Flamme/haus-cath.png',
  grael: 'assets/images/houses/Vortigerns Ruh/Tanwens Flamme/haus-grael.png',
  penderyn: 'assets/images/houses/Vortigerns Ruh/Tanwens Flamme/haus-penderyn.png',
  dienyddiwr: 'assets/images/houses/Vortigerns Ruh/Tanwens Flamme/haus-dienyddiwr.png',
  dyngwn: 'assets/images/houses/Vortigerns Ruh/Tanwens Flamme/haus-dyngwn.png',
  marwolaeth: 'assets/images/houses/Vortigerns Ruh/Tanwens Flamme/haus-marwolaeth.png',
  morwyn: 'assets/images/houses/Vortigerns Ruh/Tanwens Flamme/haus-morwyn.png',
  rhavaen: 'assets/images/houses/Vortigerns Ruh/Tanwens Flamme/haus-rhavaen.png',
  iwrell: 'assets/images/houses/Vortigerns Ruh/Tanwens Flamme/haus-iwrell.png',
  oenfyr: 'assets/images/houses/Vortigerns Ruh/Tanwens Flamme/haus-oenfyr.png',
  saivor: 'assets/images/houses/Vortigerns Ruh/Tanwens Flamme/haus-saivor.png',
  ynllym: 'assets/images/houses/Vortigerns Ruh/Tanwens Flamme/haus-ynllym.png',
  cyfrif: 'assets/images/houses/Vortigerns Ruh/Tanwens Flamme/haus-cyfrif.png',
  fiachraoin: 'assets/images/houses/Vortigerns Ruh/Antike Häuser/clan-fiachraoin.png'
});

function profile(rankId, folderPath, options = {}) {
  const barony = folderPath[2];
  const seat = folderPath[3];
  const result = createHouseProfileFromFolderPath(folderPath, {
    rankId,
    liegeHouseId: options.liegeHouseId || '',
    liegeHouseName: options.liegeHouseName || '',
    secondarySeats: options.secondarySeats || [],
    regionEmblems: {
      kingdom: VORTIGERNS_RUH_REGION_EMBLEMS.kingdom,
      county: VORTIGERNS_RUH_REGION_EMBLEMS.county,
      barony: VORTIGERNS_RUH_REGION_EMBLEMS.baronies[barony] || '',
      seat: VORTIGERNS_RUH_REGION_EMBLEMS.seats[seat] || ''
    }
  });
  return Object.freeze({
    ...result,
    secondarySeats: Object.freeze([...result.secondarySeats]),
    regionEmblems: Object.freeze({ ...result.regionEmblems })
  });
}

function pendragVassalProfile(rankId) {
  return profile(rankId, MATHRAGON_PATH, {
    liegeHouseId: 'haus-pendrag',
    liegeHouseName: 'Haus Pendrag'
  });
}

export const VORTIGERNS_RUH_HOUSE_PROFILES = Object.freeze({
  pendrag: profile('royal', MATHRAGON_PATH),
  ceirwyn: profile('barony', CALON_PATH, {
    liegeHouseId: 'haus-pendrag',
    liegeHouseName: 'Haus Pendrag'
  }),
  cath: pendragVassalProfile('knight-prince'),
  grael: pendragVassalProfile('knight-prince'),
  penderyn: pendragVassalProfile('knight-prince'),
  dienyddiwr: pendragVassalProfile('knight-prince'),
  dyngwn: pendragVassalProfile('knight-prince'),
  marwolaeth: pendragVassalProfile('knight-prince'),
  morwyn: pendragVassalProfile('knight'),
  rhavaen: pendragVassalProfile('knight'),
  iwrell: pendragVassalProfile('knight'),
  oenfyr: pendragVassalProfile('knight'),
  saivor: pendragVassalProfile('knight'),
  ynllym: pendragVassalProfile('knight'),
  cyfrif: pendragVassalProfile('commoner'),
  // Fiachraoin wird als historischer, vor der heutigen Baronieordnung liegender Clan
  // geführt. Der Ruinenpfad macht ihn sichtbar vom modernen Calon unterscheidbar.
  fiachraoin: profile('dun-tiarna', ANCIENT_CALON_PATH)
});
