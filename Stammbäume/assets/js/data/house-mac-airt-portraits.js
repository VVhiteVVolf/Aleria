import { HOUSE_DRAIG_PORTRAITS } from './house-draig-portraits.js';
import { HOUSE_DYNGWN_PORTRAITS } from './house-dyngwn-portraits.js';
import { HOUSE_FIR_AN_GALLCHOBHAIR_PORTRAITS } from './house-fir-an-gallchobhair-portraits.js';
import { HOUSE_GWYVERN_PORTRAITS } from './house-gwyvern-portraits.js';
import { HOUSE_ILLWATH_PORTRAITS } from './house-illwath-portraits.js';
import { HOUSE_MAC_ARD_CUMHAILL_PORTRAITS } from './house-mac-ard-cumhaill-portraits.js';
import { HOUSE_NIC_CAOIMHE_PORTRAITS } from './house-nic-caoimhe-portraits.js';
import { HOUSE_RU_GORTACH_PORTRAITS } from './house-ru-gortach-portraits.js';
import { HOUSE_RUIN_LAIDIR_LOCAL_PORTRAITS } from './house-ruin-laidir-local-portraits.js';
import { HOUSE_RUIN_UA_LAOCH_PORTRAITS } from './house-ruin-ua-laoch-portraits.js';
import { HOUSE_UA_AMRHAN_PORTRAITS } from './house-ua-amrhan-portraits.js';

// Die Mac-Airt-Quelle enthält ausschließlich veraltete Bilder. Diese Liste
// darf deshalb nur Porträts spiegeln, die für dieselbe Weltperson bereits in
// einer anderen ausgearbeiteten Familienakte kanonisch verwendet werden.
export const HOUSE_MAC_AIRT_REUSED_PORTRAIT_IDS = Object.freeze([
  'fionn-1245-cumhail',
  'rhiwallon-draig',
  'farrell-laoch',
  'cathair-cumhail',
  'gwynnan-dyngwn',
  'aethlem-gwyvern',
  'beatha-airt',
  'caoilte-gortach',
  'bebhinn-caoimhe',
  'murchad-gallchobhair',
  'rhianu-illwath',
  'eibhlin-laidir',
  'roisin-blar',
  'fionntan-amrhan'
]);

export const HOUSE_MAC_AIRT_PORTRAITS = Object.freeze({
  'fionn-1245-cumhail': HOUSE_MAC_ARD_CUMHAILL_PORTRAITS['fionn-1245-cumhail'],
  'rhiwallon-draig': HOUSE_DRAIG_PORTRAITS['rhiwallon-draig'],
  'farrell-laoch': HOUSE_RUIN_UA_LAOCH_PORTRAITS['farrell-laoch'],
  'cathair-cumhail': HOUSE_MAC_ARD_CUMHAILL_PORTRAITS['cathair-cumhail'],
  'gwynnan-dyngwn': HOUSE_DYNGWN_PORTRAITS['gwynnan-dyngwn'],
  'aethlem-gwyvern': HOUSE_GWYVERN_PORTRAITS['aethlem-gwyvern'],
  'beatha-airt': HOUSE_GWYVERN_PORTRAITS['beatha-airt'],
  'caoilte-gortach': HOUSE_RU_GORTACH_PORTRAITS['caoilte-gortach'],
  'bebhinn-caoimhe': HOUSE_NIC_CAOIMHE_PORTRAITS['bebhinn-caoimhe'],
  'murchad-gallchobhair': HOUSE_FIR_AN_GALLCHOBHAIR_PORTRAITS['murchad-gallchobhair'],
  'rhianu-illwath': HOUSE_ILLWATH_PORTRAITS['rhianu-illwath'],
  'eibhlin-laidir': HOUSE_RUIN_LAIDIR_LOCAL_PORTRAITS['eibhlin-laidir'],
  'roisin-blar': 'assets/images/portraits/haus-nic-blar/roisin-blar.png',
  'fionntan-amrhan': HOUSE_UA_AMRHAN_PORTRAITS['fionntan-amrhan']
});
