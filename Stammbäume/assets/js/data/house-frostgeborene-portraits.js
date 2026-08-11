import { HOUSE_KAMPFGEBORENE_PORTRAITS } from './house-kampfgeborene-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-frostgeborene';

export const HOUSE_FROSTGEBORENE_LOCAL_PORTRAIT_FILES = Object.freeze({
  'eirik-frostgeborene': 'eirik-frostgeborene.png',
  'hallvard-frostgeborene': 'hallvard-frostgeborene.png',
  'bjorn-frostgeborene': 'bjorn-frostgeborene.png',
  'tormod-frostgeborene': 'tormod-frostgeborene.png',
  gwelda: 'gwelda.png',
  gudrun: 'gudrun.png',
  'yrsa-frostgeborene': 'yrsa-frostgeborene.png',
  'estridd-frostgeborene': 'estridd-frostgeborene.png',
  'kjalt-frostgeborene': 'kjalt-frostgeborene.png',
  'hjalti-frostgeborene': 'hjalti-frostgeborene.png',
  'sjoring-frostgeborene': 'sjoring-frostgeborene.png'
});

export const HOUSE_FROSTGEBORENE_PORTRAIT_SOURCES = Object.freeze({
  'eirik-frostgeborene': 'https://i.imgur.com/gqq4V3S.png',
  'hallvard-frostgeborene': 'https://i.imgur.com/EMUSCmi.png',
  'bjorn-frostgeborene': 'https://i.imgur.com/9VRmvFf.png',
  'tormod-frostgeborene': 'https://i.imgur.com/cItIzom.png',
  gwelda: 'https://i.imgur.com/Ydrv62m.png',
  gudrun: 'https://i.imgur.com/95AS2Sf.png',
  'yrsa-frostgeborene': 'https://i.imgur.com/oaS0nrB.png',
  'estridd-frostgeborene': 'https://i.imgur.com/I9WSGg1.png',
  'kjalt-frostgeborene': 'https://i.imgur.com/Bv5ehEQ.png',
  'hjalti-frostgeborene': 'https://i.imgur.com/LbCNSJQ.png',
  'sjoring-frostgeborene': 'https://i.imgur.com/OgVSL3h.png'
});

export const HOUSE_FROSTGEBORENE_PORTRAITS = Object.freeze({
  ...Object.fromEntries(Object.entries(HOUSE_FROSTGEBORENE_LOCAL_PORTRAIT_FILES).map(([personId, fileName]) => [
    personId,
    `${PORTRAIT_ROOT}/${fileName}`
  ])),
  'jokul-kampfgeborene': HOUSE_KAMPFGEBORENE_PORTRAITS['jokul-kampfgeborene'],
  'thorim-frostgeborene': HOUSE_KAMPFGEBORENE_PORTRAITS['thorim-frostgeborene']
});
