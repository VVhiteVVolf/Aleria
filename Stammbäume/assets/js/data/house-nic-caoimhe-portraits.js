import { HOUSE_ARD_FRISEALACH_PORTRAITS } from './house-ard-frisealach-portraits.js';
import { HOUSE_ARD_TRODACH_PORTRAITS } from './house-ard-trodach-portraits.js';
import { HOUSE_DAL_CRUTHIN_PORTRAITS } from './house-dal-cruthin-portraits.js';
import { HOUSE_NA_MHUIR_PORTRAITS } from './house-na-mhuir-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-nic-caoimhe';

export const HOUSE_NIC_CAOIMHE_LOCAL_PORTRAIT_FILES = Object.freeze({
  'fainne-founder-caoimhe': 'fainne-founder-caoimhe.png',
  'pailin-caoimhe': 'pailin-caoimhe.png',
  'reathnaigh-caoimhe': 'reathnaigh-caoimhe.png',
  'quonnait-caiomhe': 'quonnait-caiomhe.png',
  'saorlaith-caiomhe': 'saorlaith-caiomhe.png',
  'ciannait-caoimhe': 'ciannait-caoimhe.png',
  'homlach-caoimhe': 'homlach-caoimhe.png',
  'uathmar-caoimhe': 'uathmar-caoimhe.png',
  'cionaodh-caoimhe': 'cionaodh-caoimhe.png',
  'yllana-caoimhe': 'yllana-caoimhe.png',
  'bebhinn-caoimhe': 'bebhinn-caoimhe.png',
  'fainne-1696-caoimhe': 'fainne-1696-caoimhe.png',
  'biorna-caoimhe': 'biorna-caoimhe.png',
  'latharna-caoimhe': 'latharna-caoimhe.png',
  'realtin-caoimhe': 'realtin-caoimhe.png',
  'fionnain-caoimhe': 'fionnain-caoimhe.png',
  'brona-caoimhe': 'brona-caoimhe.png',
  'ollamh-caoimhe': 'ollamh-caoimhe.png',
  'alfdis-caoimhe': 'alfdis-caoimhe.png',
  'eoin-caoimhe': 'eoin-caoimhe.png'
});

export const HOUSE_NIC_CAOIMHE_LOCAL_PORTRAIT_IDS = Object.freeze(
  Object.keys(HOUSE_NIC_CAOIMHE_LOCAL_PORTRAIT_FILES)
);

export const HOUSE_NIC_CAOIMHE_REUSED_PORTRAIT_IDS = Object.freeze([
  'cleirchin-cruthin',
  'jodhran-trodach',
  'malach-mhuir',
  'oirbhealach-frisealach',
  'meallchu-cruthin',
  'jaimhin-blar'
]);

export const HOUSE_NIC_CAOIMHE_PORTRAITS = Object.freeze({
  ...Object.fromEntries(Object.entries(HOUSE_NIC_CAOIMHE_LOCAL_PORTRAIT_FILES).map(
    ([personId, fileName]) => [personId, `${PORTRAIT_ROOT}/${fileName}`]
  )),
  'cleirchin-cruthin': HOUSE_DAL_CRUTHIN_PORTRAITS['cleirchin-cruthin'],
  'jodhran-trodach': HOUSE_ARD_TRODACH_PORTRAITS['jodhran-trodach'],
  'malach-mhuir': HOUSE_NA_MHUIR_PORTRAITS['malach-mhuir'],
  'oirbhealach-frisealach': HOUSE_ARD_FRISEALACH_PORTRAITS['oirbhealach-frisealach'],
  'meallchu-cruthin': HOUSE_DAL_CRUTHIN_PORTRAITS['meallchu-cruthin'],
  'jaimhin-blar': 'assets/images/portraits/haus-nic-blar/jaimhin-blar.png'
});
