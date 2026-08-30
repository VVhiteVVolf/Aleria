import { HOUSE_BLACH_PORTRAITS } from './house-blach-portraits.js';
import { HOUSE_DRAIG_PORTRAITS } from './house-draig-portraits.js';
import { HOUSE_MAC_ARD_CUMHAILL_PORTRAITS } from './house-mac-ard-cumhaill-portraits.js';
import { HOUSE_UI_FIACHRACH_LOCAL_PORTRAITS } from './house-ui-fiachrach-local-portraits.js';
import { HOUSE_UA_EIRCE_LOCAL_PORTRAITS } from './house-ua-eirce-local-portraits.js';
import { HOUSE_WYRM_PORTRAITS } from './house-wyrm-portraits.js';

export const HOUSE_UI_FIACHRACH_PORTRAITS = Object.freeze({
  ...HOUSE_UI_FIACHRACH_LOCAL_PORTRAITS,
  'ehangwen-blach': HOUSE_BLACH_PORTRAITS['ehangwen-blach'],
  'efnisien-wyrm': HOUSE_WYRM_PORTRAITS['efnisien-wyrm'],
  'roisin-cumhail': HOUSE_MAC_ARD_CUMHAILL_PORTRAITS['roisin-cumhail'],
  'vannoch-eirce': HOUSE_UA_EIRCE_LOCAL_PORTRAITS['vannoch-eirce'],
  'wynonna-fiachrach': HOUSE_DRAIG_PORTRAITS['wynonna-fiachrach'],
  'cadfan-draig': HOUSE_DRAIG_PORTRAITS['cadfan-draig']
});
