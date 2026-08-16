import { HOUSE_BRITHYLL_PORTRAITS } from './house-brithyll-portraits.js';
import { HOUSE_FEUERHAAR_PORTRAITS } from './house-feuerhaar-portraits.js';
import { HOUSE_FREIWINTER_PORTRAITS } from './house-freiwinter-portraits.js';
import { HOUSE_SCHWARZDORN_PORTRAITS } from './house-schwarzdorn-portraits.js';
import { HOUSE_SKJEGG_PORTRAITS } from './house-skjegg-portraits.js';
import { HOUSE_SKOGG_PORTRAITS } from './house-skogg-portraits.js';
import { HOUSE_WARGH_PORTRAITS } from './house-wargh-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-silberzunge';

export const HOUSE_SILBERZUNGE_LOCAL_PORTRAIT_FILES = Object.freeze({
  'surtr-silberzunge': 'surtr-silberzunge.png',
  'snorri-silberzunge': 'snorri-silberzunge.png',
  'naddvar-silberzunge': 'naddvar-silberzunge.png',
  'lodvar-silberzunge': 'lodvar-silberzunge.png',
  'langarr-silberzunge': 'langarr-silberzunge.png',
  'ragnfred-silberzunge': 'ragnfred-silberzunge.png',
  'svartulf-silberzunge': 'svartulf-silberzunge.png',
  'skorri-silberzunge': 'skorri-silberzunge.png',
  'ulfrik-silberzunge': 'ulfrik-silberzunge.png',
  'thrandr-silberzunge': 'thrandr-silberzunge.png',
  'dagrinn-silberzunge': 'dagrinn-silberzunge.png',
  'bjarnhild-silberzunge': 'bjarnhild-silberzunge.png',
  'gunnvar-silberzunge': 'gunnvar-silberzunge.png',
  'njordinn-hyrmgardr': 'njordinn-hyrmgardr.png',
  'leifgard-silberzunge': 'leifgard-silberzunge.png',
  'oddny-silberzunge': 'oddny-silberzunge.png',
  'sverrir-silberzunge': 'sverrir-silberzunge.png',
  'rhodri-trachwyll': 'rhodri-trachwyll.png',
  'gundel-graumahne': 'gundel-graumahne.png',
  'fjornir-silberzunge': 'fjornir-silberzunge.png',
  'baldor-silberzunge': 'baldor-silberzunge.png',
  'fjola-silberzunge': 'fjola-silberzunge.png',
  'asdis-eisenbieger': 'asdis-eisenbieger.png',
  'eyjolf-silberzunge': 'eyjolf-silberzunge.png',
  'katla-silberzunge': 'katla-silberzunge.png',
  'leiknir-silberzunge': 'leiknir-silberzunge.png'
});

export const HOUSE_SILBERZUNGE_PORTRAIT_SOURCES = Object.freeze({
  'surtr-silberzunge': 'https://i.imgur.com/vn3T1Sv.png',
  'snorri-silberzunge': 'https://i.imgur.com/5nXpLi8.png',
  'naddvar-silberzunge': 'https://i.imgur.com/nAF0Z2q.png',
  'lodvar-silberzunge': 'https://i.imgur.com/JQm4we0.png',
  'langarr-silberzunge': 'https://i.imgur.com/HaPS7w6.png',
  'ragnfred-silberzunge': 'https://i.imgur.com/3s45SiL.png',
  'svartulf-silberzunge': 'https://i.imgur.com/RART5Cv.png',
  'skorri-silberzunge': 'https://i.imgur.com/e6to8Ox.png',
  'ulfrik-silberzunge': 'https://i.imgur.com/IQRqobH.png',
  'thrandr-silberzunge': 'https://i.imgur.com/1DtNzjA.png',
  'dagrinn-silberzunge': 'https://i.imgur.com/DrUtiWr.png',
  'bjarnhild-silberzunge': 'https://i.imgur.com/PhWniRT.png',
  'gunnvar-silberzunge': 'https://i.imgur.com/HX3TSbU.png',
  'njordinn-hyrmgardr': 'https://i.imgur.com/3TIOlV2.png',
  'leifgard-silberzunge': 'https://i.imgur.com/A7EME8E.png',
  'oddny-silberzunge': 'https://i.imgur.com/QeA9Gdx.png',
  'sverrir-silberzunge': 'https://i.imgur.com/qUlCehn.png',
  'rhodri-trachwyll': 'https://64.media.tumblr.com/a8fc9d069c2a30a437fda165acf1ed80/41adb7123b947871-99/s250x400/53c4d7cbfbefec9cd6f6e4382c945585bc5b951f.pnj',
  'gundel-graumahne': 'https://i.imgur.com/aGp8Pry.png',
  'fjornir-silberzunge': 'https://i.imgur.com/MxUClMX.png',
  'baldor-silberzunge': 'https://i.imgur.com/XUOvpQ5.png',
  'fjola-silberzunge': 'https://i.imgur.com/9y1oCGg.png',
  'asdis-eisenbieger': 'https://i.imgur.com/EcuYlu6.png',
  'eyjolf-silberzunge': 'https://i.imgur.com/1TR1cAJ.png',
  'katla-silberzunge': 'https://i.imgur.com/nbj4uuQ.png',
  'leiknir-silberzunge': 'https://i.imgur.com/ykLdWKD.png'
});

const LOCAL_PORTRAITS = Object.freeze(Object.fromEntries(
  Object.entries(HOUSE_SILBERZUNGE_LOCAL_PORTRAIT_FILES).map(([personId, fileName]) => [
    personId,
    `${PORTRAIT_ROOT}/${fileName}`
  ])
));

export const HOUSE_SILBERZUNGE_PORTRAITS = Object.freeze({
  ...LOCAL_PORTRAITS,
  'edmund-skogg': HOUSE_SKOGG_PORTRAITS['edmund-skogg'],
  'brodd-silberzunge': HOUSE_SKJEGG_PORTRAITS['brodd-silberzunge'],
  'asger-wargh': HOUSE_WARGH_PORTRAITS['asger-wargh'],
  'loki-silberzunge': HOUSE_SKJEGG_PORTRAITS['loki-silberzunge'],
  'thorkel-silberzunge': HOUSE_FREIWINTER_PORTRAITS['thorkel-silberzunge'],
  'kolskegg-silberzunge': HOUSE_FEUERHAAR_PORTRAITS['kolskegg-silberzunge'],
  'skulla-feuerhaar': HOUSE_FEUERHAAR_PORTRAITS['skulla-feuerhaar'],
  'eldkatla-silberzunge': HOUSE_SKOGG_PORTRAITS['eldkatla-silberzunge'],
  'kjallak-skogg': HOUSE_SKOGG_PORTRAITS['kjallak-skogg'],
  'asgerd-silberzunge': HOUSE_SCHWARZDORN_PORTRAITS['asgerd-silberzunge'],
  'mormond-schwarzdorn': HOUSE_SCHWARZDORN_PORTRAITS['mormond-schwarzdorn'],
  'hjalprek-silberzunge': HOUSE_WARGH_PORTRAITS['hjalprek-silberzunge'],
  'skegghild-wargh': HOUSE_WARGH_PORTRAITS['skegghild-wargh'],
  'ranva-silberzunge': HOUSE_BRITHYLL_PORTRAITS['ranva-silberzunge'],
  'categirn-1695-brithyll': HOUSE_BRITHYLL_PORTRAITS['categirn-1695-brithyll']
});
