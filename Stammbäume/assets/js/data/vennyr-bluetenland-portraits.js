import { HOUSE_BLODEUWEDD_PORTRAITS } from './house-blodeuwedd-portraits.js';
import { HOUSE_MORGANT_PORTRAITS } from './house-morgant-portraits.js';
import { HOUSE_SERENOC_PORTRAITS } from './house-serenoc-portraits.js';
import { HOUSE_MORLAIS_PORTRAITS } from './house-morlais-portraits.js';
import { HOUSE_BLODYN_PORTRAITS } from './house-blodyn-portraits.js';
import { HOUSE_LYFANT_PORTRAITS } from './house-lyfant-portraits.js';
import { HOUSE_GWIALEN_PORTRAITS } from './house-gwialen-portraits.js';
import { HOUSE_BRITHYLL_PORTRAITS } from './house-brithyll-portraits.js';
import { HOUSE_DIAFOL_PORTRAITS } from './house-diafol-portraits.js';
import { HOUSE_CWINGOD_PORTRAITS } from './house-cwingod-portraits.js';
import { HOUSE_DYFRGI_PORTRAITS } from './house-dyfrgi-portraits.js';
import { HOUSE_ARFORDIR_PORTRAITS } from './house-arfordir-portraits.js';

// Die Sammlung verbindet reine Bildmodule, ohne Familienakten gegenseitig zu importieren.
export const VENNYR_BLUETENLAND_PORTRAITS = Object.freeze({
  ...HOUSE_BLODEUWEDD_PORTRAITS,
  ...HOUSE_MORGANT_PORTRAITS,
  ...HOUSE_SERENOC_PORTRAITS,
  ...HOUSE_MORLAIS_PORTRAITS,
  'uryen-blodyn': HOUSE_BLODYN_PORTRAITS['uryen-blodyn'],
  'voreyn-blodyn': HOUSE_BLODYN_PORTRAITS['voreyn-blodyn'],
  'edlym-blodeuwedd': HOUSE_LYFANT_PORTRAITS['edlym-blodeuwedd'],
  'eilir-blodeuwedd': HOUSE_GWIALEN_PORTRAITS['eilir-blodeuwedd'],
  'rhydderch-gwialen': HOUSE_GWIALEN_PORTRAITS['rhydderch-gwialen'],
  'maygan-blodeuwedd': HOUSE_BRITHYLL_PORTRAITS['maygan-blodeuwedd'],
  'efan-brithyll': HOUSE_BRITHYLL_PORTRAITS['efan-brithyll'],
  'hetwn-morgant': HOUSE_BLODYN_PORTRAITS['hetwn-morgant'],
  'taranis-morgant': HOUSE_DIAFOL_PORTRAITS['taranis-morgant'],
  'arawn-serenoc': HOUSE_DIAFOL_PORTRAITS['arawn-serenoc'],
  'neila-serenoc': HOUSE_LYFANT_PORTRAITS['neila-serenoc'],
  'cadwgan-lyfant': HOUSE_LYFANT_PORTRAITS['cadwgan-lyfant'],
  'trachmyr-serenoc': HOUSE_BLODYN_PORTRAITS['trachmyr-serenoc'],
  'mervyn-serenoc': HOUSE_CWINGOD_PORTRAITS['mervyn-serenoc'],
  'riderch-cwingod': HOUSE_CWINGOD_PORTRAITS['riderch-cwingod'],
  'meuric-morlais': HOUSE_DYFRGI_PORTRAITS['meuric-morlais'],
  'kynwas-morlais': HOUSE_BLODYN_PORTRAITS['kynwas-morlais'],
  'hedd-morlais': HOUSE_CWINGOD_PORTRAITS['hedd-morlais'],
  'jenita-blodeuwedd': HOUSE_ARFORDIR_PORTRAITS['jenita-blodeuwedd'],
});
