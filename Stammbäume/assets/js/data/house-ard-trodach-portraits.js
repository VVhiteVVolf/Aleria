import { HOUSE_ARD_FRISEALACH_PORTRAITS } from './house-ard-frisealach-portraits.js';
import { HOUSE_DAL_CRUTHIN_PORTRAITS } from './house-dal-cruthin-portraits.js';
import { HOUSE_RUIN_LAIDIR_LOCAL_PORTRAITS } from './house-ruin-laidir-local-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-ard-trodach';

export const HOUSE_ARD_TRODACH_LOCAL_PORTRAIT_FILES = Object.freeze({
  'fothadh-founder-trodach': 'fothadh-founder-trodach.png',
  'alasdair-trodach': 'alasdair-trodach.png',
  'fothadh-trodach': 'fothadh-trodach.png',
  'jodhran-trodach': 'jodhran-trodach.png',
  'diarmuid-trodach': 'diarmuid-trodach.png',
  'jonaibhi-trodach': 'jonaibhi-trodach.png',
  'lorcan-trodach': 'lorcan-trodach.png',
  'carthach-trodach': 'carthach-trodach.png',
  'uinseann-trodach': 'uinseann-trodach.png',
  'caireall-trodach': 'caireall-trodach.png',
  'lannraig-trodach': 'lannraig-trodach.png',
  'cearbhall-trodach': 'cearbhall-trodach.png',
  'domhnall-trodach': 'domhnall-trodach.png',
  'haolthan-trodach': 'haolthan-trodach.png',
  'lorghus-trodach': 'lorghus-trodach.png',
  'preachan-trodach': 'preachan-trodach.png',
  'traolach-trodach': 'traolach-trodach.png',
  'uasalan-tordach': 'uasalan-tordach.png',
  'maithnu-trodach': 'maithnu-trodach.png',
  'yoina-trodach': 'yoina-trodach.png',
  'huain-trodach': 'huain-trodach.png',
  'orlach-trodach': 'orlach-trodach.png',
  'eibhear-trodach': 'eibhear-trodach.png',
  'hanae-trodach': 'hanae-trodach.png',
  'unafri-trodach': 'unafri-trodach.png',
  'luane-trodach': 'luane-trodach.png'
});

export const HOUSE_ARD_TRODACH_LOCAL_PORTRAIT_IDS = Object.freeze(
  Object.keys(HOUSE_ARD_TRODACH_LOCAL_PORTRAIT_FILES)
);

export const HOUSE_ARD_TRODACH_REUSED_PORTRAIT_IDS = Object.freeze([
  'brogan-cruthin',
  'kadhghan-frisealach',
  'reathnaigh-caoimhe',
  'fechin-laidir'
]);

export const HOUSE_ARD_TRODACH_PORTRAITS = Object.freeze({
  ...Object.fromEntries(Object.entries(HOUSE_ARD_TRODACH_LOCAL_PORTRAIT_FILES).map(
    ([personId, fileName]) => [personId, `${PORTRAIT_ROOT}/${fileName}`]
  )),
  'brogan-cruthin': HOUSE_DAL_CRUTHIN_PORTRAITS['brogan-cruthin'],
  'kadhghan-frisealach': HOUSE_ARD_FRISEALACH_PORTRAITS['kadhghan-frisealach'],
  'reathnaigh-caoimhe': 'assets/images/portraits/haus-nic-caoimhe/reathnaigh-caoimhe.png',
  'fechin-laidir': HOUSE_RUIN_LAIDIR_LOCAL_PORTRAITS['fechin-laidir']
});
