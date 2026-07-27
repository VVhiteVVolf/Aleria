import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { GWENDOLYNS_UFER_VASSAL_PROFILES } from './celtigerns-wacht-house-profiles.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_CENFIG_PORTRAITS } from './house-cenfig-portraits.js';

const CENFIG_EMBLEM = 'assets/images/houses/Gwendolyns Ufer/Ritterliche/Cenfig.png';
const EDMY_EMBLEM = 'assets/images/houses/Gwendolyns Ufer/Ritterliche/Edmy.png';
const CENFIG_HOUSE_ID = 'house-cenfig';

const HOUSE_HEAD_IDS = new Set([
  'steffan-cenfig',
  'rhodri-cenfig',
  'mathon-cenfig'
]);
const MAIN_LINE_IDS = new Set(['folant-cenfig']);

function lineageRoleFor(personId) {
  if (HOUSE_HEAD_IDS.has(personId)) return 'head';
  return MAIN_LINE_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', houseId = CENFIG_HOUSE_ID, options = {}) {
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    houseId,
    portrait: HOUSE_CENFIG_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === CENFIG_HOUSE_ID ? 'core' : 'married'),
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

function unknownSpouse(id, sex, notes = '') {
  return spouse(id, '???', sex, '????', '????', '', {
    status: 'dead',
    notes
  });
}

function house(id, name, emblem = '') {
  return { id, name, motto: '', emblem, status: 'active' };
}

function childrenOf(childIds, parentIds, partnershipId, options = {}) {
  return createParentages(childIds, parentIds, partnershipId, options);
}

const STEFFAN_IDS = ['steffan-cenfig', 'unknown-spouse-steffan-cenfig'];
const RHODRI_IDS = ['rhodri-cenfig', 'unknown-spouse-rhodri-cenfig'];
const SIWAN_IDS = ['siwan-cenfig', 'unknown-spouse-siwan-cenfig'];
const OSIAN_IDS = ['osian-cenfig', 'unknown-spouse-osian-cenfig'];
const MATHON_IDS = ['mathon-cenfig', 'unknown-spouse-mathon-cenfig'];
const HIRAETH_IDS = ['hiraeth-cenfig', 'unknown-spouse-hiraeth-cenfig'];
// Reihenfolge und ID entsprechen der kanonischen Edmy-Gegenakte.
const LLEWARD_IDS = ['melangell-edmy', 'lleward-cenfig'];
const LLAWEN_IDS = ['llawen-cenfig', 'unknown-spouse-llawen-cenfig'];
const FOLANT_IDS = ['folant-cenfig', 'unknown-spouse-folant-cenfig'];
const NELA_IDS = ['nela-cenfig', 'unknown-spouse-nela-cenfig'];
const LLOWARCH_IDS = ['llowarch-cenfig', 'unknown-spouse-llowarch-cenfig'];
const AWELA_IDS = ['awela-cenfig', 'unknown-spouse-awela-cenfig'];

export const HOUSE_CENFIG_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-cenfig',
    title: 'Haus Cenfig',
    motto: '',
    description: 'Das Ritterhaus Cenfig aus Abergwint dient Haus Gwyvern und verbindet ritterliche Pflicht mit Rechtspflege, Bildung und Verwaltung.',
    emblem: CENFIG_EMBLEM,
    houseProfile: GWENDOLYNS_UFER_VASSAL_PROFILES.cenfig
  },
  houses: [
    house(CENFIG_HOUSE_ID, 'Haus Cenfig', CENFIG_EMBLEM),
    house('house-edmy', 'Haus Edmy', EDMY_EMBLEM),
    house('house-unbekannt-siwan-cenfig', 'Unbekanntes Haus'),
    house('house-unbekannt-hiraeth-cenfig', 'Unbekanntes Haus'),
    house('house-unbekannt-llawen-cenfig', 'Unbekanntes Haus'),
    house('house-unbekannt-nela-cenfig', 'Unbekanntes Haus'),
    house('house-unbekannt-awela-cenfig', 'Unbekanntes Haus')
  ],
  persons: [
    person('steffan-cenfig', 'Steffan Cenfig', 'male', '????', '????', CENFIG_HOUSE_ID, {
      status: 'dead',
      title: 'Gründer und erster Ritterherr des Hauses Cenfig · Ehemaliger Justiziar und Regent',
      notes: 'Begründete Haus Cenfig aus einer nicht anerkannten Bastardlinie der alten Conbhrón; die dazwischenliegenden Vorfahren sind nicht namentlich überliefert.'
    }),
    unknownSpouse(
      'unknown-spouse-steffan-cenfig',
      'female',
      'Steffans Ehefrau ist nur als verstorbene, namenlose Gründerin überliefert.'
    ),

    person('rhodri-cenfig', 'Rhodri Cenfig', 'male', '1634', '????', CENFIG_HOUSE_ID, {
      status: 'dead',
      title: 'Ehemaliger Ritterherr des Hauses Cenfig'
    }),
    unknownSpouse('unknown-spouse-rhodri-cenfig', 'female'),
    person('siwan-cenfig', 'Siwan Cenfig', 'female', '1637', '', CENFIG_HOUSE_ID, {
      notes: 'Siwan heiratete einen namentlich nicht überlieferten Mann und führt die Cenfig-Linie nicht fort.'
    }),
    unknownSpouse(
      'unknown-spouse-siwan-cenfig',
      'male',
      'Siwans Ehemann und dessen Herkunftshaus sind nicht überliefert.'
    ),
    person('osian-cenfig', 'Osian Cenfig', 'male', '1639', '????', CENFIG_HOUSE_ID, {
      status: 'dead'
    }),
    unknownSpouse('unknown-spouse-osian-cenfig', 'female'),

    person('mathon-cenfig', 'Mathon Cenfig', 'male', '1660', '', CENFIG_HOUSE_ID, {
      title: 'Ritterherr des Hauses Cenfig'
    }),
    unknownSpouse('unknown-spouse-mathon-cenfig', 'female'),
    person('hiraeth-cenfig', 'Hiraeth Cenfig', 'female', '1667', '', CENFIG_HOUSE_ID, {
      notes: 'Hiraeth heiratete einen namentlich nicht überlieferten Mann und führt die Cenfig-Linie nicht fort.'
    }),
    unknownSpouse(
      'unknown-spouse-hiraeth-cenfig',
      'male',
      'Hiraeths Ehemann und dessen Herkunftshaus sind nicht überliefert.'
    ),
    person('lleward-cenfig', 'Lleward Cenfig', 'male', '1665'),
    spouse('melangell-edmy', 'Melangell Edmy', 'female', '1663', '', 'house-edmy', {
      notes: 'Melangell heiratete Lleward Cenfig. Ihre Nachkommen werden in der Cenfig-Akte geführt.'
    }),
    person('llawen-cenfig', 'Llawen Cenfig', 'female', '1669', '', CENFIG_HOUSE_ID, {
      notes: 'Llawen heiratete einen namentlich nicht überlieferten Mann und führt die Cenfig-Linie nicht fort.'
    }),
    unknownSpouse(
      'unknown-spouse-llawen-cenfig',
      'male',
      'Llawens Ehemann und dessen Herkunftshaus sind nicht überliefert.'
    ),

    person('folant-cenfig', 'Folant Cenfig', 'male', '1690', '', CENFIG_HOUSE_ID, {
      title: 'Erster Erbe des Hauses Cenfig',
      notes: 'Führt die kriegerische Hauptlinie des Hauses fort.'
    }),
    unknownSpouse('unknown-spouse-folant-cenfig', 'female'),
    person('nela-cenfig', 'Nela Cenfig', 'female', '1693', '', CENFIG_HOUSE_ID, {
      notes: 'Nela heiratete einen namentlich nicht überlieferten Mann und führt die Cenfig-Linie nicht fort.'
    }),
    unknownSpouse(
      'unknown-spouse-nela-cenfig',
      'male',
      'Nelas Ehemann und dessen Herkunftshaus sind nicht überliefert.'
    ),
    person('llowarch-cenfig', 'Llowarch Cenfig', 'male', '1694', '', CENFIG_HOUSE_ID, {
      title: 'Leiter der Kanzlei des Hauses Cenfig',
      notes: 'Wurde in der Blutstadt ausgebildet und führt die gelehrte Kanzleilinie des Hauses.'
    }),
    unknownSpouse('unknown-spouse-llowarch-cenfig', 'female'),
    person('awela-cenfig', 'Awela Cenfig', 'female', '1696', '', CENFIG_HOUSE_ID, {
      notes: 'Awela heiratete einen namentlich nicht überlieferten Mann und führt die Cenfig-Linie nicht fort.'
    }),
    unknownSpouse(
      'unknown-spouse-awela-cenfig',
      'male',
      'Awelas Ehemann und dessen Herkunftshaus sind nicht überliefert.'
    ),

    person('rhosyn-cenfig', 'Rhosyn Cenfig', 'female', '1718'),
    person('seren-cenfig', 'Seren Cenfig', 'female', '1720'),
    person('padrig-cenfig', 'Padrig Cenfig', 'male', '1716'),
    person('caer-cenfig', 'Caer Cenfig', 'male', '1718'),
    person('nyfrain-cenfig', 'Nyfrain Cenfig', 'female', '1720'),
    person('moronwy-cenfig', 'Moronwy Cenfig', 'female', '1722'),
    person('eynion-cenfig', 'Eynion Cenfig', 'male', '1726')
  ],
  partnerships: [
    createMarriage('marriage-steffan-unknown-cenfig', ...STEFFAN_IDS, { status: 'ended' }),
    createMarriage('marriage-rhodri-unknown-cenfig', ...RHODRI_IDS, { status: 'ended' }),
    createMarriage('marriage-siwan-unknown-cenfig', ...SIWAN_IDS, { status: 'widowed' }),
    createMarriage('marriage-osian-unknown-cenfig', ...OSIAN_IDS, { status: 'ended' }),
    createMarriage('marriage-mathon-unknown-cenfig', ...MATHON_IDS, { status: 'widowed' }),
    createMarriage('marriage-hiraeth-unknown-cenfig', ...HIRAETH_IDS, { status: 'widowed' }),
    createMarriage('marriage-melangell-lleward', ...LLEWARD_IDS),
    createMarriage('marriage-llawen-unknown-cenfig', ...LLAWEN_IDS, { status: 'widowed' }),
    createMarriage('marriage-folant-unknown-cenfig', ...FOLANT_IDS, { status: 'widowed' }),
    createMarriage('marriage-nela-unknown-cenfig', ...NELA_IDS, { status: 'widowed' }),
    createMarriage('marriage-llowarch-unknown-cenfig', ...LLOWARCH_IDS, { status: 'widowed' }),
    createMarriage('marriage-awela-unknown-cenfig', ...AWELA_IDS, { status: 'widowed' })
  ],
  parentages: [
    ...childrenOf(
      ['rhodri-cenfig', 'siwan-cenfig', 'osian-cenfig'],
      STEFFAN_IDS,
      'marriage-steffan-unknown-cenfig',
      {
        type: 'claimed',
        certainty: 'probable',
        notes: 'Mehrere nicht einzeln überlieferte Generationen verbinden das Gründerpaar mit Rhodri, Siwan und Osian.',
        extensions: { timeJumpId: 'gap-steffan-rhodri-cenfig' }
      }
    ),
    ...childrenOf(['mathon-cenfig', 'hiraeth-cenfig'], RHODRI_IDS, 'marriage-rhodri-unknown-cenfig'),
    ...childrenOf(['lleward-cenfig', 'llawen-cenfig'], OSIAN_IDS, 'marriage-osian-unknown-cenfig'),
    ...childrenOf(['folant-cenfig', 'nela-cenfig'], MATHON_IDS, 'marriage-mathon-unknown-cenfig'),
    ...childrenOf(['llowarch-cenfig', 'awela-cenfig'], LLEWARD_IDS, 'marriage-melangell-lleward'),
    ...childrenOf(['rhosyn-cenfig', 'seren-cenfig'], FOLANT_IDS, 'marriage-folant-unknown-cenfig'),
    ...childrenOf(
      ['padrig-cenfig', 'caer-cenfig', 'nyfrain-cenfig', 'moronwy-cenfig', 'eynion-cenfig'],
      LLOWARCH_IDS,
      'marriage-llowarch-unknown-cenfig'
    )
  ],
  lineage: {
    founderPartnershipId: 'marriage-steffan-unknown-cenfig',
    houseId: CENFIG_HOUSE_ID,
    crestSubtitle: 'Ritterhaus aus Abergwint',
    crestEmblemScale: 0.82,
    crestFrame: 'silver',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  cadetBranches: [
    createMarriedAwayBranch({
      id: 'married-away-unknown-siwan-cenfig',
      name: 'Unbekanntes Haus',
      parentPartnershipId: 'marriage-siwan-unknown-cenfig',
      houseId: 'house-unbekannt-siwan-cenfig',
      targetFamilyId: 'haus-unbekannt',
      crestFrame: 'gold',
      notes: 'Siwan Cenfig wurde an ein nicht näher überliefertes Haus verheiratet und führt die Cenfig-Linie nicht fort.'
    }),
    createMarriedAwayBranch({
      id: 'married-away-unknown-hiraeth-cenfig',
      name: 'Unbekanntes Haus',
      parentPartnershipId: 'marriage-hiraeth-unknown-cenfig',
      houseId: 'house-unbekannt-hiraeth-cenfig',
      targetFamilyId: 'haus-unbekannt',
      crestFrame: 'gold',
      notes: 'Hiraeth Cenfig wurde an ein nicht näher überliefertes Haus verheiratet und führt die Cenfig-Linie nicht fort.'
    }),
    createMarriedAwayBranch({
      id: 'married-away-unknown-llawen-cenfig',
      name: 'Unbekanntes Haus',
      parentPartnershipId: 'marriage-llawen-unknown-cenfig',
      houseId: 'house-unbekannt-llawen-cenfig',
      targetFamilyId: 'haus-unbekannt',
      crestFrame: 'gold',
      notes: 'Llawen Cenfig wurde an ein nicht näher überliefertes Haus verheiratet und führt die Cenfig-Linie nicht fort.'
    }),
    createMarriedAwayBranch({
      id: 'married-away-unknown-nela-cenfig',
      name: 'Unbekanntes Haus',
      parentPartnershipId: 'marriage-nela-unknown-cenfig',
      houseId: 'house-unbekannt-nela-cenfig',
      targetFamilyId: 'haus-unbekannt',
      crestFrame: 'gold',
      notes: 'Nela Cenfig wurde an ein nicht näher überliefertes Haus verheiratet und führt die Cenfig-Linie nicht fort.'
    }),
    createMarriedAwayBranch({
      id: 'married-away-unknown-awela-cenfig',
      name: 'Unbekanntes Haus',
      parentPartnershipId: 'marriage-awela-unknown-cenfig',
      houseId: 'house-unbekannt-awela-cenfig',
      targetFamilyId: 'haus-unbekannt',
      crestFrame: 'gold',
      notes: 'Awela Cenfig wurde an ein nicht näher überliefertes Haus verheiratet und führt die Cenfig-Linie nicht fort.'
    })
  ],
  timeJumps: [
    {
      id: 'gap-steffan-rhodri-cenfig',
      parentPartnershipId: 'marriage-steffan-unknown-cenfig',
      parentPersonId: '',
      childIds: ['rhodri-cenfig', 'siwan-cenfig', 'osian-cenfig'],
      years: 0,
      fromYear: '????',
      toYear: '????',
      label: 'Nicht einzeln überlieferte Generationen',
      notes: 'Der Zeitsprung folgt als alleiniger absoluter Generationentrenner unter dem vom Gründerpaar begründeten Hauswappen.',
      extensions: {}
    }
  ],
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'steffan-cenfig',
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    sourceNote: 'Genealogie, Lebensdaten, Hausdaten, Rollen und Portraitquellen nach der bereitgestellten Cenfig-Hausseite samt Stammbaumgrafik. Unter Steffans silbern gerahmtem Gründerwappen folgt genau ein absoluter serieller Überlieferungssprung zu Rhodri, Siwan und Osian; er steht niemals parallel zu einem Personen- oder Hausknoten. Die Kopfschaft verläuft über Steffan und Rhodri zu Mathon; als einzige ausdrücklich bezeichnete Erbfolge wird Folant geführt. Siwan, Hiraeth, Llawen, Nela und Awela besitzen jeweils an ihrer belegten Ehe einen direkten Wegverheiratet-Knoten zu einem unbekannten Haus. Melangell Edmy und Lleward Cenfig verwenden dieselben Weltpersonen, dieselbe Ehe und dieselben Portraitdateien wie in der Edmy-Gegenakte; ihre Kinder werden ausschließlich in der Cenfig-Akte geführt. Die erwähnte Abstammung aus einer nicht anerkannten Bastardlinie der alten Conbhrón wird mangels namentlich belegter Vorfahren nicht als isolierte Herkunftsinsel oder präzise Hausverknüpfung erfunden. Die abweichende Kurzform „Llward“ wurde anhand der Genealogie und der Edmy-Gegenakte zu Lleward normalisiert. Caer wird nach seinem individuellen Portrait männlich, Nyfrain und Moronwy weiblich geführt. Die jüngste Generation besitzt keine belegten Ehen oder Verlobungen und bleibt daher unverheiratet. Generische Silhouetten werden nicht als individuelle Portraitquellen importiert.',
    houseLore: {
      seat: 'Abergwint',
      estate: 'Ritterliches Anwesen mit Wohnsitz und Kanzlei innerhalb Abergwints; Universität für Rechtswesen und Justiz sowie eine auch einfachen Bürgern zugängliche Rechtskanzlei',
      liegeHouse: 'Haus Gwyvern',
      benefactor: 'Haus Gwyvern',
      knightFather: 'Haus Draig',
      origin: 'Nicht anerkannte Bastardlinie der alten Conbhrón',
      ethnicity: 'Cenyri',
      wealth: 'Beschaulich',
      religion: 'Die Alerische Kirche',
      patrons: [],
      feud: 'Keine offene Fehde.'
    },
    blankFamily: false,
    sourceRevision: 1
  }
});
