import { HOUSE_DAL_CRUTHIN_PORTRAITS } from './house-dal-cruthin-portraits.js';
import { HOUSE_GWEFRYDD_PORTRAITS } from './house-gwefrydd-portraits.js';
import { HOUSE_MAC_ARD_CUMHAILL_PORTRAITS } from './house-mac-ard-cumhaill-portraits.js';
import { HOUSE_SUEDSTAHL_PORTRAITS } from './house-suedstahl-portraits.js';
import { HOUSE_UI_FIACHRACH_LOCAL_PORTRAITS } from './house-ui-fiachrach-local-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-ard-frisealach';

export const HOUSE_ARD_FRISEALACH_LOCAL_PORTRAIT_FILES = Object.freeze({
  'tadhghan-founder-frisealach': 'tadhghan-founder-frisealach.png',
  'aodhagan-frisealach': 'aodhagan-frisealach.png',
  'tighearnach-frisealach': 'tighearnach-frisealach.png',
  'kalman-frisealach': 'kalman-frisealach.png',
  'eadbhard-frisealach': 'eadbhard-frisealach.png',
  'oirbhealach-frisealach': 'oirbhealach-frisealach.png',
  'diarmuid-frisealach': 'diarmuid-frisealach.png',
  'bairrfhionn-frisealach': 'bairrfhionn-frisealach.png',
  'giollanaimhe-frisealach': 'giollanaimhe-frisealach.png',
  'uilinn-frisealach': 'uilinn-frisealach.png',
  'bronnach-frisealach': 'bronnach-frisealach.png',
  'muircheartach-frisealach': 'muircheartach-frisealach.png',
  'kadhghan-frisealach': 'kadhghan-frisealach.png',
  'hanae-frisealach': 'hanae-frisealach.png',
  'koarnach-frisealach': 'koarnach-frisealach.png',
  'hurracan-frisealach': 'hurracan-frisealach.png',
  'sluaghan-frisealach': 'sluaghan-frisealach.png',
  'vathna-frisealach': 'vathna-frisealach.png',
  'hoilbhe-frisealach': 'hoilbhe-frisealach.png',
  'jaralt-frisealach': 'jaralt-frisealach.png',
  'rioghbhar-frisealach': 'rioghbhar-frisealach.png',
  'kermena-1708-frisealach': 'kermena-1708-frisealach.png',
  'tarlachan-frisealach': 'tarlachan-frisealach.png',
  'yachthar-frisealach': 'yachthar-frisealach.png',
  'nioran-frisealach': 'nioran-frisealach.png',
  'neidhe-frisealach': 'neidhe-frisealach.png',
  'parthas-frisealach': 'parthas-frisealach.png',
  'uaithe-frisealach': 'uaithe-frisealach.png',
  'trianach-frisealach': 'trianach-frisealach.png',
  'gaothaire-1726-frisealach': 'gaothaire-1726-frisealach.png',
  'aolbha-frisealach': 'aolbha-frisealach.png',
  'jiarla-frisealach': 'jiarla-frisealach.png'
});

export const HOUSE_ARD_FRISEALACH_LOCAL_PORTRAIT_IDS = Object.freeze(
  Object.keys(HOUSE_ARD_FRISEALACH_LOCAL_PORTRAIT_FILES)
);

export const HOUSE_ARD_FRISEALACH_REUSED_PORTRAIT_IDS = Object.freeze([
  'tiarnog-fiachrach',
  'gormlaith-frisealach',
  'salah-suedstahl',
  'tairdelbach-cumhail',
  'cathalan-cruthin',
  'eithne-frisealach',
  'tommen-gwefrydd',
  'fothadh-trodach',
  'muiredach-somhairle',
  'wihalg-somhairle',
  'gaothaire-airgid'
]);

export const HOUSE_ARD_FRISEALACH_PORTRAITS = Object.freeze({
  ...Object.fromEntries(Object.entries(HOUSE_ARD_FRISEALACH_LOCAL_PORTRAIT_FILES).map(
    ([personId, fileName]) => [personId, `${PORTRAIT_ROOT}/${fileName}`]
  )),
  'tiarnog-fiachrach': HOUSE_UI_FIACHRACH_LOCAL_PORTRAITS['tiarnog-fiachrach'],
  'gormlaith-frisealach': HOUSE_SUEDSTAHL_PORTRAITS['gormlaith-frisealach'],
  'salah-suedstahl': HOUSE_SUEDSTAHL_PORTRAITS['salah-suedstahl'],
  'tairdelbach-cumhail': HOUSE_MAC_ARD_CUMHAILL_PORTRAITS['tairdelbach-cumhail'],
  'cathalan-cruthin': HOUSE_DAL_CRUTHIN_PORTRAITS['cathalan-cruthin'],
  'eithne-frisealach': HOUSE_GWEFRYDD_PORTRAITS['eithne-frisealach'],
  'tommen-gwefrydd': HOUSE_GWEFRYDD_PORTRAITS['tommen-gwefrydd'],
  'fothadh-trodach': 'assets/images/portraits/haus-ard-trodach/fothadh-trodach.png',
  'muiredach-somhairle': 'assets/images/portraits/haus-sidhe-somhairle/muiredach-somhairle.png',
  'wihalg-somhairle': 'assets/images/portraits/haus-sidhe-somhairle/wihalg-somhairle.png',
  'gaothaire-airgid': 'assets/images/portraits/haus-tir-an-airgid/gaothaire-airgid.png'
});
