import { HOUSE_ARD_TRODACH_PORTRAITS } from './house-ard-trodach-portraits.js';
import { HOUSE_DAL_CRUTHIN_PORTRAITS } from './house-dal-cruthin-portraits.js';
import { HOUSE_NA_MHUIR_PORTRAITS } from './house-na-mhuir-portraits.js';
import {
  HOUSE_RUIN_LAIDIR_LOCAL_PORTRAITS,
  HOUSE_RUIN_LAIDIR_LOCAL_PORTRAIT_IDS
} from './house-ruin-laidir-local-portraits.js';
import { HOUSE_UA_EIRCE_PORTRAITS } from './house-ua-eirce-portraits.js';

export { HOUSE_RUIN_LAIDIR_LOCAL_PORTRAIT_IDS };

// Diese Porträts stammen aus bereits ausgearbeiteten Gegenakten. Alle
// übrigen angeheirateten Personen bleiben bewusst bei der Standardsilhouette.
export const HOUSE_RUIN_LAIDIR_REUSED_PORTRAIT_IDS = Object.freeze([
  'ytaran-mhuir',
  'raghallach-eirce',
  'cearbhall-trodach',
  'lachtnaid-cruthin',
  'nalainn-blar'
]);

export const HOUSE_RUIN_LAIDIR_PORTRAITS = Object.freeze({
  ...HOUSE_RUIN_LAIDIR_LOCAL_PORTRAITS,
  'ytaran-mhuir': HOUSE_NA_MHUIR_PORTRAITS['ytaran-mhuir'],
  'raghallach-eirce': HOUSE_UA_EIRCE_PORTRAITS['raghallach-eirce'],
  'cearbhall-trodach': HOUSE_ARD_TRODACH_PORTRAITS['cearbhall-trodach'],
  'lachtnaid-cruthin': HOUSE_DAL_CRUTHIN_PORTRAITS['lachtnaid-cruthin'],
  'nalainn-blar': 'assets/images/portraits/haus-nic-blar/nalainn-blar.png'
});
