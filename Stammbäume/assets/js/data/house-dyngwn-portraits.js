import { HOUSE_ARTH_LOCAL_PORTRAITS } from './house-arth-local-portraits.js';
import { HOUSE_ARWYDD_PORTRAITS } from './house-arwydd-portraits.js';
import { HOUSE_CEIRWYN_PORTRAITS } from './house-ceirwyn-portraits.js';
import { HOUSE_DIENYDDIWR_PORTRAITS } from './house-dienyddiwr-portraits.js';
import { HOUSE_DRAIG_PORTRAITS } from './house-draig-portraits.js';
import { HOUSE_GRAEL_PORTRAITS } from './house-grael-portraits.js';
import { HOUSE_GWEFRYDD_PORTRAITS } from './house-gwefrydd-portraits.js';
import { HOUSE_GWYVERN_PORTRAITS } from './house-gwyvern-portraits.js';
import { HOUSE_NEIDR_PORTRAITS } from './house-neidr-portraits.js';
import { HOUSE_PENDERYN_PORTRAITS } from './house-penderyn-portraits.js';
import { HOUSE_PENDRAG_PORTRAITS } from './house-pendrag-portraits.js';
import { HOUSE_PYSGOD_PORTRAITS } from './house-pysgod-portraits.js';
import { HOUSE_SAETHWYR_PORTRAITS } from './house-saethwyr-portraits.js';
import { HOUSE_WYLAN_PORTRAITS } from './house-wylan-portraits.js';
import { HOUSE_WYRM_PORTRAITS } from './house-wyrm-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-dyngwn';

const LOCAL_DYNGWN_PORTRAITS = Object.freeze({
  'kynwas-schwertarm-dyngwn': `${PORTRAIT_ROOT}/kynwas-schwertarm-dyngwn.jpg`,
  'niam-fiachraoin': `${PORTRAIT_ROOT}/niam-fiachraoin.jpg`,
  'goronwy-dyngwn': `${PORTRAIT_ROOT}/goronwy-dyngwn.jpg`,
  'arthur-dyngwn': `${PORTRAIT_ROOT}/arthur-dyngwn.jpg`,
  'gorn-gallchobhair': `${PORTRAIT_ROOT}/gorn-gallchobhair.jpg`,
  'murvin-morfil': `${PORTRAIT_ROOT}/murvin-morfil.png`,
  'merlion-morthwyll': `${PORTRAIT_ROOT}/merlion-morthwyll.png`,
  'dilwyn-dyngwn': `${PORTRAIT_ROOT}/dilwyn-dyngwn.jpg`,
  'dadweir-dyngwn': `${PORTRAIT_ROOT}/dadweir-dyngwn.jpg`,
  'gwrtheyrn-dinefwr': `${PORTRAIT_ROOT}/gwrtheyrn-dinefwr.jpg`,
  'collen-hwyaden': `${PORTRAIT_ROOT}/collen-hwyaden.png`,
  'ninian-marwolaeth': `${PORTRAIT_ROOT}/ninian-marwolaeth.jpg`,
  'gwlgawd-dyngwn': `${PORTRAIT_ROOT}/gwlgawd-dyngwn.jpg`,
  'glewlwyd-dyngwn': `${PORTRAIT_ROOT}/glewlwyd-dyngwn.jpg`,
  'glendower-dyngwn': `${PORTRAIT_ROOT}/glendower-dyngwn.jpg`,
  'gwynnan-dyngwn': `${PORTRAIT_ROOT}/gwynnan-dyngwn.jpg`,
  'gwynham-mwyalchen': `${PORTRAIT_ROOT}/gwynham-mwyalchen.png`,
  'fidelma-lockart': `${PORTRAIT_ROOT}/fidelma-lockart.jpg`,
  'rhynnon-llwynog': `${PORTRAIT_ROOT}/rhynnon-llwynog.png`,
  'emer-choinnich': `${PORTRAIT_ROOT}/emer-choinnich.jpg`,
  'morwen-dyngwn': `${PORTRAIT_ROOT}/morwen-dyngwn.jpg`,
  'brangwen-dyngwn': `${PORTRAIT_ROOT}/brangwen-dyngwn.jpg`,
  'dafydd-dyngwn': `${PORTRAIT_ROOT}/dafydd-dyngwn.jpg`,
  'endelyn-dyngwn': `${PORTRAIT_ROOT}/endelyn-dyngwn.jpg`,
  'gethin-dyngwn': `${PORTRAIT_ROOT}/gethin-dyngwn.jpg`,
  'jeanae-dyngwn': `${PORTRAIT_ROOT}/jeanae-dyngwn.jpg`,
  'stennis-gwefrydd': `${PORTRAIT_ROOT}/stennis-gwefrydd.png`,
  'gwernwy-gwarchod': `${PORTRAIT_ROOT}/gwernwy-gwarchod.jpg`,
  'gwenllian-marwolaeth': `${PORTRAIT_ROOT}/gwenllian-marwolaeth.jpg`,
  'idwal-baedd': `${PORTRAIT_ROOT}/idwal-baedd.png`,
  'gwenllian-creyr': `${PORTRAIT_ROOT}/gwenllian-creyr.png`,
  'hael-tir-addawol': `${PORTRAIT_ROOT}/hael-tir-addawol.jpg`,
  'kynwas-1694-dyngwn': `${PORTRAIT_ROOT}/kynwas-1694-dyngwn.jpg`,
  'dolena-dyngwn': `${PORTRAIT_ROOT}/dolena-dyngwn.jpg`,
  'gulda-nachtjaeger': `${PORTRAIT_ROOT}/gulda-nachtjaeger.png`,
  'meurig-blach': `${PORTRAIT_ROOT}/meurig-blach.png`,
  'ystafel-dyngwn': `${PORTRAIT_ROOT}/ystafel-dyngwn.jpg`,
  'aeddan-tiwna': `${PORTRAIT_ROOT}/aeddan-tiwna.png`,
  'hael-1722-dyngwn': `${PORTRAIT_ROOT}/hael-1722-dyngwn.jpg`,
  'meleri-dyngwn': `${PORTRAIT_ROOT}/meleri-dyngwn.jpg`,
  'iud-dyngwn': `${PORTRAIT_ROOT}/iud-dyngwn.jpg`,
  'tydfil-dyngwn': `${PORTRAIT_ROOT}/tydfil-dyngwn.jpg`,
  'gwern-dyngwn': `${PORTRAIT_ROOT}/gwern-dyngwn.jpg`,
  'robyn-dyngwn': `${PORTRAIT_ROOT}/robyn-dyngwn.jpg`,
  'lyanna-dyngwn': `${PORTRAIT_ROOT}/lyanna-dyngwn.jpg`,
  'rhon-dyngwn': `${PORTRAIT_ROOT}/rhon-dyngwn.jpg`,
  'loyde-dyngwn': `${PORTRAIT_ROOT}/loyde-dyngwn.jpg`,
  'dyddgu-dyngwn': `${PORTRAIT_ROOT}/dyddgu-dyngwn.jpg`,
  'oth-dyngwn': `${PORTRAIT_ROOT}/oth-dyngwn.jpg`,
  'gwerful-dyngwn': `${PORTRAIT_ROOT}/gwerful-dyngwn.jpg`
});

export const HOUSE_DYNGWN_PORTRAITS = Object.freeze({
  ...LOCAL_DYNGWN_PORTRAITS,
  'melwas-pendrag': HOUSE_PENDRAG_PORTRAITS['melwas-pendrag'],
  'rhonwen-dyngwn': HOUSE_PENDRAG_PORTRAITS['rhonwen-dyngwn'],
  'cadogan-dyngwn': HOUSE_DIENYDDIWR_PORTRAITS['cadogan-dyngwn'],
  'arianell-dienyddiwr': HOUSE_DIENYDDIWR_PORTRAITS['arianell-dienyddiwr'],
  'garith-dyngwn': HOUSE_DIENYDDIWR_PORTRAITS['garith-dyngwn'],
  'revelyn-dienyddiwr': HOUSE_DIENYDDIWR_PORTRAITS['revelyn-dienyddiwr'],
  'delvin-dyngwn': HOUSE_DIENYDDIWR_PORTRAITS['delvin-dyngwn'],
  'ysabeth-dienyddiwr': HOUSE_DIENYDDIWR_PORTRAITS['ysabeth-dienyddiwr'],
  'sioned-dyngwn': HOUSE_DRAIG_PORTRAITS['sioned-dyngwn'],
  'cadfael-draig': HOUSE_DRAIG_PORTRAITS['cadfael-draig'],
  'morgan-dyngwn': HOUSE_NEIDR_PORTRAITS['morgan-dyngwn'],
  'aoirghe-neidr': HOUSE_NEIDR_PORTRAITS['aoirghe-neidr'],
  'rhonwen-grael': HOUSE_GRAEL_PORTRAITS['rhonwen-grael'],
  'dewey-dyngwn': HOUSE_CEIRWYN_PORTRAITS['dewey-dyngwn'],
  'gwennoeth-ceirwyn': HOUSE_CEIRWYN_PORTRAITS['gwennoeth-ceirwyn'],
  'grugyn-dyngwn': HOUSE_CEIRWYN_PORTRAITS['grugyn-dyngwn'],
  'dilys-ceirwyn': HOUSE_CEIRWYN_PORTRAITS['dilys-ceirwyn'],
  'dylis-dyngwn': HOUSE_WYRM_PORTRAITS['dylis-dyngwn'],
  'gallgoid-wyrm': HOUSE_WYRM_PORTRAITS['gallgoid-wyrm'],
  'dean-dyngwn': HOUSE_WYRM_PORTRAITS['dean-dyngwn'],
  'meriel-wyrm': HOUSE_WYRM_PORTRAITS['meriel-wyrm'],
  'dewyll-dyngwn': HOUSE_GWEFRYDD_PORTRAITS['dewyll-dyngwn'],
  'gwenhwyfar-gwefrydd': HOUSE_GWEFRYDD_PORTRAITS['gwenhwyfar-gwefrydd'],
  'enola-dyngwn': HOUSE_GWYVERN_PORTRAITS['enola-dyngwn'],
  'seithved-gwyvern': HOUSE_GWYVERN_PORTRAITS['seithved-gwyvern'],
  'bethania-dyngwn': HOUSE_PENDERYN_PORTRAITS['bethania-dyngwn'],
  'talfryn-penderyn': HOUSE_PENDERYN_PORTRAITS['talfryn-penderyn'],
  'derwyn-dyngwn': HOUSE_ARTH_LOCAL_PORTRAITS['derwyn-dyngwn'],
  'lynfa-1696-arth': HOUSE_ARTH_LOCAL_PORTRAITS['lynfa-1696-arth'],
  'eirlys-dyngwn': HOUSE_WYLAN_PORTRAITS['eirlys-dyngwn'],
  'liam-wylan': HOUSE_WYLAN_PORTRAITS['liam-wylan'],
  'dillan-dyngwn': HOUSE_SAETHWYR_PORTRAITS['dillan-dyngwn'],
  'hafren-saethwyr': HOUSE_SAETHWYR_PORTRAITS['hafren-saethwyr'],
  'meilyr-pysgod': HOUSE_PYSGOD_PORTRAITS['meilyr-pysgod'],
  'hafwen-dwyngwn': HOUSE_PYSGOD_PORTRAITS['hafwen-dwyngwn'],
  'iorwerth-arwydd': HOUSE_ARWYDD_PORTRAITS['iorwerth-arwydd'],
  'dyddi-dyngwn': HOUSE_ARWYDD_PORTRAITS['dyddi-dyngwn']
});

export const HOUSE_DYNGWN_LOCAL_PORTRAITS = LOCAL_DYNGWN_PORTRAITS;
