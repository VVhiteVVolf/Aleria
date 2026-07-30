import { HOUSE_CHIFFYDDLON_PORTRAITS } from './house-chiffyddlon-portraits.js';
import { HOUSE_DIENYDDIWR_PORTRAITS } from './house-dienyddiwr-portraits.js';
import { HOUSE_DRAIG_PORTRAITS } from './house-draig-portraits.js';
import { HOUSE_DYNGWN_PORTRAITS } from './house-dyngwn-portraits.js';
import { HOUSE_GWARCHOD_PORTRAITS } from './house-gwarchod-portraits.js';
import { HOUSE_MARWOLAETH_PORTRAITS } from './house-marwolaeth-portraits.js';
import { HOUSE_NEIDR_PORTRAITS } from './house-neidr-portraits.js';
import { HOUSE_PENDERYN_PORTRAITS } from './house-penderyn-portraits.js';
import { HOUSE_PYSGOD_PORTRAITS } from './house-pysgod-portraits.js';
import { HOUSE_SAITH_PORTRAITS } from './house-saith-portraits.js';
import { HOUSE_SGWARNOG_PORTRAITS } from './house-sgwarnog-portraits.js';
import { HOUSE_WYLAN_PORTRAITS } from './house-wylan-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-crefyddol';

export const HOUSE_CREFYDDOL_LOCAL_PORTRAIT_FILES = Object.freeze({
  'llwyarch-founder-crefyddol': 'llwyarch-founder-crefyddol.jpg',
  'llwellyn-founder-canwyll': 'llwellyn-founder-canwyll.jpg',
  'nodawl-crefyddol': 'nodawl-crefyddol.jpg',
  'gawain-canwyll': 'gawain-canwyll.jpg',
  'cadwallon-crefyddol': 'cadwallon-crefyddol.jpg',
  'emrys-crefyddol': 'emrys-crefyddol.jpg',
  'llywarch-canwyll': 'llywarch-canwyll.jpg',
  'arwel-crefyddol': 'arwel-crefyddol.jpg',
  'lunet-crefyddol': 'lunet-crefyddol.jpg',
  'gwalchmai-tiwna': 'gwalchmai-tiwna.png',
  'cefinwen-crefyddol': 'cefinwen-crefyddol.jpg',
  'penkawr-unigol': 'penkawr-unigol.jpg',
  'lamorak-crefyddol': 'lamorak-crefyddol.jpg',
  'gwendolen-crefyddol': 'gwendolen-crefyddol.jpg',
  'gethin-crefyddol': 'gethin-crefyddol.jpg',
  'telyn-coedwig': 'telyn-coedwig.jpg',
  'wyndham-eirth': 'wyndham-eirth.jpg',
  'nyfain-crefyddol': 'nyfain-crefyddol.jpg',
  'derwen-canwyll': 'derwen-canwyll.jpg',
  'yvain-crefyddol': 'yvain-crefyddol.jpg',
  'nye-crefyddol': 'nye-crefyddol.jpg',
  'lowri-crefyddol': 'lowri-crefyddol.jpg',
  'micah-crefyddol': 'micah-crefyddol.jpg',
  'jenni-crefyddol': 'jenni-crefyddol.jpg',
  'urien-crefyddol': 'urien-crefyddol.jpg',
  'merriam-crefyddol': 'merriam-crefyddol.jpg'
});

const LOCAL_PORTRAITS = Object.freeze(Object.fromEntries(
  Object.entries(HOUSE_CREFYDDOL_LOCAL_PORTRAIT_FILES).map(([personId, fileName]) => [
    personId,
    `${PORTRAIT_ROOT}/${fileName}`
  ])
));

// Bereits ausgearbeitete Gegenakten bleiben die kanonische Bildquelle ihrer
// Weltpersonen. Nur bislang unbelegte Individualporträts liegen im Crefyddol-Ordner.
export const HOUSE_CREFYDDOL_PORTRAITS = Object.freeze({
  ...LOCAL_PORTRAITS,
  'sieffre-der-fromme': HOUSE_NEIDR_PORTRAITS['sieffre-der-fromme'],
  'jinelle-neidr': HOUSE_NEIDR_PORTRAITS['jinelle-neidr'],
  'merrion-1582-crefyddol': HOUSE_MARWOLAETH_PORTRAITS['merrion-1582-crefyddol'],
  'arthur-dyngwn': HOUSE_DYNGWN_PORTRAITS['arthur-dyngwn'],
  'morien-crefyddol': HOUSE_NEIDR_PORTRAITS['morien-crefyddol'],
  'gwastad-crefyddol': HOUSE_PYSGOD_PORTRAITS['gwastad-crefyddol'],
  'argyll-saith': HOUSE_SAITH_PORTRAITS['argyll-saith'],
  'beynon-crefyddol': HOUSE_NEIDR_PORTRAITS['beynon-crefyddol'],
  'gwindor-crefydoll': HOUSE_WYLAN_PORTRAITS['gwindor-crefydoll'],
  'lywelyn-crefyddol': HOUSE_DRAIG_PORTRAITS['lywelyn-crefyddol'],
  'gregory-marwolaeth': HOUSE_MARWOLAETH_PORTRAITS['gregory-marwolaeth'],
  'hwywell-crefyddol': HOUSE_DIENYDDIWR_PORTRAITS['hwywell-crefyddol'],
  'glendower-dyngwn': HOUSE_DYNGWN_PORTRAITS['glendower-dyngwn'],
  'gwydion-crefyddol': HOUSE_SGWARNOG_PORTRAITS['gwydion-crefyddol'],
  'kimball-crefydoll': HOUSE_WYLAN_PORTRAITS['kimball-crefydoll'],
  'deryn-wylan': HOUSE_WYLAN_PORTRAITS['deryn-wylan'],
  'gwendolyn-crefyddol': HOUSE_SAITH_PORTRAITS['gwendolyn-crefyddol'],
  'darwyn-saith': HOUSE_SAITH_PORTRAITS['darwyn-saith'],
  'aneurin-crefyddol': HOUSE_PENDERYN_PORTRAITS['aneurin-crefyddol'],
  'merrion-crefyddol': HOUSE_NEIDR_PORTRAITS['merrion-crefyddol'],
  'ael-neidr': HOUSE_NEIDR_PORTRAITS['ael-neidr'],
  'crystin-crefyddol': HOUSE_NEIDR_PORTRAITS['crystin-crefyddol'],
  'ninian-neidr': HOUSE_NEIDR_PORTRAITS['ninian-neidr'],
  'siana-crefyddol-sgwarnog': HOUSE_SGWARNOG_PORTRAITS['siana-crefyddol-sgwarnog'],
  'meical-sgwarnog': HOUSE_SGWARNOG_PORTRAITS['meical-sgwarnog'],
  'rhisiog-crefyddol': HOUSE_CHIFFYDDLON_PORTRAITS['rhisiog-crefyddol'],
  'nessa-chiffyddlon': HOUSE_CHIFFYDDLON_PORTRAITS['nessa-chiffyddlon'],
  'rhisiart-crefyddol': HOUSE_GWARCHOD_PORTRAITS['rhisiart-crefyddol'],
  'jeanae-gwarchod': HOUSE_GWARCHOD_PORTRAITS['jeanae-gwarchod']
});
