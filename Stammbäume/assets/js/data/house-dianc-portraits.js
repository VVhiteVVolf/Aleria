import { HOUSE_ARTH_PORTRAITS } from './house-arth-portraits.js';
import { HOUSE_BLAIDD_PORTRAITS } from './house-blaidd-portraits.js';
import { HOUSE_BLODYN_PORTRAITS } from './house-blodyn-portraits.js';
import { HOUSE_CRAFANC_PORTRAITS } from './house-crafanc-portraits.js';
import { HOUSE_ILLYGODEN_PORTRAITS } from './house-illygoden-portraits.js';
import { HOUSE_LYFANT_PORTRAITS } from './house-lyfant-portraits.js';
import { HOUSE_MOCHDAER_PORTRAITS } from './house-mochdaer-portraits.js';
import { HOUSE_PYSGOD_PORTRAITS } from './house-pysgod-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-dianc';

export const HOUSE_DIANC_LOCAL_PORTRAIT_FILES = Object.freeze({
  'newyddllyn-arfordir': 'newyddllyn-arfordir.png',
  'kyvwlch-dianc': 'kyvwlch-dianc.png',
  'mawr-bochdew': 'mawr-bochdew.png',
  'itan-dianc': 'itan-dianc.png',
  'ehangwen-crwynog': 'ehangwen-crwynog.png',
  'carantec-dianc': 'carantec-dianc.png',
  'ysgonan-dianc': 'ysgonan-dianc.png',
  'werbenec-dianc': 'werbenec-dianc.png',
  'trevar-dianc': 'trevar-dianc.png',
  'prys-bochdew': 'prys-bochdew.png',
  'marn-dianc': 'marn-dianc.png',
  'gwenifer-dianc': 'gwenifer-dianc.png',
  'barry-dianc': 'barry-dianc.png',
  'dewi-dianc': 'dewi-dianc.png',
  'ened-dianc': 'ened-dianc.png',
  'delwyn-dianc': 'delwyn-dianc.png'
});

export const HOUSE_DIANC_PORTRAIT_SOURCES = Object.freeze({
  'newyddllyn-arfordir': 'https://i.imgur.com/t9w2M8r.png',
  'kyvwlch-dianc': 'https://i.imgur.com/bFVjbEE.png',
  'mawr-bochdew': 'https://i.imgur.com/hgaa9vc.png',
  'itan-dianc': 'https://i.imgur.com/tZiQbGA.png',
  'ehangwen-crwynog': 'https://i.imgur.com/GnGCn1r.png',
  'carantec-dianc': 'https://i.imgur.com/Q6Usb3w.png',
  'ysgonan-dianc': 'https://i.imgur.com/jhNIycc.png',
  'werbenec-dianc': 'https://i.imgur.com/fb9FLEO.png',
  'trevar-dianc': 'https://i.imgur.com/tPRynYv.png',
  'prys-bochdew': 'https://i.imgur.com/wxpND8w.png',
  'marn-dianc': 'https://i.imgur.com/5ibH0Rj.png',
  'gwenifer-dianc': 'https://i.imgur.com/7OBhqVL.png',
  'barry-dianc': 'https://i.imgur.com/znLAwux.png',
  'dewi-dianc': 'https://i.imgur.com/4QJaGwV.png',
  'ened-dianc': 'https://i.imgur.com/nTND00X.png',
  'delwyn-dianc': 'https://i.imgur.com/UnIVxNc.png'
});

const LOCAL_PORTRAITS = Object.freeze(Object.fromEntries(
  Object.entries(HOUSE_DIANC_LOCAL_PORTRAIT_FILES).map(([personId, fileName]) => [
    personId,
    `${PORTRAIT_ROOT}/${fileName}`
  ])
));

// Bereits ausgearbeitete Gegenakten bleiben die kanonische Bildquelle für
// dieselbe Weltperson. Wiederholte Standardsilhouetten der Altquelle werden
// bewusst nicht als vermeintlich individuelle Portraits importiert.
const SHARED_PORTRAITS = Object.freeze({
  'arthfael-dianc': HOUSE_BLODYN_PORTRAITS['arthfael-dianc'],
  'gwendolen-blodyn': HOUSE_BLODYN_PORTRAITS['gwendolen-blodyn'],
  'kynwrig-dianc': HOUSE_BLODYN_PORTRAITS['kynwrig-dianc'],
  'myfanwy-1618-blodyn': HOUSE_BLODYN_PORTRAITS['myfanwy-1618-blodyn'],
  'gareth-dianc': HOUSE_ARTH_PORTRAITS['gareth-dianc'],
  'macsen-lyfant': HOUSE_LYFANT_PORTRAITS['macsen-lyfant'],
  'sywlch-dianc': HOUSE_ILLYGODEN_PORTRAITS['sywlch-dianc'],
  'mairwen-dianc': HOUSE_PYSGOD_PORTRAITS['mairwen-dianc'],
  'idris-pysgod': HOUSE_PYSGOD_PORTRAITS['idris-pysgod'],
  'caron-dianc': HOUSE_BLAIDD_PORTRAITS['caron-dianc'],
  'pelleas-blaidd': HOUSE_BLAIDD_PORTRAITS['pelleas-blaidd'],
  'cerny-dianc': HOUSE_BLODYN_PORTRAITS['cerny-dianc'],
  'yhon-blodyn': HOUSE_BLODYN_PORTRAITS['yhon-blodyn'],
  'gingalain-dianc': HOUSE_CRAFANC_PORTRAITS['gingalain-dianc'],
  'glaw-crafanc': HOUSE_CRAFANC_PORTRAITS['glaw-crafanc'],
  'murvin-dianc': HOUSE_MOCHDAER_PORTRAITS['murvin-dianc'],
  'vanna-mochdaer': HOUSE_MOCHDAER_PORTRAITS['vanna-mochdaer']
});

export const HOUSE_DIANC_PORTRAITS = Object.freeze({
  ...LOCAL_PORTRAITS,
  ...Object.fromEntries(Object.entries(SHARED_PORTRAITS).filter(([, portrait]) => portrait))
});
