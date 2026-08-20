import { HOUSE_BLUTSTAHL_PORTRAITS } from './house-blutstahl-portraits.js';
import { HOUSE_GRAUMAHNE_PORTRAITS } from './house-graumahne-portraits.js';
import { HOUSE_HJERTE_PORTRAITS } from './house-hjerte-portraits.js';
import { HOUSE_KUMMERHERZ_PORTRAITS } from './house-kummerherz-portraits.js';
import { HOUSE_NACHTJAEGER_PORTRAITS } from './house-nachtjaeger-portraits.js';
import { HOUSE_RAGNULF_PORTRAITS } from './house-ragnulf-portraits.js';
import { HOUSE_SCHATTENHERZ_PORTRAITS } from './house-schattenherz-portraits.js';
import { HOUSE_SCHMETTERSCHILD_PORTRAITS } from './house-schmetterschild-portraits.js';
import { HOUSE_SCHWARZBLUT_PORTRAITS } from './house-schwarzblut-portraits.js';
import { HOUSE_SKOGG_PORTRAITS } from './house-skogg-portraits.js';
import { HOUSE_VARANGR_PORTRAITS } from './house-varangr-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-kaltherz';

export const HOUSE_KALTHERZ_LOCAL_PORTRAIT_FILES = Object.freeze({
  'kjartan-kaltherz': 'kjartan-kaltherz.png',
  'gorrim-kaltherz': 'gorrim-kaltherz.png',
  'kavan-leite': 'kavan-leite.png',
  'ljotur-kaltherz': 'ljotur-kaltherz.png',
  'joekull-kaltherz': 'joekull-kaltherz.png',
  'eadbhard-eldath': 'eadbhard-eldath.pnj',
  'hordur-kaltherz': 'hordur-kaltherz.png',
  'rofgeir-kaltherz': 'rofgeir-kaltherz.png',
  'nordall-eisenbieger': 'nordall-eisenbieger.png',
  'jerrik-kaltherz': 'jerrik-kaltherz.png',
  'hjalmar-kaltherz': 'hjalmar-kaltherz.jpeg',
  'fjori-kaltherz': 'fjori-kaltherz.png',
  'rina-kaltherz': 'rina-kaltherz.png',
  'elrik-kaltherz': 'elrik-kaltherz.jpeg',
  'mjoll-kaltherz': 'mjoll-kaltherz.png'
});

export const HOUSE_KALTHERZ_PORTRAIT_SOURCES = Object.freeze({
  'kjartan-kaltherz': 'https://i.imgur.com/55ByBVa.png',
  'gorrim-kaltherz': 'https://i.imgur.com/Sn3yLpB.png',
  'kavan-leite': 'https://i.imgur.com/bqjXkKA.png',
  'ljotur-kaltherz': 'https://i.imgur.com/pfFxnUq.png',
  'joekull-kaltherz': 'https://i.imgur.com/WOjykaY.png',
  'eadbhard-eldath': 'https://64.media.tumblr.com/29b5a6468fc6f9913c51090613d0a82e/56f7b6c8ee2aa47c-36/s250x400/08d684e0d617177b0066c7ca869835f4eafc2f9d.pnj',
  'hordur-kaltherz': 'https://i.imgur.com/ntfZT5N.png',
  'rofgeir-kaltherz': 'https://i.imgur.com/lmevy7v.png',
  'nordall-eisenbieger': 'https://i.imgur.com/wzSt8Zr.png',
  'jerrik-kaltherz': 'https://i.imgur.com/eOkawiB.png',
  'hjalmar-kaltherz': 'https://i.imgur.com/JAsbfJC.jpeg',
  'fjori-kaltherz': 'https://i.imgur.com/Fdo12ZQ.png',
  'rina-kaltherz': 'https://i.imgur.com/Q4hX3qj.png',
  'elrik-kaltherz': 'https://i.imgur.com/ATnevXo.jpeg',
  'mjoll-kaltherz': 'https://i.imgur.com/AxL74QS.png'
});

const LOCAL_PORTRAITS = Object.freeze(Object.fromEntries(
  Object.entries(HOUSE_KALTHERZ_LOCAL_PORTRAIT_FILES).map(([personId, fileName]) => [
    personId,
    `${PORTRAIT_ROOT}/${fileName}`
  ])
));

export const HOUSE_KALTHERZ_PORTRAITS = Object.freeze({
  ...LOCAL_PORTRAITS,
  'kjalmar-hjerte': HOUSE_HJERTE_PORTRAITS['kjalmar-hjerte'],
  'jothmund-kummerherz': HOUSE_KUMMERHERZ_PORTRAITS['jothmund-kummerherz'],
  'vigtyr-kaltherz': HOUSE_GRAUMAHNE_PORTRAITS['vigtyr-kaltherz'],
  'joekull-nachtjaeger': HOUSE_NACHTJAEGER_PORTRAITS['joekull-nachtjaeger'],
  'eldgrim-ragnulf': HOUSE_RAGNULF_PORTRAITS['eldgrim-ragnulf'],
  'galvar-kaltherz': HOUSE_VARANGR_PORTRAITS['galvar-kaltherz'],
  'frideborg-varangr': HOUSE_VARANGR_PORTRAITS['frideborg-varangr'],
  'arnsten-kaltherz': HOUSE_SCHATTENHERZ_PORTRAITS['arnsten-kaltherz'],
  'nottulf-kaltherz': HOUSE_BLUTSTAHL_PORTRAITS['nottulf-kaltherz'],
  'eggert-schattenherz': HOUSE_SCHATTENHERZ_PORTRAITS['eggert-schattenherz'],
  'kalfur-kaltherz': HOUSE_SCHWARZBLUT_PORTRAITS['kalfur-kaltherz'],
  'jorvik-kaltherz': HOUSE_BLUTSTAHL_PORTRAITS['jorvik-kaltherz'],
  'thorodd-schmetterschild': HOUSE_SCHMETTERSCHILD_PORTRAITS['thorodd-schmetterschild'],
  'njvar-kaltherz': HOUSE_VARANGR_PORTRAITS['njvar-kaltherz'],
  'erna-varangr': HOUSE_VARANGR_PORTRAITS['erna-varangr'],
  'dagni-kaltherz': HOUSE_SCHATTENHERZ_PORTRAITS['dagni-kaltherz'],
  'simun-schattenherz': HOUSE_SCHATTENHERZ_PORTRAITS['simun-schattenherz'],
  'eldkatla-kaltherz': HOUSE_SKOGG_PORTRAITS['eldkatla-kaltherz'],
  'sigrod-skogg': HOUSE_SKOGG_PORTRAITS['sigrod-skogg']
});
