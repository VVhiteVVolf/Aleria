import { HOUSE_EISENBIEGER_PORTRAITS } from './house-eisenbieger-portraits.js';
import { HOUSE_KUMMERHERZ_PORTRAITS } from './house-kummerherz-portraits.js';
import { HOUSE_RIESENTOD_PORTRAITS } from './house-riesentod-portraits.js';
import { HOUSE_STURMGEBORENE_PORTRAITS } from './house-sturmgeborene-portraits.js';
import { HOUSE_VAEREN_PORTRAITS } from './house-vaeren-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-spindelschlag';

export const HOUSE_SPINDELSCHLAG_LOCAL_PORTRAIT_FILES = Object.freeze({
  'aldis-spindelschlag': 'aldis-spindelschlag.png',
  'hagen-spindelschlag': 'hagen-spindelschlag.png',
  'hod-spindelschlag': 'hod-spindelschlag.png',
  'hadd-spindelschlag': 'hadd-spindelschlag.png',
  gerdur: 'gerdur-spindelschlag.png',
  'thrain-spindelschlag': 'thrain-spindelschlag.png',
  'hvnir-spindelschlag': 'hvnir-spindelschlag.png',
  'ljotr-spindelschlag': 'ljotr-spindelschlag.png',
  'fjallbjoern-spindelschlag': 'fjallbjoern-spindelschlag.png',
  'isgeirr-spindelschlag': 'isgeirr-spindelschlag.png',
  'njall-spindelschlag': 'njall-spindelschlag.png',
  'ljosvi-spindelschlag': 'ljosvi-spindelschlag.png',
  'ivarr-spindelschlag': 'ivarr-spindelschlag.png',
  'hlif-spindelschlag': 'hlif-spindelschlag.png',
  'ingol-spindelschlag': 'ingol-spindelschlag.png',
  'eisa-spindelschlag': 'eisa-spindelschlag.png',
  'bersi-spindelschlag': 'bersi-spindelschlag.png',
  'mjoell-spindelschlag': 'mjoell-spindelschlag.png',
  'skafa-spindelschlag': 'skafa-spindelschlag.png'
});

export const HOUSE_SPINDELSCHLAG_PORTRAIT_SOURCES = Object.freeze({
  'aldis-spindelschlag': 'https://i.imgur.com/L283Lgf.png',
  'hagen-spindelschlag': 'https://i.imgur.com/Yf78MoZ.png',
  'hod-spindelschlag': 'https://i.imgur.com/RPXrxRK.png',
  'hadd-spindelschlag': 'https://i.imgur.com/kuj4Q9J.png',
  gerdur: 'https://i.imgur.com/3i96arD.png',
  'thrain-spindelschlag': 'https://i.imgur.com/xuCcyn4.png',
  'hvnir-spindelschlag': 'https://i.imgur.com/IXoGtjW.png',
  'ljotr-spindelschlag': 'https://i.imgur.com/6DCMzVH.png',
  'fjallbjoern-spindelschlag': 'https://i.imgur.com/6fdHRZM.png',
  'isgeirr-spindelschlag': 'https://i.imgur.com/KEtyaZ9.png',
  'njall-spindelschlag': 'https://i.imgur.com/yTpX47W.png',
  'ljosvi-spindelschlag': 'https://i.imgur.com/kHJlETE.png',
  'ivarr-spindelschlag': 'https://i.imgur.com/L1yGQh4.png',
  'hlif-spindelschlag': 'https://i.imgur.com/f0Agkyl.png',
  'ingol-spindelschlag': 'https://i.imgur.com/0YGPQtW.png',
  'eisa-spindelschlag': 'https://i.imgur.com/BXUI8CJ.png',
  'bersi-spindelschlag': 'https://i.imgur.com/8bh5oHG.png',
  'mjoell-spindelschlag': 'https://i.imgur.com/XJ9YFPm.png',
  'skafa-spindelschlag': 'https://i.imgur.com/sn1bEcb.png'
});

const LOCAL_PORTRAITS = Object.freeze(Object.fromEntries(
  Object.entries(HOUSE_SPINDELSCHLAG_LOCAL_PORTRAIT_FILES).map(([personId, fileName]) => [
    personId,
    `${PORTRAIT_ROOT}/${fileName}`
  ])
));

// Bereits in Gegenakten geführte Weltpersonen behalten überall ihr dort
// kanonisiertes Porträt. Wiederholte schwarze Standardsilhouetten der Altquelle
// werden nicht als vermeintliche Individualbilder kopiert.
export const HOUSE_SPINDELSCHLAG_PORTRAITS = Object.freeze({
  ...LOCAL_PORTRAITS,
  'galmar-vaeren': HOUSE_VAEREN_PORTRAITS['galmar-vaeren'],
  'tyrfingr-kummerherz': HOUSE_KUMMERHERZ_PORTRAITS['tyrfingr-kummerherz'],
  'midna-spindelschlag': HOUSE_KUMMERHERZ_PORTRAITS['midna-spindelschlag'],
  'halldor-eisenbieger': HOUSE_EISENBIEGER_PORTRAITS['halldor-eisenbieger'],
  'asta-spindelschlag': HOUSE_EISENBIEGER_PORTRAITS['asta-spindelschlag'],
  'poltar-riesentod': HOUSE_RIESENTOD_PORTRAITS['poltar-riesentod'],
  'isgerd-spindelschlag': HOUSE_RIESENTOD_PORTRAITS['isgerd-spindelschlag'],
  'uvard-sturmgeborener': HOUSE_STURMGEBORENE_PORTRAITS['uvard-sturmgeborener'],
  'norelle-spindelschlag': HOUSE_STURMGEBORENE_PORTRAITS['norelle-spindelschlag']
});
