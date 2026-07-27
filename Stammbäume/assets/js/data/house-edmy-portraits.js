import { HOUSE_PENWYN_PORTRAITS } from './house-penwyn-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-edmy';

const LOCAL_PORTRAIT_IDS = Object.freeze([
  'edmwnd-edmy',
  'conwy-edmy',
  'bowen-edmy',
  'caledfwlch-edmy',
  'melangell-edmy',
  'arial-edmy',
  'lleward-cenfig',
  'digain-edmy',
  'edern-edmy',
  'elfed-edmy',
  'bran-edmy',
  'brochwel-edmy',
  'celyddon-edmy',
  'derwen-edmy',
  'gerallt-edmy',
  'peredur-edmy',
  'elenid-edmy',
  'llinos-edmy',
  'efanna-edmy',
  'cedig-edmy',
  'olwen-edmy',
  'aedd-edmy'
]);

export const HOUSE_EDMY_PORTRAITS = Object.freeze({
  ...Object.fromEntries(LOCAL_PORTRAIT_IDS.map(personId => [
    personId,
    `${PORTRAIT_ROOT}/${personId}.png`
  ])),

  // Dieselben Weltpersonen und Portraitdateien wie in ihrer Penwyn-Gegenakte.
  'catelyn-edmy': HOUSE_PENWYN_PORTRAITS['catelyn-edmy'],
  'rhys-penwyn': HOUSE_PENWYN_PORTRAITS['rhys-penwyn']
});
