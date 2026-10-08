import { HOUSE_BUADHTREUN_PORTRAITS } from './house-buadhtreun-portraits.js';
import { HOUSE_DURACHD_PORTRAITS } from './house-durachd-portraits.js';
import { HOUSE_MUIRGHEAL_PORTRAITS } from './house-muirgheal-portraits.js';
import { HOUSE_BOYD_PORTRAITS } from './house-boyd-portraits.js';
import { FAERNA_REUSED_PORTRAITS } from './faerna-reused-portraits.js';

export const FAERNA_SOURCE_PORTRAITS = Object.freeze({
  ...HOUSE_BUADHTREUN_PORTRAITS,
  ...HOUSE_DURACHD_PORTRAITS,
  ...HOUSE_MUIRGHEAL_PORTRAITS,
  ...HOUSE_BOYD_PORTRAITS,
  ...FAERNA_REUSED_PORTRAITS
});
