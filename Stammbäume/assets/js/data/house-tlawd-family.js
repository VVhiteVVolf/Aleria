import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { CELTIGERNS_WACHT_LOWER_KNIGHT_PROFILES } from './celtigerns-wacht-house-profiles.js';
import {
  createFamilyPerson,
  createMarriage,
  createParentages
} from './family-record-builders.js';
import { HOUSE_TLAWD_PORTRAITS } from './house-tlawd-portraits.js';

const TLAWD_EMBLEM = 'assets/images/houses/Llamreis Ankunft/haus-tlawd.png';
const TLAWD_HOUSE_ID = 'house-tlawd';
const HOUSE_HEAD_IDS = new Set([
  'edric-tlawd',
  'owain-tlawd',
  'gareth-tlawd',
  'cadfael-tlawd'
]);
const MAIN_LINE_IDS = new Set(['siarl-tlawd', 'rhyderch-tlawd', 'edric-tlawd-1716']);

function lineageRoleFor(personId) {
  if (HOUSE_HEAD_IDS.has(personId)) return 'head';
  return MAIN_LINE_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', houseId = TLAWD_HOUSE_ID, options = {}) {
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    houseId,
    portrait: HOUSE_TLAWD_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === TLAWD_HOUSE_ID ? 'core' : 'married'),
    lineageRole: options.lineageRole || lineageRoleFor(id),
    ...options
  });
}

function spouse(id, name, sex, birth = '????', death = '') {
  // Die eingeheirateten Ehepartner sind in der Quelle ohne Hausnamen überliefert.
  return person(id, name, sex, birth, death, '', { familyRole: 'married' });
}

function childrenOf(childIds, parentIds, partnershipId, options = {}) {
  return createParentages(childIds, parentIds, partnershipId, options);
}

const FOUNDER_IDS = ['edric-tlawd', 'anwen'];
const OWAIN_IDS = ['owain-tlawd', 'gwenfri'];
const GARETH_IDS = ['gareth-tlawd', 'efa'];
const CADFAEL_IDS = ['cadfael-tlawd', 'aerona'];
const SIARL_IDS = ['siarl-tlawd', 'nerys'];
const LLOYD_IDS = ['lloyd-tlawd', 'adain'];
const RHYDERCH_IDS = ['rhyderch-tlawd', 'fflur'];
const LLUDD_IDS = ['lludd-tlawd', 'ulaena'];

export const HOUSE_TLAWD_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-tlawd',
    title: 'Haus Tlawd',
    motto: '',
    description: 'Die belegte Linie des Ritterherrenhauses Tlawd unter Haus Gafyr: von Edric Tlawd bis zur Generation von 1722.',
    emblem: TLAWD_EMBLEM,
    houseProfile: CELTIGERNS_WACHT_LOWER_KNIGHT_PROFILES.tlawd
  },
  houses: [
    { id: TLAWD_HOUSE_ID, name: 'Haus Tlawd', motto: '', emblem: TLAWD_EMBLEM, status: 'active' }
  ],
  persons: [
    // Gründerpaar
    person('edric-tlawd', 'Edric Tlawd', 'male', '1264', '1328', TLAWD_HOUSE_ID, {
      title: 'Begründer des Ritterherrenhauses Tlawd'
    }),
    spouse('anwen', 'Anwen', 'female', '1268', '1344'),

    // Kinder von Edric und Anwen
    person('owain-tlawd', 'Owain', 'male', '1290', '????'),
    person('mair-tlawd', 'Mair', 'female', '1292', '????'),
    spouse('gwenfri', 'Gwenfri', 'female', '????', '????'),
    spouse('gavin', 'Gavin', 'male', '????', '????'),

    // Nach der Überlieferungslücke
    person('gareth-tlawd', 'Gareth', 'male', '1618', '1690'),
    spouse('efa', 'Efa', 'female', '1623', '1698'),

    // Kinder von Gareth und Efa
    person('cadfael-tlawd', 'Cadfael', 'male', '1642', '', TLAWD_HOUSE_ID, {
      title: 'Ritterherr des Hauses Tlawd'
    }),
    person('lowri-tlawd', 'Lowri', 'female', '1645', '1721'),
    spouse('aerona', 'Aerona', 'female', '1642', '1726'),
    spouse('caradoc', 'Caradoc', 'male', '1643', '1720'),

    // Kinder von Cadfael und Aerona
    person('siarl-tlawd', 'Siarl', 'male', '1668', ''),
    person('nedri-tlawd', 'Nedri', 'male', '1670', ''),
    person('modlen-tlawd', 'Modlen', 'female', '1671', ''),
    person('lloyd-tlawd', 'Lloyd', 'male', '1672', '1720'),
    spouse('nerys', 'Nerys', 'female', '1671', '1738'),
    spouse('adain', 'Adain', 'female', '1675', '1720'),

    // Kinder von Siarl und Nerys
    person('rhyderch-tlawd', 'Rhyderch', 'male', '1692', ''),
    person('renfri-tlawd', 'Renfri', 'female', '1699', ''),
    spouse('fflur', 'Fflur', 'female', '1694', ''),
    spouse('einion', 'Einion', 'male', '1696', ''),

    // Kinder von Lloyd und Adain
    person('lludd-tlawd', 'Lludd', 'male', '1698', ''),
    person('arwel-tlawd', 'Arwel', 'male', '1700', ''),
    person('caron-tlawd', 'Caron', 'male', '1703', ''),
    spouse('ulaena', 'Ulaena', 'female', '1699', ''),

    // Kinder von Rhyderch und Fflur
    person('edric-tlawd-1716', 'Edric', 'male', '1716', ''),
    person('taran-tlawd', 'Taran', 'male', '1718', ''),
    person('haf-tlawd', 'Haf', 'female', '1720', ''),

    // Kinder von Lludd und Ulaena
    person('owain-tlawd-1720', 'Owain', 'male', '1720', ''),
    person('leisa-tlawd', 'Leisa', 'female', '1722', '')
  ],
  partnerships: [
    createMarriage('marriage-edric-anwen', ...FOUNDER_IDS),
    createMarriage('marriage-owain-gwenfri', ...OWAIN_IDS),
    createMarriage('marriage-mair-gavin', 'mair-tlawd', 'gavin'),
    createMarriage('marriage-gareth-efa', ...GARETH_IDS),
    createMarriage('marriage-cadfael-aerona', ...CADFAEL_IDS),
    createMarriage('marriage-lowri-caradoc', 'lowri-tlawd', 'caradoc'),
    createMarriage('marriage-siarl-nerys', ...SIARL_IDS),
    createMarriage('marriage-lloyd-adain', ...LLOYD_IDS),
    createMarriage('marriage-rhyderch-fflur', ...RHYDERCH_IDS),
    createMarriage('marriage-renfri-einion', 'renfri-tlawd', 'einion'),
    createMarriage('marriage-lludd-ulaena', ...LLUDD_IDS)
  ],
  parentages: [
    ...childrenOf(['owain-tlawd', 'mair-tlawd'], FOUNDER_IDS, 'marriage-edric-anwen'),
    ...childrenOf(['gareth-tlawd'], OWAIN_IDS, 'marriage-owain-gwenfri', {
      type: 'claimed', certainty: 'probable', extensions: { timeJumpId: 'gap-owain-gareth' }
    }),
    ...childrenOf(['cadfael-tlawd', 'lowri-tlawd'], GARETH_IDS, 'marriage-gareth-efa'),
    ...childrenOf(
      ['siarl-tlawd', 'nedri-tlawd', 'modlen-tlawd', 'lloyd-tlawd'],
      CADFAEL_IDS,
      'marriage-cadfael-aerona'
    ),
    ...childrenOf(['rhyderch-tlawd', 'renfri-tlawd'], SIARL_IDS, 'marriage-siarl-nerys'),
    ...childrenOf(['lludd-tlawd', 'arwel-tlawd', 'caron-tlawd'], LLOYD_IDS, 'marriage-lloyd-adain'),
    ...childrenOf(['edric-tlawd-1716', 'taran-tlawd', 'haf-tlawd'], RHYDERCH_IDS, 'marriage-rhyderch-fflur'),
    ...childrenOf(['owain-tlawd-1720', 'leisa-tlawd'], LLUDD_IDS, 'marriage-lludd-ulaena')
  ],
  lineage: {
    founderPartnershipId: 'marriage-edric-anwen',
    houseId: TLAWD_HOUSE_ID,
    crestSubtitle: '',
    crestEmblemScale: 0.8,
    // Ritterherrenhäuser führen den silbernen Wappenrahmen statt des goldenen.
    crestFrame: 'silver',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  cadetBranches: [],
  timeJumps: [
    {
      id: 'gap-owain-gareth', parentPartnershipId: 'marriage-owain-gwenfri', childIds: ['gareth-tlawd'],
      years: 0, fromYear: '????', toYear: '1618', label: 'Die datierte Überlieferung setzt 1618 wieder ein', notes: '', extensions: {}
    }
  ],
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'edric-tlawd',
    orientation: 'vertical',
    ancestorDepth: 10,
    descendantDepth: 10,
    showSiblings: true
  },
  extensions: {
    sourceNote: 'Personen, Lebensdaten und Beziehungsstruktur nach der bereitgestellten Tlawd-Hierarchietabelle und der ergänzenden Stammbaumgrafik. Die eingeheirateten Ehepartner sind in der Quelle ohne Hausnamen überliefert; externe Portraitquellen wurden als lokale Projektdateien gesichert. Als Ritterherrenhaus führt Tlawd den silbernen Wappenrahmen, das Oberhaupt trägt den Titel Ritterherr.',
    blankFamily: false,
    sourceRevision: 1
  }
});
