import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { GWENDOLYNS_UFER_VASSAL_PROFILES } from './celtigerns-wacht-house-profiles.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_CAERTHWYN_PORTRAITS } from './house-caerthwyn-portraits.js';

const CAERTHWYN_EMBLEM = 'assets/images/houses/Gwendolyns Ufer/Bürgerliche/Caerthwyn.png';
const CAERLAEN_EMBLEM = 'assets/images/houses/Gwendolyns Ufer/Bürgerliche/Caerlaen.png';
const RHUDDGAR_EMBLEM = 'assets/images/houses/Gwendolyns Ufer/Ritterliche/Rhuddgar.png';
const TARANVYR_EMBLEM = 'assets/images/houses/Gwendolyns Ufer/Ritterliche/Taranvyr.png';
const CAERTHWYN_HOUSE_ID = 'house-caerthwyn';

const HOUSE_HEAD_IDS = new Set(['sadwyn-caerthwyn', 'bowen-caerthwyn']);
const MAIN_LINE_IDS = new Set(['adeon-caerthwyn', 'sion-caerthwyn', 'gwil-caerthwyn']);

function lineageRoleFor(personId) {
  if (HOUSE_HEAD_IDS.has(personId)) return 'head';
  return MAIN_LINE_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', houseId = CAERTHWYN_HOUSE_ID, options = {}) {
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    houseId,
    portrait: HOUSE_CAERTHWYN_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === CAERTHWYN_HOUSE_ID ? 'core' : 'married'),
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

const SADWYN_IDS = ['sadwyn-caerthwyn', 'mervynne-spouse-caerthwyn'];
const BOWEN_IDS = ['bowen-caerthwyn', 'arlais'];
const SATH_IDS = ['sath-caerthwyn', 'hollie'];
const ADEON_IDS = ['adeon-caerthwyn', 'breven'];
const MICAH_IDS = ['micah-caerthwyn', 'alicyn'];
// Reihenfolge und ID entsprechen der kanonischen Taranvyr-Gegenakte.
const ELOWEN_IDS = ['rhon-taranvyr', 'elowen-caerthwyn'];
// Reihenfolge und ID entsprechen der kanonischen Rhuddgar-Gegenakte.
const EMYRS_IDS = ['serenna-rhuddgar', 'emyrs-caerthwyn'];
const YWEN_IDS = ['ywen-caerthwyn', 'meilyr-caerlaen'];
const REECE_IDS = ['reece-caerthwyn', 'brinley'];
const FFION_IDS = ['ffion-caerthwyn', 'heston'];

export const HOUSE_CAERTHWYN_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-caerthwyn',
    title: 'Haus Caerthwyn',
    motto: 'Beständig im Wandel.',
    description: 'Das einflussreiche Bürgerhaus Caerthwyn aus Abergwint verbindet den Dienst als Vogt des Barons mit seinem traditionsreichen Gestüt zwischen Castell Rhewglyn und Llysbrynn.',
    emblem: CAERTHWYN_EMBLEM,
    houseProfile: GWENDOLYNS_UFER_VASSAL_PROFILES.caerthwyn
  },
  houses: [
    house(CAERTHWYN_HOUSE_ID, 'Haus Caerthwyn', CAERTHWYN_EMBLEM),
    house('house-taranvyr', 'Haus Taranvyr', TARANVYR_EMBLEM),
    house('house-rhuddgar', 'Haus Rhuddgar', RHUDDGAR_EMBLEM),
    house('house-caerlaen', 'Haus Caerlaen', CAERLAEN_EMBLEM)
  ],
  persons: [
    person('sadwyn-caerthwyn', 'Sadwyn Caerthwyn', 'male', '????', '????', CAERTHWYN_HOUSE_ID, {
      status: 'dead',
      title: 'Gründer des Hauses Caerthwyn · Erster Vogt des Barons',
      notes: 'Sadwyn wurde als kleiner Junge vom Baron entdeckt, als Mündel nach Abergwint gebracht und dort ausgebildet. Diese biographische Vorgeschichte erzeugt in der Caerthwyn-Akte keinen Vermittlungs- oder Zielhausknoten.'
    }),
    spouse('mervynne-spouse-caerthwyn', 'Mervynne', 'female', '????', '????', '', {
      status: 'dead',
      notes: 'Mervynne ist als verstorbene Ehefrau Sadwyns namentlich überliefert, besitzt in der Quelle jedoch nur eine generische Silhouette.'
    }),

    person('bowen-caerthwyn', 'Bowen Caerthwyn', 'male', '1672', '', CAERTHWYN_HOUSE_ID, {
      title: 'Familienoberhaupt des Hauses Caerthwyn · Vogt des Barons',
      notes: 'Führt den gelehrten und staatsmännischen Zweig des Hauses in Abergwint.'
    }),
    spouse('arlais', 'Arlais', 'female', '1675'),
    person('sath-caerthwyn', 'Sath Caerthwyn', 'male', '1677', '', CAERTHWYN_HOUSE_ID, {
      title: 'Leiter des Caerthwyn-Gestüts',
      notes: 'Führt den Zweig der Pferdezucht und Rehabilitation auf dem alten Familiengut.'
    }),
    spouse('hollie', 'Hollie', 'female', '1680'),

    person('adeon-caerthwyn', 'Adeon Caerthwyn', 'male', '1693', '', CAERTHWYN_HOUSE_ID, {
      title: 'Erster Erbe des Hauses Caerthwyn'
    }),
    spouse('breven', 'Breven', 'female', '1698'),
    person('micah-caerthwyn', 'Micah Caerthwyn', 'male', '1696'),
    spouse('alicyn', 'Alicyn', 'female', '1702'),
    person('elowen-caerthwyn', 'Elowen Caerthwyn', 'female', '1698', '', CAERTHWYN_HOUSE_ID, {
      notes: 'Elowen heiratete Rhon Taranvyr und führt die Caerthwyn-Linie nicht fort. Ihr Sohn Caelan wird ausschließlich in der Taranvyr-Akte geführt.'
    }),
    spouse('rhon-taranvyr', 'Rhon Taranvyr', 'male', '1688', '', 'house-taranvyr', {
      title: 'Lehenswart in Glasdraeth'
    }),
    person('emyrs-caerthwyn', 'Emyrs Caerthwyn', 'male', '1708'),
    spouse('serenna-rhuddgar', 'Serenna Rhuddgar', 'female', '1710', '', 'house-rhuddgar', {
      notes: 'Serenna heiratete Emyrs Caerthwyn. Rhun und Llinos werden ausschließlich in der Caerthwyn-Akte geführt.'
    }),
    person('ywen-caerthwyn', 'Ywen Caerthwyn', 'female', '1715', '', CAERTHWYN_HOUSE_ID, {
      notes: 'Ywen ist mit Meilyr Caerlaen verlobt und wird nach der überlieferten Verbindung an Haus Caerlaen weggegeben.'
    }),
    spouse('meilyr-caerlaen', 'Meilyr Caerlaen', 'male', '1715', '', 'house-caerlaen'),

    person('reece-caerthwyn', 'Reece Caerthwyn', 'male', '1700'),
    spouse('brinley', 'Brinley', 'female', '1703'),
    person('ffion-caerthwyn', 'Ffion Caerthwyn', 'female', '1709'),
    spouse('heston', 'Heston', 'male', '1710'),

    person('sion-caerthwyn', 'Sion Caerthwyn', 'male', '1722', '', CAERTHWYN_HOUSE_ID, {
      title: 'Zweiter Erbe · Anwärter auf den Ritterschlag',
      notes: 'Mit Sions möglichem Ritterschlag hofft Haus Caerthwyn auf den Aufstieg zum Ritterhaus.'
    }),
    person('talaith-caerthwyn', 'Talaith Caerthwyn', 'female', '1723'),
    person('gwil-caerthwyn', 'Gwil Caerthwyn', 'male', '1725', '', CAERTHWYN_HOUSE_ID, {
      title: 'Dritter Erbe des Hauses Caerthwyn'
    }),
    person('glaw-caerthwyn', 'Glaw Caerthwyn', 'female', '1720'),
    person('huw-caerthwyn', 'Huw Caerthwyn', 'male', '1727'),
    person('rhun-caerthwyn', 'Rhun Caerthwyn', 'male', '1731'),
    person('llinos-caerthwyn', 'Llinos Caerthwyn', 'female', '1733'),
    person('ioan-caerthwyn', 'Ioan Caerthwyn', 'male', '1719'),
    person('jowna-caerthwyn', 'Jowna Caerthwyn', 'female', '1722'),
    person('larna-caerthwyn', 'Larna Caerthwyn', 'female', '1730')
  ],
  partnerships: [
    createMarriage('marriage-sadwyn-mervynne-caerthwyn', ...SADWYN_IDS, { status: 'ended' }),
    createMarriage('marriage-bowen-arlais', ...BOWEN_IDS),
    createMarriage('marriage-sath-hollie', ...SATH_IDS),
    createMarriage('marriage-adeon-breven', ...ADEON_IDS),
    createMarriage('marriage-micah-alicyn', ...MICAH_IDS),
    createMarriage('marriage-rhon-elowen', ...ELOWEN_IDS),
    createMarriage('marriage-serenna-emyrs', ...EMYRS_IDS),
    createMarriage('engagement-ywen-meilyr', ...YWEN_IDS, { type: 'engagement' }),
    createMarriage('marriage-reece-brinley', ...REECE_IDS),
    createMarriage('marriage-ffion-heston', ...FFION_IDS)
  ],
  parentages: [
    ...childrenOf(
      ['bowen-caerthwyn', 'sath-caerthwyn'],
      SADWYN_IDS,
      'marriage-sadwyn-mervynne-caerthwyn',
      {
        type: 'claimed',
        certainty: 'probable',
        notes: 'Nicht einzeln überlieferte Generationen verbinden das Gründerpaar mit Bowen und Sath.',
        extensions: { timeJumpId: 'gap-sadwyn-bowen-caerthwyn' }
      }
    ),
    ...childrenOf(
      ['adeon-caerthwyn', 'micah-caerthwyn', 'elowen-caerthwyn', 'emyrs-caerthwyn', 'ywen-caerthwyn'],
      BOWEN_IDS,
      'marriage-bowen-arlais'
    ),
    ...childrenOf(['reece-caerthwyn', 'ffion-caerthwyn'], SATH_IDS, 'marriage-sath-hollie'),
    ...childrenOf(
      ['sion-caerthwyn', 'talaith-caerthwyn', 'gwil-caerthwyn'],
      ADEON_IDS,
      'marriage-adeon-breven'
    ),
    ...childrenOf(['glaw-caerthwyn', 'huw-caerthwyn'], MICAH_IDS, 'marriage-micah-alicyn'),
    ...childrenOf(['rhun-caerthwyn', 'llinos-caerthwyn'], EMYRS_IDS, 'marriage-serenna-emyrs'),
    ...childrenOf(['ioan-caerthwyn', 'jowna-caerthwyn'], REECE_IDS, 'marriage-reece-brinley'),
    ...childrenOf(['larna-caerthwyn'], FFION_IDS, 'marriage-ffion-heston')
  ],
  lineage: {
    founderPartnershipId: 'marriage-sadwyn-mervynne-caerthwyn',
    houseId: CAERTHWYN_HOUSE_ID,
    crestSubtitle: 'Bürgerhaus aus Abergwint',
    crestEmblemScale: 0.82,
    crestFrame: 'iron',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  cadetBranches: [
    createMarriedAwayBranch({
      id: 'married-away-taranvyr-elowen-caerthwyn',
      name: 'Haus Taranvyr',
      parentPartnershipId: 'marriage-rhon-elowen',
      houseId: 'house-taranvyr',
      targetFamilyId: 'haus-taranvyr',
      emblem: TARANVYR_EMBLEM,
      crestFrame: 'silver',
      notes: 'Elowen Caerthwyn wurde an Rhon Taranvyr verheiratet und führt die Caerthwyn-Linie nicht fort.'
    }),
    createMarriedAwayBranch({
      id: 'engaged-away-caerlaen-ywen-caerthwyn',
      name: 'Haus Caerlaen',
      subtitle: 'Wegverlobte Linie',
      parentPartnershipId: 'engagement-ywen-meilyr',
      houseId: 'house-caerlaen',
      targetFamilyId: 'haus-caerlaen',
      emblem: CAERLAEN_EMBLEM,
      crestFrame: 'iron',
      notes: 'Ywen Caerthwyn ist mit Meilyr Caerlaen verlobt und führt die Caerthwyn-Linie nach der überlieferten Verbindung nicht fort.'
    })
  ],
  timeJumps: [
    {
      id: 'gap-sadwyn-bowen-caerthwyn',
      parentPartnershipId: 'marriage-sadwyn-mervynne-caerthwyn',
      parentPersonId: '',
      childIds: ['bowen-caerthwyn', 'sath-caerthwyn'],
      years: 0,
      fromYear: '????',
      toYear: '1672',
      label: 'Nicht einzeln überlieferte Generationen',
      notes: 'Der Zeitsprung folgt als alleiniger absoluter Generationentrenner unter dem eisern gerahmten Caerthwyn-Hauswappen und steht niemals parallel zu einem Personen- oder Hausknoten.',
      extensions: {}
    }
  ],
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'sadwyn-caerthwyn',
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    sourceNote: 'Genealogie, Lebensdaten, Hausdaten, Ämter und Portraitquellen folgen der bereitgestellten Caerthwyn-Hausseite samt Stammbaumgrafik. Sadwyn und Mervynne bilden das Gründerpaar; ihr eisern gerahmtes Bürgerhauswappen führt als einziges Kind in genau einen seriellen Überlieferungssprung, von dem Bowen und Sath abgehen. Sadwyns biographisch erwähnte Kindheit als Mündel in Abergwint erzeugt nach der ergänzenden Vorgabe weder einen dunkelblauen Fortgegeben-Rahmen noch einen Gwyvern-Zielhausknoten; eine konkrete Pflegeelternschaft wird ebenfalls nicht erfunden. Bowen ist gegenwärtiges Familienoberhaupt; Adeon, Sion und Gwil bilden die ausdrückliche Erbfolge. Elowen/Rhon und Emyrs/Serenna verwenden dieselben Weltpersonen, Ehen und Portraitdateien wie die Taranvyr- beziehungsweise Rhuddgar-Gegenakte. Caelan Taranvyr wird nur in Taranvyr geführt, Rhun und Llinos Caerthwyn nur in Caerthwyn, damit keine gedoppelten Familieninseln entstehen. Elowen besitzt an ihrer Ehe den direkten Wegverheiratet-Knoten zu Haus Taranvyr. Ywens ausdrücklich belegte Verlobung mit Meilyr endet in einem direkten Wegverlobt-Knoten zu Haus Caerlaen. Serenna, Arlais, Hollie, Breven, Alicyn, Brinley und Heston sind Herkunfts- oder Ehepartner; ihre Herkunftswappen erzeugen keine parallelen Hausknoten, solange die Caerthwyn-Linie aus der Verbindung fortgeführt wird. Die zehn Kinder der jüngsten Generation besitzen keine belegten Ehen oder Verlobungen und bleiben daher unverheiratet. Das leere Patronatsfeld der Übersicht wird zugunsten des ausführlichen Religionstextes aufgelöst: Knecht und Mentor sind die belegten Patrone. Generische Silhouetten werden nicht als individuelle Portraitquellen importiert.',
    houseLore: {
      seat: 'Abergwint',
      estate: 'Herrenhaus und verpachtete Taverne in Abergwint sowie das große Familiengestüt zwischen Castell Rhewglyn und Llysbrynn, einschließlich Pferderehabilitation',
      origin: 'Region zwischen Castell Rhewglyn und Llysbrynn',
      liegeHouse: 'Haus Gwyvern',
      benefactor: 'Haus Gwyvern',
      knightFather: 'Niemand',
      ethnicity: 'Cenyri',
      wealth: 'Beschaulich',
      religion: 'Die Alerische Kirche',
      patrons: ['Der Knecht', 'Der Mentor'],
      friends: ['Haus Gwyvern'],
      feud: '',
      trade: ['Pferdezucht', 'Pferderehabilitation', 'Verwaltung und Vogteidienst', 'Verpachtung einer Taverne'],
      tradition: 'Fleiß, Verlässlichkeit, Bildung, Erkenntnis, Verantwortungsbewusstsein und Anpassungsfähigkeit.'
    },
    blankFamily: false,
    sourceRevision: 1
  }
});
