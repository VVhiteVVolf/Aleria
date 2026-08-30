import { HOUSE_ALBHOLZ_PORTRAITS } from './house-albholz-portraits.js';
import { HOUSE_NA_MHUIR_LOCAL_PORTRAITS } from './house-na-mhuir-local-portraits.js';
import {
  SEPT_GRUENHAND_LOCAL_PORTRAITS,
  SEPT_GRUENHAND_LOCAL_PORTRAIT_IDS
} from './sept-gruenhand-local-portraits.js';

export { SEPT_GRUENHAND_LOCAL_PORTRAIT_IDS };

export const SEPT_GRUENHAND_REUSED_PORTRAIT_IDS = Object.freeze([
  'liorain-gruenhand',
  'lannraig-mhuir',
  'aodhagan-mhuir',
  'artair-mhuir',
  'albhric-albholz'
]);

export const SEPT_GRUENHAND_PORTRAITS = Object.freeze({
  ...SEPT_GRUENHAND_LOCAL_PORTRAITS,
  'liorain-gruenhand': HOUSE_ALBHOLZ_PORTRAITS['liorain-gruenhand'],
  'lannraig-mhuir': HOUSE_NA_MHUIR_LOCAL_PORTRAITS['lannraig-mhuir'],
  'aodhagan-mhuir': HOUSE_NA_MHUIR_LOCAL_PORTRAITS['aodhagan-mhuir'],
  'artair-mhuir': HOUSE_NA_MHUIR_LOCAL_PORTRAITS['artair-mhuir'],
  'albhric-albholz': HOUSE_ALBHOLZ_PORTRAITS['albhric-albholz']
});
