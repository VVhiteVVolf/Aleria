import { HOUSE_AWENYDD_PORTRAITS } from './house-awenydd-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-penwyn';

const LOCAL_PORTRAIT_IDS = Object.freeze([
  'rhys-penwyn',
  'dlyan-penwyn',
  'mared-penwyn',
  'marared-penwyn',
  'catelyn-edmy',
  'cadfael-penwyn',
  'maelor-penwyn',
  'dafydd-penwyn',
  'braith-penwyn',
  'alawen',
  'neris',
  'lludd-penwyn',
  'rhianu-penwyn',
  'myriad-penwyn',
  'gruffyd-penwyn',
  'cerridwyn-penwyn',
  'merlyn-penwyn',
  'merrin-penwyn',
  'ewenny-penwyn',
  'aleth-penwyn',
  'tesni-penwyn'
]);

export const HOUSE_PENWYN_PORTRAITS = Object.freeze({
  ...Object.fromEntries(LOCAL_PORTRAIT_IDS.map(personId => [
    personId,
    PORTRAIT_ROOT + '/' + personId + '.png'
  ])),

  // Dieselben Weltpersonen wie in der bereits ausgearbeiteten Gegenakte Awenydd.
  'rhoswyn-penwyn': HOUSE_AWENYDD_PORTRAITS['rhoswyn-penwyn'],
  'brychan-awenydd': HOUSE_AWENYDD_PORTRAITS['brychan-awenydd']
});
