import { HOUSE_GOLDGLANZ_PORTRAITS } from './house-goldglanz-portraits.js';
import { HOUSE_KUMMERHERZ_PORTRAITS } from './house-kummerherz-portraits.js';
import { HOUSE_SCHATTENHERZ_PORTRAITS } from './house-schattenherz-portraits.js';
import { HOUSE_SOEKEREN_PORTRAITS } from './house-soekeren-portraits.js';
import { HOUSE_TRACHWYLL_PORTRAITS } from './house-trachwyll-portraits.js';
import { HOUSE_VAEREN_PORTRAITS } from './house-vaeren-portraits.js';
import { HOUSE_WARGH_PORTRAITS } from './house-wargh-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-wellenschild';

export const HOUSE_WELLENSCHILD_LOCAL_PORTRAIT_FILES = Object.freeze({
  'thord-wellenschild': 'thord-wellenschild.png',
  'gunnar-wellensaenger': 'gunnar-wellensaenger.png',
  'fritjof-wellenschild': 'fritjof-wellenschild.png',
  'fenrir-wellenschild': 'fenrir-wellenschild.png',
  'jorleif-gullvig': 'jorleif-gullvig.png',
  'torben-wellenschild': 'torben-wellenschild.png',
  'yrska-wellenschild': 'yrska-wellenschild.png',
  'kalfur-wellenschild': 'kalfur-wellenschild.png',
  'marit-eibenschild': 'marit-eibenschild.png',
  'thorin-eibenschild': 'thorin-eibenschild.png',
  'hakon-riesentot': 'hakon-riesentot.png',
  'reidar-wellenschild': 'reidar-wellenschild.png',
  'othrik-wellenschild': 'othrik-wellenschild.png',
  'kormak-sturmgeborener': 'kormak-sturmgeborener.png',
  'tjelvar-wellenschild': 'tjelvar-wellenschild.png',
  'asgeir-wellenschild': 'asgeir-wellenschild.png',
  'lornir-wellenschild': 'lornir-wellenschild.png',
  'zorrik-wellenschild': 'zorrik-wellenschild.png',
  'ivana-wellensaenger': 'ivana-wellensaenger.png',
  'hroar-wellenschild': 'hroar-wellenschild.png',
  'ulla-wellenschild': 'ulla-wellenschild.png',
  'logi-wellenschild': 'logi-wellenschild.png',
  'rinda-wellenschild': 'rinda-wellenschild.png',
  'kolli-wellenschild': 'kolli-wellenschild.png',
  'oda-wellenschild': 'oda-wellenschild.png',
  'drott-wellenschild': 'drott-wellenschild.png'
});

export const HOUSE_WELLENSCHILD_PORTRAIT_SOURCES = Object.freeze({
  'thord-wellenschild': 'https://i.imgur.com/hKll0FW.png',
  'gunnar-wellensaenger': 'https://i.imgur.com/lksUUnY.png',
  'fritjof-wellenschild': 'https://i.imgur.com/nrBXpbH.png',
  'fenrir-wellenschild': 'https://i.imgur.com/hU8hcG9.png',
  'jorleif-gullvig': 'https://i.imgur.com/e38Vc4f.png',
  'torben-wellenschild': 'https://i.imgur.com/oi1XA6C.png',
  'yrska-wellenschild': 'https://i.imgur.com/g6o9kDx.png',
  'kalfur-wellenschild': 'https://i.imgur.com/FTEM5gk.png',
  'marit-eibenschild': 'https://i.imgur.com/vO4g7tT.png',
  'thorin-eibenschild': 'https://i.imgur.com/s7vpWCD.png',
  'hakon-riesentot': 'https://i.imgur.com/JQqKEFO.png',
  'reidar-wellenschild': 'https://i.imgur.com/HX5X0AX.png',
  'othrik-wellenschild': 'https://i.imgur.com/LBqoOPv.png',
  'kormak-sturmgeborener': 'https://i.imgur.com/ZYWxEfc.png',
  'tjelvar-wellenschild': 'https://i.imgur.com/0PAHUXX.png',
  'asgeir-wellenschild': 'https://i.imgur.com/CG1MYwD.png',
  'lornir-wellenschild': 'https://i.imgur.com/NOU5wuH.png',
  'zorrik-wellenschild': 'https://i.imgur.com/RxQVTt3.png',
  'ivana-wellensaenger': 'https://i.imgur.com/s7jQrF8.png',
  'hroar-wellenschild': 'https://i.imgur.com/CUK2ABA.png',
  'ulla-wellenschild': 'https://i.imgur.com/CDu4DqJ.png',
  'logi-wellenschild': 'https://i.imgur.com/cIQGQ1n.png',
  'rinda-wellenschild': 'https://i.imgur.com/HDOXSgz.png',
  'kolli-wellenschild': 'https://i.imgur.com/6eUYCkr.png',
  'oda-wellenschild': 'https://i.imgur.com/HNVHg5s.png',
  'drott-wellenschild': 'https://i.imgur.com/m0eNxqQ.png'
});

const LOCAL_PORTRAITS = Object.freeze(Object.fromEntries(
  Object.entries(HOUSE_WELLENSCHILD_LOCAL_PORTRAIT_FILES).map(([personId, fileName]) => [
    personId,
    `${PORTRAIT_ROOT}/${fileName}`
  ])
));

export const HOUSE_WELLENSCHILD_PORTRAITS = Object.freeze({
  ...LOCAL_PORTRAITS,
  'yrsvard-wellenschild': HOUSE_VAEREN_PORTRAITS['yrsvard-wellenschild'],
  'sturlaug-soekeren': HOUSE_SOEKEREN_PORTRAITS['sturlaug-soekeren'],
  'owain-trachwyll': HOUSE_TRACHWYLL_PORTRAITS['owain-trachwyll'],
  'finnleik-kummerherz': HOUSE_KUMMERHERZ_PORTRAITS['finnleik-kummerherz'],
  'laufey-wellenschild': HOUSE_WARGH_PORTRAITS['laufey-wellenschild'],
  'hallbjorn-wargh': HOUSE_WARGH_PORTRAITS['hallbjorn-wargh'],
  'martein-wellenschild': HOUSE_GOLDGLANZ_PORTRAITS['martein-wellenschild'],
  'gulda-1682-goldglanz': HOUSE_GOLDGLANZ_PORTRAITS['gulda-1682-goldglanz'],
  'brogan-wellenschild': HOUSE_SCHATTENHERZ_PORTRAITS['brogan-wellenschild'],
  'tjalda-schattenherz': HOUSE_SCHATTENHERZ_PORTRAITS['tjalda-schattenherz'],
  'inga-wellenschild': HOUSE_SCHATTENHERZ_PORTRAITS['inga-wellenschild']
});
