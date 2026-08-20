import { HOUSE_BLUTSTAHL_PORTRAITS } from './house-blutstahl-portraits.js';
import { HOUSE_HJERTE_PORTRAITS } from './house-hjerte-portraits.js';
import { HOUSE_KALTHERZ_PORTRAITS } from './house-kaltherz-portraits.js';
import { HOUSE_KUMMERHERZ_PORTRAITS } from './house-kummerherz-portraits.js';
import { HOUSE_NACHTJAEGER_PORTRAITS } from './house-nachtjaeger-portraits.js';
import { HOUSE_SCHATTENHERZ_PORTRAITS } from './house-schattenherz-portraits.js';
import { HOUSE_SCHMETTERSCHILD_PORTRAITS } from './house-schmetterschild-portraits.js';
import { HOUSE_SCHWARZBLUT_PORTRAITS } from './house-schwarzblut-portraits.js';
import { HOUSE_SILBERBLUT_PORTRAITS } from './house-silberblut-portraits.js';
import { HOUSE_SKOGG_PORTRAITS } from './house-skogg-portraits.js';
import { HOUSE_VARANGR_PORTRAITS } from './house-varangr-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-feuerherz';

export const HOUSE_FEUERHERZ_LOCAL_PORTRAIT_FILES = Object.freeze({
  'norbjorn-feuerherz': 'norbjorn-feuerherz.png',
  'sverin-feuerherz': 'sverin-feuerherz.png',
  'oran-leite': 'oran-leite.png',
  'ketill-ragnulf': 'ketill-ragnulf.png',
  'dagur-feuerherz': 'dagur-feuerherz.png',
  'borkur-feuerherz': 'borkur-feuerherz.png',
  'jodis-feuerherz': 'jodis-feuerherz.png',
  'palsson-feuerherz': 'palsson-feuerherz.png',
  'leifdis-feuerherz': 'leifdis-feuerherz.png',
  'hoibrean-eamhra': 'hoibrean-eamhra.png',
  'haeva-feuerherz': 'haeva-feuerherz.png',
  'yrkall-feuerherz': 'yrkall-feuerherz.png',
  'kjalmar-feuerherz': 'kjalmar-feuerherz.png',
  'stina-feuerherz': 'stina-feuerherz.png',
  'frodi-feuerherz': 'frodi-feuerherz.png',
  'castar-feuerherz': 'castar-feuerherz.png',
  'ymirra-feuerherz': 'ymirra-feuerherz.png'
});

export const HOUSE_FEUERHERZ_PORTRAIT_SOURCES = Object.freeze({
  'norbjorn-feuerherz': 'https://i.imgur.com/y3xElzf.png',
  'sverin-feuerherz': 'https://i.imgur.com/lP82D6N.png',
  'oran-leite': 'https://i.imgur.com/3adPfS9.png',
  'ketill-ragnulf': 'https://i.imgur.com/5Iqiv7m.png',
  'dagur-feuerherz': 'https://i.imgur.com/A3D3R4h.png',
  'borkur-feuerherz': 'https://i.imgur.com/ZN1asKm.png',
  'jodis-feuerherz': 'https://i.imgur.com/HpBxNS0.png',
  'palsson-feuerherz': 'https://i.imgur.com/ERSsB6k.png',
  'leifdis-feuerherz': 'https://i.imgur.com/bZ3aZdR.png',
  'hoibrean-eamhra': 'https://i.imgur.com/npBMV03.png',
  'haeva-feuerherz': 'https://i.imgur.com/bKosgW1.png',
  'yrkall-feuerherz': 'https://i.imgur.com/P9toJMp.png',
  'kjalmar-feuerherz': 'https://i.imgur.com/LSDlQ8I.png',
  'stina-feuerherz': 'https://i.imgur.com/Fpn5e9o.png',
  'frodi-feuerherz': 'https://i.imgur.com/0LOPIGQ.png',
  'castar-feuerherz': 'https://i.imgur.com/qeP1S26.png',
  'ymirra-feuerherz': 'https://i.imgur.com/ug1Naml.png'
});

const LOCAL_PORTRAITS = Object.freeze(Object.fromEntries(
  Object.entries(HOUSE_FEUERHERZ_LOCAL_PORTRAIT_FILES).map(([personId, fileName]) => [
    personId,
    `${PORTRAIT_ROOT}/${fileName}`
  ])
));

// Wiederkehrende Standardsilhouetten der Quelle bleiben echte Platzhalter.
// Bereits in Gegenakten bekannte Weltpersonen verwenden ihr kanonisches Bild.
export const HOUSE_FEUERHERZ_PORTRAITS = Object.freeze({
  ...LOCAL_PORTRAITS,
  'fjalmar-hjerte': HOUSE_HJERTE_PORTRAITS['fjalmar-hjerte'],
  'drengur-feuerherz': HOUSE_VARANGR_PORTRAITS['drengur-feuerherz'],
  'sturlaugr-nachtjaeger': HOUSE_NACHTJAEGER_PORTRAITS['sturlaugr-nachtjaeger'],
  'haraldur-feuerherz': HOUSE_KUMMERHERZ_PORTRAITS['haraldur-feuerherz'],
  'sighvat-schmetterschild': HOUSE_SCHMETTERSCHILD_PORTRAITS['sighvat-schmetterschild'],
  'asbjorn-feuerherz': HOUSE_SILBERBLUT_PORTRAITS['asbjorn-feuerherz'],
  'iokul-schattenherz': HOUSE_SCHATTENHERZ_PORTRAITS['iokul-schattenherz'],
  'halvar-feuerherz': HOUSE_SCHWARZBLUT_PORTRAITS['halvar-feuerherz'],
  'lythar-feuerherz': HOUSE_BLUTSTAHL_PORTRAITS['lythar-feuerherz'],
  'rolfur-feuerherz': HOUSE_VARANGR_PORTRAITS['rolfur-feuerherz'],
  'frida-varangr': HOUSE_VARANGR_PORTRAITS['frida-varangr'],
  'nordall-eisenbieger': HOUSE_KALTHERZ_PORTRAITS['nordall-eisenbieger'],
  'stenulf-skogg': HOUSE_SKOGG_PORTRAITS['stenulf-skogg'],
  'fenkatla-feuerherz': HOUSE_SKOGG_PORTRAITS['fenkatla-feuerherz']
});
