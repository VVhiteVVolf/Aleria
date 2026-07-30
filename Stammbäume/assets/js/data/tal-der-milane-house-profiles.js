import { createHouseProfileFromFolderPath } from '../domain/house-profile.js';

const COUNTY_PATH = Object.freeze(['Cenyr', 'Tal der Milane']);
const PENBRYN_PATH = Object.freeze([...COUNTY_PATH, 'Yvains Klamm', 'Penbryn']);
const PENLLYN_PATH = Object.freeze([...COUNTY_PATH, 'Taubenfurt', 'Penllyn']);
const TALWYN_PATH = Object.freeze([...COUNTY_PATH, 'Falkenhöh', 'Talwyn']);
const CAER_GWENNOL_PATH = Object.freeze([...COUNTY_PATH, 'Schwalbenhort', 'Caer Gwennol']);
const DUN_TALONACH_PATH = Object.freeze([...COUNTY_PATH, 'Antike Crannath Clans', 'Dun Talonach']);
const TUR_BRISTE_PATH = Object.freeze([...COUNTY_PATH, 'Antike Crannath Clans', 'Tûr Briste']);

export const TAL_DER_MILANE_REGION_EMBLEMS = Object.freeze({
  kingdom: 'assets/images/regions/koenigreich-cenyr.png',
  county: 'assets/images/regions/tal-der-milane.png',
  baronies: Object.freeze({
    'Yvains Klamm': 'assets/images/regions/Cenyr/Tal der Milane/Yvains Klamm.png',
    Taubenfurt: 'assets/images/regions/Cenyr/Tal der Milane/Taubenfurt.png',
    Falkenhöh: 'assets/images/regions/Cenyr/Tal der Milane/Falkenhöh.png',
    Schwalbenhort: 'assets/images/regions/Cenyr/Tal der Milane/Schwalbenhort.png',
    'Antike Crannath Clans': 'assets/images/regions/AntikeIcon.png'
  }),
  // Für Penbryn, Penllyn, Talwyn und Caer Gwennol wurden keine eigenen
  // Stadtwappen geliefert. Die antiken Orte verwenden das Ruinensymbol.
  seats: Object.freeze({
    Penbryn: '',
    Penllyn: '',
    Talwyn: '',
    'Caer Gwennol': '',
    'Dun Talonach': 'assets/images/regions/AntikeIcon.png',
    'Tûr Briste': 'assets/images/regions/AntikeIcon.png'
  })
});

export const TAL_DER_MILANE_HOUSE_EMBLEMS = Object.freeze({
  aderyn: 'assets/images/houses/Tal der Milane/haus-aderyn.png',
  eryr: 'assets/images/houses/Tal der Milane/Yvains Klamm/haus-eryr.png',
  tylluan: 'assets/images/houses/Tal der Milane/Yvains Klamm/haus-tylluan.png',
  mwyalchen: 'assets/images/houses/Tal der Milane/Yvains Klamm/haus-mwyalchen.png',
  ilyuncu: 'assets/images/houses/Tal der Milane/Schwalbenhort/haus-ilyuncu.png',
  gaeth: 'assets/images/houses/Tal der Milane/Taubenfurt/haus-gaeth.png',
  hebog: 'assets/images/houses/Tal der Milane/Falkenhöh/haus-hebog.png',
  bronnor: 'assets/images/houses/Tal der Milane/Yvains Klamm/haus-bronnor.png',
  caerfran: 'assets/images/houses/Tal der Milane/Yvains Klamm/haus-caerfran.png',
  coedrudd: 'assets/images/houses/Tal der Milane/Yvains Klamm/haus-coedrudd.png',
  barcud: 'assets/images/houses/Tal der Milane/Yvains Klamm/haus-barcud.png',
  durdynn: 'assets/images/houses/Tal der Milane/Yvains Klamm/haus-durdynn.png',
  gwylen: 'assets/images/houses/Tal der Milane/Yvains Klamm/haus-gwylen.png',
  faelwyn: 'assets/images/houses/Tal der Milane/Yvains Klamm/haus-faelwyn.png',
  gwyntell: 'assets/images/houses/Tal der Milane/Yvains Klamm/haus-gwyntell.png',
  gwyliadwr: 'assets/images/houses/Tal der Milane/Yvains Klamm/haus-gwyliadwr.png',
  helyg: 'assets/images/houses/Tal der Milane/Yvains Klamm/haus-helyg.png',
  ffwnarch: 'assets/images/houses/Tal der Milane/Yvains Klamm/haus-ffwnarch.png',
  gormard: 'assets/images/houses/Tal der Milane/Antike Crannath Clans/clan-ui-gormard.png',
  'ua-fionnghal': 'assets/images/houses/Tal der Milane/Antike Crannath Clans/clan-ua-fionnghal.png'
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
      kingdom: TAL_DER_MILANE_REGION_EMBLEMS.kingdom,
      county: TAL_DER_MILANE_REGION_EMBLEMS.county,
      barony: TAL_DER_MILANE_REGION_EMBLEMS.baronies[barony] || '',
      seat: TAL_DER_MILANE_REGION_EMBLEMS.seats[seat] || ''
    }
  });
  return Object.freeze({
    ...result,
    secondarySeats: Object.freeze([...result.secondarySeats]),
    regionEmblems: Object.freeze({ ...result.regionEmblems })
  });
}

function aderynVassalProfile(rankId, folderPath = PENBRYN_PATH) {
  return profile(rankId, folderPath, {
    liegeHouseId: 'haus-aderyn',
    liegeHouseName: "Haus Aderyn O'Penbryn"
  });
}

export const TAL_DER_MILANE_HOUSE_PROFILES = Object.freeze({
  aderyn: profile('county', PENBRYN_PATH),
  eryr: aderynVassalProfile('knight-prince'),
  tylluan: aderynVassalProfile('knight-prince'),
  mwyalchen: aderynVassalProfile('knight-prince'),
  ilyuncu: aderynVassalProfile('knight-prince', CAER_GWENNOL_PATH),
  gaeth: aderynVassalProfile('barony', PENLLYN_PATH),
  hebog: aderynVassalProfile('barony', TALWYN_PATH),
  bronnor: aderynVassalProfile('knight'),
  caerfran: aderynVassalProfile('knight'),
  coedrudd: aderynVassalProfile('knight'),
  barcud: aderynVassalProfile('knight'),
  durdynn: aderynVassalProfile('knight'),
  gwylen: aderynVassalProfile('knight'),
  faelwyn: aderynVassalProfile('knight'),
  gwyntell: aderynVassalProfile('knight'),
  gwyliadwr: aderynVassalProfile('knight'),
  helyg: aderynVassalProfile('knight'),
  ffwnarch: aderynVassalProfile('commoner'),
  // Die antiken Clans stehen außerhalb des heutigen Aderyn-Lehenssystems.
  gormard: profile('mor-tiarna', DUN_TALONACH_PATH),
  'ua-fionnghal': profile('dun-tiarna', TUR_BRISTE_PATH, {
    liegeHouseId: 'haus-gormard',
    liegeHouseName: 'Clan Ui Gormárd'
  })
});
