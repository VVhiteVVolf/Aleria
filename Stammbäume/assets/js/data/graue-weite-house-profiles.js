import { createHouseProfileFromFolderPath } from '../domain/house-profile.js';

const CENYR_COUNTY_PATH = Object.freeze(['Cenyr', 'Graue Weite']);
const TREDEGAR_PATH = Object.freeze([...CENYR_COUNTY_PATH, 'Schimmerküste', 'Tredegar']);
const LLANFORWYN_PATH = Object.freeze([...CENYR_COUNTY_PATH, 'Silberwald', 'Llanforwyn']);
const LLANFYN_PATH = Object.freeze([...CENYR_COUNTY_PATH, 'Achatsee', 'Llanfyn']);
const COEDLYN_PATH = Object.freeze([...CENYR_COUNTY_PATH, 'Eichenlicht', 'Coedlyn']);
const TALSARN_PATH = Object.freeze([...CENYR_COUNTY_PATH, 'Grauküste', 'Talsarn']);
const CAER_ASGWRN_PATH = Object.freeze([
  ...CENYR_COUNTY_PATH,
  'Silberwald',
  'Skelettküste',
  'Caer Asgwrn'
]);
const ARD_GHALLON_PATH = Object.freeze([
  ...CENYR_COUNTY_PATH,
  'Antike Crannath Clans',
  'Ard Ghallon'
]);
const MOR_MHACHAIR_PATH = Object.freeze([
  ...CENYR_COUNTY_PATH,
  'Antike Crannath Clans',
  'Mor Mhachair'
]);
const DUN_LIATH_PATH = Object.freeze([
  ...CENYR_COUNTY_PATH,
  'Antike Crannath Clans',
  'Dun Liath'
]);
const EXTINCT_PATH = Object.freeze([...CENYR_COUNTY_PATH, 'Ausgestorbene Häuser']);

const BLAIDD_BRANON_PATH = Object.freeze(['Vennyr', 'Tir Dwyrain', 'Branon']);
const ILLYGODEN_TIRWEDD_PATH = Object.freeze(['Vennyr', 'Tir Dwyrain', 'Tirwedd']);
const GWAEDLYD_CAER_GORWEL_PATH = Object.freeze(['Vennyr', 'Tir Arfordir', 'Caer Gorwel']);
const LYFANT_DERWYDDION_PATH = Object.freeze(['Vennyr', 'Tir Mynddoedd', 'Derwyddion']);

export const GRAUE_WEITE_REGION_EMBLEMS = Object.freeze({
  cenyr: 'assets/images/regions/koenigreich-cenyr.png',
  county: 'assets/images/regions/graue-weite.png',
  regions: Object.freeze({
    Schimmerküste: 'assets/images/regions/Cenyr/Graue Weite/Schimmerküste.png',
    Silberwald: 'assets/images/regions/Cenyr/Graue Weite/Silberwald.png',
    Achatsee: 'assets/images/regions/Cenyr/Graue Weite/Achatsee.png',
    Eichenlicht: 'assets/images/regions/Cenyr/Graue Weite/Eichenlicht.png',
    Grauküste: 'assets/images/regions/Cenyr/Graue Weite/Grauküste.png',
    Skelettküste: 'assets/images/regions/Cenyr/Graue Weite/Skelettküste.png',
    'Antike Crannath Clans': 'assets/images/regions/AntikeIcon.png',
    'Ausgestorbene Häuser': 'assets/images/regions/Cenyr/Ährental/Ausgestorben.png'
  }),
  vennyr: 'assets/images/regions/vennyr.png',
  vennyrRegions: Object.freeze({
    'Tir Dwyrain': 'assets/images/regions/Vennyr/Tir Dwyrain.png',
    'Tir Arfordir': 'assets/images/regions/Vennyr/Tir Arfordir.png',
    'Tir Mynddoedd': 'assets/images/regions/Vennyr/Tir Mynddoedd.png'
  })
});

export const GRAUE_WEITE_HOUSE_EMBLEMS = Object.freeze({
  pysgod: 'assets/images/houses/Graue Weite/haus-pysgod.png',
  blaidd: 'assets/images/houses/Graue Weite/Schimmerküste/haus-blaidd.png',
  brithyll: 'assets/images/houses/Graue Weite/Schimmerküste/haus-brithyll.png',
  gwialen: 'assets/images/houses/Graue Weite/Schimmerküste/haus-gwialen.png',
  illygoden: 'assets/images/houses/Graue Weite/Schimmerküste/haus-illygoden.png',
  gwaedlyd: 'assets/images/houses/Graue Weite/Schimmerküste/haus-gwaedlyd.png',
  draenog: 'assets/images/houses/Graue Weite/Silberwald/haus-draenog.png',
  coedwig: 'assets/images/houses/Graue Weite/Achatsee/haus-coedwig.png',
  wivern: 'assets/images/houses/Graue Weite/Eichenlicht/haus-wivern.png',
  morfil: 'assets/images/houses/Graue Weite/Grauküste/haus-morfil.png',
  lyfant: 'assets/images/houses/Graue Weite/Silberwald/haus-lyfant.png',
  dornach: 'assets/images/houses/Graue Weite/Antike Crannath Clans/clan-dornach.png',
  brathaireann: 'assets/images/houses/Graue Weite/Antike Crannath Clans/clan-brathaireann.png',
  tonnmharra: 'assets/images/houses/Graue Weite/Antike Crannath Clans/clan-tonnmharra.png',
  tanwyn: 'assets/images/houses/Graue Weite/Ausgestorbene Häuser/haus-tanwyn.png'
});

function freezeProfile(profile) {
  return Object.freeze({
    ...profile,
    secondarySeats: Object.freeze([...profile.secondarySeats]),
    ...(profile.folderPath ? { folderPath: Object.freeze([...profile.folderPath]) } : {}),
    regionEmblems: Object.freeze({ ...profile.regionEmblems })
  });
}

function cenyrProfile(rankId, folderPath, options = {}) {
  return freezeProfile(createHouseProfileFromFolderPath(folderPath, {
    rankId,
    liegeHouseId: options.liegeHouseId || '',
    liegeHouseName: options.liegeHouseName || '',
    regionEmblems: {
      kingdom: GRAUE_WEITE_REGION_EMBLEMS.cenyr,
      county: GRAUE_WEITE_REGION_EMBLEMS.county,
      barony: options.baronyEmblem || GRAUE_WEITE_REGION_EMBLEMS.regions[folderPath[2]] || '',
      seat: options.seatEmblem || ''
    }
  }));
}

function pysgodVassalProfile(rankId, folderPath, options = {}) {
  return cenyrProfile(rankId, folderPath, {
    ...options,
    liegeHouseId: 'haus-pysgod',
    liegeHouseName: "Haus Pysgod O'Tredegar"
  });
}

function vennyrProfile(rankId, folderPath) {
  return freezeProfile(createHouseProfileFromFolderPath(folderPath, {
    rankId,
    regionEmblems: {
      kingdom: GRAUE_WEITE_REGION_EMBLEMS.vennyr,
      county: GRAUE_WEITE_REGION_EMBLEMS.vennyrRegions[folderPath[1]] || '',
      barony: '',
      seat: ''
    }
  }));
}

export const GRAUE_WEITE_HOUSE_PROFILES = Object.freeze({
  pysgod: cenyrProfile('county', TREDEGAR_PATH),
  blaidd: pysgodVassalProfile('knight-prince', TREDEGAR_PATH),
  brithyll: pysgodVassalProfile('knight-prince', TREDEGAR_PATH),
  gwialen: pysgodVassalProfile('knight-prince', TREDEGAR_PATH),
  illygoden: pysgodVassalProfile('knight-prince', TREDEGAR_PATH),
  gwaedlyd: pysgodVassalProfile('knight-prince', TREDEGAR_PATH),
  draenog: pysgodVassalProfile('barony', LLANFORWYN_PATH),
  coedwig: pysgodVassalProfile('barony', LLANFYN_PATH),
  wivern: pysgodVassalProfile('barony', COEDLYN_PATH),
  morfil: pysgodVassalProfile('barony', TALSARN_PATH),
  lyfant: pysgodVassalProfile('knight-prince', CAER_ASGWRN_PATH, {
    seatEmblem: GRAUE_WEITE_REGION_EMBLEMS.regions.Skelettküste
  }),
  dornach: cenyrProfile('dun-tiarna', ARD_GHALLON_PATH, {
    seatEmblem: 'assets/images/regions/AntikeIcon.png'
  }),
  brathaireann: cenyrProfile('mor-tiarna', MOR_MHACHAIR_PATH, {
    seatEmblem: 'assets/images/regions/AntikeIcon.png'
  }),
  tonnmharra: cenyrProfile('knight-prince', DUN_LIATH_PATH, {
    seatEmblem: 'assets/images/regions/AntikeIcon.png'
  }),
  tanwyn: cenyrProfile('unknown', EXTINCT_PATH)
});

export const GRAUE_WEITE_ORIGIN_HOUSE_PROFILES = Object.freeze({
  'blaidd-branon': vennyrProfile('county', BLAIDD_BRANON_PATH),
  'illygoden-tirwedd': vennyrProfile('barony', ILLYGODEN_TIRWEDD_PATH),
  'gwaedlyd-caer-gorwel': vennyrProfile('knight-prince', GWAEDLYD_CAER_GORWEL_PATH),
  'lyfant-derwyddion': vennyrProfile('knight-prince', LYFANT_DERWYDDION_PATH)
});
