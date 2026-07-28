import { HOUSE_ADERYN_PORTRAITS } from './house-aderyn-portraits.js';
import { HOUSE_DRAIG_PORTRAITS } from './house-draig-portraits.js';
import { HOUSE_GRAWN_PORTRAITS } from './house-grawn-portraits.js';
import { HOUSE_GWYVERN_PORTRAITS } from './house-gwyvern-portraits.js';
import { HOUSE_PENDRAG_PORTRAITS } from './house-pendrag-portraits.js';
import { HOUSE_PYSGOD_PORTRAITS } from './house-pysgod-portraits.js';
import { HOUSE_SAETHWYR_PORTRAITS } from './house-saethwyr-portraits.js';
import { HOUSE_ARTH_LOCAL_PORTRAITS } from './house-arth-local-portraits.js';

// Bereits ausgearbeitete Gegenakten bleiben die kanonische Bildquelle geteilter
// Weltpersonen. Nur dort bislang unbelegte Arth-Portraits liegen lokal bei Arth.
const SHARED_PORTRAITS = Object.freeze({
  'madoc-arth': HOUSE_DRAIG_PORTRAITS['madoc-arth'],
  'owain-draig': HOUSE_DRAIG_PORTRAITS['owain-draig'],
  'esyllt-arth': HOUSE_DRAIG_PORTRAITS['esyllt-arth'],
  'sylvia-cenyr': HOUSE_DRAIG_PORTRAITS['sylvia-cenyr'],
  'amadia-draig': HOUSE_DRAIG_PORTRAITS['amadia-draig'],
  'siana-draig': HOUSE_DRAIG_PORTRAITS['siana-draig'],
  'cynwrig-ancient-pysgod': HOUSE_PYSGOD_PORTRAITS['cynwrig-ancient-pysgod'],
  'traharyan-arth': HOUSE_PYSGOD_PORTRAITS['traharyan-arth'],
  'llewella-arth': HOUSE_PYSGOD_PORTRAITS['llewella-arth'],
  'gingalain-1671-pysgod': HOUSE_PYSGOD_PORTRAITS['gingalain-1671-pysgod'],
  'arglwyddes-aderyn': HOUSE_ADERYN_PORTRAITS['arglwyddes-aderyn'],
  'ceridwen-1700-grawn': HOUSE_GRAWN_PORTRAITS['ceridwen-1700-grawn'],
  'parzifal-arth': HOUSE_GRAWN_PORTRAITS['parzifal-arth'],
  'tristan-pendrag': HOUSE_PENDRAG_PORTRAITS['tristan-pendrag'],
  'isolde-arth': HOUSE_PENDRAG_PORTRAITS['isolde-arth'],
  'delyth-gwyvern': HOUSE_GWYVERN_PORTRAITS['delyth-gwyvern'],
  'afal-arth': HOUSE_GWYVERN_PORTRAITS['afal-arth'],
  'melyn-arth': HOUSE_SAETHWYR_PORTRAITS['melyn-arth'],
  'gwalchgwyn-saethwyr': HOUSE_SAETHWYR_PORTRAITS['gwalchgwyn-saethwyr'],
  'talara-blodyn': 'assets/images/portraits/haus-blodyn/talara-blodyn.jpg'
});

export const HOUSE_ARTH_PORTRAITS = Object.freeze({
  ...HOUSE_ARTH_LOCAL_PORTRAITS,
  ...Object.fromEntries(Object.entries(SHARED_PORTRAITS).filter(([, portrait]) => portrait))
});
