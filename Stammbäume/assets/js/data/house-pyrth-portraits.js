import { HOUSE_BAEDD_PORTRAITS } from './house-baedd-portraits.js';
import { HOUSE_CANWYLL_PORTRAITS } from './house-canwyll-portraits.js';
import { HOUSE_CREFYDDOL_PORTRAITS } from './house-crefyddol-portraits.js';
import { HOUSE_DIENYDDIWR_PORTRAITS } from './house-dienyddiwr-portraits.js';
import { HOUSE_GWEFRYDD_PORTRAITS } from './house-gwefrydd-portraits.js';
import { HOUSE_HWYADEN_PORTRAITS } from './house-hwyaden-portraits.js';
import { HOUSE_ILLYSYWEN_PORTRAITS } from './house-illysywen-portraits.js';
import { HOUSE_LLWYNOG_PORTRAITS } from './house-llwynog-portraits.js';
import { HOUSE_NEIDR_PORTRAITS } from './house-neidr-portraits.js';
import { HOUSE_SAITH_PORTRAITS } from './house-saith-portraits.js';
import { HOUSE_TIWNA_PORTRAITS } from './house-tiwna-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-pyrth';

export const HOUSE_PYRTH_LOCAL_PORTRAIT_FILES = Object.freeze({
  'dyngannon-pyrth': 'dyngannon-pyrth.png',
  'zygmunt-pyrth': 'zygmunt-pyrth.png',
  'iowaneth-pyrth': 'iowaneth-pyrth.png',
  'ysgonan-pyrth': 'ysgonan-pyrth.png',
  'josselin-pyrth': 'josselin-pyrth.png',
  'caryn-pyrth-spouse': 'caryn-pyrth-spouse.jpg',
  'wynward-pyrth': 'wynward-pyrth.png',
  'zedekiah-pyrth': 'zedekiah-pyrth.png',
  'dervla-coronach': 'dervla-coronach.jpg',
  'gwenda-pyrth-spouse': 'gwenda-pyrth-spouse.jpg',
  'wynford-pyrth': 'wynford-pyrth.png',
  'wynona-pyrth': 'wynona-pyrth.png',
  'wynstan-pyrth': 'wynstan-pyrth.png',
  'zeke-pyrth': 'zeke-pyrth.png',
  'iggy-pyrth': 'iggy-pyrth.png',
  'zoelle-pyrth': 'zoelle-pyrth.png',
  'wylma-pyrth': 'wylma-pyrth.png',
  'yolanda-pyrth': 'yolanda-pyrth.png'
});

const LOCAL_PORTRAITS = Object.freeze(Object.fromEntries(
  Object.entries(HOUSE_PYRTH_LOCAL_PORTRAIT_FILES).map(([personId, fileName]) => [
    personId,
    `${PORTRAIT_ROOT}/${fileName}`
  ])
));

// Bereits ausgearbeitete Gegenakten bleiben die kanonische Bildquelle ihrer
// Weltpersonen. Wiederholte Standardsilhouetten der Pyrth-Quelle werden nicht
// als vermeintlich individuelle Porträts importiert.
export const HOUSE_PYRTH_PORTRAITS = Object.freeze({
  ...LOCAL_PORTRAITS,
  'roderic-pyrth': HOUSE_NEIDR_PORTRAITS['roderic-pyrth'],
  'llynn-neidr': HOUSE_NEIDR_PORTRAITS['llynn-neidr'],
  'brinthan-pyrth': HOUSE_NEIDR_PORTRAITS['brinthan-pyrth'],
  'cadwallon-crefyddol': HOUSE_CREFYDDOL_PORTRAITS['cadwallon-crefyddol'],
  'ulysses-pyrth': HOUSE_DIENYDDIWR_PORTRAITS['ulysses-pyrth'],
  'leolin-canwyll': HOUSE_CANWYLL_PORTRAITS['leolin-canwyll'],
  'jethro-pyrth': HOUSE_CANWYLL_PORTRAITS['jethro-pyrth'],
  'ursyn-gwefrydd': HOUSE_GWEFRYDD_PORTRAITS['ursyn-gwefrydd'],
  'merlijn-saith': HOUSE_SAITH_PORTRAITS['merlijn-saith'],
  'maelyn-saith': HOUSE_SAITH_PORTRAITS['maelyn-saith'],
  'wynoc-pyrth': HOUSE_SAITH_PORTRAITS['wynoc-pyrth'],
  'yspaddaden-pyrth': HOUSE_LLWYNOG_PORTRAITS['yspaddaden-pyrth'],
  'arvonia-llwynog': HOUSE_LLWYNOG_PORTRAITS['arvonia-llwynog'],
  'xantippe-pyrth': HOUSE_ILLYSYWEN_PORTRAITS['xantippe-pyrth'],
  'einion-illysywen': HOUSE_ILLYSYWEN_PORTRAITS['einion-illysywen'],
  'catwg-hwyaden': HOUSE_HWYADEN_PORTRAITS['catwg-hwyaden'],
  'zenovia-pyrth': HOUSE_HWYADEN_PORTRAITS['zenovia-pyrth'],
  'yorath-pyrth': HOUSE_TIWNA_PORTRAITS['yorath-pyrth'],
  'caitrin-tiwna': HOUSE_TIWNA_PORTRAITS['caitrin-tiwna'],
  'valmar-baedd': HOUSE_BAEDD_PORTRAITS['valmar-baedd'],
  'zennorah-pyrth': HOUSE_BAEDD_PORTRAITS['zennorah-pyrth']
});
