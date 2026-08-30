import { HOUSE_ARD_FRISEALACH_PORTRAITS } from './house-ard-frisealach-portraits.js';
import { HOUSE_DAL_CRUTHIN_PORTRAITS } from './house-dal-cruthin-portraits.js';
import { HOUSE_FIR_AN_TARVO_PORTRAITS } from './house-fir-an-tarvo-portraits.js';
import { HOUSE_GWEFRYDD_PORTRAITS } from './house-gwefrydd-portraits.js';
import { HOUSE_MAC_ARD_CUMHAILL_PORTRAITS } from './house-mac-ard-cumhaill-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-ru-gortach';

export const HOUSE_RU_GORTACH_LOCAL_PORTRAIT_FILES = Object.freeze({
  'aodhluan-founder-gortach': 'aodhluan-founder-gortach.png',
  'aodhluan-1621-gortach': 'aodhluan-1621-gortach.png',
  'fuirseach-gortach': 'fuirseach-gortach.png',
  'luibheas-gortach': 'luibheas-gortach.png',
  'lughaidh-gortach': 'lughaidh-gortach.png',
  'carthach-gortach': 'carthach-gortach.png',
  'kinneth-gortach': 'kinneth-gortach.png',
  'caoilte-gortach': 'caoilte-gortach.png',
  'quiseog-gortach': 'quiseog-gortach.png',
  'jodhran-gortach': 'jodhran-gortach.png',
  'peighneachan-gortach': 'peighneachan-gortach.png',
  'aoghan-gortach': 'aoghan-gortach.png',
  'zolaith-gortach': 'zolaith-gortach.jpg',
  'seamus-gortach': 'seamus-gortach.png',
  'hiomhar-gortach': 'hiomhar-gortach.jpg',
  'eilis-gortach': 'eilis-gortach.jpg',
  'loicin-gortach': 'loicin-gortach.png',
  'eadan-gortach': 'eadan-gortach.jpg',
  'urchadh-gortach': 'urchadh-gortach.png',
  'zilbra-gortach': 'zilbra-gortach.png',
  'midean-gortach': 'midean-gortach.jpg',
  'noreen-gortach': 'noreen-gortach.png',
  'briciu-gortach': 'briciu-gortach.png',
  'hanae-gortach': 'hanae-gortach.png',
  'vadran-gortach': 'vadran-gortach.png'
});

export const HOUSE_RU_GORTACH_LOCAL_PORTRAIT_IDS = Object.freeze(
  Object.keys(HOUSE_RU_GORTACH_LOCAL_PORTRAIT_FILES)
);

export const HOUSE_RU_GORTACH_REUSED_PORTRAIT_IDS = Object.freeze([
  'garvan-gortach',
  'luntorius-tarvo',
  'eadbhard-frisealach',
  'dubhan-cumhail',
  'ronmara-tarvo',
  'koibhne-cruthin',
  'muirinn-ruitheach',
  'rionach-amhran'
]);

export const HOUSE_RU_GORTACH_PORTRAITS = Object.freeze({
  ...Object.fromEntries(Object.entries(HOUSE_RU_GORTACH_LOCAL_PORTRAIT_FILES).map(
    ([personId, fileName]) => [personId, `${PORTRAIT_ROOT}/${fileName}`]
  )),
  'garvan-gortach': HOUSE_GWEFRYDD_PORTRAITS['garvan-gortach'],
  'luntorius-tarvo': HOUSE_FIR_AN_TARVO_PORTRAITS['luntorius-tarvo'],
  'eadbhard-frisealach': HOUSE_ARD_FRISEALACH_PORTRAITS['eadbhard-frisealach'],
  'dubhan-cumhail': HOUSE_MAC_ARD_CUMHAILL_PORTRAITS['dubhan-cumhail'],
  'ronmara-tarvo': HOUSE_FIR_AN_TARVO_PORTRAITS['ronmara-tarvo'],
  'koibhne-cruthin': HOUSE_DAL_CRUTHIN_PORTRAITS['koibhne-cruthin'],
  'muirinn-ruitheach': 'assets/images/portraits/haus-dal-ruitheach/muirinn-ruitheach.png',
  'rionach-amhran': 'assets/images/portraits/haus-ua-amrhan/rionach-amrhan.png'
});
