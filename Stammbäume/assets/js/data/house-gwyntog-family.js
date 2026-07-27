import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { GWENDOLYNS_UFER_VASSAL_PROFILES } from './celtigerns-wacht-house-profiles.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_GWYNTOG_PORTRAITS } from './house-gwyntog-portraits.js';

const GWYNTOG_EMBLEM = 'assets/images/houses/Gwendolyns Ufer/Ritterliche/Gwyntog.png';
const GWYNTOG_HOUSE_ID = 'house-gwyntog';
const HOUSE_EMBLEMS = Object.freeze({
  rhuddgar: 'assets/images/houses/Gwendolyns Ufer/Ritterliche/Rhuddgar.png',
  balchder: 'assets/images/houses/Llamreis Ankunft/haus-balchder.png'
});

const HOUSE_HEAD_IDS = new Set([
  'llywarch-gwyntog',
  'ithel-der-rote-gwyntog',
  'alastair-gwyntog'
]);

// Nudd ist ausdrücklich Alastairs Erbe. Dogeds Portrait erscheint zusätzlich
// im Erbfolgefeld der Hierarchietabelle und führt diese Linie eine Stufe weiter.
const MAIN_LINE_IDS = new Set([
  'nudd-gwyntog',
  'doged-gwyntog'
]);

function lineageRoleFor(personId) {
  if (HOUSE_HEAD_IDS.has(personId)) return 'head';
  return MAIN_LINE_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', houseId = GWYNTOG_HOUSE_ID, options = {}) {
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    houseId,
    portrait: HOUSE_GWYNTOG_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === GWYNTOG_HOUSE_ID ? 'core' : 'married'),
    lineageRole: options.lineageRole || lineageRoleFor(id),
    ...options
  });
}

function spouse(id, name, sex, birth = '????', death = '', houseId = '', options = {}) {
  return person(id, name, sex, birth, death, houseId, {
    familyRole: 'married',
    ...options
  });
}

function unknownSpouse(id, sex, relationNote) {
  return spouse(id, '???', sex, '????', '????', '', {
    notes: relationNote + ' Name, Herkunftshaus und Lebensdaten sind nicht überliefert.'
  });
}

function house(id, name, emblem = '') {
  return { id, name, motto: '', emblem, status: 'active' };
}

function childrenOf(childIds, parentIds, partnershipId, options = {}) {
  return createParentages(childIds, parentIds, partnershipId, options);
}

const LLYWARCH_IDS = ['llywarch-gwyntog', 'unknown-spouse-llywarch-gwyntog'];
const ITHEL_IDS = ['ithel-der-rote-gwyntog', 'gwladus-rhuddgar'];
const IOAN_IDS = ['ioan-gwyntog', 'unknown-spouse-ioan-gwyntog'];
const ALASTAIR_IDS = ['alastair-gwyntog', 'genofeva-balchder'];
const TRISTAN_IDS = ['tristan-gwyntog', 'unknown-spouse-tristan-gwyntog'];
const OWENA_IDS = ['owena-gwyntog', 'unknown-spouse-owena-gwyntog'];
const ELIAN_IDS = ['elian-gwyntog', 'unknown-spouse-elian-gwyntog'];
const NUDD_IDS = ['nudd-gwyntog', 'unknown-spouse-nudd-gwyntog'];
const MANON_IDS = ['manon-gwyntog', 'unknown-spouse-manon-gwyntog'];
const GEREINT_IDS = ['gereint-gwyntog', 'unknown-spouse-gereint-gwyntog'];
const ADDA_IDS = ['adda-gwyntog', 'unknown-spouse-adda-gwyntog'];
const ENDAF_IDS = ['endaf-gwyntog', 'unknown-spouse-endaf-gwyntog'];
const GEREINT_AFFAIR_IDS = ['gereint-gwyntog', 'alva'];

export const HOUSE_GWYNTOG_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-gwyntog',
    title: 'Haus Gwyntog',
    motto: '',
    description: 'Das seefahrende Ritterhaus Gwyntog aus Abergwint: Kapitäne, Admiräle und Schiffsherren im Dienst von Haus Gwyvern.',
    emblem: GWYNTOG_EMBLEM,
    houseProfile: GWENDOLYNS_UFER_VASSAL_PROFILES.gwyntog
  },
  houses: [
    house(GWYNTOG_HOUSE_ID, 'Haus Gwyntog', GWYNTOG_EMBLEM),
    house('house-rhuddgar', 'Haus Rhuddgar', HOUSE_EMBLEMS.rhuddgar),
    house('house-balchder', 'Haus Balchder', HOUSE_EMBLEMS.balchder),
    house('house-unbekannt-owena-gwyntog', 'Unbekanntes Haus'),
    house('house-unbekannt-manon-gwyntog', 'Unbekanntes Haus')
  ],
  persons: [
    person('llywarch-gwyntog', 'Llywarch der Graue Gwyntog', 'male', '????', '????', GWYNTOG_HOUSE_ID, {
      title: 'Gründer und erster Ritterherr des Hauses Gwyntog',
      notes: 'Von Haus Draig zum Ritterherrn und Lehnswart über das frühe Abergwint erhoben.'
    }),
    unknownSpouse(
      'unknown-spouse-llywarch-gwyntog',
      'female',
      'Ehefrau des Gründers Llywarch.'
    ),

    // Erste einzeln überlieferte Generation hinter der frühen Quellenlücke.
    person('ithel-der-rote-gwyntog', 'Ithel der Rote Gwyntog', 'male', '1645', '????', GWYNTOG_HOUSE_ID, {
      title: 'Zweiter überlieferter Ritterherr des Hauses Gwyntog'
    }),
    spouse('gwladus-rhuddgar', 'Gwladus Rhuddgar', 'female', '1652', '1730', 'house-rhuddgar'),
    person('ioan-gwyntog', 'Ioan Gwyntog', 'male', '1647', '????'),
    unknownSpouse('unknown-spouse-ioan-gwyntog', 'female', 'Ehefrau Ioans.'),

    // Kinder Ithels beziehungsweise die in der rechten Ioan-Linie geführten Kinder.
    person('alastair-gwyntog', 'Alastair Gwyntog', 'male', '1671', '', GWYNTOG_HOUSE_ID, {
      title: 'Ritterherr des Hauses Gwyntog und Hafenmeister von Abergwint'
    }),
    spouse('genofeva-balchder', 'Genofeva Balchder', 'female', '1676', '', 'house-balchder'),
    person('tristan-gwyntog', 'Tristan Gwyntog', 'male', '1672', '1720'),
    unknownSpouse('unknown-spouse-tristan-gwyntog', 'female', 'Ehefrau Tristans.'),
    person('owena-gwyntog', 'Owena Gwyntog', 'female', '1674', '', GWYNTOG_HOUSE_ID, {
      notes: 'Owena wurde an einen namentlich und herkunftsmäßig nicht überlieferten Mann wegverheiratet und führt die Gwyntog-Linie nicht fort.',
      extensions: { registryManagedFields: ['notes'] }
    }),
    unknownSpouse('unknown-spouse-owena-gwyntog', 'male', 'Ehemann Owenas.'),
    person('elian-gwyntog', 'Elian Gwyntog', 'male', '1675', '', GWYNTOG_HOUSE_ID, {
      title: 'Sir · Oberster Schiffsbauleiter des Hauses Gwyntog',
      notes: 'Vater von Adda und Endaf mit seiner namentlich nicht überlieferten Ehefrau.'
    }),
    unknownSpouse('unknown-spouse-elian-gwyntog', 'female', 'Ehefrau Elians.'),

    // Kinder Alastairs, Tristans und Owenas.
    person('nudd-gwyntog', 'Nudd Gwyntog', 'male', '1696', '', GWYNTOG_HOUSE_ID, {
      title: 'Erbe des Hauses Gwyntog · Hafenvogt von Abergwint'
    }),
    unknownSpouse('unknown-spouse-nudd-gwyntog', 'female', 'Ehefrau Nudds.'),
    person('manon-gwyntog', 'Manon Gwyntog', 'female', '1697', ''),
    unknownSpouse('unknown-spouse-manon-gwyntog', 'male', 'Ehemann Manons.'),
    person('gereint-gwyntog', 'Gereint Gwyntog', 'male', '1697', '', GWYNTOG_HOUSE_ID, {
      title: 'Waffenmeister in Garwfaen',
      notes: 'Lebt wegen seiner Affäre mit Alva und des daraus entstandenen Bastards Sten fern von Abergwint.'
    }),
    unknownSpouse('unknown-spouse-gereint-gwyntog', 'female', 'Ehefrau Gereints.'),
    person('adda-gwyntog', 'Adda Gwyntog', 'male', '1699', ''),
    unknownSpouse('unknown-spouse-adda-gwyntog', 'female', 'Ehefrau Addas.'),
    person('endaf-gwyntog', 'Endaf Gwyntog', 'male', '1703', ''),
    unknownSpouse('unknown-spouse-endaf-gwyntog', 'female', 'Ehefrau Endafs.'),

    person('alva', 'Alva', 'female', '1703', '', '', {
      familyRole: 'affair',
      title: 'Affäre Gereints · Mutter von Sten',
      notes: 'Lebt mit Gereint und ihrem Sohn Sten außerhalb Abergwints; sie wird vom Haus geduldet und versorgt, gehört ihm aber nicht an.'
    }),

    // Jüngste belegte Generation.
    person('doged-gwyntog', 'Doged Gwyntog', 'male', '1718', '', GWYNTOG_HOUSE_ID, {
      title: 'In der Hierarchietabelle als spätere Erbfolge angedeutet'
    }),
    person('tybie-gwyntog', 'Tybie Gwyntog', 'female', '1719', ''),
    person('gutyn-gwyntog', 'Gutyn Gwyntog', 'male', '1721', ''),
    person('nanna-gwyntog', 'Nanna Gwyntog', 'female', '1722', ''),
    person('sten', 'Sten', 'male', '1725', '', '', {
      familyRole: 'bastard',
      title: 'Nicht anerkannter Bastard Gereints · Knappe in Garwfaen',
      notes: 'Haus Gwyntog finanziert Schutz und Ausbildung, erkennt Sten jedoch weder als Familienmitglied noch als Erben an.'
    }),
    person('afan-gwyntog', 'Afan Gwyntog', 'male', '1722', ''),
    person('asgell-gwyntog', 'Asgell Gwyntog', 'female', '1724', ''),
    person('pyderi-gwyntog', 'Pyderi Gwyntog', 'male', '1730', '')
  ],
  partnerships: [
    createMarriage('marriage-llywarch-unknown-gwyntog', ...LLYWARCH_IDS, { status: 'ended' }),
    createMarriage('marriage-gwladus-ithel', ...ITHEL_IDS, { status: 'ended' }),
    createMarriage('marriage-ioan-unknown-gwyntog', ...IOAN_IDS, { status: 'ended' }),
    createMarriage('marriage-genofeva-alastair', ...ALASTAIR_IDS),
    createMarriage('marriage-tristan-unknown-gwyntog', ...TRISTAN_IDS, { status: 'ended' }),
    createMarriage('marriage-owena-unknown-gwyntog', ...OWENA_IDS, { status: 'widowed' }),
    createMarriage('marriage-elian-unknown-gwyntog', ...ELIAN_IDS, { status: 'widowed' }),
    createMarriage('marriage-nudd-unknown-gwyntog', ...NUDD_IDS, { status: 'widowed' }),
    createMarriage('marriage-manon-unknown-gwyntog', ...MANON_IDS, { status: 'widowed' }),
    createMarriage('marriage-gereint-unknown-gwyntog', ...GEREINT_IDS, { status: 'widowed' }),
    createMarriage('marriage-adda-unknown-gwyntog', ...ADDA_IDS, { status: 'widowed' }),
    createMarriage('marriage-endaf-unknown-gwyntog', ...ENDAF_IDS, { status: 'widowed' }),
    createMarriage('affair-gereint-alva', ...GEREINT_AFFAIR_IDS, { type: 'affair' })
  ],
  parentages: [
    ...childrenOf(
      ['ithel-der-rote-gwyntog', 'ioan-gwyntog'],
      LLYWARCH_IDS,
      'marriage-llywarch-unknown-gwyntog',
      {
        type: 'claimed',
        certainty: 'probable',
        notes: 'Nicht einzeln überlieferte Generationen verbinden das Gründerpaar mit Ithel und Ioan.',
        extensions: { timeJumpId: 'gap-llywarch-ithel-gwyntog' }
      }
    ),
    ...childrenOf(['alastair-gwyntog', 'tristan-gwyntog'], ITHEL_IDS, 'marriage-gwladus-ithel'),
    ...childrenOf(
      ['owena-gwyntog', 'elian-gwyntog'],
      IOAN_IDS,
      'marriage-ioan-unknown-gwyntog',
      {
        type: 'claimed',
        certainty: 'probable',
        notes: 'Die rechte Spalte liegt unter Ioan und seiner Ehefrau, ist im Kinderbalken jedoch nur mit Platzhaltern beschriftet.'
      }
    ),
    ...childrenOf(['nudd-gwyntog', 'manon-gwyntog'], ALASTAIR_IDS, 'marriage-genofeva-alastair'),
    ...childrenOf(['gereint-gwyntog'], TRISTAN_IDS, 'marriage-tristan-unknown-gwyntog'),
    ...childrenOf(
      ['adda-gwyntog', 'endaf-gwyntog'],
      ELIAN_IDS,
      'marriage-elian-unknown-gwyntog',
      {
        notes: 'Adda und Endaf sind die Kinder Elians und seiner namentlich nicht überlieferten Ehefrau.',
        extensions: {
          registryManagedFields: ['parentIds', 'partnershipId', 'type', 'certainty', 'notes']
        }
      }
    ),
    ...childrenOf(['doged-gwyntog', 'tybie-gwyntog'], NUDD_IDS, 'marriage-nudd-unknown-gwyntog'),
    ...childrenOf(['gutyn-gwyntog', 'nanna-gwyntog'], GEREINT_IDS, 'marriage-gereint-unknown-gwyntog'),
    ...childrenOf(['sten'], GEREINT_AFFAIR_IDS, 'affair-gereint-alva', {
      legitimacy: 'illegitimate',
      notes: 'Nicht anerkannter Bastard aus Gereints Affäre mit Alva.'
    }),
    ...childrenOf(['afan-gwyntog', 'asgell-gwyntog'], ADDA_IDS, 'marriage-adda-unknown-gwyntog'),
    ...childrenOf(['pyderi-gwyntog'], ENDAF_IDS, 'marriage-endaf-unknown-gwyntog')
  ],
  lineage: {
    founderPartnershipId: 'marriage-llywarch-unknown-gwyntog',
    houseId: GWYNTOG_HOUSE_ID,
    crestSubtitle: 'Seefahrendes Ritterhaus aus Abergwint',
    crestEmblemScale: 0.82,
    crestFrame: 'silver',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  cadetBranches: [
    createMarriedAwayBranch({
      id: 'married-away-unknown-owena-gwyntog',
      name: 'Unbekanntes Haus',
      parentPartnershipId: 'marriage-owena-unknown-gwyntog',
      houseId: 'house-unbekannt-owena-gwyntog',
      targetFamilyId: 'haus-unbekannt',
      crestFrame: 'gold',
      notes: 'Owena Gwyntog wurde an einen namentlich und herkunftsmäßig nicht überlieferten Mann wegverheiratet und führt die Gwyntog-Linie nicht fort.'
    }),
    createMarriedAwayBranch({
      id: 'married-away-unknown-manon-gwyntog',
      name: 'Unbekanntes Haus',
      parentPartnershipId: 'marriage-manon-unknown-gwyntog',
      houseId: 'house-unbekannt-manon-gwyntog',
      targetFamilyId: 'haus-unbekannt',
      crestFrame: 'gold',
      notes: 'Manon Gwyntog wurde an einen namentlich und herkunftsmäßig nicht überlieferten Mann wegverheiratet.'
    })
  ],
  timeJumps: [
    {
      id: 'gap-llywarch-ithel-gwyntog',
      parentPartnershipId: 'marriage-llywarch-unknown-gwyntog',
      parentPersonId: '',
      childIds: ['ithel-der-rote-gwyntog', 'ioan-gwyntog'],
      years: 0,
      fromYear: '????',
      toYear: '1645',
      label: 'Nicht einzeln überlieferte Generationen',
      notes: 'Der Zeitsprung folgt als absoluter Trenner auf das von Llywarch und seiner unbekannten Ehefrau begründete Hauswappen.',
      extensions: {}
    }
  ],
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'llywarch-gwyntog',
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    sourceNote: 'Genealogie, Hausdaten, Ämter und Portraitquellen nach der bereitgestellten Gwyntog-Hausseite und der ergänzenden Abstammungskorrektur. Llywarch der Graue ist Gründer und erstes Oberhaupt; Ithel und Ioan folgen nach genau einem seriellen Überlieferungssprung. Die Kopfschaft lautet Llywarch – Ithel – Alastair. Nudd ist ausdrücklich Alastairs Erbe; Dogeds Portrait steht im Erbfolgefeld der Hierarchietabelle. Ithel/Gwladus und Alastair/Genofeva sind mit Rhuddgar und Balchder als dieselben Weltpersonen und Partnerschaften verknüpft. Owena ist wegverheiratet und führt die Linie nicht fort. Adda und Endaf sind die Kinder Elians und seiner unbekannten Ehefrau; die abweichende Beschriftung „Awstin“ wird nicht als zusätzliche Person interpretiert. Owena und Manon besitzen jeweils eine Verknüpfung zum unbekannten Haus ihres Mannes. Gereints Ehe, seine getrennte Affäre mit Alva und der daraus geborene, nicht anerkannte Bastard Sten sind eindeutig voneinander getrennt. Generische Silhouetten gelten nicht als individuelle Portraits.',
    houseLore: {
      seat: 'Abergwint',
      liegeHouse: 'Haus Gwyvern',
      benefactor: 'Haus Gwyvern',
      knightFather: 'Haus Draig',
      ethnicity: 'Cenyri',
      wealth: 'Respektabel',
      religion: 'Die Alerische Kirche',
      patrons: ['Die Seemaid', 'Nimue – Dame der See'],
      feud: '',
      trade: ['Seefahrt', 'Hafenverwaltung', 'Schiffbau', 'Handelsrouten', 'Küstenschutz'],
      tradition: 'Jedes Mitglied dient entweder auf See oder in Hafen, Werft und Verwaltung; Autorität muss durch praktische Verantwortung erworben werden.'
    },
    blankFamily: false,
    sourceRevision: 2
  }
});
