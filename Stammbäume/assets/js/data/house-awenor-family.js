import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { CELTIGERNS_WACHT_LOWER_KNIGHT_PROFILES } from './celtigerns-wacht-house-profiles.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_AWENOR_PORTRAITS } from './house-awenor-portraits.js';

const AWENOR_EMBLEM = 'assets/images/houses/Llamreis Ankunft/haus-awenor.png';
const AWENOR_HOUSE_ID = 'house-awenor';
const HOUSE_HEAD_IDS = new Set(['aergol-awenor', 'glynfael-awenor', 'ffraid-awenor']);
const MAIN_LINE_IDS = new Set(['derwain-awenor', 'urfael-awenor', 'isgar-awenor']);

function lineageRoleFor(personId) {
  if (HOUSE_HEAD_IDS.has(personId)) return 'head';
  return MAIN_LINE_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', houseId = AWENOR_HOUSE_ID, options = {}) {
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    houseId,
    portrait: HOUSE_AWENOR_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === AWENOR_HOUSE_ID ? 'core' : 'married'),
    lineageRole: options.lineageRole || lineageRoleFor(id),
    ...options
  });
}

// Die Quelltabelle überliefert für sämtliche Ehepartner nur ein
// unbeschriftetes „???“-Bildfeld; sie bleiben namenlos und ohne Portrait.
function unnamedSpouse(id, name, sex, birth = '????', death = '????') {
  return person(id, name, sex, birth, death, '', { familyRole: 'married', status: 'unknown' });
}

function childrenOf(childIds, parentIds, partnershipId, options = {}) {
  return createParentages(childIds, parentIds, partnershipId, options);
}

const FOUNDER_IDS = ['aergol-awenor', 'unknown-aergol-spouse'];
const GLYNFAEL_IDS = ['glynfael-awenor', 'unknown-glynfael-spouse'];
const HEULWEN_IDS = ['heulwen-awenor', 'unknown-heulwen-spouse'];
const ENIDWEN_IDS = ['enidwen-awenor', 'unknown-enidwen-spouse'];
const CREIRWEN_IDS = ['creirwen-awenor', 'unknown-creirwen-spouse'];
const GWYLAN_IDS = ['gwylan-awenor', 'unknown-gwylan-spouse'];
const FFRAID_IDS = ['ffraid-awenor', 'unknown-ffraid-spouse'];
const GETHOR_IDS = ['gethor-awenor', 'unknown-gethor-spouse'];
const GWAERON_IDS = ['gwaeron-awenor', 'unknown-gwaeron-spouse'];
const DERWAIN_IDS = ['derwain-awenor', 'unknown-derwain-spouse'];
const NERWEN_IDS = ['nerwen-awenor', 'unknown-nerwen-spouse'];
const GARAN_1695_IDS = ['garan-1695-awenor', 'unknown-garan-1695-spouse'];

export const HOUSE_AWENOR_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-awenor',
    title: 'Haus Awenor',
    motto: '',
    description: 'Die belegte Linie des älteren, kriegerisch geprägten Ritterherrenhauses Awenor unter Haus Draig: vom Gründer Aergol bis zur Generation von 1731.',
    emblem: AWENOR_EMBLEM,
    houseProfile: CELTIGERNS_WACHT_LOWER_KNIGHT_PROFILES.awenor
  },
  houses: [
    { id: AWENOR_HOUSE_ID, name: 'Haus Awenor', motto: '', emblem: AWENOR_EMBLEM, status: 'active' },
    { id: 'house-unbekannt-heulwen', name: 'Unbekanntes Haus', motto: '', emblem: '', status: 'active' },
    { id: 'house-unbekannt-enidwen', name: 'Unbekanntes Haus', motto: '', emblem: '', status: 'active' },
    { id: 'house-unbekannt-creirwen', name: 'Unbekanntes Haus', motto: '', emblem: '', status: 'active' },
    { id: 'house-unbekannt-nerwen', name: 'Unbekanntes Haus', motto: '', emblem: '', status: 'active' }
  ],
  persons: [
    // Gründer und seine Frau
    person('aergol-awenor', 'Aergol Awenor', 'male', '????', '????', AWENOR_HOUSE_ID, {
      status: 'dead',
      title: 'Begründer des Ritterherrenhauses Awenor',
      notes: 'Stellte als erster ritterlicher Gefolgsmann des Hauses Draig Grenzwachen und Kommandanten; sein genaues Geburtsjahr ist nicht überliefert.'
    }),
    unnamedSpouse('unknown-aergol-spouse', 'Unbekannte Ehefrau', 'female'),

    // Kinder Aergols
    person('glynfael-awenor', 'Glynfael Awenor', 'male', '1640', '????', AWENOR_HOUSE_ID, {
      status: 'dead',
      notes: 'Zweites Familienoberhaupt des Hauses Awenor nach Aergol.'
    }),
    unnamedSpouse('unknown-glynfael-spouse', 'Unbekannte Ehefrau', 'female', '1642'),
    person('heulwen-awenor', 'Heulwen Awenor', 'female', '1643', '????', AWENOR_HOUSE_ID, { status: 'dead' }),
    unnamedSpouse('unknown-heulwen-spouse', 'Unbekannter Ehemann', 'male', '1641'),
    person('enidwen-awenor', 'Enidwen Awenor', 'female', '1646', '????', AWENOR_HOUSE_ID, { status: 'dead' }),
    unnamedSpouse('unknown-enidwen-spouse', 'Unbekannter Ehemann', 'male', '1644'),
    person('creirwen-awenor', 'Creirwen Awenor', 'female', '1649', '????', AWENOR_HOUSE_ID, { status: 'dead' }),
    unnamedSpouse('unknown-creirwen-spouse', 'Unbekannter Ehemann', 'male', '1647'),
    person('gwylan-awenor', 'Gwylan Awenor', 'male', '1652', '????', AWENOR_HOUSE_ID, { status: 'dead' }),
    unnamedSpouse('unknown-gwylan-spouse', 'Unbekannte Ehefrau', 'female', '1654'),

    // Kinder Glynfaels
    person('ffraid-awenor', 'Ffraid Awenor', 'male', '1665', '', AWENOR_HOUSE_ID, {
      title: 'Ritterherr des Hauses Awenor'
    }),
    unnamedSpouse('unknown-ffraid-spouse', 'Unbekannte Ehefrau', 'female', '1667', ''),
    person('gethor-awenor', 'Gethor Awenor', 'male', '1670', ''),
    unnamedSpouse('unknown-gethor-spouse', 'Unbekannte Ehefrau', 'female', '1672', ''),

    // Kind Gwylans
    person('gwaeron-awenor', 'Gwaeron Awenor', 'male', '1680', ''),
    unnamedSpouse('unknown-gwaeron-spouse', 'Unbekannte Ehefrau', 'female', '1682', ''),

    // Kinder Ffraids
    person('derwain-awenor', 'Derwain Awenor', 'male', '1690', ''),
    unnamedSpouse('unknown-derwain-spouse', 'Unbekannte Ehefrau', 'female', '1692', ''),
    person('nerwen-awenor', 'Nerwen Awenor', 'female', '1693', ''),
    unnamedSpouse('unknown-nerwen-spouse', 'Unbekannter Ehemann', 'male', '1691', ''),

    // Kind Gethors
    person('garan-1695-awenor', 'Garan Awenor', 'male', '1695', ''),
    unnamedSpouse('unknown-garan-1695-spouse', 'Unbekannte Ehefrau', 'female', '1697', ''),

    // Kinder Gwaerons — Zwillinge im Dienst des Ratsmagiers Myrddin
    person('rhyd-awenor', 'Rhyd Awenor', 'male', '1705', '', AWENOR_HOUSE_ID, {
      notes: 'Lehensritter des Ratsmagiers Myrddin; wortkarg, nüchtern und der Mürrischere der Zwillinge. Sorgt still dafür, dass Aufträge erledigt werden.'
    }),
    person('rhys-awenor', 'Rhys Awenor', 'male', '1705', '', AWENOR_HOUSE_ID, {
      notes: 'Rhyds Zwillingsbruder im Dienst des Ratsmagiers Myrddin; offener und zugänglicher als sein Bruder, das menschliche Gesicht der beiden.'
    }),

    // Kinder Garans (1695)
    person('elfael-awenor', 'Elfael Awenor', 'male', '1717', ''),
    person('telyn-awenor', 'Telyn Awenor', 'female', '1720', ''),
    person('cochan-awenor', 'Cochan Awenor', 'male', '1723', ''),

    // Jüngste Generation: Kinder Derwains
    person('urfael-awenor', 'Urfael Awenor', 'male', '1715', ''),
    person('briallen-awenor', 'Briallen Awenor', 'female', '1717', ''),
    person('isgar-awenor', 'Isgar Awenor', 'male', '1723', ''),
    person('erydd-awenor', 'Erydd Awenor', 'male', '1725', ''),
    person('carys-awenor', 'Carys Awenor', 'female', '1731', '')
  ],
  partnerships: [
    createMarriage('marriage-aergol-spouse', ...FOUNDER_IDS),
    createMarriage('marriage-glynfael-spouse', ...GLYNFAEL_IDS),
    createMarriage('marriage-heulwen-spouse', ...HEULWEN_IDS),
    createMarriage('marriage-enidwen-spouse', ...ENIDWEN_IDS),
    createMarriage('marriage-creirwen-spouse', ...CREIRWEN_IDS),
    createMarriage('marriage-gwylan-spouse', ...GWYLAN_IDS),
    createMarriage('marriage-ffraid-spouse', ...FFRAID_IDS),
    createMarriage('marriage-gethor-spouse', ...GETHOR_IDS),
    createMarriage('marriage-gwaeron-spouse', ...GWAERON_IDS),
    createMarriage('marriage-derwain-spouse', ...DERWAIN_IDS),
    createMarriage('marriage-nerwen-spouse', ...NERWEN_IDS),
    createMarriage('marriage-garan-1695-spouse', ...GARAN_1695_IDS)
  ],
  parentages: [
    ...childrenOf(
      ['glynfael-awenor', 'heulwen-awenor', 'enidwen-awenor', 'creirwen-awenor', 'gwylan-awenor'],
      FOUNDER_IDS,
      'marriage-aergol-spouse',
      { type: 'claimed', certainty: 'probable' }
    ),
    ...childrenOf(['ffraid-awenor', 'gethor-awenor'], GLYNFAEL_IDS, 'marriage-glynfael-spouse'),
    ...childrenOf(['gwaeron-awenor'], GWYLAN_IDS, 'marriage-gwylan-spouse'),
    ...childrenOf(['derwain-awenor', 'nerwen-awenor'], FFRAID_IDS, 'marriage-ffraid-spouse'),
    ...childrenOf(['garan-1695-awenor'], GETHOR_IDS, 'marriage-gethor-spouse'),
    ...childrenOf(['rhyd-awenor', 'rhys-awenor'], GWAERON_IDS, 'marriage-gwaeron-spouse'),
    ...childrenOf(
      ['urfael-awenor', 'briallen-awenor', 'isgar-awenor', 'erydd-awenor', 'carys-awenor'],
      DERWAIN_IDS,
      'marriage-derwain-spouse'
    ),
    ...childrenOf(['elfael-awenor', 'telyn-awenor', 'cochan-awenor'], GARAN_1695_IDS, 'marriage-garan-1695-spouse')
  ],
  lineage: {
    founderPartnershipId: 'marriage-aergol-spouse',
    houseId: AWENOR_HOUSE_ID,
    crestSubtitle: '',
    crestEmblemScale: 0.8,
    // Ritterherrenhäuser führen den silbernen Wappenrahmen statt des goldenen.
    crestFrame: 'silver',
    crestFrameScale: 1,
    timeGap: {
      enabled: true,
      years: 0,
      fromYear: '????',
      toYear: '1640',
      label: 'Nicht einzeln überlieferte Generationen'
    }
  },
  cadetBranches: [
    createMarriedAwayBranch({
      id: 'married-away-unbekannt-heulwen',
      name: 'Unbekanntes Haus',
      parentPartnershipId: 'marriage-heulwen-spouse',
      houseId: 'house-unbekannt-heulwen',
      targetFamilyId: 'haus-unbekannt',
      crestFrame: 'gold',
      notes: 'Heulwen wurde einem in der Quelle nur als „???“ überlieferten Ehemann wegverheiratet; sein Haus ist nicht überliefert.'
    }),
    createMarriedAwayBranch({
      id: 'married-away-unbekannt-enidwen',
      name: 'Unbekanntes Haus',
      parentPartnershipId: 'marriage-enidwen-spouse',
      houseId: 'house-unbekannt-enidwen',
      targetFamilyId: 'haus-unbekannt',
      crestFrame: 'gold',
      notes: 'Enidwen wurde einem in der Quelle nur als „???“ überlieferten Ehemann wegverheiratet; sein Haus ist nicht überliefert.'
    }),
    createMarriedAwayBranch({
      id: 'married-away-unbekannt-creirwen',
      name: 'Unbekanntes Haus',
      parentPartnershipId: 'marriage-creirwen-spouse',
      houseId: 'house-unbekannt-creirwen',
      targetFamilyId: 'haus-unbekannt',
      crestFrame: 'gold',
      notes: 'Creirwen wurde einem in der Quelle nur als „???“ überlieferten Ehemann wegverheiratet; sein Haus ist nicht überliefert.'
    }),
    createMarriedAwayBranch({
      id: 'married-away-unbekannt-nerwen',
      name: 'Unbekanntes Haus',
      parentPartnershipId: 'marriage-nerwen-spouse',
      houseId: 'house-unbekannt-nerwen',
      targetFamilyId: 'haus-unbekannt',
      crestFrame: 'gold',
      notes: 'Nerwen wurde einem in der Quelle nur als „???“ überlieferten Ehemann wegverheiratet; sein Haus ist nicht überliefert.'
    })
  ],
  timeJumps: [],
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'aergol-awenor',
    orientation: 'vertical',
    ancestorDepth: 10,
    descendantDepth: 10,
    showSiblings: true
  },
  extensions: {
    sourceNote: 'Die Quelltabelle überliefert nur wenige Lebensdaten (einzige harte Jahreszahl: Rhyd und Rhys, 1705); Geburtsjahre der jüngsten Generationen wurden anhand des dargestellten Alters geschätzt, die Elterngenerationen rückwirkend mit einem gesunden Abstand von mindestens 20 Jahren zum jeweils ältesten Kind hochgerechnet. Gwylans Sohn Gwaeron ist in der Quelltabelle uneinheitlich beschriftet (einmal fälschlich als „Garan“ neben Glynfaels Söhnen einsortiert); die Kopfzeilen seiner Ehe- und Kinder-Abschnitte nennen ihn zweimal korrekt „Gwaeron“, weshalb er hier als eigenständiger Sohn Gwylans (nicht Glynfaels) mit den Zwillingen Rhyd und Rhys geführt wird. Der echte Garan (Gethors Sohn) ist davon unabhängig und Vater von Elfael, Telyn und Cochan. Sämtliche Ehepartner sind in der Quelle nur als unbeschriftetes Portraitfeld überliefert und bleiben namenlos; Heulwen, Enidwen, Creirwen und Nerwen wurden an ein nicht näher überliefertes „Unbekanntes Haus“ wegverheiratet. Externe Portraitquellen wurden als lokale Projektdateien gesichert. Als Ritterherrenhaus führt Awenor den silbernen Wappenrahmen, das Oberhaupt trägt den Titel Ritterherr.',
    blankFamily: false,
    sourceRevision: 1
  }
});
