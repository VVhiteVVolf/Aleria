import { HOUSE_CLUDWYR_PORTRAITS } from './house-cludwyr-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-rhyddid';
const LOCAL_PORTRAIT_IDS = Object.freeze([
  'gwilym-rhyddid',
  'gwenifer-rhyddid',
  'kerwin-rhyddid',
  'yale-rhyddid',
  'taran-rhyddid',
  'rhain-rhyddid',
  'teagan',
  'larna',
  'arian-rhyddid',
  'ronda-rhyddid',
  'gwydion-rhyddid',
  'bevan-rhyddid',
  'eelin-rhyddid',
  'sgarlad',
  'avan-balchder',
  'ffion',
  'cadel',
  'artie-rhyddid',
  'evie-rhyddid',
  'mal-rhyddid',
  'meggie-rhyddid',
  'nel-rhyddid',
  'glinda-rhyddid',
  'barry-rhyddid'
]);

export const HOUSE_RHYDDID_PORTRAITS = Object.freeze({
  ...Object.fromEntries(LOCAL_PORTRAIT_IDS.map(personId => [
    personId,
    `${PORTRAIT_ROOT}/${personId}.jpg`
  ])),
  // Godwyns Portrait wird vom Cludwyr-Stammbaum gehostet.
  'godwyn-cludwyr': HOUSE_CLUDWYR_PORTRAITS['godwyn-cludwyr']
});
