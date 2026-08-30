import { HOUSE_FIR_AN_GALLCHOBHAIR_PORTRAITS } from './house-fir-an-gallchobhair-portraits.js';
import { HOUSE_FIR_AN_TARVO_PORTRAITS } from './house-fir-an-tarvo-portraits.js';
import { HOUSE_MAC_ARD_CUMHAILL_PORTRAITS } from './house-mac-ard-cumhaill-portraits.js';
import { HOUSE_RUIN_LAIDIR_LOCAL_PORTRAITS } from './house-ruin-laidir-local-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-dal-cruthin';

export const HOUSE_DAL_CRUTHIN_LOCAL_PORTRAIT_IDS = Object.freeze([
  'fearghus-founder-cruthin',
  'fionntan-cruthin',
  'haolthan-cruthin',
  'cathaoir-cruthin',
  'cleirchin-cruthin',
  'rionach-cruthin',
  'geallan-cruthin',
  'caoimhin-cruthin',
  'macha-cruthin',
  'brogan-cruthin',
  'cathalan-cruthin',
  'meallchu-cruthin',
  'polain-cruthin',
  'ruairi-cruthin',
  'fearghus-1699-cruthin',
  'lachtnaid-cruthin',
  'sorcha-1700-cruthin',
  'koibhne-cruthin',
  'tamsin-cruthin',
  'kolman-cruthin',
  'mairtin-cruthin',
  'priosa-cruthin',
  'loreen-cruthin',
  'ollamh-cruthin',
  'padraig-cruthin',
  'nollaig-cruthin'
]);

export const HOUSE_DAL_CRUTHIN_REUSED_PORTRAIT_IDS = Object.freeze([
  'keelaith-gallchobhair',
  'senan-1700-cumhail',
  'kalman-frisealach',
  'bronnach-frisealach',
  'caireall-trodach',
  'pailin-caoimhe',
  'latharna-caoimhe',
  'keava-iomrach',
  'ailidh-somhairle',
  'gaius-tarvo',
  'zolaith-gortach',
  'tiona-laidir'
]);

export const HOUSE_DAL_CRUTHIN_PORTRAITS = Object.freeze({
  ...Object.fromEntries(HOUSE_DAL_CRUTHIN_LOCAL_PORTRAIT_IDS.map(personId => [
    personId,
    `${PORTRAIT_ROOT}/${personId}.png`
  ])),
  'keelaith-gallchobhair': HOUSE_FIR_AN_GALLCHOBHAIR_PORTRAITS['keelaith-gallchobhair'],
  'senan-1700-cumhail': HOUSE_MAC_ARD_CUMHAILL_PORTRAITS['senan-1700-cumhail'],
  'kalman-frisealach': 'assets/images/portraits/haus-ard-frisealach/kalman-frisealach.png',
  'bronnach-frisealach': 'assets/images/portraits/haus-ard-frisealach/bronnach-frisealach.png',
  'caireall-trodach': 'assets/images/portraits/haus-ard-trodach/caireall-trodach.png',
  'pailin-caoimhe': 'assets/images/portraits/haus-nic-caoimhe/pailin-caoimhe.png',
  'latharna-caoimhe': 'assets/images/portraits/haus-nic-caoimhe/latharna-caoimhe.png',
  'keava-iomrach': 'assets/images/portraits/haus-iomrach/keava-iomrach.png',
  'ailidh-somhairle': 'assets/images/portraits/haus-sidhe-somhairle/ailidh-somhairle.png',
  'gaius-tarvo': HOUSE_FIR_AN_TARVO_PORTRAITS['gaius-tarvo'],
  'zolaith-gortach': 'assets/images/portraits/haus-ru-gortach/zolaith-gortach.jpg',
  'tiona-laidir': HOUSE_RUIN_LAIDIR_LOCAL_PORTRAITS['tiona-laidir']
});
