import { HOUSE_JAERNBLOD_PORTRAITS } from './house-jaernblod-portraits.js';
import { HOUSE_VARANGR_PORTRAITS } from './house-varangr-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-schwarzblut';

export const HOUSE_SCHWARZBLUT_LOCAL_PORTRAIT_FILES = Object.freeze({
  'detlaf-schwarzblut': 'detlaf-schwarzblut.png',
  'geirfast-schwarzblut': 'geirfast-schwarzblut.png',
  'gunnar-silberblut': 'gunnar-silberblut.png',
  'eirik-schwarzblut': 'eirik-schwarzblut.png',
  'weskald-schwarzblut': 'weskald-schwarzblut.png',
  'herleif-schwarzblut': 'herleif-schwarzblut.png',
  'carlstein-schwarzblut': 'carlstein-schwarzblut.png',
  'vigmar-schwarzblut': 'vigmar-schwarzblut.png',
  'kalfur-kaltherz': 'kalfur-kaltherz.png',
  'ivarr-schwarzblut': 'ivarr-schwarzblut.png',
  'halvar-feuerherz': 'halvar-feuerherz.png',
  'alta-schwarzblut': 'alta-schwarzblut.png',
  'preben-schwarzblut': 'preben-schwarzblut.png',
  'aegir-frostauge': 'aegir-frostauge.png',
  'svanur-schwarzblut': 'svanur-schwarzblut.png',
  'svantje-schwarzblut': 'svantje-schwarzblut.png',
  'sindre-schwarzblut': 'sindre-schwarzblut.png',
  'rodmar-schwarzblut': 'rodmar-schwarzblut.png',
  'telma-silberblut': 'telma-silberblut.png',
  'aksel-gullvig': 'aksel-gullvig.png',
  'hillevi-blutstahl': 'hillevi-blutstahl.png',
  'njall-schwarzblut': 'njall-schwarzblut.png',
  'felga-schwarzblut': 'felga-schwarzblut.png',
  'pall-schwarzblut': 'pall-schwarzblut.png',
  'kolbein-schwarzblut': 'kolbein-schwarzblut.png',
  'jurgla-schwarzblut': 'jurgla-schwarzblut.png',
  'illugi-schwarzblut': 'illugi-schwarzblut.png'
});

export const HOUSE_SCHWARZBLUT_PORTRAIT_SOURCES = Object.freeze({
  'detlaf-schwarzblut': 'https://i.imgur.com/esTx3lO.png',
  'geirfast-schwarzblut': 'https://i.imgur.com/Y8Kmo8y.png',
  'gunnar-silberblut': 'https://i.imgur.com/iyV2NZy.png',
  'eirik-schwarzblut': 'https://i.imgur.com/bHZEn7I.png',
  'weskald-schwarzblut': 'https://i.imgur.com/Cvy1buu.png',
  'herleif-schwarzblut': 'https://i.imgur.com/hX1dwyW.png',
  'carlstein-schwarzblut': 'https://i.imgur.com/C9u1kBH.png',
  'vigmar-schwarzblut': 'https://i.imgur.com/m6aGEbx.png',
  'kalfur-kaltherz': 'https://i.imgur.com/zdkP6wv.png',
  'ivarr-schwarzblut': 'https://i.imgur.com/JwyOQmH.png',
  'halvar-feuerherz': 'https://i.imgur.com/EziKQDR.png',
  'alta-schwarzblut': 'https://i.imgur.com/zqdDwbK.png',
  'preben-schwarzblut': 'https://i.imgur.com/9mEoCkP.png',
  'aegir-frostauge': 'https://i.postimg.cc/rpy906V9/image.png',
  'svanur-schwarzblut': 'https://i.imgur.com/Jo1zivf.png',
  'svantje-schwarzblut': 'https://i.imgur.com/QbH44lR.png',
  'sindre-schwarzblut': 'https://i.imgur.com/7YT4gTO.png',
  'rodmar-schwarzblut': 'https://i.imgur.com/PpwuRfe.png',
  'telma-silberblut': 'https://i.imgur.com/HoB1RHw.png',
  'aksel-gullvig': 'https://i.imgur.com/SXx8CA8.png',
  'hillevi-blutstahl': 'https://i.imgur.com/OVAkGNt.png',
  'njall-schwarzblut': 'https://i.imgur.com/j5z4fcP.png',
  'felga-schwarzblut': 'https://i.imgur.com/lewOmJP.png',
  'pall-schwarzblut': 'https://i.imgur.com/RXQCWLq.png',
  'kolbein-schwarzblut': 'https://i.imgur.com/fcyieA8.png',
  'jurgla-schwarzblut': 'https://i.imgur.com/486GGWP.png',
  'illugi-schwarzblut': 'https://i.imgur.com/JSJkqhg.png'
});

const LOCAL_PORTRAITS = Object.fromEntries(
  Object.entries(HOUSE_SCHWARZBLUT_LOCAL_PORTRAIT_FILES).map(([personId, fileName]) => [
    personId,
    `${PORTRAIT_ROOT}/${fileName}`
  ])
);

export const HOUSE_SCHWARZBLUT_PORTRAITS = Object.freeze({
  ...LOCAL_PORTRAITS,
  'skjoldur-jaernblod': HOUSE_JAERNBLOD_PORTRAITS['skjoldur-jaernblod'],
  'jerrik-varangr': HOUSE_VARANGR_PORTRAITS['jerrik-varangr'],
  'fostine-varangr': HOUSE_VARANGR_PORTRAITS['fostine-varangr'],
  'styrbjorn-schwarzblut': HOUSE_VARANGR_PORTRAITS['styrbjorn-schwarzblut']
});
