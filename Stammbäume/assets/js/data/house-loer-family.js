import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { CELTIGERNS_WACHT_LOWER_KNIGHT_PROFILES } from './celtigerns-wacht-house-profiles.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_LOER_PORTRAITS } from './house-loer-portraits.js';

const LOER_EMBLEM = 'assets/images/houses/Llamreis Ankunft/haus-loer.png';
const LOER_HOUSE_ID = 'house-loer';
const HOUSE_HEAD_IDS = new Set(['cadfarch-loer', 'maddocc-loer', 'eurgain-loer']);
const MAIN_LINE_IDS = new Set(['ynyrion-loer', 'aeron-loer']);

function lineageRoleFor(personId) {
  if (HOUSE_HEAD_IDS.has(personId)) return 'head';
  return MAIN_LINE_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', houseId = LOER_HOUSE_ID, options = {}) {
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    houseId,
    portrait: HOUSE_LOER_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === LOER_HOUSE_ID ? 'core' : 'married'),
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

const FOUNDER_IDS = ['cadfarch-loer', 'unknown-cadfarch-spouse'];
const MADDOCC_IDS = ['maddocc-loer', 'unknown-maddocc-spouse'];
const RHIANNEDD_IDS = ['rhiannedd-loer', 'unknown-rhiannedd-spouse'];
const EURGAIN_IDS = ['eurgain-loer', 'unknown-eurgain-spouse'];
const GLENYS_1667_IDS = ['glenys-1667-loer', 'unknown-glenys-1667-spouse'];
const DWYNARTH_IDS = ['dwynarth-loer', 'unknown-dwynarth-spouse'];
const YNYRION_IDS = ['ynyrion-loer', 'unknown-ynyrion-spouse'];
const GWYNAN_IDS = ['gwynan-loer', 'unknown-gwynan-spouse'];
const GARMON_IDS = ['garmon-loer', 'unknown-garmon-spouse'];
const GLENYS_1695_IDS = ['glenys-1695-loer', 'unknown-glenys-1695-spouse'];

export const HOUSE_LOER_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-loer',
    title: 'Haus Loer',
    motto: '',
    description: 'Die belegte Linie des wohlhabenden, im Edelsteinhandel führenden Ritterherrenhauses Loer unter Haus Wyrm: vom Begründer Cadfarch bis zur Generation von 1722.',
    emblem: LOER_EMBLEM,
    houseProfile: CELTIGERNS_WACHT_LOWER_KNIGHT_PROFILES.loer
  },
  houses: [
    { id: LOER_HOUSE_ID, name: 'Haus Loer', motto: '', emblem: LOER_EMBLEM, status: 'active' },
    { id: 'house-unbekannt-rhiannedd', name: 'Unbekanntes Haus', motto: '', emblem: '', status: 'active' },
    { id: 'house-unbekannt-glenys-1667', name: 'Unbekanntes Haus', motto: '', emblem: '', status: 'active' },
    { id: 'house-unbekannt-glenys-1695', name: 'Unbekanntes Haus', motto: '', emblem: '', status: 'active' }
  ],
  persons: [
    // Begründer und seine Frau — Name in der Quelle nicht überliefert (nur „..." markiert)
    person('cadfarch-loer', 'Cadfarch Loer', 'male', '????', '????', LOER_HOUSE_ID, {
      status: 'dead',
      title: 'Begründer des Ritterherrenhauses Loer',
      notes: 'Erschloss der Überlieferung nach die ersten ergiebigen Edelsteinadern Craithglyns und errichtete zu ihrem Schutz die Stammburg; sein eigentlicher Name ist nicht überliefert.'
    }),
    unnamedSpouse('unknown-cadfarch-spouse', 'Unbekannte Ehefrau', 'female'),

    // Kinder des Begründers — ebenfalls namenlos überliefert, nach der Überlieferungslücke benannt
    person('maddocc-loer', 'Maddocc Loer', 'male', '1639', '????', LOER_HOUSE_ID, { status: 'dead' }),
    unnamedSpouse('unknown-maddocc-spouse', 'Unbekannte Ehefrau', 'female', '1641'),
    person('rhiannedd-loer', 'Rhiannedd Loer', 'female', '1636', '????', LOER_HOUSE_ID, { status: 'dead' }),
    unnamedSpouse('unknown-rhiannedd-spouse', 'Unbekannter Ehemann', 'male', '1634'),

    // Kinder Maddoccs
    person('eurgain-loer', 'Eurgain Loer', 'male', '1664', '', LOER_HOUSE_ID, {
      title: 'Ritterherr des Hauses Loer'
    }),
    unnamedSpouse('unknown-eurgain-spouse', 'Unbekannte Ehefrau', 'female', '1666', ''),
    person('glenys-1667-loer', 'Glenys Loer', 'female', '1667', '????', LOER_HOUSE_ID, { status: 'dead' }),
    unnamedSpouse('unknown-glenys-1667-spouse', 'Unbekannter Ehemann', 'male', '1665'),
    person('dwynarth-loer', 'Dwynarth Loer', 'male', '1670', '', LOER_HOUSE_ID, {
      notes: 'Hauptmann Craithglyns.'
    }),
    unnamedSpouse('unknown-dwynarth-spouse', 'Unbekannte Ehefrau', 'female', '1672', ''),

    // Kinder Eurgains
    person('ynyrion-loer', 'Ynyrion Loer', 'male', '1689', ''),
    unnamedSpouse('unknown-ynyrion-spouse', 'Unbekannte Ehefrau', 'female', '1691', ''),
    person('gwynan-loer', 'Gwynan Loer', 'male', '1692', ''),
    unnamedSpouse('unknown-gwynan-spouse', 'Unbekannte Ehefrau', 'female', '1694', ''),

    // Kinder Dwynarths
    person('garmon-loer', 'Garmon Loer', 'male', '1692', ''),
    unnamedSpouse('unknown-garmon-spouse', 'Unbekannte Ehefrau', 'female', '1694', ''),
    person('glenys-1695-loer', 'Glenys Loer', 'female', '1695', ''),
    unnamedSpouse('unknown-glenys-1695-spouse', 'Unbekannter Ehemann', 'male', '1693', ''),

    // Jüngste Generation: Kinder Ynyrions
    person('aeron-loer', 'Aeron Loer', 'male', '1712', ''),
    person('gwion-loer', 'Gwion Loer', 'male', '1715', ''),
    person('gwallter-loer', 'Gwallter Loer', 'male', '1717', ''),
    person('olwen-loer', 'Olwen Loer', 'female', '1720', ''),

    // Jüngste Generation: Kinder Gwynans
    person('gwenfaen-loer', 'Gwenfaen Loer', 'female', '1715', ''),
    person('islwyna-loer', 'Islwyna Loer', 'female', '1720', ''),

    // Jüngste Generation: Kinder Garmons
    person('tyne-loer', 'Tyne Loer', 'female', '1717', ''),
    person('tesni-loer', 'Tesni Loer', 'female', '1722', '')
  ],
  partnerships: [
    createMarriage('marriage-cadfarch-spouse', ...FOUNDER_IDS),
    createMarriage('marriage-maddocc-spouse', ...MADDOCC_IDS),
    createMarriage('marriage-rhiannedd-spouse', ...RHIANNEDD_IDS),
    createMarriage('marriage-eurgain-spouse', ...EURGAIN_IDS),
    createMarriage('marriage-glenys-1667-spouse', ...GLENYS_1667_IDS),
    createMarriage('marriage-dwynarth-spouse', ...DWYNARTH_IDS),
    createMarriage('marriage-ynyrion-spouse', ...YNYRION_IDS),
    createMarriage('marriage-gwynan-spouse', ...GWYNAN_IDS),
    createMarriage('marriage-garmon-spouse', ...GARMON_IDS),
    createMarriage('marriage-glenys-1695-spouse', ...GLENYS_1695_IDS)
  ],
  parentages: [
    ...childrenOf(
      ['maddocc-loer', 'rhiannedd-loer'],
      FOUNDER_IDS,
      'marriage-cadfarch-spouse',
      { type: 'claimed', certainty: 'probable' }
    ),
    ...childrenOf(['eurgain-loer', 'glenys-1667-loer', 'dwynarth-loer'], MADDOCC_IDS, 'marriage-maddocc-spouse'),
    ...childrenOf(['ynyrion-loer', 'gwynan-loer'], EURGAIN_IDS, 'marriage-eurgain-spouse'),
    ...childrenOf(['garmon-loer', 'glenys-1695-loer'], DWYNARTH_IDS, 'marriage-dwynarth-spouse'),
    ...childrenOf(['aeron-loer', 'gwion-loer', 'gwallter-loer', 'olwen-loer'], YNYRION_IDS, 'marriage-ynyrion-spouse'),
    ...childrenOf(['gwenfaen-loer', 'islwyna-loer'], GWYNAN_IDS, 'marriage-gwynan-spouse'),
    ...childrenOf(['tyne-loer', 'tesni-loer'], GARMON_IDS, 'marriage-garmon-spouse')
  ],
  lineage: {
    founderPartnershipId: 'marriage-cadfarch-spouse',
    houseId: LOER_HOUSE_ID,
    crestSubtitle: '',
    crestEmblemScale: 0.8,
    // Ritterherrenhäuser führen den silbernen Wappenrahmen statt des goldenen.
    crestFrame: 'silver',
    crestFrameScale: 1,
    timeGap: {
      enabled: true,
      years: 0,
      fromYear: '????',
      toYear: '1639',
      label: 'Nicht einzeln überlieferte Generationen'
    }
  },
  cadetBranches: [
    createMarriedAwayBranch({
      id: 'married-away-unbekannt-rhiannedd',
      name: 'Unbekanntes Haus',
      parentPartnershipId: 'marriage-rhiannedd-spouse',
      houseId: 'house-unbekannt-rhiannedd',
      targetFamilyId: 'haus-unbekannt',
      crestFrame: 'gold',
      notes: 'Rhiannedd wurde einem in der Quelle nur als „???“ überlieferten Ehemann wegverheiratet; sein Haus ist nicht überliefert.'
    }),
    createMarriedAwayBranch({
      id: 'married-away-unbekannt-glenys-1667',
      name: 'Unbekanntes Haus',
      parentPartnershipId: 'marriage-glenys-1667-spouse',
      houseId: 'house-unbekannt-glenys-1667',
      targetFamilyId: 'haus-unbekannt',
      crestFrame: 'gold',
      notes: 'Glenys, die Schwester Eurgains und Dwynarths, wurde einem in der Quelle nur als „???“ überlieferten Ehemann wegverheiratet; sein Haus ist nicht überliefert.'
    }),
    createMarriedAwayBranch({
      id: 'married-away-unbekannt-glenys-1695',
      name: 'Unbekanntes Haus',
      parentPartnershipId: 'marriage-glenys-1695-spouse',
      houseId: 'house-unbekannt-glenys-1695',
      targetFamilyId: 'haus-unbekannt',
      crestFrame: 'gold',
      notes: 'Glenys, Dwynarths Tochter, wurde einem in der Quelle nur als „???“ überlieferten Ehemann wegverheiratet; sein Haus ist nicht überliefert.'
    })
  ],
  timeJumps: [],
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'cadfarch-loer',
    orientation: 'vertical',
    ancestorDepth: 10,
    descendantDepth: 10,
    showSiblings: true
  },
  extensions: {
    sourceNote: 'Die Quelltabelle überliefert für die frühen Generationen (Begründer und seine beiden Kinder) keine Namen, nur „..."-Platzhalter; sie wurden mit passenden walisischen Namen ergänzt (Cadfarch, Maddocc, Rhiannedd). Keine Generation trägt eine feste Jahreszahl; Geburtsjahre der jüngsten Generation (Ynyrions Kinder Aeron, Gwion, Gwallter, Olwen; Gwynans Kinder Gwenfaen, Islwyna; Garmons Kinder Tyne, Tesni) wurden anhand des dargestellten Alters geschätzt, die Elterngenerationen rückwirkend mit einem gesunden Abstand von mindestens 20 Jahren zum jeweils ältesten Kind hochgerechnet. Eine weitere, in der Quelle nur als „???" geführte Schwester Eurgains und Dwynarths erhielt den Namen Glenys; da Dwynarths eigene Tochter unabhängig davon ebenfalls Glenys heißt (Namensgleichheit über eine Generation hinweg, kein Fehler), sind beide über das Geburtsjahr in der ID disambiguiert. Sämtliche Ehepartner sind in der Quelle nur als unbeschriftetes Portraitfeld überliefert und bleiben namenlos; Rhiannedd und beide Glenys wurden an ein nicht näher überliefertes „Unbekanntes Haus" wegverheiratet. Die Quelle nennt als Lehnsherr durchgängig Haus Wyrm (nicht Draig); das Registry wurde entsprechend korrigiert. Externe Portraitquellen wurden als lokale Projektdateien gesichert. Als Ritterherrenhaus führt Loer den silbernen Wappenrahmen, das Oberhaupt trägt den Titel Ritterherr.',
    blankFamily: false,
    sourceRevision: 1
  }
});
