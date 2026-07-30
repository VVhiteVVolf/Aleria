import { HOUSE_DRAIG_PORTRAITS } from './house-draig-portraits.js';
import { HOUSE_GRAEL_PORTRAITS } from './house-grael-portraits.js';
import { HOUSE_GWEFRYDD_PORTRAITS } from './house-gwefrydd-portraits.js';
import { HOUSE_ILLEWOD_PORTRAITS } from './house-illewod-portraits.js';
import { HOUSE_PENDRAG_PORTRAITS } from './house-pendrag-portraits.js';
import { HOUSE_SAETHWYR_PORTRAITS } from './house-saethwyr-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-ceirwyn';

const LOCAL_CEIRWYN_PORTRAITS = Object.freeze({
  'gorsedd-ceirwyn': `${PORTRAIT_ROOT}/gorsedd-ceirwyn.png`,
  'tetra-ceirwyn': `${PORTRAIT_ROOT}/tetra-ceirwyn.png`,
  'caedmon-ceirwyn': `${PORTRAIT_ROOT}/caedmon-ceirwyn.png`,
  'aslaug-skald': `${PORTRAIT_ROOT}/aslaug-skald.png`,
  'gruffudd-ceirwyn': `${PORTRAIT_ROOT}/gruffudd-ceirwyn.png`,
  'magnhild-sokaren': `${PORTRAIT_ROOT}/magnhild-sokaren.png`,
  'seaghdha-bhaird': `${PORTRAIT_ROOT}/seaghdha-bhaird.jpg`,
  'dewey-dyngwn': `${PORTRAIT_ROOT}/dewey-dyngwn.jpg`,
  'piet-ridderspore': `${PORTRAIT_ROOT}/piet-ridderspore.jpg`,
  'morgan-ceirwyn': `${PORTRAIT_ROOT}/morgan-ceirwyn.png`,
  'edwyn-ceirwyn': `${PORTRAIT_ROOT}/edwyn-ceirwyn.png`,
  'merlion-ceirwyn': `${PORTRAIT_ROOT}/merlion-ceirwyn.png`,
  'dilys-ceirwyn': `${PORTRAIT_ROOT}/dilys-ceirwyn.png`,
  'astrid-sterkr': `${PORTRAIT_ROOT}/astrid-sterkr.png`,
  'fenella-bhaird': `${PORTRAIT_ROOT}/fenella-bhaird.jpg`,
  'irnskar-brathfengr': `${PORTRAIT_ROOT}/irnskar-brathfengr.png`,
  'grugyn-dyngwn': `${PORTRAIT_ROOT}/grugyn-dyngwn.jpg`,
  'mandon-ceirwyn': `${PORTRAIT_ROOT}/mandon-ceirwyn.png`,
  'melvor-ceirwyn': `${PORTRAIT_ROOT}/melvor-ceirwyn.png`,
  'madoc-ceirwyn': `${PORTRAIT_ROOT}/madoc-ceirwyn.png`,
  'dagonet-ceirwyn': `${PORTRAIT_ROOT}/dagonet-ceirwyn.png`,
  'uthred-ceirwyn': `${PORTRAIT_ROOT}/uthred-ceirwyn.png`,
  'rhiann-ceirwyn': `${PORTRAIT_ROOT}/rhiann-ceirwyn.png`,
  'rhyannon-ceirwyn': `${PORTRAIT_ROOT}/rhyannon-ceirwyn.png`,
  'arian-ceirwyn': `${PORTRAIT_ROOT}/arian-ceirwyn.png`,
  'antke-skald': `${PORTRAIT_ROOT}/antke-skald.png`,
  'marge-ridderspore': `${PORTRAIT_ROOT}/marge-ridderspore.jpg`,
  'psylia-adorin': `${PORTRAIT_ROOT}/psylia-adorin.jpg`,
  'liska-sokaren': `${PORTRAIT_ROOT}/liska-sokaren.png`,
  'brunhilde-sokering': `${PORTRAIT_ROOT}/brunhilde-sokering.jpg`,
  'meurig-marwolaeth': `${PORTRAIT_ROOT}/meurig-marwolaeth.jpg`,
  'robyn-dienyddiwr': `${PORTRAIT_ROOT}/robyn-dienyddiwr.jpg`,
  'alastriona-morath': `${PORTRAIT_ROOT}/alastriona-morath.png`,
  'meiron-ceirwyn': `${PORTRAIT_ROOT}/meiron-ceirwyn.png`,
  'morwen-ceirwyn': `${PORTRAIT_ROOT}/morwen-ceirwyn.png`,
  'mairwen-ceirwyn': `${PORTRAIT_ROOT}/mairwen-ceirwyn.png`,
  'meilyr-ceirwyn': `${PORTRAIT_ROOT}/meilyr-ceirwyn.png`,
  'pwyll-ceirwyn': `${PORTRAIT_ROOT}/pwyll-ceirwyn.png`,
  'rawiyah-ceirwyn': `${PORTRAIT_ROOT}/rawiyah-ceirwyn.png`,
  'rhys-ceirwyn': `${PORTRAIT_ROOT}/rhys-ceirwyn.png`,
  'esylt-ceirwyn': `${PORTRAIT_ROOT}/esylt-ceirwyn.png`,
  'celyn-ceirwyn': `${PORTRAIT_ROOT}/celyn-ceirwyn.png`,
  'fflurwen-ceirwyn': `${PORTRAIT_ROOT}/fflurwen-ceirwyn.png`
});

export const HOUSE_CEIRWYN_PORTRAITS = Object.freeze({
  ...LOCAL_CEIRWYN_PORTRAITS,
  'ceirwyn-inlaw': HOUSE_PENDRAG_PORTRAITS['ceirwyn-inlaw'],
  'rhoslyn-pendrag': HOUSE_PENDRAG_PORTRAITS['rhoslyn-pendrag'],
  'rheinallt-grael': HOUSE_GRAEL_PORTRAITS['rheinallt-grael'],
  'kelyddon-grael': HOUSE_GRAEL_PORTRAITS['kelyddon-grael'],
  'taliesin-ceirwyn': HOUSE_GRAEL_PORTRAITS['taliesin-ceirwyn'],
  'arthgal-illewod': HOUSE_ILLEWOD_PORTRAITS['arthgal-illewod'],
  'land-ceirwyn': HOUSE_ILLEWOD_PORTRAITS['land-ceirwyn'],
  'rywalyn-pendrag': HOUSE_PENDRAG_PORTRAITS['rywalyn-pendrag'],
  'talla-ceirwyn': HOUSE_PENDRAG_PORTRAITS['talla-ceirwyn'],
  'renly-gwefrydd': HOUSE_GWEFRYDD_PORTRAITS['renly-gwefrydd'],
  'maelona-ceirwyn': HOUSE_GWEFRYDD_PORTRAITS['maelona-ceirwyn'],
  'trayvon-draig': HOUSE_DRAIG_PORTRAITS['trayvon-draig'],
  'rihanna-ceirwynn': HOUSE_DRAIG_PORTRAITS['rihanna-ceirwynn'],
  'anwyll-saethwyr': HOUSE_SAETHWYR_PORTRAITS['anwyll-saethwyr'],
  'maelys-ceirwyn': HOUSE_SAETHWYR_PORTRAITS['maelys-ceirwyn']
});

export const HOUSE_CEIRWYN_LOCAL_PORTRAITS = LOCAL_CEIRWYN_PORTRAITS;
