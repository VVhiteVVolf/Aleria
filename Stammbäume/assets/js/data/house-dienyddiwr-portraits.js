import { HOUSE_ARTH_LOCAL_PORTRAITS } from './house-arth-local-portraits.js';
import { HOUSE_CEIRWYN_PORTRAITS } from './house-ceirwyn-portraits.js';
import { HOUSE_GRAWN_PORTRAITS } from './house-grawn-portraits.js';
import { HOUSE_ILLEWOD_PORTRAITS } from './house-illewod-portraits.js';
import { HOUSE_PENDERYN_PORTRAITS } from './house-penderyn-portraits.js';
import { HOUSE_PENDRAG_PORTRAITS } from './house-pendrag-portraits.js';
import { HOUSE_WYLAN_PORTRAITS } from './house-wylan-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-dienyddiwr';

const LOCAL_DIENYDDIWR_PORTRAITS = Object.freeze({
  'taredd-dienyddiwr': `${PORTRAIT_ROOT}/taredd-dienyddiwr.jpg`,
  'irmgard-dienyddiwr-founder-spouse': `${PORTRAIT_ROOT}/irmgard-dienyddiwr-founder-spouse.jpg`,
  'trayvon-dienyddiwr': `${PORTRAIT_ROOT}/trayvon-dienyddiwr.jpg`,
  'cadogan-dyngwn': `${PORTRAIT_ROOT}/cadogan-dyngwn.jpg`,
  'gruffydd-dienyddiwr': `${PORTRAIT_ROOT}/gruffydd-dienyddiwr.jpg`,
  'gwennan-dienyddiwr': `${PORTRAIT_ROOT}/gwennan-dienyddiwr.jpg`,
  'michan-ness': `${PORTRAIT_ROOT}/michan-ness.jpg`,
  'anarawd-dienyddiwr': `${PORTRAIT_ROOT}/anarawd-dienyddiwr.jpg`,
  'brannock-dienyddiwr': `${PORTRAIT_ROOT}/brannock-dienyddiwr.jpg`,
  'ulysses-pyrth': `${PORTRAIT_ROOT}/ulysses-pyrth.png`,
  'delwen-dienyddiwr': `${PORTRAIT_ROOT}/delwen-dienyddiwr.jpg`,
  'uther-dienyddiwr': `${PORTRAIT_ROOT}/uther-dienyddiwr.jpg`,
  'hwywell-crefyddol': `${PORTRAIT_ROOT}/hwywell-crefyddol.jpg`,
  'revelyn-dienyddiwr': `${PORTRAIT_ROOT}/revelyn-dienyddiwr.jpg`,
  'quendolin-dienyddiwr': `${PORTRAIT_ROOT}/quendolin-dienyddiwr.jpg`,
  'gwynfor-dienyddiwr': `${PORTRAIT_ROOT}/gwynfor-dienyddiwr.jpg`,
  'garith-dyngwn': `${PORTRAIT_ROOT}/garith-dyngwn.jpg`,
  'dylan-blach': `${PORTRAIT_ROOT}/dylan-blach.png`,
  'gwen-dienyddiwr': `${PORTRAIT_ROOT}/gwen-dienyddiwr.jpg`,
  'rhys-dienyddiwr': `${PORTRAIT_ROOT}/rhys-dienyddiwr.jpg`,
  'dirmyg-dienyddiwr': `${PORTRAIT_ROOT}/dirmyg-dienyddiwr.jpg`,
  'enfys-dienyddiwr': `${PORTRAIT_ROOT}/enfys-dienyddiwr.jpg`,
  'ysabeth-dienyddiwr': `${PORTRAIT_ROOT}/ysabeth-dienyddiwr.jpg`,
  'neirin-hwyaden': `${PORTRAIT_ROOT}/neirin-hwyaden.png`,
  'siobhan-muileach': `${PORTRAIT_ROOT}/siobhan-muileach.jpeg`,
  'gwen-gwarchod': `${PORTRAIT_ROOT}/gwen-gwarchod.jpg`,
  'colwynn-aderyn': `${PORTRAIT_ROOT}/colwynn-aderyn.png`,
  'delvin-dyngwn': `${PORTRAIT_ROOT}/delvin-dyngwn.jpg`,
  'arawn-dienyddiwr': `${PORTRAIT_ROOT}/arawn-dienyddiwr.jpg`,
  'siwan-dienyddiwr': `${PORTRAIT_ROOT}/siwan-dienyddiwr.jpg`,
  'steffan-dienyddiwr': `${PORTRAIT_ROOT}/steffan-dienyddiwr.jpg`,
  'blawd-dienyddiwr': `${PORTRAIT_ROOT}/blawd-dienyddiwr.jpg`,
  'tomi-dienyddiwr': `${PORTRAIT_ROOT}/tomi-dienyddiwr.jpg`,
  'soffi-dienyddiwr': `${PORTRAIT_ROOT}/soffi-dienyddiwr.jpg`,
  'tirian-dienyddiwr': `${PORTRAIT_ROOT}/tirian-dienyddiwr.jpg`,
  'frewi-dienyddiwr': `${PORTRAIT_ROOT}/frewi-dienyddiwr.jpg`
});

export const HOUSE_DIENYDDIWR_PORTRAITS = Object.freeze({
  ...LOCAL_DIENYDDIWR_PORTRAITS,
  'dyngannon-arth': HOUSE_ARTH_LOCAL_PORTRAITS['dyngannon-arth'],
  'hefin-dieniddiwr': HOUSE_PENDRAG_PORTRAITS['hefin-dieniddiwr'],
  'tor-pendrag': HOUSE_PENDRAG_PORTRAITS['tor-pendrag'],
  'mervyn-dienyddiwr': HOUSE_WYLAN_PORTRAITS['mervyn-dienyddiwr'],
  'brannoc-illewod': HOUSE_ILLEWOD_PORTRAITS['brannoc-illewod'],
  'robyert-dienyddiwr': HOUSE_GRAWN_PORTRAITS['robyert-dienyddiwr'],
  'arianwyn-grawn': HOUSE_GRAWN_PORTRAITS['arianwyn-grawn'],
  'nolwen-dienyddiwr': HOUSE_PENDERYN_PORTRAITS['nolwen-dienyddiwr'],
  'osian-penderyn': HOUSE_PENDERYN_PORTRAITS['osian-penderyn'],
  'idris-dienyddiwr': HOUSE_PENDERYN_PORTRAITS['idris-dienyddiwr'],
  'sabria-penderyn': HOUSE_PENDERYN_PORTRAITS['sabria-penderyn'],
  'robyn-dienyddiwr': HOUSE_CEIRWYN_PORTRAITS['robyn-dienyddiwr'],
  'rhyannon-ceirwyn': HOUSE_CEIRWYN_PORTRAITS['rhyannon-ceirwyn']
});

export const HOUSE_DIENYDDIWR_LOCAL_PORTRAITS = LOCAL_DIENYDDIWR_PORTRAITS;
