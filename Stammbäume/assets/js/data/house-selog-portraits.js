import { HOUSE_RHUDDGAR_PORTRAITS } from './house-rhuddgar-portraits.js';
import { HOUSE_TARANVYR_PORTRAITS } from './house-taranvyr-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-selog';

const LOCAL_PORTRAIT_IDS = Object.freeze([
  'gwerthrynion-selog',
  'padarn-selog',
  'marchell-1649-selog',
  'rhun-selog',
  'hywel-selog',
  'adda-selog',
  'gwalchmai-selog',
  'cynan-selog',
  'gethin-selog',
  'afan-selog',
  'drystan-selog',
  'heilyn-selog',
  'marchell-1722-selog',
  'llywarch-selog',
  'marsli-selog',
  'siwan-selog',
  'arthfael-selog',
  'ystedd-selog'
]);

export const HOUSE_SELOG_PORTRAITS = Object.freeze({
  ...Object.fromEntries(LOCAL_PORTRAIT_IDS.map(personId => [
    personId,
    PORTRAIT_ROOT + '/' + personId + '.png'
  ])),

  // Dieselben Weltpersonen wie in den bereits ausgearbeiteten Gegenakten.
  'godwyn-selog': HOUSE_TARANVYR_PORTRAITS['godwyn-selog'],
  'linessa-taranvyr': HOUSE_TARANVYR_PORTRAITS['linessa-taranvyr'],
  'meggan-selog': HOUSE_RHUDDGAR_PORTRAITS['meggan-selog'],
  'lewys-rhuddgar': HOUSE_RHUDDGAR_PORTRAITS['lewys-rhuddgar']
});
