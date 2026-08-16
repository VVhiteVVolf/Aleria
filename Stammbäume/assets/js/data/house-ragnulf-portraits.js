import { HOUSE_SKALD_PORTRAITS } from './house-skald-portraits.js';
import { HOUSE_SKOGG_PORTRAITS } from './house-skogg-portraits.js';
import { HOUSE_VARULV_PORTRAITS } from './house-varulv-portraits.js';
import { HOUSE_WARGH_PORTRAITS } from './house-wargh-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-ragnulf';

export const HOUSE_RAGNULF_LOCAL_PORTRAIT_FILES = Object.freeze({
  'freki-ragnulf': 'freki-ragnulf.png',
  'thorkel-ancient-ragnulf': 'thorkel-ancient-ragnulf.png',
  'balgruuf-vaeren': 'balgruuf-vaeren.png',
  'einarr-ragnulf': 'einarr-ragnulf.png',
  'egil-ragnulf': 'egil-ragnulf.png',
  'raveld-blutstahl': 'raveld-blutstahl.png',
  'bergtor-ragnulf': 'bergtor-ragnulf.png',
  'ketill-ragnulf': 'ketill-ragnulf.png',
  'hoskuld-ragnulf': 'hoskuld-ragnulf.png',
  'eldgrim-ragnulf': 'eldgrim-ragnulf.png',
  'oddvar-ragnulf': 'oddvar-ragnulf.png',
  'araldr-vragi': 'araldr-vragi.png',
  'hakon-hrafn': 'hakon-hrafn.png',
  'throst-ragnulf': 'throst-ragnulf.png',
  'thorkel-1654-ragnulf': 'thorkel-1654-ragnulf.png',
  'torleif-ragnulf': 'torleif-ragnulf.png',
  'torstein-ragnulf': 'torstein-ragnulf.png',
  'thorald-ragnulf': 'thorald-ragnulf.png',
  'hervor-ragnulf': 'hervor-ragnulf.png',
  'gersemi-ragnulf': 'gersemi-ragnulf.png',
  'thrain-ragnulf': 'thrain-ragnulf.png',
  'rognstein-hrafn': 'rognstein-hrafn.png',
  'gunnvald-todbrand': 'gunnvald-todbrand.png',
  'asfrid-helgr': 'asfrid-helgr.png',
  'gulvar-ragnulf': 'gulvar-ragnulf.png',
  'gudrun-ragnulf': 'gudrun-ragnulf.png',
  'erna-ragnulf': 'erna-ragnulf.png',
  'odvald-ragnulf': 'odvald-ragnulf.png',
  'eydis-vaeren': 'eydis-vaeren.png',
  'ingmund-varangr': 'ingmund-varangr.png',
  'jokul-graumahne': 'jokul-graumahne.png',
  'hildrun-schmetterschild': 'hildrun-schmetterschild.png',
  'bjolf-ragnulf': 'bjolf-ragnulf.png',
  'tinna-kummerherz': 'tinna-kummerherz.png',
  'astrid-ragnulf': 'astrid-ragnulf.png',
  'bjarte-ragnulf': 'bjarte-ragnulf.png',
  'katla-ragnulf': 'katla-ragnulf.png',
  'roff-ragnulf': 'roff-ragnulf.png'
});

const LOCAL_PORTRAITS = Object.freeze(Object.fromEntries(
  Object.entries(HOUSE_RAGNULF_LOCAL_PORTRAIT_FILES).map(([personId, fileName]) => [
    personId,
    `${PORTRAIT_ROOT}/${fileName}`
  ])
));

export const HOUSE_RAGNULF_PORTRAITS = Object.freeze({
  ...LOCAL_PORTRAITS,
  'svanhildr-varangr': 'assets/images/portraits/haus-varangr/svanhildr-varangr.png',
  'torger-varulv': HOUSE_VARULV_PORTRAITS['torger-varulv'],
  'gunnar-ragnulf': HOUSE_WARGH_PORTRAITS['gunnar-ragnulf'],
  'ranveig-wargh': HOUSE_WARGH_PORTRAITS['ranveig-wargh'],
  'bjoern-skald': HOUSE_SKALD_PORTRAITS['bjoern-skald'],
  'gulda-ragnulf': HOUSE_SKALD_PORTRAITS['gulda-ragnulf'],
  'erik-ragnulf': HOUSE_SKOGG_PORTRAITS['erik-ragnulf']
});
