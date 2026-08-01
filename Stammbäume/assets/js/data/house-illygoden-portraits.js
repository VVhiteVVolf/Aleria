import { HOUSE_BLAIDD_PORTRAITS } from './house-blaidd-portraits.js';
import { HOUSE_BLODYN_PORTRAITS } from './house-blodyn-portraits.js';
import { HOUSE_COEDWIG_PORTRAITS } from './house-coedwig-portraits.js';
import { HOUSE_DRAENOG_PORTRAITS } from './house-draenog-portraits.js';
import { HOUSE_GWIALEN_PORTRAITS } from './house-gwialen-portraits.js';
import { HOUSE_WIVERN_PORTRAITS } from './house-wivern-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-illygoden';

export const HOUSE_ILLYGODEN_LOCAL_PORTRAIT_FILES = Object.freeze({
  'corryn-founder-illygoden': 'corryn-founder-illygoden.png',
  'macsen-illygoden': 'macsen-illygoden.png',
  'griflet-illygoden': 'griflet-illygoden.png',
  'sywlch-dianc': 'sywlch-dianc.png',
  'meredydd-illygoden': 'meredydd-illygoden.png',
  'valmai-bochdew': 'valmai-bochdew.png',
  'emrys-bochdew': 'emrys-bochdew.png',
  'gryn-illygoden': 'gryn-illygoden.png',
  'taredd-illygoden': 'taredd-illygoden.png',
  'afanen-bochdew': 'afanen-bochdew.png',
  'megan-bochdew': 'megan-bochdew.png',
  'caryl-illygoden': 'caryl-illygoden.png',
  'ifor-illygoden': 'ifor-illygoden.png',
  'hafren-illygoden': 'hafren-illygoden.png',
  'dewi-illygoden': 'dewi-illygoden.png',
  'pryce-illygoden': 'pryce-illygoden.png',
  'meg-illygoden': 'meg-illygoden.png',
  'beth-illygoden': 'beth-illygoden.png',
  'nia-illygoden': 'nia-illygoden.png'
});

export const HOUSE_ILLYGODEN_PORTRAIT_SOURCES = Object.freeze({
  'corryn-founder-illygoden': 'https://i.imgur.com/ITD8Muk.png',
  'macsen-illygoden': 'https://i.imgur.com/mfYhQRn.png',
  'griflet-illygoden': 'https://i.imgur.com/hYIaI1W.png',
  'sywlch-dianc': 'https://i.imgur.com/BRifFpC.png',
  'meredydd-illygoden': 'https://i.imgur.com/U45bhc4.png',
  'valmai-bochdew': 'https://i.imgur.com/U0TZsr9.png',
  'emrys-bochdew': 'https://i.imgur.com/eoqGC1B.png',
  'gryn-illygoden': 'https://i.imgur.com/6N2RQ6E.png',
  'taredd-illygoden': 'https://i.imgur.com/mXsv9bW.png',
  'afanen-bochdew': 'https://i.imgur.com/cdnp0CW.png',
  'megan-bochdew': 'https://i.imgur.com/GGpN3MR.png',
  'caryl-illygoden': 'https://i.imgur.com/vOTIABj.png',
  'ifor-illygoden': 'https://i.imgur.com/Ze5AnSo.png',
  'hafren-illygoden': 'https://i.imgur.com/UTKhImB.png',
  'dewi-illygoden': 'https://i.imgur.com/7afOgLF.png',
  'pryce-illygoden': 'https://i.imgur.com/yZY5Hr7.png',
  'meg-illygoden': 'https://i.imgur.com/nwvY3jk.png',
  'beth-illygoden': 'https://i.imgur.com/alGHT4F.png',
  'nia-illygoden': 'https://i.imgur.com/7snv16x.png'
});

const LOCAL_PORTRAITS = Object.freeze(Object.fromEntries(
  Object.entries(HOUSE_ILLYGODEN_LOCAL_PORTRAIT_FILES).map(([personId, fileName]) => [
    personId,
    `${PORTRAIT_ROOT}/${fileName}`
  ])
));

// Geteilte Weltpersonen behalten den bereits kanonischen Bildpfad ihrer
// ausgearbeiteten Gegenakte. Wiederholte Standardsilhouetten der Altquelle
// werden nicht als vermeintliche Individualporträts importiert.
export const HOUSE_ILLYGODEN_PORTRAITS = Object.freeze({
  ...LOCAL_PORTRAITS,
  'powell-illygoden': HOUSE_BLAIDD_PORTRAITS['powell-illygoden'],
  'quendolin-blaidd': HOUSE_BLAIDD_PORTRAITS['quendolin-blaidd'],
  'taliesin-illygoden': HOUSE_BLAIDD_PORTRAITS['taliesin-illygoden'],
  'braith-blaidd': HOUSE_BLAIDD_PORTRAITS['braith-blaidd'],
  'corryn-illygoden': HOUSE_BLODYN_PORTRAITS['corryn-illygoden'],
  'diafol-blodyn': HOUSE_BLODYN_PORTRAITS['diafol-blodyn'],
  'bleddyn-illygoden': HOUSE_GWIALEN_PORTRAITS['bleddyn-illygoden'],
  'gwen-gwialen': HOUSE_GWIALEN_PORTRAITS['gwen-gwialen'],
  'maxen-illygoden': HOUSE_BLAIDD_PORTRAITS['maxen-illygoden'],
  'fflur-blaidd': HOUSE_BLAIDD_PORTRAITS['fflur-blaidd'],
  'dolena-illygoden': HOUSE_COEDWIG_PORTRAITS['dolena-illygoden'],
  'zachariah-coedwig': HOUSE_COEDWIG_PORTRAITS['zachariah-coedwig'],
  'faelan-illygoden': HOUSE_DRAENOG_PORTRAITS['faelan-illygoden'],
  'gwydion-draenog': HOUSE_DRAENOG_PORTRAITS['gwydion-draenog'],
  'kevern-illygoden': HOUSE_WIVERN_PORTRAITS['kevern-illygoden'],
  'nolwenn-wivern': HOUSE_WIVERN_PORTRAITS['nolwenn-wivern']
});
