import { HOUSE_ADERYN_PORTRAITS } from './house-aderyn-portraits.js';
import { HOUSE_ERYR_PORTRAITS } from './house-eryr-portraits.js';
import { HOUSE_FREIWINTER_PORTRAITS } from './house-freiwinter-portraits.js';
import { HOUSE_HEBOG_PORTRAITS } from './house-hebog-portraits.js';
import { HOUSE_MWYALCHEN_PORTRAITS } from './house-mwyalchen-portraits.js';
import { HOUSE_SCHWARZDORN_PORTRAITS } from './house-schwarzdorn-portraits.js';
import { HOUSE_SKAAL_PORTRAITS } from './house-skaal-portraits.js';
import { HOUSE_STERKR_PORTRAITS } from './house-sterkr-portraits.js';
import { HOUSE_TYLLUAN_PORTRAITS } from './house-tylluan-portraits.js';
import { HOUSE_WARGH_PORTRAITS } from './house-wargh-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-feuerhaar';

export const HOUSE_FEUERHAAR_LOCAL_PORTRAIT_FILES = Object.freeze({
  'robyn-pengoch': 'robyn-pengoch.png',
  'sigtrygg-arnvild': 'sigtrygg-arnvild.png',
  'skjoldulf-feuerhaar': 'skjoldulf-feuerhaar.png',
  'vikar-silberblut': 'vikar-silberblut.png',
  'ketill-feuerhaar': 'ketill-feuerhaar.png',
  'fjornir-feuerhaar': 'fjornir-feuerhaar.png',
  'skulla-feuerhaar': 'skulla-feuerhaar.png',
  'sigbjorn-feuerhaar': 'sigbjorn-feuerhaar.png',
  'kolskegg-silberzunge': 'kolskegg-silberzunge.png',
  'armod-feuerhaar': 'armod-feuerhaar.png',
  'fenya-feuerhaar': 'fenya-feuerhaar.png',
  'lodinn-feuerhaar': 'lodinn-feuerhaar.png',
  'runolf-feuerhaar': 'runolf-feuerhaar.png',
  'thorarin-feuerhaar': 'thorarin-feuerhaar.png',
  'asta-kummerherz': 'asta-kummerherz.png',
  'erik-grendel': 'erik-grendel.png',
  'bjart-feuerhaar': 'bjart-feuerhaar.png',
  'rafn-feuerhaar': 'rafn-feuerhaar.png',
  'lilja-feuerhaar': 'lilja-feuerhaar.jpg',
  'magni-gullvig': 'magni-gullvig.png',
  'volund-feuerhaar': 'volund-feuerhaar.png',
  'idunn-feuerhaar': 'idunn-feuerhaar.png',
  'svart-feuerhaar': 'svart-feuerhaar.png',
  'eilif-feuerhaar': 'eilif-feuerhaar.png'
});

export const HOUSE_FEUERHAAR_PORTRAIT_SOURCES = Object.freeze({
  'robyn-pengoch': 'https://i.imgur.com/TJjarFn.png',
  'sigtrygg-arnvild': 'https://i.imgur.com/SGWfmKX.png',
  'skjoldulf-feuerhaar': 'https://i.imgur.com/amtdNen.png',
  'vikar-silberblut': 'https://i.imgur.com/M4jDxQP.png',
  'ketill-feuerhaar': 'https://i.imgur.com/nJK4gP6.png',
  'fjornir-feuerhaar': 'https://i.imgur.com/t06W7D5.png',
  'skulla-feuerhaar': 'https://i.imgur.com/z8xnbHj.png',
  'sigbjorn-feuerhaar': 'https://i.imgur.com/uD3lgjj.png',
  'kolskegg-silberzunge': 'https://i.imgur.com/2FosNFl.png',
  'armod-feuerhaar': 'https://i.imgur.com/8AGy8A4.png',
  'fenya-feuerhaar': 'https://i.imgur.com/vsQSZrE.png',
  'lodinn-feuerhaar': 'https://i.imgur.com/woxJg3S.png',
  'runolf-feuerhaar': 'https://i.imgur.com/diMoiTJ.png',
  'thorarin-feuerhaar': 'https://i.imgur.com/xKBHsqS.png',
  'asta-kummerherz': 'https://i.imgur.com/vaGegnM.png',
  'erik-grendel': 'https://i.imgur.com/f5VD2F8.png',
  'bjart-feuerhaar': 'https://i.imgur.com/wFz2koa.png',
  'rafn-feuerhaar': 'https://i.imgur.com/Rm1kGaI.png',
  'lilja-feuerhaar': 'https://i.imgur.com/BvvYome.jpeg',
  'magni-gullvig': 'https://i.imgur.com/iXCLP7t.png',
  'volund-feuerhaar': 'https://i.imgur.com/vC6BHgh.png',
  'idunn-feuerhaar': 'https://i.imgur.com/APkjfbG.png',
  'svart-feuerhaar': 'https://i.imgur.com/jDpkHfF.png',
  'eilif-feuerhaar': 'https://i.imgur.com/xc7nHT2.png'
});

const LOCAL_PORTRAITS = Object.freeze(Object.fromEntries(
  Object.entries(HOUSE_FEUERHAAR_LOCAL_PORTRAIT_FILES).map(([personId, fileName]) => [
    personId,
    `${PORTRAIT_ROOT}/${fileName}`
  ])
));

// Bereits ausgearbeitete Gegenakten bleiben die kanonische Bildquelle. So
// zeigen beide Stammbäume dieselbe Weltperson stets mit demselben Porträt.
export const HOUSE_FEUERHAAR_PORTRAITS = Object.freeze({
  ...LOCAL_PORTRAITS,
  'geirlaug-wargh': HOUSE_WARGH_PORTRAITS['geirlaug-wargh'],
  'thorsleikr-feuerhaar': HOUSE_WARGH_PORTRAITS['thorsleikr-feuerhaar'],
  'iormund-schwarzdorn': HOUSE_SCHWARZDORN_PORTRAITS['iormund-schwarzdorn'],
  'ranveig-feuerhaar': HOUSE_SCHWARZDORN_PORTRAITS['ranveig-feuerhaar'],
  'skjalg-sterkr': HOUSE_STERKR_PORTRAITS['skjalg-sterkr'],
  'geirny-feuerhaar': HOUSE_STERKR_PORTRAITS['geirny-feuerhaar'],
  'odin-feuerhaar': HOUSE_ADERYN_PORTRAITS['odin-feuerhaar'],
  'heledd-aderyn': HOUSE_ADERYN_PORTRAITS['heledd-aderyn'],
  'mordred-hebog': HOUSE_HEBOG_PORTRAITS['mordred-hebog'],
  'cieran-mwyalchen': HOUSE_MWYALCHEN_PORTRAITS['cieran-mwyalchen'],
  'torstein-wargh': HOUSE_WARGH_PORTRAITS['torstein-wargh'],
  'sigurd-freiwinter': HOUSE_FREIWINTER_PORTRAITS['sigurd-freiwinter'],
  'frida-feuerhaar': HOUSE_FREIWINTER_PORTRAITS['frida-feuerhaar'],
  'gunnar-feuerhaar': HOUSE_SKAAL_PORTRAITS['gunnar-feuerhaar'],
  'ulrikka-skaal': HOUSE_SKAAL_PORTRAITS['ulrikka-skaal'],
  'ingvar-feuerhaar': HOUSE_TYLLUAN_PORTRAITS['ingvar-feuerhaar'],
  'wynthonya-tylluan': HOUSE_TYLLUAN_PORTRAITS['wynthonya-tylluan'],
  'vigmar-schwarzdorn': HOUSE_SCHWARZDORN_PORTRAITS['vigmar-schwarzdorn'],
  'frigga-feuerhaar': HOUSE_SCHWARZDORN_PORTRAITS['frigga-feuerhaar'],
  'aksel-feuerhaar': HOUSE_ERYR_PORTRAITS['aksel-feuerhaar'],
  'meriel-eryr': HOUSE_ERYR_PORTRAITS['meriel-eryr']
});
