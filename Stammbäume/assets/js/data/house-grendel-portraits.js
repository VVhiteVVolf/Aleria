import { HOUSE_FEUERHAAR_PORTRAITS } from './house-feuerhaar-portraits.js';
import { HOUSE_FREIWINTER_PORTRAITS } from './house-freiwinter-portraits.js';
import { HOUSE_SCHWARZDORN_PORTRAITS } from './house-schwarzdorn-portraits.js';
import { HOUSE_SILBERZUNGE_PORTRAITS } from './house-silberzunge-portraits.js';
import { HOUSE_SKOGG_PORTRAITS } from './house-skogg-portraits.js';
import { HOUSE_STERKR_PORTRAITS } from './house-sterkr-portraits.js';
import { HOUSE_TRACHWYLL_PORTRAITS } from './house-trachwyll-portraits.js';
import { HOUSE_WARGH_PORTRAITS } from './house-wargh-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-grendel';

export const HOUSE_GRENDEL_LOCAL_PORTRAIT_FILES = Object.freeze({
  'leif-grendel': 'leif-grendel.png',
  'eirikr-grendel': 'eirikr-grendel.png',
  'halvard-grendel': 'halvard-grendel.png',
  'bagsecg-grendel': 'bagsecg-grendel.png',
  'vidar-grendel': 'vidar-grendel.png',
  'asgeir-grendel': 'asgeir-grendel.png',
  'hagar-grendel': 'hagar-grendel.png',
  'bjoern-grendel': 'bjoern-grendel.png',
  'hati-grendel-spouse': 'hati-grendel-spouse.png',
  'thorbrand-sturmgeborener': 'thorbrand-sturmgeborener.png',
  'thorvald-grendel': 'thorvald-grendel.jpeg',
  'karli-grendel': 'karli-grendel.png',
  'nott-grendel': 'nott-grendel.png',
  'hakon-grendel': 'hakon-grendel.png',
  'njord-frostauge': 'njord-frostauge.png',
  'troll-grendel-spouse': 'troll-grendel-spouse.png',
  'thord-grendel': 'thord-grendel.png',
  'ingolf-grendel': 'ingolf-grendel.png',
  'embla-grendel-spouse': 'embla-grendel-spouse.png',
  'vallgerd-grendel-spouse': 'vallgerd-grendel-spouse.png',
  'leif-1719-grendel': 'leif-1719-grendel.png',
  'gudrid-grendel': 'gudrid-grendel.png',
  'bjarni-grendel': 'bjarni-grendel.png',
  'isdis-grendel': 'isdis-grendel.png',
  'olaf-grendel': 'olaf-grendel.png',
  'katlin-grendel': 'katlin-grendel.png',
  'sten-grendel': 'sten-grendel.png',
  'kara-grendel': 'kara-grendel.jpeg'
});

export const HOUSE_GRENDEL_PORTRAIT_SOURCES = Object.freeze({
  'leif-grendel': 'https://i.imgur.com/aqKOeXt.png',
  'eirikr-grendel': 'https://i.imgur.com/AP1isoy.png',
  'halvard-grendel': 'https://i.imgur.com/2il8JqQ.png',
  'bagsecg-grendel': 'https://i.imgur.com/mp99dci.png',
  'vidar-grendel': 'https://i.imgur.com/hIBAzdH.png',
  'asgeir-grendel': 'https://i.imgur.com/i0HDA16.png',
  'hagar-grendel': 'https://i.imgur.com/PaJaBDA.png',
  'bjoern-grendel': 'https://i.imgur.com/xrj488A.png',
  'hati-grendel-spouse': 'https://i.imgur.com/pJ9vy87.png',
  'thorbrand-sturmgeborener': 'https://i.imgur.com/yhrPjq0.png',
  'thorvald-grendel': 'https://i.imgur.com/6JBpQz8.jpeg',
  'karli-grendel': 'https://i.imgur.com/ilkB3nK.png',
  'nott-grendel': 'https://i.imgur.com/LRTK5Jk.png',
  'hakon-grendel': 'https://i.imgur.com/6QX6hCP.png',
  'njord-frostauge': 'https://i.imgur.com/DfhFoDZ.png',
  'troll-grendel-spouse': 'https://i.postimg.cc/v8gPMdSG/image.png',
  'thord-grendel': 'https://i.imgur.com/9GI8iOI.png',
  'ingolf-grendel': 'https://i.imgur.com/MJ5hS2f.png',
  'embla-grendel-spouse': 'https://i.imgur.com/HHTxL3w.png',
  'vallgerd-grendel-spouse': 'https://i.imgur.com/y6pbI0f.png',
  'leif-1719-grendel': 'https://i.imgur.com/yVbsesj.png',
  'gudrid-grendel': 'https://i.imgur.com/BJjB8E8.png',
  'bjarni-grendel': 'https://i.imgur.com/EHDV0mN.png',
  'isdis-grendel': 'https://i.imgur.com/wyfcedL.png',
  'olaf-grendel': 'https://i.imgur.com/bbDWrak.png',
  'katlin-grendel': 'https://i.imgur.com/3WvMzMX.png',
  'sten-grendel': 'https://i.imgur.com/vyfeE2f.png',
  'kara-grendel': 'https://i.imgur.com/GtoRqgE.jpeg'
});

const LOCAL_PORTRAITS = Object.freeze(Object.fromEntries(
  Object.entries(HOUSE_GRENDEL_LOCAL_PORTRAIT_FILES).map(([personId, fileName]) => [
    personId,
    `${PORTRAIT_ROOT}/${fileName}`
  ])
));

export const HOUSE_GRENDEL_PORTRAITS = Object.freeze({
  ...LOCAL_PORTRAITS,
  'gunnar-grendel': HOUSE_WARGH_PORTRAITS['gunnar-grendel'],
  'hljotrun-wargh': HOUSE_WARGH_PORTRAITS['hljotrun-wargh'],
  'finnr-grindel': HOUSE_STERKR_PORTRAITS['finnr-grindel'],
  'austveig-sterkr': HOUSE_STERKR_PORTRAITS['austveig-sterkr'],
  'gunnvar-silberzunge': HOUSE_SILBERZUNGE_PORTRAITS['gunnvar-silberzunge'],
  'thorfinn-grendel': HOUSE_SKOGG_PORTRAITS['thorfinn-grendel'],
  'skadi-skogg': HOUSE_SKOGG_PORTRAITS['skadi-skogg'],
  'kolbein-grendel': HOUSE_WARGH_PORTRAITS['kolbein-grendel'],
  'solveig-wargh': HOUSE_WARGH_PORTRAITS['solveig-wargh'],
  'tormund-1643-schwarzdorn': HOUSE_SCHWARZDORN_PORTRAITS['tormund-1643-schwarzdorn'],
  'gwelda-grindel': HOUSE_FREIWINTER_PORTRAITS['gwelda-grindel'],
  'hjalmar-freiwinter': HOUSE_FREIWINTER_PORTRAITS['hjalmar-freiwinter'],
  'erik-grendel': HOUSE_FEUERHAAR_PORTRAITS['erik-grendel'],
  'fenya-feuerhaar': HOUSE_FEUERHAAR_PORTRAITS['fenya-feuerhaar'],
  'sigrid-grendel': HOUSE_SKOGG_PORTRAITS['sigrid-grendel'],
  'starkad-skogg': HOUSE_SKOGG_PORTRAITS['starkad-skogg'],
  'ingrid-grendel': HOUSE_TRACHWYLL_PORTRAITS['ingrid-grendel'],
  'gwilym-trachwyll': HOUSE_TRACHWYLL_PORTRAITS['gwilym-trachwyll']
});
