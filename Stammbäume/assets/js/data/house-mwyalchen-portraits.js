import { HOUSE_ADERYN_PORTRAITS } from './house-aderyn-portraits.js';
import { HOUSE_ARWYDD_PORTRAITS } from './house-arwydd-portraits.js';
import { HOUSE_CIAROG_PORTRAITS } from './house-ciarog-portraits.js';
import { HOUSE_DYNGWN_PORTRAITS } from './house-dyngwn-portraits.js';
import { HOUSE_ERYR_PORTRAITS } from './house-eryr-portraits.js';
import { HOUSE_GAFYR_PORTRAITS } from './house-gafyr-portraits.js';
import { HOUSE_PYRTH_PORTRAITS } from './house-pyrth-portraits.js';
import { HOUSE_TYLLUAN_PORTRAITS } from './house-tylluan-portraits.js';
import { HOUSE_WYRM_PORTRAITS } from './house-wyrm-portraits.js';

const PORTRAIT_ROOT = 'assets/images/portraits/haus-mwyalchen';

export const HOUSE_MWYALCHEN_LOCAL_PORTRAIT_FILES = Object.freeze({
  'agravaine-aderyn': 'agravaine-aderyn.png',
  'iorwerth-mwyalchen': 'iorwerth-mwyalchen.png',
  'kelyddon-mwyalchen': 'kelyddon-mwyalchen.png',
  'cadwallen-mwyalchen': 'cadwallen-mwyalchen.png',
  'fachtna-suiste': 'fachtna-suiste.png',
  'cieran-mwyalchen': 'cieran-mwyalchen.png',
  'agravaine-1673-mwyalchen': 'agravaine-1673-mwyalchen.png',
  'gwalchgwyn-mwyalchen': 'gwalchgwyn-mwyalchen.png',
  'gwenog-gaeth': 'gwenog-gaeth.png',
  'wynthonya-mwyalchen': 'wynthonya-mwyalchen.png',
  'gwindor-mwyalchen': 'gwindor-mwyalchen.png',
  'gower-mwyalchen': 'gower-mwyalchen.png',
  'naili-mwyalchen': 'naili-mwyalchen.png',
  'conway-mwyalchen': 'conway-mwyalchen.png',
  'erwm-draenog': 'erwm-draenog.jpg',
  'gwenith-hwyaden': 'gwenith-hwyaden.jpg',
  'koritha-camoran': 'koritha-camoran.jpg',
  'lwyd-pawen': 'lwyd-pawen.jpg',
  'chryl-hebog': 'chryl-hebog.png',
  'tirion-mwyalchen': 'tirion-mwyalchen.png',
  'orbo-mwyalchen': 'orbo-mwyalchen.png',
  'aedd-mwyalchen': 'aedd-mwyalchen.png',
  'mag-mwyalchen': 'mag-mwyalchen.png',
  'mithlas-camoran': 'mithlas-camoran.jpg',
  'gloyw-mwyalchen': 'gloyw-mwyalchen.png',
  'cloi-mwyalchen': 'cloi-mwyalchen.png',
  'enid-mwyalchen': 'enid-mwyalchen.png',
  'ieuan-mwyalchen': 'ieuan-mwyalchen.png',
  'bevan-ilyuncu': 'bevan-ilyuncu.png'
});

const LOCAL_PORTRAITS = Object.freeze(Object.fromEntries(
  Object.entries(HOUSE_MWYALCHEN_LOCAL_PORTRAIT_FILES).map(([personId, fileName]) => [
    personId,
    `${PORTRAIT_ROOT}/${fileName}`
  ])
));

// Ausgearbeitete Gegenakten bleiben für dieselbe Weltperson die kanonische
// Bildquelle. Die wiederholte schwarze Standardsilhouette der Altquelle wird
// nicht als vermeintliches Individualporträt importiert.
export const HOUSE_MWYALCHEN_PORTRAITS = Object.freeze({
  ...LOCAL_PORTRAITS,
  'nodawl-aderyn': HOUSE_ADERYN_PORTRAITS['nodawl-aderyn'],
  'sheev-mwyalchen': HOUSE_ADERYN_PORTRAITS['sheev-mwyalchen'],
  'rheanne-aderyn': HOUSE_ADERYN_PORTRAITS['rheanne-aderyn'],
  'gwenhwyfar-mwyalchen': HOUSE_ADERYN_PORTRAITS['gwenhwyfar-mwyalchen'],
  'gwilym-aderyn': HOUSE_ADERYN_PORTRAITS['gwilym-aderyn'],
  'wyndham-eryr': HOUSE_ERYR_PORTRAITS['wyndham-eryr'],
  'carwyn-mwyalchen-eryr': HOUSE_ERYR_PORTRAITS['carwyn-mwyalchen-eryr'],
  'gruffyd-eryr': HOUSE_ERYR_PORTRAITS['gruffyd-eryr'],
  'gwynham-mwyalchen': HOUSE_DYNGWN_PORTRAITS['gwynham-mwyalchen'],
  'ysgonan-pyrth': HOUSE_PYRTH_PORTRAITS['ysgonan-pyrth'],
  'arglwydd-mwyalchen': HOUSE_WYRM_PORTRAITS['arglwydd-mwyalchen'],
  'niniel-mwyalchen': HOUSE_GAFYR_PORTRAITS['niniel-mwyalchen'],
  'ferydnand-gafyr': HOUSE_GAFYR_PORTRAITS['ferydnand-gafyr'],
  'daddweir-mwyalchen': HOUSE_CIAROG_PORTRAITS['daddweir-mwyalchen'],
  'deliah-mwyalchen': HOUSE_ARWYDD_PORTRAITS['deliah-mwyalchen'],
  'idris-arwydd': HOUSE_ARWYDD_PORTRAITS['idris-arwydd'],
  'tatumn-mwyalchen': HOUSE_TYLLUAN_PORTRAITS['tatumn-mwyalchen'],
  'gwendal-tylluan': HOUSE_TYLLUAN_PORTRAITS['gwendal-tylluan']
});
