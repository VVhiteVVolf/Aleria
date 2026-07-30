import { HOUSE_ARTH_LOCAL_PORTRAITS } from './house-arth-local-portraits.js';
import { HOUSE_DRAIG_PORTRAITS } from './house-draig-portraits.js';
import { HOUSE_GRAWN_PORTRAITS } from './house-grawn-portraits.js';
import { HOUSE_ILLEWOD_PORTRAITS } from './house-illewod-portraits.js';
import { HOUSE_PENDRAG_PORTRAITS } from './house-pendrag-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-penderyn';

const LOCAL_PENDERYN_PORTRAITS = Object.freeze({
  'islwyn-penderyn': `${PORTRAIT_ROOT}/islwyn-penderyn.png`,
  'dadweir-penderyn': `${PORTRAIT_ROOT}/dadweir-penderyn.png`,
  'sieffre-marwolaeth': `${PORTRAIT_ROOT}/sieffre-marwolaeth.jpg`,
  'enevold-penderyn': `${PORTRAIT_ROOT}/enevold-penderyn.png`,
  'gareth-penderyn': `${PORTRAIT_ROOT}/gareth-penderyn.png`,
  'gwastad-teyrngarch': `${PORTRAIT_ROOT}/gwastad-teyrngarch.png`,
  'talfryn-penderyn': `${PORTRAIT_ROOT}/talfryn-penderyn.png`,
  'osian-penderyn': `${PORTRAIT_ROOT}/osian-penderyn.png`,
  'bethania-dyngwn': `${PORTRAIT_ROOT}/bethania-dyngwn.jpg`,
  'aneurin-crefyddol': `${PORTRAIT_ROOT}/aneurin-crefyddol.jpg`,
  'nolwen-dienyddiwr': `${PORTRAIT_ROOT}/nolwen-dienyddiwr.jpg`,
  'aneurin-penderyn': `${PORTRAIT_ROOT}/aneurin-penderyn.png`,
  'sabria-penderyn': `${PORTRAIT_ROOT}/sabria-penderyn.png`,
  'steffan-penderyn': `${PORTRAIT_ROOT}/steffan-penderyn.png`,
  'gethin-penderyn': `${PORTRAIT_ROOT}/gethin-penderyn.png`,
  'meinir-sgwarnog': `${PORTRAIT_ROOT}/meinir-sgwarnog.jpg`,
  'idris-dienyddiwr': `${PORTRAIT_ROOT}/idris-dienyddiwr.jpg`,
  'teghan-chiffyddlon': `${PORTRAIT_ROOT}/teghan-chiffyddlon.jpg`,
  'lynee-canwyll': `${PORTRAIT_ROOT}/lynee-canwyll.jpg`,
  'rhon-penderyn': `${PORTRAIT_ROOT}/rhon-penderyn.png`,
  'dwnn-penderyn': `${PORTRAIT_ROOT}/dwnn-penderyn.png`,
  'jinell-penderyn': `${PORTRAIT_ROOT}/jinell-penderyn.png`,
  'meuric-penderyn': `${PORTRAIT_ROOT}/meuric-penderyn.png`,
  'fflurwen-penderyn': `${PORTRAIT_ROOT}/fflurwen-penderyn.png`,
  'gower-penderyn': `${PORTRAIT_ROOT}/gower-penderyn.png`,
  'frewi-penderyn': `${PORTRAIT_ROOT}/frewi-penderyn.png`,
  'elinor-teyrngarch': `${PORTRAIT_ROOT}/elinor-teyrngarch.png`
});

export const HOUSE_PENDERYN_PORTRAITS = Object.freeze({
  ...LOCAL_PENDERYN_PORTRAITS,
  'gwales-illewod': HOUSE_ILLEWOD_PORTRAITS['gwales-illewod'],
  'rhydian-grawn': HOUSE_GRAWN_PORTRAITS['rhydian-grawn'],
  'lamorak-pendrag': HOUSE_PENDRAG_PORTRAITS['lamorak-pendrag'],
  'lynfa-penderyn': HOUSE_PENDRAG_PORTRAITS['lynfa-penderyn'],
  'ffodor-arth': HOUSE_ARTH_LOCAL_PORTRAITS['ffodor-arth'],
  'tudwal-draig': HOUSE_DRAIG_PORTRAITS['tudwal-draig'],
  'revelyn-penderyn': HOUSE_DRAIG_PORTRAITS['revelyn-penderyn']
});
