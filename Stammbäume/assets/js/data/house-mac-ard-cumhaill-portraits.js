import { HOUSE_ADERYN_PORTRAITS } from './house-aderyn-portraits.js';
import { HOUSE_DRAIG_PORTRAITS } from './house-draig-portraits.js';
import { HOUSE_FIR_AN_TARVO_PORTRAITS } from './house-fir-an-tarvo-portraits.js';
import { HOUSE_MARWOLAETH_PORTRAITS } from './house-marwolaeth-portraits.js';
import { HOUSE_RUIN_UA_LAOCH_LOCAL_PORTRAITS } from './house-ruin-ua-laoch-local-portraits.js';
import { HOUSE_UA_EIRCE_LOCAL_PORTRAITS } from './house-ua-eirce-local-portraits.js';
import { HOUSE_UI_FIACHRACH_LOCAL_PORTRAITS } from './house-ui-fiachrach-local-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-mac-ard-cumhaill';

const LOCAL_PORTRAIT_IDS = Object.freeze([
  'fionnbarr-cumhail',
  'faolan-ancient-cumhail',
  'tadhg-ancient-cumhail',
  'senan-ancient-cumhail',
  'cadan-cumhail',
  'daithin-cumhail',
  'donnchadh-cumhail',
  'fionn-1245-cumhail',
  'sinna-1250-cumhail',
  'fergus-cumhail',
  'oisin-1599-cumhail',
  'lochlainn-cumhail',
  'ruadhan-cumhail',
  'finnegan-cumhail',
  'roarke-cumhail',
  'tiernan-cumhail',
  'lugh-cumhail',
  'dubhan-cumhail',
  'cathair-cumhail',
  'eithne-cumhail',
  'roisin-cumhail',
  'earraigh-cumhail',
  'tairdelbach-cumhail',
  'fionn-1686-cumhail',
  'saorlaith-cumhail',
  'orflaith-cumhail',
  'senan-1700-cumhail',
  'brietta-cumhail',
  'odran-cumhail',
  'cennetig-cumhail',
  'domhnall-1702-cumhail',
  'faolan-1714-cumhail',
  'oisin-1716-cumhail',
  'fiona-cumhail',
  'finn-cumhail',
  'muireen-cumhail',
  'ronan-cumhail',
  'eoghan-cumhail',
  'narach-cumhail',
  'alawen-1726-cumhail',
  'mughna-ruca',
  'ailis-cumhail'
]);

export const HOUSE_MAC_ARD_CUMHAILL_PORTRAITS = Object.freeze({
  ...Object.fromEntries(LOCAL_PORTRAIT_IDS.map(personId => [
    personId,
    `${PORTRAIT_ROOT}/${personId}.jpg`
  ])),
  'findabhair-cumhail': HOUSE_DRAIG_PORTRAITS['findabhair-cumhail'],
  'celtigern-draig': HOUSE_DRAIG_PORTRAITS['celtigern-draig'],
  'garith-draig': HOUSE_DRAIG_PORTRAITS['garith-draig'],
  'cynan-draig': HOUSE_DRAIG_PORTRAITS['cynan-draig'],
  'domnall-cumhail': HOUSE_DRAIG_PORTRAITS['domnall-cumhail'],
  'alawen-cumhail': HOUSE_DRAIG_PORTRAITS['alawen-cumhail'],
  'cahir-draig': HOUSE_DRAIG_PORTRAITS['cahir-draig'],
  'sinna-cumhail': HOUSE_MARWOLAETH_PORTRAITS['sinna-cumhail'],
  'morwenna-marwolaeth': HOUSE_MARWOLAETH_PORTRAITS['morwenna-marwolaeth'],
  'peredur-geoffrey-marwolaeth': HOUSE_MARWOLAETH_PORTRAITS['peredur-geoffrey-marwolaeth'],
  'arthen-aderyn': HOUSE_ADERYN_PORTRAITS['arthen-aderyn'],
  'grada-fiachrach': HOUSE_UI_FIACHRACH_LOCAL_PORTRAITS['grada-fiachrach'],
  'brock-eirce': HOUSE_UA_EIRCE_LOCAL_PORTRAITS['brock-eirce'],
  'reamonn-laoch': HOUSE_RUIN_UA_LAOCH_LOCAL_PORTRAITS['reamonn-laoch'],
  'iarlaith-gallchobhair': 'assets/images/portraits/haus-fir-an-gallchobhair/iarlaith-gallchobhair.jpg',
  'uilinn-frisealach': 'assets/images/portraits/haus-ard-frisealach/uilinn-frisealach.png',
  'ceiron-tarvo': HOUSE_FIR_AN_TARVO_PORTRAITS['ceiron-tarvo']
});
