import { HOUSE_URQUHART_PORTRAITS } from './house-urquhart-portraits.js';
import { HOUSE_BHAIRD_PORTRAITS } from './house-bhaird-portraits.js';
import { HOUSE_LUTHSACH_PORTRAITS } from './house-luthsach-portraits.js';
import { HOUSE_LACHLANN_PORTRAITS } from './house-lachlann-portraits.js';
import { HOUSE_DRUMMOND_PORTRAITS } from './house-drummond-portraits.js';
import { HOUSE_STWATCHN_PORTRAITS } from './house-stwatchn-portraits.js';
import { HOUSE_DUNDAS_PORTRAITS } from './house-dundas-portraits.js';
import { FAELAORN_REUSED_PORTRAITS } from './faelaorn-reused-portraits.js';

export const FAELAORN_SOURCE_PORTRAITS = Object.freeze({
  ...HOUSE_URQUHART_PORTRAITS,
  ...HOUSE_BHAIRD_PORTRAITS,
  ...HOUSE_LUTHSACH_PORTRAITS,
  ...HOUSE_LACHLANN_PORTRAITS,
  ...HOUSE_DRUMMOND_PORTRAITS,
  ...HOUSE_STWATCHN_PORTRAITS,
  ...HOUSE_DUNDAS_PORTRAITS,
  ...FAELAORN_REUSED_PORTRAITS
});
