import { HOUSE_RHYDDID_PORTRAITS } from './house-rhyddid-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-chwedlonol';
const LOCAL_PORTRAIT_IDS = Object.freeze([
  'meredithe-chwedlonol',
  'gwenhwyfar-chwedlonol',
  'niniane-chwedlonol',
  'carantec',
  'meredithe-1677-chwedlonol',
  'rhodri',
  'rhonwen-chwedlonol',
  'cieran',
  'angharad-chwedlonol',
  'drystan',
  'morgaine-chwedlonol',
  'marven-balchder',
  'glyndwr-chwedlonol',
  'kathleen',
  'romney-1704-chwedlonol',
  'emlyn-tawelgar',
  'cederic-chwedlonol',
  'eleyne-chwedlonol',
  'soffi-gwared',
  'caralyn-chwedlonol',
  'shylene',
  'kyndra-chwedlonol',
  'rhondia-chwedlonol',
  'meriel-chwedlonol',
  'maxen-chwedlonol',
  'hyrs-chwedlonol'
]);

export const HOUSE_CHWEDLONOL_PORTRAITS = Object.freeze({
  ...Object.fromEntries(LOCAL_PORTRAIT_IDS.map(personId => [
    personId,
    `${PORTRAIT_ROOT}/${personId}.jpg`
  ])),
  // Kerwin Rhyddid ist mit dem Rhyddid-Stammbaum geteilt; sein Portrait wird dort gehostet.
  'kerwin-rhyddid': HOUSE_RHYDDID_PORTRAITS['kerwin-rhyddid']
});
