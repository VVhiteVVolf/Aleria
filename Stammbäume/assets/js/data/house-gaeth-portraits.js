import { HOUSE_ADERYN_PORTRAITS } from './house-aderyn-portraits.js';
import { HOUSE_CHIFFYDDLON_PORTRAITS } from './house-chiffyddlon-portraits.js';
import { HOUSE_CREYR_PORTRAITS } from './house-creyr-portraits.js';
import { HOUSE_DIENYDDIWR_PORTRAITS } from './house-dienyddiwr-portraits.js';
import { HOUSE_DINEFWR_PORTRAITS } from './house-dinefwr-portraits.js';
import { HOUSE_ERYR_PORTRAITS } from './house-eryr-portraits.js';
import { HOUSE_HWYADEN_PORTRAITS } from './house-hwyaden-portraits.js';
import { HOUSE_MWYALCHEN_PORTRAITS } from './house-mwyalchen-portraits.js';
import { HOUSE_SAETHWYR_PORTRAITS } from './house-saethwyr-portraits.js';
import { HOUSE_TYLLUAN_PORTRAITS } from './house-tylluan-portraits.js';
import { HOUSE_WYLAN_PORTRAITS } from './house-wylan-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-gaeth';

export const HOUSE_GAETH_LOCAL_PORTRAIT_FILES = Object.freeze({
  'geraint-gaeth': 'geraint-gaeth.png',
  'hywel-hebog': 'hywel-hebog.png',
  'akkarin-gaeth': 'akkarin-gaeth.png',
  'trahaern-hebog': 'trahaern-hebog.png',
  'cledwyn-gaeth': 'cledwyn-gaeth.png',
  'morweidd-gaeth': 'morweidd-gaeth.png',
  'carynn-morwyn': 'carynn-morwyn.png',
  'arian-gaeth': 'arian-gaeth.png',
  'rheinallt-gaeth': 'rheinallt-gaeth.png',
  'tudful-1700-gaeth': 'tudful-1700-gaeth.png',
  'owena-gaeth-spouse': 'owena-gaeth-spouse.png',
  'meilyr-hebog': 'meilyr-hebog.png',
  'karris-gaeth': 'karris-gaeth.png',
  'tymora-gaeth': 'tymora-gaeth.png',
  'kani-gaeth': 'kani-gaeth.png',
  'wenna-gaeth': 'wenna-gaeth.png',
  'tiwlip-gaeth': 'tiwlip-gaeth.png',
  'marvo-gaeth': 'marvo-gaeth.png',
  'ceinlys-gaeth': 'ceinlys-gaeth.png',
  'morin-gaeth': 'morin-gaeth.png',
  'aeron-gaeth': 'aeron-gaeth.png',
  'arddun-gaeth': 'arddun-gaeth.png'
});

const LOCAL_PORTRAITS = Object.freeze(Object.fromEntries(
  Object.entries(HOUSE_GAETH_LOCAL_PORTRAIT_FILES).map(([personId, fileName]) => [
    personId,
    `${PORTRAIT_ROOT}/${fileName}`
  ])
));

// Bereits ausgearbeitete Gegenakten bleiben für dieselbe Weltperson die
// kanonische Bildquelle. Dadurch zeigt ein Wechsel über das kleine Hauswappen
// dieselbe Person mit demselben Porträt, ohne Bilddateien zu duplizieren.
export const HOUSE_GAETH_PORTRAITS = Object.freeze({
  ...LOCAL_PORTRAITS,
  'gwenhwyfar-1270-aderyn': HOUSE_ADERYN_PORTRAITS['gwenhwyfar-1270-aderyn'],
  'clwyd-aderyn': HOUSE_ADERYN_PORTRAITS['clwyd-aderyn'],
  'merfyn-aderyn': HOUSE_ADERYN_PORTRAITS['merfyn-aderyn'],
  'meriel-gaeth': HOUSE_ADERYN_PORTRAITS['meriel-gaeth'],
  'slevin-gaeth': HOUSE_ADERYN_PORTRAITS['slevin-gaeth'],
  'thalena-1676-aderyn': HOUSE_ADERYN_PORTRAITS['thalena-1676-aderyn'],
  'gwayne-gaeth': HOUSE_WYLAN_PORTRAITS['gwayne-gaeth'],
  'iorwerth-mwyalchen': HOUSE_MWYALCHEN_PORTRAITS['iorwerth-mwyalchen'],
  'agravaine-1673-mwyalchen': HOUSE_MWYALCHEN_PORTRAITS['agravaine-1673-mwyalchen'],
  'gwenog-gaeth': HOUSE_MWYALCHEN_PORTRAITS['gwenog-gaeth'],
  'meredydd-gaeth': HOUSE_CHIFFYDDLON_PORTRAITS['meredydd-gaeth'],
  'gereint-gaeth': HOUSE_HWYADEN_PORTRAITS['gereint-gaeth'],
  'gwynham-1630-tylluan': HOUSE_TYLLUAN_PORTRAITS['gwynham-1630-tylluan'],
  'delwen-dienyddiwr': HOUSE_DIENYDDIWR_PORTRAITS['delwen-dienyddiwr'],
  'edwyn-gaeth': HOUSE_DINEFWR_PORTRAITS['edwyn-gaeth'],
  'carys-dinefwr': HOUSE_DINEFWR_PORTRAITS['carys-dinefwr'],
  'jeanne-saethwyr': HOUSE_SAETHWYR_PORTRAITS['jeanne-saethwyr'],
  'uthred-gaeth': HOUSE_SAETHWYR_PORTRAITS['uthred-gaeth'],
  'daffyd-eryr': HOUSE_ERYR_PORTRAITS['daffyd-eryr'],
  'rhian-gaeth-eryr': HOUSE_ERYR_PORTRAITS['rhian-gaeth-eryr'],
  'quellyn-eryr': HOUSE_ERYR_PORTRAITS['quellyn-eryr'],
  'rhyannon-gaeth-eryr': HOUSE_ERYR_PORTRAITS['rhyannon-gaeth-eryr'],
  'tudor-gaeth': HOUSE_CREYR_PORTRAITS['tudor-gaeth'],
  'eurfron-creyr': HOUSE_CREYR_PORTRAITS['eurfron-creyr']
});
