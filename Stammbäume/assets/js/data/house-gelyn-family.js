import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { CELTIGERNS_WACHT_LOWER_KNIGHT_PROFILES } from './celtigerns-wacht-house-profiles.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_GELYN_PORTRAITS } from './house-gelyn-portraits.js';

const GELYN_EMBLEM = 'assets/images/houses/haus-gelyn.png';
const GELYN_HOUSE_ID = 'house-gelyn';
const HOUSE_HEAD_IDS = new Set(['cadoc-gelyn']);
const MAIN_LINE_IDS = new Set(['brannoc-gelyn', 'rhon-gelyn', 'fflam-gelyn']);

function lineageRoleFor(personId) {
  if (HOUSE_HEAD_IDS.has(personId)) return 'head';
  return MAIN_LINE_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', houseId = GELYN_HOUSE_ID, options = {}) {
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    houseId,
    portrait: HOUSE_GELYN_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === GELYN_HOUSE_ID ? 'core' : 'married'),
    lineageRole: options.lineageRole || lineageRoleFor(id),
    ...options
  });
}

function spouse(id, name, sex, birth = '????', death = '') {
  // Die eingeheirateten Ehepartner sind in der Quelle ohne Hausnamen überliefert.
  return person(id, name, sex, birth, death, '', { familyRole: 'married' });
}

function house(id, name, emblem = '') {
  return { id, name, motto: '', emblem, status: 'active' };
}

function childrenOf(childIds, parentIds, partnershipId, options = {}) {
  return createParentages(childIds, parentIds, partnershipId, options);
}

const PARENT_IDS = ['unknown-cadoc-father', 'unknown-cadoc-mother'];
const FOUNDER_IDS = ['cadoc-gelyn', 'aliza'];
const BRANNOC_IDS = ['brannoc-gelyn', 'glinda'];
const MADOC_IDS = ['madoc-gelyn', 'ceciley'];
const GWYRON_IDS = ['gwyron-gelyn', 'maygan'];
const GWAWR_IDS = ['gwawr-gelyn', 'wynfor'];

export const HOUSE_GELYN_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-gelyn',
    title: 'Haus Gelyn',
    motto: 'Im Feuer geprüft.',
    description: 'Die belegte Linie des jungen Ritterherrenhauses Gelyn unter Haus Draig: von der Erhebung Cadocs im Jahr 1720 bis zur Generation von 1733.',
    emblem: GELYN_EMBLEM,
    houseProfile: CELTIGERNS_WACHT_LOWER_KNIGHT_PROFILES.gelyn
  },
  houses: [
    { id: GELYN_HOUSE_ID, name: 'Haus Gelyn', motto: 'Im Feuer geprüft.', emblem: GELYN_EMBLEM, status: 'active' },
    house('house-balchder', 'Haus Balchder', 'assets/images/houses/haus-balchder.png')
  ],
  persons: [
    // Die Herkunft Cadocs und Dehlias ist nicht überliefert
    person('unknown-cadoc-father', 'Unbekannter Vater', 'male', '????', '', '', { familyRole: 'married', status: 'unknown' }),
    person('unknown-cadoc-mother', 'Unbekannte Mutter', 'female', '????', '', '', { familyRole: 'married', status: 'unknown' }),

    // Gründer und seine Schwester
    person('cadoc-gelyn', 'Cadoc Gelyn', 'male', '1668', '', GELYN_HOUSE_ID, {
      title: 'Begründer und Ritterherr des Hauses Gelyn',
      notes: 'Diente mit Meurig Draig als Knappe unter Sir Gethin Draig; 1720 zum Ritterherrn erhoben. Lehenswart von Twr Gwynthstorm.'
    }),
    person('dehlia-gelyn', 'Dehlia', 'female', '1670', ''),
    spouse('aliza', 'Aliza', 'female', '1680', ''),

    // Kinder von Cadoc und Aliza
    person('brannoc-gelyn', 'Brannoc', 'male', '1700', ''),
    person('senara-gelyn', 'Senara', 'female', '1704', ''),
    person('madoc-gelyn', 'Madoc', 'male', '1706', ''),
    person('gwyron-gelyn', 'Gwyron', 'male', '1708', ''),
    person('gwawr-gelyn', 'Gwawr', 'female', '1710', ''),
    spouse('glinda', 'Glinda', 'female', '1702', ''),
    person('kamber-balchder', 'Kamber Balchder', 'male', '1700', '', 'house-balchder', { familyRole: 'married' }),
    spouse('ceciley', 'Ceciley', 'female', '1708', ''),
    spouse('maygan', 'Maygan', 'female', '1710', ''),
    spouse('wynfor', 'Wynfor', 'male', '1707', ''),

    // Kinder von Brannoc und Glinda
    person('rhon-gelyn', 'Rhon', 'male', '1720', ''),
    person('torri-gelyn', 'Torri', 'female', '1722', ''),
    person('fflam-gelyn', 'Fflam', 'male', '1727', ''),
    person('gwion-gelyn', 'Gwion', 'male', '1730', ''),

    // Kinder von Madoc und Ceciley
    person('garym-gelyn', 'Garym', 'male', '1722', ''),
    person('reece-gelyn', 'Reece', 'male', '1726', ''),

    // Kind von Gwyron und Maygan
    person('llew-gelyn', 'Llew', 'male', '1729', ''),

    // Kinder von Gwawr und Wynfor
    person('teleri-gelyn', 'Teleri', 'female', '1730', ''),
    person('meic-gelyn', 'Meic', 'male', '1733', '')
  ],
  partnerships: [
    createMarriage('marriage-cadoc-parents', ...PARENT_IDS, {
      notes: 'Über die Eltern Cadocs und Dehlias ist nichts überliefert.'
    }),
    createMarriage('marriage-cadoc-aliza', ...FOUNDER_IDS),
    createMarriage('marriage-brannoc-glinda', ...BRANNOC_IDS),
    createMarriage('marriage-senara-kamber', 'senara-gelyn', 'kamber-balchder'),
    createMarriage('marriage-madoc-ceciley', ...MADOC_IDS),
    createMarriage('marriage-gwyron-maygan', ...GWYRON_IDS),
    createMarriage('marriage-gwawr-wynfor', ...GWAWR_IDS)
  ],
  parentages: [
    ...childrenOf(['cadoc-gelyn', 'dehlia-gelyn'], PARENT_IDS, 'marriage-cadoc-parents'),
    ...childrenOf(
      ['brannoc-gelyn', 'senara-gelyn', 'madoc-gelyn', 'gwyron-gelyn', 'gwawr-gelyn'],
      FOUNDER_IDS,
      'marriage-cadoc-aliza'
    ),
    ...childrenOf(['rhon-gelyn', 'torri-gelyn', 'fflam-gelyn', 'gwion-gelyn'], BRANNOC_IDS, 'marriage-brannoc-glinda'),
    ...childrenOf(['garym-gelyn', 'reece-gelyn'], MADOC_IDS, 'marriage-madoc-ceciley'),
    ...childrenOf(['llew-gelyn'], GWYRON_IDS, 'marriage-gwyron-maygan'),
    ...childrenOf(['teleri-gelyn', 'meic-gelyn'], GWAWR_IDS, 'marriage-gwawr-wynfor')
  ],
  lineage: {
    founderPartnershipId: 'marriage-cadoc-aliza',
    houseId: GELYN_HOUSE_ID,
    crestSubtitle: '',
    crestEmblemScale: 0.8,
    // Ritterherrenhäuser führen den silbernen Wappenrahmen statt des goldenen.
    crestFrame: 'silver',
    crestFrameScale: 1,
    // Das junge Haus kennt keine Überlieferungslücke.
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  cadetBranches: [
    createMarriedAwayBranch({
      id: 'married-away-balchder-senara',
      name: 'Haus Balchder',
      parentPartnershipId: 'marriage-senara-kamber',
      houseId: 'house-balchder',
      targetFamilyId: 'haus-balchder',
      emblem: 'assets/images/houses/haus-balchder.png',
      crestFrame: 'silver',
      notes: 'Senara wurde an das Ritterherrenhaus Balchder wegverheiratet.'
    })
  ],
  timeJumps: [],
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'cadoc-gelyn',
    orientation: 'vertical',
    ancestorDepth: 10,
    descendantDepth: 10,
    showSiblings: true
  },
  extensions: {
    sourceNote: 'Personen, Lebensdaten und Beziehungsstruktur nach der bereitgestellten Gelyn-Hierarchietabelle und der ergänzenden Stammbaumgrafik. Die Herkunft des Gründers Cadoc und seiner Schwester Dehlia ist nicht überliefert; als junges Haus kennt Gelyn keine Überlieferungslücke. Externe Portraitquellen wurden als lokale Projektdateien gesichert. Als Ritterherrenhaus führt Gelyn den silbernen Wappenrahmen, das Oberhaupt trägt den Titel Ritterherr.',
    blankFamily: false,
    sourceRevision: 1
  }
});
