import { HOUSE_BRATHFENGR_PORTRAITS } from './house-brathfengr-portraits.js';
import { HOUSE_CEIRWYN_PORTRAITS } from './house-ceirwyn-portraits.js';
import { HOUSE_FREIWINTER_PORTRAITS } from './house-freiwinter-portraits.js';
import { HOUSE_SCHWARZDORN_PORTRAITS } from './house-schwarzdorn-portraits.js';
import { HOUSE_SKAAL_PORTRAITS } from './house-skaal-portraits.js';
import { HOUSE_VARULV_PORTRAITS } from './house-varulv-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-sterkr';

export const HOUSE_STERKR_LOCAL_PORTRAIT_FILES = Object.freeze({
  'aegir-sterkr-founder': 'aegir-sterkr-founder.png',
  'ubbe-sterkr': 'ubbe-sterkr.png',
  'ragnor-skald': 'ragnor-skald.png',
  'einarr-1614-sterkr': 'einarr-1614-sterkr.png',
  'finnr-grindel': 'finnr-grindel.png',
  'skjalg-sterkr': 'skjalg-sterkr.png',
  'skadi-sterkr': 'skadi-sterkr.png',
  'hafstein-sterkr': 'hafstein-sterkr.png',
  'langarr-soekeren': 'langarr-soekeren.png',
  'heremod-sterkr': 'heremod-sterkr.png',
  'vidkunn-sterkr': 'vidkunn-sterkr.png',
  'holmdis-kummerherz': 'holmdis-kummerherz.png',
  'hrosskell-sterkr': 'hrosskell-sterkr.png',
  'ljotunn-sterkr': 'ljotunn-sterkr.png',
  'helmskald-graumahne': 'helmskald-graumahne.png',
  'linnea-sterkr': 'linnea-sterkr.png',
  'galmar-skald': 'galmar-skald.png',
  'stun-sterkr': 'stun-sterkr.png',
  'estrid-sterkr': 'estrid-sterkr.png',
  'thyra-sterkr': 'thyra-sterkr.png',
  'armod-sterkr': 'armod-sterkr.png',
  'fjola-sterkr': 'fjola-sterkr.png',
  'thengil-sterkr': 'thengil-sterkr.png',
  'alarik-sterkr': 'alarik-sterkr.png',
  'signy-sterkr': 'signy-sterkr.png'
});

export const HOUSE_STERKR_PORTRAIT_SOURCES = Object.freeze({
  'aegir-sterkr-founder': 'https://i.postimg.cc/7Y73C1yg/image.png',
  'ubbe-sterkr': 'https://i.postimg.cc/c4JgQQYg/image.png',
  'ragnor-skald': 'https://i.imgur.com/bly25tm.png',
  'einarr-1614-sterkr': 'https://i.postimg.cc/76Btb3Sw-/image.png',
  'finnr-grindel': 'https://i.imgur.com/gBFyKLd.png',
  'skjalg-sterkr': 'https://i.postimg.cc/sX51gx5w/image.png',
  'skadi-sterkr': 'https://i.postimg.cc/Vv6qrX4J/image.png',
  'hafstein-sterkr': 'https://i.postimg.cc/bN7MQvnx/image.png',
  'langarr-soekeren': 'https://i.imgur.com/aDuyWlK.png',
  'heremod-sterkr': 'https://i.postimg.cc/FsT53vZg/image.png',
  'vidkunn-sterkr': 'https://i.postimg.cc/X73wMS9h/image.png',
  'holmdis-kummerherz': 'https://i.imgur.com/51CghpL.png',
  'hrosskell-sterkr': 'https://i.postimg.cc/JnzJv1bJ/image.png',
  'ljotunn-sterkr': 'https://i.postimg.cc/ZqM7wDNt/image.png',
  'helmskald-graumahne': 'https://i.postimg.cc/QxpyQ7MN/image.png',
  'linnea-sterkr': 'https://i.postimg.cc/bY7QmfFH/image.png',
  'galmar-skald': 'https://i.imgur.com/m6MZrPR.png',
  'stun-sterkr': 'https://i.postimg.cc/1RdZTJG1/image.png',
  'estrid-sterkr': 'https://i.postimg.cc/NGZRMv65/image.png',
  'thyra-sterkr': 'https://i.postimg.cc/ZY94c117/image.png',
  'armod-sterkr': 'https://i.postimg.cc/vmFrSLKM/656a1c5e-5205-460e-81f0-b98e410c4a15.png',
  'fjola-sterkr': 'https://i.postimg.cc/d31rTWh7/b28863d2-05a0-4b18-af9f-5675c66480d1.png',
  'thengil-sterkr': 'https://i.postimg.cc/zvcWwnht/2fe4cdf1-16be-44d9-86cb-5046ab417652.png',
  'alarik-sterkr': 'https://i.postimg.cc/2jc4fftd/046c19b1-6513-4d11-a45e-e58081c62c31.png',
  'signy-sterkr': 'https://i.postimg.cc/J4sjr2wg/fa9362c5-90e1-4903-9fde-585137e7e3e1.png'
});

const LOCAL_PORTRAITS = Object.freeze(Object.fromEntries(
  Object.entries(HOUSE_STERKR_LOCAL_PORTRAIT_FILES).map(([personId, fileName]) => [
    personId,
    `${PORTRAIT_ROOT}/${fileName}`
  ])
));

// Bereits ausgearbeitete Gegenakten bleiben die kanonische Bildquelle für
// dieselbe Weltperson. Die wiederholt verwendete schwarze Standardsilhouette
// der Altquelle ist kein individuelles Portrait und wird nicht kopiert.
export const HOUSE_STERKR_PORTRAITS = Object.freeze({
  ...LOCAL_PORTRAITS,
  'var-skald': 'assets/images/portraits/haus-skald/var-skald.png',
  'ragnfred-sterkr': HOUSE_BRATHFENGR_PORTRAITS['ragnfred-sterkr'],
  'gorsedd-ceirwyn': HOUSE_CEIRWYN_PORTRAITS['gorsedd-ceirwyn'],
  'einarr-sterkr': HOUSE_VARULV_PORTRAITS['einarr-sterkr'],
  'erla-varulv': HOUSE_VARULV_PORTRAITS['erla-varulv'],
  'astrid-sterkr': HOUSE_CEIRWYN_PORTRAITS['astrid-sterkr'],
  'morgan-ceirwyn': HOUSE_CEIRWYN_PORTRAITS['morgan-ceirwyn'],
  'thrand-skaal': HOUSE_SKAAL_PORTRAITS['thrand-skaal'],
  'torger-schwarzdorn': HOUSE_SCHWARZDORN_PORTRAITS['torger-schwarzdorn'],
  'rognvaldr-sterkr': HOUSE_BRATHFENGR_PORTRAITS['rognvaldr-sterkr'],
  'isbjalla-1696-brathfengr': HOUSE_BRATHFENGR_PORTRAITS['isbjalla-1696-brathfengr'],
  'revna-sterkr': HOUSE_FREIWINTER_PORTRAITS['revna-sterkr'],
  'erling-freiwinter': HOUSE_FREIWINTER_PORTRAITS['erling-freiwinter']
});
