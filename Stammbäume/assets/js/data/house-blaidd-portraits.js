import { HOUSE_BLODYN_PORTRAITS } from './house-blodyn-portraits.js';
import { HOUSE_BRITHYLL_PORTRAITS } from './house-brithyll-portraits.js';
import { HOUSE_DRAENOG_PORTRAITS } from './house-draenog-portraits.js';
import { HOUSE_MOCHDAER_PORTRAITS } from './house-mochdaer-portraits.js';
import { HOUSE_PYSGOD_PORTRAITS } from './house-pysgod-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-blaidd';

export const HOUSE_BLAIDD_LOCAL_PORTRAIT_FILES = Object.freeze({
  'llewelyn-founder-blaidd': 'llewelyn-founder-blaidd.png',
  'sieffre-founder-blaidd': 'sieffre-founder-blaidd.png',
  'tangwistl-blaidd': 'tangwistl-blaidd.png',
  'trahayarn-blaidd': 'trahayarn-blaidd.png',
  'powell-illygoden': 'powell-illygoden.png',
  'galahad-blaidd': 'galahad-blaidd.png',
  'seissylwch-arfordir': 'seissylwch-arfordir.png',
  'llwyarch-blaidd': 'llwyarch-blaidd.png',
  'llenlleawg-blaidd': 'llenlleawg-blaidd.png',
  'dyvynwal-trachwyll': 'dyvynwal-trachwyll.jpg',
  'kyvwlch-blaidd': 'kyvwlch-blaidd.png',
  'vorath-blaidd': 'vorath-blaidd.png',
  'taliesin-illygoden': 'taliesin-illygoden.png',
  'pelleas-blaidd': 'pelleas-blaidd.png',
  'pedrawd-blaidd': 'pedrawd-blaidd.png',
  'ysgonan-blaidd': 'ysgonan-blaidd.png',
  'caron-dianc': 'caron-dianc.png',
  'taran-blaidd': 'taran-blaidd.png',
  'fflur-blaidd': 'fflur-blaidd.png',
  'meredithe-arfordir': 'meredithe-arfordir.png',
  'maxen-illygoden': 'maxen-illygoden.png',
  'hedd-blaidd': 'hedd-blaidd.png',
  'mair-blaidd': 'mair-blaidd.png',
  'telyn-blaidd': 'telyn-blaidd.png',
  'unig-blaidd': 'unig-blaidd.png',
  'wynne-blaidd': 'wynne-blaidd.png'
});

export const HOUSE_BLAIDD_PORTRAIT_SOURCES = Object.freeze({
  'llewelyn-founder-blaidd': 'https://i.imgur.com/X6wOECU.png',
  'sieffre-founder-blaidd': 'https://i.imgur.com/deA9uZt.png',
  'tangwistl-blaidd': 'https://i.imgur.com/NRkJIz9.png',
  'trahayarn-blaidd': 'https://i.imgur.com/5eBn0ud.png',
  'powell-illygoden': 'https://i.imgur.com/Dx7Ev59.png',
  'galahad-blaidd': 'https://i.imgur.com/NT6tzUe.png',
  'seissylwch-arfordir': 'https://i.imgur.com/LhWXb37.png',
  'llwyarch-blaidd': 'https://i.imgur.com/ocE9kaK.png',
  'llenlleawg-blaidd': 'https://i.imgur.com/fflidjQ.png',
  'dyvynwal-trachwyll': 'https://64.media.tumblr.com/75c7d8d567cd0e96dc842b474748231b/0e955d8f99366615-2d/s250x400/a2950a27a612591dfc2897b90ae33fb1a9b0e642.pnj',
  'kyvwlch-blaidd': 'https://i.imgur.com/4hBNdWs.png',
  'vorath-blaidd': 'https://i.imgur.com/HF8Bnlv.png',
  'taliesin-illygoden': 'https://i.imgur.com/V09ytBi.png',
  'pelleas-blaidd': 'https://i.imgur.com/VMAq1Ub.png',
  'pedrawd-blaidd': 'https://i.imgur.com/3APOwHd.png',
  'ysgonan-blaidd': 'https://i.imgur.com/HKVmexn.png',
  'caron-dianc': 'https://i.imgur.com/gOmtyNm.png',
  'taran-blaidd': 'https://i.imgur.com/OBX8eY5.png',
  'fflur-blaidd': 'https://i.imgur.com/TNttaMA.png',
  'meredithe-arfordir': 'https://i.imgur.com/TZpLLbG.png',
  'maxen-illygoden': 'https://i.imgur.com/b30h4r3.png',
  'hedd-blaidd': 'https://i.imgur.com/rSPGCbw.png',
  'mair-blaidd': 'https://i.imgur.com/QTuWaFY.png',
  'telyn-blaidd': 'https://i.imgur.com/LvVlbWi.png',
  'unig-blaidd': 'https://i.imgur.com/ZzzKrD0.png',
  'wynne-blaidd': 'https://i.imgur.com/5vxfsuC.png'
});

const LOCAL_PORTRAITS = Object.freeze(Object.fromEntries(
  Object.entries(HOUSE_BLAIDD_LOCAL_PORTRAIT_FILES).map(([personId, fileName]) => [
    personId,
    `${PORTRAIT_ROOT}/${fileName}`
  ])
));

// Bereits ausgearbeitete Gegenakten bleiben für geteilte Weltpersonen die
// kanonische Bildquelle. Standardsilhouetten der Altquelle werden ausgelassen.
export const HOUSE_BLAIDD_PORTRAITS = Object.freeze({
  ...LOCAL_PORTRAITS,
  'jinell-trachwyll': 'assets/images/portraits/haus-trachwyll/jinell-trachwyll.jpg',
  'breunor-blodyn': HOUSE_BLODYN_PORTRAITS['breunor-blodyn'],
  'myfanwy-blaidd': HOUSE_BLODYN_PORTRAITS['myfanwy-blaidd'],
  'ceridwen-blodyn': HOUSE_BLODYN_PORTRAITS['ceridwen-blodyn'],
  'gwynfor-blaidd': HOUSE_BLODYN_PORTRAITS['gwynfor-blaidd'],
  'arvyn-blodyn': HOUSE_BLODYN_PORTRAITS['arvyn-blodyn'],
  'trystan-blaidd': HOUSE_BLODYN_PORTRAITS['trystan-blaidd'],
  'yvain-blodyn': HOUSE_BLODYN_PORTRAITS['yvain-blodyn'],
  'bronwen-blaidd': HOUSE_BLODYN_PORTRAITS['bronwen-blaidd'],
  'guenevere-pysgod': HOUSE_PYSGOD_PORTRAITS['guenevere-pysgod'],
  'kyndrwyn-blaidd': HOUSE_PYSGOD_PORTRAITS['kyndrwyn-blaidd'],
  'caradoc-1675-pysgod': HOUSE_PYSGOD_PORTRAITS['caradoc-1675-pysgod'],
  'brynn-blaidd': HOUSE_PYSGOD_PORTRAITS['brynn-blaidd'],
  'aethlem-mochdaer': HOUSE_MOCHDAER_PORTRAITS['aethlem-mochdaer'],
  'lunet-blaidd': HOUSE_MOCHDAER_PORTRAITS['lunet-blaidd'],
  'ninian-draenog': HOUSE_DRAENOG_PORTRAITS['ninian-draenog'],
  'enora-blaidd': HOUSE_DRAENOG_PORTRAITS['enora-blaidd'],
  'ossian-blaidd': HOUSE_BRITHYLL_PORTRAITS['ossian-blaidd'],
  'gwenllian-brithyll': HOUSE_BRITHYLL_PORTRAITS['gwenllian-brithyll']
});
