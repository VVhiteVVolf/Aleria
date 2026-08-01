import { HOUSE_BRITHYLL_PORTRAITS } from './house-brithyll-portraits.js';
import { HOUSE_CREFYDDOL_PORTRAITS } from './house-crefyddol-portraits.js';
import { HOUSE_CREYR_PORTRAITS } from './house-creyr-portraits.js';
import { HOUSE_GWEFRYDD_PORTRAITS } from './house-gwefrydd-portraits.js';
import { HOUSE_GWIALEN_PORTRAITS } from './house-gwialen-portraits.js';
import { HOUSE_HWYADEN_PORTRAITS } from './house-hwyaden-portraits.js';
import { HOUSE_ILLEWOD_PORTRAITS } from './house-illewod-portraits.js';
import { HOUSE_MOCHDAER_PORTRAITS } from './house-mochdaer-portraits.js';
import { HOUSE_PYSGOD_PORTRAITS } from './house-pysgod-portraits.js';
import { HOUSE_PYRTH_PORTRAITS } from './house-pyrth-portraits.js';
import { HOUSE_SAETHWYR_PORTRAITS } from './house-saethwyr-portraits.js';
import { HOUSE_TIWNA_PORTRAITS } from './house-tiwna-portraits.js';
import { HOUSE_WYLAN_PORTRAITS } from './house-wylan-portraits.js';
import { HOUSE_WYRM_PORTRAITS } from './house-wyrm-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-coedwig';

export const HOUSE_COEDWIG_LOCAL_PORTRAIT_FILES = Object.freeze({
  'hoyer-founder-coedwig': 'hoyer-founder-coedwig.jpg',
  'rhodri-coedwig': 'rhodri-coedwig.jpg',
  'cynddelw-coedwig': 'cynddelw-coedwig.jpg',
  'morgan-coedwig': 'morgan-coedwig.jpg',
  'deiniol-draenog': 'deiniol-draenog.jpg',
  'traherne-coedwig': 'traherne-coedwig.jpg',
  'maeve-suiste': 'maeve-suiste.png',
  'brysia-coedwig': 'brysia-coedwig.jpg',
  'tegan-coedwig': 'tegan-coedwig.jpg',
  'alaw-coedwig': 'alaw-coedwig.jpg',
  'zachariah-coedwig': 'zachariah-coedwig.jpg',
  'caiomhe-wivern': 'caiomhe-wivern.jpg',
  'tutagual-crafanc': 'tutagual-crafanc.jpg',
  'bran-morfil': 'bran-morfil.png',
  'dolena-illygoden': 'dolena-illygoden.png',
  'tristyn-coedwig': 'tristyn-coedwig.jpg',
  'llew-coedwig': 'llew-coedwig.jpg',
  'mabon-coedwig': 'mabon-coedwig.jpg',
  'pebin-coedwig': 'pebin-coedwig.jpg',
  'tiwlip-coedwig': 'tiwlip-coedwig.jpg',
  'zara-coedwig': 'zara-coedwig.jpg',
  'aeron-coedwig': 'aeron-coedwig.jpg',
  'medi-coedwig': 'medi-coedwig.jpg',
  'mwyn-coedwig': 'mwyn-coedwig.jpg'
});

const LOCAL_PORTRAITS = Object.freeze(Object.fromEntries(
  Object.entries(HOUSE_COEDWIG_LOCAL_PORTRAIT_FILES).map(([personId, fileName]) => [
    personId,
    `${PORTRAIT_ROOT}/${fileName}`
  ])
));

// Weltpersonen mit bereits ausgearbeiteter Gegenakte behalten deren kanonischen
// Bildpfad. Die wiederholten Standardsilhouetten der Altquelle sind keine
// Individualporträts und werden bewusst nicht importiert.
export const HOUSE_COEDWIG_PORTRAITS = Object.freeze({
  ...LOCAL_PORTRAITS,
  'afal-coedwig': HOUSE_WYLAN_PORTRAITS['afal-coedwig'],
  'dyngannon-pyrth': HOUSE_PYRTH_PORTRAITS['dyngannon-pyrth'],
  'meredydd-coedwig': HOUSE_TIWNA_PORTRAITS['meredydd-coedwig'],
  'run-hwyaden': HOUSE_HWYADEN_PORTRAITS['run-hwyaden'],
  'arawn-coedwig': HOUSE_PYSGOD_PORTRAITS['arawn-coedwig'],
  'gruffyd-saethwyr': HOUSE_SAETHWYR_PORTRAITS['gruffyd-saethwyr'],
  'gareth-brithyll': HOUSE_BRITHYLL_PORTRAITS['gareth-brithyll'],
  'gwyneth-coedwig': HOUSE_BRITHYLL_PORTRAITS['gwyneth-coedwig'],
  'rhydian-brithyll': HOUSE_BRITHYLL_PORTRAITS['rhydian-brithyll'],
  'drudwas-mochdaer': HOUSE_MOCHDAER_PORTRAITS['drudwas-mochdaer'],
  'trahaern-coedwig': HOUSE_WYRM_PORTRAITS['trahaern-coedwig'],
  'celyn-wyrm': HOUSE_WYRM_PORTRAITS['celyn-wyrm'],
  'telyn-coedwig': HOUSE_CREFYDDOL_PORTRAITS['telyn-coedwig'],
  'lamorak-crefyddol': HOUSE_CREFYDDOL_PORTRAITS['lamorak-crefyddol'],
  'hoyer-coedwig': HOUSE_CREYR_PORTRAITS['hoyer-coedwig'],
  'meredid-creyr': HOUSE_CREYR_PORTRAITS['meredid-creyr'],
  'lucan-coedwig': HOUSE_BRITHYLL_PORTRAITS['lucan-coedwig'],
  'ysbail-brithyll': HOUSE_BRITHYLL_PORTRAITS['ysbail-brithyll'],
  'rhianedd-coedwig': HOUSE_GWIALEN_PORTRAITS['rhianedd-coedwig'],
  'cloten-gwialen': HOUSE_GWIALEN_PORTRAITS['cloten-gwialen'],
  'torri-coedwig': HOUSE_ILLEWOD_PORTRAITS['torri-coedwig'],
  'hedd-illewod': HOUSE_ILLEWOD_PORTRAITS['hedd-illewod'],
  'tyreke-coedwig': HOUSE_GWEFRYDD_PORTRAITS['tyreke-coedwig'],
  'gwendolen-gwefrydd': HOUSE_GWEFRYDD_PORTRAITS['gwendolen-gwefrydd'],
  'talan-gwaedlyd': 'assets/images/portraits/haus-gwaedlyd/talan-gwaedlyd.png'
});
