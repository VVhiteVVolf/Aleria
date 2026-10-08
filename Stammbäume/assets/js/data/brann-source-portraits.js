import { HOUSE_WEMYSS_PORTRAITS } from './house-wemyss-portraits.js';
import { HOUSE_DUBGLAIS_PORTRAITS } from './house-dubglais-portraits.js';
import { HOUSE_AIRDMHOR_PORTRAITS } from './house-airdmhor-portraits.js';
import { HOUSE_CERNEIGE_PORTRAITS } from './house-cerneige-portraits.js';
import { BRANN_REUSED_PORTRAITS } from './brann-reused-portraits.js';

export const BRANN_SOURCE_PORTRAITS = Object.freeze({
  ...HOUSE_WEMYSS_PORTRAITS,
  ...HOUSE_DUBGLAIS_PORTRAITS,
  ...HOUSE_AIRDMHOR_PORTRAITS,
  ...HOUSE_CERNEIGE_PORTRAITS,
  ...BRANN_REUSED_PORTRAITS
});
