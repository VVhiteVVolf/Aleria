import { HOUSE_DRAIG_PORTRAITS } from './house-draig-portraits.js';
import { HOUSE_GAFYR_PORTRAITS } from './house-gafyr-portraits.js';
import { HOUSE_GRAWN_PORTRAITS } from './house-grawn-portraits.js';
import { HOUSE_GWYVERN_PORTRAITS } from './house-gwyvern-portraits.js';
import { HOUSE_ILLEWOD_PORTRAITS } from './house-illewod-portraits.js';
import { HOUSE_NEIDR_PORTRAITS } from './house-neidr-portraits.js';
import { HOUSE_PENDRAG_PORTRAITS } from './house-pendrag-portraits.js';
import { HOUSE_PYSGOD_LOCAL_PORTRAITS } from './house-pysgod-local-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-aderyn';

// portrait-sources.json ist der Quellen- und Downloadkatalog. Eine Quelle gilt
// erst dann als auslieferbares Portrait, wenn die zugehörige Datei eingecheckt
// wurde und ihre ID hier eingetragen ist. So entstehen bei ausstehenden
// Downloads keine kaputten Bild-URLs; die Kartenansicht nutzt bis dahin ihre
// geschlechtsspezifische Standardfassung.
const CHECKED_IN_LOCAL_PORTRAIT_IDS = Object.freeze([
  'gareth-aderyn',
  'catrin-blodyn'
]);

const SHARED_PORTRAITS = Object.freeze({
  'rhiannon-aderyn': HOUSE_DRAIG_PORTRAITS['rhiannon-aderyn'],
  'vortigern-pendrag': HOUSE_DRAIG_PORTRAITS['vortigern-pendrag'],
  'gruffyd-draig': HOUSE_DRAIG_PORTRAITS['gruffyd-draig'],
  'maelgwyn-grawn': HOUSE_GRAWN_PORTRAITS['maelgwyn-grawn'],
  'trevelyan-aderyn': HOUSE_ILLEWOD_PORTRAITS['trevelyan-aderyn'],
  'dungarth-aderyn': HOUSE_PENDRAG_PORTRAITS['dungarth-aderyn'],
  'caradwyn-pendrag': HOUSE_PENDRAG_PORTRAITS['caradwyn-pendrag'],
  'carnedyr-aderyn': HOUSE_GAFYR_PORTRAITS['carnedyr-aderyn'],
  'catel-aderyn': HOUSE_ILLEWOD_PORTRAITS['catel-aderyn'],
  'mifawi-illewod': HOUSE_ILLEWOD_PORTRAITS['mifawi-illewod'],
  'grufydd-aderyn': HOUSE_GAFYR_PORTRAITS['grufydd-aderyn'],
  'bronwyn-gafyr': HOUSE_GAFYR_PORTRAITS['bronwyn-gafyr'],
  'carwyn-aderyn': HOUSE_NEIDR_PORTRAITS['carwyn-aderyn'],
  'cynan-neidr': HOUSE_NEIDR_PORTRAITS['cynan-neidr'],
  'gwendolyn-aderyn': HOUSE_DRAIG_PORTRAITS['gwendolyn-aderyn'],
  'galahad-draig': HOUSE_DRAIG_PORTRAITS['galahad-draig'],
  'jeannae-aderyn': HOUSE_GWYVERN_PORTRAITS['jeannae-aderyn'],
  'mervyn-gwyvern': HOUSE_GWYVERN_PORTRAITS['mervyn-gwyvern'],
  'hefin-pysgod': HOUSE_PYSGOD_LOCAL_PORTRAITS['hefin-pysgod'],
  'talfryn-aderyn': 'assets/images/portraits/haus-wylan/talfryn-aderyn.jpg',
  'gwalchgwyn-arth': 'assets/images/portraits/haus-arth/gwalchgwyn-arth.jpg',
  'colwynn-aderyn': 'assets/images/portraits/haus-dienyddiwr/colwynn-aderyn.png',
  'enfys-dienyddiwr': 'assets/images/portraits/haus-dienyddiwr/enfys-dienyddiwr.jpg'
});

const isUsablePortraitPath = value => typeof value === 'string' && value.trim() !== '';

export const HOUSE_ADERYN_PORTRAITS = Object.freeze({
  ...Object.fromEntries(CHECKED_IN_LOCAL_PORTRAIT_IDS.map(personId => [
    personId,
    `${PORTRAIT_ROOT}/${personId}.jpg`
  ])),
  ...Object.fromEntries(
    Object.entries(SHARED_PORTRAITS).filter(([, portraitPath]) => (
      isUsablePortraitPath(portraitPath)
    ))
  )
});
