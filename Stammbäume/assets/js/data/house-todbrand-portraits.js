import { HOUSE_BRATHFENGR_PORTRAITS } from './house-brathfengr-portraits.js';
import { HOUSE_HELGR_PORTRAITS } from './house-helgr-portraits.js';
import { HOUSE_RAGNULF_PORTRAITS } from './house-ragnulf-portraits.js';
import { HOUSE_WARGH_PORTRAITS } from './house-wargh-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-todbrand';

export const HOUSE_TODBRAND_LOCAL_PORTRAIT_FILES = Object.freeze({
  'nordal-todbrand': 'nordal-todbrand.png',
  'ulfhedin-todbrand': 'ulfhedin-todbrand.png',
  'eyjolf-graumahne': 'eyjolf-graumahne.png',
  'lodvar-todbrand': 'lodvar-todbrand.png',
  'taran-todbrand': 'taran-todbrand.png',
  'kveldulf-todbrand': 'kveldulf-todbrand.png',
  'radulfr-blutstahl': 'radulfr-blutstahl.png',
  'oddgeir-todbrand': 'oddgeir-todbrand.png',
  'audun-todbrand': 'audun-todbrand.png',
  'yvain-gwenyen-ogwych': 'yvain-gwenyen-ogwych.png',
  'gwindor-1625-bochdew': 'gwindor-1625-bochdew.png',
  'munthor-todbrand': 'munthor-todbrand.png',
  'einhild-todbrand': 'einhild-todbrand.png',
  'finnbar-fiantorc': 'finnbar-fiantorc.png',
  'calthar-todbrand': 'calthar-todbrand.png',
  'hlokk-todbrand': 'hlokk-todbrand.png',
  'froya-kummerherz': 'froya-kummerherz.png',
  'magnus-schmetterschild': 'magnus-schmetterschild.png',
  'andor-todbrand': 'andor-todbrand.png',
  'parnilla-todbrand': 'parnilla-todbrand.png',
  'frode-todbrand': 'frode-todbrand.png',
  'idmar-todbrand': 'idmar-todbrand.png',
  'norlind-todbrand': 'norlind-todbrand.png',
  'silja-todbrand': 'silja-todbrand.png'
});

export const HOUSE_TODBRAND_PORTRAIT_SOURCES = Object.freeze({
  'nordal-todbrand': 'https://i.imgur.com/YbSjQnV.png',
  'ulfhedin-todbrand': 'https://i.imgur.com/YrdxTG9.png',
  'eyjolf-graumahne': 'https://i.postimg.cc/13H8kvvt/image.png',
  'lodvar-todbrand': 'https://i.imgur.com/C0CSncB.png',
  'taran-todbrand': 'https://i.imgur.com/gHb2rxL.png',
  'kveldulf-todbrand': 'https://i.imgur.com/iW0adiC.png',
  'radulfr-blutstahl': 'https://i.imgur.com/hvT8409.png',
  'oddgeir-todbrand': 'https://i.imgur.com/kwlLsb9.png',
  'audun-todbrand': 'https://i.imgur.com/fefU0lT.png',
  'yvain-gwenyen-ogwych': 'https://i.imgur.com/GvFr7Vv.png',
  'gwindor-1625-bochdew': 'https://i.imgur.com/IvNZXoe.png',
  'munthor-todbrand': 'https://i.imgur.com/O6TWzlL.png',
  'einhild-todbrand': 'https://i.imgur.com/Otiwbpt.png',
  'finnbar-fiantorc': 'https://64.media.tumblr.com/19e12e1bf73bef21691802f7cb5ce76c/a586b45f9137e870-aa/s250x400/5a6a43cc9546e6c50b511c1e80c7894c99c32825.pnj',
  'calthar-todbrand': 'https://i.imgur.com/AYElTQ2.png',
  'hlokk-todbrand': 'https://i.imgur.com/hYBXdu0.png',
  'froya-kummerherz': 'https://i.imgur.com/Ny3W0OW.png',
  'magnus-schmetterschild': 'https://i.imgur.com/D5xr7NX.png',
  'andor-todbrand': 'https://i.imgur.com/gPpOENM.png',
  'parnilla-todbrand': 'https://i.imgur.com/aqDdyYf.png',
  'frode-todbrand': 'https://i.imgur.com/evD75Uj.png',
  'idmar-todbrand': 'https://i.imgur.com/iFP3uRW.png',
  'norlind-todbrand': 'https://i.imgur.com/Ijj7pZ0.png',
  'silja-todbrand': 'https://i.imgur.com/2QONaKT.png'
});

const LOCAL_PORTRAITS = Object.freeze(Object.fromEntries(
  Object.entries(HOUSE_TODBRAND_LOCAL_PORTRAIT_FILES).map(([personId, fileName]) => [
    personId,
    `${PORTRAIT_ROOT}/${fileName}`
  ])
));

export const HOUSE_TODBRAND_PORTRAITS = Object.freeze({
  ...LOCAL_PORTRAITS,
  'sigurd-brathfengr': HOUSE_BRATHFENGR_PORTRAITS['sigurd-brathfengr'],
  'gunnvald-todbrand': HOUSE_RAGNULF_PORTRAITS['gunnvald-todbrand'],
  'gersemi-ragnulf': HOUSE_RAGNULF_PORTRAITS['gersemi-ragnulf'],
  'agnar-wargh': HOUSE_WARGH_PORTRAITS['agnar-wargh'],
  'ormrun-todbrand': HOUSE_WARGH_PORTRAITS['ormrun-todbrand'],
  'birta-helgr': HOUSE_HELGR_PORTRAITS['birta-helgr'],
  'gudbrand-todbrand': HOUSE_HELGR_PORTRAITS['gudbrand-todbrand']
});
