import { HOUSE_ARTH_PORTRAITS } from './house-arth-portraits.js';
import { HOUSE_CREFYDDOL_PORTRAITS } from './house-crefyddol-portraits.js';
import { HOUSE_DYNGWN_PORTRAITS } from './house-dyngwn-portraits.js';
import { HOUSE_PENDERYN_PORTRAITS } from './house-penderyn-portraits.js';
import { HOUSE_UNIGOL_PORTRAITS } from './house-unigol-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-morthwyll';

export const HOUSE_MORTHWYLL_LOCAL_PORTRAIT_FILES = Object.freeze({
  'rhodhri-cwningod': 'rhodhri-cwningod.jpg',
  'cadwallen-morthwyll': 'cadwallen-morthwyll.png',
  'berwyn-selwyn': 'berwyn-selwyn.jpg',
  'glendower-morthwyll': 'glendower-morthwyll.png',
  'grugyn-morthwyll': 'grugyn-morthwyll.png',
  'guenevere-morthwyll': 'guenevere-morthwyll.png',
  'kynwrig-morthwyll': 'kynwrig-morthwyll.png',
  'hedvig-hyrmgardr': 'hedvig-hyrmgardr.png',
  'kane-trachwyll': 'kane-trachwyll.jpg',
  'ursula-skog': 'ursula-skog.png',
  'arawn-morthwyll': 'arawn-morthwyll.png',
  'nerys-morthwyll': 'nerys-morthwyll.png',
  'collen-1724-morthwyll': 'collen-1724-morthwyll.png',
  'drwst-morthwyll': 'drwst-morthwyll.png',
  'lowri-morthwyll': 'lowri-morthwyll.png'
});

export const HOUSE_MORTHWYLL_PORTRAIT_SOURCES = Object.freeze({
  'rhodhri-cwningod': 'https://64.media.tumblr.com/e95b76bb01e5c81636e579edd0be12a3/ede4c143dc24726b-26/s250x400/63fa514408d143c78bc15059d02e6676edb4e7d6.pnj',
  'cadwallen-morthwyll': 'https://i.imgur.com/QkgqI8n.png',
  'berwyn-selwyn': 'https://64.media.tumblr.com/64070a02bb40a6c261a8e93116a52c3b/a6c27039f48ce8c7-ef/s250x400/bc290025c3a18135732b9f37566677e6fc06a463.pnj',
  'glendower-morthwyll': 'https://i.imgur.com/ZIEoR0y.png',
  'grugyn-morthwyll': 'https://i.imgur.com/FcpNj1D.png',
  'guenevere-morthwyll': 'https://i.imgur.com/0KeR43i.png',
  'kynwrig-morthwyll': 'https://i.imgur.com/3jHugYq.png',
  'hedvig-hyrmgardr': 'https://i.imgur.com/9h7fVVY.png',
  'kane-trachwyll': 'https://64.media.tumblr.com/415482d3b4ab7bf9db9175806885ec37/0e955d8f99366615-5b/s250x400/dbd707dcc43bc025a270efa600255bc3b818fbd9.pnj',
  'ursula-skog': 'https://i.imgur.com/7hNsd3k.png',
  'arawn-morthwyll': 'https://i.imgur.com/0ocsySf.png',
  'nerys-morthwyll': 'https://i.imgur.com/4D8VulD.png',
  'collen-1724-morthwyll': 'https://i.imgur.com/t41OIG4.png',
  'drwst-morthwyll': 'https://i.imgur.com/aqBPwXW.png',
  'lowri-morthwyll': 'https://i.imgur.com/3XNNhhY.png'
});

const LOCAL_PORTRAITS = Object.freeze(Object.fromEntries(
  Object.entries(HOUSE_MORTHWYLL_LOCAL_PORTRAIT_FILES).map(([personId, fileName]) => [
    personId,
    `${PORTRAIT_ROOT}/${fileName}`
  ])
));

// Bereits ausgearbeitete Gegenakten bleiben die kanonische Bildquelle geteilter
// Weltpersonen. Wiederholte Standardsilhouetten der Altquelle werden ausgelassen.
export const HOUSE_MORTHWYLL_PORTRAITS = Object.freeze({
  ...LOCAL_PORTRAITS,
  'dadweir-penderyn': HOUSE_PENDERYN_PORTRAITS['dadweir-penderyn'],
  'merlion-morthwyll': HOUSE_DYNGWN_PORTRAITS['merlion-morthwyll'],
  'sayres-morthwyll': HOUSE_ARTH_PORTRAITS['sayres-morthwyll'],
  'tryffin-unigol': HOUSE_UNIGOL_PORTRAITS['tryffin-unigol'],
  'gethin-crefyddol': HOUSE_CREFYDDOL_PORTRAITS['gethin-crefyddol']
});
