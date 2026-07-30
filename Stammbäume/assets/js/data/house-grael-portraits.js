import { HOUSE_ARTH_LOCAL_PORTRAITS } from './house-arth-local-portraits.js';
import { HOUSE_DRAIG_PORTRAITS } from './house-draig-portraits.js';
import { HOUSE_NEIDR_PORTRAITS } from './house-neidr-portraits.js';
import { HOUSE_PENDRAG_PORTRAITS } from './house-pendrag-portraits.js';
import { HOUSE_SAETHWYR_PORTRAITS } from './house-saethwyr-portraits.js';
import { HOUSE_WYRM_PORTRAITS } from './house-wyrm-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-grael';

const LOCAL_GRAEL_PORTRAITS = Object.freeze({
  'llwydawg-grael': `${PORTRAIT_ROOT}/llwydawg-grael.jpg`,
  'arlais-grael': `${PORTRAIT_ROOT}/arlais-grael.jpg`,
  'elspeth-couldwin': `${PORTRAIT_ROOT}/elspeth-couldwin.jpg`,
  'seaghdha-runda': `${PORTRAIT_ROOT}/seaghdha-runda.jpg`,
  'tymora-grael': `${PORTRAIT_ROOT}/tymora-grael.jpg`,
  'heveydd-grael': `${PORTRAIT_ROOT}/heveydd-grael.jpg`,
  'gwrtheyrn-grael': `${PORTRAIT_ROOT}/gwrtheyrn-grael.jpg`,
  'vortigern-grael': `${PORTRAIT_ROOT}/vortigern-grael.jpg`,
  'orflaith-runda': `${PORTRAIT_ROOT}/orflaith-runda.jpg`,
  'genofeva-grael': `${PORTRAIT_ROOT}/genofeva-grael.jpg`,
  'ysberyr-grael': `${PORTRAIT_ROOT}/ysberyr-grael.jpg`,
  'nadya-grael': `${PORTRAIT_ROOT}/nadya-grael.jpg`,
  'rheinallt-grael': `${PORTRAIT_ROOT}/rheinallt-grael.jpg`,
  'gwlyddyn-grael': `${PORTRAIT_ROOT}/gwlyddyn-grael.jpg`,
  'rhonwen-grael': `${PORTRAIT_ROOT}/rhonwen-grael.jpg`,
  'eurolwyn-morforwyn': `${PORTRAIT_ROOT}/eurolwyn-morforwyn.png`,
  'kelyddon-grael': `${PORTRAIT_ROOT}/kelyddon-grael.jpg`,
  'taliesin-ceirwyn': `${PORTRAIT_ROOT}/taliesin-ceirwyn.png`,
  'gwalchmei-grael': `${PORTRAIT_ROOT}/gwalchmei-grael.jpg`,
  'tylwyth-grael': `${PORTRAIT_ROOT}/tylwyth-grael.jpg`,
  'medrawd-grael': `${PORTRAIT_ROOT}/medrawd-grael.jpg`
});

export const HOUSE_GRAEL_PORTRAITS = Object.freeze({
  ...LOCAL_GRAEL_PORTRAITS,
  'trystan-pendrag': HOUSE_DRAIG_PORTRAITS['trystan-pendrag'],
  'malltwyn-draig': HOUSE_DRAIG_PORTRAITS['malltwyn-draig'],
  'ysgithyrwyn-grael': HOUSE_DRAIG_PORTRAITS['ysgithyrwyn-grael'],
  'myrddin-draig': HOUSE_DRAIG_PORTRAITS['myrddin-draig'],
  'bethwyn-nimue-grael': HOUSE_DRAIG_PORTRAITS['bethwyn-nimue-grael'],
  'kenehyr-draig': HOUSE_DRAIG_PORTRAITS['kenehyr-draig'],
  'greidyawl-grael': HOUSE_DRAIG_PORTRAITS['greidyawl-grael'],
  'caswallon-grael': HOUSE_DRAIG_PORTRAITS['caswallon-grael'],
  'dwynwen-draig': HOUSE_DRAIG_PORTRAITS['dwynwen-draig'],
  'gareth-pendrag': HOUSE_PENDRAG_PORTRAITS['gareth-pendrag'],
  'rhiannon-1673-pendrag': HOUSE_PENDRAG_PORTRAITS['rhiannon-1673-pendrag'],
  'trahayarn-grael': HOUSE_PENDRAG_PORTRAITS['trahayarn-grael'],
  'llawvrodedd-saethwyr': HOUSE_SAETHWYR_PORTRAITS['llawvrodedd-saethwyr'],
  'galahad-grael': HOUSE_WYRM_PORTRAITS['galahad-grael'],
  'morgan-dyngwn': HOUSE_NEIDR_PORTRAITS['morgan-dyngwn'],
  'sieffre-arth': HOUSE_ARTH_LOCAL_PORTRAITS['sieffre-arth'],
  'cerridwyn-grael': HOUSE_ARTH_LOCAL_PORTRAITS['cerridwyn-grael']
});

export const HOUSE_GRAEL_LOCAL_PORTRAITS = LOCAL_GRAEL_PORTRAITS;
