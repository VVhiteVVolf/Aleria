import { HOUSE_FIR_AN_GALLCHOBHAIR_PORTRAITS } from './house-fir-an-gallchobhair-portraits.js';
import { HOUSE_ILLWATH_PORTRAITS } from './house-illwath-portraits.js';
import {
  HOUSE_NA_MHUIR_LOCAL_PORTRAITS,
  HOUSE_NA_MHUIR_LOCAL_PORTRAIT_IDS
} from './house-na-mhuir-local-portraits.js';
import { SEPT_GRUENHAND_LOCAL_PORTRAITS } from './sept-gruenhand-local-portraits.js';

export { HOUSE_NA_MHUIR_LOCAL_PORTRAIT_IDS };

export const HOUSE_NA_MHUIR_REUSED_PORTRAIT_IDS = Object.freeze([
  'mallaidh-gallchobhair',
  'rubybhna-gruenhand',
  'peregrain-gruenhand',
  'holman-gallchobhair',
  'branwen-illwath',
  'khellen-mhuir',
  'lobellin-gruenhand',
  'quonnait-caiomhe'
]);

export const HOUSE_NA_MHUIR_PORTRAITS = Object.freeze({
  ...HOUSE_NA_MHUIR_LOCAL_PORTRAITS,
  'mallaidh-gallchobhair': HOUSE_FIR_AN_GALLCHOBHAIR_PORTRAITS['mallaidh-gallchobhair'],
  'rubybhna-gruenhand': SEPT_GRUENHAND_LOCAL_PORTRAITS['rubybhna-gruenhand'],
  'peregrain-gruenhand': SEPT_GRUENHAND_LOCAL_PORTRAITS['peregrain-gruenhand'],
  'holman-gallchobhair': HOUSE_FIR_AN_GALLCHOBHAIR_PORTRAITS['holman-gallchobhair'],
  'branwen-illwath': HOUSE_ILLWATH_PORTRAITS['branwen-illwath'],
  'khellen-mhuir': HOUSE_ILLWATH_PORTRAITS['khellen-mhuir'],
  'lobellin-gruenhand': SEPT_GRUENHAND_LOCAL_PORTRAITS['lobellin-gruenhand'],
  'quonnait-caiomhe': 'assets/images/portraits/haus-nic-caoimhe/quonnait-caiomhe.png'
});
