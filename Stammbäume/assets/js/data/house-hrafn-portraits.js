import { HOUSE_GRAUMAHNE_PORTRAITS } from './house-graumahne-portraits.js';
import { HOUSE_HELGR_PORTRAITS } from './house-helgr-portraits.js';
import { HOUSE_RAGNULF_PORTRAITS } from './house-ragnulf-portraits.js';
import { HOUSE_SKOGG_PORTRAITS } from './house-skogg-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-hrafn';

export const HOUSE_HRAFN_LOCAL_PORTRAIT_FILES = Object.freeze({
  'raleif-hrafn': 'raleif-hrafn.png',
  'eirunn-hrafn': 'eirunn-hrafn.png',
  'haraldur-hrafn': 'haraldur-hrafn.png',
  'reyka-hrafn': 'reyka-hrafn.png',
  'ketilbjorn-hrafn': 'ketilbjorn-hrafn.png',
  'roald-hrafn': 'roald-hrafn.png',
  'geira-hrafn': 'geira-hrafn.png',
  'nokkvi-hrafn': 'nokkvi-hrafn.png',
  'asta-hrafn': 'asta-hrafn.png'
});

export const HOUSE_HRAFN_PORTRAIT_SOURCES = Object.freeze({
  'raleif-hrafn': 'https://i.imgur.com/R4pd9yN.png',
  'eirunn-hrafn': 'https://i.imgur.com/VzBzv0v.png',
  'haraldur-hrafn': 'https://i.imgur.com/fSVr4gC.png',
  'reyka-hrafn': 'https://i.imgur.com/vLdjMT7.png',
  'ketilbjorn-hrafn': 'https://i.imgur.com/L05GQNu.png',
  'roald-hrafn': 'https://i.imgur.com/FOFAWo0.png',
  'geira-hrafn': 'https://i.imgur.com/fVbGh5r.png',
  'nokkvi-hrafn': 'https://i.imgur.com/pPDor3q.png',
  'asta-hrafn': 'https://i.imgur.com/kAj2NK9.png'
});

const LOCAL_PORTRAITS = Object.freeze(Object.fromEntries(
  Object.entries(HOUSE_HRAFN_LOCAL_PORTRAIT_FILES).map(([personId, fileName]) => [
    personId,
    `${PORTRAIT_ROOT}/${fileName}`
  ])
));

export const HOUSE_HRAFN_PORTRAITS = Object.freeze({
  ...LOCAL_PORTRAITS,
  'morkur-eisenbieger': 'assets/images/portraits/haus-eisenbieger/morkur-eisenbieger.png',
  'hakon-hrafn': HOUSE_RAGNULF_PORTRAITS['hakon-hrafn'],
  'gudrid-1630-ragnulf': HOUSE_RAGNULF_PORTRAITS['gudrid-1630-ragnulf'],
  'osvald-hrafn': HOUSE_HELGR_PORTRAITS['osvald-hrafn'],
  'leikny-helgr': HOUSE_HELGR_PORTRAITS['leikny-helgr'],
  'reginleif-hrafn': HOUSE_SKOGG_PORTRAITS['reginleif-hrafn'],
  'skirnir-skogg': HOUSE_SKOGG_PORTRAITS['skirnir-skogg'],
  'rognstein-hrafn': HOUSE_RAGNULF_PORTRAITS['rognstein-hrafn'],
  'hervor-ragnulf': HOUSE_RAGNULF_PORTRAITS['hervor-ragnulf'],
  'freyglod-hrafn': HOUSE_GRAUMAHNE_PORTRAITS['freyglod-hrafn'],
  'unndis-graumahne': HOUSE_GRAUMAHNE_PORTRAITS['unndis-graumahne']
});
