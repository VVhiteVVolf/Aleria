import { HOUSE_BLACH_PORTRAITS } from './house-blach-portraits.js';
import { HOUSE_CHIFFYDDLON_PORTRAITS } from './house-chiffyddlon-portraits.js';
import { HOUSE_CREFYDDOL_PORTRAITS } from './house-crefyddol-portraits.js';
import { HOUSE_GRAWN_PORTRAITS } from './house-grawn-portraits.js';
import { HOUSE_MARCHOG_PORTRAITS } from './house-marchog-portraits.js';
import { HOUSE_NEIDR_PORTRAITS } from './house-neidr-portraits.js';
import { HOUSE_PENDERYN_PORTRAITS } from './house-penderyn-portraits.js';
import { HOUSE_SAITH_PORTRAITS } from './house-saith-portraits.js';
import { HOUSE_SGWARNOG_PORTRAITS } from './house-sgwarnog-portraits.js';
import { HOUSE_TEYRNGARCH_PORTRAITS } from './house-teyrngarch-portraits.js';
import { HOUSE_WYLAN_PORTRAITS } from './house-wylan-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-canwyll';

export const HOUSE_CANWYLL_LOCAL_PORTRAIT_FILES = Object.freeze({
  'howell-canwyll': 'howell-canwyll.jpg',
  'leolin-canwyll': 'leolin-canwyll.jpg',
  'rhodri-pawen': 'rhodri-pawen.jpg',
  'meriel-canwyll': 'meriel-canwyll.jpg',
  'enfys-canwyll': 'enfys-canwyll.jpg',
  'cynwrig-canwyll': 'cynwrig-canwyll.jpg',
  'jethro-pyrth': 'jethro-pyrth.png',
  'cadfan-selwyn': 'cadfan-selwyn.jpg',
  'gwenifer-canwyll': 'gwenifer-canwyll.jpg',
  'urien-canwyll': 'urien-canwyll.jpg',
  'ywain-draenog': 'ywain-draenog.jpg',
  'zyraline-wivern': 'zyraline-wivern.jpg',
  'llewella-1699-canwyll': 'llewella-1699-canwyll.jpg',
  'wynston-unigol': 'wynston-unigol.jpg',
  'kane-canwyll': 'kane-canwyll.jpg',
  'iesin-canwyll': 'iesin-canwyll.jpg',
  'taran-canwyll': 'taran-canwyll.jpg',
  'itan-canwyll': 'itan-canwyll.jpg',
  'hollie-canwyll': 'hollie-canwyll.jpg',
  'ysolt-canwyll': 'ysolt-canwyll.jpg',
  'hyrs-canwyll': 'hyrs-canwyll.jpg'
});

const LOCAL_PORTRAITS = Object.freeze(Object.fromEntries(
  Object.entries(HOUSE_CANWYLL_LOCAL_PORTRAIT_FILES).map(([personId, fileName]) => [
    personId,
    `${PORTRAIT_ROOT}/${fileName}`
  ])
));

// Bereits ausgearbeitete Gegenakten bleiben die kanonische Bildquelle ihrer
// Weltpersonen. Nur bislang unbelegte Individualporträts liegen im Canwyll-Ordner.
export const HOUSE_CANWYLL_PORTRAITS = Object.freeze({
  ...LOCAL_PORTRAITS,
  'sieffre-der-fromme': HOUSE_NEIDR_PORTRAITS['sieffre-der-fromme'],
  'jinelle-neidr': HOUSE_NEIDR_PORTRAITS['jinelle-neidr'],
  'llwellyn-founder-canwyll': HOUSE_CREFYDDOL_PORTRAITS['llwellyn-founder-canwyll'],
  'llwyarch-founder-crefyddol': HOUSE_CREFYDDOL_PORTRAITS['llwyarch-founder-crefyddol'],
  'gawain-canwyll': HOUSE_CREFYDDOL_PORTRAITS['gawain-canwyll'],
  'powell-neidr': HOUSE_NEIDR_PORTRAITS['powell-neidr'],
  'nodawl-crefyddol': HOUSE_CREFYDDOL_PORTRAITS['nodawl-crefyddol'],
  'gwythyr-neidr': HOUSE_NEIDR_PORTRAITS['gwythyr-neidr'],
  'llywarch-canwyll': HOUSE_CREFYDDOL_PORTRAITS['llywarch-canwyll'],
  'grufudd-chiffyddlon': HOUSE_CHIFFYDDLON_PORTRAITS['grufudd-chiffyddlon'],
  'glendower-canwyll': HOUSE_TEYRNGARCH_PORTRAITS['glendower-canwyll'],
  'eiddyl-canwyll': HOUSE_BLACH_PORTRAITS['eiddyl-canwyll'],
  'cadoc-canwyll': HOUSE_NEIDR_PORTRAITS['cadoc-canwyll'],
  'gorm-canwyll': HOUSE_NEIDR_PORTRAITS['gorm-canwyll'],
  'aeronwen-canwyll': HOUSE_NEIDR_PORTRAITS['aeronwen-canwyll'],
  'glesni-canwyll': HOUSE_GRAWN_PORTRAITS['glesni-canwyll'],
  'uvel-canwyll': HOUSE_SAITH_PORTRAITS['uvel-canwyll'],
  'jowan-canwyll': HOUSE_SAITH_PORTRAITS['jowan-canwyll'],
  'rhiannon-neidr': HOUSE_NEIDR_PORTRAITS['rhiannon-neidr'],
  'aeron-neidr': HOUSE_NEIDR_PORTRAITS['aeron-neidr'],
  'conwy-neidr': HOUSE_NEIDR_PORTRAITS['conwy-neidr'],
  'iestyn-grawn': HOUSE_GRAWN_PORTRAITS['iestyn-grawn'],
  'alaweyn-saith': HOUSE_SAITH_PORTRAITS['alaweyn-saith'],
  'vortigern-saith': HOUSE_SAITH_PORTRAITS['vortigern-saith'],
  'dyl-canwyll': HOUSE_WYLAN_PORTRAITS['dyl-canwyll'],
  'derwen-canwyll': HOUSE_CREFYDDOL_PORTRAITS['derwen-canwyll'],
  'mawr-canwyll': HOUSE_MARCHOG_PORTRAITS['mawr-canwyll'],
  'orson-canwyll': HOUSE_SGWARNOG_PORTRAITS['orson-canwyll'],
  'lynee-canwyll': HOUSE_PENDERYN_PORTRAITS['lynee-canwyll'],
  'olwyn-wylan': HOUSE_WYLAN_PORTRAITS['olwyn-wylan'],
  'nyfain-crefyddol': HOUSE_CREFYDDOL_PORTRAITS['nyfain-crefyddol'],
  'gwenaelle-marchog': HOUSE_MARCHOG_PORTRAITS['gwenaelle-marchog'],
  'meghan-sgwarnog': HOUSE_SGWARNOG_PORTRAITS['meghan-sgwarnog'],
  'gethin-penderyn': HOUSE_PENDERYN_PORTRAITS['gethin-penderyn']
});
