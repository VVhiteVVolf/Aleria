import { HOUSE_ARWYDD_PORTRAITS } from './house-arwydd-portraits.js';
import { HOUSE_DRAIG_PORTRAITS } from './house-draig-portraits.js';
import { HOUSE_GAFYR_PORTRAITS } from './house-gafyr-portraits.js';
import { HOUSE_GWYVERN_PORTRAITS } from './house-gwyvern-portraits.js';
import { HOUSE_SAETHWYR_PORTRAITS } from './house-saethwyr-portraits.js';
import { HOUSE_WYRM_PORTRAITS } from './house-wyrm-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-gwefrydd';
const LOCAL_PORTRAIT_IDS = Object.freeze([
  'tallwch-gwefrydd',
  'clodagh-ard-conbhron',
  'wynfor-gwefrydd',
  'borros-gwefrydd',
  'wrnach-wylan',
  'llywellyn-draenog',
  'lyonel-gwefrydd',
  'garvan-gortach',
  'ormund-gwefrydd',
  'edric-gwefrydd',
  'eifion-grawn',
  'dewyll-dyngwn',
  'ursyn-gwefrydd',
  'robyrt-gwefrydd',
  'stennis-gwefrydd',
  'renly-gwefrydd',
  'morwenna-gwefrydd-1669',
  'dajena-tir-addawol',
  'morwen-dyngwn',
  'maelona-ceirwyn',
  'glendower-creyr',
  'gwendolen-gwefrydd',
  'tyreke-coedwig',
  'tommen-gwefrydd',
  'eithne-frisealach',
  'iorwerth-gwefrydd',
  'eira-gwefrydd',
  'bethan-gwefrydd',
  'petyr-gwefrydd',
  'floris-gwefrydd'
]);

export const HOUSE_GWEFRYDD_PORTRAITS = Object.freeze({
  ...Object.fromEntries(LOCAL_PORTRAIT_IDS.map(personId => [
    personId,
    `${PORTRAIT_ROOT}/${personId}.jpg`
  ])),
  'kenehyr-gwefrydd': HOUSE_DRAIG_PORTRAITS['kenehyr-gwefrydd'],
  'tanwen-draig': HOUSE_DRAIG_PORTRAITS['tanwen-draig'],
  'branwen-gwefrydd': HOUSE_DRAIG_PORTRAITS['branwen-gwefrydd'],
  'steffan-draig': HOUSE_DRAIG_PORTRAITS['steffan-draig'],
  'rheidwyn-gafyr': HOUSE_GAFYR_PORTRAITS['rheidwyn-gafyr'],
  'greidyawl-gwefrydd': HOUSE_GAFYR_PORTRAITS['greidyawl-gwefrydd'],
  'ffion-gwefrydd': HOUSE_GAFYR_PORTRAITS['ffion-gwefrydd'],
  'rheinallt-gafyr': HOUSE_GAFYR_PORTRAITS['rheinallt-gafyr'],
  'odyar-saethwyr': HOUSE_SAETHWYR_PORTRAITS['odyar-saethwyr'],
  'selyse-gwefrydd': HOUSE_SAETHWYR_PORTRAITS['selyse-gwefrydd'],
  'gallgoid-saethwyr': HOUSE_SAETHWYR_PORTRAITS['gallgoid-saethwyr'],
  'steffon-gwefrydd': HOUSE_WYRM_PORTRAITS['steffon-gwefrydd'],
  'thomos-gwefrydd': HOUSE_GWYVERN_PORTRAITS['thomos-gwefrydd'],
  'alys-gwyvern': HOUSE_GWYVERN_PORTRAITS['alys-gwyvern'],
  'myrcella-gwefrydd': HOUSE_ARWYDD_PORTRAITS['myrcella-gwefrydd'],
  'ieuan-arwydd': HOUSE_ARWYDD_PORTRAITS['ieuan-arwydd']
});
