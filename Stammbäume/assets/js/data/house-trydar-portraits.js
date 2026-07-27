import { HOUSE_RHUDDGAR_PORTRAITS } from './house-rhuddgar-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-trydar';

const LOCAL_PORTRAIT_IDS = Object.freeze([
  'maelor-trydar',
  'cadfan-trydar',
  'pryce-trydar',
  'rheon-trydar',
  'meiron-trydar',
  'eynion-trydar',
  'maeryn-trydar',
  'maldwyn-trydar',
  'peithwen-trydar',
  'morcant-trydar',
  'talon-trydar',
  'steffon-trydar',
  'morwen-trydar',
  'selwyn-trydar',
  'meira-trydar'
]);

export const HOUSE_TRYDAR_PORTRAITS = Object.freeze({
  ...Object.fromEntries(LOCAL_PORTRAIT_IDS.map(personId => [
    personId,
    PORTRAIT_ROOT + '/' + personId + '.png'
  ])),

  // Morgan und Dolena sind dieselben Weltpersonen wie im Haus Rhuddgar.
  'morgan-trydar': HOUSE_RHUDDGAR_PORTRAITS['morgan-trydar'],
  'dolena-rhuddgar': HOUSE_RHUDDGAR_PORTRAITS['dolena-rhuddgar']
});
