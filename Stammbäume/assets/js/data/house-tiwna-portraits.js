import { HOUSE_BLACH_PORTRAITS } from './house-blach-portraits.js';
import { HOUSE_CANWYLL_PORTRAITS } from './house-canwyll-portraits.js';
import { HOUSE_CHIFFYDDLON_PORTRAITS } from './house-chiffyddlon-portraits.js';
import { HOUSE_CREFYDDOL_PORTRAITS } from './house-crefyddol-portraits.js';
import { HOUSE_CREYR_PORTRAITS } from './house-creyr-portraits.js';
import { HOUSE_DIENYDDIWR_PORTRAITS } from './house-dienyddiwr-portraits.js';
import { HOUSE_DINEFWR_PORTRAITS } from './house-dinefwr-portraits.js';
import { HOUSE_DYNGWN_PORTRAITS } from './house-dyngwn-portraits.js';
import { HOUSE_LLWYNOG_PORTRAITS } from './house-llwynog-portraits.js';
import { HOUSE_MORFORWYN_PORTRAITS } from './house-morforwyn-portraits.js';
import { HOUSE_NEIDR_PORTRAITS } from './house-neidr-portraits.js';
import { HOUSE_SAITH_PORTRAITS } from './house-saith-portraits.js';
import { HOUSE_WYLAN_PORTRAITS } from './house-wylan-portraits.js';
import { HOUSE_WYRM_PORTRAITS } from './house-wyrm-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-tiwna';

export const HOUSE_TIWNA_LOCAL_PORTRAIT_FILES = Object.freeze({
  'caradoc-tiwna': 'caradoc-tiwna.png',
  'brannock-tiwna': 'brannock-tiwna.png',
  'meredydd-coedwig': 'meredydd-coedwig.jpg',
  'madoc-tiwna': 'madoc-tiwna.png',
  'eiddon-tiwna': 'eiddon-tiwna.png',
  'custenin-brithyll': 'custenin-brithyll.png',
  'gavin-tiwna': 'gavin-tiwna.png',
  'trahaearn-tiwna': 'trahaearn-tiwna.png',
  'aengus-cuilen': 'aengus-cuilen.jpg',
  'cynfarch-tiwna': 'cynfarch-tiwna.png',
  'uaine-erskine': 'uaine-erskine.jpg',
  'caitrin-tiwna': 'caitrin-tiwna.png',
  'yorath-pyrth': 'yorath-pyrth.png',
  'andras-tiwna': 'andras-tiwna.png',
  'tharwynn-tiwna': 'tharwynn-tiwna.png',
  'seren-tiwna': 'seren-tiwna.png',
  'glyndwr-tiwna': 'glyndwr-tiwna.png',
  'morfydd-tiwna': 'morfydd-tiwna.png',
  'ystrad-tiwna': 'ystrad-tiwna.png',
  'cadwy-tiwna': 'cadwy-tiwna.png',
  'ysgol-tiwna': 'ysgol-tiwna.png',
  'garmon-tiwna': 'garmon-tiwna.png',
  'llio-tiwna': 'llio-tiwna.png',
  'cefin-tiwna': 'cefin-tiwna.png',
  'sian-tiwna': 'sian-tiwna.png'
});

const LOCAL_PORTRAITS = Object.freeze(Object.fromEntries(
  Object.entries(HOUSE_TIWNA_LOCAL_PORTRAIT_FILES).map(([personId, fileName]) => [
    personId,
    `${PORTRAIT_ROOT}/${fileName}`
  ])
));

// Bereits ausgearbeitete Gegenakten bleiben die kanonische Bildquelle ihrer
// Weltpersonen. Nur bislang unbelegte Individualporträts liegen im Tiwna-Ordner.
export const HOUSE_TIWNA_PORTRAITS = Object.freeze({
  ...LOCAL_PORTRAITS,
  'morholt-pysgod': HOUSE_NEIDR_PORTRAITS['morholt-pysgod'],
  'caitrin-neidr': HOUSE_NEIDR_PORTRAITS['caitrin-neidr'],
  'howell-canwyll': HOUSE_CANWYLL_PORTRAITS['howell-canwyll'],
  'cynwrig-canwyll': HOUSE_CANWYLL_PORTRAITS['cynwrig-canwyll'],
  'caled-tiwna': HOUSE_WYLAN_PORTRAITS['caled-tiwna'],
  'gildas-neidr': HOUSE_NEIDR_PORTRAITS['gildas-neidr'],
  'gwalchmai-tiwna': HOUSE_CREFYDDOL_PORTRAITS['gwalchmai-tiwna'],
  'efrawg-tiwna': HOUSE_MORFORWYN_PORTRAITS['efrawg-tiwna'],
  'sioned-morforwyn': HOUSE_MORFORWYN_PORTRAITS['sioned-morforwyn'],
  'gwilym-chiffyddlon': HOUSE_CHIFFYDDLON_PORTRAITS['gwilym-chiffyddlon'],
  'gwynfor-dienyddiwr': HOUSE_DIENYDDIWR_PORTRAITS['gwynfor-dienyddiwr'],
  'tarian-tiwna': HOUSE_LLWYNOG_PORTRAITS['tarian-tiwna'],
  'edwynna-llwynog': HOUSE_LLWYNOG_PORTRAITS['edwynna-llwynog'],
  'evan-dinefwr': HOUSE_DINEFWR_PORTRAITS['evan-dinefwr'],
  'morholt-tiwna': HOUSE_NEIDR_PORTRAITS['morholt-tiwna'],
  'dilwen-neidr': HOUSE_NEIDR_PORTRAITS['dilwen-neidr'],
  'morien-tiwna': HOUSE_BLACH_PORTRAITS['morien-tiwna'],
  'betws-blach': HOUSE_BLACH_PORTRAITS['betws-blach'],
  'bran-tiwna': HOUSE_SAITH_PORTRAITS['bran-tiwna'],
  'lyabelle-saith': HOUSE_SAITH_PORTRAITS['lyabelle-saith'],
  'aeddan-tiwna': HOUSE_DYNGWN_PORTRAITS['aeddan-tiwna'],
  'ystafel-dyngwn': HOUSE_DYNGWN_PORTRAITS['ystafel-dyngwn'],
  'cadfan-tiwna': HOUSE_WYRM_PORTRAITS['cadfan-tiwna'],
  'aelwyd-wyrm': HOUSE_WYRM_PORTRAITS['aelwyd-wyrm'],
  'olwyna-tiwna': HOUSE_CREYR_PORTRAITS['olwyna-tiwna'],
  'meilyr-creyr': HOUSE_CREYR_PORTRAITS['meilyr-creyr']
});
