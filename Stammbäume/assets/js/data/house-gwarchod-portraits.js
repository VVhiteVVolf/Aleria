import { HOUSE_BAEDD_PORTRAITS } from './house-baedd-portraits.js';
import { HOUSE_CHIFFYDDLON_PORTRAITS } from './house-chiffyddlon-portraits.js';
import { HOUSE_CIAROG_PORTRAITS } from './house-ciarog-portraits.js';
import { HOUSE_DIENYDDIWR_PORTRAITS } from './house-dienyddiwr-portraits.js';
import { HOUSE_DYNGWN_PORTRAITS } from './house-dyngwn-portraits.js';
import { HOUSE_GRAWN_PORTRAITS } from './house-grawn-portraits.js';
import { HOUSE_GWEFRYDD_PORTRAITS } from './house-gwefrydd-portraits.js';
import { HOUSE_SGWARNOG_PORTRAITS } from './house-sgwarnog-portraits.js';
import { HOUSE_TEYRNGARCH_PORTRAITS } from './house-teyrngarch-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-gwarchod';

export const HOUSE_GWARCHOD_LOCAL_PORTRAIT_IDS = Object.freeze([
  'delwyn-gwarchod',
  'ector-founder-gwarchod',
  'gwynndie-gwarchod',
  'jeanae-gwarchod',
  'maiwyn-gwarchod',
  'meredyddwynn-hebog',
  'rhisiart-crefyddol',
  'tegan-gwarchod',
  'vaughan-eirth',
  'waleran-gwarchod',
  'wyett-tylluan',
  'yseut-saith'
]);

const PNG_PORTRAIT_IDS = new Set([
  'meredyddwynn-hebog',
  'wyett-tylluan',
  'yseut-saith'
]);

const LOCAL_PORTRAITS = Object.freeze(Object.fromEntries(
  HOUSE_GWARCHOD_LOCAL_PORTRAIT_IDS.map(personId => [
    personId,
    `${PORTRAIT_ROOT}/${personId}.${PNG_PORTRAIT_IDS.has(personId) ? 'png' : 'jpg'}`
  ])
));

// Gemeinsame Weltpersonen beziehen ihr Bild aus der bereits ausgearbeiteten
// Gegenakte. So bleibt dieselbe Person hausübergreifend visuell identisch.
export const HOUSE_GWARCHOD_PORTRAITS = Object.freeze({
  ...LOCAL_PORTRAITS,
  'drystan-gwarchod': HOUSE_CHIFFYDDLON_PORTRAITS['drystan-gwarchod'],
  'lyonel-gwefrydd': HOUSE_GWEFRYDD_PORTRAITS['lyonel-gwefrydd'],
  'garselid-gwarchod': HOUSE_TEYRNGARCH_PORTRAITS['garselid-gwarchod'],
  'mathonwy-sgwarnog': HOUSE_SGWARNOG_PORTRAITS['mathonwy-sgwarnog'],
  'gwalchmai-baedd': HOUSE_BAEDD_PORTRAITS['gwalchmai-baedd'],
  'cynfarch-grawn': HOUSE_GRAWN_PORTRAITS['cynfarch-grawn'],
  'brangwen-dyngwn': HOUSE_DYNGWN_PORTRAITS['brangwen-dyngwn'],
  'gwernwy-gwarchod': HOUSE_DYNGWN_PORTRAITS['gwernwy-gwarchod'],
  'sabrian-gwarchod': HOUSE_CIAROG_PORTRAITS['sabrian-gwarchod'],
  'wynndie-ciarog': HOUSE_CIAROG_PORTRAITS['wynndie-ciarog'],
  'dirmyg-dienyddiwr': HOUSE_DIENYDDIWR_PORTRAITS['dirmyg-dienyddiwr'],
  'gwen-gwarchod': HOUSE_DIENYDDIWR_PORTRAITS['gwen-gwarchod'],
  'march-sgwarnog': HOUSE_SGWARNOG_PORTRAITS['march-sgwarnog'],
  'gwenya-gwarchod': HOUSE_SGWARNOG_PORTRAITS['gwenya-gwarchod']
});
