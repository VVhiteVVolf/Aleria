import { HOUSE_ARTH_LOCAL_PORTRAITS } from './house-arth-local-portraits.js';
import { HOUSE_BLAIDD_PORTRAITS } from './house-blaidd-portraits.js';
import { HOUSE_BLODYN_PORTRAITS } from './house-blodyn-portraits.js';
import { HOUSE_LYFANT_PORTRAITS } from './house-lyfant-portraits.js';
import { HOUSE_MOCHDAER_PORTRAITS } from './house-mochdaer-portraits.js';
import { HOUSE_MORTHWYLL_PORTRAITS } from './house-morthwyll-portraits.js';
import { HOUSE_NEIDR_PORTRAITS } from './house-neidr-portraits.js';
import { HOUSE_SILBERZUNGE_PORTRAITS } from './house-silberzunge-portraits.js';
import { HOUSE_SKOGG_PORTRAITS } from './house-skogg-portraits.js';
import { HOUSE_VARULV_PORTRAITS } from './house-varulv-portraits.js';
import { HOUSE_WALWRS_PORTRAITS } from './house-walwrs-portraits.js';
import { HOUSE_WARGH_PORTRAITS } from './house-wargh-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-trachwyll';

export const HOUSE_TRACHWYLL_LOCAL_PORTRAIT_FILES = Object.freeze({
  'breandan-trachwyll': 'breandan-trachwyll.jpg',
  'owain-trachwyll': 'owain-trachwyll.jpg',
  'arthan-trachwyll': 'arthan-trachwyll.jpg',
  'alinor-trachwyll': 'alinor-trachwyll.jpg',
  'alawen-trachwyll': 'alawen-trachwyll.jpg',
  'arn-vaeren': 'arn-vaeren.png',
  'leifric-frostauge': 'leifric-frostauge.png',
  'bethwyn-trachwyll': 'bethwyn-trachwyll.jpg',
  'jinell-trachwyll': 'jinell-trachwyll.jpg',
  'griffudd-trachwyll': 'griffudd-trachwyll.jpg',
  'conway-trachwyll': 'conway-trachwyll.jpg',
  'sioned-trachwyll': 'sioned-trachwyll.jpg',
  'taranis-trachwyll': 'taranis-trachwyll.jpg',
  'carynne-trachwyll': 'carynne-trachwyll.jpg',
  'godwyn-trachwyll': 'godwyn-trachwyll.jpg',
  'talfryn-trachwyll': 'talfryn-trachwyll.jpg',
  'merlion-trachwyll': 'merlion-trachwyll.jpg',
  'main-trachwyll': 'main-trachwyll.jpg',
  'kenyon-trachwyll': 'kenyon-trachwyll.jpg',
  'leikn-eisenbieger': 'leikn-eisenbieger.png',
  'charlton-trachwyll': 'charlton-trachwyll.jpg',
  'gwilym-trachwyll': 'gwilym-trachwyll.jpg',
  'madoc-trachwyll': 'madoc-trachwyll.jpg',
  'nerys-trachwyll': 'nerys-trachwyll.jpg',
  'owen-trachwyll': 'owen-trachwyll.jpg',
  'tegan-trachwyll': 'tegan-trachwyll.jpg',
  'bogus-trachwyll': 'bogus-trachwyll.jpg',
  'wenna-trachwyll': 'wenna-trachwyll.jpg',
  'ivor-trachwyll': 'ivor-trachwyll.jpg',
  'sabrian-trachwyll': 'sabrian-trachwyll.jpg',
  'sabria-trachwyll': 'sabria-trachwyll.jpg',
  'yvaine-gwenyen': 'yvaine-gwenyen.png',
  'ingrid-grendel': 'ingrid-grendel.png'
});

export const HOUSE_TRACHWYLL_PORTRAIT_SOURCES = Object.freeze({
  'breandan-trachwyll': 'https://64.media.tumblr.com/9353e905b672d565a2c0a96c13986fe8/0e955d8f99366615-6a/s250x400/099e11a46544f8aebb40ad8459675c3bb2da0606.pnj',
  'owain-trachwyll': 'https://64.media.tumblr.com/ffc70a972c337003e93715ca9dc01407/41adb7123b947871-3a/s250x400/a06925e6207e9bd847e00080c21f868a075067f8.pnj',
  'arthan-trachwyll': 'https://64.media.tumblr.com/2edf6253d10b42c82af715edcfba8ee8/0e955d8f99366615-bd/s250x400/5ac1f33e27f12f745ed29eb4ecd497c2aaa2164f.pnj',
  'alinor-trachwyll': 'https://64.media.tumblr.com/7c0ea80f1b438f8d22359854ec3c17a3/0e955d8f99366615-85/s250x400/d41bb78be7bc4f55e3266d09b0a59f84689cc4d8.pnj',
  'alawen-trachwyll': 'https://64.media.tumblr.com/d608454e2c49b7c6eba9aa95b28af6c7/0e955d8f99366615-13/s250x400/81523cc4f4d1b8acd557329ef6a4165f9149a0b2.pnj',
  'arn-vaeren': 'https://i.imgur.com/eNvF5Ku.png',
  'leifric-frostauge': 'https://i.imgur.com/egpCGBi.png',
  'bethwyn-trachwyll': 'https://64.media.tumblr.com/21310df8f0227170d9edcc6548ac1d5a/0e955d8f99366615-db/s250x400/59a29ee2bcc026b20c9e5ea06a5d9608a8019e30.pnj',
  'jinell-trachwyll': 'https://64.media.tumblr.com/15dd66f39af5fb3ca078a6654ce79e16/0e955d8f99366615-9c/s250x400/17d6f4fdf194511626bfb6f19e5b98f7d539529a.pnj',
  'griffudd-trachwyll': 'https://64.media.tumblr.com/70cb7ed19ab7acd590a1a619558c06a4/0e955d8f99366615-c7/s250x400/9a15d90a70bc06d9dff652117a55674313257d8e.pnj',
  'conway-trachwyll': 'https://64.media.tumblr.com/4d9f35ae6986c82e21dc5ea5d378fe23/0e955d8f99366615-4e/s250x400/0d2a2cdadcc5097de1c2767df9c21a472092c6c0.pnj',
  'sioned-trachwyll': 'https://64.media.tumblr.com/72e4154babe432b45f57ca14474cc8c1/41adb7123b947871-f1/s250x400/87299aaaffd3c6a854f3de52ea2215b241ee05bb.pnj',
  'taranis-trachwyll': 'https://64.media.tumblr.com/7e83fad0cc0ecd4be400528b97506373/41adb7123b947871-90/s250x400/ffc2220335fe5f4ca743b16f1012c74038e32d7c.pnj',
  'carynne-trachwyll': 'https://64.media.tumblr.com/fac9c990980a3b46ab787ea64b82ff84/0e955d8f99366615-c8/s250x400/c583a1fb972cda7ddb0bdb3bbddbe579a3c40ef0.pnj',
  'godwyn-trachwyll': 'https://64.media.tumblr.com/f470f749e90a649a1bd8b492b11256a7/0e955d8f99366615-fc/s250x400/c8a55c97727677ad16baf985c26bcbb34e062208.pnj',
  'talfryn-trachwyll': 'https://64.media.tumblr.com/742c8dc033114baeefd9bb74d30bf380/41adb7123b947871-43/s250x400/b3dbf11ec9873765edbfef14e8c79394c2963413.pnj',
  'merlion-trachwyll': 'https://64.media.tumblr.com/39e7460e6a9c696bf8ade837e45d6b94/41adb7123b947871-8b/s250x400/58777156ee21c42ba18a5fd8180f53edd587da8e.pnj',
  'main-trachwyll': 'https://64.media.tumblr.com/5460d4fade77f3a2ff3367e78b221b1b/41adb7123b947871-2a/s250x400/e5acd6b58c5dcf0ab79a3cfca8917f68909951a5.pnj',
  'kenyon-trachwyll': 'https://64.media.tumblr.com/15687ed3c23585e3b471b63aa573284f/0e955d8f99366615-73/s250x400/c33185050fe8f83669f60a7867c3f7d0cd983fa9.pnj',
  'leikn-eisenbieger': 'https://i.imgur.com/7sjhRAX.png',
  'charlton-trachwyll': 'https://64.media.tumblr.com/8c098ea422afae8e0db5a415a9e948fc/0e955d8f99366615-a5/s250x400/aceb9ed7711658598e431023b3a134fe663fbe2a.pnj',
  'gwilym-trachwyll': 'https://64.media.tumblr.com/9dbc1fad5d86c0bd80324a69f8e3755/0e955d8f99366615-08/s250x400/eadf867b707bb5f95c1abd2062c880c784d119d5.pnj',
  'madoc-trachwyll': 'https://64.media.tumblr.com/87b3952eaf44a65ce025d65de1e5b7b3/41adb7123b947871-8c/s250x400/8be2a5cade8a0abef58c645f3cf34e073c1608ea.pnj',
  'nerys-trachwyll': 'https://64.media.tumblr.com/236dc24438d9c987660b283c37430aec/41adb7123b947871-06/s250x400/c019cd2c7508700440ebb9b4990d65954618a5ec.pnj',
  'owen-trachwyll': 'https://64.media.tumblr.com/6cb4ed5204bf1a48f2d348a052482b04/41adb7123b947871-41/s250x400/994b2e0ef324de99a45456146abb914e5e5cc88b.pnj',
  'tegan-trachwyll': 'https://64.media.tumblr.com/d81c78e8783e2ed0b6018293d188e198/41adb7123b947871-aa/s250x400/34ec00cce064504b2548a773e6c175580172a950.pnj',
  'bogus-trachwyll': 'https://64.media.tumblr.com/6ee1ee7b6983313296ea1a1d8ad2c62f/0e955d8f99366615-41/s250x400/0b96efedbc4c5b09e3590cf956c9f6ba7657b48d.pnj',
  'wenna-trachwyll': 'https://64.media.tumblr.com/d79d410427d65f61a76eb9553e7d7a06/41adb7123b947871-46/s250x400/9b0573bb67571e088b53307c958610b95aa02dea.pnj',
  'ivor-trachwyll': 'https://64.media.tumblr.com/892df081265daea4cc2457e41802af10/0e955d8f99366615-c2/s250x400/2212d0fcf69b03744d2a3af21391f6e9b3ad65c4.pnj',
  'sabrian-trachwyll': 'https://64.media.tumblr.com/362f04ae61e0239abd53a42207bc16c9/41adb7123b947871-9f/s250x400/f54bb954cf85b876b06eba16c796301a75cf2724.pnj',
  'sabria-trachwyll': 'https://64.media.tumblr.com/bcd1116fcf428d18d9c86112965a96d5/41adb7123b947871-f1/s250x400/217d21b8798c9a1ee5d5e777c5130bc9804db505.pnj',
  'yvaine-gwenyen': 'https://i.imgur.com/9sDn8sC.png',
  'ingrid-grendel': 'https://i.imgur.com/9Pvssfz.png'
});

const LOCAL_PORTRAITS = Object.freeze(Object.fromEntries(
  Object.entries(HOUSE_TRACHWYLL_LOCAL_PORTRAIT_FILES).map(([personId, fileName]) => [
    personId,
    `${PORTRAIT_ROOT}/${fileName}`
  ])
));

export const HOUSE_TRACHWYLL_PORTRAITS = Object.freeze({
  ...LOCAL_PORTRAITS,
  'gwalchmai-trachwyll': HOUSE_BLODYN_PORTRAITS['gwalchmai-trachwyll'],
  'morwenna-blodyn': HOUSE_BLODYN_PORTRAITS['morwenna-blodyn'],
  'gogyvwlch-blodyn': HOUSE_BLODYN_PORTRAITS['gogyvwlch-blodyn'],
  'macsen-trachwyll': HOUSE_VARULV_PORTRAITS['macsen-trachwyll'],
  'edda-varulv': HOUSE_VARULV_PORTRAITS['edda-varulv'],
  'gavin-trachwyll': HOUSE_BLODYN_PORTRAITS['gavin-trachwyll'],
  'dyvynwal-trachwyll': HOUSE_BLAIDD_PORTRAITS['dyvynwal-trachwyll'],
  'kyvwlch-blaidd': HOUSE_BLAIDD_PORTRAITS['kyvwlch-blaidd'],
  'mordred-trachwyll': HOUSE_MOCHDAER_PORTRAITS['mordred-trachwyll'],
  'cadwallen-walwrs': HOUSE_WALWRS_PORTRAITS['cadwallen-walwrs'],
  'dolena-trachwyll': HOUSE_ARTH_LOCAL_PORTRAITS['dolena-trachwyll'],
  'denawal-1680-arth': HOUSE_ARTH_LOCAL_PORTRAITS['denawal-1680-arth'],
  'delwen-trachwyll': HOUSE_BLODYN_PORTRAITS['delwen-trachwyll'],
  'wynfor-blodyn': HOUSE_BLODYN_PORTRAITS['wynfor-blodyn'],
  'falka-trachwyll': HOUSE_NEIDR_PORTRAITS['falka-trachwyll'],
  'gwastad-neidr': HOUSE_NEIDR_PORTRAITS['gwastad-neidr'],
  'kane-trachwyll': HOUSE_MORTHWYLL_PORTRAITS['kane-trachwyll'],
  'guenevere-morthwyll': HOUSE_MORTHWYLL_PORTRAITS['guenevere-morthwyll'],
  'meredydd-lyfant': HOUSE_LYFANT_PORTRAITS['meredydd-lyfant'],
  'rhodri-trachwyll': HOUSE_SILBERZUNGE_PORTRAITS['rhodri-trachwyll'],
  'oddny-silberzunge': HOUSE_SILBERZUNGE_PORTRAITS['oddny-silberzunge'],
  'gwenlyn-trachwyll': HOUSE_WARGH_PORTRAITS['gwenlyn-trachwyll'],
  'torvar-wargh': HOUSE_WARGH_PORTRAITS['torvar-wargh'],
  'gwendolyn-trachwyll': HOUSE_SKOGG_PORTRAITS['gwendolyn-trachwyll'],
  'skeldar-skogg': HOUSE_SKOGG_PORTRAITS['skeldar-skogg']
});
