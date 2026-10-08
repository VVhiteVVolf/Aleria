import { HOUSE_EOGHAINN_PORTRAITS } from './house-eoghainn-portraits.js';
import { HOUSE_AGNEW_PORTRAITS } from './house-agnew-portraits.js';
import { HOUSE_DIANAOMH_PORTRAITS } from './house-dianaomh-portraits.js';
import { HOUSE_DOBHAR_PORTRAITS } from './house-dobhar-portraits.js';
import { HOUSE_FORSYTH_PORTRAITS } from './house-forsyth-portraits.js';
import { HOUSE_ELID_PORTRAITS } from './house-elid-portraits.js';
import { HOUSE_OGLIVY_PORTRAITS } from './house-oglivy-portraits.js';
import { DAMH_REUSED_PORTRAITS } from './damh-reused-portraits.js';

export const DAMH_SOURCE_PORTRAITS = Object.freeze({
  ...HOUSE_EOGHAINN_PORTRAITS,
  ...HOUSE_AGNEW_PORTRAITS,
  ...HOUSE_DIANAOMH_PORTRAITS,
  ...HOUSE_DOBHAR_PORTRAITS,
  ...HOUSE_FORSYTH_PORTRAITS,
  ...HOUSE_ELID_PORTRAITS,
  ...HOUSE_OGLIVY_PORTRAITS,
  ...DAMH_REUSED_PORTRAITS
});
