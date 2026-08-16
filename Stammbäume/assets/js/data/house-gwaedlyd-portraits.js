import { HOUSE_BLODYN_PORTRAITS } from './house-blodyn-portraits.js';
import { HOUSE_COEDWIG_PORTRAITS } from './house-coedwig-portraits.js';
import { HOUSE_DRAENOG_PORTRAITS } from './house-draenog-portraits.js';
import { HOUSE_MORFIL_PORTRAITS } from './house-morfil-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-gwaedlyd';

export const HOUSE_GWAEDLYD_LOCAL_PORTRAIT_FILES = Object.freeze({
  'agravaine-gwaedlyd': 'agravaine-gwaedlyd.png',
  'ywain-gwaedlyd': 'ywain-gwaedlyd.png',
  'merfyn-gwaedlyd': 'merfyn-gwaedlyd.png',
  'cawrdaf-gwaedlyd': 'cawrdaf-gwaedlyd.png',
  'cadwgawn-gwaedlyd': 'cadwgawn-gwaedlyd.png',
  'arianrhod-gwaedlyd': 'arianrhod-gwaedlyd.png',
  'bedros-gwaedlyd': 'bedros-gwaedlyd.png',
  'blodeuyn-gwenyen': 'blodeuyn-gwenyen.png',
  'luc-arfordir': 'luc-arfordir.png',
  'morcant-gwaedlyd': 'morcant-gwaedlyd.png',
  'iltud-gwaedlyd': 'iltud-gwaedlyd.png',
  'uryen-gwaedlyd': 'uryen-gwaedlyd.png',
  'tryffin-diafol': 'tryffin-diafol.jpg',
  'gwenifer-morgryn': 'gwenifer-morgryn.png',
  'frewi-llyfant': 'frewi-llyfant.png',
  'talan-gwaedlyd': 'talan-gwaedlyd.png',
  'tud-gwaedlyd': 'tud-gwaedlyd.png',
  'tref-gwaedlyd': 'tref-gwaedlyd.png',
  'alys-gwaedlyd': 'alys-gwaedlyd.png',
  'rhondda-gwaedlyd': 'rhondda-gwaedlyd.png',
  'twm-gwaedlyd': 'twm-gwaedlyd.png',
  'tre-gwaedlyd': 'tre-gwaedlyd.png'
});

export const HOUSE_GWAEDLYD_PORTRAIT_SOURCES = Object.freeze({
  'agravaine-gwaedlyd': 'https://i.imgur.com/eaRQ3JX.png',
  'ywain-gwaedlyd': 'https://i.imgur.com/NDOJNUB.png',
  'merfyn-gwaedlyd': 'https://i.imgur.com/OaroJlj.png',
  'cawrdaf-gwaedlyd': 'https://i.imgur.com/04kQQ4T.png',
  'cadwgawn-gwaedlyd': 'https://i.imgur.com/u66ooJP.png',
  'arianrhod-gwaedlyd': 'https://i.imgur.com/CrpVaDy.png',
  'bedros-gwaedlyd': 'https://i.imgur.com/ie9Ejqv.png',
  'blodeuyn-gwenyen': 'https://i.imgur.com/p4i4C4J.png',
  'luc-arfordir': 'https://i.imgur.com/XH1MVkM.png',
  'morcant-gwaedlyd': 'https://i.imgur.com/1M0phXh.png',
  'iltud-gwaedlyd': 'https://i.imgur.com/V3n8WTo.png',
  'uryen-gwaedlyd': 'https://i.imgur.com/D3l8yYx.png',
  'tryffin-diafol': 'https://64.media.tumblr.com/f22a3be79a54100aeec820130f7e8382/3a5a17e893e39a75-ba/s250x400/8be4477c0cd6f19eafd9213d643d45ed5c50bc10.pnj',
  'gwenifer-morgryn': 'https://i.imgur.com/1nBMamf.png',
  'frewi-llyfant': 'https://i.imgur.com/MGU8jlz.png',
  'talan-gwaedlyd': 'https://i.imgur.com/356asPD.png',
  'tud-gwaedlyd': 'https://i.imgur.com/QcfzFzy.png',
  'tref-gwaedlyd': 'https://i.imgur.com/YyabtuO.png',
  'alys-gwaedlyd': 'https://i.imgur.com/zVCBBTL.png',
  'rhondda-gwaedlyd': 'https://i.imgur.com/FCizdGV.png',
  'twm-gwaedlyd': 'https://i.imgur.com/b1At2aq.png',
  'tre-gwaedlyd': 'https://i.imgur.com/avu0pHv.png'
});

const LOCAL_PORTRAITS = Object.freeze(Object.fromEntries(
  Object.entries(HOUSE_GWAEDLYD_LOCAL_PORTRAIT_FILES).map(([personId, fileName]) => [
    personId,
    `${PORTRAIT_ROOT}/${fileName}`
  ])
));

// Bereits ausgearbeitete Gegenakten bleiben für gemeinsame Weltpersonen die
// kanonische Bildquelle. Wiederholte Standardsilhouetten der Altquelle werden
// nicht als individuelle Porträts importiert.
export const HOUSE_GWAEDLYD_PORTRAITS = Object.freeze({
  ...LOCAL_PORTRAITS,
  'bethwyn-trachwyll': 'assets/images/portraits/haus-trachwyll/bethwyn-trachwyll.jpg',
  'tathal-blodyn': HOUSE_BLODYN_PORTRAITS['tathal-blodyn'],
  'gronw-gwaedlyd': HOUSE_MORFIL_PORTRAITS['gronw-gwaedlyd'],
  'caraf-morfil': HOUSE_MORFIL_PORTRAITS['caraf-morfil'],
  'uthyr-gwaedlyd': HOUSE_DRAENOG_PORTRAITS['uthyr-gwaedlyd'],
  'briallen-draenog': HOUSE_DRAENOG_PORTRAITS['briallen-draenog'],
  'zara-coedwig': HOUSE_COEDWIG_PORTRAITS['zara-coedwig']
});
