import { HOUSE_DYNGWN_PORTRAITS } from './house-dyngwn-portraits.js';
import { HOUSE_LLWYNOG_PORTRAITS } from './house-llwynog-portraits.js';
import { HOUSE_MOCHDAER_PORTRAITS } from './house-mochdaer-portraits.js';
import { HOUSE_PENDERYN_PORTRAITS } from './house-penderyn-portraits.js';
import { HOUSE_SAETHWYR_PORTRAITS } from './house-saethwyr-portraits.js';
import { HOUSE_WYLAN_PORTRAITS } from './house-wylan-portraits.js';
import { HOUSE_WYRM_PORTRAITS } from './house-wyrm-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-dinefwr';

// Wiederholte schwarze Standardsilhouetten der Quelle sind keine
// Individualporträts. Ruari Fintains Quellbild ist derzeit nicht abrufbar und
// bleibt ebenfalls beim systemeigenen Platzhalter, statt einen Fremden zu zeigen.
export const HOUSE_DINEFWR_LOCAL_PORTRAIT_IDS = Object.freeze([
  'erim-der-bulle-dinefwr',
  'beynon-tarw-dinefwr',
  'eynon-tarw-dinefwr',
  'bedelia-ua-fhaire',
  'aithne-ua-fhaire',
  'taredd-dinefwr',
  'maldwyn-creyr-dinefwr',
  'ennissyen-tir-addawol',
  'cardoc-dinefwr',
  'carys-dinefwr',
  'tegwen-dinefwr',
  'evan-dinefwr',
  'niamhe-stwatchn',
  'edwyn-gaeth',
  'goronwy-creyr',
  'garselid-dinefwr',
  'sulwen-dinefwr',
  'gaven-dinefwr',
  'blodeuyn-tir-addawol',
  'peibyn-hwyaden',
  'ywen-ilyuncu',
  'niamhe-1712-dinefwr',
  'neithon-dinefwr',
  'corin-dinefwr',
  'atusa-dinefwr',
  'dyfed-dinefwr',
  'nesta-dinefwr',
  'cai-dinefwr',
  'fflur-dinefwr'
]);

export const HOUSE_DINEFWR_LOCAL_PORTRAITS = Object.freeze(Object.fromEntries(
  HOUSE_DINEFWR_LOCAL_PORTRAIT_IDS.map(personId => [
    personId,
    `${PORTRAIT_ROOT}/${personId}.jpg`
  ])
));

export const HOUSE_DINEFWR_PORTRAITS = Object.freeze({
  ...HOUSE_DINEFWR_LOCAL_PORTRAITS,
  'gwrtheyrn-dinefwr': HOUSE_DYNGWN_PORTRAITS['gwrtheyrn-dinefwr'],
  'derwen-dyngwn': HOUSE_DYNGWN_PORTRAITS['derwen-dyngwn'] || '',
  'drudwas-saethwyr': HOUSE_SAETHWYR_PORTRAITS['drudwas-saethwyr'],
  'govynyon-dinefwr': HOUSE_LLWYNOG_PORTRAITS['govynyon-dinefwr'],
  'enevold-penderyn': HOUSE_PENDERYN_PORTRAITS['enevold-penderyn'],
  'carnedyr-dinefwr': HOUSE_WYRM_PORTRAITS['carnedyr-dinefwr'],
  'trevelyan-dinefwr': HOUSE_WYLAN_PORTRAITS['trevelyan-dinefwr'],
  'mag-wylan': HOUSE_WYLAN_PORTRAITS['mag-wylan'],
  'micah-1693-mochdaer': HOUSE_MOCHDAER_PORTRAITS['micah-1693-mochdaer'],
  'jenica-dinefwr': HOUSE_MOCHDAER_PORTRAITS['jenica-dinefwr']
});
