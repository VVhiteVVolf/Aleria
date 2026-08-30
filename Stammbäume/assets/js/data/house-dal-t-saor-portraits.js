import { HOUSE_GRAWN_PORTRAITS } from './house-grawn-portraits.js';
import { HOUSE_RUIN_LAIDIR_LOCAL_PORTRAITS } from './house-ruin-laidir-local-portraits.js';
import { HOUSE_SAITH_PORTRAITS } from './house-saith-portraits.js';

// Die bereitgestellte Dal-T'Saor-Akte enthält ausschließlich veraltete Bilder.
// Deshalb werden nur bereits kanonische Porträts exakt derselben Weltpersonen
// aus ausgearbeiteten Gegenakten gespiegelt.
export const HOUSE_DAL_T_SAOR_REUSED_PORTRAIT_IDS = Object.freeze([
  'bedwyr-grawn',
  'luan-tsaoir',
  'padraigin-laidir'
]);

export const HOUSE_DAL_T_SAOR_PORTRAITS = Object.freeze({
  'bedwyr-grawn': HOUSE_GRAWN_PORTRAITS['bedwyr-grawn'],
  'luan-tsaoir': HOUSE_SAITH_PORTRAITS['luan-tsaoir'],
  'padraigin-laidir': HOUSE_RUIN_LAIDIR_LOCAL_PORTRAITS['padraigin-laidir']
});
