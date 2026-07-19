import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { CELTIGERNS_WACHT_LOWER_KNIGHT_PROFILES } from './celtigerns-wacht-house-profiles.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_RHYDDID_PORTRAITS } from './house-rhyddid-portraits.js';

const RHYDDID_EMBLEM = 'assets/images/houses/Llamreis Ankunft/haus-rhyddid.png';
const RHYDDID_HOUSE_ID = 'house-rhyddid';
const HOUSE_HEAD_IDS = new Set([
  'gwilym-rhyddid',
  'kerwin-rhyddid',
  'taran-rhyddid'
]);
const MAIN_LINE_IDS = new Set(['arian-rhyddid', 'artie-rhyddid']);

function lineageRoleFor(personId) {
  if (HOUSE_HEAD_IDS.has(personId)) return 'head';
  return MAIN_LINE_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', houseId = RHYDDID_HOUSE_ID, options = {}) {
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    houseId,
    portrait: HOUSE_RHYDDID_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === RHYDDID_HOUSE_ID ? 'core' : 'married'),
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

const PARENT_IDS = ['unknown-gwilym-father', 'unknown-gwilym-mother'];
const FOUNDER_IDS = ['gwilym-rhyddid', 'evie'];
const KERWIN_IDS = ['kerwin-rhyddid', 'arianwen-chwedlonol'];
const YALE_IDS = ['yale-rhyddid', 'blodwen'];
const TARAN_IDS = ['taran-rhyddid', 'teagan'];
const RHAIN_IDS = ['rhain-rhyddid', 'larna'];
const ARIAN_IDS = ['arian-rhyddid', 'sgarlad'];
const BEVAN_IDS = ['bevan-rhyddid', 'ffion'];
const EELIN_IDS = ['eelin-rhyddid', 'cadel'];

export const HOUSE_RHYDDID_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-rhyddid',
    title: 'Haus Rhyddid',
    motto: 'Der Eid endet nicht.',
    description: 'Die belegte Linie des Ritterherrenhauses Rhyddid unter Haus Wyrm: vom Ritterschlag Gwilyms im Jahr 1272 bis zur Generation von 1730.',
    emblem: RHYDDID_EMBLEM,
    houseProfile: CELTIGERNS_WACHT_LOWER_KNIGHT_PROFILES.rhyddid
  },
  houses: [
    { id: RHYDDID_HOUSE_ID, name: 'Haus Rhyddid', motto: 'Der Eid endet nicht.', emblem: RHYDDID_EMBLEM, status: 'active' },
    house('house-chwedlonol', 'Haus Chwedlonol', 'assets/images/houses/Llamreis Ankunft/haus-chwedlonol.png'),
    house('house-cludwyr', 'Haus Cludwyr', 'assets/images/houses/Llamreis Ankunft/haus-cludwyr.png'),
    house('house-balchder', 'Haus Balchder', 'assets/images/houses/Llamreis Ankunft/haus-balchder.png')
  ],
  persons: [
    // Der überfallene Hof nahe der Waldgrenze in Llamreis' Ankunft
    person('unknown-gwilym-father', 'Unbekannter Schweinehirt', 'male', '????', '1262', '', { familyRole: 'married' }),
    person('unknown-gwilym-mother', 'Unbekannte Ehefrau', 'female', '????', '1262', '', { familyRole: 'married' }),

    // Gründer und seine Schwester
    person('gwilym-rhyddid', 'Gwilym Rhyddid', 'male', '????', '????', RHYDDID_HOUSE_ID, {
      title: 'Begründer des Ritterherrenhauses Rhyddid'
    }),
    person('gwenifer-rhyddid', 'Gwenifer', 'female', '????', '????', RHYDDID_HOUSE_ID, {
      notes: 'Diente als Zofe der Lady Myfanwy Wyrm in Gwynthor.'
    }),
    spouse('evie', 'Evie', 'female', '????', '????'),

    // Nach der Überlieferungslücke
    person('kerwin-rhyddid', 'Kerwin', 'male', '1651', '1735'),
    person('evangelin-rhyddid', 'Evangelin', 'female', '1654', '1730'),
    person('yale-rhyddid', 'Yale', 'male', '1656', '1730', RHYDDID_HOUSE_ID, {
      title: 'Hauptmann von Mwyncreig'
    }),
    person('arianwen-chwedlonol', 'Arianwen Chwedonol', 'female', '1654', '1725', 'house-chwedlonol', { familyRole: 'married' }),
    person('godwyn-cludwyr', 'Godwyn Cludwyr', 'male', '1651', '1720', 'house-cludwyr', { familyRole: 'married' }),
    spouse('blodwen', 'Blodwen', 'female', '1658', '1709'),

    // Kinder von Kerwin und Arianwen sowie Yale und Blodwen
    person('taran-rhyddid', 'Taran', 'male', '1672', '', RHYDDID_HOUSE_ID, {
      title: 'Ritterherr des Hauses Rhyddid'
    }),
    person('rhain-rhyddid', 'Rhain', 'male', '1678', ''),
    spouse('teagan', 'Teagan', 'female', '1677', ''),
    spouse('larna', 'Larna', 'female', '1680', ''),

    // Kinder von Taran und Teagan
    person('arian-rhyddid', 'Arian', 'male', '1695', ''),
    person('ronda-rhyddid', 'Ronda', 'female', '1696', ''),
    person('gwydion-rhyddid', 'Gwydion', 'male', '1708', ''),
    spouse('sgarlad', 'Sgarlad', 'female', '1699', ''),
    person('avan-balchder', 'Avan Balchder', 'male', '1690', '', 'house-balchder', { familyRole: 'married' }),

    // Kinder von Rhain und Larna
    person('bevan-rhyddid', 'Bevan', 'male', '1701', ''),
    person('eelin-rhyddid', 'Eelin', 'female', '1705', ''),
    spouse('ffion', 'Ffion', 'female', '1704', ''),
    spouse('cadel', 'Cadel', 'male', '1700', ''),

    // Kinder von Arian und Sgarlad
    person('artie-rhyddid', 'Artie', 'male', '1719', ''),
    person('evie-rhyddid', 'Evie', 'female', '1722', ''),

    // Kinder von Bevan und Ffion
    person('mal-rhyddid', 'Mal', 'male', '1722', ''),
    person('meggie-rhyddid', 'Meggie', 'female', '1726', ''),
    person('nel-rhyddid', 'Nel', 'male', '1730', ''),

    // Kinder von Eelin und Cadel
    person('glinda-rhyddid', 'Glinda', 'female', '1726', ''),
    person('barry-rhyddid', 'Barry', 'male', '1730', '')
  ],
  partnerships: [
    createMarriage('marriage-gwilym-parents', ...PARENT_IDS, {
      notes: 'Der Hof der Familie wurde 1262 von Banditen überfallen; nur Gwilym und Gwenifer überlebten.'
    }),
    createMarriage('marriage-gwilym-evie', ...FOUNDER_IDS),
    createMarriage('marriage-kerwin-arianwen', ...KERWIN_IDS),
    createMarriage('marriage-evangelin-godwyn', 'evangelin-rhyddid', 'godwyn-cludwyr'),
    createMarriage('marriage-yale-blodwen', ...YALE_IDS),
    createMarriage('marriage-taran-teagan', ...TARAN_IDS),
    createMarriage('marriage-rhain-larna', ...RHAIN_IDS),
    createMarriage('marriage-arian-sgarlad', ...ARIAN_IDS),
    createMarriage('marriage-ronda-avan', 'ronda-rhyddid', 'avan-balchder'),
    createMarriage('marriage-bevan-ffion', ...BEVAN_IDS),
    createMarriage('marriage-eelin-cadel', ...EELIN_IDS)
  ],
  parentages: [
    ...childrenOf(['gwilym-rhyddid', 'gwenifer-rhyddid'], PARENT_IDS, 'marriage-gwilym-parents'),
    ...childrenOf(['kerwin-rhyddid', 'evangelin-rhyddid', 'yale-rhyddid'], FOUNDER_IDS, 'marriage-gwilym-evie', {
      type: 'claimed', certainty: 'probable'
    }),
    ...childrenOf(['taran-rhyddid'], KERWIN_IDS, 'marriage-kerwin-arianwen'),
    ...childrenOf(['rhain-rhyddid'], YALE_IDS, 'marriage-yale-blodwen'),
    ...childrenOf(['arian-rhyddid', 'ronda-rhyddid', 'gwydion-rhyddid'], TARAN_IDS, 'marriage-taran-teagan'),
    ...childrenOf(['bevan-rhyddid', 'eelin-rhyddid'], RHAIN_IDS, 'marriage-rhain-larna'),
    ...childrenOf(['artie-rhyddid', 'evie-rhyddid'], ARIAN_IDS, 'marriage-arian-sgarlad'),
    ...childrenOf(['mal-rhyddid', 'meggie-rhyddid', 'nel-rhyddid'], BEVAN_IDS, 'marriage-bevan-ffion'),
    ...childrenOf(['glinda-rhyddid', 'barry-rhyddid'], EELIN_IDS, 'marriage-eelin-cadel')
  ],
  lineage: {
    founderPartnershipId: 'marriage-gwilym-evie',
    houseId: RHYDDID_HOUSE_ID,
    crestSubtitle: '',
    crestEmblemScale: 0.8,
    // Ritterherrenhäuser führen den silbernen Wappenrahmen statt des goldenen.
    crestFrame: 'silver',
    crestFrameScale: 1,
    timeGap: {
      enabled: true,
      years: 0,
      fromYear: '????',
      toYear: '1651',
      label: 'Nicht einzeln überlieferte Generationen'
    }
  },
  cadetBranches: [
    // Herkunftshaus-Medaillons für eingeheiratete Ehepartner sind nicht erwünscht;
    // Arianwens Haus Chwedlonol steht bereits auf ihrer Karte.
    createMarriedAwayBranch({
      id: 'married-away-cludwyr-evangelin',
      name: 'Haus Cludwyr',
      parentPartnershipId: 'marriage-evangelin-godwyn',
      houseId: 'house-cludwyr',
      targetFamilyId: 'haus-cludwyr',
      emblem: 'assets/images/houses/Llamreis Ankunft/haus-cludwyr.png',
      crestFrame: 'silver',
      notes: 'Evangelin wurde an das Ritterherrenhaus Cludwyr wegverheiratet.'
    }),
    createMarriedAwayBranch({
      id: 'married-away-balchder-ronda',
      name: 'Haus Balchder',
      parentPartnershipId: 'marriage-ronda-avan',
      houseId: 'house-balchder',
      targetFamilyId: 'haus-balchder',
      emblem: 'assets/images/houses/Llamreis Ankunft/haus-balchder.png',
      crestFrame: 'silver',
      notes: 'Ronda wurde an das Ritterherrenhaus Balchder wegverheiratet.'
    })
  ],
  timeJumps: [],
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'gwilym-rhyddid',
    orientation: 'vertical',
    ancestorDepth: 10,
    descendantDepth: 10,
    showSiblings: true
  },
  extensions: {
    sourceNote: 'Personen, Lebensdaten und Beziehungsstruktur nach der bereitgestellten Rhyddid-Hierarchietabelle und der ergänzenden Stammbaumgrafik. Gwilym und Gwenifer entstammen dem 1262 überfallenen Hof eines namenlosen Schweinehirten; die Linie der belegten Generationen setzt 1651 wieder ein. Externe Portraitquellen wurden als lokale Projektdateien gesichert. Als Ritterherrenhaus führt Rhyddid den silbernen Wappenrahmen, das Oberhaupt trägt den Titel Ritterherr.',
    blankFamily: false,
    sourceRevision: 4
  }
});
