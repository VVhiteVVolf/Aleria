import { HOUSE_LYFANT_PORTRAITS } from './house-lyfant-portraits.js';
import { HOUSE_ARFORDIR_PORTRAITS } from './house-arfordir-portraits.js';
import { HOUSE_GWIALEN_PORTRAITS } from './house-gwialen-portraits.js';
import { HOUSE_BRITHYLL_PORTRAITS } from './house-brithyll-portraits.js';

// Kanonische Porträts der Angehörigen dieses Hauses; Gegenakten teilen dieselbe Datei.
export const HOUSE_BLODEUWEDD_PORTRAITS = Object.freeze({
  'llywarch-blodeuwedd': "assets/images/portraits/haus-blodeuwedd/llywarch-blodeuwedd.png",
  'rhydian-blodeuwedd': "assets/images/portraits/haus-blodeuwedd/rhydian-blodeuwedd.png",
  'gawain-blodeuwedd': "assets/images/portraits/haus-blodeuwedd/gawain-blodeuwedd.png",
  'edlym-blodeuwedd': HOUSE_LYFANT_PORTRAITS['edlym-blodeuwedd'],
  'jenita-blodeuwedd': HOUSE_ARFORDIR_PORTRAITS['jenita-blodeuwedd'],
  'eilir-blodeuwedd': HOUSE_GWIALEN_PORTRAITS['eilir-blodeuwedd'],
  'mervin-blodeuwedd': "assets/images/portraits/haus-blodeuwedd/mervin-blodeuwedd.png",
  'loyde-blodeuwedd': "assets/images/portraits/haus-blodeuwedd/loyde-blodeuwedd.png",
  'cariad-blodeuwedd': "assets/images/portraits/haus-blodeuwedd/cariad-blodeuwedd.png",
  'meical-blodeuwedd': "assets/images/portraits/haus-blodeuwedd/meical-blodeuwedd.png",
  'maygan-blodeuwedd': HOUSE_BRITHYLL_PORTRAITS['maygan-blodeuwedd']
});
