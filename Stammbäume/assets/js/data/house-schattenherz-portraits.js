import { HOUSE_FREIWINTER_PORTRAITS } from './house-freiwinter-portraits.js';
import { HOUSE_HJERTE_PORTRAITS } from './house-hjerte-portraits.js';
import { HOUSE_KAMPFGEBORENE_PORTRAITS } from './house-kampfgeborene-portraits.js';
import { HOUSE_KUMMERHERZ_PORTRAITS } from './house-kummerherz-portraits.js';
import { HOUSE_NACHTJAEGER_PORTRAITS } from './house-nachtjaeger-portraits.js';
import { HOUSE_SCHMETTERSCHILD_PORTRAITS } from './house-schmetterschild-portraits.js';
import { HOUSE_SKOGG_PORTRAITS } from './house-skogg-portraits.js';
import { HOUSE_VARANGR_PORTRAITS } from './house-varangr-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-schattenherz';

export const HOUSE_SCHATTENHERZ_LOCAL_PORTRAIT_FILES = Object.freeze({
  'jorulf-schattenherz': 'jorulf-schattenherz.png',
  'jarnbjorn-schattenherz': 'jarnbjorn-schattenherz.png',
  'arnsten-kaltherz': 'arnsten-kaltherz.png',
  'iokul-schattenherz': 'iokul-schattenherz.png',
  'eggert-schattenherz': 'eggert-schattenherz.png',
  'ornulf-schattenherz': 'ornulf-schattenherz.png',
  'kvedulf-schattenherz': 'kvedulf-schattenherz.png',
  'ingjald-blutstahl': 'ingjald-blutstahl.png',
  'fritjof-silberblut': 'fritjof-silberblut.png',
  'wiglund-schattenherz': 'wiglund-schattenherz.png',
  'thongvar-silberblut': 'thongvar-silberblut.png',
  'hallgrim-blutstahl': 'hallgrim-blutstahl.png',
  'isbrand-schattenherz': 'isbrand-schattenherz.png',
  'tjalda-schattenherz': 'tjalda-schattenherz.png',
  'tyrfing-schattenherz': 'tyrfing-schattenherz.png',
  'simun-schattenherz': 'simun-schattenherz.png',
  'brogan-wellenschild': 'brogan-wellenschild.png',
  'thera-goldglanz': 'thera-goldglanz.png',
  'dagni-kaltherz': 'dagni-kaltherz.png',
  'thjald-schattenherz': 'thjald-schattenherz.png',
  'ake-schattenherz': 'ake-schattenherz.png',
  'inga-wellenschild': 'inga-wellenschild.png',
  'selrik-schattenherz': 'selrik-schattenherz.png',
  'volga-schattenherz': 'volga-schattenherz.png',
  'rimbert-schattenherz': 'rimbert-schattenherz.png',
  'jurgla-schattenherz': 'jurgla-schattenherz.png',
  'hilda-schattenherz': 'hilda-schattenherz.png'
});

export const HOUSE_SCHATTENHERZ_PORTRAIT_SOURCES = Object.freeze({
  'jorulf-schattenherz': 'https://i.imgur.com/H4vCtAm.png',
  'jarnbjorn-schattenherz': 'https://i.imgur.com/4fDlqBb.png',
  'arnsten-kaltherz': 'https://i.imgur.com/1ARHfyG.png',
  'iokul-schattenherz': 'https://i.imgur.com/cww3Pdv.png',
  'eggert-schattenherz': 'https://i.imgur.com/LtFJfia.png',
  'ornulf-schattenherz': 'https://i.imgur.com/RMHqOoA.png',
  'kvedulf-schattenherz': 'https://i.imgur.com/z8Foen0.png',
  'ingjald-blutstahl': 'https://i.imgur.com/RjuNyrz.png',
  'fritjof-silberblut': 'https://i.imgur.com/IFsr9E2.png',
  'wiglund-schattenherz': 'https://i.imgur.com/xmKzlAY.png',
  'thongvar-silberblut': 'https://i.imgur.com/X769xWr.png',
  'hallgrim-blutstahl': 'https://i.imgur.com/V8k1el2.png',
  'isbrand-schattenherz': 'https://i.imgur.com/Ia3SqNx.png',
  'tjalda-schattenherz': 'https://i.imgur.com/vroKORN.png',
  'tyrfing-schattenherz': 'https://i.imgur.com/sNOipLv.png',
  'simun-schattenherz': 'https://i.imgur.com/MxM0TkL.png',
  'brogan-wellenschild': 'https://i.imgur.com/O07Ut0m.png',
  'thera-goldglanz': 'https://i.imgur.com/jWua56c.png',
  'dagni-kaltherz': 'https://i.imgur.com/Ckgvfuy.png',
  'thjald-schattenherz': 'https://i.imgur.com/eslpsdl.png',
  'ake-schattenherz': 'https://i.imgur.com/BmgPLaA.png',
  'inga-wellenschild': 'https://i.imgur.com/BOE9Lks.png',
  'selrik-schattenherz': 'https://i.imgur.com/vfg1Qb4.png',
  'volga-schattenherz': 'https://i.imgur.com/Ig3c9Yu.png',
  'rimbert-schattenherz': 'https://i.imgur.com/L2XmdWR.png',
  'jurgla-schattenherz': 'https://i.imgur.com/QiNojzP.png',
  'hilda-schattenherz': 'https://i.imgur.com/zCLbeQp.png'
});

const LOCAL_PORTRAITS = Object.fromEntries(
  Object.entries(HOUSE_SCHATTENHERZ_LOCAL_PORTRAIT_FILES).map(([personId, fileName]) => [
    personId,
    `${PORTRAIT_ROOT}/${fileName}`
  ])
);

export const HOUSE_SCHATTENHERZ_PORTRAITS = Object.freeze({
  ...LOCAL_PORTRAITS,
  'nordall-eisenbieger': 'assets/images/portraits/haus-kaltherz/nordall-eisenbieger.png',
  'zarnik-hjerte': HOUSE_HJERTE_PORTRAITS['zarnik-hjerte'],
  'ulfgar-schattenherz': HOUSE_NACHTJAEGER_PORTRAITS['ulfgar-schattenherz'],
  'fenrir-freiwinter': HOUSE_FREIWINTER_PORTRAITS['fenrir-freiwinter'],
  'vidarr-nachtjaeger': HOUSE_NACHTJAEGER_PORTRAITS['vidarr-nachtjaeger'],
  'vemund-schattenherz': HOUSE_SCHMETTERSCHILD_PORTRAITS['vemund-schattenherz'],
  'jorah-kummerherz': HOUSE_KUMMERHERZ_PORTRAITS['jorah-kummerherz'],
  'marduk-varangr': HOUSE_VARANGR_PORTRAITS['marduk-varangr'],
  'stigandr-skogg': HOUSE_SKOGG_PORTRAITS['stigandr-skogg'],
  'ulfrik-schattenherz': HOUSE_KAMPFGEBORENE_PORTRAITS['ulfrik-schattenherz'],
  'hulda-kampfgeborene': HOUSE_KAMPFGEBORENE_PORTRAITS['hulda-kampfgeborene'],
  'rorik-varangr': HOUSE_VARANGR_PORTRAITS['rorik-varangr'],
  'gisrun-schattenherz': HOUSE_VARANGR_PORTRAITS['gisrun-schattenherz']
});
