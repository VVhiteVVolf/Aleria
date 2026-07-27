import { HOUSE_BALCHDER_PORTRAITS } from './house-balchder-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-seldryn';
const LOCAL_PNG_PORTRAIT_IDS = Object.freeze([
  'braint-seldryn',
  'aelwen-seldryn',
  'ywain-seldryn',
  'annarietta-schoenbergen',
  'cynon-seldryn',
  'celynnen-seldryn',
  'ysgar-seldryn',
  'hirlas-seldryn',
  'elaine-seldryn',
  'maelron-seldryn',
  'seith-seldryn',
  'anest-seldryn',
  'urien-seldryn',
  'gwenfair-seldryn',
  'hefin-seldryn'
]);

export const HOUSE_SELDRYN_PORTRAITS = Object.freeze({
  ...Object.fromEntries(LOCAL_PNG_PORTRAIT_IDS.map(personId => [
    personId,
    `${PORTRAIT_ROOT}/${personId}.png`
  ])),
  'tavian-seldryn': `${PORTRAIT_ROOT}/tavian-seldryn.jpg`,
  'lugh-seldryn': HOUSE_BALCHDER_PORTRAITS['lugh-seldryn']
});
