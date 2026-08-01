import { HOUSE_ARTH_PORTRAITS } from './house-arth-portraits.js';
import { HOUSE_BRITHYLL_PORTRAITS } from './house-brithyll-portraits.js';
import { HOUSE_CANWYLL_PORTRAITS } from './house-canwyll-portraits.js';
import { HOUSE_COEDWIG_PORTRAITS } from './house-coedwig-portraits.js';
import { HOUSE_GRAWN_PORTRAITS } from './house-grawn-portraits.js';
import { HOUSE_GWIALEN_PORTRAITS } from './house-gwialen-portraits.js';
import { HOUSE_MORFIL_PORTRAITS } from './house-morfil-portraits.js';
import { HOUSE_PYSGOD_PORTRAITS } from './house-pysgod-portraits.js';
import { HOUSE_TYLLUAN_PORTRAITS } from './house-tylluan-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-wivern';

export const HOUSE_WIVERN_LOCAL_PORTRAIT_FILES = Object.freeze({
  'ulysses-founder-wivern': 'ulysses-founder-wivern.png',
  'jowaneth-wivern': 'jowaneth-wivern.jpg',
  'yspaddaden-wivern': 'yspaddaden-wivern.jpg',
  'ulysses-1672-wivern': 'ulysses-1672-wivern.jpg',
  'zethyra-draenog': 'zethyra-draenog.png',
  'nolwenn-wivern': 'nolwenn-wivern.jpg',
  'boudwin-wivern': 'boudwin-wivern.jpg',
  'kevern-illygoden': 'kevern-illygoden.png',
  'blaun-crwynog': 'blaun-crwynog.png',
  'ulfyn-wivern': 'ulfyn-wivern.jpg',
  'branek-wivern': 'branek-wivern.jpg',
  'isotta-morgryn': 'isotta-morgryn.png',
  'ulaeth-1723-wivern': 'ulaeth-1723-wivern.jpg',
  'beli-wivern': 'beli-wivern.jpg',
  'jago-wivern': 'jago-wivern.jpg',
  'wyrn-wivern': 'wyrn-wivern.jpg',
  'joryn-wivern': 'joryn-wivern.jpg',
  'yseut-wivern': 'yseut-wivern.jpg'
});

export const HOUSE_WIVERN_PORTRAIT_SOURCES = Object.freeze({
  'ulysses-founder-wivern': 'https://64.media.tumblr.com/28af3e06809983e6c5c951eaf8d57388/d93fea7414cb2bf9-fc/s400x600/a3608d97d4bd8276e1842d391da9585106050082.pnj',
  'jowaneth-wivern': 'https://64.media.tumblr.com/692af2a0e6e14b53300170483a2a65d8/45a60e69b91bea8f-d7/s250x400/059d6959d9590cbb58ef1d32bd5c47f78186174f.pnj',
  'yspaddaden-wivern': 'https://64.media.tumblr.com/a2375bd282b089ddfc293c40de538d37/45a60e69b91bea8f-5b/s250x400/e9ae31f14a943841d47748dae162a61a0947a38e.pnj',
  'ulysses-1672-wivern': 'https://64.media.tumblr.com/d001303d588b88957af30fa18131e642/45a60e69b91bea8f-5d/s250x400/b3ac3ec92d06c162193e05225ad9355b366a0d79.pnj',
  'zethyra-draenog': 'https://64.media.tumblr.com/55375decf098c9185867fe90c281f3a5/1d0fdf290bb92993-27/s400x600/894a80ebe8cd8733133e2a043894d649caf093a0.pnj',
  'nolwenn-wivern': 'https://64.media.tumblr.com/a66f7063dafebda6f639281ed570d6de/45a60e69b91bea8f-ab/s250x400/93f4c7092aa0a785f9bec21387180782821a264e.pnj',
  'boudwin-wivern': 'https://64.media.tumblr.com/826ba9572a584fbbc9f1fcea7e10bfb9/45a60e69b91bea8f-ff/s250x400/33f888787c3245e0d40c6612a0576297546d9753.pnj',
  'kevern-illygoden': 'https://i.imgur.com/0WSGFWi.png',
  'blaun-crwynog': 'https://i.imgur.com/3AA1CYk.png',
  'ulfyn-wivern': 'https://64.media.tumblr.com/0be661a13373d0cc81086757bfa903f4/45a60e69b91bea8f-b4/s250x400/600fcd32d1022da26a84fbc6079ec1559c48eb64.pnj',
  'branek-wivern': 'https://64.media.tumblr.com/ff55ee59095e61d2b539014f96226685/45a60e69b91bea8f-f6/s250x400/d59c1cb0ba93614ae2b4d478e101ab96e4fa8b2a.pnj',
  'isotta-morgryn': 'https://i.imgur.com/bc23Qr2.png',
  'ulaeth-1723-wivern': 'https://64.media.tumblr.com/d97b3c4d38cf48c8ef0b1ab5a3054e57/45a60e69b91bea8f-cc/s250x400/ec36a6863fa40cec788d25ca3520f0c1d4eb0d93.pnj',
  'beli-wivern': 'https://64.media.tumblr.com/33d076f09d1acabe25df3e3c26434fef/45a60e69b91bea8f-f7/s250x400/a9115a544538350cf34b983555ce715486293652.pnj',
  'jago-wivern': 'https://64.media.tumblr.com/1f78b7969d0cbafd30ead04b295d809f/45a60e69b91bea8f-ae/s250x400/da8109a9162b27cf04eee5d792c93968b977bb38.pnj',
  'wyrn-wivern': 'https://64.media.tumblr.com/2e33206811e49c0042c9edc6bb531b5a/45a60e69b91bea8f-e5/s250x400/6f8c9165b9684667b52d1213d1e08b07775a3632.pnj',
  'joryn-wivern': 'https://64.media.tumblr.com/a538dc9a6045f7f2765e023354edc48a/45a60e69b91bea8f-d4/s250x400/7ff1a7a1336d23d5ca624719d57efc9eec956e39.pnj',
  'yseut-wivern': 'https://64.media.tumblr.com/9b3b808d6f6379486c874775de7ad4a8/45a60e69b91bea8f-45/s250x400/5000833f8f259afca2fbcdd85df35dbf55556d72.pnj'
});

const LOCAL_PORTRAITS = Object.freeze(Object.fromEntries(
  Object.entries(HOUSE_WIVERN_LOCAL_PORTRAIT_FILES).map(([personId, fileName]) => [
    personId,
    `${PORTRAIT_ROOT}/${fileName}`
  ])
));

// Bereits ausgearbeitete Gegenakten bleiben die kanonische Bildquelle geteilter
// Weltpersonen. Die wiederholten Standardsilhouetten der Altquelle werden nicht
// als vermeintliche Individualporträts importiert.
export const HOUSE_WIVERN_PORTRAITS = Object.freeze({
  ...LOCAL_PORTRAITS,
  'eirwyn-1654-pysgod': HOUSE_PYSGOD_PORTRAITS['eirwyn-1654-pysgod'],
  'islwyn-wivern': HOUSE_PYSGOD_PORTRAITS['islwyn-wivern'],
  'cafael-morfil': HOUSE_MORFIL_PORTRAITS['cafael-morfil'],
  'wyndham-grawn': HOUSE_GRAWN_PORTRAITS['wyndham-grawn'],
  'arwen-wivern': HOUSE_BRITHYLL_PORTRAITS['arwen-wivern'],
  'ifwin-brithyll': HOUSE_BRITHYLL_PORTRAITS['ifwin-brithyll'],
  'cerdd-wivern': HOUSE_ARTH_PORTRAITS['cerdd-wivern'],
  'gwennan-arth': HOUSE_ARTH_PORTRAITS['gwennan-arth'],
  'zyraline-wivern': HOUSE_CANWYLL_PORTRAITS['zyraline-wivern'],
  'urien-canwyll': HOUSE_CANWYLL_PORTRAITS['urien-canwyll'],
  'brynmor-wivern': HOUSE_GWIALEN_PORTRAITS['brynmor-wivern'],
  'alwen-gwialen': HOUSE_GWIALEN_PORTRAITS['alwen-gwialen'],
  'caiomhe-wivern': HOUSE_COEDWIG_PORTRAITS['caiomhe-wivern'],
  'brysia-coedwig': HOUSE_COEDWIG_PORTRAITS['brysia-coedwig'],
  'jenara-tylluan': HOUSE_TYLLUAN_PORTRAITS['jenara-tylluan'],
  'wynoc-wivern': HOUSE_TYLLUAN_PORTRAITS['wynoc-wivern']
});
