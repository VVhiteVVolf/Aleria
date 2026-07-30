import { createHouseProfileFromFolderPath } from '../domain/house-profile.js';

const COUNTY_PATH = Object.freeze(['Cenyr', 'Sonnenküste']);
const ABERON_PATH = Object.freeze([...COUNTY_PATH, 'Gersteküste', 'Aberon']);
const CAER_LLEW_PATH = Object.freeze([...COUNTY_PATH, 'Löwenberg', 'Caer Llew']);
const CARNGOL_PATH = Object.freeze([...COUNTY_PATH, 'Jungferntal', 'Carngol']);
const DUN_AFALLA_PATH = Object.freeze([...COUNTY_PATH, 'Antike Häuser', 'Dun Afalla']);

export const SONNENKUESTE_REGION_EMBLEMS = Object.freeze({
  kingdom: 'assets/images/regions/koenigreich-cenyr.png',
  county: 'assets/images/regions/sonnenkueste.png',
  baronies: Object.freeze({
    Gersteküste: 'assets/images/regions/Cenyr/Sonnenküste/Gersteküste.png',
    Löwenberg: 'assets/images/regions/Cenyr/Sonnenküste/Löwenberg.png',
    Jungferntal: 'assets/images/regions/Cenyr/Sonnenküste/Jungferntal.png',
    'Antike Häuser': 'assets/images/regions/AntikeIcon.png'
  }),
  seats: Object.freeze({
    Aberon: '',
    'Caer Llew': '',
    Carngol: '',
    'Dun Afalla': 'assets/images/regions/AntikeIcon.png'
  })
});

export const SONNENKUESTE_HOUSE_EMBLEMS = Object.freeze({
  illewod: 'assets/images/houses/Sonnenküste/haus-illewod.png',
  teyrngarch: 'assets/images/houses/Sonnenküste/Gersteküste/haus-teyrngarch.png',
  blach: 'assets/images/houses/Sonnenküste/Gersteküste/haus-blach.png',
  llwynog: 'assets/images/houses/Sonnenküste/Gersteküste/haus-llwynog.png',
  illwath: 'assets/images/houses/Sonnenküste/Löwenberg/haus-illwath.png',
  morforwyn: 'assets/images/houses/Sonnenküste/Jungferntal/haus-morforwyn.png',
  grianlaoch: 'assets/images/houses/Sonnenküste/Gersteküste/haus-grianlaoch.png',
  gwaedryn: 'assets/images/houses/Sonnenküste/Gersteküste/haus-gwaedryn.png',
  rhavorn: 'assets/images/houses/Sonnenküste/Gersteküste/haus-rhavorn.png',
  pergarn: 'assets/images/houses/Sonnenküste/Gersteküste/haus-pergarn.png',
  donwyr: 'assets/images/houses/Sonnenküste/Gersteküste/haus-donwyr.png',
  uffyrn: 'assets/images/houses/Sonnenküste/Gersteküste/haus-uffyrn.png',
  pwllor: 'assets/images/houses/Sonnenküste/Gersteküste/haus-pwllor.png',
  llurien: 'assets/images/houses/Sonnenküste/Gersteküste/haus-llurien.png',
  neddair: 'assets/images/houses/Sonnenküste/Gersteküste/haus-neddair.png',
  cyrwain: 'assets/images/houses/Sonnenküste/Gersteküste/haus-cyrwain.png',
  donvael: 'assets/images/houses/Sonnenküste/Gersteküste/haus-donvael.png',
  rhenith: 'assets/images/houses/Sonnenküste/Gersteküste/haus-rhenith.png',
  bellyn: 'assets/images/houses/Sonnenküste/Gersteküste/haus-bellyn.png',
  fenor: 'assets/images/houses/Sonnenküste/Gersteküste/haus-fenor.png',
  loryn: 'assets/images/houses/Sonnenküste/Gersteküste/haus-loryn.png',
  orlen: 'assets/images/houses/Sonnenküste/Gersteküste/haus-orlen.png',
  renvyn: 'assets/images/houses/Sonnenküste/Gersteküste/haus-renvyn.png',
  'nic-riordain': 'assets/images/houses/Sonnenküste/Antike Häuser/haus-nic-riordain.png'
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
      kingdom: SONNENKUESTE_REGION_EMBLEMS.kingdom,
      county: SONNENKUESTE_REGION_EMBLEMS.county,
      barony: SONNENKUESTE_REGION_EMBLEMS.baronies[barony] || '',
      seat: SONNENKUESTE_REGION_EMBLEMS.seats[seat] || ''
    }
  });
  return Object.freeze({
    ...result,
    secondarySeats: Object.freeze([...result.secondarySeats]),
    regionEmblems: Object.freeze({ ...result.regionEmblems })
  });
}

function illewodVassalProfile(rankId, folderPath = ABERON_PATH, options = {}) {
  return profile(rankId, folderPath, {
    ...options,
    liegeHouseId: 'haus-illewod',
    liegeHouseName: "Haus Illewod O'Aberon"
  });
}

export const SONNENKUESTE_HOUSE_PROFILES = Object.freeze({
  illewod: profile('county', ABERON_PATH),
  teyrngarch: illewodVassalProfile('knight-prince'),
  blach: illewodVassalProfile('knight-prince'),
  llwynog: illewodVassalProfile('knight-prince'),
  illwath: illewodVassalProfile('knight-prince', CAER_LLEW_PATH),
  morforwyn: illewodVassalProfile('barony', CARNGOL_PATH),
  grianlaoch: illewodVassalProfile('knight', ABERON_PATH, {
    secondarySeats: ['Gallchofaen']
  }),
  gwaedryn: illewodVassalProfile('knight'),
  rhavorn: illewodVassalProfile('knight'),
  pergarn: illewodVassalProfile('knight'),
  donwyr: illewodVassalProfile('knight'),
  uffyrn: illewodVassalProfile('knight'),
  pwllor: illewodVassalProfile('knight'),
  llurien: illewodVassalProfile('knight'),
  neddair: illewodVassalProfile('knight'),
  cyrwain: illewodVassalProfile('knight'),
  donvael: illewodVassalProfile('knight'),
  rhenith: illewodVassalProfile('knight'),
  bellyn: illewodVassalProfile('commoner'),
  fenor: illewodVassalProfile('commoner'),
  loryn: illewodVassalProfile('commoner'),
  orlen: illewodVassalProfile('commoner'),
  renvyn: illewodVassalProfile('commoner'),
  'nic-riordain': profile('dun-tiarna', DUN_AFALLA_PATH)
});
