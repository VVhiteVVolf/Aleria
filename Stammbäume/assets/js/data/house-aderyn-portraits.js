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
  'yvain-aderyn',
  'fainche-gormard',
  'owain-aderyn',
  'uilean-ua-fionnghal',
  'ywen-aderyn',
  'gwalchgwyn-aderyn',
  'gwenhwyfar-1270-aderyn',
  'willow-aderyn',
  'nodawl-aderyn',
  'siors-aderyn',
  'ceredig-aderyn',
  'llwydawg-aderyn',
  'clwyd-aderyn',
  'anarawd-aderyn',
  'loyde-aderyn',
  'rhynnon-aderyn',
  'odin-feuerhaar',
  'efnisien-aderyn',
  'taran-1653-aderyn',
  'thalen-hebog',
  'merfyn-aderyn',
  'cadwallon-aderyn',
  'thivya-aderyn',
  'conwy-aderyn',
  'micah-aderyn',
  'thalena-1676-aderyn',
  'meriel-gaeth',
  'emma-luitpolding',
  'nurit-rosenstolz',
  'slevin-gaeth',
  'gareth-aderyn',
  'gwilym-aderyn',
  'bledyn-aderyn',
  'selwyn-aderyn',
  'rheanne-aderyn',
  'gais-aderyn',
  'roderic-aderyn',
  'catrin-blodyn',
  'gwenhwyfar-mwyalchen',
  'agna-baerenfell',
  'eluned-draenog',
  'sheev-mwyalchen',
  'branna-loganne',
  'duana-goidin',
  'cwgon-aderyn',
  'arthen-aderyn',
  'rhenawedd-aderyn',
  'gwilydd-aderyn',
  'elowen-aderyn',
  'rhiwallon-aderyn',
  'cynfyn-aderyn',
  'dilys-aderyn',
  'gwil-aderyn',
  'ewynn-aderyn',
  'edlym-aderyn',
  'eilir-aderyn',
  'yale-aderyn',
  'lleulu-aderyn',
  'wyett-aderyn',
  'wula-aderyn',
  'leolin-hebog',
  'marvin-ilyuncu'
]);

const SHARED_PORTRAITS = Object.freeze({
  'agravaine-aderyn': 'assets/images/portraits/haus-mwyalchen/agravaine-aderyn.png',
  'eiddyl-eryr': 'assets/images/portraits/haus-eryr/eiddyl-eryr.png',
  'catwan-aderyn': 'assets/images/portraits/haus-eryr/catwan-aderyn.png',
  'aysha-eryr': 'assets/images/portraits/haus-eryr/aysha-eryr.png',
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
  // Direkte kanonische Pfade vermeiden einen ES-Modul-Kreis zwischen den
  // ausgearbeiteten Aderyn-, Créyr- und Tir-Addawol-Gegenakten.
  'armel-creyr': 'assets/images/portraits/haus-creyr/armel-creyr.png',
  'venora-aderyn': 'assets/images/portraits/haus-tir-addawol/venora-aderyn.jpg',
  'merryn-tir-addawol': 'assets/images/portraits/haus-tir-addawol/merryn-tir-addawol.jpg',
  'talfryn-aderyn': 'assets/images/portraits/haus-wylan/talfryn-aderyn.jpg',
  'geraint-gaeth': 'assets/images/portraits/haus-gaeth/geraint-gaeth.png',
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
