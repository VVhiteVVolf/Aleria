import { HOUSE_ADERYN_PORTRAITS } from './house-aderyn-portraits.js';
import { HOUSE_ARTH_PORTRAITS } from './house-arth-portraits.js';
import { HOUSE_DRAIG_PORTRAITS } from './house-draig-portraits.js';
import { HOUSE_PENDRAG_PORTRAITS } from './house-pendrag-portraits.js';
import { HOUSE_WYLAN_PORTRAITS } from './house-wylan-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-blodyn';

// Generische schwarze Silhouetten der alten Vorlage werden bewusst nicht als
// Individualportraits gespeichert. Die Karten verwenden dafür ihre regulären
// geschlechtsspezifischen Platzhalter.
const LOCAL_PORTRAIT_IDS = Object.freeze([
  'mordred-blodyn',
  'kerrylin-dreigiau',
  'hoyer-blodyn',
  'naliandra-riabhach',
  'breunor-blodyn',
  'myfanwy-blaidd',
  'ceridwen-blodyn',
  'gwynfor-blaidd',
  'morfydd-blodyn',
  'breseal-dobhar',
  'gwendolen-blodyn',
  'arthfael-dianc',
  'morwenna-blodyn',
  'gwalchmai-trachwyll',
  'tudurwen-blodyn',
  'ysbryd-arfordir',
  'gogyvwlch-blodyn',
  'mieftagoet-blodyn',
  'uryen-blodyn',
  'dyvynwal-blodyn',
  'gavin-trachwyll',
  'mailgwin-blodyn',
  'myfanwy-1618-blodyn',
  'kynwrig-dianc',
  'iorwerth-blodyn',
  'gruffydd-blodyn',
  'catryn-llyfant',
  'kethtrwm-blodyn',
  'colwin-gwenyen',
  'voreyn-blodyn',
  'trystan-blaidd',
  'tathal-blodyn',
  'corryn-illygoden',
  'hetwn-morgant',
  'jygallag-blodyn',
  'sheena-urquhart',
  'tarrant-blodyn',
  'luned-mochdear',
  'carys-blodyn',
  'elin-blodyn',
  'mevyn-dyfrgi',
  'kynwas-morlais',
  'yhon-blodyn',
  'cerny-dianc',
  'yvain-blodyn',
  'bronwen-blaidd',
  'meggan-blodyn',
  'micah-arfordir',
  'talara-blodyn',
  'wynfor-blodyn',
  'delwen-trachwyll',
  'trachmyr-serenoc',
  'cerys-blodyn',
  'griffin-blodyn',
  'telyn-diafol',
  'dalvin-blodyn',
  'erec-blodyn'
]);

const SHARED_PORTRAITS = Object.freeze({
  'howell-draig': HOUSE_DRAIG_PORTRAITS['howell-draig'],
  'gwyneth-blodyn': HOUSE_DRAIG_PORTRAITS['gwyneth-blodyn'],
  'fflur-draig': HOUSE_DRAIG_PORTRAITS['fflur-draig'],
  'bleddyn-blodyn': HOUSE_DRAIG_PORTRAITS['bleddyn-blodyn'],
  'gareth-aderyn': HOUSE_ADERYN_PORTRAITS['gareth-aderyn'],
  'catrin-blodyn': HOUSE_ADERYN_PORTRAITS['catrin-blodyn'],
  'rhys-arth': HOUSE_ARTH_PORTRAITS['rhys-arth'],
  'tarrant-1703-arth': HOUSE_ARTH_PORTRAITS['tarrant-1703-arth'],
  'gendry-wylan': HOUSE_WYLAN_PORTRAITS['gendry-wylan'],
  'dystan-pendrag': HOUSE_PENDRAG_PORTRAITS['dystan-pendrag'],
  'dylis-blodyn': HOUSE_PENDRAG_PORTRAITS['dylis-blodyn']
});

export const HOUSE_BLODYN_PORTRAITS = Object.freeze({
  ...Object.fromEntries(LOCAL_PORTRAIT_IDS.map(personId => [
    personId,
    `${PORTRAIT_ROOT}/${personId}.jpg`
  ])),
  ...Object.fromEntries(Object.entries(SHARED_PORTRAITS).filter(([, portrait]) => portrait))
});
