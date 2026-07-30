import { HOUSE_BLACH_PORTRAITS } from './house-blach-portraits.js';
import { HOUSE_ILLEWOD_PORTRAITS } from './house-illewod-portraits.js';
import { HOUSE_TEYRNGARCH_PORTRAITS } from './house-teyrngarch-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-illwath';

export const HOUSE_ILLWATH_LOCAL_PORTRAITS = Object.freeze({
  'tarawg-illwath': `${PORTRAIT_ROOT}/tarawg-illwath.png`,
  'sianwen-illwath': `${PORTRAIT_ROOT}/sianwen-illwath.png`,
  'caibrel-ceardaiocht': `${PORTRAIT_ROOT}/caibrel-ceardaiocht.jpg`,
  'kynwas-illwath': `${PORTRAIT_ROOT}/kynwas-illwath.png`,
  'rhianu-illwath': `${PORTRAIT_ROOT}/rhianu-illwath.png`,
  'branwen-illwath': `${PORTRAIT_ROOT}/branwen-illwath.png`,
  'nessa-cleir': `${PORTRAIT_ROOT}/nessa-cleir.jpg`,
  'khellen-mhuir': `${PORTRAIT_ROOT}/khellen-mhuir.png`,
  'arthgal-illwath': `${PORTRAIT_ROOT}/arthgal-illwath.png`,
  'sian-illwath': `${PORTRAIT_ROOT}/sian-illwath.png`,
  'gawl-illwath': `${PORTRAIT_ROOT}/gawl-illwath.png`,
  'urien-illwath': `${PORTRAIT_ROOT}/urien-illwath.png`,
  'mared-illwath': `${PORTRAIT_ROOT}/mared-illwath.png`
});

export const HOUSE_ILLWATH_PORTRAITS = Object.freeze({
  ...HOUSE_ILLWATH_LOCAL_PORTRAITS,
  'ehangwen-illewod': HOUSE_ILLEWOD_PORTRAITS['ehangwen-illewod'],
  'vorath-illwath': HOUSE_BLACH_PORTRAITS['vorath-illwath'],
  'alicyn-blach': HOUSE_BLACH_PORTRAITS['alicyn-blach'],
  'gwifredd-illwath': HOUSE_TEYRNGARCH_PORTRAITS['gwifredd-illwath'],
  'shylene-teyrngarch': HOUSE_TEYRNGARCH_PORTRAITS['shylene-teyrngarch']
});
