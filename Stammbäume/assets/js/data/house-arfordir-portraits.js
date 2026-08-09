import { HOUSE_ARTH_PORTRAITS } from './house-arth-portraits.js';
import { HOUSE_BLAIDD_PORTRAITS } from './house-blaidd-portraits.js';
import { HOUSE_BLODYN_PORTRAITS } from './house-blodyn-portraits.js';
import { HOUSE_CRAFANC_PORTRAITS } from './house-crafanc-portraits.js';
import { HOUSE_DIANC_PORTRAITS } from './house-dianc-portraits.js';
import { HOUSE_GWAEDLYD_PORTRAITS } from './house-gwaedlyd-portraits.js';
import { HOUSE_LYFANT_PORTRAITS } from './house-lyfant-portraits.js';
import { HOUSE_MOCHDAER_PORTRAITS } from './house-mochdaer-portraits.js';
import { HOUSE_PYSGOD_PORTRAITS } from './house-pysgod-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-arfordir';

export const HOUSE_ARFORDIR_LOCAL_PORTRAIT_FILES = Object.freeze({
  'llaesgwynyn-walwrs': 'llaesgwynyn-walwrs.jpg',
  'arglwydd-arfordir': 'arglwydd-arfordir.png',
  'thalen-arfordir': 'thalen-arfordir.png',
  'dalvin-bochdew': 'dalvin-bochdew.png',
  'leodegrance-arfordir': 'leodegrance-arfordir.png',
  'malltwyn-arfordir': 'malltwyn-arfordir.png',
  'trevor-1702-arfordir': 'trevor-1702-arfordir.png',
  'maldwyn-morgryn': 'maldwyn-morgryn.png',
  'heston-arfordir': 'heston-arfordir.png',
  'reece-arfordir': 'reece-arfordir.png',
  'huw-arfordir': 'huw-arfordir.png',
  'roderick-arfordir': 'roderick-arfordir.png'
});

export const HOUSE_ARFORDIR_PORTRAIT_SOURCES = Object.freeze({
  'llaesgwynyn-walwrs': 'https://64.media.tumblr.com/b278a6094f299a17ee53f80db73b3151/5cb9705b68b3ce6b-c2/s250x400/9aacaa5d92c8ded033be429668b13dba309a55c9.pnj',
  'arglwydd-arfordir': 'https://i.imgur.com/WEP8ckh.png',
  'thalen-arfordir': 'https://i.imgur.com/3A7enFm.png',
  'dalvin-bochdew': 'https://i.imgur.com/OhWcZt5.png',
  'leodegrance-arfordir': 'https://i.imgur.com/8Rr4eEt.png',
  'malltwyn-arfordir': 'https://i.imgur.com/iZHRhdl.png',
  'trevor-1702-arfordir': 'https://i.imgur.com/a3rnPes.png',
  'maldwyn-morgryn': 'https://i.imgur.com/s8hVZhI.png',
  'heston-arfordir': 'https://i.imgur.com/cjOcyC1.png',
  'reece-arfordir': 'https://i.imgur.com/dirTjFg.png',
  'huw-arfordir': 'https://i.imgur.com/EPE7oiO.png',
  'roderick-arfordir': 'https://i.imgur.com/AOYaOLk.png'
});

const LOCAL_PORTRAITS = Object.freeze(Object.fromEntries(
  Object.entries(HOUSE_ARFORDIR_LOCAL_PORTRAIT_FILES).map(([personId, fileName]) => [
    personId,
    `${PORTRAIT_ROOT}/${fileName}`
  ])
));

// Bereits ausgearbeitete Gegenakten bleiben für dieselbe Weltperson die
// kanonische Bildquelle. Die beiden wiederholten Standardsilhouetten der
// Altquelle werden bewusst nicht als individuelle Portraits importiert.
const SHARED_PORTRAITS = Object.freeze({
  'ysbryd-arfordir': HOUSE_BLODYN_PORTRAITS['ysbryd-arfordir'],
  'tudurwen-blodyn': HOUSE_BLODYN_PORTRAITS['tudurwen-blodyn'],
  'seissylwch-arfordir': HOUSE_BLAIDD_PORTRAITS['seissylwch-arfordir'],
  'merfin-pysgod': HOUSE_PYSGOD_PORTRAITS['merfin-pysgod'],
  'newyddllyn-arfordir': HOUSE_DIANC_PORTRAITS['newyddllyn-arfordir'],
  'marmaduke-mochdaer': HOUSE_MOCHDAER_PORTRAITS['marmaduke-mochdaer'],
  'carantec-dianc': HOUSE_DIANC_PORTRAITS['carantec-dianc'],
  'griff-arth': HOUSE_ARTH_PORTRAITS['griff-arth'],
  'luc-arfordir': HOUSE_GWAEDLYD_PORTRAITS['luc-arfordir'],
  'arianrhod-gwaedlyd': HOUSE_GWAEDLYD_PORTRAITS['arianrhod-gwaedlyd'],
  'micah-arfordir': HOUSE_BLODYN_PORTRAITS['micah-arfordir'],
  'meggan-blodyn': HOUSE_BLODYN_PORTRAITS['meggan-blodyn'],
  'madoc-arfordir': HOUSE_CRAFANC_PORTRAITS['madoc-arfordir'],
  'glesni-crafanc': HOUSE_CRAFANC_PORTRAITS['glesni-crafanc'],
  'meredithe-arfordir': HOUSE_BLAIDD_PORTRAITS['meredithe-arfordir'],
  'taran-blaidd': HOUSE_BLAIDD_PORTRAITS['taran-blaidd'],
  'morgana-arfordir': HOUSE_LYFANT_PORTRAITS['morgana-arfordir'],
  'yale-lyfant': HOUSE_LYFANT_PORTRAITS['yale-lyfant']
});

export const HOUSE_ARFORDIR_PORTRAITS = Object.freeze({
  ...LOCAL_PORTRAITS,
  ...Object.fromEntries(Object.entries(SHARED_PORTRAITS).filter(([, portrait]) => portrait))
});
