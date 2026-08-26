import { HOUSE_FEUERHERZ_PORTRAITS } from './house-feuerherz-portraits.js';
import { HOUSE_GULLVIG_PORTRAITS } from './house-gullvig-portraits.js';
import { HOUSE_HRAFN_PORTRAITS } from './house-hrafn-portraits.js';
import { HOUSE_KALTHERZ_PORTRAITS } from './house-kaltherz-portraits.js';
import { HOUSE_KUMMERHERZ_PORTRAITS } from './house-kummerherz-portraits.js';
import { HOUSE_LYFANT_PORTRAITS } from './house-lyfant-portraits.js';
import { HOUSE_SCHATTENHERZ_PORTRAITS } from './house-schattenherz-portraits.js';
import { HOUSE_SILBERBLUT_PORTRAITS } from './house-silberblut-portraits.js';
import { HOUSE_SILBERZUNGE_PORTRAITS } from './house-silberzunge-portraits.js';
import { HOUSE_SKALD_PORTRAITS } from './house-skald-portraits.js';
import { HOUSE_SKOGG_PORTRAITS } from './house-skogg-portraits.js';
import { HOUSE_TRACHWYLL_PORTRAITS } from './house-trachwyll-portraits.js';
import { HOUSE_VAEREN_PORTRAITS } from './house-vaeren-portraits.js';
import { HOUSE_VARULV_PORTRAITS } from './house-varulv-portraits.js';
import { HOUSE_WELLENSAENGER_PORTRAITS } from './house-wellensaenger-portraits.js';
import { HOUSE_WELLENSCHILD_PORTRAITS } from './house-wellenschild-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-eisenbieger';

export const HOUSE_EISENBIEGER_LOCAL_PORTRAIT_FILES = Object.freeze({
  'erik-eisenbieger': 'erik-eisenbieger.png',
  'solvig-eisenbieger': 'solvig-eisenbieger.png',
  'bodvar-eisenbieger': 'bodvar-eisenbieger.png',
  'hrolfr-frostauge': 'hrolfr-frostauge.png',
  'waldmir-eisenbieger': 'waldmir-eisenbieger.png',
  'morkur-eisenbieger': 'morkur-eisenbieger.png',
  'cyneleif-frostauge': 'cyneleif-frostauge.png',
  'halldor-eisenbieger': 'halldor-eisenbieger.png',
  'gerda-eisenbieger': 'gerda-eisenbieger.png',
  'thormod-eisenbieger': 'thormod-eisenbieger.png',
  'asta-spindelschlag': 'asta-spindelschlag.png',
  'gangr-frostauge': 'gangr-frostauge.png',
  'oleg-eisenbieger': 'oleg-eisenbieger.png',
  'mundi-eisenbieger': 'mundi-eisenbieger.png',
  'sven-eisenbieger': 'sven-eisenbieger.png',
  'ykka-eisenbieger': 'ykka-eisenbieger.png',
  'tova-eisenbieger': 'tova-eisenbieger.png',
  'lars-eisenbieger': 'lars-eisenbieger.png'
});

export const HOUSE_EISENBIEGER_PORTRAIT_SOURCES = Object.freeze({
  'erik-eisenbieger': 'https://i.imgur.com/ruda6iU.png',
  'solvig-eisenbieger': 'https://i.imgur.com/baDVJ4p.png',
  'bodvar-eisenbieger': 'https://i.imgur.com/Xcr3Lsu.png',
  'hrolfr-frostauge': 'https://i.postimg.cc/nzccfrc6/image.png',
  'waldmir-eisenbieger': 'https://i.imgur.com/qPLe3Qi.png',
  'morkur-eisenbieger': 'https://i.imgur.com/YMrJo36.png',
  'cyneleif-frostauge': 'https://i.imgur.com/cBaNN2P.png',
  'halldor-eisenbieger': 'https://i.imgur.com/1cpB62Y.png',
  'gerda-eisenbieger': 'https://i.imgur.com/ijTTuqB.png',
  'thormod-eisenbieger': 'https://i.imgur.com/wH9o3zC.png',
  'asta-spindelschlag': 'https://i.imgur.com/AYyJwFf.png',
  'gangr-frostauge': 'https://i.postimg.cc/Z53NLpxS/image.png',
  'oleg-eisenbieger': 'https://i.imgur.com/ALNUZvF.png',
  'mundi-eisenbieger': 'https://i.imgur.com/m4nfEfC.png',
  'sven-eisenbieger': 'https://i.imgur.com/N0IcOqT.png',
  'ykka-eisenbieger': 'https://i.imgur.com/NUh8LKd.png',
  'tova-eisenbieger': 'https://i.imgur.com/UYbv1Nl.png',
  'lars-eisenbieger': 'https://i.imgur.com/vlsRuqs.png'
});

const LOCAL_PORTRAITS = Object.freeze(Object.fromEntries(
  Object.entries(HOUSE_EISENBIEGER_LOCAL_PORTRAIT_FILES).map(([personId, fileName]) => [
    personId,
    `${PORTRAIT_ROOT}/${fileName}`
  ])
));

// Dieselben Weltpersonen verwenden in allen Gegenakten dasselbe kanonische
// Porträt. Wiederholte Standardsilhouetten sowie das vom Nutzer ausdrücklich
// als veraltet markierte Bild Gunhild Eisenbiegers bleiben echte Platzhalter.
export const HOUSE_EISENBIEGER_PORTRAITS = Object.freeze({
  ...LOCAL_PORTRAITS,
  'zurik-eisenbieger': HOUSE_VAEREN_PORTRAITS['zurik-eisenbieger'],
  'elsa-riesentod': HOUSE_VAEREN_PORTRAITS['elsa-riesentod'],
  'helga-vaeren': HOUSE_VAEREN_PORTRAITS['helga-vaeren'],
  'irmgar-eisenbieger': HOUSE_VAEREN_PORTRAITS['irmgar-eisenbieger'],
  'sjoring-vaeren': HOUSE_VAEREN_PORTRAITS['sjoring-vaeren'],
  'freki-eisenbieger': HOUSE_GULLVIG_PORTRAITS['freki-eisenbieger'],
  'gudlaug-gullvig': HOUSE_GULLVIG_PORTRAITS['gudlaug-gullvig'],
  'castar-wellensaenger': HOUSE_WELLENSAENGER_PORTRAITS['castar-wellensaenger'],
  'kalfur-wellenschild': HOUSE_WELLENSCHILD_PORTRAITS['kalfur-wellenschild'],
  'finnur-eisenbieger': HOUSE_SILBERBLUT_PORTRAITS['finnur-eisenbieger'],
  'svandis-silberblut': HOUSE_SILBERBLUT_PORTRAITS['svandis-silberblut'],
  'glaumur-eisenbieger': HOUSE_SKALD_PORTRAITS['glaumur-eisenbieger'],
  'svartulf-skald': HOUSE_SKALD_PORTRAITS['svartulf-skald'],
  'leikn-eisenbieger': HOUSE_TRACHWYLL_PORTRAITS['leikn-eisenbieger'],
  'kenyon-trachwyll': HOUSE_TRACHWYLL_PORTRAITS['kenyon-trachwyll'],
  'thorgils-eisenbieger': HOUSE_KUMMERHERZ_PORTRAITS['thorgils-eisenbieger'],
  'ljosdis-kummerherz': HOUSE_KUMMERHERZ_PORTRAITS['ljosdis-kummerherz'],
  'olga-eisenbieger': HOUSE_VARULV_PORTRAITS['olga-eisenbieger'],
  'gunnar-varulv': HOUSE_VARULV_PORTRAITS['gunnar-varulv'],
  'haeva-feuerherz': HOUSE_FEUERHERZ_PORTRAITS['haeva-feuerherz'],
  'nordall-eisenbieger': HOUSE_KALTHERZ_PORTRAITS['nordall-eisenbieger'],
  'dagni-kaltherz': HOUSE_KALTHERZ_PORTRAITS['dagni-kaltherz'],
  'rhisiart-lyfant': HOUSE_LYFANT_PORTRAITS['rhisiart-lyfant'],
  'asta-hrafn': HOUSE_HRAFN_PORTRAITS['asta-hrafn'],
  'asdis-eisenbieger': HOUSE_SILBERZUNGE_PORTRAITS['asdis-eisenbieger'],
  'svart-eisenbieger': HOUSE_SKOGG_PORTRAITS['svart-eisenbieger'],
  'hilda-schattenherz': HOUSE_SCHATTENHERZ_PORTRAITS['hilda-schattenherz']
});
