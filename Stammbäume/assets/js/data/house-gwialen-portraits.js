import { HOUSE_BRITHYLL_PORTRAITS } from './house-brithyll-portraits.js';
import { HOUSE_CREFYDDOL_PORTRAITS } from './house-crefyddol-portraits.js';
import { HOUSE_GAFYR_PORTRAITS } from './house-gafyr-portraits.js';
import { HOUSE_PYSGOD_PORTRAITS } from './house-pysgod-portraits.js';
import { HOUSE_WYLAN_PORTRAITS } from './house-wylan-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-gwialen';

export const HOUSE_GWIALEN_LOCAL_PORTRAIT_FILES = Object.freeze({
  'llewarc-gwialen': 'llewarc-gwialen.png',
  'categirn-gwialen': 'categirn-gwialen.png',
  'artus-gwialen': 'artus-gwialen.png',
  'gereint-gwialen': 'gereint-gwialen.png',
  'rhydderch-gwialen': 'rhydderch-gwialen.png',
  'gwen-gwialen': 'gwen-gwialen.png',
  'andarch-crafanc': 'andarch-crafanc.jpg',
  'eilir-blodeuwedd': 'eilir-blodeuwedd.png',
  'bleddyn-illygoden': 'bleddyn-illygoden.png',
  'cwrgi-gwialen': 'cwrgi-gwialen.png',
  'cloten-gwialen': 'cloten-gwialen.png',
  'elgan-gwialen': 'elgan-gwialen.png',
  'alwen-gwialen': 'alwen-gwialen.png',
  'finola-anbhair': 'finola-anbhair.png',
  'rhianedd-coedwig': 'rhianedd-coedwig.jpg',
  'brynmor-wivern': 'brynmor-wivern.jpg',
  'catel-gwialen': 'catel-gwialen.png',
  'arawn-gwialen': 'arawn-gwialen.png',
  'adeon-gwialen': 'adeon-gwialen.png',
  'ellis-gwialen': 'ellis-gwialen.png',
  'iwerid-gwialen': 'iwerid-gwialen.png',
  'tyra-gwialen': 'tyra-gwialen.png'
});

const LOCAL_PORTRAITS = Object.freeze(Object.fromEntries(
  Object.entries(HOUSE_GWIALEN_LOCAL_PORTRAIT_FILES).map(([personId, fileName]) => [
    personId,
    `${PORTRAIT_ROOT}/${fileName}`
  ])
));

// Geteilte Weltpersonen verwenden immer den bereits kanonischen Bildpfad ihrer
// ausgearbeiteten Gegenakte. Generische Silhouetten aus der Altquelle werden
// nicht als individuelle Porträts importiert.
export const HOUSE_GWIALEN_PORTRAITS = Object.freeze({
  ...LOCAL_PORTRAITS,
  'aranhrod-pysgod': HOUSE_PYSGOD_PORTRAITS['aranhrod-pysgod'],
  'rhodri-pysgod': HOUSE_PYSGOD_PORTRAITS['rhodri-pysgod'],
  'bledri-pysgod': HOUSE_PYSGOD_PORTRAITS['bledri-pysgod'],
  'esill-gwialen': HOUSE_PYSGOD_PORTRAITS['esill-gwialen'],
  'arwel-crefyddol': HOUSE_CREFYDDOL_PORTRAITS['arwel-crefyddol'],
  'cador-brithyll': HOUSE_BRITHYLL_PORTRAITS['cador-brithyll'],
  'gwladus-gwialen': HOUSE_BRITHYLL_PORTRAITS['gwladus-gwialen'],
  'uther-gwialen': HOUSE_WYLAN_PORTRAITS['uther-gwialen'],
  'duncan-gafyr': HOUSE_GAFYR_PORTRAITS['duncan-gafyr'],
  'morfudd-gwialen': HOUSE_GAFYR_PORTRAITS['morfudd-gwialen']
});
