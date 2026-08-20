import { HOUSE_BLUTSTAHL_PORTRAITS } from './house-blutstahl-portraits.js';
import { HOUSE_HELGR_PORTRAITS } from './house-helgr-portraits.js';
import { HOUSE_NACHTJAEGER_PORTRAITS } from './house-nachtjaeger-portraits.js';
import { HOUSE_RAGNULF_PORTRAITS } from './house-ragnulf-portraits.js';
import { HOUSE_SCHMETTERSCHILD_PORTRAITS } from './house-schmetterschild-portraits.js';
import { HOUSE_SCHWARZBLUT_PORTRAITS } from './house-schwarzblut-portraits.js';
import { HOUSE_SILBERBLUT_PORTRAITS } from './house-silberblut-portraits.js';
import { HOUSE_VARANGR_PORTRAITS } from './house-varangr-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-vragi';

export const HOUSE_VRAGI_LOCAL_PORTRAIT_FILES = Object.freeze({
  'knar-vragi': 'knar-vragi.png',
  'munin-vragi': 'munin-vragi.png',
  'modgud-vragi': 'modgud-vragi.png',
  'magnus-vragi': 'magnus-vragi.png',
  'hugin-vragi': 'hugin-vragi.png',
  'alrek-vragi': 'alrek-vragi.png',
  'vidkun-goldglanz': 'vidkun-goldglanz.png',
  'stenvar-vragi': 'stenvar-vragi.png',
  'monhild-vragi': 'monhild-vragi.png',
  'drifa-vragi': 'drifa-vragi.png',
  'idmar-sturmgeborener': 'idmar-sturmgeborener.png',
  'wjolf-vragi': 'wjolf-vragi.png',
  'pjalki-vragi': 'pjalki-vragi.png',
  'konall-vragi': 'konall-vragi.png',
  'snorra-vragi': 'snorra-vragi.png',
  'odlis-vragi': 'odlis-vragi.png'
});

export const HOUSE_VRAGI_PORTRAIT_SOURCES = Object.freeze({
  'knar-vragi': 'https://i.imgur.com/YCok5GV.png',
  'munin-vragi': 'https://i.imgur.com/klO9PIn.png',
  'modgud-vragi': 'https://i.imgur.com/6oejhtY.png',
  'magnus-vragi': 'https://i.imgur.com/pEUoUpM.png',
  'hugin-vragi': 'https://i.imgur.com/dgerwev.png',
  'alrek-vragi': 'https://i.imgur.com/fOA2KY9.png',
  'vidkun-goldglanz': 'https://i.imgur.com/WPi701N.png',
  'stenvar-vragi': 'https://i.imgur.com/LIHE1wz.png',
  'monhild-vragi': 'https://i.imgur.com/ZB8w7e5.png',
  'drifa-vragi': 'https://i.imgur.com/Z2woTj4.png',
  'idmar-sturmgeborener': 'https://i.imgur.com/5uuxWFf.png',
  'wjolf-vragi': 'https://i.imgur.com/9hyJHLd.png',
  'pjalki-vragi': 'https://i.imgur.com/imX6SRs.png',
  'konall-vragi': 'https://i.imgur.com/P4gYosm.png',
  'snorra-vragi': 'https://i.imgur.com/kQ7sFek.png',
  'odlis-vragi': 'https://i.imgur.com/HMY7v60.png'
});

const LOCAL_PORTRAITS = Object.freeze(Object.fromEntries(
  Object.entries(HOUSE_VRAGI_LOCAL_PORTRAIT_FILES).map(([personId, fileName]) => [
    personId,
    `${PORTRAIT_ROOT}/${fileName}`
  ])
));

// Bereits in Gegenakten geführte Weltpersonen behalten ihr kanonisches Bild.
// Wiederkehrende schwarze Silhouetten der Quelle bleiben echte Platzhalter.
export const HOUSE_VRAGI_PORTRAITS = Object.freeze({
  ...LOCAL_PORTRAITS,
  'hrafnkell-vragi': HOUSE_NACHTJAEGER_PORTRAITS['hrafnkell-vragi'],
  'fannar-varangr': HOUSE_VARANGR_PORTRAITS['fannar-varangr'],
  'araldr-vragi': HOUSE_RAGNULF_PORTRAITS['araldr-vragi'],
  'herleif-schwarzblut': HOUSE_SCHWARZBLUT_PORTRAITS['herleif-schwarzblut'],
  'egil-vragi': HOUSE_SILBERBLUT_PORTRAITS['egil-vragi'],
  'morskar-vragi': HOUSE_BLUTSTAHL_PORTRAITS['morskar-vragi'],
  'solmund-schmetterschild': HOUSE_SCHMETTERSCHILD_PORTRAITS['solmund-schmetterschild'],
  'tjodmar-vragi': HOUSE_VARANGR_PORTRAITS['tjodmar-vragi'],
  'iseld-varangr': HOUSE_VARANGR_PORTRAITS['iseld-varangr'],
  'burin-helgr': HOUSE_HELGR_PORTRAITS['burin-helgr'],
  'astridur-vragi': HOUSE_HELGR_PORTRAITS['astridur-vragi']
});
