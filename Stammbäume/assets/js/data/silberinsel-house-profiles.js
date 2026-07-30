import { createHouseProfileFromFolderPath } from '../domain/house-profile.js';

const COUNTY_PATH = Object.freeze(['Cenyr', 'Silberinsel']);
const LLANVANE_PATH = Object.freeze([...COUNTY_PATH, 'Silberbucht', 'Llanvane']);
const EIDDON_PATH = Object.freeze([...COUNTY_PATH, 'Silberküste', 'Eiddon']);
const CAER_CLWYD_PATH = Object.freeze([...COUNTY_PATH, 'Silberpfad', 'Caer Clwyd']);
const ANCIENT_PATH = Object.freeze([...COUNTY_PATH, 'Antike Crannath Clans']);

export const SILBERINSEL_REGION_EMBLEMS = Object.freeze({
  kingdom: 'assets/images/regions/koenigreich-cenyr.png',
  county: 'assets/images/regions/silberinsel.png',
  baronies: Object.freeze({
    Silberbucht: 'assets/images/regions/Cenyr/Silberinsel/Silberbucht.png',
    Silberküste: 'assets/images/regions/Cenyr/Silberinsel/Silberküste.png',
    Silberpfad: 'assets/images/regions/Cenyr/Silberinsel/Silberpfad.png',
    'Antike Crannath Clans': 'assets/images/regions/AntikeIcon.png'
  }),
  // Für Llanvane, Eiddon und Caer Clwyd wurden keine eigenen Stadtwappen geliefert.
  seats: Object.freeze({
    Llanvane: '',
    Eiddon: '',
    'Caer Clwyd': ''
  })
});

export const SILBERINSEL_HOUSE_EMBLEMS = Object.freeze({
  neidr: 'assets/images/houses/Silberinsel/haus-neidr.png',
  saith: 'assets/images/houses/Silberinsel/Silberbucht/haus-saith.png',
  crefyddol: 'assets/images/houses/Silberinsel/Silberbucht/haus-crefyddol.png',
  canwyll: 'assets/images/houses/Silberinsel/Silberbucht/haus-canwyll.png',
  tiwna: 'assets/images/houses/Silberinsel/Silberküste/haus-tiwna.png',
  pyrth: 'assets/images/houses/Silberinsel/Silberpfad/haus-pyrth.png',
  ferlan: 'assets/images/houses/Silberinsel/Silberbucht/haus-ferlan.png',
  argyllan: 'assets/images/houses/Silberinsel/Silberbucht/haus-argyllan.png',
  delvor: 'assets/images/houses/Silberinsel/Silberbucht/haus-delvor.png',
  corant: 'assets/images/houses/Silberinsel/Silberbucht/haus-corant.png',
  faelcaran: 'assets/images/houses/Silberinsel/Silberbucht/haus-faelcaran.png',
  llyncar: 'assets/images/houses/Silberinsel/Silberbucht/haus-llyncar.png',
  maredwyn: 'assets/images/houses/Silberinsel/Silberbucht/haus-maredwyn.png',
  morfynn: 'assets/images/houses/Silberinsel/Silberbucht/haus-morfynn.png',
  selaeth: 'assets/images/houses/Silberinsel/Silberbucht/haus-selaeth.png',
  arven: 'assets/images/houses/Silberinsel/Silberbucht/haus-arven.png',
  brithfaen: 'assets/images/houses/Silberinsel/Silberbucht/haus-brithfaen.png',
  'tir-an-muirghin': 'assets/images/houses/Silberinsel/Antike Crannath Clans/tir-an-muirghin.png'
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
      kingdom: SILBERINSEL_REGION_EMBLEMS.kingdom,
      county: SILBERINSEL_REGION_EMBLEMS.county,
      barony: SILBERINSEL_REGION_EMBLEMS.baronies[barony] || '',
      seat: SILBERINSEL_REGION_EMBLEMS.seats[seat] || ''
    }
  });
  return Object.freeze({
    ...result,
    secondarySeats: Object.freeze([...result.secondarySeats]),
    regionEmblems: Object.freeze({ ...result.regionEmblems })
  });
}

function neidrVassalProfile(rankId, folderPath = LLANVANE_PATH) {
  return profile(rankId, folderPath, {
    liegeHouseId: 'haus-neidr',
    liegeHouseName: "Haus Neidr O'Llanvane"
  });
}

export const SILBERINSEL_HOUSE_PROFILES = Object.freeze({
  neidr: profile('county', LLANVANE_PATH),
  saith: neidrVassalProfile('knight-prince'),
  crefyddol: neidrVassalProfile('knight-prince'),
  canwyll: neidrVassalProfile('knight-prince'),
  pyrth: neidrVassalProfile('knight-prince', CAER_CLWYD_PATH),
  tiwna: neidrVassalProfile('barony', EIDDON_PATH),
  ferlan: neidrVassalProfile('knight'),
  argyllan: neidrVassalProfile('knight'),
  delvor: neidrVassalProfile('knight'),
  corant: neidrVassalProfile('knight'),
  faelcaran: neidrVassalProfile('knight'),
  llyncar: neidrVassalProfile('knight'),
  maredwyn: neidrVassalProfile('knight'),
  morfynn: neidrVassalProfile('knight'),
  selaeth: neidrVassalProfile('knight'),
  arven: neidrVassalProfile('knight'),
  brithfaen: neidrVassalProfile('commoner'),
  // Antikes Crannath-Geschlecht auf Grafen-Tier.
  'tir-an-muirghin': profile('mor-tiarna', ANCIENT_PATH)
});
