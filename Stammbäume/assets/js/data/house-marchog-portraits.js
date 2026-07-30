import { HOUSE_GRAWN_PORTRAITS } from './house-grawn-portraits.js';
import { HOUSE_TIR_ADDAWOL_PORTRAITS } from './house-tir-addawol-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-marchog';

export const HOUSE_MARCHOG_LOCAL_PORTRAIT_IDS = Object.freeze([
  'adda-marchog',
  'ariana-marchog',
  'ariene-marchog',
  'breannain-marchog',
  'bricelyn-morcanhuc',
  'brizio-marchog',
  'caled-marchog',
  'caraf-marchog',
  'cedric-marchog',
  'corryn-marchog',
  'cymraes-ciarog',
  'enora-marchog',
  'evain-marchog',
  'gwenaelle-marchog',
  'gwenifer-marchog',
  'harry',
  'hevedydd-marchog',
  'imanie-marchog',
  'jennalyn-marchog',
  'kerenza-baedd',
  'lyon-marchog',
  'mabli-marchog-affair',
  'maddox-marchog',
  'mari-marchog-affair',
  'mawr-canwyll',
  'meical-marchog',
  'owain-marchog',
  'rhianu-marchog',
  'rhodrhi-marchog',
  'rhon-marchog',
  'syvwlch-marchog',
  'tegvan-marchog',
  'yvain-marchog'
]);

const LOCAL_PORTRAITS = Object.freeze(Object.fromEntries(
  HOUSE_MARCHOG_LOCAL_PORTRAIT_IDS.map(personId => [
    personId,
    `${PORTRAIT_ROOT}/${personId}.jpg`
  ])
));

// Gegenakten bleiben die kanonische Bildquelle gemeinsamer Weltpersonen.
export const HOUSE_MARCHOG_PORTRAITS = Object.freeze({
  ...LOCAL_PORTRAITS,
  'glenys-grawn': HOUSE_GRAWN_PORTRAITS['glenys-grawn'],
  'llyonell-marchog': HOUSE_GRAWN_PORTRAITS['llyonell-marchog'],
  'eiddwen-tir-addawol': HOUSE_TIR_ADDAWOL_PORTRAITS['eiddwen-tir-addawol'],
  'tirian-marchog': HOUSE_TIR_ADDAWOL_PORTRAITS['tirian-marchog']
});
