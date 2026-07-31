import { HOUSE_ARTH_PORTRAITS } from './house-arth-portraits.js';
import { HOUSE_ILLEWOD_PORTRAITS } from './house-illewod-portraits.js';
import { HOUSE_PYSGOD_PORTRAITS } from './house-pysgod-portraits.js';
import { HOUSE_TIWNA_PORTRAITS } from './house-tiwna-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-brithyll';

export const HOUSE_BRITHYLL_LOCAL_PORTRAIT_FILES = Object.freeze({
  'gareth-brithyll': 'gareth-brithyll.png',
  'rhydian-brithyll': 'rhydian-brithyll.png',
  'cador-brithyll': 'cador-brithyll.png',
  'aneirin-brithyll': 'aneirin-brithyll.png',
  'gwladus-gwialen': 'gwladus-gwialen.png',
  'heveydd-gwenyen': 'heveydd-gwenyen.png',
  'pedr-brithyll': 'pedr-brithyll.png',
  'ifwin-brithyll': 'ifwin-brithyll.png',
  'tomos-brithyll': 'tomos-brithyll.png',
  'llwellyn-brithyll': 'llwellyn-brithyll.png',
  'llewella-brithyll': 'llewella-brithyll.png',
  'llwyn-draenog': 'llwyn-draenog.jpg',
  'arwen-wivern': 'arwen-wivern.jpg',
  'aneurin-morfil': 'aneurin-morfil.png',
  'categirn-1695-brithyll': 'categirn-1695-brithyll.png',
  'erin-brithyll': 'erin-brithyll.png',
  'ithail-brithyll': 'ithail-brithyll.png',
  'ysbail-brithyll': 'ysbail-brithyll.png',
  'efan-brithyll': 'efan-brithyll.png',
  'jenkin-brithyll': 'jenkin-brithyll.png',
  'gwenllian-brithyll': 'gwenllian-brithyll.png',
  'ranva-silberzunge': 'ranva-silberzunge.png',
  'lucan-coedwig': 'lucan-coedwig.jpg',
  'maygan-blodeuwedd': 'maygan-blodeuwedd.png',
  'tara-treada': 'tara-treada.jpg',
  'ossian-blaidd': 'ossian-blaidd.png',
  'aled-brithyll': 'aled-brithyll.png',
  'iona-brithyll': 'iona-brithyll.png',
  'cai-brithyll': 'cai-brithyll.png',
  'una-brithyll': 'una-brithyll.png',
  'math-brithyll': 'math-brithyll.png',
  'iola-brithyll': 'iola-brithyll.png',
  'paddy-brithyll': 'paddy-brithyll.png',
  'eleri-brithyll': 'eleri-brithyll.png',
  'uri-brithyll': 'uri-brithyll.png',
  'undeg-brithyll': 'undeg-brithyll.png'
});

const LOCAL_PORTRAITS = Object.freeze(Object.fromEntries(
  Object.entries(HOUSE_BRITHYLL_LOCAL_PORTRAIT_FILES).map(([personId, fileName]) => [
    personId,
    `${PORTRAIT_ROOT}/${fileName}`
  ])
));

// Bereits ausgearbeitete Gegenakten bleiben die kanonische Bildquelle geteilter
// Weltpersonen. Die wiederholten Standardsilhouetten der Altquelle werden nicht
// als vermeintlich individuelle Porträts abgelegt.
export const HOUSE_BRITHYLL_PORTRAITS = Object.freeze({
  ...LOCAL_PORTRAITS,
  'custenin-brithyll': HOUSE_TIWNA_PORTRAITS['custenin-brithyll'],
  'galahad-arth': HOUSE_ARTH_PORTRAITS['galahad-arth'],
  'meical-illewod': HOUSE_ILLEWOD_PORTRAITS['meical-illewod'],
  'enfys-pysgod': HOUSE_PYSGOD_PORTRAITS['enfys-pysgod'],
  'gereint-pysgod': HOUSE_PYSGOD_PORTRAITS['gereint-pysgod'],
  'rhiwallaun-brithyll': HOUSE_PYSGOD_PORTRAITS['rhiwallaun-brithyll']
});
