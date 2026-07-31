import { HOUSE_ADERYN_PORTRAITS } from './house-aderyn-portraits.js';
import { HOUSE_BAEDD_PORTRAITS } from './house-baedd-portraits.js';
import { HOUSE_CHIFFYDDLON_PORTRAITS } from './house-chiffyddlon-portraits.js';
import { HOUSE_ILLYSYWEN_PORTRAITS } from './house-illysywen-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-eryr';

export const HOUSE_ERYR_LOCAL_PORTRAIT_FILES = Object.freeze({
  'eiddyl-eryr': 'eiddyl-eryr.png',
  'wyndham-eryr': 'wyndham-eryr.png',
  'cynfelyn-eryr': 'cynfelyn-eryr.png',
  'glyndwr-eryr': 'glyndwr-eryr.png',
  'gruffyd-eryr': 'gruffyd-eryr.png',
  'venora-eryr': 'venora-eryr.png',
  'enevold-eryr': 'enevold-eryr.png',
  'ellis-eryr': 'ellis-eryr.png',
  'carwyn-mwyalchen-eryr': 'carwyn-mwyalchen-eryr.png',
  'bowen-tylluan': 'bowen-tylluan.png',
  'ewynn-hebog-eryr': 'ewynn-hebog-eryr.png',
  'daffyd-eryr': 'daffyd-eryr.png',
  'quellyn-eryr': 'quellyn-eryr.png',
  'victaryon-eryr': 'victaryon-eryr.png',
  'meriel-eryr': 'meriel-eryr.png',
  'artus-eryr': 'artus-eryr.png',
  'rhian-gaeth-eryr': 'rhian-gaeth-eryr.png',
  'rhyannon-gaeth-eryr': 'rhyannon-gaeth-eryr.png',
  'aksel-feuerhaar': 'aksel-feuerhaar.png',
  'aled-eryr': 'aled-eryr.png',
  'aeron-1715-eryr': 'aeron-1715-eryr.png',
  'sian-eryr': 'sian-eryr.png',
  'euron-eryr': 'euron-eryr.png',
  'balon-eryr': 'balon-eryr.png',
  'aysha-eryr': 'aysha-eryr.png',
  'quenton-eryr': 'quenton-eryr.png',
  'brynthan-ilyuncu': 'brynthan-ilyuncu.png',
  'catwan-aderyn': 'catwan-aderyn.png'
});

const LOCAL_PORTRAITS = Object.freeze(Object.fromEntries(
  Object.entries(HOUSE_ERYR_LOCAL_PORTRAIT_FILES).map(([personId, fileName]) => [
    personId,
    `${PORTRAIT_ROOT}/${fileName}`
  ])
));

// Bereits ausgearbeitete Gegenakten bleiben für gemeinsam dargestellte
// Weltpersonen die kanonische Bildquelle. Wiederholte Standardsilhouetten aus
// der Altquelle werden bewusst nicht als individuelle Porträts importiert.
export const HOUSE_ERYR_PORTRAITS = Object.freeze({
  ...LOCAL_PORTRAITS,
  'aeron-aderyn': HOUSE_ADERYN_PORTRAITS['aeron-aderyn'],
  'rhianu-1266-spouse': HOUSE_ADERYN_PORTRAITS['rhianu-1266-spouse'],
  'siriol-aderyn': HOUSE_ADERYN_PORTRAITS['siriol-aderyn'],
  'ellanah-eryr': HOUSE_ILLYSYWEN_PORTRAITS['ellanah-eryr'],
  'llwyd-illysywen': HOUSE_ILLYSYWEN_PORTRAITS['llwyd-illysywen'],
  'sheev-eryr': HOUSE_CHIFFYDDLON_PORTRAITS['sheev-eryr'],
  'mererid-1657-chiffyddlon': HOUSE_CHIFFYDDLON_PORTRAITS['mererid-1657-chiffyddlon'],
  'malvina-eryr': HOUSE_BAEDD_PORTRAITS['malvina-eryr'],
  'kimbal-baedd': HOUSE_BAEDD_PORTRAITS['kimbal-baedd']
});
