import { HOUSE_ARTH_PORTRAITS } from './house-arth-portraits.js';
import { HOUSE_CREFYDDOL_PORTRAITS } from './house-crefyddol-portraits.js';
import { HOUSE_GWARCHOD_PORTRAITS } from './house-gwarchod-portraits.js';
import { HOUSE_PAWEN_PORTRAITS } from './house-pawen-portraits.js';
import { HOUSE_UNIGOL_PORTRAITS } from './house-unigol-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-eirth';

export const HOUSE_EIRTH_LOCAL_PORTRAIT_FILES = Object.freeze({
  'prysor-eirth': 'prysor-eirth.jpg',
  'ifanwy-cwningod': 'ifanwy-cwningod.jpg',
  'uwchben-eirth': 'uwchben-eirth.jpg',
  'caraid-selwyn': 'caraid-selwyn.jpg',
  'rhun-eirth': 'rhun-eirth.jpg',
  'gwyn-eirth': 'gwyn-eirth.jpg',
  'parzifal-eirth': 'parzifal-eirth.jpg',
  'oth-eirth': 'oth-eirth.jpg',
  'jenya-eirth': 'jenya-eirth.jpg',
  'padrig-eirth': 'padrig-eirth.jpg',
  'niya-eirth': 'niya-eirth.jpg'
});

export const HOUSE_EIRTH_PORTRAIT_SOURCES = Object.freeze({
  'prysor-eirth': 'https://64.media.tumblr.com/7d0ae701d371925bbcd82cea9adf8571/ef7b451a93b548d3-ef/s250x400/d1f2e00edac690f19f08cf15830c6b6496d118cb.pnj',
  'ifanwy-cwningod': 'https://64.media.tumblr.com/ba166c81e6559c4d0574cc249eb4d7d1/2bfa0e4852a1cce2-80/s400x600/3fb02d9f9d3ef4da9abc47a90423f1f9b0574cb4.pnj',
  'uwchben-eirth': 'https://64.media.tumblr.com/3447186edfadd3124402c06618e53707/ef7b451a93b548d3-7b/s250x400/827cbfff3d37d55c8a8a105d92bca48ff2217351.pnj',
  'caraid-selwyn': 'https://64.media.tumblr.com/22643f9467f5fa5df854bd8359d15312/a6c27039f48ce8c7-4d/s250x400/8fc33a90ccf59b0dec4f840db531c7425f565c2d.pnj',
  'rhun-eirth': 'https://64.media.tumblr.com/3ba58b3a99fe06811aec83016327ee6a/ef7b451a93b548d3-5a/s250x400/42ae867fc9547212b65546c903c29e995e7c7554.pnj',
  'gwyn-eirth': 'https://64.media.tumblr.com/6efd3ac209c4e748b8121e4a6028662d/ef7b451a93b548d3-24/s250x400/af5ece765e886fb54781dbd7ecaee96685e61855.pnj',
  'parzifal-eirth': 'https://64.media.tumblr.com/9d07234e5845b32b028c0fdfd11382f1/ef7b451a93b548d3-2f/s250x400/79c9fe4303da4ba80d6e70c1b29eaa7fde4790b2.pnj',
  'oth-eirth': 'https://64.media.tumblr.com/38415b4420d676f1eaa43f9ed4ae7bad/ef7b451a93b548d3-38/s250x400/2c3437737e77999268098e07d009e42e2011d4dd.pnj',
  'jenya-eirth': 'https://64.media.tumblr.com/e16eed42e109316df9cca58a327f58da/ef7b451a93b548d3-99/s250x400/aea7b13b3c5b5030b0408ebaf6d05680c4b5a887.pnj',
  'padrig-eirth': 'https://64.media.tumblr.com/9ec081550ea308c5139cd11a1f0abad3/ef7b451a93b548d3-4d/s250x400/f3fd496a74b46c45812a068fcc9cc42cf85fdadc.pnj',
  'niya-eirth': 'https://64.media.tumblr.com/294f43953b687d73f290c1feb323c12a/ef7b451a93b548d3-2c/s250x400/531e5288971e459b798691924280b5ef103efac4.pnj'
});

const LOCAL_PORTRAITS = Object.freeze(Object.fromEntries(
  Object.entries(HOUSE_EIRTH_LOCAL_PORTRAIT_FILES).map(([personId, fileName]) => [
    personId,
    `${PORTRAIT_ROOT}/${fileName}`
  ])
));

// Ausgearbeitete Gegenakten bleiben für geteilte Weltpersonen die kanonische
// Bildquelle. Kyndras Quelle ist nur die bekannte Standardsilhouette und wird
// deshalb nicht fälschlich als individuelles Porträt übernommen.
export const HOUSE_EIRTH_PORTRAITS = Object.freeze({
  ...LOCAL_PORTRAITS,
  'rhynnon-arth': HOUSE_ARTH_PORTRAITS['rhynnon-arth'],
  'gaynor-eirth': HOUSE_UNIGOL_PORTRAITS['gaynor-eirth'],
  'dafydd-unigol': HOUSE_UNIGOL_PORTRAITS['dafydd-unigol'],
  'rhiwallon-unigol': HOUSE_UNIGOL_PORTRAITS['rhiwallon-unigol'],
  'eirwyn-eirth': HOUSE_UNIGOL_PORTRAITS['eirwyn-eirth'],
  'gwendolen-crefyddol': HOUSE_CREFYDDOL_PORTRAITS['gwendolen-crefyddol'],
  'wyndham-eirth': HOUSE_CREFYDDOL_PORTRAITS['wyndham-eirth'],
  'urien-eirth': HOUSE_PAWEN_PORTRAITS['urien-eirth'],
  'mared-pawen': HOUSE_PAWEN_PORTRAITS['mared-pawen'],
  'vaughan-eirth': HOUSE_GWARCHOD_PORTRAITS['vaughan-eirth'],
  'gwynndie-gwarchod': HOUSE_GWARCHOD_PORTRAITS['gwynndie-gwarchod']
});
