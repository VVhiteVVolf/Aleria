import { HOUSE_DYNGWN_PORTRAITS } from './house-dyngwn-portraits.js';
import { HOUSE_FIR_AN_TARVO_PORTRAITS } from './house-fir-an-tarvo-portraits.js';
import { HOUSE_GAFYR_PORTRAITS } from './house-gafyr-portraits.js';
import { HOUSE_ILLEWOD_PORTRAITS } from './house-illewod-portraits.js';
import { HOUSE_MAC_ARD_CUMHAILL_PORTRAITS } from './house-mac-ard-cumhaill-portraits.js';
import { HOUSE_NA_MHUIR_LOCAL_PORTRAITS } from './house-na-mhuir-local-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-fir-an-gallchobhair';

export const HOUSE_FIR_AN_GALLCHOBHAIR_LOCAL_PORTRAIT_IDS = Object.freeze([
  'utgar-gallchobhair',
  'niamhann-gallchobhair',
  'conall-gallchobhair',
  'taerlach-gallchobhair',
  'diarmuid-gallchobhair',
  'gilleon-gallchobhair',
  'rorik-gallchobhair',
  'meallan-gallchobhair',
  'aonghus-gallchobhair',
  'hiarnan-gallchobhair',
  'cathalan-gallchobhair',
  'jothran-gallchobhair',
  'eoghair-gallchobhair',
  'mallaidh-gallchobhair',
  'faolan-gallchobhair',
  'shila-gallchobhair',
  'sloane-gallchobhair',
  'keelaith-gallchobhair',
  'nolan-gallchobhair',
  'murchad-gallchobhair',
  'orren-gallchobhair',
  'iarlaith-gallchobhair',
  'holman-gallchobhair',
  'aideen-gallchobhair',
  'gormlaith-gallchobhair',
  'ronan-gallchobhair',
  'isibeal-gallchobhair',
  'harailt-gallchobhair',
  'ivarr-gallchobhair',
  'flanna-gallchobhair'
]);

export const HOUSE_FIR_AN_GALLCHOBHAIR_REUSED_PORTRAIT_IDS = Object.freeze([
  'gorn-gallchobhair',
  'gerwyn-gafyr',
  'liadan-gallchobhair',
  'berwyn-illewod',
  'alana-gallchobhair',
  'merwin-illewod',
  'tynan-gallchobhair',
  'anali-illewod',
  'odran-cumhail',
  'lochlainn-mhuir',
  'oonagh-mhuir',
  'joclynn-tarvo'
]);

export const HOUSE_FIR_AN_GALLCHOBHAIR_PORTRAITS = Object.freeze({
  ...Object.fromEntries(HOUSE_FIR_AN_GALLCHOBHAIR_LOCAL_PORTRAIT_IDS.map(personId => [
    personId,
    `${PORTRAIT_ROOT}/${personId}.jpg`
  ])),
  'gorn-gallchobhair': HOUSE_DYNGWN_PORTRAITS['gorn-gallchobhair'],
  'gerwyn-gafyr': HOUSE_GAFYR_PORTRAITS['gerwyn-gafyr'],
  'liadan-gallchobhair': HOUSE_ILLEWOD_PORTRAITS['liadan-gallchobhair'],
  'berwyn-illewod': HOUSE_ILLEWOD_PORTRAITS['berwyn-illewod'],
  'alana-gallchobhair': HOUSE_ILLEWOD_PORTRAITS['alana-gallchobhair'],
  'merwin-illewod': HOUSE_ILLEWOD_PORTRAITS['merwin-illewod'],
  'tynan-gallchobhair': HOUSE_ILLEWOD_PORTRAITS['tynan-gallchobhair'],
  'anali-illewod': HOUSE_ILLEWOD_PORTRAITS['anali-illewod'],
  'odran-cumhail': HOUSE_MAC_ARD_CUMHAILL_PORTRAITS['odran-cumhail'],
  'lochlainn-mhuir': HOUSE_NA_MHUIR_LOCAL_PORTRAITS['lochlainn-mhuir'],
  'oonagh-mhuir': HOUSE_NA_MHUIR_LOCAL_PORTRAITS['oonagh-mhuir'],
  'joclynn-tarvo': HOUSE_FIR_AN_TARVO_PORTRAITS['joclynn-tarvo']
});
