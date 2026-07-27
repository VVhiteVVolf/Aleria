import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { GWENDOLYNS_UFER_VASSAL_PROFILES } from './celtigerns-wacht-house-profiles.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_TAWELGAR_PORTRAITS } from './house-tawelgar-portraits.js';

const TAWELGAR_EMBLEM = 'assets/images/houses/Gwendolyns Ufer/Ritterliche/Tawelgar.png';
const TAWELGAR_HOUSE_ID = 'house-tawelgar';
const HOUSE_EMBLEMS = Object.freeze({
  chwedlonol: 'assets/images/houses/Llamreis Ankunft/haus-chwedlonol.png',
  rhuddgar: 'assets/images/houses/Gwendolyns Ufer/Ritterliche/Rhuddgar.png',
  seldryn: 'assets/images/houses/Gwendolyns Ufer/Ritterliche/Seldryn.png',
  taranvyr: 'assets/images/houses/Gwendolyns Ufer/Ritterliche/Taranvyr.png'
});

const HOUSE_HEAD_IDS = new Set([
  'brinthan-tawelgar',
  'maredudd-tawelgar',
  'harri-tawelgar'
]);

const MAIN_LINE_IDS = new Set([
  'marwin-tawelgar',
  'brizio-tawelgar'
]);

function lineageRoleFor(personId) {
  if (HOUSE_HEAD_IDS.has(personId)) return 'head';
  return MAIN_LINE_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', houseId = TAWELGAR_HOUSE_ID, options = {}) {
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    houseId,
    portrait: HOUSE_TAWELGAR_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === TAWELGAR_HOUSE_ID ? 'core' : 'married'),
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

function house(id, name, emblem = '') {
  return { id, name, motto: '', emblem, status: 'active' };
}

function childrenOf(childIds, parentIds, partnershipId, options = {}) {
  return createParentages(childIds, parentIds, partnershipId, options);
}

const BRINTHAN_IDS = ['brinthan-tawelgar', 'gwenllian-tawelgar'];
// Reihenfolge und IDs entsprechen den kanonischen Taranvyr-, Rhuddgar- und Chwedonol-Gegenakten.
const MAREDUDD_IDS = ['kerrilyn-taranvyr', 'maredudd-tawelgar'];
const MERRIAM_IDS = ['wyndham-rhuddgar', 'merriam-tawelgar'];
const KARRIS_IDS = ['karris-tawelgar', 'tatumn-tawelgar'];
const HARRI_IDS = ['harri-tawelgar', 'yennefer-tawelgar'];
const ANEIRIN_IDS = ['aneirin-tawelgar', 'megan-tawelgar'];
const GWENDOLEN_IDS = ['gwendolen-tawelgar', 'gwynham-seldryn'];
const GAIS_IDS = ['gais-tawelgar', 'sian-tawelgar'];
const MARWIN_IDS = ['marwin-tawelgar', 'olive-tawelgar'];
const BHREAC_IDS = ['bhreac-tawelgar', 'rhena-tawelgar'];
const CARIAD_IDS = ['cariad-tawelgar', 'artie-tawelgar'];
const EMLYN_IDS = ['romney-1704-chwedlonol', 'emlyn-tawelgar'];
const LINCOLN_IDS = ['lincoln-tawelgar', 'siobhan-tawelgar'];

export const HOUSE_TAWELGAR_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-tawelgar',
    title: 'Haus Tawelgar',
    motto: 'Von Pflicht getragen.',
    description: 'Das bescheidene Ritterhaus Tawelgar aus Abergwint bewacht die Handelsstraße nach Llysbrynn und dient Haus Gwyvern mit stiller Verlässlichkeit.',
    emblem: TAWELGAR_EMBLEM,
    houseProfile: GWENDOLYNS_UFER_VASSAL_PROFILES.tawelgar
  },
  houses: [
    house(TAWELGAR_HOUSE_ID, 'Haus Tawelgar', TAWELGAR_EMBLEM),
    house('house-taranvyr', 'Haus Taranvyr', HOUSE_EMBLEMS.taranvyr),
    house('house-rhuddgar', 'Haus Rhuddgar', HOUSE_EMBLEMS.rhuddgar),
    house('house-seldryn', 'Haus Seldryn', HOUSE_EMBLEMS.seldryn),
    house('house-chwedlonol', 'Haus Chwedonol', HOUSE_EMBLEMS.chwedlonol)
  ],
  persons: [
    person('brinthan-tawelgar', 'Brinthan Tawelgar', 'male', '????', '????', TAWELGAR_HOUSE_ID, {
      status: 'dead',
      title: 'Gründer und erster Ritterherr des Hauses Tawelgar',
      notes: 'Einfacher Ritter und Leibwächter im Dienst Haus Draigs. Seine selbstlose Verlässlichkeit bewog den Baron, ihn im hohen Alter zum Ritterherrn zu erheben.'
    }),
    spouse('gwenllian-tawelgar', 'Gwenllian', 'female', '????', '????', '', {
      status: 'dead',
      notes: 'Brinthans Ehefrau und namenstragende Mitbegründerin der überlieferten Tawelgar-Linie.'
    }),

    person('maredudd-tawelgar', 'Maredudd Tawelgar', 'male', '1650', '1720', TAWELGAR_HOUSE_ID, {
      status: 'dead',
      title: 'Ehemaliger Ritterherr des Hauses Tawelgar'
    }),
    spouse('kerrilyn-taranvyr', 'Kerrilyn Taranvyr', 'female', '1655', '1715', 'house-taranvyr', {
      status: 'dead'
    }),
    person('merriam-tawelgar', 'Merriam Tawelgar', 'female', '1655', '1709', TAWELGAR_HOUSE_ID, {
      status: 'dead',
      notes: 'Merriam heiratete Wyndham Rhuddgar. Ihre Nachkommen werden in der Rhuddgar-Akte geführt.'
    }),
    spouse('wyndham-rhuddgar', 'Wyndham Rhuddgar', 'male', '1652', '1720', 'house-rhuddgar', {
      status: 'dead',
      title: 'Ehemaliger Ritterherr des Hauses Rhuddgar'
    }),
    person('karris-tawelgar', 'Karris Tawelgar', 'male', '1657', '', TAWELGAR_HOUSE_ID, {
      title: 'Veteran und Ausbilder der jungen Tawelgar',
      notes: 'Kämpfte noch jenseits des sechzigsten Lebensjahres im Krieg und bildet mit über achtzig Jahren die jungen Sprösslinge des Hauses aus.'
    }),
    spouse('tatumn-tawelgar', 'Tatumn', 'female', '1660', '1740', '', {
      status: 'dead'
    }),

    person('harri-tawelgar', 'Harri Tawelgar', 'male', '1674', '', TAWELGAR_HOUSE_ID, {
      title: 'Ritterherr des Hauses Tawelgar'
    }),
    spouse('yennefer-tawelgar', 'Yennefer', 'female', '1678'),
    person('aneirin-tawelgar', 'Aneirin Tawelgar', 'male', '1678'),
    spouse('megan-tawelgar', 'Megan', 'female', '1680', '1707', '', {
      status: 'dead'
    }),
    person('gwendolen-tawelgar', 'Gwendolen Tawelgar', 'female', '1679', '', TAWELGAR_HOUSE_ID, {
      notes: 'Gwendolen heiratete Gwynham Seldryn und führt die Tawelgar-Linie nicht fort.'
    }),
    spouse('gwynham-seldryn', 'Gwynham Seldryn', 'male', '1674', '', 'house-seldryn'),
    person('gais-tawelgar', 'Gais Tawelgar', 'male', '1684'),
    spouse('sian-tawelgar', 'Sian', 'female', '1685'),

    person('marwin-tawelgar', 'Marwin Tawelgar', 'male', '1697', '', TAWELGAR_HOUSE_ID, {
      title: 'Erster Erbe des Hauses Tawelgar · Leibwächter des Barons und seiner Kinder',
      notes: 'Dient bereits vor seiner künftigen Kopfschaft im engsten Vertrauen Haus Gwyverns.'
    }),
    spouse('olive-tawelgar', 'Olive', 'female', '1700'),
    person('bhreac-tawelgar', 'Bhreac Tawelgar', 'male', '1702'),
    spouse('rhena-tawelgar', 'Rhena', 'female', '1705'),
    person('cariad-tawelgar', 'Cariad Tawelgar', 'female', '1700', '', TAWELGAR_HOUSE_ID, {
      title: 'Ritterin des Hauses Tawelgar',
      notes: 'Zog jung als Knappin in den Krieg, wurde schwer verwundet und für ihren Mut sowie ihre Standhaftigkeit zur Ritterin geschlagen.'
    }),
    spouse('artie-tawelgar', 'Artie', 'male', '1700', '', '', {
      notes: 'Sohn des früheren Stallmeisters; versorgt die Pferde und anderen Tiere des Hauses und steht Cariad mit unerschütterlicher Treue zur Seite.'
    }),
    person('emlyn-tawelgar', 'Emlyn Tawelgar', 'male', '1707', '', TAWELGAR_HOUSE_ID, {
      notes: 'Emlyn heiratete Romney Chwedonol. Ihre Nachkommen werden in der Chwedonol-Akte geführt.'
    }),
    spouse('romney-1704-chwedlonol', 'Romney Chwedonol', 'female', '1704', '', 'house-chwedlonol'),
    person('lincoln-tawelgar', 'Lincoln Tawelgar', 'male', '1703'),
    spouse('siobhan-tawelgar', 'Siobhán', 'female', '1705'),

    person('brizio-tawelgar', 'Brizio Tawelgar', 'male', '1720', '', TAWELGAR_HOUSE_ID, {
      title: 'Zweiter Erbe des Hauses Tawelgar'
    }),
    person('owena-tawelgar', 'Owena Tawelgar', 'female', '1725'),
    person('rhys-tawelgar', 'Rhys Tawelgar', 'male', '1724'),
    person('slavi-tawelgar', 'Slavi Tawelgar', 'male', '1731'),
    person('jenya-tawelgar', 'Jenya Tawelgar', 'female', '1719'),
    person('wyn-tawelgar', 'Wyn Tawelgar', 'male', '1727'),
    person('bobi-tawelgar', 'Bobi Tawelgar', 'male', '1729'),
    person('zabrina-tawelgar', 'Zabrina Tawelgar', 'female', '1734')
  ],
  partnerships: [
    createMarriage('marriage-brinthan-gwenllian-tawelgar', ...BRINTHAN_IDS, { status: 'ended' }),
    createMarriage('marriage-kerrilyn-maredudd', ...MAREDUDD_IDS, { status: 'ended' }),
    createMarriage('marriage-wyndham-merriam', ...MERRIAM_IDS, { status: 'ended' }),
    createMarriage('marriage-karris-tatumn-tawelgar', ...KARRIS_IDS, { status: 'widowed' }),
    createMarriage('marriage-harri-yennefer-tawelgar', ...HARRI_IDS),
    createMarriage('marriage-aneirin-megan-tawelgar', ...ANEIRIN_IDS, { status: 'widowed' }),
    createMarriage('marriage-gwendolen-gwynham', ...GWENDOLEN_IDS),
    createMarriage('marriage-gais-sian-tawelgar', ...GAIS_IDS),
    createMarriage('marriage-marwin-olive-tawelgar', ...MARWIN_IDS),
    createMarriage('marriage-bhreac-rhena-tawelgar', ...BHREAC_IDS),
    createMarriage('marriage-cariad-artie-tawelgar', ...CARIAD_IDS),
    createMarriage('marriage-romneyjr-emlyn', ...EMLYN_IDS),
    createMarriage('marriage-lincoln-siobhan-tawelgar', ...LINCOLN_IDS)
  ],
  parentages: [
    ...childrenOf(
      ['maredudd-tawelgar', 'merriam-tawelgar', 'karris-tawelgar'],
      BRINTHAN_IDS,
      'marriage-brinthan-gwenllian-tawelgar',
      {
        type: 'claimed',
        certainty: 'probable',
        notes: 'Mehrere nicht einzeln überlieferte Generationen verbinden das Gründerpaar mit Maredudd, Merriam und Karris.',
        extensions: { timeJumpId: 'gap-brinthan-maredudd-tawelgar' }
      }
    ),
    ...childrenOf(['harri-tawelgar', 'aneirin-tawelgar'], MAREDUDD_IDS, 'marriage-kerrilyn-maredudd'),
    ...childrenOf(['gwendolen-tawelgar', 'gais-tawelgar'], KARRIS_IDS, 'marriage-karris-tatumn-tawelgar'),
    ...childrenOf(['marwin-tawelgar', 'bhreac-tawelgar'], HARRI_IDS, 'marriage-harri-yennefer-tawelgar'),
    ...childrenOf(['cariad-tawelgar', 'emlyn-tawelgar'], ANEIRIN_IDS, 'marriage-aneirin-megan-tawelgar'),
    ...childrenOf(['lincoln-tawelgar'], GAIS_IDS, 'marriage-gais-sian-tawelgar'),
    ...childrenOf(['brizio-tawelgar', 'owena-tawelgar'], MARWIN_IDS, 'marriage-marwin-olive-tawelgar'),
    ...childrenOf(['rhys-tawelgar', 'slavi-tawelgar'], BHREAC_IDS, 'marriage-bhreac-rhena-tawelgar'),
    ...childrenOf(['jenya-tawelgar', 'wyn-tawelgar'], CARIAD_IDS, 'marriage-cariad-artie-tawelgar'),
    ...childrenOf(['bobi-tawelgar', 'zabrina-tawelgar'], LINCOLN_IDS, 'marriage-lincoln-siobhan-tawelgar')
  ],
  lineage: {
    founderPartnershipId: 'marriage-brinthan-gwenllian-tawelgar',
    houseId: TAWELGAR_HOUSE_ID,
    crestSubtitle: 'Ritterhaus aus Abergwint',
    crestEmblemScale: 0.82,
    crestFrame: 'silver',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  cadetBranches: [
    createMarriedAwayBranch({
      id: 'married-away-rhuddgar-merriam',
      name: 'Haus Rhuddgar',
      parentPartnershipId: 'marriage-wyndham-merriam',
      houseId: 'house-rhuddgar',
      targetFamilyId: 'haus-rhuddgar',
      emblem: HOUSE_EMBLEMS.rhuddgar,
      crestFrame: 'silver',
      notes: 'Merriam Tawelgar wurde an Wyndham Rhuddgar verheiratet; ihre Nachkommen werden in der Rhuddgar-Akte geführt.'
    }),
    createMarriedAwayBranch({
      id: 'married-away-seldryn-gwendolen',
      name: 'Haus Seldryn',
      parentPartnershipId: 'marriage-gwendolen-gwynham',
      houseId: 'house-seldryn',
      targetFamilyId: 'haus-seldryn',
      emblem: HOUSE_EMBLEMS.seldryn,
      crestFrame: 'silver',
      notes: 'Gwendolen Tawelgar wurde an Gwynham Seldryn verheiratet und führt die Tawelgar-Linie nicht fort.'
    }),
    createMarriedAwayBranch({
      id: 'married-away-chwedlonol-emlyn',
      name: 'Haus Chwedonol',
      parentPartnershipId: 'marriage-romneyjr-emlyn',
      houseId: 'house-chwedlonol',
      targetFamilyId: 'haus-chwedlonol',
      emblem: HOUSE_EMBLEMS.chwedlonol,
      crestFrame: 'silver',
      notes: 'Emlyn Tawelgar heiratete in das matriarchale Haus Chwedonol ein; die gemeinsame Linie wird dort fortgeführt.'
    })
  ],
  timeJumps: [
    {
      id: 'gap-brinthan-maredudd-tawelgar',
      parentPartnershipId: 'marriage-brinthan-gwenllian-tawelgar',
      parentPersonId: '',
      childIds: ['maredudd-tawelgar', 'merriam-tawelgar', 'karris-tawelgar'],
      years: 0,
      fromYear: '????',
      toYear: '1650',
      label: 'Nicht einzeln überlieferte Generationen',
      notes: 'Der Zeitsprung folgt als alleiniger absoluter Generationentrenner unter dem vom Gründerpaar begründeten Hauswappen.',
      extensions: {}
    }
  ],
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'brinthan-tawelgar',
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    sourceNote: 'Genealogie, Lebensdaten, Hausdaten, Rollen und Portraitquellen nach der bereitgestellten Tawelgar-Hausseite samt Stammbaumgrafik. Brinthan und Gwenllian bilden das Gründerpaar; unter ihrem silbern gerahmten Hauswappen folgt genau ein absoluter serieller Überlieferungssprung zu Maredudd, Merriam und Karris. Die Stammbaumgrafik nennt den Gründer abweichend „Artur“, während Einführung, Gründungsgeschichte, Hierarchie und Oberhauptübersicht eindeutig Brinthan belegen. Die Oberhauptübersicht zeigt bei Harri fälschlich 1720 als Geburtsjahr; die Genealogie und seine 1697 sowie 1702 geborenen Kinder belegen 1674. Die Kopfschaft verläuft über Brinthan und Maredudd zu Harri; die ausdrückliche Erbfolge lautet Marwin – Brizio. Maredudd/Kerrilyn, Merriam/Wyndham und Emlyn/Romney verwenden dieselben Weltpersonen und Beziehungs-IDs wie ihre Taranvyr-, Rhuddgar- und Chwedonol-Gegenakten. Merriam besitzt den direkten Wegverheiratet-Knoten zu Haus Rhuddgar, Gwendolen den zu Haus Seldryn und Emlyn als eingeheirateter Mann im matriarchalen Zielhaus den direkten Knoten zu Haus Chwedonol. Die dort geführten Kinder von Merriam beziehungsweise Emlyn werden nicht als parallele Zweige in Tawelgar kopiert. Das in der Tawelgar-Tabelle abweichende Wyndham-Portrait wird zugunsten seiner bereits kanonischen Rhuddgar-Datei nicht dupliziert. „Taravyrn“ und „Chwedlonol“ wurden zu den bestehenden Registerformen Taranvyr und Chwedonol normalisiert. Generische Silhouetten und unbeschriftete Dienerschaft werden nicht als individuelle Portraits oder Personen importiert.',
    houseLore: {
      seat: 'Abergwint',
      estate: 'Bescheidene Burg aus einem ehemaligen Wachposten an der Handelsstraße zwischen Llysbrynn und Abergwint',
      liegeHouse: 'Haus Gwyvern',
      benefactor: 'Haus Gwyvern',
      knightFather: 'Haus Draig',
      ethnicity: 'Cenyri',
      wealth: 'Beschaulich',
      religion: 'Die Alerische Kirche',
      patrons: ['Der Knecht', 'Der Streiter'],
      friends: ['Haus Taranvyr', 'Haus Gwyvern', 'Haus Draig'],
      feud: 'Keine offene Fehde; das Haus bekämpft Wilderer, Banditen, Diebe und Marodeure entlang der Handelsstraße.',
      trade: ['Straßen- und Geleitschutz', 'Holzwirtschaft', 'Jagd', 'Lederhandwerk', 'Bogenbau', 'Schreinerei', 'Tavernenpacht'],
      tradition: 'Demut, Genügsamkeit und Pflichtbewusstsein bestimmen das Haus. Tawelgar dienen als ritterliche Allrounder; traditionell schützt ein Familienmitglied den Baron und dessen Kinder als Leibwächter.'
    },
    blankFamily: false,
    sourceRevision: 1
  }
});
