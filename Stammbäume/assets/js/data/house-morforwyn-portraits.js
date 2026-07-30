import { HOUSE_BLACH_PORTRAITS } from './house-blach-portraits.js';
import { HOUSE_GRAEL_PORTRAITS } from './house-grael-portraits.js';
import { HOUSE_ILLWATH_PORTRAITS } from './house-illwath-portraits.js';
import { HOUSE_LLWYNOG_PORTRAITS } from './house-llwynog-portraits.js';
import { HOUSE_MARWOLAETH_PORTRAITS } from './house-marwolaeth-portraits.js';
import { HOUSE_NEIDR_PORTRAITS } from './house-neidr-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-morforwyn';

export const HOUSE_MORFORWYN_LOCAL_PORTRAITS = Object.freeze({
  'triston-morforwyn': `${PORTRAIT_ROOT}/triston-morforwyn.png`,
  mapnimue: `${PORTRAIT_ROOT}/mapnimue.png`,
  'hafmue-morforwyn': `${PORTRAIT_ROOT}/hafmue-morforwyn.png`,
  'marmue-morforwyn': `${PORTRAIT_ROOT}/marmue-morforwyn.png`,
  'padmue-morforwyn': `${PORTRAIT_ROOT}/padmue-morforwyn.png`,
  'elimue-morforwyn': `${PORTRAIT_ROOT}/elimue-morforwyn.png`,
  'serenmue-morforwyn': `${PORTRAIT_ROOT}/serenmue-morforwyn.png`,
  'gwennalarch-morforwyn': `${PORTRAIT_ROOT}/gwennalarch-morforwyn.png`,
  'bethmue-morforwyn': `${PORTRAIT_ROOT}/bethmue-morforwyn.png`,
  'megmue-morforwyn': `${PORTRAIT_ROOT}/megmue-morforwyn.png`,
  'talfamue-morforwyn': `${PORTRAIT_ROOT}/talfamue-morforwyn.png`,
  'idmue-morforwyn': `${PORTRAIT_ROOT}/idmue-morforwyn.png`,
  'ysoltmue-morforwyn': `${PORTRAIT_ROOT}/ysoltmue-morforwyn.png`,
  'owamue-morforwyn': `${PORTRAIT_ROOT}/owamue-morforwyn.png`,
  'ywamue-morforwyn': `${PORTRAIT_ROOT}/ywamue-morforwyn.png`,
  'gwenmue-morforwyn': `${PORTRAIT_ROOT}/gwenmue-morforwyn.png`,
  'gwenlyn-morforwyn': `${PORTRAIT_ROOT}/gwenlyn-morforwyn.png`,
  'branmue-morforwyn': `${PORTRAIT_ROOT}/branmue-morforwyn.png`,
  'meiriona-morforwyn': `${PORTRAIT_ROOT}/meiriona-morforwyn.png`,
  'urumue-morforwyn': `${PORTRAIT_ROOT}/urumue-morforwyn.png`,
  'xynemue-morforwyn': `${PORTRAIT_ROOT}/xynemue-morforwyn.png`,
  'olmue-morforwyn': `${PORTRAIT_ROOT}/olmue-morforwyn.png`,
  'zedmue-morforwyn': `${PORTRAIT_ROOT}/zedmue-morforwyn.png`,
  'idriston-morforwyn': `${PORTRAIT_ROOT}/idriston-morforwyn.png`,
  'glanmue-morforwyn': `${PORTRAIT_ROOT}/glanmue-morforwyn.png`,
  'eirymue-morforwyn': `${PORTRAIT_ROOT}/eirymue-morforwyn.png`,
  'sioned-morforwyn': `${PORTRAIT_ROOT}/sioned-morforwyn.png`,
  'efrawg-tiwna': `${PORTRAIT_ROOT}/efrawg-tiwna.png`,
  'varedmue-morforwyn': `${PORTRAIT_ROOT}/varedmue-morforwyn.png`,
  'karismue-morforwyn': `${PORTRAIT_ROOT}/karismue-morforwyn.png`,
  'jeston-morforwyn': `${PORTRAIT_ROOT}/jeston-morforwyn.png`,
  'ffynmue-morforwyn': `${PORTRAIT_ROOT}/ffynmue-morforwyn.png`,
  'alunton-morforwyn': `${PORTRAIT_ROOT}/alunton-morforwyn.png`,
  'jonamue-morforwyn': `${PORTRAIT_ROOT}/jonamue-morforwyn.png`,
  'merediton-morforwyn': `${PORTRAIT_ROOT}/merediton-morforwyn.png`,
  'wledmue-morforwyn': `${PORTRAIT_ROOT}/wledmue-morforwyn.png`,
  'cerysmue-morforwyn': `${PORTRAIT_ROOT}/cerysmue-morforwyn.png`,
  'nefmue-morforwyn': `${PORTRAIT_ROOT}/nefmue-morforwyn.png`,
  'llyrton-morforwyn': `${PORTRAIT_ROOT}/llyrton-morforwyn.png`,
  'sianmue-morforwyn': `${PORTRAIT_ROOT}/sianmue-morforwyn.png`,
  'neirton-morforwyn': `${PORTRAIT_ROOT}/neirton-morforwyn.png`
});

export const HOUSE_MORFORWYN_PORTRAITS = Object.freeze({
  ...HOUSE_MORFORWYN_LOCAL_PORTRAITS,
  'eurolwyn-morforwyn': HOUSE_GRAEL_PORTRAITS['eurolwyn-morforwyn'],
  'gwlyddyn-grael': HOUSE_GRAEL_PORTRAITS['gwlyddyn-grael'],
  'meredydd-blach': HOUSE_BLACH_PORTRAITS['meredydd-blach'],
  'endellion-morforwyn': HOUSE_MARWOLAETH_PORTRAITS['endellion-morforwyn'],
  'deiniol-marwolaeth': HOUSE_MARWOLAETH_PORTRAITS['deiniol-marwolaeth'],
  'tarawg-illwath': HOUSE_ILLWATH_PORTRAITS['tarawg-illwath'],
  'afanen-morforwyn': HOUSE_NEIDR_PORTRAITS['afanen-morforwyn'],
  'rhon-neidr': HOUSE_NEIDR_PORTRAITS['rhon-neidr'],
  'glynis-morforwyn': HOUSE_LLWYNOG_PORTRAITS['glynis-morforwyn'],
  'colwin-llwynog': HOUSE_LLWYNOG_PORTRAITS['colwin-llwynog']
});
