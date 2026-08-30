import { HOUSE_GWEFRYDD_PORTRAITS } from './house-gwefrydd-portraits.js';
import { HOUSE_MAC_ARD_CUMHAILL_PORTRAITS } from './house-mac-ard-cumhaill-portraits.js';
import { HOUSE_RUIN_LAIDIR_LOCAL_PORTRAITS } from './house-ruin-laidir-local-portraits.js';
import { HOUSE_RUIN_UA_LAOCH_LOCAL_PORTRAITS } from './house-ruin-ua-laoch-local-portraits.js';
import { HOUSE_UA_EIRCE_LOCAL_PORTRAITS } from './house-ua-eirce-local-portraits.js';
import { HOUSE_UI_FIACHRACH_LOCAL_PORTRAITS } from './house-ui-fiachrach-local-portraits.js';

export const HOUSE_RUIN_UA_LAOCH_PORTRAITS = Object.freeze({
  ...HOUSE_RUIN_UA_LAOCH_LOCAL_PORTRAITS,
  'senan-ancient-cumhail': HOUSE_MAC_ARD_CUMHAILL_PORTRAITS['senan-ancient-cumhail'],
  'borros-gwefrydd': HOUSE_GWEFRYDD_PORTRAITS['borros-gwefrydd'],
  'domhnallach-fiachrach': HOUSE_UI_FIACHRACH_LOCAL_PORTRAITS['domhnallach-fiachrach'],
  'earraigh-cumhail': HOUSE_MAC_ARD_CUMHAILL_PORTRAITS['earraigh-cumhail'],
  'fiachra-eirce': HOUSE_UA_EIRCE_LOCAL_PORTRAITS['fiachra-eirce'],
  'jothran-gallchobhair': 'assets/images/portraits/haus-fir-an-gallchobhair/jothran-gallchobhair.jpg',
  'valtair-laidir': HOUSE_RUIN_LAIDIR_LOCAL_PORTRAITS['valtair-laidir']
});
