import { HOUSE_EDMY_PORTRAITS } from './house-edmy-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-cenfig';

const LOCAL_PORTRAIT_IDS = Object.freeze([
  'steffan-cenfig',
  'rhodri-cenfig',
  'osian-cenfig',
  'mathon-cenfig',
  'hiraeth-cenfig',
  'llawen-cenfig',
  'folant-cenfig',
  'nela-cenfig',
  'llowarch-cenfig',
  'awela-cenfig',
  'rhosyn-cenfig',
  'seren-cenfig',
  'padrig-cenfig',
  'caer-cenfig',
  'nyfrain-cenfig',
  'moronwy-cenfig',
  'eynion-cenfig'
]);

export const HOUSE_CENFIG_PORTRAITS = Object.freeze({
  ...Object.fromEntries(LOCAL_PORTRAIT_IDS.map(personId => [
    personId,
    `${PORTRAIT_ROOT}/${personId}.jpg`
  ])),

  // Dieselben Weltpersonen und Portraitdateien wie in ihrer biologischen Edmy-Akte.
  'melangell-edmy': HOUSE_EDMY_PORTRAITS['melangell-edmy'],
  'lleward-cenfig': HOUSE_EDMY_PORTRAITS['lleward-cenfig']
});
