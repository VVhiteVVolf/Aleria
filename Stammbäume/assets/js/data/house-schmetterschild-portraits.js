import { HOUSE_COEDWIG_PORTRAITS } from './house-coedwig-portraits.js';
import { HOUSE_GRAUMAHNE_PORTRAITS } from './house-graumahne-portraits.js';
import { HOUSE_HELGR_PORTRAITS } from './house-helgr-portraits.js';
import { HOUSE_RAGNULF_PORTRAITS } from './house-ragnulf-portraits.js';
import { HOUSE_TODBRAND_PORTRAITS } from './house-todbrand-portraits.js';
import { HOUSE_WARGH_PORTRAITS } from './house-wargh-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-schmetterschild';

export const HOUSE_SCHMETTERSCHILD_LOCAL_PORTRAIT_FILES = Object.freeze({
  'hurin-schmetterschild': 'hurin-schmetterschild.png',
  'gunvald-schmetterschild': 'gunvald-schmetterschild.png',
  'sighvat-schmetterschild': 'sighvat-schmetterschild.png',
  'vemund-schattenherz': 'vemund-schattenherz.png',
  'lodinn-schmetterschild': 'lodinn-schmetterschild.png',
  'solmund-schmetterschild': 'solmund-schmetterschild.png',
  'thorarin-schmetterschild': 'thorarin-schmetterschild.png',
  'thengil-silberblut': 'thengil-silberblut.png',
  'sigurd-goldglanz': 'sigurd-goldglanz.png',
  'ormrun-schmetterschild': 'ormrun-schmetterschild.png',
  'thorodd-schmetterschild': 'thorodd-schmetterschild.png',
  'hafvard-schmetterschild': 'hafvard-schmetterschild.png',
  'ingolf-schmetterschild': 'ingolf-schmetterschild.png',
  'tryggvi-kummerherz': 'tryggvi-kummerherz.png',
  'sigmunda-schmetterschild': 'sigmunda-schmetterschild.png',
  'valtyr-schmetterschild': 'valtyr-schmetterschild.png',
  'kolgrimm-schmetterschild': 'kolgrimm-schmetterschild.png',
  'saedis-schmetterschild-ward': 'saedis-schmetterschild-ward.png',
  'kjallak-goldglanz': 'kjallak-goldglanz.png',
  'armod-schmetterschild': 'armod-schmetterschild.png',
  'idunn-schmetterschild': 'idunn-schmetterschild.png',
  'ivarr-schmetterschild': 'ivarr-schmetterschild.png',
  'lif-schmetterschild': 'lif-schmetterschild.png',
  'helga-schmetterschild-bastard': 'helga-schmetterschild-bastard.png',
  'knut-schmetterschild-bastard': 'knut-schmetterschild-bastard.png'
});

export const HOUSE_SCHMETTERSCHILD_PORTRAIT_SOURCES = Object.freeze({
  'hurin-schmetterschild': 'https://i.imgur.com/RaH1NkV.png',
  'gunvald-schmetterschild': 'https://i.imgur.com/5JoU1k3.png',
  'sighvat-schmetterschild': 'https://i.imgur.com/fzZ0FR6.png',
  'vemund-schattenherz': 'https://i.imgur.com/FcDK9fs.png',
  'lodinn-schmetterschild': 'https://i.imgur.com/V90SUJc.png',
  'solmund-schmetterschild': 'https://i.imgur.com/LPgKle8.png',
  'thorarin-schmetterschild': 'https://i.imgur.com/cK0UWX7.png',
  'thengil-silberblut': 'https://i.imgur.com/iFixVA8.png',
  'sigurd-goldglanz': 'https://i.imgur.com/9KJRPw9.png',
  'ormrun-schmetterschild': 'https://i.imgur.com/77mf57y.png',
  'thorodd-schmetterschild': 'https://i.imgur.com/poVxS6f.png',
  'hafvard-schmetterschild': 'https://i.imgur.com/aDArZyt.png',
  'ingolf-schmetterschild': 'https://i.imgur.com/Qtb04Oz.png',
  'tryggvi-kummerherz': 'https://i.imgur.com/M7xSQs1.png',
  'sigmunda-schmetterschild': 'https://i.imgur.com/XSimwHp.png',
  'valtyr-schmetterschild': 'https://i.imgur.com/W1SPz1K.png',
  'kolgrimm-schmetterschild': 'https://i.imgur.com/9RXeaAk.png',
  'saedis-schmetterschild-ward': 'https://i.imgur.com/l9nXGIc.png',
  'kjallak-goldglanz': 'https://i.imgur.com/gbGbNl3.png',
  'armod-schmetterschild': 'https://i.imgur.com/3U0xlF8.png',
  'idunn-schmetterschild': 'https://i.imgur.com/HlB7m8y.png',
  'ivarr-schmetterschild': 'https://i.imgur.com/yvPGJY3.png',
  'lif-schmetterschild': 'https://i.imgur.com/okFJI7g.png',
  'helga-schmetterschild-bastard': 'https://i.imgur.com/mJF4mwK.png',
  'knut-schmetterschild-bastard': 'https://i.imgur.com/h0urDch.png'
});

const LOCAL_PORTRAITS = Object.freeze(Object.fromEntries(
  Object.entries(HOUSE_SCHMETTERSCHILD_LOCAL_PORTRAIT_FILES).map(([personId, fileName]) => [
    personId,
    `${PORTRAIT_ROOT}/${fileName}`
  ])
));

export const HOUSE_SCHMETTERSCHILD_PORTRAITS = Object.freeze({
  ...LOCAL_PORTRAITS,
  'yrsvard-helgr': HOUSE_HELGR_PORTRAITS['yrsvard-helgr'],
  'hakon-schmetterschild': HOUSE_WARGH_PORTRAITS['hakon-schmetterschild'],
  'lodvar-todbrand': HOUSE_TODBRAND_PORTRAITS['lodvar-todbrand'],
  'sigvard-schmetterschild': HOUSE_GRAUMAHNE_PORTRAITS['sigvard-schmetterschild'],
  'hafgrim-schmetterschild': HOUSE_GRAUMAHNE_PORTRAITS['hafgrim-schmetterschild'],
  'viglund-graumahne': HOUSE_GRAUMAHNE_PORTRAITS['viglund-graumahne'],
  'skjoldulf-schmetterschild': HOUSE_HELGR_PORTRAITS['skjoldulf-schmetterschild'],
  'alfrun-helgr': HOUSE_HELGR_PORTRAITS['alfrun-helgr'],
  'magnus-schmetterschild': HOUSE_TODBRAND_PORTRAITS['magnus-schmetterschild'],
  'hlokk-todbrand': HOUSE_TODBRAND_PORTRAITS['hlokk-todbrand'],
  'odvald-ragnulf': HOUSE_RAGNULF_PORTRAITS['odvald-ragnulf'],
  'hildrun-schmetterschild': HOUSE_RAGNULF_PORTRAITS['hildrun-schmetterschild'],
  'rhodri-coedwig': HOUSE_COEDWIG_PORTRAITS['rhodri-coedwig'],
  'glaumur-schmetterschild': HOUSE_GRAUMAHNE_PORTRAITS['glaumur-schmetterschild'],
  'jofrid-graumahne': HOUSE_GRAUMAHNE_PORTRAITS['jofrid-graumahne']
});
