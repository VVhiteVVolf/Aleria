import { HOUSE_BAEDD_PORTRAITS } from './house-baedd-portraits.js';
import { HOUSE_DIENYDDIWR_PORTRAITS } from './house-dienyddiwr-portraits.js';
import { HOUSE_GRAWN_PORTRAITS } from './house-grawn-portraits.js';
import { HOUSE_PENDERYN_PORTRAITS } from './house-penderyn-portraits.js';
import { HOUSE_WYRM_PORTRAITS } from './house-wyrm-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-sgwarnog';

export const HOUSE_SGWARNOG_LOCAL_PORTRAIT_IDS = Object.freeze([
  'alastar-mac-eala',
  'edern-selwyn',
  'ewynn-unigol',
  'gwenya-gwarchod',
  'gwydion-crefyddol',
  'iorwerth-chiffyddlon',
  'mabon-sgwarnog',
  'madog-sgwarnog',
  'mael-1725-sgwarnog',
  'mael-founder-sgwarnog',
  'main-sgwarnog',
  'march-sgwarnog',
  'marsaili-sgwarnog',
  'math-1719-sgwarnog',
  'mathonwy-sgwarnog',
  'mawr-sgwarnog',
  'medi-sgwarnog',
  'meghan-sgwarnog',
  'meical-sgwarnog',
  'meiriona-1679-sgwarnog',
  'menna-sgwarnog',
  'morganwg-sgwarnog',
  'orson-canwyll',
  'rhondda-chiffyddlon',
  'siana-crefyddol-sgwarnog'
]);

const PNG_PORTRAIT_IDS = new Set(['alastar-mac-eala']);

const LOCAL_PORTRAITS = Object.freeze(Object.fromEntries(
  HOUSE_SGWARNOG_LOCAL_PORTRAIT_IDS.map(personId => [
    personId,
    `${PORTRAIT_ROOT}/${personId}.${PNG_PORTRAIT_IDS.has(personId) ? 'png' : 'jpg'}`
  ])
));

// Bereits ausgearbeitete Gegenakten bleiben für gemeinsame Weltpersonen die
// kanonische Bildquelle. Wiederholte Standardsilhouetten werden ausgelassen.
export const HOUSE_SGWARNOG_PORTRAITS = Object.freeze({
  ...LOCAL_PORTRAITS,
  'maldwyn-sgwarnog': HOUSE_BAEDD_PORTRAITS['maldwyn-sgwarnog'],
  'uther-dienyddiwr': HOUSE_DIENYDDIWR_PORTRAITS['uther-dienyddiwr'],
  'morcant-sgwarnog': HOUSE_GRAWN_PORTRAITS['morcant-sgwarnog'],
  'gwendolyn-grawn': HOUSE_GRAWN_PORTRAITS['gwendolyn-grawn'],
  'meinir-sgwarnog': HOUSE_PENDERYN_PORTRAITS['meinir-sgwarnog'],
  'aneurin-penderyn': HOUSE_PENDERYN_PORTRAITS['aneurin-penderyn'],
  'mabli-swgarnog': HOUSE_WYRM_PORTRAITS['mabli-swgarnog'],
  'rhydian-wyrm': HOUSE_WYRM_PORTRAITS['rhydian-wyrm']
});
