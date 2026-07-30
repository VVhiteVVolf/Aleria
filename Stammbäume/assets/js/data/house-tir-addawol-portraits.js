import { HOUSE_BLACH_PORTRAITS } from './house-blach-portraits.js';
import { HOUSE_DINEFWR_PORTRAITS } from './house-dinefwr-portraits.js';
import { HOUSE_DYNGWN_PORTRAITS } from './house-dyngwn-portraits.js';
import { HOUSE_GAFYR_PORTRAITS } from './house-gafyr-portraits.js';
import { HOUSE_GWEFRYDD_PORTRAITS } from './house-gwefrydd-portraits.js';
import { HOUSE_TEYRNGARCH_PORTRAITS } from './house-teyrngarch-portraits.js';
import { HOUSE_WYLAN_PORTRAITS } from './house-wylan-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-tir-addawol';

export const HOUSE_TIR_ADDAWOL_LOCAL_PORTRAIT_IDS = Object.freeze([
  'gwyndor-tir-addawol',
  'tyreke-wylan',
  'drwst-tir-addawol',
  'milenna-tir-addawol',
  'emyas-hwyaden',
  'merryn-tir-addawol',
  'venora-aderyn',
  'tirian-tir-addawol',
  'eiddwen-tir-addawol',
  'yvette-saith',
  'tirian-marchog',
  'bhreac-tir-addawol',
  'kynan-tir-addawol',
  'rhena-tir-addawol',
  'arian-tir-addawol',
  'ivor-tir-addawol',
  'heston-tir-addawol',
  'lillifer-tir-addawol',
  'dee-tir-addawol',
  'shan-tir-addawol',
  'aliza-hebog'
]);

const LOCAL_PORTRAITS = Object.freeze(Object.fromEntries(
  HOUSE_TIR_ADDAWOL_LOCAL_PORTRAIT_IDS.map(personId => [
    personId,
    `${PORTRAIT_ROOT}/${personId}.jpg`
  ])
));

// Bereits in Gegenakten gesicherte Personen behalten dort ihre kanonische
// Bilddatei. Nur die in der Tir-Addawol-Quelle erstmals gelieferten Porträts
// liegen im eigenen Feature-Ordner.
export const HOUSE_TIR_ADDAWOL_PORTRAITS = Object.freeze({
  ...LOCAL_PORTRAITS,
  'erim-der-bulle-dinefwr': HOUSE_DINEFWR_PORTRAITS['erim-der-bulle-dinefwr'],
  'beynon-tarw-dinefwr': HOUSE_DINEFWR_PORTRAITS['beynon-tarw-dinefwr'],
  'eynon-tarw-dinefwr': HOUSE_DINEFWR_PORTRAITS['eynon-tarw-dinefwr'],
  'bedelia-ua-fhaire': HOUSE_DINEFWR_PORTRAITS['bedelia-ua-fhaire'],
  'aithne-ua-fhaire': HOUSE_DINEFWR_PORTRAITS['aithne-ua-fhaire'],
  'taredd-dinefwr': HOUSE_DINEFWR_PORTRAITS['taredd-dinefwr'],
  'ennissyen-tir-addawol': HOUSE_DINEFWR_PORTRAITS['ennissyen-tir-addawol'],
  'roderick-tir-addawol': HOUSE_BLACH_PORTRAITS['roderick-tir-addawol'],
  'uther-gafyr': HOUSE_GAFYR_PORTRAITS['uther-gafyr'],
  'gwynham-tir-addawol': HOUSE_WYLAN_PORTRAITS['gwynham-tir-addawol'],
  'caralyn-wylan': HOUSE_WYLAN_PORTRAITS['caralyn-wylan'],
  'hael-tir-addawol': HOUSE_DYNGWN_PORTRAITS['hael-tir-addawol'],
  'jeanae-dyngwn': HOUSE_DYNGWN_PORTRAITS['jeanae-dyngwn'],
  'dajena-tir-addawol': HOUSE_GWEFRYDD_PORTRAITS['dajena-tir-addawol'],
  'robyrt-gwefrydd': HOUSE_GWEFRYDD_PORTRAITS['robyrt-gwefrydd'],
  'garselid-dinefwr': HOUSE_DINEFWR_PORTRAITS['garselid-dinefwr'],
  'blodeuyn-tir-addawol': HOUSE_DINEFWR_PORTRAITS['blodeuyn-tir-addawol'],
  'fotor-tir-addawol': HOUSE_TEYRNGARCH_PORTRAITS['fotor-tir-addawol'],
  'siona-teyrngarch': HOUSE_TEYRNGARCH_PORTRAITS['siona-teyrngarch']
});
