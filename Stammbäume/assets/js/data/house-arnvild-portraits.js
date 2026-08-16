import { HOUSE_FEUERHAAR_PORTRAITS } from './house-feuerhaar-portraits.js';
import { HOUSE_GRAUMAHNE_PORTRAITS } from './house-graumahne-portraits.js';
import { HOUSE_HELGR_PORTRAITS } from './house-helgr-portraits.js';
import { HOUSE_RAGNULF_PORTRAITS } from './house-ragnulf-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-arnvild';

export const HOUSE_ARNVILD_LOCAL_PORTRAIT_FILES = Object.freeze({
  'kodlak-arnvild': 'kodlak-arnvild.png',
  'lifthrasir-arnvild': 'lifthrasir-arnvild.png',
  'vefrun-arnvild': 'vefrun-arnvild.png',
  'ljotulf-arnvild': 'ljotulf-arnvild.png',
  'stigandr-arnvild': 'stigandr-arnvild.png',
  'magnus-arnvild': 'magnus-arnvild.png',
  'unnarr-arnvild': 'unnarr-arnvild.png',
  'poltar-arnvild': 'poltar-arnvild.png',
  'haki-arnvild': 'haki-arnvild.png',
  'carn-arnvild': 'carn-arnvild.png'
});

export const HOUSE_ARNVILD_PORTRAIT_SOURCES = Object.freeze({
  'kodlak-arnvild': 'https://i.imgur.com/S5HzYs4.png',
  'lifthrasir-arnvild': 'https://i.imgur.com/3Zitg54.png',
  'vefrun-arnvild': 'https://i.imgur.com/hiB5YXd.png',
  'ljotulf-arnvild': 'https://i.imgur.com/dHUXiw0.png',
  'stigandr-arnvild': 'https://i.imgur.com/jdE1FtD.png',
  'magnus-arnvild': 'https://i.imgur.com/8F4xhG8.png',
  'unnarr-arnvild': 'https://i.imgur.com/aDCq4fz.png',
  'poltar-arnvild': 'https://i.imgur.com/hXg9BsI.png',
  'haki-arnvild': 'https://i.imgur.com/piosc2y.png',
  'carn-arnvild': 'https://i.imgur.com/VDlIYU3.png'
});

const LOCAL_PORTRAITS = Object.freeze(Object.fromEntries(
  Object.entries(HOUSE_ARNVILD_LOCAL_PORTRAIT_FILES).map(([personId, fileName]) => [
    personId,
    `${PORTRAIT_ROOT}/${fileName}`
  ])
));

export const HOUSE_ARNVILD_PORTRAITS = Object.freeze({
  ...LOCAL_PORTRAITS,
  'sigtrygg-arnvild': HOUSE_FEUERHAAR_PORTRAITS['sigtrygg-arnvild'],
  'thorlak-graumahne': HOUSE_GRAUMAHNE_PORTRAITS['thorlak-graumahne'],
  'leinkir-graumahne': HOUSE_GRAUMAHNE_PORTRAITS['leinkir-graumahne'],
  'arvid-helgr': HOUSE_HELGR_PORTRAITS['arvid-helgr'],
  'vorn-arnvild': HOUSE_HELGR_PORTRAITS['vorn-arnvild'],
  'orka-arnvild': HOUSE_HELGR_PORTRAITS['orka-arnvild'],
  'ithmar-helgr': HOUSE_HELGR_PORTRAITS['ithmar-helgr'],
  'einarr-ragnulf': HOUSE_RAGNULF_PORTRAITS['einarr-ragnulf']
});
