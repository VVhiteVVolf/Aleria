import { HOUSE_FIR_AN_TARVO_PORTRAITS } from './house-fir-an-tarvo-portraits.js';
import { HOUSE_RU_GORTACH_PORTRAITS } from './house-ru-gortach-portraits.js';
import { HOUSE_RUIN_LAIDIR_LOCAL_PORTRAITS } from './house-ruin-laidir-local-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-dal-ruitheach';

export const HOUSE_DAL_RUITHEACH_LOCAL_PORTRAIT_FILES = Object.freeze({
  'ruaidhri-founder-ruitheach': 'ruaidhri-founder-ruitheach.png',
  'wiochan-ruitheach': 'wiochan-ruitheach.png',
  'ruaidhri-1648-ruitheach': 'ruaidhri-1648-ruitheach.png',
  'judan-ruitheach': 'judan-ruitheach.png',
  'muirinn-ruitheach': 'muirinn-ruitheach.png',
  'conairean-ruitheach': 'conairean-ruitheach.png',
  'gorman-ruitheach': 'gorman-ruitheach.png',
  'troscan-ruitheach': 'troscan-ruitheach.jpg',
  'meabh-ruitheach': 'meabh-ruitheach.jpg',
  'tormodh-ruitheach': 'tormodh-ruitheach.jpg',
  'jaimhin-ruitheach': 'jaimhin-ruitheach.jpg',
  'ealasaid-ruitheach': 'ealasaid-ruitheach.jpg',
  'nibhn-ruitheach': 'nibhn-ruitheach.jpg',
  'cailin-ruitheach': 'cailin-ruitheach.jpg',
  'blaine-ruitheach': 'blaine-ruitheach.jpg',
  'donal-ruitheach': 'donal-ruitheach.jpg'
});

export const HOUSE_DAL_RUITHEACH_LOCAL_PORTRAIT_IDS = Object.freeze(
  Object.keys(HOUSE_DAL_RUITHEACH_LOCAL_PORTRAIT_FILES)
);

export const HOUSE_DAL_RUITHEACH_REUSED_PORTRAIT_IDS = Object.freeze([
  'quiseog-gortach',
  'laimreac-tarvo',
  'kadhghan-laidir'
]);

export const HOUSE_DAL_RUITHEACH_PORTRAITS = Object.freeze({
  ...Object.fromEntries(Object.entries(HOUSE_DAL_RUITHEACH_LOCAL_PORTRAIT_FILES).map(
    ([personId, fileName]) => [personId, `${PORTRAIT_ROOT}/${fileName}`]
  )),
  'quiseog-gortach': HOUSE_RU_GORTACH_PORTRAITS['quiseog-gortach'],
  'laimreac-tarvo': HOUSE_FIR_AN_TARVO_PORTRAITS['laimreac-tarvo'],
  'kadhghan-laidir': HOUSE_RUIN_LAIDIR_LOCAL_PORTRAITS['kadhghan-laidir']
});
