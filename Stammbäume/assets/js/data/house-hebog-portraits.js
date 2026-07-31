import { HOUSE_ADERYN_PORTRAITS } from './house-aderyn-portraits.js';
import { HOUSE_CREFYDDOL_PORTRAITS } from './house-crefyddol-portraits.js';
import { HOUSE_ERYR_PORTRAITS } from './house-eryr-portraits.js';
import { HOUSE_GAETH_PORTRAITS } from './house-gaeth-portraits.js';
import { HOUSE_GWARCHOD_PORTRAITS } from './house-gwarchod-portraits.js';
import { HOUSE_GWEFRYDD_PORTRAITS } from './house-gwefrydd-portraits.js';
import { HOUSE_GWYVERN_PORTRAITS } from './house-gwyvern-portraits.js';
import { HOUSE_LLWYNOG_PORTRAITS } from './house-llwynog-portraits.js';
import { HOUSE_MWYALCHEN_PORTRAITS } from './house-mwyalchen-portraits.js';
import { HOUSE_TIR_ADDAWOL_PORTRAITS } from './house-tir-addawol-portraits.js';
import { HOUSE_TYLLUAN_PORTRAITS } from './house-tylluan-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-hebog';

export const HOUSE_HEBOG_LOCAL_PORTRAIT_FILES = Object.freeze({
  'mordred-hebog': 'mordred-hebog.png',
  'sabrian-hebog': 'sabrian-hebog.png',
  'saeth-hebog': 'saeth-hebog.png',
  'sath-hebog': 'sath-hebog.png',
  'gildas-ilyuncu': 'gildas-ilyuncu.png',
  'karelia-goldbaer': 'karelia-goldbaer.png',
  'glinda-hebog': 'glinda-hebog.png'
});

const LOCAL_PORTRAITS = Object.freeze(Object.fromEntries(
  Object.entries(HOUSE_HEBOG_LOCAL_PORTRAIT_FILES).map(([personId, fileName]) => [
    personId,
    `${PORTRAIT_ROOT}/${fileName}`
  ])
));

// Bereits ausgearbeitete Gegenakten bleiben die kanonische Bildquelle für
// dieselbe Weltperson. So entstehen weder Bildkopien noch abweichende Karten.
export const HOUSE_HEBOG_PORTRAITS = Object.freeze({
  ...LOCAL_PORTRAITS,
  'hywel-hebog': HOUSE_GAETH_PORTRAITS['hywel-hebog'],
  'trahaern-hebog': HOUSE_GAETH_PORTRAITS['trahaern-hebog'],
  'meilyr-hebog': HOUSE_GAETH_PORTRAITS['meilyr-hebog'],
  'tudful-1700-gaeth': HOUSE_GAETH_PORTRAITS['tudful-1700-gaeth'],
  'thalen-hebog': HOUSE_ADERYN_PORTRAITS['thalen-hebog'],
  'gwalchgwyn-aderyn': HOUSE_ADERYN_PORTRAITS['gwalchgwyn-aderyn'],
  'dilys-aderyn': HOUSE_ADERYN_PORTRAITS['dilys-aderyn'],
  'leolin-hebog': HOUSE_ADERYN_PORTRAITS['leolin-hebog'],
  'kelyddon-mwyalchen': HOUSE_MWYALCHEN_PORTRAITS['kelyddon-mwyalchen'],
  'conway-mwyalchen': HOUSE_MWYALCHEN_PORTRAITS['conway-mwyalchen'],
  'chryl-hebog': HOUSE_MWYALCHEN_PORTRAITS['chryl-hebog'],
  'lucan-tylluan': HOUSE_TYLLUAN_PORTRAITS['lucan-tylluan'],
  'thalena-hebog': HOUSE_TYLLUAN_PORTRAITS['thalena-hebog'],
  'enevold-eryr': HOUSE_ERYR_PORTRAITS['enevold-eryr'],
  'ewynn-hebog-eryr': HOUSE_ERYR_PORTRAITS['ewynn-hebog-eryr'],
  'maiwyn-gwarchod': HOUSE_GWARCHOD_PORTRAITS['maiwyn-gwarchod'],
  'meredyddwynn-hebog': HOUSE_GWARCHOD_PORTRAITS['meredyddwynn-hebog'],
  'lunet-crefyddol': HOUSE_CREFYDDOL_PORTRAITS['lunet-crefyddol'],
  'liliwen-gwyvern': HOUSE_GWYVERN_PORTRAITS['liliwen-gwyvern'],
  'griffith-hebog': HOUSE_GWYVERN_PORTRAITS['griffith-hebog'],
  'iorwerth-gwefrydd': HOUSE_GWEFRYDD_PORTRAITS['iorwerth-gwefrydd'],
  'brina-llwynog': HOUSE_LLWYNOG_PORTRAITS['brina-llwynog'],
  'eurig-hebog': HOUSE_LLWYNOG_PORTRAITS['eurig-hebog'],
  'bhreac-tir-addawol': HOUSE_TIR_ADDAWOL_PORTRAITS['bhreac-tir-addawol'],
  'aliza-hebog': HOUSE_TIR_ADDAWOL_PORTRAITS['aliza-hebog']
});
