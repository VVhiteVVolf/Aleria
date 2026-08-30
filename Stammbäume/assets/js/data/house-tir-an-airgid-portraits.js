import { HOUSE_GWYVERN_PORTRAITS } from './house-gwyvern-portraits.js';
import { HOUSE_IOMRACH_PORTRAITS } from './house-iomrach-portraits.js';
import { HOUSE_NIC_CAOIMHE_PORTRAITS } from './house-nic-caoimhe-portraits.js';
import { HOUSE_RU_GORTACH_PORTRAITS } from './house-ru-gortach-portraits.js';
import { HOUSE_SIDHE_SOMHAIRLE_PORTRAITS } from './house-sidhe-somhairle-portraits.js';
import { HOUSE_UA_AMRHAN_PORTRAITS } from './house-ua-amrhan-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-tir-an-airgid';

export const HOUSE_TIR_AN_AIRGID_LOCAL_PORTRAIT_FILES = Object.freeze({
  'tomaltach-founder-airgid': 'tomaltach-founder-airgid.png',
  'gaothaire-airgid': 'gaothaire-airgid.png',
  'donndubhan-airgid': 'donndubhan-airgid.png',
  'meallchu-airgid': 'meallchu-airgid.png',
  'tomaltach-airgid': 'tomaltach-airgid.png',
  'karrach-airgid': 'karrach-airgid.png',
  'glaodhran-airgid': 'glaodhran-airgid.png',
  'dallan-airgid': 'dallan-airgid.png',
  'sorley-airgid': 'sorley-airgid.png',
  'piaras-airgid': 'piaras-airgid.png',
  'cormac-airgid': 'cormac-airgid.png',
  'eachan-airgid': 'eachan-airgid.png',
  'dubhan-airgid': 'dubhan-airgid.png',
  'quinn-airgid': 'quinn-airgid.png',
  'zosie-airgid': 'zosie-airgid.png',
  'siofra-airgid': 'siofra-airgid.png',
  'rua-airgid': 'rua-airgid.png',
  'kester-airgid': 'kester-airgid.png',
  'halla-airgid': 'halla-airgid.png'
});

export const HOUSE_TIR_AN_AIRGID_LOCAL_PORTRAIT_IDS = Object.freeze(
  Object.keys(HOUSE_TIR_AN_AIRGID_LOCAL_PORTRAIT_FILES)
);

export const HOUSE_TIR_AN_AIRGID_REUSED_PORTRAIT_IDS = Object.freeze([
  'aodhluan-1621-gortach',
  'proinnseas-somhairle',
  'conall-airgid',
  'qubhna-amrhan',
  'purseil-iomrach',
  'fainne-1696-caoimhe'
]);

export const HOUSE_TIR_AN_AIRGID_PORTRAITS = Object.freeze({
  ...Object.fromEntries(Object.entries(HOUSE_TIR_AN_AIRGID_LOCAL_PORTRAIT_FILES).map(
    ([personId, fileName]) => [personId, `${PORTRAIT_ROOT}/${fileName}`]
  )),
  'aodhluan-1621-gortach': HOUSE_RU_GORTACH_PORTRAITS['aodhluan-1621-gortach'],
  'proinnseas-somhairle': HOUSE_SIDHE_SOMHAIRLE_PORTRAITS['proinnseas-somhairle'],
  'conall-airgid': HOUSE_GWYVERN_PORTRAITS['conall-airgid'],
  'qubhna-amrhan': HOUSE_UA_AMRHAN_PORTRAITS['qubhna-amrhan'],
  'purseil-iomrach': HOUSE_IOMRACH_PORTRAITS['purseil-iomrach'],
  'fainne-1696-caoimhe': HOUSE_NIC_CAOIMHE_PORTRAITS['fainne-1696-caoimhe']
});
