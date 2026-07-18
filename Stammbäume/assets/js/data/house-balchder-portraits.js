import { HOUSE_CHWEDLONOL_PORTRAITS } from './house-chwedlonol-portraits.js';
import { HOUSE_CLUDWYR_PORTRAITS } from './house-cludwyr-portraits.js';
import { HOUSE_GELYN_PORTRAITS } from './house-gelyn-portraits.js';
import { HOUSE_RHYDDID_PORTRAITS } from './house-rhyddid-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-balchder';
const LOCAL_JPG_PORTRAIT_IDS = Object.freeze([
  'lugh-seldryn',
  'dalvin-balchder',
  'iseult-caerlaen',
  'genofeva-balchder',
  'alastair-gwyntog',
  'kimball-balchder',
  'revelyn',
  'cerrin-balchder',
  'wyett-barus',
  'jenelle-balchder',
  'harald',
  'armel-balchder',
  'anwen-balchder',
  'brina-balchder',
  'owen-balchder',
  'sheev-gwared',
  'blodwen-balchder',
  'rice-balchder',
  'eniana-balchder',
  'jareth-balchder',
  'lynnia-balchder'
]);

export const HOUSE_BALCHDER_PORTRAITS = Object.freeze({
  ...Object.fromEntries(LOCAL_JPG_PORTRAIT_IDS.map(personId => [
    personId,
    `${PORTRAIT_ROOT}/${personId}.jpg`
  ])),
  // Die beiden ergänzten Portraits liegen in der Quelle als PNG vor.
  'aerona-balchder': `${PORTRAIT_ROOT}/aerona-balchder.png`,
  'godwyn-sgrechiwr': `${PORTRAIT_ROOT}/godwyn-sgrechiwr.png`,

  // Geteilte Weltpersonen verwenden jeweils das bereits kanonisch gehostete Portrait.
  'avan-balchder': HOUSE_RHYDDID_PORTRAITS['avan-balchder'],
  'ronda-rhyddid': HOUSE_RHYDDID_PORTRAITS['ronda-rhyddid'],
  'kamber-balchder': HOUSE_GELYN_PORTRAITS['kamber-balchder'],
  'senara-gelyn': HOUSE_GELYN_PORTRAITS['senara-gelyn'],
  'klervi-balchder': HOUSE_CLUDWYR_PORTRAITS['klervi-balchder'],
  'rhain-cludwyr': HOUSE_CLUDWYR_PORTRAITS['rhain-cludwyr'],
  'marven-balchder': HOUSE_CHWEDLONOL_PORTRAITS['marven-balchder'],
  'morgaine-chwedlonol': HOUSE_CHWEDLONOL_PORTRAITS['morgaine-chwedlonol']
});
