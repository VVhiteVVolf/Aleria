import { HOUSE_ADERYN_PORTRAITS } from './house-aderyn-portraits.js';
import { HOUSE_DINEFWR_PORTRAITS } from './house-dinefwr-portraits.js';
import { HOUSE_ERYR_PORTRAITS } from './house-eryr-portraits.js';
import { HOUSE_HEBOG_PORTRAITS } from './house-hebog-portraits.js';
import { HOUSE_MWYALCHEN_PORTRAITS } from './house-mwyalchen-portraits.js';
import { HOUSE_TYLLUAN_PORTRAITS } from './house-tylluan-portraits.js';
import { HOUSE_SLIABH_LOCAL_PORTRAITS } from './house-sliabh-local-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-ilyuncu';

export const HOUSE_ILYUNCU_LOCAL_PORTRAIT_FILES = Object.freeze({
  'bogus-ilyuncu': 'bogus-ilyuncu.png'
});

const LOCAL_PORTRAITS = Object.freeze(Object.fromEntries(
  Object.entries(HOUSE_ILYUNCU_LOCAL_PORTRAIT_FILES).map(([personId, fileName]) => [
    personId,
    `${PORTRAIT_ROOT}/${fileName}`
  ])
));

// Bereits ausgearbeitete Gegenakten bleiben die kanonische Bildquelle. Damit
// wird jede Weltperson mit demselben Porträt gezeigt, ohne Dateien zu kopieren.
// Ciaras Individualporträt stammt aus der nun ausgearbeiteten Sliabh-Akte.
export const HOUSE_ILYUNCU_PORTRAITS = Object.freeze({
  ...LOCAL_PORTRAITS,
  'merfyn-aderyn': HOUSE_ADERYN_PORTRAITS['merfyn-aderyn'],
  'meriel-gaeth': HOUSE_ADERYN_PORTRAITS['meriel-gaeth'],
  'gildas-ilyuncu': HOUSE_HEBOG_PORTRAITS['gildas-ilyuncu'],
  'saeth-hebog': HOUSE_HEBOG_PORTRAITS['saeth-hebog'],
  'ywen-ilyuncu': HOUSE_DINEFWR_PORTRAITS['ywen-ilyuncu'],
  'gaven-dinefwr': HOUSE_DINEFWR_PORTRAITS['gaven-dinefwr'],
  'brynthan-ilyuncu': HOUSE_ERYR_PORTRAITS['brynthan-ilyuncu'],
  'sian-eryr': HOUSE_ERYR_PORTRAITS['sian-eryr'],
  'tesni-ilyuncu': HOUSE_TYLLUAN_PORTRAITS['tesni-ilyuncu'],
  'madoc-tylluan': HOUSE_TYLLUAN_PORTRAITS['madoc-tylluan'],
  'bevan-ilyuncu': HOUSE_MWYALCHEN_PORTRAITS['bevan-ilyuncu'],
  'tirion-mwyalchen': HOUSE_MWYALCHEN_PORTRAITS['tirion-mwyalchen'],
  'marvin-ilyuncu': HOUSE_ADERYN_PORTRAITS['marvin-ilyuncu'],
  'wula-aderyn': HOUSE_ADERYN_PORTRAITS['wula-aderyn'],
  'ciara-sliabh': HOUSE_SLIABH_LOCAL_PORTRAITS['ciara-sliabh']
});
