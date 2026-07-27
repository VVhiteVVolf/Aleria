import { HOUSE_CHWEDLONOL_PORTRAITS } from './house-chwedlonol-portraits.js';
import { HOUSE_RHUDDGAR_PORTRAITS } from './house-rhuddgar-portraits.js';
import { HOUSE_TARANVYR_PORTRAITS } from './house-taranvyr-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-tawelgar';

const LOCAL_PORTRAIT_IDS = Object.freeze([
  'karris-tawelgar',
  'harri-tawelgar',
  'aneirin-tawelgar',
  'gwendolen-tawelgar',
  'gais-tawelgar',
  'yennefer-tawelgar',
  'gwynham-seldryn',
  'sian-tawelgar',
  'marwin-tawelgar',
  'bhreac-tawelgar',
  'cariad-tawelgar',
  'lincoln-tawelgar',
  'olive-tawelgar',
  'rhena-tawelgar',
  'artie-tawelgar',
  'siobhan-tawelgar',
  'brizio-tawelgar',
  'owena-tawelgar',
  'rhys-tawelgar',
  'slavi-tawelgar',
  'jenya-tawelgar',
  'wyn-tawelgar',
  'bobi-tawelgar',
  'zabrina-tawelgar'
]);

export const HOUSE_TAWELGAR_PORTRAITS = Object.freeze({
  ...Object.fromEntries(LOCAL_PORTRAIT_IDS.map(personId => [
    personId,
    `${PORTRAIT_ROOT}/${personId}.jpg`
  ])),

  // Bereits in ihren Gegenakten kanonisch geführte Weltpersonen.
  'maredudd-tawelgar': HOUSE_TARANVYR_PORTRAITS['maredudd-tawelgar'],
  'kerrilyn-taranvyr': HOUSE_TARANVYR_PORTRAITS['kerrilyn-taranvyr'],
  'wyndham-rhuddgar': HOUSE_RHUDDGAR_PORTRAITS['wyndham-rhuddgar'],
  'emlyn-tawelgar': HOUSE_CHWEDLONOL_PORTRAITS['emlyn-tawelgar'],
  'romney-1704-chwedlonol': HOUSE_CHWEDLONOL_PORTRAITS['romney-1704-chwedlonol']
});
