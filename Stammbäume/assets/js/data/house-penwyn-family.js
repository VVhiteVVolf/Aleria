import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { GWENDOLYNS_UFER_VASSAL_PROFILES } from './celtigerns-wacht-house-profiles.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_PENWYN_PORTRAITS } from './house-penwyn-portraits.js';

const PENWYN_EMBLEM = 'assets/images/houses/Gwendolyns Ufer/Ritterliche/Penwyn.png';
const PENWYN_HOUSE_ID = 'house-penwyn';
const HOUSE_EMBLEMS = Object.freeze({
  awenydd: 'assets/images/houses/Llamreis Ankunft/haus-awenydd.png',
  edmy: 'assets/images/houses/Gwendolyns Ufer/Ritterliche/Edmy.png'
});

const HOUSE_HEAD_IDS = new Set([
  'unknown-founder-penwyn',
  'rhys-penwyn'
]);

const MAIN_LINE_IDS = new Set([
  'cadfael-penwyn',
  'myriad-penwyn',
  'gruffyd-penwyn'
]);

function lineageRoleFor(personId) {
  if (HOUSE_HEAD_IDS.has(personId)) return 'head';
  return MAIN_LINE_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', houseId = PENWYN_HOUSE_ID, options = {}) {
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    houseId,
    portrait: HOUSE_PENWYN_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === PENWYN_HOUSE_ID ? 'core' : 'married'),
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

const FOUNDER_IDS = ['unknown-founder-penwyn', 'unknown-founder-spouse-penwyn'];
const MYRDDON_IDS = ['myrddon-penwyn', 'unknown-spouse-myrddon-penwyn'];
const MORFYDD_IDS = ['morfydd-penwyn', 'unknown-spouse-morfydd-penwyn'];
const MERVIN_IDS = ['mervin-penwyn', 'unknown-spouse-mervin-penwyn'];
const RHYS_IDS = ['rhys-penwyn', 'catelyn-edmy'];
const MARED_IDS = ['mared-penwyn', 'sulwen'];
const MARARED_IDS = ['marared-penwyn', 'heddwen'];
const CADFAEL_IDS = ['cadfael-penwyn', 'alawen'];
const MAELOR_IDS = ['maelor-penwyn', 'neris'];
// Reihenfolge und ID entsprechen der kanonischen Awenydd-Gegenakte.
const RHOSWYN_IDS = ['brychan-awenydd', 'rhoswyn-penwyn'];
const DAFYDD_IDS = ['dafydd-penwyn', 'lludd-penwyn'];
const BRAITH_IDS = ['braith-penwyn', 'unknown-spouse-braith-penwyn'];

export const HOUSE_PENWYN_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-penwyn',
    title: 'Haus Penwyn',
    motto: '',
    description: 'Das älteste bestehende Geschlecht Morddyns verwaltet und schützt den Küstenort als ritterliches Vasallenhaus Sir Myrddin Draigs.',
    emblem: PENWYN_EMBLEM,
    houseProfile: GWENDOLYNS_UFER_VASSAL_PROFILES.penwyn
  },
  houses: [
    house(PENWYN_HOUSE_ID, 'Haus Penwyn', PENWYN_EMBLEM),
    house('house-edmy', 'Haus Edmy', HOUSE_EMBLEMS.edmy),
    house('house-awenydd', 'Haus Awenydd', HOUSE_EMBLEMS.awenydd),
    house('house-unbekannt-morfydd-penwyn', 'Unbekanntes Haus'),
    house('house-unbekannt-braith-penwyn', 'Unbekanntes Haus')
  ],
  persons: [
    person('unknown-founder-penwyn', '???', 'male', '????', '????', PENWYN_HOUSE_ID, {
      status: 'dead',
      title: 'Gründer des Hauses Penwyn',
      notes: 'Der Name des frühen Hauptmanns, der auf Myrddins Wunsch zum Ritter geschlagen wurde, ist nicht überliefert.'
    }),
    spouse('unknown-founder-spouse-penwyn', '???', 'female', '????', '????', '', {
      status: 'dead',
      notes: 'Die Ehefrau des namenlosen Gründers ist nur als verstorbene Partnerin überliefert.'
    }),

    // Erste einzeln benannte Generation hinter der Überlieferungslücke.
    person('myrddon-penwyn', 'Myrddon Penwyn', 'male', '????', '????', PENWYN_HOUSE_ID, {
      status: 'dead'
    }),
    spouse('unknown-spouse-myrddon-penwyn', '???', 'female', '????', '????', '', {
      status: 'dead'
    }),
    person('morfydd-penwyn', 'Morfydd Penwyn', 'female', '????', '????', PENWYN_HOUSE_ID, {
      status: 'dead'
    }),
    spouse('unknown-spouse-morfydd-penwyn', '???', 'male', '????', '????', '', {
      status: 'dead',
      notes: 'Morfydds Ehemann und dessen Haus sind nicht überliefert.'
    }),
    person('mervin-penwyn', 'Mervin Penwyn', 'male', '????', '????', PENWYN_HOUSE_ID, {
      status: 'dead'
    }),
    spouse('unknown-spouse-mervin-penwyn', '???', 'female', '????', '????', '', {
      status: 'dead'
    }),

    person('rhys-penwyn', 'Rhys Penwyn', 'male', '1667', '', PENWYN_HOUSE_ID, {
      title: 'Ritterherr des Hauses Penwyn · Verwalter von Morddyn'
    }),
    spouse('catelyn-edmy', 'Catelyn Edmy', 'female', '1664', '', 'house-edmy'),
    person('dlyan-penwyn', 'Dlyan Penwyn', 'male', '1673', '1720', PENWYN_HOUSE_ID, {
      status: 'dead'
    }),
    person('mared-penwyn', 'Mared Penwyn', 'male', '1668', '1739', PENWYN_HOUSE_ID, {
      status: 'dead'
    }),
    spouse('sulwen', 'Sulwen', 'female', '1669', '1690', '', {
      status: 'dead'
    }),
    person('marared-penwyn', 'Marared Penwyn', 'male', '1669'),
    spouse('heddwen', 'Heddwen', 'female', '1670', '????', '', {
      status: 'dead'
    }),

    person('cadfael-penwyn', 'Cadfael Penwyn', 'male', '1693', '', PENWYN_HOUSE_ID, {
      title: 'Erster Erbe des Hauses Penwyn'
    }),
    spouse('alawen', 'Alawen', 'female', '1695'),
    person('maelor-penwyn', 'Maelor Penwyn', 'male', '1695'),
    spouse('neris', 'Neris', 'female', '1699'),
    person('rhoswyn-penwyn', 'Rhoswyn Penwyn', 'female', '1700'),
    spouse('brychan-awenydd', 'Brychan Awenydd', 'male', '1698', '', 'house-awenydd', {
      notes: 'Persönlicher Botengänger und Waldläufer des Ratsmagiers Myrddin; in seiner Heimatakte führt er die Awenydd-Linie mit Rhoswyn fort.'
    }),
    person('dafydd-penwyn', 'Dafydd Penwyn', 'male', '1697'),
    spouse('lludd-penwyn', 'Lludd', 'female', '1698'),
    person('braith-penwyn', 'Braith Penwyn', 'female', '1699'),
    spouse('unknown-spouse-braith-penwyn', '???', 'male', '????', '', '', {
      status: 'unknown',
      notes: 'Braiths Ehemann und dessen Haus sind nicht überliefert.'
    }),

    // Jüngste belegte Generation; die Quelle weist keine Partner aus.
    person('rhianu-penwyn', 'Rhianu Penwyn', 'female', '1716'),
    person('myriad-penwyn', 'Myriad Penwyn', 'male', '1718', '', PENWYN_HOUSE_ID, {
      title: 'Zweiter Erbe des Hauses Penwyn'
    }),
    person('gruffyd-penwyn', 'Gruffyd Penwyn', 'male', '1722', '', PENWYN_HOUSE_ID, {
      title: 'Dritter Erbe des Hauses Penwyn'
    }),
    person('cerridwyn-penwyn', 'Cerridwyn Penwyn', 'female', '1724'),
    person('merlyn-penwyn', 'Merlyn Penwyn', 'male', '1719'),
    person('merrin-penwyn', 'Merrin Penwyn', 'male', '1721', '1737', PENWYN_HOUSE_ID, {
      status: 'dead'
    }),
    person('ewenny-penwyn', 'Ewenny Penwyn', 'female', '1722'),
    person('aleth-penwyn', 'Aleth Penwyn', 'male', '1724'),
    person('tesni-penwyn', 'Tesni Penwyn', 'female', '1728')
  ],
  partnerships: [
    createMarriage('marriage-founder-unknown-penwyn', ...FOUNDER_IDS, { status: 'ended' }),
    createMarriage('marriage-myrddon-unknown-penwyn', ...MYRDDON_IDS, { status: 'ended' }),
    createMarriage('marriage-morfydd-unknown-penwyn', ...MORFYDD_IDS, { status: 'ended' }),
    createMarriage('marriage-mervin-unknown-penwyn', ...MERVIN_IDS, { status: 'ended' }),
    createMarriage('marriage-rhys-catelyn', ...RHYS_IDS),
    createMarriage('marriage-mared-sulwen', ...MARED_IDS, { status: 'ended' }),
    createMarriage('marriage-marared-heddwen', ...MARARED_IDS, { status: 'widowed' }),
    createMarriage('marriage-cadfael-alawen', ...CADFAEL_IDS),
    createMarriage('marriage-maelor-neris', ...MAELOR_IDS),
    createMarriage('marriage-brychan-rhoswyn', ...RHOSWYN_IDS),
    createMarriage('marriage-dafydd-lludd', ...DAFYDD_IDS),
    createMarriage('marriage-braith-unknown-penwyn', ...BRAITH_IDS)
  ],
  parentages: [
    ...childrenOf(
      ['myrddon-penwyn', 'morfydd-penwyn', 'mervin-penwyn'],
      FOUNDER_IDS,
      'marriage-founder-unknown-penwyn',
      {
        type: 'claimed',
        certainty: 'probable',
        notes: 'Mehrere nicht einzeln überlieferte Generationen verbinden das Gründerpaar mit Myrddon, Morfydd und Mervin.',
        extensions: { timeJumpId: 'gap-founder-myrddon-penwyn' }
      }
    ),
    ...childrenOf(['rhys-penwyn', 'dlyan-penwyn'], MYRDDON_IDS, 'marriage-myrddon-unknown-penwyn'),
    ...childrenOf(['mared-penwyn', 'marared-penwyn'], MERVIN_IDS, 'marriage-mervin-unknown-penwyn'),
    ...childrenOf(['cadfael-penwyn', 'maelor-penwyn', 'rhoswyn-penwyn'], RHYS_IDS, 'marriage-rhys-catelyn'),
    ...childrenOf(['dafydd-penwyn', 'braith-penwyn'], MARARED_IDS, 'marriage-marared-heddwen'),
    ...childrenOf(['rhianu-penwyn', 'myriad-penwyn', 'gruffyd-penwyn', 'cerridwyn-penwyn'], CADFAEL_IDS, 'marriage-cadfael-alawen'),
    ...childrenOf(['merlyn-penwyn', 'merrin-penwyn'], MAELOR_IDS, 'marriage-maelor-neris'),
    ...childrenOf(['ewenny-penwyn', 'aleth-penwyn', 'tesni-penwyn'], DAFYDD_IDS, 'marriage-dafydd-lludd')
  ],
  lineage: {
    founderPartnershipId: 'marriage-founder-unknown-penwyn',
    houseId: PENWYN_HOUSE_ID,
    crestSubtitle: 'Ritterhaus und Verwalter Morddyns',
    crestEmblemScale: 0.82,
    crestFrame: 'silver',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  cadetBranches: [
    createMarriedAwayBranch({
      id: 'married-away-unknown-morfydd-penwyn',
      name: 'Unbekanntes Haus',
      parentPartnershipId: 'marriage-morfydd-unknown-penwyn',
      houseId: 'house-unbekannt-morfydd-penwyn',
      targetFamilyId: 'haus-unbekannt',
      crestFrame: 'gold',
      notes: 'Morfydd Penwyn wurde an ein nicht näher überliefertes Haus verheiratet und führt die Penwyn-Linie nicht fort.'
    }),
    createMarriedAwayBranch({
      id: 'married-away-awenydd-rhoswyn',
      name: 'Haus Awenydd',
      parentPartnershipId: 'marriage-brychan-rhoswyn',
      houseId: 'house-awenydd',
      targetFamilyId: 'haus-awenydd',
      emblem: HOUSE_EMBLEMS.awenydd,
      crestFrame: 'silver',
      notes: 'Rhoswyn Penwyn wurde an Brychan Awenydd verheiratet; ihre Nachkommen werden in der Awenydd-Akte geführt.'
    }),
    createMarriedAwayBranch({
      id: 'married-away-unknown-braith-penwyn',
      name: 'Unbekanntes Haus',
      parentPartnershipId: 'marriage-braith-unknown-penwyn',
      houseId: 'house-unbekannt-braith-penwyn',
      targetFamilyId: 'haus-unbekannt',
      crestFrame: 'gold',
      notes: 'Braith Penwyn wurde an ein nicht näher überliefertes Haus verheiratet und führt die Penwyn-Linie nicht fort.'
    })
  ],
  timeJumps: [
    {
      id: 'gap-founder-myrddon-penwyn',
      parentPartnershipId: 'marriage-founder-unknown-penwyn',
      parentPersonId: '',
      childIds: ['myrddon-penwyn', 'morfydd-penwyn', 'mervin-penwyn'],
      years: 0,
      fromYear: '????',
      toYear: '????',
      label: 'Nicht einzeln überlieferte Generationen',
      notes: 'Der Zeitsprung folgt als absoluter Trenner unter dem vom namenlosen Gründerpaar begründeten Hauswappen.',
      extensions: {}
    }
  ],
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'unknown-founder-penwyn',
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    sourceNote: 'Genealogie, Lebensdaten, Hausdaten und Portraitquellen nach der bereitgestellten Penwyn-Hausseite samt Stammbaumgrafik. Das namenlose Gründerpaar wird von Myrddon, Morfydd und Mervin durch genau einen seriellen Überlieferungssprung getrennt; die vier namenlosen historischen Oberhäupter der Hoftabelle liegen innerhalb dieser nicht einzeln modellierbaren Lücke und werden nicht als erfundene Zusatzpersonen angelegt. Die belegte Gegenwartskopfschaft liegt bei Rhys; die ausdrückliche Erbfolge lautet Cadfael – Myriad – Gruffyd. Die Kinderüberschrift „Cadfael und Cerridwyn“ ist offenkundig widersprüchlich, weil Cerridwyn selbst darunter als Kind steht; Partnerschaftstabelle und Stammbaumgrafik belegen stattdessen Cadfael und Alawen als Eltern. Die Kurzformen „Rhy“ und „Neri“ wurden zu Rhys und Neris normalisiert. Rhoswyn und Brychan verwenden dieselben Weltpersonen, dieselbe Ehe und dieselben Portraitdateien wie in der Awenydd-Gegenakte; ihre Awenydd-Kinder werden nicht parallel in den Penwyn-Baum kopiert. Morfydd und Braith besitzen an ihren Ehen direkte Wegverheiratet-Knoten zu unbekannten Häusern, Rhoswyn den direkten Knoten zu Haus Awenydd. Marared führt die Penwyn-Linie über Dafydd und Braith fort und ist deshalb nicht wegverheiratet. Das kleine Edmy-Wappen bei Catelyn kennzeichnet nur die Herkunft einer eingeheirateten Partnerin und erzeugt keinen parallelen Herkunftshausknoten. Wilff Annwyls Vermittlung als Mündel an Haus Penwyn bleibt in seiner biologischen Heimatakte Annwyl verzeichnet; mangels eines benannten Penwyn-Vormunds wird er nicht als isolierte Person in diesen genealogischen Baum dupliziert. Die jüngste Generation besitzt keine belegten Ehe- oder Verlobungspartner. Generische Silhouetten und unbeschriftete Dienerschaft wurden nicht als Portraits oder Personen importiert.',
    houseLore: {
      seat: 'Morddyn',
      estate: 'Burg Penwyn',
      liegeHouse: 'Sir Myrddin Draig; indirekt Haus Draig',
      benefactor: 'Haus Draig',
      knightFather: 'Sir Myrddin Draig',
      ethnicity: 'Cenyri',
      wealth: 'Beschaulich',
      religion: 'Die Alerische Kirche',
      patrons: ['Der Knecht'],
      friends: ['Myrddin', 'lokale Familien Morddyns'],
      feud: 'Keine offene Fehde; das Verhältnis zu Myrddin ist gelegentlich angespannt.',
      trade: ['Verwaltung Morddyns', 'Schmiedekunst', 'Ritter- und Wachdienst', 'Handelszölle'],
      tradition: 'Pflicht, Beständigkeit und Maß bestimmen das Haus. Die meisten Penwyns dienen als Ritter, Knappen, Hauptleute oder Burgwachen; weitere Familienmitglieder arbeiten als Schmiede, Verwalter, Schreiber und Kuriere.'
    },
    blankFamily: false,
    sourceRevision: 1
  }
});
