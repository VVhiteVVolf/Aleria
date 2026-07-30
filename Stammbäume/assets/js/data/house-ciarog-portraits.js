import { HOUSE_BAEDD_PORTRAITS } from './house-baedd-portraits.js';
import { HOUSE_GRAWN_PORTRAITS } from './house-grawn-portraits.js';
import { HOUSE_MARCHOG_PORTRAITS } from './house-marchog-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-ciarog';

export const HOUSE_CIAROG_LOCAL_PORTRAIT_IDS = Object.freeze([
  'aine-aonghusa',
  'amaethon-ciarog',
  'bhreac-ciarog',
  'brigid-ceallaigh',
  'bryce-ciarog',
  'cadel-ciarog',
  'cady-ciarog',
  'carranog-ciarog',
  'cynddylan-ciarog',
  'daddweir-mwyalchen',
  'dalvin-ciarog',
  'diarmait-gairner',
  'dyfan-ciarog',
  'emer-ailella',
  'emer-casur',
  'fionn-fiantorc',
  'hywel-ciarog',
  'iseult-tartarfhuil',
  'karanteg-ciarog',
  'loyd-ciarog',
  'lugh-ciarog',
  'mordred-ciarog',
  'morgan-ciarog',
  'nest-ciarog',
  'nye-ciarog',
  'sabrian-gwarchod',
  'shan-ciarog',
  'soffi-ciarog',
  'tarrant-ciarog',
  'ultan-tir-fiachiontach',
  'wynndie-ciarog',
  'yale-ciarog'
]);

const JPEG_PORTRAIT_IDS = new Set([
  'brigid-ceallaigh',
  'diarmait-gairner',
  'fionn-fiantorc',
  'iseult-tartarfhuil',
  'sabrian-gwarchod',
  'ultan-tir-fiachiontach'
]);

const LOCAL_PORTRAITS = Object.freeze(Object.fromEntries(
  HOUSE_CIAROG_LOCAL_PORTRAIT_IDS.map(personId => [
    personId,
    `${PORTRAIT_ROOT}/${personId}.${JPEG_PORTRAIT_IDS.has(personId) ? 'jpg' : 'png'}`
  ])
));

// Bereits ausgearbeitete Gegenakten bleiben die kanonische Bildquelle
// gemeinsamer Weltpersonen. Neutrale Standardsilhouetten der Quelle werden
// nicht als individuelle Porträts gespeichert.
export const HOUSE_CIAROG_PORTRAITS = Object.freeze({
  ...LOCAL_PORTRAITS,
  'dystan-grawn': HOUSE_GRAWN_PORTRAITS['dystan-grawn'],
  'vaughan-baedd': HOUSE_BAEDD_PORTRAITS['vaughan-baedd'],
  'ulyana-ciarog': HOUSE_BAEDD_PORTRAITS['ulyana-ciarog'],
  'lyon-marchog': HOUSE_MARCHOG_PORTRAITS['lyon-marchog'],
  'cymraes-ciarog': HOUSE_MARCHOG_PORTRAITS['cymraes-ciarog']
});
