import { HOUSE_BLUTSTAHL_PORTRAITS } from './house-blutstahl-portraits.js';
import { HOUSE_FEUERHERZ_PORTRAITS } from './house-feuerherz-portraits.js';
import { HOUSE_KALTHERZ_PORTRAITS } from './house-kaltherz-portraits.js';
import { HOUSE_KAMPFGEBORENE_PORTRAITS } from './house-kampfgeborene-portraits.js';
import { HOUSE_SCHATTENHERZ_PORTRAITS } from './house-schattenherz-portraits.js';
import { HOUSE_SCHMETTERSCHILD_PORTRAITS } from './house-schmetterschild-portraits.js';
import { HOUSE_SCHWARZBLUT_PORTRAITS } from './house-schwarzblut-portraits.js';
import { HOUSE_SILBERBLUT_PORTRAITS } from './house-silberblut-portraits.js';
import { HOUSE_VARANGR_PORTRAITS } from './house-varangr-portraits.js';
import { HOUSE_VRAGI_PORTRAITS } from './house-vragi-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-goldglanz';

export const HOUSE_GOLDGLANZ_LOCAL_PORTRAIT_FILES = Object.freeze({
  'ljotmar-goldglanz': 'ljotmar-goldglanz.png',
  'haraldr-goldglanz': 'haraldr-goldglanz.png',
  'birger-goldglanz': 'birger-goldglanz.png',
  'skule-goldglanz': 'skule-goldglanz.png',
  'magnus-1626-goldglanz': 'magnus-1626-goldglanz.png',
  'krister-goldglanz': 'krister-goldglanz.png',
  'wulfgar-1668-goldglanz': 'wulfgar-1668-goldglanz.png',
  'gulda-1682-goldglanz': 'gulda-1682-goldglanz.png',
  'nvjar-goldglanz': 'nvjar-goldglanz.png',
  'martein-wellenschild': 'martein-wellenschild.png',
  'tyrkir-goldglanz': 'tyrkir-goldglanz.png',
  'yornir-goldglanz': 'yornir-goldglanz.png',
  'urdin-goldglanz': 'urdin-goldglanz.png',
  'sverre-goldglanz': 'sverre-goldglanz.png',
  'zagna-goldglanz': 'zagna-goldglanz.png',
  'peder-goldglanz': 'peder-goldglanz.png',
  'rikke-goldglanz': 'rikke-goldglanz.png',
  'eithne-haeghra': 'eithne-haeghra.jpeg',
  'magnus-1735-goldglanz': 'magnus-1735-goldglanz.png'
});

export const HOUSE_GOLDGLANZ_PORTRAIT_SOURCES = Object.freeze({
  'ljotmar-goldglanz': 'https://i.imgur.com/PACnPHr.png',
  'haraldr-goldglanz': 'https://i.imgur.com/8gcdArl.png',
  'birger-goldglanz': 'https://i.imgur.com/XIgOIls.png',
  'skule-goldglanz': 'https://i.imgur.com/tyF9i5o.png',
  'magnus-1626-goldglanz': 'https://i.imgur.com/Q3q7vuI.png',
  'krister-goldglanz': 'https://i.imgur.com/vxqBjIV.png',
  'wulfgar-1668-goldglanz': 'https://i.imgur.com/86jadsZ.png',
  'gulda-1682-goldglanz': 'https://i.imgur.com/lQLtf2q.png',
  'nvjar-goldglanz': 'https://i.imgur.com/d6C7x5G.png',
  'martein-wellenschild': 'https://i.imgur.com/cTahrdQ.png',
  'tyrkir-goldglanz': 'https://i.imgur.com/UXtIYmz.png',
  'yornir-goldglanz': 'https://i.imgur.com/7vZkwLf.png',
  'urdin-goldglanz': 'https://i.imgur.com/erfBzQ7.png',
  'sverre-goldglanz': 'https://i.imgur.com/ZbYd7Qr.png',
  'zagna-goldglanz': 'https://i.imgur.com/6C4BhWp.png',
  'peder-goldglanz': 'https://i.imgur.com/3yfHCAY.png',
  'rikke-goldglanz': 'https://i.imgur.com/TdGG8iR.png',
  'eithne-haeghra': 'https://i.imgur.com/WRyDFoO.jpeg',
  'magnus-1735-goldglanz': 'https://i.imgur.com/wnABdgT.png'
});

const LOCAL_PORTRAITS = Object.freeze(Object.fromEntries(
  Object.entries(HOUSE_GOLDGLANZ_LOCAL_PORTRAIT_FILES).map(([personId, fileName]) => [
    personId,
    `${PORTRAIT_ROOT}/${fileName}`
  ])
));

// Wiederkehrende Standardsilhouetten der Quelle bleiben echte Platzhalter.
// Bereits in Gegenakten bekannte Weltpersonen verwenden ihr kanonisches Bild.
export const HOUSE_GOLDGLANZ_PORTRAITS = Object.freeze({
  ...LOCAL_PORTRAITS,
  'wulfgar-goldglanz': HOUSE_SILBERBLUT_PORTRAITS['wulfgar-goldglanz'],
  'torvald-1585-varangr': HOUSE_VARANGR_PORTRAITS['torvald-1585-varangr'],
  'eirik-schwarzblut': HOUSE_SCHWARZBLUT_PORTRAITS['eirik-schwarzblut'],
  'harald-blutstahl': HOUSE_BLUTSTAHL_PORTRAITS['harald-blutstahl'],
  'askold-silberblut': HOUSE_SILBERBLUT_PORTRAITS['askold-silberblut'],
  'borkur-feuerherz': HOUSE_FEUERHERZ_PORTRAITS['borkur-feuerherz'],
  'sigurd-goldglanz': HOUSE_SCHMETTERSCHILD_PORTRAITS['sigurd-goldglanz'],
  'ljotur-kaltherz': HOUSE_KALTHERZ_PORTRAITS['ljotur-kaltherz'],
  'vidkun-goldglanz': HOUSE_VRAGI_PORTRAITS['vidkun-goldglanz'],
  'ana-goldglanz': HOUSE_KAMPFGEBORENE_PORTRAITS['ana-goldglanz'],
  'valeric-kampfgeborene': HOUSE_KAMPFGEBORENE_PORTRAITS['valeric-kampfgeborene'],
  'jodis-feuerherz': HOUSE_FEUERHERZ_PORTRAITS['jodis-feuerherz'],
  'hakon-varangr': HOUSE_VARANGR_PORTRAITS['hakon-varangr'],
  'brynhildr-goldglanz': HOUSE_VARANGR_PORTRAITS['brynhildr-goldglanz'],
  'tyrfing-schattenherz': HOUSE_SCHATTENHERZ_PORTRAITS['tyrfing-schattenherz'],
  'thera-goldglanz': HOUSE_SCHATTENHERZ_PORTRAITS['thera-goldglanz'],
  'kjallak-goldglanz': HOUSE_SCHMETTERSCHILD_PORTRAITS['kjallak-goldglanz']
});
