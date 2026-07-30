import { HOUSE_GRAWN_PORTRAITS } from './house-grawn-portraits.js';
import { HOUSE_MARCHOG_PORTRAITS } from './house-marchog-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-morcanhuc';

export const HOUSE_MORCANHUC_LOCAL_PORTRAIT_IDS = Object.freeze([
  'barwyn-morcanhuc',
  'charlton-1685-morcanhuc',
  'charlton-1724-morcanhuc',
  'deidrie-1687-morcanhuc',
  'deidrie-1726-morcanhuc',
  'ellanah-morcanhuc',
  'ianto-morcanhuc',
  'iorwerth-morcanhuc',
  'lowri-morcanhuc'
]);

const LOCAL_PORTRAITS = Object.freeze(Object.fromEntries(
  HOUSE_MORCANHUC_LOCAL_PORTRAIT_IDS.map(personId => [
    personId,
    `${PORTRAIT_ROOT}/${personId}.jpg`
  ])
));

// Bereits ausgearbeitete Gegenakten bleiben die kanonische Bildquelle
// gemeinsamer Weltpersonen.
export const HOUSE_MORCANHUC_PORTRAITS = Object.freeze({
  ...LOCAL_PORTRAITS,
  'arthos-morcanhuc': HOUSE_GRAWN_PORTRAITS['arthos-morcanhuc'],
  'ywen-grawn': HOUSE_GRAWN_PORTRAITS['ywen-grawn'],
  'bricelyn-morcanhuc': HOUSE_MARCHOG_PORTRAITS['bricelyn-morcanhuc'],
  'imanie-marchog': HOUSE_MARCHOG_PORTRAITS['imanie-marchog']
});
