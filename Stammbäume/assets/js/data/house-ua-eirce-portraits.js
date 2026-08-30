import { HOUSE_DRAIG_PORTRAITS } from './house-draig-portraits.js';
import { HOUSE_GAFYR_PORTRAITS } from './house-gafyr-portraits.js';
import { HOUSE_MAC_ARD_CUMHAILL_PORTRAITS } from './house-mac-ard-cumhaill-portraits.js';
import { HOUSE_RUIN_UA_LAOCH_LOCAL_PORTRAITS } from './house-ruin-ua-laoch-local-portraits.js';
import { HOUSE_UI_FIACHRACH_LOCAL_PORTRAITS } from './house-ui-fiachrach-local-portraits.js';
import { HOUSE_UA_EIRCE_LOCAL_PORTRAITS } from './house-ua-eirce-local-portraits.js';
import { HOUSE_WYRM_PORTRAITS } from './house-wyrm-portraits.js';

export const HOUSE_UA_EIRCE_PORTRAITS = Object.freeze({
  ...HOUSE_UA_EIRCE_LOCAL_PORTRAITS,
  'sinna-1250-cumhail': HOUSE_MAC_ARD_CUMHAILL_PORTRAITS['sinna-1250-cumhail'],
  'gwlyddyn-wyrm': HOUSE_WYRM_PORTRAITS['gwlyddyn-wyrm'],
  'beibhinn-eirce': HOUSE_DRAIG_PORTRAITS['beibhinn-eirce'],
  'odyar-draig': HOUSE_DRAIG_PORTRAITS['odyar-draig'],
  'paislie-fiachrach': HOUSE_UI_FIACHRACH_LOCAL_PORTRAITS['paislie-fiachrach'],
  'hywell-gafyr': HOUSE_GAFYR_PORTRAITS['hywell-gafyr'],
  'brietta-cumhail': HOUSE_MAC_ARD_CUMHAILL_PORTRAITS['brietta-cumhail'],
  'eolann-laoch': HOUSE_RUIN_UA_LAOCH_LOCAL_PORTRAITS['eolann-laoch'],
  'wylba-laoch': HOUSE_RUIN_UA_LAOCH_LOCAL_PORTRAITS['wylba-laoch']
});
