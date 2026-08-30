import { createHouseProfileFromFolderPath } from '../domain/house-profile.js';

const COUNTY_PATH = Object.freeze(['Cenyr', 'Weidebucht']);
const MELWAS_AU_PATH = Object.freeze([...COUNTY_PATH, 'Melwas Au', 'Cerrigarth']);
const BORKENSTEIN_PATH = Object.freeze([...COUNTY_PATH, 'Borkenstein', 'Trefyddin']);
const HOCHWEIDE_PATH = Object.freeze([...COUNTY_PATH, 'Hochweide', 'Glyndale']);
const DUNSTHOLM_PATH = Object.freeze([...COUNTY_PATH, 'Dunstholm', 'Esgairmor']);
const BHIORACH_PATH = Object.freeze([...COUNTY_PATH, 'Antike Häuser', 'Bhiorach']);
const ANCIENT_CERRIGARTH_PATH = Object.freeze([...COUNTY_PATH, 'Antike Häuser', 'Antikes Cerrigarth']);

export const WEIDEBUCHT_REGION_EMBLEMS = Object.freeze({
  kingdom: 'assets/images/regions/koenigreich-cenyr.png',
  county: 'assets/images/regions/weidebucht.png',
  baronies: Object.freeze({
    'Melwas Au': 'assets/images/regions/Cenyr/Weidebucht/Melwas Au.png',
    Borkenstein: 'assets/images/regions/Cenyr/Weidebucht/Borkenstein.png',
    Hochweide: 'assets/images/regions/Cenyr/Weidebucht/Hochweide.png',
    Dunstholm: 'assets/images/regions/Cenyr/Weidebucht/Dunstholm.png',
    'Antike Häuser': 'assets/images/regions/AntikeIcon.png'
  }),
  // Für die vier heutigen Städte wurden keine eigenen Stadtwappen geliefert.
  // Antike Orte verwenden wie in den übrigen Cenyr-Grafschaften das Ruinensymbol.
  seats: Object.freeze({
    Cerrigarth: '',
    Trefyddin: '',
    Glyndale: '',
    Esgairmor: '',
    Bhiorach: 'assets/images/regions/AntikeIcon.png',
    'Antikes Cerrigarth': 'assets/images/regions/AntikeIcon.png'
  })
});

export const WEIDEBUCHT_HOUSE_EMBLEMS = Object.freeze({
  wylan: 'assets/images/houses/Weidebucht/haus-wylan.png',
  dinefwr: 'assets/images/houses/Weidebucht/Melwas Au/haus-dinefwr.png',
  mochdaer: 'assets/images/houses/Weidebucht/Melwas Au/haus-mochdaer.png',
  'tir-addawol': 'assets/images/houses/Weidebucht/Hochweide/haus-tir-addawol.png',
  hwyaden: 'assets/images/houses/Weidebucht/Borkenstein/haus-hwyaden.png',
  creyr: 'assets/images/houses/Weidebucht/haus-creyr.png',
  carwyn: 'assets/images/houses/Weidebucht/Melwas Au/haus-carwyn.png',
  deyrn: 'assets/images/houses/Weidebucht/Melwas Au/haus-deyrn.png',
  garan: 'assets/images/houses/Weidebucht/Melwas Au/haus-garan.png',
  kelan: 'assets/images/houses/Weidebucht/Melwas Au/haus-kelan.png',
  pellan: 'assets/images/houses/Weidebucht/Melwas Au/haus-pellan.png',
  serin: 'assets/images/houses/Weidebucht/Melwas Au/haus-serin.png',
  uldyn: 'assets/images/houses/Weidebucht/Melwas Au/haus-uldyn.png',
  yllen: 'assets/images/houses/Weidebucht/Melwas Au/haus-yllen.png',
  corlyn: 'assets/images/houses/Weidebucht/Melwas Au/haus-corlyn.png',
  derlan: 'assets/images/houses/Weidebucht/Melwas Au/haus-derlan.png',
  tannau: 'assets/images/houses/Weidebucht/Melwas Au/haus-tannau.png',
  asyn: 'assets/images/houses/Weidebucht/Melwas Au/haus-asyn.png',
  fhaire: 'assets/images/houses/Weidebucht/Antike Häuser/clan-ua-fhaire.png',
  trisceil: 'assets/images/houses/Weidebucht/Antike Häuser/clan-ui-trisceil.png'
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
      kingdom: WEIDEBUCHT_REGION_EMBLEMS.kingdom,
      county: WEIDEBUCHT_REGION_EMBLEMS.county,
      barony: WEIDEBUCHT_REGION_EMBLEMS.baronies[barony] || '',
      seat: WEIDEBUCHT_REGION_EMBLEMS.seats[seat] || ''
    }
  });
  return Object.freeze({
    ...result,
    secondarySeats: Object.freeze([...result.secondarySeats]),
    regionEmblems: Object.freeze({ ...result.regionEmblems })
  });
}

function wylanVassalProfile(rankId, folderPath = MELWAS_AU_PATH) {
  return profile(rankId, folderPath, {
    liegeHouseId: 'haus-wylan',
    liegeHouseName: "Haus Wylan O'Cerrigarth"
  });
}

export const WEIDEBUCHT_HOUSE_PROFILES = Object.freeze({
  wylan: profile('county', MELWAS_AU_PATH),
  dinefwr: wylanVassalProfile('knight-prince'),
  mochdaer: wylanVassalProfile('knight-prince'),
  'tir-addawol': wylanVassalProfile('barony', HOCHWEIDE_PATH),
  hwyaden: wylanVassalProfile('barony', BORKENSTEIN_PATH),
  creyr: wylanVassalProfile('barony', DUNSTHOLM_PATH),
  carwyn: wylanVassalProfile('knight'),
  deyrn: wylanVassalProfile('knight'),
  garan: wylanVassalProfile('knight'),
  kelan: wylanVassalProfile('knight'),
  pellan: wylanVassalProfile('knight'),
  serin: wylanVassalProfile('knight'),
  uldyn: wylanVassalProfile('knight'),
  yllen: wylanVassalProfile('knight'),
  corlyn: wylanVassalProfile('knight'),
  derlan: wylanVassalProfile('knight'),
  tannau: wylanVassalProfile('commoner'),
  asyn: wylanVassalProfile('knight-prince'),
  fhaire: profile('laird', BHIORACH_PATH),
  trisceil: profile('mor-tiarna', ANCIENT_CERRIGARTH_PATH)
});
