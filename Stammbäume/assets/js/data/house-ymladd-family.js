import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { GWENDOLYNS_UFER_VASSAL_PROFILES } from './celtigerns-wacht-house-profiles.js';
import {
  createFamilyPerson,
  createMarriage,
  createParentages
} from './family-record-builders.js';
import { HOUSE_YMLADD_PORTRAITS } from './house-ymladd-portraits.js';

const YMLADD_EMBLEM = 'assets/images/houses/Gwendolyns Ufer/Ritterliche/Ymladd.png';
const YMLADD_HOUSE_ID = 'house-ymladd';

const HOUSE_HEAD_IDS = new Set([
  'dafydd-ymladd',
  'hedd-ymladd'
]);

const MAIN_LINE_IDS = new Set([
  'idris-ymladd',
  'emeric-ymladd'
]);

function lineageRoleFor(personId) {
  if (HOUSE_HEAD_IDS.has(personId)) return 'head';
  return MAIN_LINE_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', houseId = YMLADD_HOUSE_ID, options = {}) {
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    houseId,
    portrait: HOUSE_YMLADD_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === YMLADD_HOUSE_ID ? 'core' : 'married'),
    lineageRole: options.lineageRole || lineageRoleFor(id),
    ...options
  });
}

function spouse(id, sex, options = {}) {
  return person(id, '???', sex, '????', '????', '', {
    familyRole: 'married',
    status: 'dead',
    notes: 'Name, Herkunft und Lebensdaten sind nicht überliefert.',
    ...options
  });
}

function childrenOf(childIds, parentIds, partnershipId, options = {}) {
  return createParentages(childIds, parentIds, partnershipId, options);
}

const DAFYDD_IDS = ['dafydd-ymladd', 'unknown-spouse-dafydd-ymladd'];
const HEDD_IDS = ['hedd-ymladd', 'unknown-spouse-hedd-ymladd'];
const GARAN_IDS = ['garan-ymladd', 'unknown-spouse-garan-ymladd'];
const IDRIS_IDS = ['idris-ymladd', 'unknown-spouse-idris-ymladd'];
const IDWAL_IDS = ['idwal-ymladd', 'unknown-spouse-idwal-ymladd'];
const ALISTAIR_IDS = ['alistair-ymladd', 'unknown-spouse-alistair-ymladd'];
const KENETH_IDS = ['keneth-ymladd', 'unknown-spouse-keneth-ymladd'];

export const HOUSE_YMLADD_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-ymladd',
    title: 'Haus Ymladd',
    motto: '',
    description: 'Das alte Ritterhaus Ymladd bewacht die östlichen Gebirgsränder Gwendolyns Ufers und schützt Land, Vieh und Reisende vor den Gefahren der Wildnis.',
    emblem: YMLADD_EMBLEM,
    houseProfile: GWENDOLYNS_UFER_VASSAL_PROFILES.ymladd
  },
  houses: [
    {
      id: YMLADD_HOUSE_ID,
      name: 'Haus Ymladd',
      motto: '',
      emblem: YMLADD_EMBLEM,
      status: 'active'
    }
  ],
  persons: [
    person('dafydd-ymladd', 'Dafydd Ymladd', 'male', '????', '????', YMLADD_HOUSE_ID, {
      status: 'dead',
      title: 'Gründer und erster Ritterherr des Hauses Ymladd',
      notes: 'Von Haus Draig als Kommandant einer abgelegenen Grenzburg eingesetzt. Nachdem er Burg, Straße und Weideland gegen die Gefahren des Gebirges gehalten hatte, durfte er das eigenständige Haus Ymladd begründen.'
    }),
    spouse('unknown-spouse-dafydd-ymladd', 'female'),

    person('hedd-ymladd', 'Hedd Ymladd', 'male', '1665', '', YMLADD_HOUSE_ID, {
      title: 'Ritterherr des Hauses Ymladd',
      notes: 'Gegenwärtiges Oberhaupt. Hedd diente viele Jahre in der Hauptstadt als Hochkonstabler und führt Haus und Burg mit nüchterner Pflichterfüllung.'
    }),
    spouse('unknown-spouse-hedd-ymladd', 'female'),
    person('gruffydd-ymladd', 'Gruffydd Ymladd', 'male', '1667', '', YMLADD_HOUSE_ID, {
      title: 'Fahrender Ritter und Söldner',
      notes: 'Das schwarze Schaf des Hauses. Nach seinem Ritterschlag verließ Gruffydd die Familie und bewegt sich seither im Umfeld zwielichtiger Gestalten.'
    }),
    person('garan-ymladd', 'Garan Ymladd', 'male', '1669', '', YMLADD_HOUSE_ID, {
      title: 'Zoll- und Abgabenmeister am Hofe Haus Gwyverns',
      notes: 'Dient im Auftrag des Kämmerers am Baronshof und kontrolliert die baronialen Abgaben, ohne selbst politische Macht auszuüben.'
    }),
    spouse('unknown-spouse-garan-ymladd', 'female'),

    person('idris-ymladd', 'Idris Ymladd', 'male', '1691', '', YMLADD_HOUSE_ID, {
      title: 'Erbe des Hauses Ymladd'
    }),
    spouse('unknown-spouse-idris-ymladd', 'female'),
    person('idwal-ymladd', 'Idwal Ymladd', 'male', '1694'),
    spouse('unknown-spouse-idwal-ymladd', 'female'),
    person('alistair-ymladd', 'Alistair Ymladd', 'male', '1693'),
    spouse('unknown-spouse-alistair-ymladd', 'female'),
    person('keneth-ymladd', 'Keneth Ymladd', 'male', '1697'),
    spouse('unknown-spouse-keneth-ymladd', 'female'),

    person('emeric-ymladd', 'Emeric Ymladd', 'male', '1717', '', YMLADD_HOUSE_ID, {
      title: 'Zweiter Erbe des Hauses Ymladd'
    }),
    person('nerys-ymladd', 'Nerys Ymladd', 'female', '1719'),
    person('guto-ymladd', 'Guto Ymladd', 'male', '1720'),
    person('menna-ymladd', 'Menna Ymladd', 'female', '1722'),
    person('gwilym-ymladd', 'Gwilym Ymladd', 'male', '1719'),
    person('iorwerth-ymladd', 'Iorwerth Ymladd', 'male', '1720'),
    person('morfudd-ymladd', 'Morfudd Ymladd', 'female', '1722'),
    person('tywll-ymladd', 'Tywll Ymladd', 'male', '1728')
  ],
  partnerships: [
    createMarriage('marriage-dafydd-ymladd', ...DAFYDD_IDS, { status: 'ended' }),
    createMarriage('marriage-hedd-ymladd', ...HEDD_IDS, { status: 'widowed' }),
    createMarriage('marriage-garan-ymladd', ...GARAN_IDS, { status: 'widowed' }),
    createMarriage('marriage-idris-ymladd', ...IDRIS_IDS, { status: 'widowed' }),
    createMarriage('marriage-idwal-ymladd', ...IDWAL_IDS, { status: 'widowed' }),
    createMarriage('marriage-alistair-ymladd', ...ALISTAIR_IDS, { status: 'widowed' }),
    createMarriage('marriage-keneth-ymladd', ...KENETH_IDS, { status: 'widowed' })
  ],
  parentages: [
    ...childrenOf(
      ['hedd-ymladd', 'gruffydd-ymladd', 'garan-ymladd'],
      DAFYDD_IDS,
      'marriage-dafydd-ymladd',
      {
        type: 'claimed',
        certainty: 'probable',
        notes: 'Mehrere nicht einzeln überlieferte Generationen verbinden das Gründerpaar mit Hedd, Gruffydd und Garan.',
        extensions: { timeJumpId: 'gap-dafydd-hedd-ymladd' }
      }
    ),
    ...childrenOf(['idris-ymladd', 'idwal-ymladd'], HEDD_IDS, 'marriage-hedd-ymladd'),
    ...childrenOf(['alistair-ymladd', 'keneth-ymladd'], GARAN_IDS, 'marriage-garan-ymladd'),
    ...childrenOf(['emeric-ymladd', 'nerys-ymladd'], IDRIS_IDS, 'marriage-idris-ymladd'),
    ...childrenOf(['guto-ymladd', 'menna-ymladd'], IDWAL_IDS, 'marriage-idwal-ymladd'),
    ...childrenOf(['gwilym-ymladd', 'iorwerth-ymladd'], ALISTAIR_IDS, 'marriage-alistair-ymladd'),
    ...childrenOf(['morfudd-ymladd', 'tywll-ymladd'], KENETH_IDS, 'marriage-keneth-ymladd')
  ],
  lineage: {
    founderPartnershipId: 'marriage-dafydd-ymladd',
    houseId: YMLADD_HOUSE_ID,
    crestSubtitle: 'Ritterhaus an den östlichen Gebirgsrändern',
    crestEmblemScale: 0.82,
    crestFrame: 'silver',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  cadetBranches: [],
  timeJumps: [
    {
      id: 'gap-dafydd-hedd-ymladd',
      parentPartnershipId: 'marriage-dafydd-ymladd',
      parentPersonId: '',
      childIds: ['hedd-ymladd', 'gruffydd-ymladd', 'garan-ymladd'],
      years: 0,
      fromYear: '????',
      toYear: '1665',
      label: 'Nicht einzeln überlieferte Generationen',
      notes: 'Der Zeitsprung folgt als alleiniger absoluter Generationentrenner unter dem vom Gründerpaar begründeten Hauswappen.',
      extensions: {}
    }
  ],
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'dafydd-ymladd',
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    sourceNote: 'Genealogie, Lebensdaten, Hausdaten, Rollen und Portraitquellen nach der bereitgestellten Ymladd-Hausseite samt Stammbaumgrafik. Dafydd und seine namentlich nicht überlieferte Ehefrau bilden das Gründerpaar; unter ihrem silbern gerahmten Hauswappen folgt genau ein absoluter serieller Überlieferungssprung zu Hedd, Gruffydd und Garan. Hedd ist gegenwärtiges Oberhaupt; die ausdrückliche Erbfolge nennt Idris und Emeric. Hedds Kinder sind Idris und Idwal, Garans Kinder Alistair und Keneth. Gruffydd besitzt laut Quelle weder Ehe noch Nachkommen. Alle vier Enkelzweige enden bei den acht namentlich belegten, unverheirateten Kindern der Generation von 1740. Die sieben namenlosen Ehefrauen werden als eigenständige Personen mit lokaler Silhouette geführt, aber nicht als wegverheiratete Ymladd-Linien missdeutet. Haus Draig ist Rittervater und historischer Auftraggeber Dafydds, nicht sein genealogisch belegtes Herkunftshaus. Generische Silhouetten und unbeschriftete Dienerschaft werden nicht als individuelle Portraitquellen importiert.',
    houseLore: {
      seat: 'Abergwint',
      estate: 'Grenzburg östlich von Abergwint an der Straße nach Carregmawr sowie einige Höfe und Bauernstellen im umliegenden Weideland',
      liegeHouse: 'Haus Gwyvern',
      benefactor: 'Haus Gwyvern',
      knightFather: 'Haus Draig',
      ethnicity: 'Cenyri',
      wealth: 'Beschaulich',
      religion: 'Die Alerische Kirche',
      patrons: [],
      friends: [],
      feud: 'Keine offene Fehde',
      tradition: 'Pflicht, Schutz und Verlässlichkeit stehen über Ruhm. Die Ritter des Hauses sichern Straße, Weideland und Siedlungen gegen nichtmenschliche Bedrohungen.'
    },
    blankFamily: false,
    sourceRevision: 1
  }
});
