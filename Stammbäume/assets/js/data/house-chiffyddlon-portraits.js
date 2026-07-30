import { HOUSE_BAEDD_PORTRAITS } from './house-baedd-portraits.js';
import { HOUSE_BLACH_PORTRAITS } from './house-blach-portraits.js';
import { HOUSE_CIAROG_PORTRAITS } from './house-ciarog-portraits.js';
import { HOUSE_DYNGWN_PORTRAITS } from './house-dyngwn-portraits.js';
import { HOUSE_GRAWN_PORTRAITS } from './house-grawn-portraits.js';
import { HOUSE_PENDERYN_PORTRAITS } from './house-penderyn-portraits.js';
import { HOUSE_SGWARNOG_PORTRAITS } from './house-sgwarnog-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-chiffyddlon';

export const HOUSE_CHIFFYDDLON_LOCAL_PORTRAIT_IDS = Object.freeze([
  'arwel-chiffyddlon',
  'drystan-gwarchod',
  'grufudd-chiffyddlon',
  'gwilym-chiffyddlon',
  'iorwerth-founder-chiffyddlon',
  'maelgwn-chiffyddlon',
  'maelor-chiffyddlon',
  'malvina-gwythiad',
  'marmaduke-aroglyn',
  'meredydd-gaeth',
  'nessa-chiffyddlon',
  'rhisiog-crefyddol',
  'rhosyn-chiffyddlon',
  'romney-chiffyddlon',
  'sheev-eryr',
  'urien-chiffyddlon'
]);

const PNG_PORTRAIT_IDS = new Set([
  'meredydd-gaeth',
  'sheev-eryr'
]);

const LOCAL_PORTRAITS = Object.freeze(Object.fromEntries(
  HOUSE_CHIFFYDDLON_LOCAL_PORTRAIT_IDS.map(personId => [
    personId,
    `${PORTRAIT_ROOT}/${personId}.${PNG_PORTRAIT_IDS.has(personId) ? 'png' : 'jpg'}`
  ])
));

// Gemeinsame Weltpersonen beziehen ihr Bild aus der bereits ausgearbeiteten
// Gegenakte. Dadurch bleibt jede Person hausübergreifend visuell identisch.
export const HOUSE_CHIFFYDDLON_PORTRAITS = Object.freeze({
  ...LOCAL_PORTRAITS,
  'iorwerth-chiffyddlon': HOUSE_SGWARNOG_PORTRAITS['iorwerth-chiffyddlon'],
  'rhondda-chiffyddlon': HOUSE_SGWARNOG_PORTRAITS['rhondda-chiffyddlon'],
  'mabon-sgwarnog': HOUSE_SGWARNOG_PORTRAITS['mabon-sgwarnog'],
  'osian-grawn': HOUSE_GRAWN_PORTRAITS['osian-grawn'],
  'berwyn-blach': HOUSE_BLACH_PORTRAITS['berwyn-blach'],
  'gwlgawd-dyngwn': HOUSE_DYNGWN_PORTRAITS['gwlgawd-dyngwn'],
  'dalvin-ciarog': HOUSE_CIAROG_PORTRAITS['dalvin-ciarog'],
  'angharad-chiffyddlon': HOUSE_BAEDD_PORTRAITS['angharad-chiffyddlon'],
  'vaethan-baedd': HOUSE_BAEDD_PORTRAITS['vaethan-baedd'],
  'teghan-chiffyddlon': HOUSE_PENDERYN_PORTRAITS['teghan-chiffyddlon'],
  'steffan-penderyn': HOUSE_PENDERYN_PORTRAITS['steffan-penderyn']
});
