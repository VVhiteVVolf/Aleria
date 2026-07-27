import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { GWENDOLYNS_UFER_VASSAL_PROFILES } from './celtigerns-wacht-house-profiles.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_CAERLAEN_PORTRAITS } from './house-caerlaen-portraits.js';

const CAERLAEN_EMBLEM = 'assets/images/houses/Gwendolyns Ufer/Bürgerliche/Caerlaen.png';
const BALCHDER_EMBLEM = 'assets/images/houses/Llamreis Ankunft/haus-balchder.png';
const RHUDDGAR_EMBLEM = 'assets/images/houses/Gwendolyns Ufer/Ritterliche/Rhuddgar.png';
const CAERTHWYN_EMBLEM = 'assets/images/houses/Gwendolyns Ufer/Bürgerliche/Caerthwyn.png';
const CAERLAEN_HOUSE_ID = 'house-caerlaen';

const HOUSE_HEAD_IDS = new Set([
  'morien-caerlaen',
  'carwyn-caerlaen',
  'gwendal-caerlaen',
  'tudor-caerlaen'
]);
const MAIN_LINE_IDS = new Set(['merlyn-caerlaen', 'urian-caerlaen']);

function lineageRoleFor(personId) {
  if (HOUSE_HEAD_IDS.has(personId)) return 'head';
  return MAIN_LINE_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', houseId = CAERLAEN_HOUSE_ID, options = {}) {
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    houseId,
    portrait: HOUSE_CAERLAEN_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === CAERLAEN_HOUSE_ID ? 'core' : 'married'),
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

const MORIEN_IDS = ['morien-caerlaen', 'izolda-caerlaen'];
const CARWYN_IDS = ['carwyn-caerlaen', 'raewyn'];
const TRAYVON_IDS = ['trayvon-caerlaen', 'saoirse'];
const GWENDAL_IDS = ['gwendal-caerlaen', 'lunet'];
const ARAWN_IDS = ['arawn-caerlaen', 'tegin'];
const TUDOR_IDS = ['tudor-caerlaen', 'innogen'];
// Reihenfolge und ID entsprechen der kanonischen Balchder-Gegenakte.
const ISEULT_IDS = ['dalvin-balchder', 'iseult-caerlaen'];
const ENIAN_IDS = ['enian-caerlaen', 'wena'];
const MERLYN_IDS = ['merlyn-caerlaen', 'solveig'];
// Reihenfolge und ID entsprechen der kanonischen Rhuddgar-Gegenakte.
const MIRAETH_IDS = ['caderyn-rhuddgar', 'miraeth-caerlaen'];
// Reihenfolge, ID und Beziehungstyp entsprechen der kanonischen Caerthwyn-Gegenakte.
const MEILYR_IDS = ['ywen-caerthwyn', 'meilyr-caerlaen'];
const DILLION_IDS = ['dillion-caerlaen', 'vanora'];

export const HOUSE_CAERLAEN_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-caerlaen',
    title: 'Haus Caerlaen',
    motto: 'Schrift bewahrt, wissen lenkt.',
    description: 'Das gelehrte Bürgerhaus Caerlaen aus Abergwint verwaltet das Archiv des Barons, die Stadtbibliothek und eine eigene Schreiberschule im Dienst Haus Gwyverns.',
    emblem: CAERLAEN_EMBLEM,
    houseProfile: GWENDOLYNS_UFER_VASSAL_PROFILES.caerlaen
  },
  houses: [
    house(CAERLAEN_HOUSE_ID, 'Haus Caerlaen', CAERLAEN_EMBLEM),
    house('house-balchder', 'Haus Balchder', BALCHDER_EMBLEM),
    house('house-rhuddgar', 'Haus Rhuddgar', RHUDDGAR_EMBLEM),
    house('house-caerthwyn', 'Haus Caerthwyn', CAERTHWYN_EMBLEM)
  ],
  persons: [
    person('morien-caerlaen', 'Morien Caerlaen', 'male', '????', '????', CAERLAEN_HOUSE_ID, {
      status: 'dead',
      title: 'Gründer des Hauses Caerlaen · Gelehrter und Berater des Barons',
      notes: 'Ein Gelehrter des Hauses Balchder erkannte Moriens Begabung und bildete ihn aus. Morien kehrte später nach Abergwint zurück und begründete dort die gelehrte Familientradition; diese Ausbildung war keine belegte Mündelvermittlung.'
    }),
    spouse('izolda-caerlaen', 'Izolda', 'female', '????', '????', '', { status: 'dead' }),

    // Erste einzeln belegte Generation hinter der Überlieferungslücke.
    person('carwyn-caerlaen', 'Carwyn Caerlaen', 'male', '1625', '1715'),
    spouse('raewyn', 'Raewyn', 'female', '1630', '1711'),
    person('trayvon-caerlaen', 'Trayvon Caerlaen', 'male', '1632', '', CAERLAEN_HOUSE_ID, {
      title: 'Hochbetagter Archivar des Hauses Caerlaen'
    }),
    spouse('saoirse', 'Saoirse', 'female', '1635', '1704'),

    person('gwendal-caerlaen', 'Gwendal Caerlaen', 'male', '1649', '1732'),
    spouse('lunet', 'Lunet', 'female', '1652', '1738'),
    person('arawn-caerlaen', 'Arawn Caerlaen', 'male', '1653', '1736'),
    spouse('tegin', 'Tegin', 'female', '1657', '1729'),

    person('tudor-caerlaen', 'Tudor Caerlaen', 'male', '1671', '', CAERLAEN_HOUSE_ID, {
      title: 'Familienoberhaupt des Hauses Caerlaen seit 1732'
    }),
    spouse('innogen', 'Innogen', 'female', '1676'),
    person('iseult-caerlaen', 'Iseult Caerlaen', 'female', '1675', '', CAERLAEN_HOUSE_ID, {
      notes: 'Iseult heiratete Dalvin Balchder und führt die Caerlaen-Linie nicht fort. Ihre Kinder werden ausschließlich in der Balchder-Akte geführt.'
    }),
    spouse('dalvin-balchder', 'Dalvin Balchder', 'male', '1670', '', 'house-balchder', {
      title: 'Ritterherr des Hauses Balchder'
    }),
    person('enian-caerlaen', 'Enian Caerlaen', 'male', '1677'),
    spouse('wena', 'Wena', 'female', '1680'),

    person('merlyn-caerlaen', 'Merlyn Caerlaen', 'male', '1695', '', CAERLAEN_HOUSE_ID, {
      title: 'Erster Erbe des Hauses Caerlaen'
    }),
    spouse('solveig', 'Solveig', 'female', '1699'),
    person('miraeth-caerlaen', 'Miraeth Caerlaen', 'female', '1700', '', CAERLAEN_HOUSE_ID, {
      notes: 'Miraeth heiratete Caderyn Rhuddgar und führt die Caerlaen-Linie nicht fort. Ihre Kinder werden ausschließlich in der Rhuddgar-Akte geführt.'
    }),
    spouse('caderyn-rhuddgar', 'Caderyn Rhuddgar', 'male', '1697', '', 'house-rhuddgar', {
      title: 'Lehenswart von Garwfaen'
    }),
    person('meilyr-caerlaen', 'Meilyr Caerlaen', 'male', '1715'),
    spouse('ywen-caerthwyn', 'Ywen Caerthwyn', 'female', '1715', '', 'house-caerthwyn'),
    person('dillion-caerlaen', 'Dillion Caerlaen', 'male', '1698'),
    spouse('vanora', 'Vanora', 'female', '1703'),

    person('ysee-caerlaen', 'Ysee Caerlaen', 'female', '1721'),
    person('urian-caerlaen', 'Urian Caerlaen', 'male', '1730', '', CAERLAEN_HOUSE_ID, {
      title: 'Zweiter Erbe des Hauses Caerlaen'
    }),
    person('yale-caerlaen', 'Yale Caerlaen', 'male', '1722'),
    person('jenyi-caerlaen', 'Jenyi Caerlaen', 'female', '1727')
  ],
  partnerships: [
    createMarriage('marriage-morien-izolda-caerlaen', ...MORIEN_IDS, { status: 'ended' }),
    createMarriage('marriage-carwyn-raewyn', ...CARWYN_IDS, { status: 'ended' }),
    createMarriage('marriage-trayvon-saoirse', ...TRAYVON_IDS, { status: 'ended' }),
    createMarriage('marriage-gwendal-lunet', ...GWENDAL_IDS, { status: 'ended' }),
    createMarriage('marriage-arawn-tegin', ...ARAWN_IDS, { status: 'ended' }),
    createMarriage('marriage-tudor-innogen', ...TUDOR_IDS),
    createMarriage('marriage-dalvin-iseult', ...ISEULT_IDS),
    createMarriage('marriage-enian-wena', ...ENIAN_IDS),
    createMarriage('marriage-merlyn-solveig', ...MERLYN_IDS),
    createMarriage('marriage-caderyn-miraeth', ...MIRAETH_IDS),
    createMarriage('engagement-ywen-meilyr', ...MEILYR_IDS, { type: 'engagement' }),
    createMarriage('marriage-dillion-vanora', ...DILLION_IDS)
  ],
  parentages: [
    ...childrenOf(
      ['carwyn-caerlaen', 'trayvon-caerlaen'],
      MORIEN_IDS,
      'marriage-morien-izolda-caerlaen',
      {
        type: 'claimed',
        certainty: 'probable',
        notes: 'Nicht einzeln überlieferte Generationen verbinden das Gründerpaar mit Carwyn und Trayvon.',
        extensions: { timeJumpId: 'gap-morien-carwyn-caerlaen' }
      }
    ),
    ...childrenOf(['gwendal-caerlaen'], CARWYN_IDS, 'marriage-carwyn-raewyn'),
    ...childrenOf(['arawn-caerlaen'], TRAYVON_IDS, 'marriage-trayvon-saoirse'),
    ...childrenOf(['tudor-caerlaen', 'iseult-caerlaen'], GWENDAL_IDS, 'marriage-gwendal-lunet'),
    ...childrenOf(['enian-caerlaen'], ARAWN_IDS, 'marriage-arawn-tegin'),
    ...childrenOf(
      ['merlyn-caerlaen', 'miraeth-caerlaen', 'meilyr-caerlaen'],
      TUDOR_IDS,
      'marriage-tudor-innogen'
    ),
    ...childrenOf(['dillion-caerlaen'], ENIAN_IDS, 'marriage-enian-wena'),
    ...childrenOf(['ysee-caerlaen', 'urian-caerlaen'], MERLYN_IDS, 'marriage-merlyn-solveig'),
    ...childrenOf(['yale-caerlaen', 'jenyi-caerlaen'], DILLION_IDS, 'marriage-dillion-vanora')
  ],
  lineage: {
    founderPartnershipId: 'marriage-morien-izolda-caerlaen',
    houseId: CAERLAEN_HOUSE_ID,
    crestSubtitle: 'Gelehrtes Bürgerhaus aus Abergwint',
    crestEmblemScale: 0.82,
    crestFrame: 'iron',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  cadetBranches: [
    createMarriedAwayBranch({
      id: 'married-away-balchder-iseult-caerlaen',
      name: 'Haus Balchder',
      parentPartnershipId: 'marriage-dalvin-iseult',
      houseId: 'house-balchder',
      targetFamilyId: 'haus-balchder',
      emblem: BALCHDER_EMBLEM,
      crestFrame: 'silver',
      notes: 'Iseult Caerlaen wurde an Dalvin aus dem Ritterherrenhaus Balchder verheiratet.'
    }),
    createMarriedAwayBranch({
      id: 'married-away-rhuddgar-miraeth-caerlaen',
      name: 'Haus Rhuddgar',
      parentPartnershipId: 'marriage-caderyn-miraeth',
      houseId: 'house-rhuddgar',
      targetFamilyId: 'haus-rhuddgar',
      emblem: RHUDDGAR_EMBLEM,
      crestFrame: 'silver',
      notes: 'Miraeth Caerlaen wurde an Caderyn aus dem Ritterhaus Rhuddgar verheiratet.'
    })
  ],
  timeJumps: [
    {
      id: 'gap-morien-carwyn-caerlaen',
      parentPartnershipId: 'marriage-morien-izolda-caerlaen',
      parentPersonId: '',
      childIds: ['carwyn-caerlaen', 'trayvon-caerlaen'],
      years: 0,
      fromYear: '????',
      toYear: '1625',
      label: 'Nicht einzeln überlieferte Generationen',
      notes: 'Der Zeitsprung folgt als alleiniger absoluter Generationentrenner unter dem eisern gerahmten Caerlaen-Hauswappen und steht niemals parallel zu einem Personen- oder Hausknoten.',
      extensions: {}
    }
  ],
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'morien-caerlaen',
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    sourceNote: 'Genealogie, Lebensdaten, Hausdaten und Portraitquellen folgen der bereitgestellten Caerlaen-Hausseite samt Stammbaumgrafik. Morien und Izolda bilden das Gründerpaar; ihr eisern gerahmtes Bürgerhauswappen führt als einziges Kind in genau einen seriellen Überlieferungssprung zu Carwyn und Trayvon. Moriens Ausbildung durch einen Balchder-Gelehrten ist keine ausdrücklich belegte Mündelvermittlung und erzeugt daher weder Mündelrahmen noch Zielhausknoten. Die widersprüchliche Kinderüberschrift „Tudor’s & Iseult’s“ wird nach der eindeutigen Ehe- und Grafikstruktur als Tudor und Innogen aufgelöst; Iseult ist Tudors Schwester und mit Dalvin verheiratet. Tudor ist gegenwärtiges Oberhaupt; Merlyn und Urian bilden die belegte Erbfolge. Iseult/Dalvin, Miraeth/Caderyn und Meilyr/Ywen verwenden dieselben Weltpersonen, Verbindungen und Portraitdateien wie die Balchder-, Rhuddgar- beziehungsweise Caerthwyn-Gegenakte. Die Kinder Iseults und Miraeths werden ausschließlich in den fortführenden Zielhäusern geführt. Iseult und Miraeth besitzen direkte Wegverheiratet-Knoten; Ywen ist dagegen die nach Caerlaen verlobte Partnerin, weshalb ihr Herkunftshaus hier keinen parallelen Wegverheiratet-Knoten erzeugt. Ysee, Urian, Yale und Jenyi bleiben ohne erfundene Partnerschaften. Die zweimal fälschlich „Caerthwyn“ nennende Kultur- und Religionsprosa der Vorlage wird als offensichtlicher Übertragungsfehler auf Caerlaen normalisiert. Generische Silhouetten werden nicht als individuelle Portraitquellen importiert.',
    houseLore: {
      seat: 'Abergwint',
      estate: 'Archiv des Barons, Stadtbibliothek von Abergwint und eigene Schreiberschule',
      liegeHouse: 'Haus Gwyvern',
      benefactor: 'Haus Gwyvern',
      knightFather: 'Niemand',
      ethnicity: 'Cenyri',
      wealth: 'Beschaulich',
      religion: 'Die Alerische Kirche',
      patrons: ['Der Mentor'],
      friends: ['Haus Balchder'],
      feud: '',
      trade: ['Archivverwaltung', 'Bibliothekswesen', 'Schreiberschule', 'Gelehrten- und Beratungsdienst'],
      tradition: 'Wissen wird bewahrt, geordnet und verantwortungsvoll weitergegeben; Wahrheit, Genauigkeit, Demut und Ausdauer gelten als Fundament des Hauses.',
      rivalry: 'Stille sachliche Konkurrenz mit Haus Caerthwyn um Posten, Ämter und beratende Funktionen.'
    },
    blankFamily: false,
    sourceRevision: 1
  }
});
