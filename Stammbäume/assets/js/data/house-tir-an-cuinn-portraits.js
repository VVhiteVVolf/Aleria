import { HOUSE_DAL_CRUTHIN_PORTRAITS } from './house-dal-cruthin-portraits.js';
import { HOUSE_FIR_AN_GALLCHOBHAIR_PORTRAITS } from './house-fir-an-gallchobhair-portraits.js';
import { HOUSE_FIR_AN_TARVO_PORTRAITS } from './house-fir-an-tarvo-portraits.js';
import { HOUSE_MAC_ARD_CUMHAILL_PORTRAITS } from './house-mac-ard-cumhaill-portraits.js';
import { HOUSE_RUIN_UA_LAOCH_PORTRAITS } from './house-ruin-ua-laoch-portraits.js';
import { HOUSE_UA_AMRHAN_PORTRAITS } from './house-ua-amrhan-portraits.js';

export const HOUSE_TIR_AN_CUINN_REUSED_PORTRAIT_IDS = Object.freeze([
  'nathrachan-cuinn',
  'tiernan-cumhail',
  'eoghair-gallchobhair',
  'macha-cruthin',
  'sgail-tarvo',
  'zomhlaigh-amrhan',
  'athluan-tarvo',
  'glaodhran-airgid',
  'zadran-laoch'
]);

export const HOUSE_TIR_AN_CUINN_PORTRAITS = Object.freeze({
  'tiernan-cumhail': HOUSE_MAC_ARD_CUMHAILL_PORTRAITS['tiernan-cumhail'],
  'eoghair-gallchobhair': HOUSE_FIR_AN_GALLCHOBHAIR_PORTRAITS['eoghair-gallchobhair'],
  'macha-cruthin': HOUSE_DAL_CRUTHIN_PORTRAITS['macha-cruthin'],
  'sgail-tarvo': HOUSE_FIR_AN_TARVO_PORTRAITS['sgail-tarvo'],
  'athluan-tarvo': HOUSE_FIR_AN_TARVO_PORTRAITS['athluan-tarvo'],
  'zadran-laoch': HOUSE_RUIN_UA_LAOCH_PORTRAITS['zadran-laoch'],
  'nathrachan-cuinn': HOUSE_UA_AMRHAN_PORTRAITS['nathrachan-cuinn'],
  'zomhlaigh-amrhan': HOUSE_UA_AMRHAN_PORTRAITS['zomhlaigh-amrhan'],
  'glaodhran-airgid': 'assets/images/portraits/haus-tir-an-airgid/glaodhran-airgid.png'
});
