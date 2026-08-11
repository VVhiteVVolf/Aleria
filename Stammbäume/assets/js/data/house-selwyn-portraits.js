import { HOUSE_ARTH_PORTRAITS } from './house-arth-portraits.js';
import { HOUSE_CANWYLL_PORTRAITS } from './house-canwyll-portraits.js';
import { HOUSE_DIENYDDIWR_PORTRAITS } from './house-dienyddiwr-portraits.js';
import { HOUSE_EIRTH_PORTRAITS } from './house-eirth-portraits.js';
import { HOUSE_MORTHWYLL_PORTRAITS } from './house-morthwyll-portraits.js';
import { HOUSE_SGWARNOG_PORTRAITS } from './house-sgwarnog-portraits.js';
import { HOUSE_UNIGOL_PORTRAITS } from './house-unigol-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-selwyn';

export const HOUSE_SELWYN_LOCAL_PORTRAIT_FILES = Object.freeze({
  'morgan-founder-selwyn': 'morgan-founder-selwyn.jpg',
  'colwynn-selwyn': 'colwynn-selwyn.jpg',
  'evan-selwyn': 'evan-selwyn.jpg',
  'nesta-selwyn': 'nesta-selwyn.jpg',
  'glyn-selwyn': 'glyn-selwyn.jpg',
  'iona-selwyn': 'iona-selwyn.jpg',
  'cai-selwyn': 'cai-selwyn.jpg'
});

export const HOUSE_SELWYN_PORTRAIT_SOURCES = Object.freeze({
  'morgan-founder-selwyn': 'https://64.media.tumblr.com/a09a4eb9c7d6e45f83bd136218a1e28b/a6c27039f48ce8c7-d2/s250x400/4af62daafa151f361c9a6e50936d74b50f90b2e0.pnj',
  'colwynn-selwyn': 'https://64.media.tumblr.com/41df535f099c5e7f87b11e9cee7789a4/a6c27039f48ce8c7-85/s250x400/14885efb7591b79391d8986ce67c516dc73468da.pnj',
  'evan-selwyn': 'https://64.media.tumblr.com/8f53e23f04ee09b06f3ff29338809a71/a6c27039f48ce8c7-ae/s250x400/9207b838d7f962702c2a7f91605817b7e06430fb.pnj',
  'nesta-selwyn': 'https://64.media.tumblr.com/e6e337062457e8a83916c0a4a72d6ab5/a6c27039f48ce8c7-3e/s250x400/6cbcef183d9b5e883aa42b9292a2809c1abfb77f.pnj',
  'glyn-selwyn': 'https://64.media.tumblr.com/7494da6a9d2efb05b0cc3fa5cf1903b5/a6c27039f48ce8c7-e8/s250x400/0c527ab740897aa4d27fa371be41c79f063ac5c0.pnj',
  'iona-selwyn': 'https://64.media.tumblr.com/935093037f74f68c0df9fc51f23ae9f3/a6c27039f48ce8c7-30/s250x400/1331cd584c2aeb68567409f4e59f832970feb87d.pnj',
  'cai-selwyn': 'https://64.media.tumblr.com/49a14289e55a2a4fb93a73b38018bf36/a6c27039f48ce8c7-30/s250x400/6f44a8d26196ae3bfb3f55d120590ea4ff56a738.pnj'
});

const LOCAL_PORTRAITS = Object.freeze(Object.fromEntries(
  Object.entries(HOUSE_SELWYN_LOCAL_PORTRAIT_FILES).map(([personId, fileName]) => [
    personId,
    `${PORTRAIT_ROOT}/${fileName}`
  ])
));

// Bereits ausgearbeitete Gegenakten bleiben für gemeinsame Weltpersonen die
// kanonische Bildquelle. Wiederholte Standardsilhouetten werden nicht importiert.
export const HOUSE_SELWYN_PORTRAITS = Object.freeze({
  ...LOCAL_PORTRAITS,
  'tegwen-arth': HOUSE_ARTH_PORTRAITS['tegwen-arth'],
  'morgan-selwyn': HOUSE_ARTH_PORTRAITS['morgan-selwyn'],
  'enfys-canwyll': HOUSE_CANWYLL_PORTRAITS['enfys-canwyll'],
  'cadfan-selwyn': HOUSE_CANWYLL_PORTRAITS['cadfan-selwyn'],
  'brannock-dienyddiwr': HOUSE_DIENYDDIWR_PORTRAITS['brannock-dienyddiwr'],
  'uwchben-eirth': HOUSE_EIRTH_PORTRAITS['uwchben-eirth'],
  'caraid-selwyn': HOUSE_EIRTH_PORTRAITS['caraid-selwyn'],
  'berwyn-selwyn': HOUSE_MORTHWYLL_PORTRAITS['berwyn-selwyn'],
  'edern-selwyn': HOUSE_SGWARNOG_PORTRAITS['edern-selwyn'],
  'meiriona-1679-sgwarnog': HOUSE_SGWARNOG_PORTRAITS['meiriona-1679-sgwarnog'],
  'garselid-selwyn': HOUSE_UNIGOL_PORTRAITS['garselid-selwyn'],
  'cledwyn-selwyn': HOUSE_UNIGOL_PORTRAITS['cledwyn-selwyn'],
  'rhianu-unigol': HOUSE_UNIGOL_PORTRAITS['rhianu-unigol']
});
