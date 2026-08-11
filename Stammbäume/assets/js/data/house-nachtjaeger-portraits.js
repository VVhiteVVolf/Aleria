import { HOUSE_FREIWINTER_PORTRAITS } from './house-freiwinter-portraits.js';
import { HOUSE_VARULV_PORTRAITS } from './house-varulv-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-nachtjaeger';

export const HOUSE_NACHTJAEGER_LOCAL_PORTRAIT_FILES = Object.freeze({
  'gunnar-nachtjaeger': 'gunnar-nachtjaeger.png',
  'vidarr-nachtjaeger': 'vidarr-nachtjaeger.png',
  'ulfgar-schattenherz': 'ulfgar-schattenherz.png',
  'sturlaugr-nachtjaeger': 'sturlaugr-nachtjaeger.png',
  'hrafnkell-vragi': 'hrafnkell-vragi.png',
  'joekull-nachtjaeger': 'joekull-nachtjaeger.png',
  'kjartan-nachtjaeger': 'kjartan-nachtjaeger.png',
  'fjoelnir-nachtjaeger': 'fjoelnir-nachtjaeger.png',
  'inghild-nachtjaeger': 'inghild-nachtjaeger.png',
  'baldvin-nachtjaeger': 'baldvin-nachtjaeger.png',
  'styrmir-nachtjaeger': 'styrmir-nachtjaeger.png',
  'ardal-nachtjaeger': 'ardal-nachtjaeger.png',
  'stiofan-blar': 'stiofan-blar.png',
  'rognar-nachtjaeger': 'rognar-nachtjaeger.png',
  'starkad-nachtjaeger': 'starkad-nachtjaeger.png',
  'gulda-nachtjaeger': 'gulda-nachtjaeger.png',
  'ran-skald': 'ran-skald.png',
  'vorna': 'vorna.png',
  'oddrun-kampfgeborene': 'oddrun-kampfgeborene.png',
  'kynwas-dyngwn': 'kynwas-dyngwn.png',
  'arnor-nachtjaeger': 'arnor-nachtjaeger.png',
  'laufey-nachtjaeger': 'laufey-nachtjaeger.png',
  'joric-nachtjaeger': 'joric-nachtjaeger.png',
  'vear-nachtjaeger': 'vear-nachtjaeger.png',
  'nanna-nachtjaeger': 'nanna-nachtjaeger.png'
});

export const HOUSE_NACHTJAEGER_PORTRAIT_SOURCES = Object.freeze({
  'gunnar-nachtjaeger': 'https://i.imgur.com/r9VD88t.png',
  'vidarr-nachtjaeger': 'https://i.imgur.com/ITwx6DD.png',
  'ulfgar-schattenherz': 'https://i.imgur.com/5e5ZHk0.png',
  'sturlaugr-nachtjaeger': 'https://i.imgur.com/iRxgori.png',
  'hrafnkell-vragi': 'https://i.imgur.com/mOoF2T8.png',
  'joekull-nachtjaeger': 'https://i.imgur.com/ngeIoXs.png',
  'kjartan-nachtjaeger': 'https://i.imgur.com/ycln0qR.png',
  'fjoelnir-nachtjaeger': 'https://i.imgur.com/PBitx0y.png',
  'inghild-nachtjaeger': 'https://i.imgur.com/eDTMI2R.png',
  'baldvin-nachtjaeger': 'https://i.imgur.com/iUhroql.png',
  'styrmir-nachtjaeger': 'https://i.imgur.com/Xf2xpx4.png',
  'ardal-nachtjaeger': 'https://i.imgur.com/psqsbSA.png',
  'stiofan-blar': 'https://i.imgur.com/Lf6lFgJ.png',
  'rognar-nachtjaeger': 'https://i.imgur.com/Bkbqyxn.png',
  'starkad-nachtjaeger': 'https://i.imgur.com/hQjtfG4.png',
  'gulda-nachtjaeger': 'https://i.imgur.com/DrOasok.png',
  'ran-skald': 'https://i.imgur.com/HJ9bcmx.png',
  'vorna': 'https://i.imgur.com/RKTelw5.png',
  'oddrun-kampfgeborene': 'https://i.imgur.com/frJVwQ7.png',
  'kynwas-dyngwn': 'https://64.media.tumblr.com/c717e4f1648441124322d03a79b40081/4eb80c3427932b89-b2/s250x400/d6b12db7b100e3b3c4cfda42a3a97ff03ab921b2.pnj',
  'arnor-nachtjaeger': 'https://i.imgur.com/DcPQ5T9.png',
  'laufey-nachtjaeger': 'https://i.imgur.com/Bpqbhqr.png',
  'joric-nachtjaeger': 'https://i.imgur.com/G3zU35W.png',
  'vear-nachtjaeger': 'https://i.imgur.com/wt20QBj.png',
  'nanna-nachtjaeger': 'https://i.imgur.com/govORCc.png'
});

const LOCAL_PORTRAITS = Object.freeze(Object.fromEntries(
  Object.entries(HOUSE_NACHTJAEGER_LOCAL_PORTRAIT_FILES).map(([personId, fileName]) => [
    personId,
    `${PORTRAIT_ROOT}/${fileName}`
  ])
));

// Bereits in Gegenakten registrierte Weltpersonen behalten ihre kanonischen
// Porträts. Wiederholte schwarze Standardsilhouetten der Quelle werden nicht
// als vermeintliche Individualbilder importiert.
export const HOUSE_NACHTJAEGER_PORTRAITS = Object.freeze({
  ...LOCAL_PORTRAITS,
  'fannarr-varulv': HOUSE_VARULV_PORTRAITS['fannarr-varulv'],
  'torvard-nachtjaeger': HOUSE_VARULV_PORTRAITS['torvard-nachtjaeger'],
  'alva-varulv': HOUSE_VARULV_PORTRAITS['alva-varulv'],
  'ketill-freiwinter': HOUSE_FREIWINTER_PORTRAITS['ketill-freiwinter'],
  'estridd-nachtjaeger': HOUSE_FREIWINTER_PORTRAITS['estridd-nachtjaeger'],
  'reidar-freiwinter': HOUSE_FREIWINTER_PORTRAITS['reidar-freiwinter']
});
