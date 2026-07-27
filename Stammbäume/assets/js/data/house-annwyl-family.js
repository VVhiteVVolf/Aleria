import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { GWENDOLYNS_UFER_VASSAL_PROFILES } from './celtigerns-wacht-house-profiles.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createWardAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_ANNWYL_PORTRAITS } from './house-annwyl-portraits.js';

const ANNWYL_EMBLEM = 'assets/images/houses/Gwendolyns Ufer/Ritterliche/Annwyl.png';
const ANNWYL_HOUSE_ID = 'house-annwyl';
const PENWYN_EMBLEM = 'assets/images/houses/Gwendolyns Ufer/Ritterliche/Penwyn.png';

const HOUSE_HEAD_IDS = new Set([
  'willard-annwyl',
  'cennyn-annwyl'
]);
const MAIN_LINE_IDS = new Set([
  'elgan-annwyl',
  'emyr-annwyl',
  'wilff-annwyl'
]);

function lineageRoleFor(personId) {
  if (HOUSE_HEAD_IDS.has(personId)) return 'head';
  return MAIN_LINE_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', houseId = ANNWYL_HOUSE_ID, options = {}) {
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    houseId,
    portrait: HOUSE_ANNWYL_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === ANNWYL_HOUSE_ID ? 'core' : 'married'),
    lineageRole: options.lineageRole || lineageRoleFor(id),
    ...options
  });
}

function unknownSpouse(id, sex) {
  return person(id, '???', sex, '????', '????', '', {
    familyRole: 'married',
    notes: 'Name, Herkunftshaus und Lebensdaten sind nicht überliefert.'
  });
}

function childrenOf(childIds, parentIds, partnershipId, options = {}) {
  return createParentages(childIds, parentIds, partnershipId, options);
}

const FOUNDER_IDS = ['willard-annwyl', 'unknown-spouse-willard-annwyl'];
const CENNYN_IDS = ['cennyn-annwyl', 'unknown-spouse-cennyn-annwyl'];
// Die stabile Legacy-ID bleibt für lokale Altstände erhalten; die Quelle
// benennt Cennyns und Glyndwrs Schwester eindeutig als Eithne.
const EITHNE_IDS = [
  'unknown-sibling-cennyn-annwyl',
  'unknown-spouse-unknown-sibling-annwyl'
];
const GLYNDWR_IDS = ['glyndwr-annwyl', 'unknown-spouse-glyndwr-annwyl'];
const ELGAN_IDS = ['elgan-annwyl', 'unknown-spouse-elgan-annwyl'];
const ELOWEN_IDS = ['elowen-annwyl', 'unknown-spouse-elowen-annwyl'];
const EURIG_IDS = ['eurig-annwyl', 'unknown-spouse-eurig-annwyl'];
const ESYLLT_IDS = ['esyllt-annwyl', 'unknown-spouse-esyllt-annwyl'];

export const HOUSE_ANNWYL_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-annwyl',
    title: 'Haus Annwyl',
    motto: '',
    description: 'Die überlieferte Linie des kirchlich begründeten Ritterhauses Annwyl aus Côr Mynyddfaen: von Sir Willard Annwyl bis zur Erbengeneration des Jahres 1740.',
    emblem: ANNWYL_EMBLEM,
    houseProfile: GWENDOLYNS_UFER_VASSAL_PROFILES.annwyl
  },
  houses: [
    {
      id: ANNWYL_HOUSE_ID,
      name: 'Haus Annwyl',
      motto: '',
      emblem: ANNWYL_EMBLEM,
      status: 'active'
    },
    { id: 'house-unbekannt-annwyl-sister', name: 'Unbekanntes Haus', motto: '', emblem: '', status: 'active' },
    { id: 'house-unbekannt-elowen-annwyl', name: 'Unbekanntes Haus', motto: '', emblem: '', status: 'active' },
    { id: 'house-unbekannt-esyllt-annwyl', name: 'Unbekanntes Haus', motto: '', emblem: '', status: 'active' },
    { id: 'house-penwyn', name: 'Haus Penwyn', motto: '', emblem: PENWYN_EMBLEM, status: 'active' }
  ],
  persons: [
    // Gründerpaar; die folgenden Generationen sind in der Quelle nicht einzeln überliefert.
    person('willard-annwyl', 'Willard Annwyl', 'male', '????', '????', ANNWYL_HOUSE_ID, {
      title: 'Sir Willard Annwyl · Begründer des Ritterhauses Annwyl',
      notes: 'Frommer Ritter und Ursprung des Hauses. Die Cenyrische Kirche erhob seine Linie auf Betreiben des Klerikers und Paladins Petyr Anghof in den Ritteradel.'
    }),
    unknownSpouse('unknown-spouse-willard-annwyl', 'female'),

    // Erste einzeln überlieferte Generation nach dem Zeitsprung.
    person('cennyn-annwyl', 'Cennyn Annwyl', 'male', '????', '', ANNWYL_HOUSE_ID, {
      title: 'Ritterherr des Hauses Annwyl · Hauptmann von Côr Mynyddfaen'
    }),
    unknownSpouse('unknown-spouse-cennyn-annwyl', 'female'),
    person('unknown-sibling-cennyn-annwyl', 'Eithne Annwyl', 'female', '????', '????', ANNWYL_HOUSE_ID, {
      status: 'dead',
      notes: 'Eithne ist die in der Hierarchietabelle ausdrücklich benannte Schwester Cennyns und Glyndwrs.',
      extensions: {
        registryManagedFields: ['name', 'status', 'death', 'notes']
      }
    }),
    unknownSpouse('unknown-spouse-unknown-sibling-annwyl', 'male'),
    person('glyndwr-annwyl', 'Glyndwr Annwyl', 'male', '????', ''),
    unknownSpouse('unknown-spouse-glyndwr-annwyl', 'female'),

    // Kinder Cennyns beziehungsweise Glyndwrs.
    person('elgan-annwyl', 'Elgan Annwyl', 'male', '1693', '', ANNWYL_HOUSE_ID, {
      title: 'Sir Elgan Annwyl · Waffenmeister von Côr Mynyddfaen · Erster Erbe',
      notes: 'Im Fließtext der Quelle einmal abweichend als „Eglan“ geschrieben; die Hierarchie und Erbfolge nennen ihn Elgan.'
    }),
    unknownSpouse('unknown-spouse-elgan-annwyl', 'female'),
    person('elowen-annwyl', 'Elowen Annwyl', 'female', '1695', ''),
    unknownSpouse('unknown-spouse-elowen-annwyl', 'male'),
    person('eurig-annwyl', 'Eurig Annwyl', 'male', '1699', ''),
    unknownSpouse('unknown-spouse-eurig-annwyl', 'female'),
    person('esyllt-annwyl', 'Esyllt Annwyl', 'female', '1705', ''),
    unknownSpouse('unknown-spouse-esyllt-annwyl', 'male'),

    // Jüngste überlieferte Generation im Jahr 1740.
    person('emyr-annwyl', 'Emyr Annwyl', 'male', '1719', '', ANNWYL_HOUSE_ID, {
      title: 'Sir Emyr Annwyl · Zweiter Erbe',
      notes: 'Frisch zum Ritter geschlagen und auf der traditionellen Pilgerfahrt des Hauses.'
    }),
    person('wilff-annwyl', 'Wilff Annwyl', 'male', '1727', '', ANNWYL_HOUSE_ID, {
      title: 'Knappe Wilff Annwyl · Mündel bei Haus Penwyn · Dritter Erbe',
      familyRole: 'ward-away',
      tags: ['Fortgegebenes Mündel'],
      notes: 'Die Stammbaumtabelle schreibt den Namen einmal „Wiff“; Hierarchie und Fließtext nennen ihn Wilff. Der konkrete Vormund im Haus Penwyn ist nicht überliefert und wird daher nicht erfunden.'
    }),
    person('harri-annwyl', 'Harri Annwyl', 'male', '1722', '', ANNWYL_HOUSE_ID, {
      title: 'Sir Harri Annwyl',
      notes: 'Emyrs Vetter; ebenfalls für die traditionelle Pilgerfahrt des Hauses bestimmt.'
    }),
    person('luned-annwyl', 'Luned Annwyl', 'female', '1724', '')
  ],
  partnerships: [
    createMarriage('marriage-willard-unknown-annwyl', ...FOUNDER_IDS, { status: 'ended' }),
    createMarriage('marriage-cennyn-unknown-annwyl', ...CENNYN_IDS, { status: 'ended' }),
    createMarriage('marriage-unknown-sibling-annwyl', ...EITHNE_IDS, { status: 'ended' }),
    createMarriage('marriage-glyndwr-unknown-annwyl', ...GLYNDWR_IDS, { status: 'ended' }),
    createMarriage('marriage-elgan-unknown-annwyl', ...ELGAN_IDS, { status: 'ended' }),
    createMarriage('marriage-elowen-unknown-annwyl', ...ELOWEN_IDS, { status: 'ended' }),
    createMarriage('marriage-eurig-unknown-annwyl', ...EURIG_IDS, { status: 'ended' }),
    createMarriage('marriage-esyllt-unknown-annwyl', ...ESYLLT_IDS, { status: 'ended' })
  ],
  parentages: [
    ...childrenOf(
      ['cennyn-annwyl', 'unknown-sibling-cennyn-annwyl', 'glyndwr-annwyl'],
      FOUNDER_IDS,
      'marriage-willard-unknown-annwyl',
      {
        type: 'claimed',
        certainty: 'probable',
        notes: 'Die Personen gehören zur ersten einzeln überlieferten Generation nach der Lücke; die genaue Zahl der Zwischengenerationen ist unbekannt.',
        extensions: { timeJumpId: 'gap-willard-cennyn-annwyl' }
      }
    ),
    ...childrenOf(['elgan-annwyl', 'elowen-annwyl'], CENNYN_IDS, 'marriage-cennyn-unknown-annwyl'),
    ...childrenOf(['eurig-annwyl', 'esyllt-annwyl'], GLYNDWR_IDS, 'marriage-glyndwr-unknown-annwyl'),
    ...childrenOf(['emyr-annwyl', 'wilff-annwyl'], ELGAN_IDS, 'marriage-elgan-unknown-annwyl'),
    ...childrenOf(['harri-annwyl', 'luned-annwyl'], EURIG_IDS, 'marriage-eurig-unknown-annwyl')
  ],
  lineage: {
    founderPartnershipId: 'marriage-willard-unknown-annwyl',
    houseId: ANNWYL_HOUSE_ID,
    crestSubtitle: 'Ritterhaus',
    crestEmblemScale: 0.8,
    crestFrame: 'silver',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  cadetBranches: [
    createMarriedAwayBranch({
      id: 'married-away-unknown-sister-annwyl',
      name: 'Unbekanntes Haus',
      parentPartnershipId: 'marriage-unknown-sibling-annwyl',
      houseId: 'house-unbekannt-annwyl-sister',
      targetFamilyId: 'haus-unbekannt',
      crestFrame: 'gold',
      notes: 'Eithne Annwyl wurde an einen unbekannten Mann aus einem nicht überlieferten Haus verheiratet.'
    }),
    createMarriedAwayBranch({
      id: 'married-away-elowen-annwyl',
      name: 'Unbekanntes Haus',
      parentPartnershipId: 'marriage-elowen-unknown-annwyl',
      houseId: 'house-unbekannt-elowen-annwyl',
      targetFamilyId: 'haus-unbekannt',
      crestFrame: 'gold',
      notes: 'Elowen Annwyl wurde an einen in der Quelle nur als „???“ überlieferten Ehemann verheiratet; sein Haus ist unbekannt.'
    }),
    createMarriedAwayBranch({
      id: 'married-away-esyllt-annwyl',
      name: 'Unbekanntes Haus',
      parentPartnershipId: 'marriage-esyllt-unknown-annwyl',
      houseId: 'house-unbekannt-esyllt-annwyl',
      targetFamilyId: 'haus-unbekannt',
      crestFrame: 'gold',
      notes: 'Esyllt Annwyl wurde an einen in der Quelle nur als „???“ überlieferten Ehemann verheiratet; sein Haus ist unbekannt.'
    }),
    createWardAwayBranch({
      id: 'ward-away-wilff-penwyn',
      name: 'Haus Penwyn',
      parentPersonId: 'wilff-annwyl',
      houseId: 'house-penwyn',
      targetFamilyId: 'haus-penwyn',
      emblem: PENWYN_EMBLEM,
      crestFrame: 'silver',
      notes: 'Wilff Annwyl wurde als Mündel und Knappe an Haus Penwyn vermittelt; ein namentlicher Vormund ist nicht überliefert.'
    })
  ],
  timeJumps: [
    {
      id: 'gap-willard-cennyn-annwyl',
      parentPartnershipId: 'marriage-willard-unknown-annwyl',
      parentPersonId: '',
      childIds: ['cennyn-annwyl', 'unknown-sibling-cennyn-annwyl', 'glyndwr-annwyl'],
      years: 0,
      fromYear: '????',
      toYear: '????',
      label: 'Nicht einzeln überlieferte Generationen',
      notes: 'Der Zeitsprung ist der alleinige Generationentrenner zwischen dem Gründerwappen und der nächsten belegten Generation.',
      extensions: {}
    }
  ],
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'willard-annwyl',
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    sourceNote: 'Genealogie, Hausdaten und Portraitquellen nach der bereitgestellten Annwyl-Hierarchietabelle und Stammbaumgrafik. „Anwyll“ ist keine zweite Familie, sondern eine Schreibvariante des auf der Hausseite durchgehend als Annwyl bezeichneten Geschlechts. Die ausdrücklich eingetragenen namenlosen Ehepartner sind als reale, verstorbene Personenknoten erfasst; die generischen Silhouetten der Vorlage werden nicht als individuelle Portraits übernommen. Der einzelne Zeitsprung nach Sir Willards Ehepaar wird als absoluter serieller Trenner unter dem Hauswappen ausgegeben. Die Quelle nennt den Sitz Côr Mynyddfaen, in der Übersicht abweichend „Cor Myndfaen“; die eigene vorhandene Ortsakte Côr Mynyddfaen ist deshalb der tatsächliche Registersitz. Eithne ist in der Hierarchietabelle ausdrücklich als Schwester Cennyns und Glyndwrs benannt und ersetzt die frühere namenlose Darstellung unter Beibehaltung ihrer stabilen technischen ID. Die Namensvarianten Eglan/Elgan und Wiff/Wilff wurden zugunsten der mehrfach belegten Formen Elgan und Wilff aufgelöst. Die Übersicht schreibt den Rittervater einmal „Petyr Anhof“, während die ausführliche Gründungsgeschichte „Petyr Anghof“ nennt; die ausführliche Form Anghof wird verwendet. Eithne, Elowen sowie Esyllt erhalten an ihren Ehen jeweils einen Wegverheiratet-Knoten zu einem unbekannten Haus. Wilff bleibt biologischer Sohn Elgans, wird in seiner Heimatakte als fortgegebenes Mündel gerahmt und besitzt unmittelbar unter seiner Person die Vermittlungsverknüpfung zu Haus Penwyn; mangels namentlich belegten Vormunds wird keine Pflege-Elternschaft erfunden.',
    houseLore: {
      seat: 'Côr Mynyddfaen',
      liegeHouse: 'Haus Gwyvern',
      benefactor: 'Alerische Kirche – Cenyr',
      knightFather: 'Petyr Anghof',
      ethnicity: 'Cenyri',
      wealth: 'Beschaulich',
      religion: 'Alerische Kirche',
      patrons: ['Der Streiter', 'Der Knecht', 'Der Templer'],
      feud: '',
      tradition: 'Jeder Erbe und jedes bedeutende Kind soll auf einer Pilgerfahrt durch Cenyr Demut, Disziplin und Dienst am einfachen Volk beweisen.'
    },
    blankFamily: false,
    registryManagedHouseProfileFields: ['seat', 'secondarySeats', 'regionEmblems'],
    registryManagedRecordFields: ['folderPath'],
    sourceRevision: 3
  }
});
