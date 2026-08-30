import { HOUSE_ARD_TRODACH_PORTRAITS } from './house-ard-trodach-portraits.js';
import { HOUSE_CIAROG_PORTRAITS } from './house-ciarog-portraits.js';
import { HOUSE_DYNGWN_PORTRAITS } from './house-dyngwn-portraits.js';
import { HOUSE_GRAWN_PORTRAITS } from './house-grawn-portraits.js';
import { HOUSE_GWEFRYDD_PORTRAITS } from './house-gwefrydd-portraits.js';
import { HOUSE_NA_MHUIR_PORTRAITS } from './house-na-mhuir-portraits.js';
import { HOUSE_RUIN_LAIDIR_LOCAL_PORTRAITS } from './house-ruin-laidir-local-portraits.js';
import { HOUSE_UA_EIRCE_PORTRAITS } from './house-ua-eirce-portraits.js';

// Die Ua-Choinnich-Vorlage enthält ausschließlich veraltete Bilder. Diese
// Zuordnung darf daher nur Porträts spiegeln, die dieselbe Weltperson bereits
// in einer ausgearbeiteten Gegenakte verwendet.
export const HOUSE_UA_CHOINNICH_REUSED_PORTRAIT_IDS = Object.freeze([
  'wynfor-gwefrydd',
  'mervyn-grawn',
  'morgan-ciarog',
  'carthach-trodach',
  'emer-choinnich',
  'muirgheas-mhuir',
  'daithi-eirce',
  'aonghus-laidir',
  'trianach-laidir',
  'maonait-blar'
]);

export const HOUSE_UA_CHOINNICH_PORTRAITS = Object.freeze({
  'wynfor-gwefrydd': HOUSE_GWEFRYDD_PORTRAITS['wynfor-gwefrydd'],
  'mervyn-grawn': HOUSE_GRAWN_PORTRAITS['mervyn-grawn'],
  'morgan-ciarog': HOUSE_CIAROG_PORTRAITS['morgan-ciarog'],
  'carthach-trodach': HOUSE_ARD_TRODACH_PORTRAITS['carthach-trodach'],
  'emer-choinnich': HOUSE_DYNGWN_PORTRAITS['emer-choinnich'],
  'muirgheas-mhuir': HOUSE_NA_MHUIR_PORTRAITS['muirgheas-mhuir'],
  'daithi-eirce': HOUSE_UA_EIRCE_PORTRAITS['daithi-eirce'],
  'aonghus-laidir': HOUSE_RUIN_LAIDIR_LOCAL_PORTRAITS['aonghus-laidir'],
  'trianach-laidir': HOUSE_RUIN_LAIDIR_LOCAL_PORTRAITS['trianach-laidir'],
  'maonait-blar': 'assets/images/portraits/haus-nic-blar/maonait-blar.png'
});
