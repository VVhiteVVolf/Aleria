import { HOUSE_ARWYDD_PORTRAITS } from './house-arwydd-portraits.js';
import { HOUSE_DRAIG_PORTRAITS } from './house-draig-portraits.js';
import { HOUSE_DARAN_PORTRAITS } from './house-daran-portraits.js';
import { HOUSE_GAFYR_PORTRAITS } from './house-gafyr-portraits.js';
import { HOUSE_SAETHWYR_PORTRAITS } from './house-saethwyr-portraits.js';
import { HOUSE_WYRM_PORTRAITS } from './house-wyrm-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-gwyvern';
const LOCAL_PORTRAIT_IDS = Object.freeze([
  'grippiud-marwolaeth',
  'seithved-gwyvern',
  'talaith-gwyvern',
  'kimball-gwyvern',
  'conall-airgid',
  'kenyon-taranvyr',
  'delyth-gwyvern',
  'afal-arth',
  'aethlem-gwyvern',
  'liliwen-gwyvern',
  'beatha-airt',
  'griffith-hebog',
  'mervyn-gwyvern',
  'alys-gwyvern',
  'genofeva-gwyvern',
  'jeannae-aderyn',
  'thomos-gwefrydd',
  'madoc-creyr',
  'trevor-gwyvern',
  'tegwen-gwyvern',
  'huw-gwyvern',
  'gwenfrewi-gwyvern',
  'brizio-gwyvern',
  'bryn-gwyvern'
]);

export const HOUSE_GWYVERN_PORTRAITS = Object.freeze({
  ...Object.fromEntries(LOCAL_PORTRAIT_IDS.map(personId => [
    personId,
    `${PORTRAIT_ROOT}/${personId}.jpg`
  ])),
  'bleddyn-draig': HOUSE_SAETHWYR_PORTRAITS['bleddyn-draig'],
  'owena-saethwyr': HOUSE_SAETHWYR_PORTRAITS['owena-saethwyr'],
  'dyvynwal-gwyvern': HOUSE_SAETHWYR_PORTRAITS['dyvynwal-gwyvern'],
  'morwenna-gwyvern': HOUSE_SAETHWYR_PORTRAITS['morwenna-gwyvern'],
  'huw-saethwyr': HOUSE_SAETHWYR_PORTRAITS['huw-saethwyr'],
  'gwrddnei-gwyvern': HOUSE_GAFYR_PORTRAITS['gwrddnei-gwyvern'],
  'cynwrig-wyrm': HOUSE_WYRM_PORTRAITS['cynwrig-wyrm'],
  'olwen-wyrm': HOUSE_WYRM_PORTRAITS['olwen-wyrm'],
  'maredudd-gwyvern': HOUSE_WYRM_PORTRAITS['maredudd-gwyvern'],
  'izobel-arwydd': HOUSE_ARWYDD_PORTRAITS['izobel-arwydd'],
  'gwynnan-gwyvern': HOUSE_ARWYDD_PORTRAITS['gwynnan-gwywern'],
  'meurig-draig': HOUSE_DRAIG_PORTRAITS['meurig-draig'],
  'heledd-gwyvern': HOUSE_DRAIG_PORTRAITS['heledd-gwyvern'],
  'maelgwyn-daran': HOUSE_DARAN_PORTRAITS['maelgwyn-daran']
});
