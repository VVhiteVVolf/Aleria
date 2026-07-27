import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { GWENDOLYNS_UFER_VASSAL_PROFILES } from './celtigerns-wacht-house-profiles.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages,
  createWardAwayBranch
} from './family-record-builders.js';
import { HOUSE_DARAN_PORTRAITS } from './house-daran-portraits.js';

const DARAN_EMBLEM = 'assets/images/houses/Gwendolyns Ufer/Ritterliche/Daran.png';
const GWYVERN_EMBLEM = 'assets/images/houses/Gwendolyns Ufer/haus-gwyvern.png';
const TRYDAR_EMBLEM = 'assets/images/houses/Gwendolyns Ufer/Ritterliche/Trydar.png';
const DARAN_HOUSE_ID = 'house-daran';

const HOUSE_HEAD_IDS = new Set(['maelgwyn-daran']);
const MAIN_LINE_IDS = new Set(['seithved-daran', 'lleu-daran']);

function lineageRoleFor(personId) {
  if (HOUSE_HEAD_IDS.has(personId)) return 'head';
  return MAIN_LINE_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', houseId = DARAN_HOUSE_ID, options = {}) {
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    houseId,
    portrait: HOUSE_DARAN_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === DARAN_HOUSE_ID ? 'core' : 'married'),
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

function unknownSpouse(id, sex, birth, notes) {
  return spouse(id, '???', sex, birth, '', '', {
    status: 'alive',
    notes
  });
}

function house(id, name, emblem = '') {
  return { id, name, motto: '', emblem, status: 'active' };
}

function childrenOf(childIds, parentIds, partnershipId, options = {}) {
  return createParentages(childIds, parentIds, partnershipId, options);
}

const MAELGWYN_IDS = ['maelgwyn-daran', 'nest-daran'];
const SEITHVED_IDS = ['seithved-daran', 'ysanna-daran'];
const RHODRI_IDS = ['rhodri-daran', 'unknown-spouse-rhodri-daran'];
const ANGHARAD_IDS = ['angharad-daran', 'unknown-spouse-angharad-daran'];
const EINION_IDS = ['einion-daran', 'unknown-spouse-einion-daran'];

export const HOUSE_DARAN_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-daran',
    title: 'Haus Daran',
    motto: '',
    description: 'Das junge Ritterhaus Daran aus Garwfaen entstand aus Sir Maelgwyns jahrzehntelangem Wach- und Kriegsdienst und stellt Pflicht, Schutz und Verlässlichkeit über Rang und Prunk.',
    emblem: DARAN_EMBLEM,
    houseProfile: GWENDOLYNS_UFER_VASSAL_PROFILES.daran
  },
  houses: [
    house(DARAN_HOUSE_ID, 'Haus Daran', DARAN_EMBLEM),
    house('house-gwyvern', 'Haus Gwyvern', GWYVERN_EMBLEM),
    house('house-trydar', 'Haus Trydar', TRYDAR_EMBLEM),
    house('house-unbekannt-angharad-daran', 'Unbekanntes Haus')
  ],
  persons: [
    person('maelgwyn-daran', 'Maelgwyn Daran', 'male', '1669', '', DARAN_HOUSE_ID, {
      familyRole: 'ward-away',
      title: 'Gründer und Ritterherr des Hauses Daran · Hauptmann der Stadtwache von Garwfaen',
      tags: ['Ehemaliges fortgegebenes Mündel'],
      notes: 'Diente früh als Page und ab 1683 als Knappe bei Baron Seithved Gwyvern, wurde 1686 zum Ritter geschlagen und begründete 1720 Haus Daran. Im Jahr 1740 versieht er mit 71 Jahren weiterhin den Dienst als Hauptmann der Stadtwache.',
      extensions: {
        registryManagedFields: ['familyRole', 'title', 'tags', 'notes']
      }
    }),
    spouse('nest-daran', 'Nest', 'female', '1673', '', '', {
      title: 'Herrin des Hauses Daran',
      notes: 'Gebürtige Garwfaenerin. Nach achtjähriger Verlobung heiratete sie Maelgwyn 1694 und führt in der Gegenwart den Haushalt sowie den Kontakt zur Bürgerschaft.'
    }),

    person('seithved-daran', 'Seithved Daran', 'male', '1696', '', DARAN_HOUSE_ID, {
      title: 'Erster Erbe des Hauses Daran · Ritter im Wachdienst Garwfaens',
      notes: 'Maelgwyns Erstgeborener, nach dessen Mentor Baron Seithved Gwyvern benannt. Gilt als fähigster Ritter Garwfaens und versieht regelmäßig selbst den Tor- und Nachtwachdienst.'
    }),
    spouse('ysanna-daran', 'Ysanna', 'female', '1700'),
    person('rhodri-daran', 'Rhodri Daran', 'male', '1699', '', DARAN_HOUSE_ID, {
      title: 'Ritter und Verwalter des Daran-Anwesens',
      notes: 'Verwaltet das Anwesen in den nördlichen Hügeln, die unterstellten Bauernhöfe und ihre Abgaben.'
    }),
    unknownSpouse(
      'unknown-spouse-rhodri-daran',
      'female',
      '1703',
      'Rhodris Ehefrau ist nur mit Geburtsjahr, ohne Namen oder Herkunftshaus überliefert.'
    ),
    person('angharad-daran', 'Angharad Daran', 'female', '1705', '', DARAN_HOUSE_ID, {
      notes: 'Angharad heiratete einen namentlich nicht überlieferten Mann und führt die Daran-Linie nicht fort.'
    }),
    unknownSpouse(
      'unknown-spouse-angharad-daran',
      'male',
      '1707',
      'Angharads Ehemann und dessen Herkunftshaus sind nicht überliefert.'
    ),
    person('einion-daran', 'Einion Daran', 'male', '1710', '', DARAN_HOUSE_ID, {
      title: 'Ritter Garwfaens',
      notes: 'Ehemaliger fahrender Ritter. Einion lebt mit Frau und Kind in Garwfaen und stellt seine Pflicht gegenüber Haus und Stadt über seine Sehnsucht nach dem Wanderleben.'
    }),
    unknownSpouse(
      'unknown-spouse-einion-daran',
      'female',
      '1712',
      'Einions Ehefrau ist nur mit Geburtsjahr, ohne Namen oder Herkunftshaus überliefert.'
    ),

    person('lleu-daran', 'Lleu Daran', 'male', '1724', '', DARAN_HOUSE_ID, {
      title: 'Zweiter Erbe des Hauses Daran'
    }),
    person('ida-daran', 'Ida Daran', 'female', '1726'),
    person('llywelyn-daran', 'Llywelyn Daran', 'male', '1727'),
    person('gwerfyl-daran', 'Gwerfyl Daran', 'female', '1731'),
    person('dyddy-daran', 'Dyddy Daran', 'male', '1732'),

    person('morcant-trydar', 'Morcant Trydar', 'male', '1730', '', 'house-trydar', {
      title: 'Knappe von Sir Seithved Daran · Mündel bei Haus Daran',
      familyRole: 'ward',
      tags: ['Aufgenommenes Mündel'],
      notes: 'Wurde zur ritterlichen Ausbildung bewusst an Haus Daran gegeben und dient Sir Seithved Daran als Knappe.',
      extensions: {
        registryManagedFields: ['title', 'familyRole', 'tags', 'notes']
      }
    })
  ],
  partnerships: [
    createMarriage('marriage-maelgwyn-nest-daran', ...MAELGWYN_IDS, { start: '1694' }),
    createMarriage('marriage-seithved-ysanna-daran', ...SEITHVED_IDS),
    createMarriage('marriage-rhodri-unknown-daran', ...RHODRI_IDS),
    createMarriage('marriage-angharad-unknown-daran', ...ANGHARAD_IDS),
    createMarriage('marriage-einion-unknown-daran', ...EINION_IDS)
  ],
  parentages: [
    ...childrenOf(
      ['seithved-daran', 'rhodri-daran', 'angharad-daran', 'einion-daran'],
      MAELGWYN_IDS,
      'marriage-maelgwyn-nest-daran'
    ),
    ...childrenOf(['lleu-daran', 'ida-daran'], SEITHVED_IDS, 'marriage-seithved-ysanna-daran'),
    ...childrenOf(['llywelyn-daran', 'gwerfyl-daran'], RHODRI_IDS, 'marriage-rhodri-unknown-daran'),
    ...childrenOf(['dyddy-daran'], EINION_IDS, 'marriage-einion-unknown-daran'),
    ...childrenOf(['morcant-trydar'], ['seithved-daran'], '', {
      type: 'foster',
      legitimacy: 'unknown',
      notes: 'Morcant Trydar ist Seithveds aufgenommener Mündel und Knappe, nicht sein leiblicher Sohn.',
      extensions: {
        registryManagedFields: ['parentIds', 'partnershipId', 'type', 'legitimacy', 'notes']
      }
    })
  ],
  lineage: {
    founderPartnershipId: 'marriage-maelgwyn-nest-daran',
    houseId: DARAN_HOUSE_ID,
    crestSubtitle: 'Ritterhaus aus Garwfaen · gegründet 1720',
    crestEmblemScale: 0.82,
    crestFrame: 'silver',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  cadetBranches: [
    createWardAwayBranch({
      id: 'ward-away-maelgwyn-gwyvern',
      name: 'Haus Gwyvern',
      parentPersonId: 'maelgwyn-daran',
      houseId: 'house-gwyvern',
      targetFamilyId: 'haus-gwyvern',
      emblem: GWYVERN_EMBLEM,
      crestFrame: 'gold',
      notes: 'Maelgwyn diente als Page und Knappe bei Baron Seithved Gwyvern, bevor er selbst zum Ritter geschlagen wurde und Haus Daran begründete.'
    }),
    createMarriedAwayBranch({
      id: 'married-away-unknown-angharad-daran',
      name: 'Unbekanntes Haus',
      parentPartnershipId: 'marriage-angharad-unknown-daran',
      houseId: 'house-unbekannt-angharad-daran',
      targetFamilyId: 'haus-unbekannt',
      crestFrame: 'gold',
      notes: 'Angharad Daran wurde an ein nicht näher überliefertes Haus verheiratet und führt die Daran-Linie nicht fort.'
    })
  ],
  timeJumps: [],
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'maelgwyn-daran',
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    sourceNote: 'Genealogie, Lebensdaten, Rollen, Hausdaten und Portraitquellen nach der bereitgestellten Daran-Hausseite samt Stammbaumgrafik. Maelgwyn und Nest bilden das Gründerpaar des 1720 erhobenen Ritterhauses; ihre Kinder folgen lückenlos unter dem silbern gerahmten Hauswappen, weshalb kein Zeitsprung angelegt wird. Maelgwyns Geburtsjahr lautet nach Geschichte, Hierarchie und Figurenbeschreibung 1669; die Angabe 1720 in der Gründerübersicht bezeichnet die Hausgründung. Die ausdrückliche Erbfolge lautet Seithved – Lleu. Angharad besitzt an ihrer belegten Ehe einen direkten Wegverheiratet-Knoten zu einem unbekannten Haus. Maelgwyns Dienst als Page und Knappe Baron Seithved Gwyverns wird entsprechend der Mündelregel durch seinen Mündelrahmen und einen direkten Gwyvern-Zielhausknoten abgebildet; dieselbe historische Vermittlung ist als Pflegebeziehung in der Gwyvern-Gegenakte registriert. Morcant Trydar wird nach der ergänzenden Vorgabe als aufgenommener Mündel und Knappe Sir Seithved Darans geführt und verwendet dieselbe Weltperson und dasselbe Portrait wie in seiner biologischen Trydar-Akte. Die fünf namenlosen Verlobtenfelder der jüngsten Generation sind generische Tabellenplatzhalter, fehlen in der gezeichneten Stammbaumgrafik und werden nicht als reale Beziehungen erfunden. Der nur in der Grafik außerhalb der Daran-Linie auftauchende Rodan wird mangels Eltern-, Haus- und Lebensdaten nicht als isolierte Herkunftsfamilie Ysannas dupliziert. Generische Silhouetten und unbeschriftete Dienerschaft werden nicht als individuelle Portraits importiert.',
    houseLore: {
      founded: '1720',
      seat: 'Garwfaen',
      estate: 'Altes Castell nördlich von Garwfaen sowie einige verpachtete Bauernhöfe und Landstücke im Umland',
      liegeHouse: 'Haus Gwyvern',
      benefactor: 'Haus Gwyvern',
      knightFather: 'Haus Gwyvern',
      ethnicity: 'Cenyri',
      wealth: 'Beschaulich',
      religion: 'Die Alerische Kirche',
      patrons: ['Der Knecht', 'Der Streiter'],
      friends: ['Haus Rhuddgar'],
      feud: 'Keine offene Hausfehde; Gegner sind lokale Banditen, Wegelagerer und Raubritter.',
      tradition: 'Frisch geschlagene Ritter ziehen ein bis zwei Jahre als fahrende Ritter durch Cenyr und kehren danach bewusst in den Dienst Garwfaens zurück.'
    },
    blankFamily: false,
    sourceRevision: 2
  }
});
