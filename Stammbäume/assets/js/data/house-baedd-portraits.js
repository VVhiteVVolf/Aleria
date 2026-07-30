import { HOUSE_BLACH_PORTRAITS } from './house-blach-portraits.js';
import { HOUSE_CREYR_PORTRAITS } from './house-creyr-portraits.js';
import { HOUSE_DIENYDDIWR_PORTRAITS } from './house-dienyddiwr-portraits.js';
import { HOUSE_DYNGWN_PORTRAITS } from './house-dyngwn-portraits.js';
import { HOUSE_GRAWN_PORTRAITS } from './house-grawn-portraits.js';
import { HOUSE_LLWYNOG_PORTRAITS } from './house-llwynog-portraits.js';
import { HOUSE_MARCHOG_PORTRAITS } from './house-marchog-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-baedd';

export const HOUSE_BAEDD_LOCAL_PORTRAIT_IDS = Object.freeze([
  'aelwyd-baedd',
  'angharad-chiffyddlon',
  'auryn-baedd',
  'cynan-baedd',
  'gwalchmai-baedd',
  'heledd-baedd',
  'kimbal-baedd',
  'liliwen-baedd',
  'maldwyn-sgwarnog',
  'pwyll-baedd',
  'selyf-baedd',
  'ulyana-ciarog',
  'vaethan-baedd',
  'valmar-baedd',
  'vaughan-baedd',
  'viggo-baedd',
  'zennorah-pyrth'
]);

const LOCAL_PORTRAITS = Object.freeze({
  'aelwyd-baedd': `${PORTRAIT_ROOT}/aelwyd-baedd.png`,
  'angharad-chiffyddlon': `${PORTRAIT_ROOT}/angharad-chiffyddlon.jpg`,
  'auryn-baedd': `${PORTRAIT_ROOT}/auryn-baedd.png`,
  'cynan-baedd': `${PORTRAIT_ROOT}/cynan-baedd.png`,
  'gwalchmai-baedd': `${PORTRAIT_ROOT}/gwalchmai-baedd.png`,
  'heledd-baedd': `${PORTRAIT_ROOT}/heledd-baedd.png`,
  'kimbal-baedd': `${PORTRAIT_ROOT}/kimbal-baedd.png`,
  'liliwen-baedd': `${PORTRAIT_ROOT}/liliwen-baedd.png`,
  'maldwyn-sgwarnog': `${PORTRAIT_ROOT}/maldwyn-sgwarnog.jpg`,
  'pwyll-baedd': `${PORTRAIT_ROOT}/pwyll-baedd.png`,
  'selyf-baedd': `${PORTRAIT_ROOT}/selyf-baedd.png`,
  'ulyana-ciarog': `${PORTRAIT_ROOT}/ulyana-ciarog.png`,
  'vaethan-baedd': `${PORTRAIT_ROOT}/vaethan-baedd.png`,
  'valmar-baedd': `${PORTRAIT_ROOT}/valmar-baedd.png`,
  'vaughan-baedd': `${PORTRAIT_ROOT}/vaughan-baedd.png`,
  'viggo-baedd': `${PORTRAIT_ROOT}/viggo-baedd.png`,
  'zennorah-pyrth': `${PORTRAIT_ROOT}/zennorah-pyrth.png`
});

// Bereits ausgearbeitete Gegenakten bleiben die kanonische Bildquelle
// gemeinsamer Weltpersonen. Neutrale Silhouetten aus der Altquelle werden
// nicht als vermeintlich individuelle Porträts dupliziert.
export const HOUSE_BAEDD_PORTRAITS = Object.freeze({
  ...LOCAL_PORTRAITS,
  'dyfnwal-baedd': HOUSE_GRAWN_PORTRAITS['dyfnwal-baedd'],
  'anarawd-dienyddiwr': HOUSE_DIENYDDIWR_PORTRAITS['anarawd-dienyddiwr'],
  'llywarch-creyr': HOUSE_CREYR_PORTRAITS['llywarch-creyr'],
  'rhun-baedd': HOUSE_LLWYNOG_PORTRAITS['rhun-baedd'],
  'idwal-baedd': HOUSE_DYNGWN_PORTRAITS['idwal-baedd'],
  'endelyn-dyngwn': HOUSE_DYNGWN_PORTRAITS['endelyn-dyngwn'],
  'cei-baedd': HOUSE_GRAWN_PORTRAITS['cei-baedd'],
  'elin-grawn': HOUSE_GRAWN_PORTRAITS['elin-grawn'],
  'kerenza-baedd': HOUSE_MARCHOG_PORTRAITS['kerenza-baedd'],
  'maddox-marchog': HOUSE_MARCHOG_PORTRAITS['maddox-marchog'],
  'arthwr-baedd': HOUSE_BLACH_PORTRAITS['arthwr-baedd'],
  'gwerful-blach': HOUSE_BLACH_PORTRAITS['gwerful-blach']
});
