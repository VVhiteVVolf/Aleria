import { HOUSE_CULLOCH_PORTRAITS } from './house-culloch-portraits.js';
import { HOUSE_BORTHWICK_PORTRAITS } from './house-borthwick-portraits.js';
import { HOUSE_ERSKINE_PORTRAITS } from './house-erskine-portraits.js';
import { HOUSE_GRANND_PORTRAITS } from './house-grannd-portraits.js';
import { BRAIGH_REUSED_PORTRAITS } from './braigh-reused-portraits.js';

export const BRAIGH_SOURCE_PORTRAITS = Object.freeze({
  ...HOUSE_CULLOCH_PORTRAITS,
  ...HOUSE_BORTHWICK_PORTRAITS,
  ...HOUSE_ERSKINE_PORTRAITS,
  ...HOUSE_GRANND_PORTRAITS,
  ...BRAIGH_REUSED_PORTRAITS
});
