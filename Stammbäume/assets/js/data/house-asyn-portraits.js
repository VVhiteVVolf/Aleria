import { HOUSE_HWYADEN_PORTRAITS } from './house-hwyaden-portraits.js';
import { HOUSE_TIR_ADDAWOL_PORTRAITS } from './house-tir-addawol-portraits.js';
import { HOUSE_WYLAN_PORTRAITS } from './house-wylan-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-asyn';

// Wiederholte schwarze Standardsilhouetten der Quelle bleiben den
// systemeigenen Platzhaltern überlassen. Personen mit bereits kanonischem
// Bild in einer Gegenakte werden unten auf genau diese Datei abgebildet.
export const HOUSE_ASYN_LOCAL_PORTRAIT_IDS = Object.freeze([
  'gamon-der-tor-asyn',
  'griff-ancient-asyn',
  'llue-tannau',
  'anarawd-asyn',
  'eiddyl-asyn',
  'travion-asyn',
  'owena-asyn',
  'wynfor-asyn',
  'talon-asyn',
  'helga-asyn',
  'kane-asyn',
  'astrith-asyn',
  'cloi-asyn',
  'treasa-asyn',
  'bran-asyn',
  'reiltin-asyn',
  'arlais-asyn',
  'griff-1732-asyn'
]);

const LOCAL_PORTRAITS = Object.freeze(Object.fromEntries(
  HOUSE_ASYN_LOCAL_PORTRAIT_IDS.map(personId => [
    personId,
    `${PORTRAIT_ROOT}/${personId}.jpg`
  ])
));

export const HOUSE_ASYN_PORTRAITS = Object.freeze({
  ...LOCAL_PORTRAITS,
  'gwyndor-tir-addawol': HOUSE_TIR_ADDAWOL_PORTRAITS['gwyndor-tir-addawol'],
  'gwiawn-hwyaden': HOUSE_HWYADEN_PORTRAITS['gwiawn-hwyaden'],
  'tudwal-asyn': HOUSE_WYLAN_PORTRAITS['tudwal-asyn']
});
