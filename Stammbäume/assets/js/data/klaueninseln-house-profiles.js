import { createHouseProfileFromFolderPath } from '../domain/house-profile.js';

const CENYR_COUNTY_PATH = Object.freeze(['Cenyr', 'Klaueninsel']);
const TALGARTH_PATH = Object.freeze([...CENYR_COUNTY_PATH, 'Sturmklaue', 'Talgarth']);
const MOREA_PATH = Object.freeze([...CENYR_COUNTY_PATH, 'Talklaue', 'Morea']);
const CAER_CRYFTLAWD_PATH = Object.freeze([...CENYR_COUNTY_PATH, 'Talklaue', 'Caer Cryftlawd']);
const ABERDAIL_PATH = Object.freeze([...CENYR_COUNTY_PATH, 'Blutklaue', 'Aberdail']);
const CAER_DEHEUOL_PATH = Object.freeze([
  ...CENYR_COUNTY_PATH,
  'Blutklaue',
  'Blutsturz',
  'Caer Deheuol'
]);
const CAER_MORBEN_PATH = Object.freeze([...CENYR_COUNTY_PATH, 'Wellenklaue', 'Caer Morben']);
const CAER_GLASLYN_PATH = Object.freeze([...CENYR_COUNTY_PATH, 'Nebelklaue', 'Caer Glaslyn']);
const CAER_EBIRTH_PATH = Object.freeze([...CENYR_COUNTY_PATH, 'Silberklaue', 'Caer Ebirth']);
const CAER_MARWOR_PATH = Object.freeze([...CENYR_COUNTY_PATH, 'Frostklaue', 'Caer Marwor']);
const ARD_DUNRATH_PATH = Object.freeze([...CENYR_COUNTY_PATH, 'Antike Häuser', 'Ard Dunrath']);

const DIAFOL_TREFGOCH_PATH = Object.freeze(['Vennyr', 'Tir Gogledd', 'Trefgoch']);
const DYFRGI_MYNYDDHARBWR_PATH = Object.freeze(['Vennyr', 'Tir Gorllewin', 'Mynyddharbwr']);
const ARFORDIR_SERENLYN_PATH = Object.freeze(['Vennyr', 'Tir Arfordir', 'Serenlyn']);
const DIANC_GWYNLANN_PATH = Object.freeze(['Vennyr', 'Tir Mynddoedd', 'Gwynlann']);
const WALWRS_TRAETH_PATH = Object.freeze(['Vennyr', 'Tir Mynddoedd', 'Traeth']);

export const KLAUENINSEL_REGION_EMBLEMS = Object.freeze({
  cenyr: 'assets/images/regions/koenigreich-cenyr.png',
  county: 'assets/images/regions/klaueninsel.png',
  lordships: Object.freeze({
    Sturmklaue: 'assets/images/regions/Cenyr/Klaueninsel/Sturmklaue.png',
    Talklaue: 'assets/images/regions/Cenyr/Klaueninsel/Talklaue.png',
    Blutklaue: 'assets/images/regions/Cenyr/Klaueninsel/Blutklaue.png',
    Wellenklaue: 'assets/images/regions/Cenyr/Klaueninsel/Wellenklaue.png',
    Nebelklaue: 'assets/images/regions/Cenyr/Klaueninsel/Nebelklaue.png',
    Silberklaue: 'assets/images/regions/Cenyr/Klaueninsel/Silberklaue.png',
    Frostklaue: 'assets/images/regions/Cenyr/Klaueninsel/Frostklaue.png',
    'Antike Häuser': 'assets/images/regions/AntikeIcon.png'
  }),
  vennyr: 'assets/images/regions/vennyr.png',
  vennyrRegions: Object.freeze({
    'Tir Gogledd': 'assets/images/regions/Vennyr/Tir Gogledd.png',
    'Tir Gorllewin': 'assets/images/regions/Vennyr/Tir Gorllewin.png',
    'Tir Arfordir': 'assets/images/regions/Vennyr/Tir Arfordir.png',
    'Tir Mynddoedd': 'assets/images/regions/Vennyr/Tir Mynddoedd.png'
  })
});

export const KLAUENINSEL_HOUSE_EMBLEMS = Object.freeze({
  arth: 'assets/images/houses/Klaueninsel/haus-arth.png',
  pawen: 'assets/images/houses/Klaueninsel/haus-pawen.png',
  crafanc: 'assets/images/houses/Klaueninsel/haus-crafanc.png',
  diafol: 'assets/images/houses/Klaueninsel/haus-diafol.png',
  cwningod: 'assets/images/houses/Klaueninsel/haus-cwningod.png',
  blodyn: 'assets/images/houses/Blütenland/haus-blodyn.png',
  dianc: 'assets/images/houses/Klaueninsel/haus-dianc.png',
  arfordir: 'assets/images/houses/Klaueninsel/haus-arfordir.png',
  dyfrgi: 'assets/images/houses/Klaueninsel/haus-dyfrgi.png',
  walwrs: 'assets/images/houses/Klaueninsel/haus-walwrs.png',
  unigol: 'assets/images/houses/Klaueninsel/haus-unigol.png',
  morthwyll: 'assets/images/houses/Klaueninsel/haus-morthwyll.png',
  eirth: 'assets/images/houses/Klaueninsel/haus-eirth.png',
  selwyn: 'assets/images/houses/Klaueninsel/haus-selwyn.png',
  beryn: 'assets/images/houses/Klaueninsel/haus-beryn.png',
  'ard-follmhar': 'assets/images/houses/Klaueninsel/haus-ard-follmhar.png'
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
    liegeHouseId: options.liegeHouseId === undefined ? 'haus-arth' : options.liegeHouseId,
    liegeHouseName: options.liegeHouseName === undefined ? "Haus Arth O'Talgarth" : options.liegeHouseName,
    regionEmblems: {
      kingdom: KLAUENINSEL_REGION_EMBLEMS.cenyr,
      county: KLAUENINSEL_REGION_EMBLEMS.county,
      barony: KLAUENINSEL_REGION_EMBLEMS.lordships[folderPath[2]] || '',
      seat: options.seatEmblem || ''
    }
  }));
}

function vennyrProfile(folderPath) {
  return freezeProfile(createHouseProfileFromFolderPath(folderPath, {
    rankId: 'unknown',
    regionEmblems: {
      kingdom: KLAUENINSEL_REGION_EMBLEMS.vennyr,
      county: KLAUENINSEL_REGION_EMBLEMS.vennyrRegions[folderPath[1]] || '',
      barony: '',
      seat: ''
    }
  }));
}

export const KLAUENINSEL_HOUSE_PROFILES = Object.freeze({
  arth: cenyrProfile('county', TALGARTH_PATH, { liegeHouseId: '', liegeHouseName: '' }),
  pawen: cenyrProfile('knight-prince', TALGARTH_PATH),
  crafanc: cenyrProfile('knight-prince', TALGARTH_PATH),
  diafol: cenyrProfile('knight-prince', TALGARTH_PATH),
  cwningod: cenyrProfile('barony', MOREA_PATH),
  dianc: cenyrProfile('knight-prince', ABERDAIL_PATH, {
    liegeHouseId: 'haus-blodyn-aberdail',
    liegeHouseName: "Haus Blodyn O'Aberdail"
  }),
  arfordir: cenyrProfile('knight-prince', ABERDAIL_PATH, {
    liegeHouseId: 'haus-blodyn-aberdail',
    liegeHouseName: "Haus Blodyn O'Aberdail"
  }),
  dyfrgi: cenyrProfile('knight', CAER_CRYFTLAWD_PATH, {
    liegeHouseId: 'haus-cwningod',
    liegeHouseName: 'Haus Cwningod'
  }),
  walwrs: cenyrProfile('knight-prince', CAER_DEHEUOL_PATH),
  morthwyll: cenyrProfile('knight-prince', CAER_MORBEN_PATH),
  eirth: cenyrProfile('knight-prince', CAER_GLASLYN_PATH),
  selwyn: cenyrProfile('knight-prince', CAER_EBIRTH_PATH),
  unigol: cenyrProfile('knight-prince', CAER_MARWOR_PATH),
  beryn: cenyrProfile('knight', TALGARTH_PATH),
  'ard-follmhar': cenyrProfile('unknown', ARD_DUNRATH_PATH, {
    liegeHouseId: '',
    liegeHouseName: '',
    seatEmblem: KLAUENINSEL_REGION_EMBLEMS.lordships['Antike Häuser']
  })
});

export const KLAUENINSEL_ORIGIN_HOUSE_PROFILES = Object.freeze({
  'diafol-trefgoch': vennyrProfile(DIAFOL_TREFGOCH_PATH),
  'dyfrgi-mynyddharbwr': vennyrProfile(DYFRGI_MYNYDDHARBWR_PATH),
  'arfordir-serenlyn': vennyrProfile(ARFORDIR_SERENLYN_PATH),
  'dianc-gwynlann': vennyrProfile(DIANC_GWYNLANN_PATH),
  'walwrs-traeth': vennyrProfile(WALWRS_TRAETH_PATH)
});
