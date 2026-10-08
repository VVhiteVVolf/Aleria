import { HOUSE_DIUID_PORTRAITS } from './house-diuid-portraits.js';
import { HOUSE_LOCKART_PORTRAITS } from './house-lockart-portraits.js';
import { HOUSE_FIORGHRA_PORTRAITS } from './house-fiorghra-portraits.js';
import { HOUSE_NESS_PORTRAITS } from './house-ness-portraits.js';
import { HOUSE_HAIG_PORTRAITS } from './house-haig-portraits.js';
import { HOUSE_BANLAOCH_PORTRAITS } from './house-banlaoch-portraits.js';
import { MATHGHAM_REUSED_PORTRAITS } from './mathgham-reused-portraits.js';

export const MATHGHAM_SOURCE_PORTRAITS = Object.freeze({
  ...HOUSE_DIUID_PORTRAITS,
  ...HOUSE_LOCKART_PORTRAITS,
  ...HOUSE_FIORGHRA_PORTRAITS,
  ...HOUSE_NESS_PORTRAITS,
  ...HOUSE_HAIG_PORTRAITS,
  ...HOUSE_BANLAOCH_PORTRAITS,
  ...MATHGHAM_REUSED_PORTRAITS
});
