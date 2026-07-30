import { HOUSE_DIENYDDIWR_PORTRAITS } from './house-dienyddiwr-portraits.js';
import { HOUSE_DYNGWN_PORTRAITS } from './house-dyngwn-portraits.js';
import { HOUSE_ILLEWOD_PORTRAITS } from './house-illewod-portraits.js';
import { HOUSE_ILLYSYWEN_PORTRAITS } from './house-illysywen-portraits.js';
import { HOUSE_MARWOLAETH_PORTRAITS } from './house-marwolaeth-portraits.js';
import { HOUSE_TEYRNGARCH_PORTRAITS } from './house-teyrngarch-portraits.js';
import { HOUSE_WYLAN_PORTRAITS } from './house-wylan-portraits.js';
import { HOUSE_WYRM_PORTRAITS } from './house-wyrm-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-blach';

export const HOUSE_BLACH_LOCAL_PORTRAITS = Object.freeze({
  'lachlan-tir-an-muirghin': `${PORTRAIT_ROOT}/lachlan-tir-an-muirghin.jpg`,
  'uileann-riordain': `${PORTRAIT_ROOT}/uileann-riordain.jpg`,
  'dirmyg-blach': `${PORTRAIT_ROOT}/dirmyg-blach.png`,
  'rhynnon-blach': `${PORTRAIT_ROOT}/rhynnon-blach.png`,
  'penkawr-llwynog': `${PORTRAIT_ROOT}/penkawr-llwynog.png`,
  'ehangwen-blach': `${PORTRAIT_ROOT}/ehangwen-blach.png`,
  'cadwaladr-creyr': `${PORTRAIT_ROOT}/cadwaladr-creyr.png`,
  'cadogan-blach': `${PORTRAIT_ROOT}/cadogan-blach.png`,
  'meredydd-blach': `${PORTRAIT_ROOT}/meredydd-blach.png`,
  'berwyn-blach': `${PORTRAIT_ROOT}/berwyn-blach.png`,
  'eiddyl-canwyll': `${PORTRAIT_ROOT}/eiddyl-canwyll.jpg`,
  'roderick-tir-addawol': `${PORTRAIT_ROOT}/roderick-tir-addawol.jpg`,
  'artura-blach': `${PORTRAIT_ROOT}/artura-blach.png`,
  'ossian-blach': `${PORTRAIT_ROOT}/ossian-blach.png`,
  'alicyn-blach': `${PORTRAIT_ROOT}/alicyn-blach.png`,
  'eurig-llwynog': `${PORTRAIT_ROOT}/eurig-llwynog.png`,
  'heatherlinn-hwyaden': `${PORTRAIT_ROOT}/heatherlinn-hwyaden.png`,
  'vorath-illwath': `${PORTRAIT_ROOT}/vorath-illwath.png`,
  'emyrs-blach': `${PORTRAIT_ROOT}/emyrs-blach.png`,
  'betws-blach': `${PORTRAIT_ROOT}/betws-blach.png`,
  'gwerful-blach': `${PORTRAIT_ROOT}/gwerful-blach.png`,
  'caitriona-ceardaiocht': `${PORTRAIT_ROOT}/caitriona-ceardaiocht.jpg`,
  'morien-tiwna': `${PORTRAIT_ROOT}/morien-tiwna.png`,
  'arthwr-baedd': `${PORTRAIT_ROOT}/arthwr-baedd.png`,
  'prys-blach': `${PORTRAIT_ROOT}/prys-blach.png`,
  'gwyna-blach': `${PORTRAIT_ROOT}/gwyna-blach.png`,
  'gawl-blach': `${PORTRAIT_ROOT}/gawl-blach.png`,
  'ailis-ghaiscioch': `${PORTRAIT_ROOT}/ailis-ghaiscioch.jpg`,
  'caw-blach': `${PORTRAIT_ROOT}/caw-blach.png`,
  'jenita-blach': `${PORTRAIT_ROOT}/jenita-blach.png`,
  'afal-blach': `${PORTRAIT_ROOT}/afal-blach.png`,
  'rhian-blach': `${PORTRAIT_ROOT}/rhian-blach.png`
});

export const HOUSE_BLACH_PORTRAITS = Object.freeze({
  ...HOUSE_BLACH_LOCAL_PORTRAITS,
  'maldwyn-illewod': HOUSE_ILLEWOD_PORTRAITS['maldwyn-illewod'],
  'gawain-blach': HOUSE_ILLEWOD_PORTRAITS['gawain-blach'],
  'carwyn-illewod': HOUSE_ILLEWOD_PORTRAITS['carwyn-illewod'],
  'dafydd-blach': HOUSE_ILLEWOD_PORTRAITS['dafydd-blach'],
  'aeron-blach': HOUSE_WYRM_PORTRAITS['aeron-blach'],
  'marve-wyrm': HOUSE_WYRM_PORTRAITS['marve-wyrm'],
  'idwallon-blach': HOUSE_WYRM_PORTRAITS['idwallon-blach'],
  'gogyvwlch-illysywen': HOUSE_ILLYSYWEN_PORTRAITS['gogyvwlch-illysywen'],
  'ifan-blach': HOUSE_WYLAN_PORTRAITS['ifan-blach'],
  'quendolin-dienyddiwr': HOUSE_DIENYDDIWR_PORTRAITS['quendolin-dienyddiwr'],
  'dylan-blach': HOUSE_DIENYDDIWR_PORTRAITS['dylan-blach'],
  'edlym-teyrngarch': HOUSE_TEYRNGARCH_PORTRAITS['edlym-teyrngarch'],
  'tegin-blach': HOUSE_TEYRNGARCH_PORTRAITS['tegin-blach'],
  'dolena-dyngwn': HOUSE_DYNGWN_PORTRAITS['dolena-dyngwn'],
  'meurig-blach': HOUSE_DYNGWN_PORTRAITS['meurig-blach'],
  'penryn-marwolaeth': HOUSE_MARWOLAETH_PORTRAITS['penryn-marwolaeth'],
  'tanwen-blach': HOUSE_MARWOLAETH_PORTRAITS['tanwen-blach']
});
