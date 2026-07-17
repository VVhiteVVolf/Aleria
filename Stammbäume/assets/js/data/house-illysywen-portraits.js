import { HOUSE_DRAIG_PORTRAITS } from './house-draig-portraits.js';
import { HOUSE_GWEFRYDD_PORTRAITS } from './house-gwefrydd-portraits.js';
import { HOUSE_GWYVERN_PORTRAITS } from './house-gwyvern-portraits.js';
import { HOUSE_SAETHWYR_PORTRAITS } from './house-saethwyr-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-illysywen';
const LOCAL_PORTRAIT_IDS = Object.freeze([
  'arwel-illysywen',
  'llwyd-illysywen',
  'gogyvwlch-illysywen',
  'malachy-seaghda',
  'ercwlff-illysywen',
  'morwen-illysywen',
  'einion-illysywen',
  'dagny-brathfengr',
  'owen-grawn',
  'xantippe-pyrth',
  'onora-eldrath',
  'hugwan-illysywen',
  'fauna-illysywen',
  'nasuada-rochraide',
  'sior-illysywen',
  'megyn-illysywen',
  'iwan-illysywen',
  'innogen-eldath'
]);

export const HOUSE_ILLYSYWEN_PORTRAITS = Object.freeze({
  ...Object.fromEntries(LOCAL_PORTRAIT_IDS.map(personId => [
    personId,
    `${PORTRAIT_ROOT}/${personId}.jpg`
  ])),
  'ormund-gwefrydd': HOUSE_GWEFRYDD_PORTRAITS['ormund-gwefrydd'],
  'kimball-gwyvern': HOUSE_GWYVERN_PORTRAITS['kimball-gwyvern'],
  'nodawl-illysywen': HOUSE_DRAIG_PORTRAITS['nodawl-illysywen'],
  'rhonwen-draig': HOUSE_DRAIG_PORTRAITS['rhonwen-draig'],
  'mair-draig': HOUSE_DRAIG_PORTRAITS['mair-draig'],
  'wenna-saethwyr': HOUSE_SAETHWYR_PORTRAITS['wenna-saethwyr']
});
