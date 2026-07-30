import { HOUSE_BLACH_PORTRAITS } from './house-blach-portraits.js';
import { HOUSE_DYNGWN_PORTRAITS } from './house-dyngwn-portraits.js';
import { HOUSE_GAFYR_PORTRAITS } from './house-gafyr-portraits.js';
import { HOUSE_GRAWN_PORTRAITS } from './house-grawn-portraits.js';
import { HOUSE_ILLEWOD_PORTRAITS } from './house-illewod-portraits.js';
import { HOUSE_TEYRNGARCH_PORTRAITS } from './house-teyrngarch-portraits.js';
import { HOUSE_WYLAN_PORTRAITS } from './house-wylan-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-llwynog';

export const HOUSE_LLWYNOG_LOCAL_PORTRAITS = Object.freeze({
  'heveydd-llwynog': `${PORTRAIT_ROOT}/heveydd-llwynog.png`,
  'ginevra-llwynog': `${PORTRAIT_ROOT}/ginevra-llwynog.png`,
  'govynyon-dinefwr': `${PORTRAIT_ROOT}/govynyon-dinefwr.jpg`,
  'rhun-baedd': `${PORTRAIT_ROOT}/rhun-baedd.png`,
  'arvonia-llwynog': `${PORTRAIT_ROOT}/arvonia-llwynog.png`,
  'edwynna-llwynog': `${PORTRAIT_ROOT}/edwynna-llwynog.png`,
  'yspaddaden-pyrth': `${PORTRAIT_ROOT}/yspaddaden-pyrth.png`,
  'tarian-tiwna': `${PORTRAIT_ROOT}/tarian-tiwna.png`,
  'myfanwy-llwynog': `${PORTRAIT_ROOT}/myfanwy-llwynog.png`,
  'bevan-llwynog': `${PORTRAIT_ROOT}/bevan-llwynog.png`,
  'darragh-ua-ghaiscioch': `${PORTRAIT_ROOT}/darragh-ua-ghaiscioch.jpg`,
  'mairead-cleir': `${PORTRAIT_ROOT}/mairead-cleir.jpg`,
  'rhosyn-llwynog': `${PORTRAIT_ROOT}/rhosyn-llwynog.png`,
  'colwin-llwynog': `${PORTRAIT_ROOT}/colwin-llwynog.png`,
  'cadoc-creyr': `${PORTRAIT_ROOT}/cadoc-creyr.png`,
  'glynis-morforwyn': `${PORTRAIT_ROOT}/glynis-morforwyn.jpg`,
  'haul-llwynog': `${PORTRAIT_ROOT}/haul-llwynog.png`,
  'brina-llwynog': `${PORTRAIT_ROOT}/brina-llwynog.png`,
  'sath-llwynog': `${PORTRAIT_ROOT}/sath-llwynog.png`,
  'celyn-llwynog': `${PORTRAIT_ROOT}/celyn-llwynog.png`,
  'corryn-llwynog': `${PORTRAIT_ROOT}/corryn-llwynog.png`,
  'adda-llwynog': `${PORTRAIT_ROOT}/adda-llwynog.png`,
  'cari-llwynog': `${PORTRAIT_ROOT}/cari-llwynog.png`,
  'davie-llwynog': `${PORTRAIT_ROOT}/davie-llwynog.png`,
  'eurig-hebog': `${PORTRAIT_ROOT}/eurig-hebog.png`
});

export const HOUSE_LLWYNOG_PORTRAITS = Object.freeze({
  ...HOUSE_LLWYNOG_LOCAL_PORTRAITS,
  'pebin-fuchs': HOUSE_ILLEWOD_PORTRAITS['pebin-fuchs'],
  'penryn-illewod': HOUSE_ILLEWOD_PORTRAITS['penryn-illewod'],
  'tallwch-illewod': HOUSE_ILLEWOD_PORTRAITS['tallwch-illewod'],
  'ehangwen-illewod': HOUSE_ILLEWOD_PORTRAITS['ehangwen-illewod'],
  'kerris-illewod': HOUSE_ILLEWOD_PORTRAITS['kerris-illewod'],
  'ieuan-llwynog': HOUSE_ILLEWOD_PORTRAITS['ieuan-llwynog'],
  'penkawr-llwynog': HOUSE_BLACH_PORTRAITS['penkawr-llwynog'],
  'eurig-llwynog': HOUSE_BLACH_PORTRAITS['eurig-llwynog'],
  'artura-blach': HOUSE_BLACH_PORTRAITS['artura-blach'],
  'rhydderch-llwynog': HOUSE_WYLAN_PORTRAITS['rhydderch-llwynog'],
  'anarawd-llwynog': HOUSE_WYLAN_PORTRAITS['anarawd-llwynog'],
  'malt-wylan': HOUSE_WYLAN_PORTRAITS['malt-wylan'],
  'seithved-teyrngarch': HOUSE_TEYRNGARCH_PORTRAITS['seithved-teyrngarch'],
  'rhynnon-llwynog': HOUSE_DYNGWN_PORTRAITS['rhynnon-llwynog'],
  'cloi-grawn': HOUSE_GRAWN_PORTRAITS['cloi-grawn'],
  'enid-llwynog': HOUSE_GRAWN_PORTRAITS['enid-llwynog'],
  'aerwyn-gafyr': HOUSE_GAFYR_PORTRAITS['aerwyn-gafyr'],
  'tudwallon-lwynog': HOUSE_GAFYR_PORTRAITS['tudwallon-lwynog']
});
