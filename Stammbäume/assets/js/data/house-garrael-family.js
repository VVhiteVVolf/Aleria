import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { CELTIGERNS_WACHT_HOUSE_PROFILES } from './celtigerns-wacht-house-profiles.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_GARRAEL_PORTRAITS } from './house-garrael-portraits.js';

const GARRAEL_EMBLEM = 'assets/images/houses/haus-garrael.png';
const GARRAEL_HOUSE_ID = 'house-garrael';
const HOUSE_HEAD_IDS = new Set(['aledd-garrael', 'lyonnel-garrael']);
const MAIN_LINE_IDS = new Set(['uther-garrael']);

function lineageRoleFor(personId) {
  if (HOUSE_HEAD_IDS.has(personId)) return 'head';
  return MAIN_LINE_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', houseId = GARRAEL_HOUSE_ID, options = {}) {
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    houseId,
    portrait: HOUSE_GARRAEL_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === GARRAEL_HOUSE_ID ? 'core' : 'married'),
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

const FOUNDER_IDS = ['aledd-garrael', 'unknown-aledd-spouse'];
const LYONNEL_IDS = ['lyonnel-garrael', 'unknown-lyonnel-spouse'];
const CARYS_IDS = ['carys-garrael', 'unknown-carys-spouse'];
const BEDWYR_IDS = ['bedwyr-garrael', 'unknown-bedwyr-spouse'];
const UTHER_IDS = ['uther-garrael', 'unknown-uther-spouse'];
const EITHNE_IDS = ['eithne-garrael', 'unknown-eithne-spouse'];
const ELAIN_IDS = ['elain-garrael', 'unknown-elain-spouse'];
const GAVIN_IDS = ['gavin-garrael', 'unknown-gavin-spouse'];
const EMYR_IDS = ['emyr-garrael', 'unknown-emyr-spouse'];
const LOWRI_IDS = ['lowri-garrael', 'unknown-lowri-spouse'];
const MEGAN_IDS = ['megan-garrael', 'unknown-megan-spouse'];
const GARETH_IDS = ['gareth-garrael', 'unknown-gareth-spouse'];
const HELEDD_IDS = ['heledd-garrael', 'unknown-heledd-spouse'];

export const HOUSE_GARRAEL_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-garrael',
    title: 'Haus Garrael',
    motto: '',
    description: 'Die belegte Linie des Ritterherrenhauses Garrael, dauerhafte Lehenswarte über Aberllan im Herrschaftsgebiet Camruisge: vom Begründer Aledd bis zur Generation von 1727.',
    emblem: GARRAEL_EMBLEM,
    houseProfile: CELTIGERNS_WACHT_HOUSE_PROFILES.garrael
  },
  houses: [
    { id: GARRAEL_HOUSE_ID, name: 'Haus Garrael', motto: '', emblem: GARRAEL_EMBLEM, status: 'active' },
    { id: 'house-unbekannt-carys', name: 'Unbekanntes Haus', motto: '', emblem: '', status: 'active' },
    { id: 'house-unbekannt-eithne', name: 'Unbekanntes Haus', motto: '', emblem: '', status: 'active' },
    { id: 'house-unbekannt-elain', name: 'Unbekanntes Haus', motto: '', emblem: '', status: 'active' }
  ],
  persons: [
    // Begründer und seine Frau
    person('aledd-garrael', 'Aledd Garrael', 'male', '????', '????', GARRAEL_HOUSE_ID, {
      status: 'dead',
      title: 'Begründer des Ritterherrenhauses Garrael',
      notes: 'Wurde von Haus Draig als loyaler, lokal unverstrickter Lehenswart nach Camruisge entsandt, um die Fehden Aberllans zu beenden.'
    }),
    unnamedSpouse('unknown-aledd-spouse', 'Unbekannte Ehefrau', 'female'),

    // Kinder Aledds
    person('lyonnel-garrael', 'Lyonnel Garrael', 'male', '1663', '', GARRAEL_HOUSE_ID, {
      title: 'Ritterherr des Hauses Garrael'
    }),
    unnamedSpouse('unknown-lyonnel-spouse', 'Unbekannte Ehefrau', 'female', '1665', ''),
    person('carys-garrael', 'Carys Garrael', 'female', '1666', ''),
    unnamedSpouse('unknown-carys-spouse', 'Unbekannter Ehemann', 'male', '1664', ''),
    person('bedwyr-garrael', 'Bedwyr Garrael', 'male', '1670', ''),
    unnamedSpouse('unknown-bedwyr-spouse', 'Unbekannte Ehefrau', 'female', '1672', ''),

    // Kinder Lyonnels
    person('uther-garrael', 'Uther Garrael', 'male', '1688', ''),
    unnamedSpouse('unknown-uther-spouse', 'Unbekannte Ehefrau', 'female', '1690', ''),
    person('eithne-garrael', 'Eithne Garrael', 'female', '1691', ''),
    unnamedSpouse('unknown-eithne-spouse', 'Unbekannter Ehemann', 'male', '1689', ''),

    // Kinder Bedwyrs
    person('elain-garrael', 'Elain Garrael', 'female', '1693', ''),
    unnamedSpouse('unknown-elain-spouse', 'Unbekannter Ehemann', 'male', '1691', ''),
    person('gavin-garrael', 'Gavin Garrael', 'male', '1695', ''),
    unnamedSpouse('unknown-gavin-spouse', 'Unbekannte Ehefrau', 'female', '1697', ''),

    // Kinder Uthers
    person('emyr-garrael', 'Emyr Garrael', 'male', '1713', ''),
    unnamedSpouse('unknown-emyr-spouse', 'Unbekannte Ehefrau', 'female', '1715', ''),
    person('lowri-garrael', 'Lowri Garrael', 'female', '1715', ''),
    unnamedSpouse('unknown-lowri-spouse', 'Unbekannter Ehemann', 'male', '1713', ''),
    person('megan-garrael', 'Megan Garrael', 'female', '1718', ''),
    unnamedSpouse('unknown-megan-spouse', 'Unbekannter Ehemann', 'male', '1716', ''),
    person('gareth-garrael', 'Gareth Garrael', 'male', '1725', ''),
    unnamedSpouse('unknown-gareth-spouse', 'Unbekannte Ehefrau', 'female', '1727', ''),
    person('heledd-garrael', 'Heledd Garrael', 'female', '1727', ''),
    unnamedSpouse('unknown-heledd-spouse', 'Unbekannter Ehemann', 'male', '1725', ''),

    // Jüngste Generation: Kinder Gavins
    person('jac-garrael', 'Jac Garrael', 'male', '1720', ''),
    person('marc-garrael', 'Marc Garrael', 'male', '1724', '')
  ],
  partnerships: [
    createMarriage('marriage-aledd-spouse', ...FOUNDER_IDS),
    createMarriage('marriage-lyonnel-spouse', ...LYONNEL_IDS),
    createMarriage('marriage-carys-spouse', ...CARYS_IDS),
    createMarriage('marriage-bedwyr-spouse', ...BEDWYR_IDS),
    createMarriage('marriage-uther-spouse', ...UTHER_IDS),
    createMarriage('marriage-eithne-spouse', ...EITHNE_IDS),
    createMarriage('marriage-elain-spouse', ...ELAIN_IDS),
    createMarriage('marriage-gavin-spouse', ...GAVIN_IDS),
    createMarriage('marriage-emyr-spouse', ...EMYR_IDS),
    createMarriage('marriage-lowri-spouse', ...LOWRI_IDS),
    createMarriage('marriage-megan-spouse', ...MEGAN_IDS),
    createMarriage('marriage-gareth-spouse', ...GARETH_IDS),
    createMarriage('marriage-heledd-spouse', ...HELEDD_IDS)
  ],
  parentages: [
    ...childrenOf(
      ['lyonnel-garrael', 'carys-garrael', 'bedwyr-garrael'],
      FOUNDER_IDS,
      'marriage-aledd-spouse',
      { type: 'claimed', certainty: 'probable' }
    ),
    ...childrenOf(['uther-garrael', 'eithne-garrael'], LYONNEL_IDS, 'marriage-lyonnel-spouse'),
    ...childrenOf(['elain-garrael', 'gavin-garrael'], BEDWYR_IDS, 'marriage-bedwyr-spouse'),
    ...childrenOf(
      ['emyr-garrael', 'lowri-garrael', 'megan-garrael', 'gareth-garrael', 'heledd-garrael'],
      UTHER_IDS,
      'marriage-uther-spouse'
    ),
    ...childrenOf(['jac-garrael', 'marc-garrael'], GAVIN_IDS, 'marriage-gavin-spouse')
  ],
  lineage: {
    founderPartnershipId: 'marriage-aledd-spouse',
    houseId: GARRAEL_HOUSE_ID,
    crestSubtitle: '',
    crestEmblemScale: 0.8,
    // Ritterherrenhäuser führen den silbernen Wappenrahmen statt des goldenen.
    crestFrame: 'silver',
    crestFrameScale: 1,
    timeGap: {
      enabled: true,
      years: 0,
      fromYear: '????',
      toYear: '1663',
      label: 'Nicht einzeln überlieferte Generationen'
    }
  },
  cadetBranches: [
    createMarriedAwayBranch({
      id: 'married-away-unbekannt-carys',
      name: 'Unbekanntes Haus',
      parentPartnershipId: 'marriage-carys-spouse',
      houseId: 'house-unbekannt-carys',
      targetFamilyId: 'haus-unbekannt',
      crestFrame: 'gold',
      notes: 'Carys wurde laut Quelle „wegverheiratet an" ein nicht näher überliefertes Haus.'
    }),
    createMarriedAwayBranch({
      id: 'married-away-unbekannt-eithne',
      name: 'Unbekanntes Haus',
      parentPartnershipId: 'marriage-eithne-spouse',
      houseId: 'house-unbekannt-eithne',
      targetFamilyId: 'haus-unbekannt',
      crestFrame: 'gold',
      notes: 'Eithne wurde laut Quelle „wegverheiratet an" ein nicht näher überliefertes Haus.'
    }),
    createMarriedAwayBranch({
      id: 'married-away-unbekannt-elain',
      name: 'Unbekanntes Haus',
      parentPartnershipId: 'marriage-elain-spouse',
      houseId: 'house-unbekannt-elain',
      targetFamilyId: 'haus-unbekannt',
      crestFrame: 'gold',
      notes: 'Elain wurde laut Quelle „wegverheiratet an" ein nicht näher überliefertes Haus.'
    })
  ],
  timeJumps: [],
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'aledd-garrael',
    orientation: 'vertical',
    ancestorDepth: 10,
    descendantDepth: 10,
    showSiblings: true
  },
  extensions: {
    sourceNote: 'Die Quelltabelle überliefert keine Jahreszahlen; Geburtsjahre der jüngsten Generation (Uthers Kinder Emyr, Lowri, Megan, Gareth, Heledd und Gavins Kinder Jac, Marc) wurden anhand des dargestellten Alters geschätzt, die Elterngenerationen rückwirkend mit einem gesunden Abstand von mindestens 20 Jahren zum jeweils ältesten Kind hochgerechnet. Anders als bei den meisten Ritterherrenhäusern markiert die Quelle Carys, Eithne und Elain ausdrücklich als „wegverheiratet an" ein nicht näher genanntes Haus; sie führen daher jeweils ein Wegverheiratete-Linie-Medaillon mit dem Platzhalter „Unbekanntes Haus". Sämtliche Ehepartner sind in der Quelle nur als unbeschriftetes Portraitfeld überliefert und bleiben namenlos. Die beigefügte Stammbaumgrafik ist ein unausgefülltes generisches Vorlagenraster ohne eigene Beschriftung und wurde daher nicht als Strukturquelle herangezogen; maßgeblich war die benannte Hof-/Hierarchietabelle. Haus Garrael sitzt abseits der übrigen niederen Ritterhäuser direkt in der Ordnerstruktur Cenyr/Celtigerns Wacht/Camruisge/Aberllan; für den Sitz Aberllan liegt noch kein Wappenbild vor. Externe Portraitquellen wurden als lokale Projektdateien gesichert. Als Ritterherrenhaus führt Garrael den silbernen Wappenrahmen, das Oberhaupt trägt den Titel Ritterherr.',
    blankFamily: false,
    sourceRevision: 1
  }
});
