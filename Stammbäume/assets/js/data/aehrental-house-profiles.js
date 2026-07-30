import { createHouseProfileFromFolderPath } from '../domain/house-profile.js';

const COUNTY_PATH = Object.freeze(['Cenyr', 'Ährental']);
const GLYNDRAITH_PATH = Object.freeze([...COUNTY_PATH, 'Tristams Ebene', 'Glyndraith']);
const CAER_DIWEDD_PATH = Object.freeze([...COUNTY_PATH, 'Graue Bucht', 'Caer Diwedd']);
const EIRWYN_PATH = Object.freeze([...COUNTY_PATH, 'Eberkamm', 'Eirwyn']);
const ALDWYND_PATH = Object.freeze([...COUNTY_PATH, 'Flusstal', 'Aldwynd']);
const EXTINCT_PATH = Object.freeze([...COUNTY_PATH, 'Ausgestorben']);
const DUN_CLACHRATH_PATH = Object.freeze([...COUNTY_PATH, 'Antike Crannath Clans', 'Dun Clachrath']);
const RI_TORRAIRD_PATH = Object.freeze([...COUNTY_PATH, 'Antike Crannath Clans', 'Ri Torraird']);

export const AEHRENTAL_REGION_EMBLEMS = Object.freeze({
  kingdom: 'assets/images/regions/koenigreich-cenyr.png',
  county: 'assets/images/regions/aehrental.png',
  baronies: Object.freeze({
    'Tristams Ebene': 'assets/images/regions/Cenyr/Ährental/Tristams Ebene.png',
    'Graue Bucht': 'assets/images/regions/Cenyr/Ährental/Graue Bucht.png',
    Eberkamm: 'assets/images/regions/Cenyr/Ährental/Eberkamm.png',
    Flusstal: 'assets/images/regions/Cenyr/Ährental/Flusstal.png',
    Ausgestorben: 'assets/images/regions/Cenyr/Ährental/Ausgestorben.png',
    'Antike Crannath Clans': 'assets/images/regions/AntikeIcon.png'
  }),
  // Für die heutigen Orte wurden keine eigenen Stadtwappen geliefert. Die antiken
  // Sitze verwenden wie in den übrigen Cenyr-Grafschaften das Ruinensymbol.
  seats: Object.freeze({
    Glyndraith: '',
    'Caer Diwedd': '',
    Eirwyn: '',
    Aldwynd: '',
    'Dun Clachrath': 'assets/images/regions/AntikeIcon.png',
    'Ri Torraird': 'assets/images/regions/AntikeIcon.png'
  })
});

export const AEHRENTAL_HOUSE_EMBLEMS = Object.freeze({
  grawn: 'assets/images/houses/Ährental/haus-grawn.png',
  marchog: 'assets/images/houses/Ährental/Tristams Ebene/haus-marchog.png',
  morcanhuc: 'assets/images/houses/Ährental/Tristams Ebene/haus-morcanhuc.png',
  baedd: 'assets/images/houses/Ährental/Eberkamm/haus-baedd.png',
  ciarog: 'assets/images/houses/Ährental/Graue Bucht/haus-ciarog.png',
  sgwarnog: 'assets/images/houses/Ährental/Flusstal/haus-sgwarnog.png',
  gwythiad: 'assets/images/houses/Ährental/Tristams Ebene/haus-gwythiad.png',
  aroglyn: 'assets/images/houses/Ährental/Tristams Ebene/haus-aroglyn.png',
  chiffyddlon: 'assets/images/houses/Ährental/Ausgestorben/haus-chiffyddlon.png',
  gwarchod: 'assets/images/houses/Ährental/Ausgestorben/haus-gwarchod.png',
  cruithenaech: 'assets/images/houses/Ährental/Antike Crannath Clans/clan-cruithenaech.png',
  warthog: 'assets/images/houses/Ährental/Antike Crannath Clans/clan-warthog.png'
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
      kingdom: AEHRENTAL_REGION_EMBLEMS.kingdom,
      county: AEHRENTAL_REGION_EMBLEMS.county,
      barony: AEHRENTAL_REGION_EMBLEMS.baronies[barony] || '',
      seat: AEHRENTAL_REGION_EMBLEMS.seats[seat] || ''
    }
  });
  return Object.freeze({
    ...result,
    secondarySeats: Object.freeze([...result.secondarySeats]),
    regionEmblems: Object.freeze({ ...result.regionEmblems })
  });
}

function grawnVassalProfile(rankId, folderPath) {
  return profile(rankId, folderPath, {
    liegeHouseId: 'haus-grawn',
    liegeHouseName: "Haus Grawn O'Glyndraith"
  });
}

export const AEHRENTAL_HOUSE_PROFILES = Object.freeze({
  grawn: profile('county', GLYNDRAITH_PATH),
  morcanhuc: grawnVassalProfile('knight-prince', GLYNDRAITH_PATH),
  ciarog: grawnVassalProfile('knight-prince', CAER_DIWEDD_PATH),
  chiffyddlon: grawnVassalProfile('knight-prince', EXTINCT_PATH),
  gwarchod: grawnVassalProfile('knight-prince', EXTINCT_PATH),
  baedd: grawnVassalProfile('barony', EIRWYN_PATH),
  sgwarnog: grawnVassalProfile('barony', ALDWYND_PATH),
  marchog: grawnVassalProfile('knight-prince', GLYNDRAITH_PATH),
  gwythiad: grawnVassalProfile('knight', GLYNDRAITH_PATH),
  aroglyn: grawnVassalProfile('commoner', GLYNDRAITH_PATH),
  // Die beiden antiken Clanränge sind nicht überliefert und werden nicht erfunden.
  cruithenaech: profile('unknown', DUN_CLACHRATH_PATH),
  warthog: profile('unknown', RI_TORRAIRD_PATH)
});
