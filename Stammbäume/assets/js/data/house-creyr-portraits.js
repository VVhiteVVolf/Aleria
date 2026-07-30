import { HOUSE_BLACH_PORTRAITS } from './house-blach-portraits.js';
import { HOUSE_DINEFWR_PORTRAITS } from './house-dinefwr-portraits.js';
import { HOUSE_DYNGWN_PORTRAITS } from './house-dyngwn-portraits.js';
import { HOUSE_GAFYR_PORTRAITS } from './house-gafyr-portraits.js';
import { HOUSE_GWEFRYDD_PORTRAITS } from './house-gwefrydd-portraits.js';
import { HOUSE_GWYVERN_PORTRAITS } from './house-gwyvern-portraits.js';
import { HOUSE_HWYADEN_PORTRAITS } from './house-hwyaden-portraits.js';
import { HOUSE_LLWYNOG_PORTRAITS } from './house-llwynog-portraits.js';
import { HOUSE_MOCHDAER_PORTRAITS } from './house-mochdaer-portraits.js';
import { HOUSE_WYLAN_PORTRAITS } from './house-wylan-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-creyr';

export const HOUSE_CREYR_LOCAL_PORTRAIT_IDS = Object.freeze([
  'llwyrddyddwg-creyr',
  'blegwywyrd-tylluan',
  'armel-creyr',
  'blodwen-creyr',
  'llywarch-creyr',
  'lancel-saith',
  'meredid-creyr',
  'hoyer-coedwig',
  'caru-morfil',
  'eurfron-creyr',
  'tudor-gaeth',
  'meilyr-creyr',
  'olwyna-tiwna',
  'ilar-creyr',
  'gwenog-creyr',
  'talan-creyr',
  'hollie-creyr',
  'pebin-creyr',
  'imanie-creyr'
]);

const LOCAL_PORTRAITS = Object.freeze(Object.fromEntries(
  HOUSE_CREYR_LOCAL_PORTRAIT_IDS.map(personId => [
    personId,
    `${PORTRAIT_ROOT}/${personId}.png`
  ])
));

// Bereits in Gegenakten gesicherte Personen behalten ihre kanonische Datei.
// So zeigt dieselbe Weltperson in allen Häusern dasselbe Porträt und wird nicht
// durch eine zweite, nur lokal gepflegte Kopie auseinandergezogen.
export const HOUSE_CREYR_PORTRAITS = Object.freeze({
  ...LOCAL_PORTRAITS,
  'rhodhri-wylan': HOUSE_WYLAN_PORTRAITS['rhodhri-wylan'],
  'trachmyr-wylan': HOUSE_WYLAN_PORTRAITS['trachmyr-wylan'],
  'nona-wylan': HOUSE_WYLAN_PORTRAITS['nona-wylan'],
  'evan-creyr': HOUSE_WYLAN_PORTRAITS['evan-creyr'],
  'maldwyn-creyr-dinefwr': HOUSE_DINEFWR_PORTRAITS['maldwyn-creyr-dinefwr'],
  'tegwen-dinefwr': HOUSE_DINEFWR_PORTRAITS['tegwen-dinefwr'],
  'goronwy-creyr': HOUSE_DINEFWR_PORTRAITS['goronwy-creyr'],
  'cadwaladr-creyr': HOUSE_BLACH_PORTRAITS['cadwaladr-creyr'],
  'grippiud-creyr': HOUSE_GAFYR_PORTRAITS['grippiud-creyr'],
  'morwenna-gwefrydd-1669': HOUSE_GWEFRYDD_PORTRAITS['morwenna-gwefrydd-1669'],
  'glendower-creyr': HOUSE_GWEFRYDD_PORTRAITS['glendower-creyr'],
  'gethin-dyngwn': HOUSE_DYNGWN_PORTRAITS['gethin-dyngwn'],
  'gwenllian-creyr': HOUSE_DYNGWN_PORTRAITS['gwenllian-creyr'],
  'rhosyn-llwynog': HOUSE_LLWYNOG_PORTRAITS['rhosyn-llwynog'],
  'cadoc-creyr': HOUSE_LLWYNOG_PORTRAITS['cadoc-creyr'],
  'genofeva-gwyvern': HOUSE_GWYVERN_PORTRAITS['genofeva-gwyvern'],
  'madoc-creyr': HOUSE_GWYVERN_PORTRAITS['madoc-creyr'],
  'gwenifer-hwyaden': HOUSE_HWYADEN_PORTRAITS['gwenifer-hwyaden'],
  'dadweir-creyr': HOUSE_HWYADEN_PORTRAITS['dadweir-creyr'],
  'cadel-mochdaer': HOUSE_MOCHDAER_PORTRAITS['cadel-mochdaer'],
  'gwynfa-creyr': HOUSE_MOCHDAER_PORTRAITS['gwynfa-creyr']
});
