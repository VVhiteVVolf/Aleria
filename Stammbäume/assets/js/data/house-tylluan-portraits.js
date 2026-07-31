import { HOUSE_ADERYN_PORTRAITS } from './house-aderyn-portraits.js';
import { HOUSE_CREYR_PORTRAITS } from './house-creyr-portraits.js';
import { HOUSE_ERYR_PORTRAITS } from './house-eryr-portraits.js';
import { HOUSE_GWARCHOD_PORTRAITS } from './house-gwarchod-portraits.js';
import { HOUSE_ILLEWOD_PORTRAITS } from './house-illewod-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-tylluan';

export const HOUSE_TYLLUAN_LOCAL_PORTRAIT_FILES = Object.freeze({
  'niadhnair-tylluan': 'niadhnair-tylluan.png',
  'arawn-tylluan': 'arawn-tylluan.png',
  'gwynham-1630-tylluan': 'gwynham-1630-tylluan.png',
  'gwion-tylluan': 'gwion-tylluan.png',
  'wynthonya-tylluan': 'wynthonya-tylluan.png',
  'ingvar-feuerhaar': 'ingvar-feuerhaar.png',
  'lucan-tylluan': 'lucan-tylluan.png',
  'jenara-tylluan': 'jenara-tylluan.png',
  'gwendal-tylluan': 'gwendal-tylluan.png',
  'talaith-tylluan': 'talaith-tylluan.png',
  'thalena-hebog': 'thalena-hebog.png',
  'wynoc-wivern': 'wynoc-wivern.jpg',
  'tatumn-mwyalchen': 'tatumn-mwyalchen.png',
  'cyrelas-loganne': 'cyrelas-loganne.jpg',
  'arian-tylluan': 'arian-tylluan.png',
  'madoc-tylluan': 'madoc-tylluan.png',
  'thivya-tylluan': 'thivya-tylluan.png',
  'deri-tylluan': 'deri-tylluan.png',
  'skywyn-tylluan': 'skywyn-tylluan.png',
  'tesni-ilyuncu': 'tesni-ilyuncu.png'
});

const LOCAL_PORTRAITS = Object.freeze(Object.fromEntries(
  Object.entries(HOUSE_TYLLUAN_LOCAL_PORTRAIT_FILES).map(([personId, fileName]) => [
    personId,
    `${PORTRAIT_ROOT}/${fileName}`
  ])
));

// Bereits ausgearbeitete Gegenakten bleiben für dieselbe Weltperson die
// kanonische Bildquelle. Die wiederholten schwarzen Standardsilhouetten der
// Altquelle werden nicht als vermeintlich individuelle Porträts importiert.
export const HOUSE_TYLLUAN_PORTRAITS = Object.freeze({
  ...LOCAL_PORTRAITS,
  'siors-aderyn': HOUSE_ADERYN_PORTRAITS['siors-aderyn'],
  'efnisien-aderyn': HOUSE_ADERYN_PORTRAITS['efnisien-aderyn'],
  'blegwywyrd-tylluan': HOUSE_CREYR_PORTRAITS['blegwywyrd-tylluan'],
  'cynfelyn-eryr': HOUSE_ERYR_PORTRAITS['cynfelyn-eryr'],
  'bowen-tylluan': HOUSE_ERYR_PORTRAITS['bowen-tylluan'],
  'venora-eryr': HOUSE_ERYR_PORTRAITS['venora-eryr'],
  'tegan-gwarchod': HOUSE_GWARCHOD_PORTRAITS['tegan-gwarchod'],
  'wyett-tylluan': HOUSE_GWARCHOD_PORTRAITS['wyett-tylluan'],
  'evaine-illewod': HOUSE_ILLEWOD_PORTRAITS['evaine-illewod'],
  'shan-tylluan': HOUSE_ILLEWOD_PORTRAITS['shan-tylluan']
});
