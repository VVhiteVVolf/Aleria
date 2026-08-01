import { HOUSE_ARTH_PORTRAITS } from './house-arth-portraits.js';
import { HOUSE_BRITHYLL_PORTRAITS } from './house-brithyll-portraits.js';
import { HOUSE_COEDWIG_PORTRAITS } from './house-coedwig-portraits.js';
import { HOUSE_CREYR_PORTRAITS } from './house-creyr-portraits.js';
import { HOUSE_DYNGWN_PORTRAITS } from './house-dyngwn-portraits.js';
import { HOUSE_GWIALEN_PORTRAITS } from './house-gwialen-portraits.js';
import { HOUSE_PYSGOD_PORTRAITS } from './house-pysgod-portraits.js';
import { HOUSE_TIWNA_PORTRAITS } from './house-tiwna-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-morfil';

export const HOUSE_MORFIL_LOCAL_PORTRAIT_FILES = Object.freeze({
  'berwyn-morfil': 'berwyn-morfil.png',
  'bedwyr-morfil': 'bedwyr-morfil.png',
  'cafael-morfil': 'cafael-morfil.png',
  'merrion-morfil': 'merrion-morfil.png',
  'siriol-morfil': 'siriol-morfil.png',
  'travion-morfil': 'travion-morfil.png',
  'sten-skogg': 'sten-skogg.png',
  'guto-morfil': 'guto-morfil.png',
  'carys-morfil': 'carys-morfil.png',
  'mabil-morfil': 'mabil-morfil.png',
  'neirin-morfil': 'neirin-morfil.png',
  'caraf-morfil': 'caraf-morfil.png',
  'eilun-llyfant': 'eilun-llyfant.png',
  'march-pawen': 'march-pawen.png',
  'deliah-rosenblueth': 'deliah-rosenblueth.png',
  'gronw-gwaedlyd': 'gronw-gwaedlyd.png',
  'alun-morfil': 'alun-morfil.png',
  'efa-morfil': 'efa-morfil.png',
  'ioan-morfil': 'ioan-morfil.png',
  'eira-morfil': 'eira-morfil.png',
  'llew-morfil': 'llew-morfil.png',
  'teir-morfil': 'teir-morfil.png',
  'sian-morfil': 'sian-morfil.png'
});

export const HOUSE_MORFIL_PORTRAIT_SOURCES = Object.freeze({
  'berwyn-morfil': 'https://i.imgur.com/kDy4O2v.png',
  'bedwyr-morfil': 'https://i.imgur.com/kzEAhZ4.png',
  'cafael-morfil': 'https://i.imgur.com/CXTNIZw.png',
  'merrion-morfil': 'https://i.imgur.com/gKIBDji.png',
  'siriol-morfil': 'https://i.imgur.com/Ox8vPsN.png',
  'travion-morfil': 'https://i.imgur.com/C4uYyab.png',
  'sten-skogg': 'https://i.imgur.com/AAoMn9C.png',
  'guto-morfil': 'https://i.imgur.com/Fg4Bibe.png',
  'carys-morfil': 'https://i.imgur.com/Ridkhqk.png',
  'mabil-morfil': 'https://i.imgur.com/TEjt2QL.png',
  'neirin-morfil': 'https://i.imgur.com/70u4yA3.png',
  'caraf-morfil': 'https://i.imgur.com/Uxr0vv8.png',
  'eilun-llyfant': 'https://i.imgur.com/CEvDCl6.png',
  'march-pawen': 'https://64.media.tumblr.com/1add43262352df4b5f9d742f5f786639/61c4bf701607a1c0-7d/s250x400/42921a2357b6321a45dbb117c377ff4914f7c66b.pnj',
  'deliah-rosenblueth': 'https://64.media.tumblr.com/3e626833ed88a90904990ea195201ec2/a0b9bfa9688f2da5-b4/s250x400/7fa7b6bf6fa91e7db155ecbb4c7797dd659d9097.pnj',
  'gronw-gwaedlyd': 'https://i.imgur.com/0s4xHgR.png',
  'alun-morfil': 'https://i.imgur.com/OEdtzf7.png',
  'efa-morfil': 'https://i.imgur.com/e4MkVJv.png',
  'ioan-morfil': 'https://i.imgur.com/anA6uB2.png',
  'eira-morfil': 'https://i.imgur.com/zFnkUxl.png',
  'llew-morfil': 'https://i.imgur.com/6LjkVIu.png',
  'teir-morfil': 'https://i.imgur.com/pkAPUqu.png',
  'sian-morfil': 'https://i.imgur.com/pwlNdiW.png'
});

const LOCAL_PORTRAITS = Object.freeze(Object.fromEntries(
  Object.entries(HOUSE_MORFIL_LOCAL_PORTRAIT_FILES).map(([personId, fileName]) => [
    personId,
    `${PORTRAIT_ROOT}/${fileName}`
  ])
));

// Gegenakten bleiben die kanonische Bildquelle gemeinsam geführter Weltpersonen.
// Die wiederholten schwarzen Standardsilhouetten der Altquelle werden ausgelassen.
export const HOUSE_MORFIL_PORTRAITS = Object.freeze({
  ...LOCAL_PORTRAITS,
  'trayvion-pysgod': HOUSE_PYSGOD_PORTRAITS['trayvion-pysgod'],
  'murvin-morfil': HOUSE_DYNGWN_PORTRAITS['murvin-morfil'],
  'brannock-tiwna': HOUSE_TIWNA_PORTRAITS['brannock-tiwna'],
  'categirn-gwialen': HOUSE_GWIALEN_PORTRAITS['categirn-gwialen'],
  'arial-morfil': HOUSE_PYSGOD_PORTRAITS['arial-morfil'],
  'garym-pysgod': HOUSE_PYSGOD_PORTRAITS['garym-pysgod'],
  'talaith-morfil': HOUSE_ARTH_PORTRAITS['talaith-morfil'],
  'rhydderch-arth': HOUSE_ARTH_PORTRAITS['rhydderch-arth'],
  'aneurin-morfil': HOUSE_BRITHYLL_PORTRAITS['aneurin-morfil'],
  'llewella-brithyll': HOUSE_BRITHYLL_PORTRAITS['llewella-brithyll'],
  'caru-morfil': HOUSE_CREYR_PORTRAITS['caru-morfil'],
  'bran-morfil': HOUSE_COEDWIG_PORTRAITS['bran-morfil'],
  'alaw-coedwig': HOUSE_COEDWIG_PORTRAITS['alaw-coedwig'],
  'glendower-morfil': HOUSE_PYSGOD_PORTRAITS['glendower-morfil'],
  'myfanwy-pysgod': HOUSE_PYSGOD_PORTRAITS['myfanwy-pysgod']
});
