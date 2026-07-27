import { HOUSE_TRYDAR_PORTRAITS } from './house-trydar-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-daran';

const LOCAL_PORTRAIT_IDS = Object.freeze([
  'maelgwyn-daran',
  'nest-daran',
  'seithved-daran',
  'rhodri-daran',
  'angharad-daran',
  'einion-daran',
  'ysanna-daran',
  'lleu-daran',
  'ida-daran',
  'llywelyn-daran',
  'gwerfyl-daran',
  'dyddy-daran'
]);

export const HOUSE_DARAN_PORTRAITS = Object.freeze({
  ...Object.fromEntries(LOCAL_PORTRAIT_IDS.map(personId => [
    personId,
    `${PORTRAIT_ROOT}/${personId}.jpg`
  ])),

  // Morcant bleibt dieselbe Weltperson wie in seiner biologischen Trydar-Akte.
  'morcant-trydar': HOUSE_TRYDAR_PORTRAITS['morcant-trydar']
});
