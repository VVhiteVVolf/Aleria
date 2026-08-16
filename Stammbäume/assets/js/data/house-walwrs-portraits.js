import { HOUSE_ARFORDIR_PORTRAITS } from './house-arfordir-portraits.js';
import { HOUSE_BLODYN_PORTRAITS } from './house-blodyn-portraits.js';
import { HOUSE_CRAFANC_PORTRAITS } from './house-crafanc-portraits.js';
import { HOUSE_DIANC_PORTRAITS } from './house-dianc-portraits.js';
import { HOUSE_DRAENOG_PORTRAITS } from './house-draenog-portraits.js';
import { HOUSE_GWAEDLYD_PORTRAITS } from './house-gwaedlyd-portraits.js';
import { HOUSE_LYFANT_PORTRAITS } from './house-lyfant-portraits.js';
import { HOUSE_MOCHDAER_PORTRAITS } from './house-mochdaer-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-walwrs';

export const HOUSE_WALWRS_LOCAL_PORTRAIT_FILES = Object.freeze({
  'owain-founder-walwrs': 'owain-founder-walwrs.jpg',
  'sieffre-walwrs': 'sieffre-walwrs.jpg',
  'owain-1655-walwrs': 'owain-1655-walwrs.jpg',
  'cadwallen-walwrs': 'cadwallen-walwrs.jpg',
  'rheidwn-walwrs': 'rheidwn-walwrs.jpg',
  'gwindor-bochdew': 'gwindor-bochdew.png',
  'hopcyn-walwrs': 'hopcyn-walwrs.jpg',
  'cadi-crwynog': 'cadi-crwynog.png',
  'unig-walwrs': 'unig-walwrs.jpg',
  'trefor-walwrs': 'trefor-walwrs.jpg',
  'tawy-walwrs': 'tawy-walwrs.jpg',
  'alys-walwrs': 'alys-walwrs.jpg',
  'tud-walwrs': 'tud-walwrs.jpg',
  'alaw-walwrs': 'alaw-walwrs.jpg'
});

export const HOUSE_WALWRS_PORTRAIT_SOURCES = Object.freeze({
  'owain-founder-walwrs': 'https://64.media.tumblr.com/0669715a4c2187889076db0346b2d4dc/5cb9705b68b3ce6b-1f/s250x400/2a4b6d987a4163398b58810ced9e1c79ab8f286b.pnj',
  'sieffre-walwrs': 'https://64.media.tumblr.com/bf2ed26b498f86bdfe7b56a94b5b9f1f/5cb9705b68b3ce6b-56/s250x400/4d9090bac52cfdea9b6f7d0e249b42fd822292a8.pnj',
  'owain-1655-walwrs': 'https://64.media.tumblr.com/a35e44a0da89d9562134362a1647bf78/5cb9705b68b3ce6b-e4/s250x400/661f8b98f9496e99cd73184b230af0efd704fbb5.pnj',
  'cadwallen-walwrs': 'https://64.media.tumblr.com/af8a32ea281fafdb5972eb3aa5bae2bb/5cb9705b68b3ce6b-45/s250x400/83dcbdc7e03accb3cc998429a80da9ae3b1b6f9d.pnj',
  'rheidwn-walwrs': 'https://64.media.tumblr.com/b8fd53bec27825336b585e746bbc5c61/5cb9705b68b3ce6b-3b/s250x400/b91470be8ac64a8709cbdcd69073bb1a2cb493d7.pnj',
  'gwindor-bochdew': 'https://i.imgur.com/ujMGJNI.png',
  'hopcyn-walwrs': 'https://64.media.tumblr.com/b2c303dd22218bb8ea4bcffe57138717/5cb9705b68b3ce6b-3d/s250x400/62df1e15a768ede98e5bcc1f5589a30cb82a0fe6.pnj',
  'cadi-crwynog': 'https://i.imgur.com/6CXdHbG.png',
  'unig-walwrs': 'https://64.media.tumblr.com/ffda5e8ac065af77fca92b45f5a593a9/5cb9705b68b3ce6b-58/s400x600/ee77c662505352e99e488ef0568e3f78254a6f08.pnj',
  'trefor-walwrs': 'https://64.media.tumblr.com/fa65d450ec9eec01a13223733fcfd745/5cb9705b68b3ce6b-f9/s400x600/16bbccdd88fba94545f0bd262b23b02269754aa3.pnj',
  'tawy-walwrs': 'https://64.media.tumblr.com/0fb7ad1fb83a86663fdb2dcd209bf3ef/5cb9705b68b3ce6b-da/s250x400/ba18d7664a7732f3bbec7e0bf14b5d136378f4b4.pnj',
  'alys-walwrs': 'https://64.media.tumblr.com/6d825c2efc649070273ef702354ca540/5cb9705b68b3ce6b-0a/s250x400/4bd9aca761bc6b83bd1e8d06df3354eb8e86a19f.pnj',
  'tud-walwrs': 'https://64.media.tumblr.com/4aabd42ce377f43028d50831970a7b76/5cb9705b68b3ce6b-8d/s400x600/51dee26f6539f77692ad8b9aa816c3131a6b2fd5.pnj',
  'alaw-walwrs': 'https://64.media.tumblr.com/0952946ea7f005902e88424ef405f859/5cb9705b68b3ce6b-2c/s250x400/d5e1075b6d042c1b6b2e3d1dcaf0790bf33b55d7.pnj'
});

const LOCAL_PORTRAITS = Object.freeze(Object.fromEntries(
  Object.entries(HOUSE_WALWRS_LOCAL_PORTRAIT_FILES)
    .map(([personId, fileName]) => [personId, `${PORTRAIT_ROOT}/${fileName}`])
));

// Bereits ausgearbeitete Gegenakten bleiben die kanonische Bildquelle für
// dieselbe Weltperson. Die mehrfach verwendeten schwarzen Silhouetten der
// Walwrs-Quelle sind keine Individualporträts und werden nicht importiert.
const SHARED_PORTRAITS = Object.freeze({
  'sioned-trachwyll': 'assets/images/portraits/haus-trachwyll/sioned-trachwyll.jpg',
  'taran-walwrs': HOUSE_CRAFANC_PORTRAITS['taran-walwrs'],
  'llaesgwynyn-walwrs': HOUSE_ARFORDIR_PORTRAITS['llaesgwynyn-walwrs'],
  'iorwerth-blodyn': HOUSE_BLODYN_PORTRAITS['iorwerth-blodyn'],
  'ywain-gwaedlyd': HOUSE_GWAEDLYD_PORTRAITS['ywain-gwaedlyd'],
  'meical-draenog': HOUSE_DRAENOG_PORTRAITS['meical-draenog'],
  'ysgonan-dianc': HOUSE_DIANC_PORTRAITS['ysgonan-dianc'],
  'catrin-mochdaer': HOUSE_MOCHDAER_PORTRAITS['catrin-mochdaer'],
  'tathal-walwrs': HOUSE_MOCHDAER_PORTRAITS['tathal-walwrs'],
  'bethan-lyfant': HOUSE_LYFANT_PORTRAITS['bethan-lyfant'],
  'pryderi-walwrs': HOUSE_LYFANT_PORTRAITS['pryderi-walwrs']
});

export const HOUSE_WALWRS_PORTRAITS = Object.freeze({
  ...LOCAL_PORTRAITS,
  ...Object.fromEntries(Object.entries(SHARED_PORTRAITS).filter(([, portrait]) => portrait))
});
