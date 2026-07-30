import { HOUSE_BLACH_PORTRAITS } from './house-blach-portraits.js';
import { HOUSE_DIENYDDIWR_PORTRAITS } from './house-dienyddiwr-portraits.js';
import { HOUSE_DINEFWR_PORTRAITS } from './house-dinefwr-portraits.js';
import { HOUSE_DYNGWN_PORTRAITS } from './house-dyngwn-portraits.js';
import { HOUSE_GRAWN_PORTRAITS } from './house-grawn-portraits.js';
import { HOUSE_MOCHDAER_PORTRAITS } from './house-mochdaer-portraits.js';
import { HOUSE_SAETHWYR_PORTRAITS } from './house-saethwyr-portraits.js';
import { HOUSE_TIR_ADDAWOL_PORTRAITS } from './house-tir-addawol-portraits.js';
import { HOUSE_WYLAN_PORTRAITS } from './house-wylan-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-hwyaden';

// Die beiden wiederholten schwarzen Standardsilhouetten der Quelle sind keine
// Individualporträts und bleiben deshalb den systemeigenen Platzhaltern überlassen.
export const HOUSE_HWYADEN_LOCAL_PORTRAIT_IDS = Object.freeze([
  'owain-hwyaden',
  'oweta-hwyaden',
  'meara-fhaire',
  'aonghus-fhaire',
  'gwiawn-hwyaden',
  'run-hwyaden',
  'gereint-gaeth',
  'grugyn-hwyaden',
  'gwerful-draenog',
  'catwg-hwyaden',
  'gwerthmwl-hwyaden',
  'zenovia-pyrth',
  'zinnara-hwyaden',
  'xylon-saith',
  'gwenifer-hwyaden',
  'dadweir-creyr',
  'eiryn-hwyaden',
  'fflam-hwyaden',
  'dolena-hwyaden'
]);

const LOCAL_PORTRAITS = Object.freeze(Object.fromEntries(
  HOUSE_HWYADEN_LOCAL_PORTRAIT_IDS.map(personId => [
    personId,
    `${PORTRAIT_ROOT}/${personId}.jpg`
  ])
));

// Bereits ausgearbeitete Gegenakten bleiben die kanonische Quelle ihrer
// Weltpersonen und Porträtdateien. So zeigt dieselbe Person in jedem Haus
// dasselbe Bild und es entstehen keine zweiten, auseinanderlaufenden Assets.
export const HOUSE_HWYADEN_PORTRAITS = Object.freeze({
  ...LOCAL_PORTRAITS,
  'rhodhri-wylan': HOUSE_WYLAN_PORTRAITS['rhodhri-wylan'],
  'macsen-wylan': HOUSE_WYLAN_PORTRAITS['macsen-wylan'],
  'collen-hwyaden': HOUSE_DYNGWN_PORTRAITS['collen-hwyaden'],
  'aneurin-grawn': HOUSE_GRAWN_PORTRAITS['aneurin-grawn'],
  'padrig-saethwyr': HOUSE_SAETHWYR_PORTRAITS['padrig-saethwyr'],
  'heatherlinn-hwyaden': HOUSE_BLACH_PORTRAITS['heatherlinn-hwyaden'],
  'ossian-blach': HOUSE_BLACH_PORTRAITS['ossian-blach'],
  'milenna-tir-addawol': HOUSE_TIR_ADDAWOL_PORTRAITS['milenna-tir-addawol'],
  'emyas-hwyaden': HOUSE_TIR_ADDAWOL_PORTRAITS['emyas-hwyaden'],
  'peibyn-hwyaden': HOUSE_DINEFWR_PORTRAITS['peibyn-hwyaden'],
  'sulwen-dinefwr': HOUSE_DINEFWR_PORTRAITS['sulwen-dinefwr'],
  'neirin-hwyaden': HOUSE_DIENYDDIWR_PORTRAITS['neirin-hwyaden'],
  'gwen-dienyddiwr': HOUSE_DIENYDDIWR_PORTRAITS['gwen-dienyddiwr'],
  'alun-hwyaden': HOUSE_WYLAN_PORTRAITS['alun-hwyaden'],
  'anona-wylan': HOUSE_WYLAN_PORTRAITS['anona-wylan'],
  'marve-hwyaden': HOUSE_MOCHDAER_PORTRAITS['marve-hwyaden'],
  'jareth-mochdaer': HOUSE_MOCHDAER_PORTRAITS['jareth-mochdaer']
});
