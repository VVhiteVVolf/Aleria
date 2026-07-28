import { HOUSE_DRAIG_PORTRAITS } from './house-draig-portraits.js';
import { HOUSE_GWEFRYDD_PORTRAITS } from './house-gwefrydd-portraits.js';
import { HOUSE_ILLEWOD_PORTRAITS } from './house-illewod-portraits.js';
import { HOUSE_NEIDR_PORTRAITS } from './house-neidr-portraits.js';
import { HOUSE_PENDRAG_PORTRAITS } from './house-pendrag-portraits.js';
import { HOUSE_PYSGOD_PORTRAITS } from './house-pysgod-portraits.js';
import { HOUSE_WYRM_PORTRAITS } from './house-wyrm-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-wylan';

const LOCAL_PORTRAIT_IDS = Object.freeze([
  'melwas-wylan',
  'sadbbh-trisceil',
  'breandan-wylan',
  'merlion-wylan',
  'tadhgin-trisceil',
  'rhodhri-wylan',
  'rhun-wylan',
  'talfryn-aderyn',
  'eiddyl-wylan',
  'dolena-wylan',
  'myf-wylan',
  'gearoid-cein',
  'afal-coedwig',
  'gwayne-gaeth',
  'macsen-wylan',
  'penllyn-wylan',
  'tudwal-asyn',
  'trachmyr-wylan',
  'caled-tiwna',
  'rhydderch-llwynog',
  'gwindor-crefydoll',
  'gendry-wylan',
  'hopcyn-saith',
  'ifan-blach',
  'iolyn-wylan',
  'uther-gwialen',
  'mervyn-dienyddiwr',
  'maldwyn-wylan',
  'mervyne-wylan',
  'caralyn-wylan',
  'malt-wylan',
  'deryn-wylan',
  'liadan-cetchathach',
  'arawn-wylan',
  'cariad-wylan',
  'bryn-wylan',
  'gwynham-tir-addawol',
  'anarawd-llwynog',
  'kimball-crefydoll',
  'lugh-teyrngrach',
  'mag-wylan',
  'ekmeleddin-wylan',
  'olwyn-wylan',
  'trevelyan-dinefwr',
  'faylinn-ailella',
  'dyl-canwyll',
  'liam-wylan',
  'majella-wylan',
  'eirlys-dyngwn',
  'berwyn-wylan',
  'bedwyr-wylan',
  'anona-wylan',
  'nona-wylan',
  'arryn-1732-wylan',
  'wynne-wylan',
  'vaughan-wylan',
  'evie-wylan',
  'tomi-wylan',
  'evangelin-wylan',
  'lowri-wylan',
  'alun-hwyaden',
  'evan-creyr'
]);

export const HOUSE_WYLAN_PORTRAITS = Object.freeze({
  ...Object.fromEntries(LOCAL_PORTRAIT_IDS.map(personId => [
    personId,
    `${PORTRAIT_ROOT}/${personId}.jpg`
  ])),
  'rheidwn-wylan': HOUSE_NEIDR_PORTRAITS['rheidwn-wylan'],
  'daffyd-neidr': HOUSE_NEIDR_PORTRAITS['daffyd-neidr'],
  'vorath-wylan': HOUSE_PENDRAG_PORTRAITS['vorath-wylan'],
  'iesin-pendrag': HOUSE_PENDRAG_PORTRAITS['iesin-pendrag'],
  'wrnach-wylan': HOUSE_GWEFRYDD_PORTRAITS['wrnach-wylan'],
  'caradoc-ancient-pysgod': HOUSE_PYSGOD_PORTRAITS['caradoc-ancient-pysgod'],
  'cadwaladr-pysgod': HOUSE_PYSGOD_PORTRAITS['cadwaladr-pysgod'],
  'hewet-wylan': HOUSE_DRAIG_PORTRAITS['hewet-wylan'],
  'generis-draig': HOUSE_DRAIG_PORTRAITS['generis-draig'],
  'morgana-wylan': HOUSE_NEIDR_PORTRAITS['morgana-wylan'],
  'yvain-neidr': HOUSE_NEIDR_PORTRAITS['yvain-neidr'],
  'bedivere-wylan': HOUSE_PYSGOD_PORTRAITS['bedivere-wylan'],
  'caitrin-pysgod': HOUSE_PYSGOD_PORTRAITS['caitrin-pysgod'],
  'gareth-illewod': HOUSE_ILLEWOD_PORTRAITS['gareth-illewod'],
  'selsye-wylan': HOUSE_ILLEWOD_PORTRAITS['selsye-wylan'],
  'marared-illewod': HOUSE_ILLEWOD_PORTRAITS['marared-illewod'],
  'neala-wylan': HOUSE_WYRM_PORTRAITS['neala-wylan'],
  'shan-wyrm': HOUSE_WYRM_PORTRAITS['shan-wyrm']
});
