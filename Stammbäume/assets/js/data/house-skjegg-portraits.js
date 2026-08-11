import { HOUSE_FREIWINTER_PORTRAITS } from './house-freiwinter-portraits.js';
import { HOUSE_KAMPFGEBORENE_PORTRAITS } from './house-kampfgeborene-portraits.js';
import { HOUSE_SCHWARZDORN_PORTRAITS } from './house-schwarzdorn-portraits.js';
import { HOUSE_VARULV_PORTRAITS } from './house-varulv-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-skjegg';

export const HOUSE_SKJEGG_LOCAL_PORTRAIT_FILES = Object.freeze({
  'meili-skjegg': 'meili-skjegg.png',
  'hjorleif-skjegg': 'hjorleif-skjegg.png',
  'hakon-skjegg': 'hakon-skjegg.png',
  'brodd-silberzunge': 'brodd-silberzunge.png',
  'sweyn-skjegg': 'sweyn-skjegg.png',
  'sveinung-skaal': 'sveinung-skaal.png',
  'floki-skjegg': 'floki-skjegg.png',
  'sigurd-skogg': 'sigurd-skogg.png',
  'halfdan-skjegg': 'halfdan-skjegg.png',
  'vigulf-skjegg': 'vigulf-skjegg.png',
  'loki-silberzunge': 'loki-silberzunge.png',
  'thiodolf-skjegg': 'thiodolf-skjegg.png',
  'revna-skjegg': 'revna-skjegg.png',
  'thrainn-skjegg': 'thrainn-skjegg.png',
  'hanne-skaal': 'hanne-skaal.png',
  'arne-skaal': 'arne-skaal.png',
  'harold-skjegg': 'harold-skjegg.png',
  'thorfinn-skjegg': 'thorfinn-skjegg.png',
  'balder-skjegg': 'balder-skjegg.png',
  'sighild-helgr': 'sighild-helgr.png',
  'njord-skjegg': 'njord-skjegg.png',
  'kolga-skjegg': 'kolga-skjegg.png',
  'alrek-skjegg': 'alrek-skjegg.png',
  'svart-skjegg': 'svart-skjegg.png',
  'tyra-skjegg': 'tyra-skjegg.png',
  'odd-skjegg': 'odd-skjegg.png',
  'ulf-skjegg': 'ulf-skjegg.png'
});

export const HOUSE_SKJEGG_PORTRAIT_SOURCES = Object.freeze({
  'meili-skjegg': 'https://i.imgur.com/48BzBHT.png',
  'hjorleif-skjegg': 'https://i.imgur.com/TSLLocW.png',
  'hakon-skjegg': 'https://i.imgur.com/YsdOFT8.png',
  'brodd-silberzunge': 'https://i.imgur.com/gGIbDUW.png',
  'sweyn-skjegg': 'https://i.imgur.com/p7xSuzb.png',
  'sveinung-skaal': 'https://i.imgur.com/cWYK5Ih.png',
  'floki-skjegg': 'https://i.imgur.com/xv07h5A.png',
  'sigurd-skogg': 'https://i.imgur.com/sR7sfrR.png',
  'halfdan-skjegg': 'https://i.imgur.com/lUabUWB.png',
  'vigulf-skjegg': 'https://i.imgur.com/6diiXop.png',
  'loki-silberzunge': 'https://i.imgur.com/L17TBdn.png',
  'thiodolf-skjegg': 'https://i.imgur.com/r9mlbUU.png',
  'revna-skjegg': 'https://i.imgur.com/oWtduoE.png',
  'thrainn-skjegg': 'https://i.imgur.com/0o17bQk.png',
  'hanne-skaal': 'https://i.imgur.com/eFKJIj5.png',
  'arne-skaal': 'https://i.imgur.com/Ww9j2U7.png',
  'harold-skjegg': 'https://i.imgur.com/HlRufBf.png',
  'thorfinn-skjegg': 'https://i.imgur.com/Z97T13U.png',
  'balder-skjegg': 'https://i.imgur.com/WnO4NT5.png',
  'sighild-helgr': 'https://i.imgur.com/RphIR89.png',
  'njord-skjegg': 'https://i.imgur.com/DkdiRLc.png',
  'kolga-skjegg': 'https://i.imgur.com/Jk6IdzW.png',
  'alrek-skjegg': 'https://i.imgur.com/vhkZnlO.png',
  'svart-skjegg': 'https://i.imgur.com/5pGWIKo.png',
  'tyra-skjegg': 'https://i.imgur.com/UseDP0G.png',
  'odd-skjegg': 'https://i.imgur.com/egfAa5f.png',
  'ulf-skjegg': 'https://i.imgur.com/rcjwcRC.png'
});

const LOCAL_PORTRAITS = Object.freeze(Object.fromEntries(
  Object.entries(HOUSE_SKJEGG_LOCAL_PORTRAIT_FILES).map(([personId, fileName]) => [
    personId,
    `${PORTRAIT_ROOT}/${fileName}`
  ])
));

// Bereits ausgearbeitete Gegenakten besitzen die kanonischen Dateien dieser
// Weltpersonen. Die wiederholte schwarze Standardsilhouette der Altquelle wird
// nicht als Individualporträt importiert.
export const HOUSE_SKJEGG_PORTRAITS = Object.freeze({
  ...LOCAL_PORTRAITS,
  'valdemar-skjegg': HOUSE_KAMPFGEBORENE_PORTRAITS['valdemar-skjegg'],
  'thorir-schwarzdorn': HOUSE_SCHWARZDORN_PORTRAITS['thorir-schwarzdorn'],
  'borghild-skjegg': HOUSE_SCHWARZDORN_PORTRAITS['borghild-skjegg'],
  'mathon-schwarzdorn': HOUSE_SCHWARZDORN_PORTRAITS['mathon-schwarzdorn'],
  'vebjorn-freiwinter': HOUSE_FREIWINTER_PORTRAITS['vebjorn-freiwinter'],
  'tyr-varulv': HOUSE_VARULV_PORTRAITS['tyr-varulv'],
  'dagmar-skjegg': HOUSE_VARULV_PORTRAITS['dagmar-skjegg'],
  'skadi-varulv': HOUSE_VARULV_PORTRAITS['skadi-varulv']
});
