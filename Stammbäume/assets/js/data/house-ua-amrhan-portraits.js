import { HOUSE_ARD_TRODACH_PORTRAITS } from './house-ard-trodach-portraits.js';
import { HOUSE_RU_GORTACH_PORTRAITS } from './house-ru-gortach-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-ua-amrhan';

export const HOUSE_UA_AMRHAN_LOCAL_PORTRAIT_FILES = Object.freeze({
  'nathrachan-cuinn': 'nathrachan-cuinn.png',
  'faithleach-amrhan': 'faithleach-amrhan.png',
  'vaithreach-amrhan': 'vaithreach-amrhan.png',
  'quioghan-amrhan': 'quioghan-amrhan.png',
  'zeabhnan-amrhan': 'zeabhnan-amrhan.png',
  'tighearnach-amrhan': 'tighearnach-amrhan.png',
  'tarlachan-amrhan': 'tarlachan-amrhan.png',
  'fuirseach-amrhan': 'fuirseach-amrhan.png',
  'qubhna-amrhan': 'qubhna-amrhan.png',
  'fionntan-amrhan': 'fionntan-amrhan.png',
  'oibhrin-amrhan': 'oibhrin-amrhan.png',
  'rionach-amhran': 'rionach-amrhan.png',
  'scannlan-amrhan': 'scannlan-amrhan.png',
  'rogaire-amrhan': 'rogaire-amrhan.png',
  'zomhlaigh-amrhan': 'zomhlaigh-amrhan.png',
  'zulach-amrhan': 'zulach-amrhan.png',
  'gorman-amrhan': 'gorman-amrhan.png',
  'xiston-amrhan': 'xiston-amrhan.png',
  'jorna-amrhan': 'jorna-amrhan.png',
  'muiris-amrhan': 'muiris-amrhan.png',
  'nalainn-amrhan': 'nalainn-amrhan.png',
  'eachann-amrhan': 'eachann-amrhan.png'
});

export const HOUSE_UA_AMRHAN_LOCAL_PORTRAIT_IDS = Object.freeze(
  Object.keys(HOUSE_UA_AMRHAN_LOCAL_PORTRAIT_FILES)
);

export const HOUSE_UA_AMRHAN_REUSED_PORTRAIT_IDS = Object.freeze([
  'lorcan-trodach',
  'kinneth-gortach',
  'tomaltach-airgid'
]);

export const HOUSE_UA_AMRHAN_PORTRAITS = Object.freeze({
  ...Object.fromEntries(Object.entries(HOUSE_UA_AMRHAN_LOCAL_PORTRAIT_FILES).map(
    ([personId, fileName]) => [personId, `${PORTRAIT_ROOT}/${fileName}`]
  )),
  'lorcan-trodach': HOUSE_ARD_TRODACH_PORTRAITS['lorcan-trodach'],
  'kinneth-gortach': HOUSE_RU_GORTACH_PORTRAITS['kinneth-gortach'],
  'tomaltach-airgid': 'assets/images/portraits/haus-tir-an-airgid/tomaltach-airgid.png'
});
