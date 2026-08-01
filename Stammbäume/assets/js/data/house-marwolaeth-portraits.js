import { HOUSE_ARTH_PORTRAITS } from './house-arth-portraits.js';
import { HOUSE_CEIRWYN_PORTRAITS } from './house-ceirwyn-portraits.js';
import { HOUSE_DIENYDDIWR_PORTRAITS } from './house-dienyddiwr-portraits.js';
import { HOUSE_DRAIG_PORTRAITS } from './house-draig-portraits.js';
import { HOUSE_DYNGWN_PORTRAITS } from './house-dyngwn-portraits.js';
import { HOUSE_GAFYR_PORTRAITS } from './house-gafyr-portraits.js';
import { HOUSE_GWEFRYDD_PORTRAITS } from './house-gwefrydd-portraits.js';
import { HOUSE_GWYVERN_PORTRAITS } from './house-gwyvern-portraits.js';
import { HOUSE_PENDERYN_PORTRAITS } from './house-penderyn-portraits.js';
import { HOUSE_PYSGOD_PORTRAITS } from './house-pysgod-portraits.js';
import { HOUSE_SAETHWYR_PORTRAITS } from './house-saethwyr-portraits.js';
import { HOUSE_WYLAN_PORTRAITS } from './house-wylan-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-marwolaeth';

export const HOUSE_MARWOLAETH_LOCAL_PORTRAITS = Object.freeze({
  'uryen-marwolaeth': `${PORTRAIT_ROOT}/uryen-marwolaeth.jpg`,
  'eimear-ailella': `${PORTRAIT_ROOT}/eimear-ailella.png`,
  'llwyrddyddwg-marwolaeth': `${PORTRAIT_ROOT}/llwyrddyddwg-marwolaeth.jpg`,
  'llwyarch-marwolaeth': `${PORTRAIT_ROOT}/llwyarch-marwolaeth.jpg`,
  'seigine-luga': `${PORTRAIT_ROOT}/seigine-luga.jpg`,
  'merrion-1582-crefyddol': `${PORTRAIT_ROOT}/merrion-1582-crefyddol.jpg`,
  'limwris-draenog': `${PORTRAIT_ROOT}/limwris-draenog.jpg`,
  'gwennan-marwolaeth': `${PORTRAIT_ROOT}/gwennan-marwolaeth.jpg`,
  'neirin-marwolaeth': `${PORTRAIT_ROOT}/neirin-marwolaeth.jpg`,
  'gregory-marwolaeth': `${PORTRAIT_ROOT}/gregory-marwolaeth.jpg`,
  'llywelyn-marwolaeth': `${PORTRAIT_ROOT}/llywelyn-marwolaeth.jpg`,
  'llewella-marwolaeth': `${PORTRAIT_ROOT}/llewella-marwolaeth.jpg`,
  'quinn-ailella': `${PORTRAIT_ROOT}/quinn-ailella.png`,
  'griffith-marwolaeth': `${PORTRAIT_ROOT}/griffith-marwolaeth.jpg`,
  'pavetta-marwolaeth': `${PORTRAIT_ROOT}/pavetta-marwolaeth.jpg`,
  'deiniol-marwolaeth': `${PORTRAIT_ROOT}/deiniol-marwolaeth.jpg`,
  'helga-helgr': `${PORTRAIT_ROOT}/helga-helgr.png`,
  'duny-saith': `${PORTRAIT_ROOT}/duny-saith.png`,
  'endellion-morforwyn': `${PORTRAIT_ROOT}/endellion-morforwyn.png`,
  'morwenna-marwolaeth': `${PORTRAIT_ROOT}/morwenna-marwolaeth.jpg`,
  'penryn-marwolaeth': `${PORTRAIT_ROOT}/penryn-marwolaeth.jpg`,
  'sinna-cumhail': `${PORTRAIT_ROOT}/sinna-cumhail.jpg`,
  'tanwen-blach': `${PORTRAIT_ROOT}/tanwen-blach.png`,
  'peredur-geoffrey-marwolaeth': `${PORTRAIT_ROOT}/peredur-geoffrey-marwolaeth.jpg`,
  'ifan-marwolaeth': `${PORTRAIT_ROOT}/ifan-marwolaeth.jpg`,
  'venora-marwolaeth': `${PORTRAIT_ROOT}/venora-marwolaeth.jpg`,
  'arian-marwolaeth': `${PORTRAIT_ROOT}/arian-marwolaeth.jpg`,
  'jowna-marwolaeth': `${PORTRAIT_ROOT}/jowna-marwolaeth.jpg`
});

export const HOUSE_MARWOLAETH_PORTRAITS = Object.freeze({
  ...HOUSE_MARWOLAETH_LOCAL_PORTRAITS,
  'gwydolwyn-marwolaeth': 'assets/images/portraits/haus-draenog/gwydolwyn-marwolaeth.png',
  'eiddyl-wylan': HOUSE_WYLAN_PORTRAITS['eiddyl-wylan'],
  'trayvon-dienyddiwr': HOUSE_DIENYDDIWR_PORTRAITS['trayvon-dienyddiwr'],
  'sieffre-marwolaeth': HOUSE_PENDERYN_PORTRAITS['sieffre-marwolaeth'],
  'endellion-gwyvern': HOUSE_GWYVERN_PORTRAITS['endellion-gwyvern'],
  'grippiud-marwolaeth': HOUSE_GWYVERN_PORTRAITS['grippiud-marwolaeth'],
  'delwen-dyngwn': HOUSE_DYNGWN_PORTRAITS['delwen-dyngwn'],
  'ninian-marwolaeth': HOUSE_DYNGWN_PORTRAITS['ninian-marwolaeth'],
  'edric-gwefrydd': HOUSE_GWEFRYDD_PORTRAITS['edric-gwefrydd'],
  'trahern-draig': HOUSE_DRAIG_PORTRAITS['trahern-draig'],
  'cadfael-1681-arth': HOUSE_ARTH_PORTRAITS['cadfael-1681-arth'],
  'gwendolen-marwolaeth': HOUSE_ARTH_PORTRAITS['gwendolen-marwolaeth'],
  'dafydd-dyngwn': HOUSE_DYNGWN_PORTRAITS['dafydd-dyngwn'],
  'gwenllian-marwolaeth': HOUSE_DYNGWN_PORTRAITS['gwenllian-marwolaeth'],
  'gaheris-pysgod': HOUSE_PYSGOD_PORTRAITS['gaheris-pysgod'],
  'adelayne-marwolaeth': HOUSE_PYSGOD_PORTRAITS['adelayne-marwolaeth'],
  'rhiann-ceirwyn': HOUSE_CEIRWYN_PORTRAITS['rhiann-ceirwyn'],
  'meurig-marwolaeth': HOUSE_CEIRWYN_PORTRAITS['meurig-marwolaeth'],
  'caradog-saethwyr': HOUSE_SAETHWYR_PORTRAITS['caradog-saethwyr'],
  'jenniffer-marwolaeth': HOUSE_SAETHWYR_PORTRAITS['jenniffer-marwolaeth'],
  'roderic-gafyr': HOUSE_GAFYR_PORTRAITS['roderic-gafyr'],
  'eleri-marwolaeth': HOUSE_GAFYR_PORTRAITS['eleri-marwolaeth']
});
