import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { CELTIGERNS_WACHT_HOUSE_PROFILES } from './celtigerns-wacht-house-profiles.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_GWYLLACH_PORTRAITS } from './house-gwyllach-portraits.js';

const GWYLLACH_EMBLEM = 'assets/images/houses/haus-gwyllach.png';
const GWYLLACH_HOUSE_ID = 'house-gwyllach';
// Gwyllach ist bürgerlich und vererbt nach Eignung statt nach starrer Erstgeburt:
// die Kopfschaft wechselt zwischen Maelgorans zwei Söhnelinien hin und her
// (Tewrig -> Rhydderch, dann zurück auf Odriths Sohn Rhovan) statt gerade fortzuschreiten.
// Laut User ist Rhovans vorgesehene Erbfolge Drystan, danach dessen Sohn Meirion.
const HOUSE_HEAD_IDS = new Set([
  'maelgoran-gwyllach',
  'tewrig-gwyllach',
  'odrith-gwyllach',
  'rhydderch-gwyllach',
  'rhovan-gwyllach',
  'drystan-gwyllach',
  'meirion-gwyllach'
]);

function lineageRoleFor(personId) {
  return HOUSE_HEAD_IDS.has(personId) ? 'head' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', houseId = GWYLLACH_HOUSE_ID, options = {}) {
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    houseId,
    portrait: HOUSE_GWYLLACH_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === GWYLLACH_HOUSE_ID ? 'core' : 'married'),
    lineageRole: options.lineageRole || lineageRoleFor(id),
    ...options
  });
}

// Die Quelltabelle überliefert für die meisten Ehepartner nur ein
// unbeschriftetes „???"-Bildfeld; sie bleiben namenlos und ohne Portrait.
function unnamedSpouse(id, name, sex, birth = '????', death = '????') {
  return person(id, name, sex, birth, death, '', { familyRole: 'married', status: 'unknown' });
}

function childrenOf(childIds, parentIds, partnershipId, options = {}) {
  return createParentages(childIds, parentIds, partnershipId, options);
}

const MAELGORAN_IDS = ['maelgoran-gwyllach', 'cyrelle-gwyllach'];
const TEWRIG_IDS = ['tewrig-gwyllach', 'unknown-tewrig-spouse'];
const TOCHTER_IDS = ['unbekannte-tochter-gwyllach', 'unknown-tochter-spouse'];
const ODRITH_IDS = ['odrith-gwyllach', 'unknown-odrith-spouse'];
const RHYDDERCH_IDS = ['rhydderch-gwyllach', 'unknown-rhydderch-spouse'];
const MABLEN_IDS = ['mablen-gwyllach', 'unknown-mablen-spouse'];
const ROVAN_IDS = ['rhovan-gwyllach', 'unknown-rhovan-spouse'];
const EFAEL_IDS = ['efael-gwyllach', 'unknown-efael-spouse'];
const TALANETH_IDS = ['talaneth-gwyllach', 'unknown-talaneth-spouse'];
const MEREDYDD_IDS = ['meredydd-gwyllach', 'unknown-meredydd-spouse'];
const DRYSTAN_IDS = ['drystan-gwyllach', 'unknown-drystan-spouse'];
const ANELEN_IDS = ['anelen-gwyllach', 'unknown-anelen-spouse'];

export const HOUSE_GWYLLACH_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-gwyllach',
    title: 'Haus Gwyllach',
    motto: '',
    description: 'Die belegte Linie des bürgerlichen Hauses Gwyllach in Gwynthor, öffentlich die Kutscher- und Fuhrmannszunft, insgeheim Augen und Ohren des Drachen im Dienst Haus Draigs: vom Begründer Maelgoran bis zur Generation um 1723.',
    emblem: GWYLLACH_EMBLEM,
    houseProfile: CELTIGERNS_WACHT_HOUSE_PROFILES.gwyllach
  },
  houses: [
    { id: GWYLLACH_HOUSE_ID, name: 'Haus Gwyllach', motto: '', emblem: GWYLLACH_EMBLEM, status: 'active' },
    { id: 'house-unbekannt-tochter-gwyllach', name: 'Unbekanntes Haus', motto: '', emblem: '', status: 'active' },
    { id: 'house-unbekannt-mablen', name: 'Unbekanntes Haus', motto: '', emblem: '', status: 'active' },
    { id: 'house-unbekannt-talaneth', name: 'Unbekanntes Haus', motto: '', emblem: '', status: 'active' },
    { id: 'house-unbekannt-anelen', name: 'Unbekanntes Haus', motto: '', emblem: '', status: 'active' }
  ],
  persons: [
    // Begründer und seine Frau
    person('maelgoran-gwyllach', 'Maelgoran Gwyllach', 'male', '????', '????', GWYLLACH_HOUSE_ID, {
      status: 'dead',
      title: 'Begründer des bürgerlichen Hauses Gwyllach',
      notes: 'Gründete unter dem Deckmantel der Kutscher- und Fuhrmannszunft von Gwynthor das Spähernetz, das Haus Gwyllach seither insgeheim für Haus Draig unterhält.'
    }),
    person('cyrelle-gwyllach', 'Cyrelle', 'female', '????', '????', '', { familyRole: 'married', status: 'dead' }),

    // Kinder Maelgorans und Cyrelles
    person('tewrig-gwyllach', 'Tewrig Gwyllach', 'male', '1627', '????'),
    unnamedSpouse('unknown-tewrig-spouse', 'Unbekannte Ehefrau', 'female'),
    person('unbekannte-tochter-gwyllach', 'Unbekannte Tochter Maelgorans', 'female', '1630', '????', GWYLLACH_HOUSE_ID, {
      notes: 'Die Quelle überliefert weder Name noch Portrait für dieses Kind; das Geschlecht ist eine Annahme.'
    }),
    unnamedSpouse('unknown-tochter-spouse', 'Unbekannter Ehemann', 'male'),
    person('odrith-gwyllach', 'Odrith Gwyllach', 'male', '1633', '????'),
    unnamedSpouse('unknown-odrith-spouse', 'Unbekannte Ehefrau', 'female'),

    // Kinder Tewrigs
    person('rhydderch-gwyllach', 'Rhydderch Gwyllach', 'male', '1653', '????'),
    unnamedSpouse('unknown-rhydderch-spouse', 'Unbekannte Ehefrau', 'female'),
    person('mablen-gwyllach', 'Mablen Gwyllach', 'female', '1656', '????'),
    unnamedSpouse('unknown-mablen-spouse', 'Unbekannter Ehemann', 'male'),

    // Kind Odriths — heutiges Familienoberhaupt
    person('rhovan-gwyllach', 'Rhovan Gwyllach', 'male', '1659', '', GWYLLACH_HOUSE_ID, {
      title: 'Oberhaupt des Hauses Gwyllach'
    }),
    unnamedSpouse('unknown-rhovan-spouse', 'Unbekannte Ehefrau', 'female'),

    // Kinder Rhydderchs
    person('efael-gwyllach', 'Efael Gwyllach', 'male', '1679', ''),
    unnamedSpouse('unknown-efael-spouse', 'Unbekannte Ehefrau', 'female'),
    person('talaneth-gwyllach', 'Talaneth Gwyllach', 'female', '1681', ''),
    unnamedSpouse('unknown-talaneth-spouse', 'Unbekannter Ehemann', 'male'),
    person('meredydd-gwyllach', 'Meredydd Gwyllach', 'male', '1683', ''),
    unnamedSpouse('unknown-meredydd-spouse', 'Unbekannte Ehefrau', 'female'),

    // Kinder Rhovans
    person('drystan-gwyllach', 'Drystan Gwyllach', 'male', '1685', '', GWYLLACH_HOUSE_ID, {
      title: 'Vorgesehener Erbe des Hauses Gwyllach'
    }),
    unnamedSpouse('unknown-drystan-spouse', 'Unbekannte Ehefrau', 'female'),
    person('anelen-gwyllach', 'Anelen Gwyllach', 'female', '1687', ''),
    unnamedSpouse('unknown-anelen-spouse', 'Unbekannter Ehemann', 'male'),

    // Jüngste Generation: Kinder Efaels
    person('meirawen-gwyllach', 'Meirawen Gwyllach', 'female', '1705', ''),
    person('morwella-gwyllach', 'Morwella Gwyllach', 'female', '1707', ''),

    // Jüngste Generation: Kinder Meredydds
    person('talyfer-gwyllach', 'Talyfer Gwyllach', 'male', '1708', ''),
    person('saerwyn-gwyllach', 'Saerwyn Gwyllach', 'female', '1710', ''),

    // Jüngste Generation: Kinder Drystans
    person('meirion-gwyllach', 'Meirion Gwyllach', 'male', '1710', '', GWYLLACH_HOUSE_ID, {
      title: 'Zweiter Erbe des Hauses Gwyllach'
    }),
    person('olyndor-gwyllach', 'Olyndor Gwyllach', 'male', '1713', ''),
    person('rhufaed-gwyllach', 'Rhufaed Gwyllach', 'male', '1715', ''),
    person('eryndor-gwyllach', 'Eryndor Gwyllach', 'male', '1720', ''),
    person('liora-gwyllach', 'Liora Gwyllach', 'female', '1723', '')
  ],
  partnerships: [
    createMarriage('marriage-maelgoran-spouse', ...MAELGORAN_IDS),
    createMarriage('marriage-tewrig-spouse', ...TEWRIG_IDS),
    createMarriage('marriage-tochter-spouse', ...TOCHTER_IDS),
    createMarriage('marriage-odrith-spouse', ...ODRITH_IDS),
    createMarriage('marriage-rhydderch-spouse', ...RHYDDERCH_IDS),
    createMarriage('marriage-mablen-spouse', ...MABLEN_IDS),
    createMarriage('marriage-rhovan-spouse', ...ROVAN_IDS),
    createMarriage('marriage-efael-spouse', ...EFAEL_IDS),
    createMarriage('marriage-talaneth-spouse', ...TALANETH_IDS),
    createMarriage('marriage-meredydd-spouse', ...MEREDYDD_IDS),
    createMarriage('marriage-drystan-spouse', ...DRYSTAN_IDS),
    createMarriage('marriage-anelen-spouse', ...ANELEN_IDS)
  ],
  parentages: [
    ...childrenOf(
      ['tewrig-gwyllach', 'unbekannte-tochter-gwyllach', 'odrith-gwyllach'],
      MAELGORAN_IDS,
      'marriage-maelgoran-spouse',
      { type: 'claimed', certainty: 'probable' }
    ),
    ...childrenOf(['rhydderch-gwyllach', 'mablen-gwyllach'], TEWRIG_IDS, 'marriage-tewrig-spouse'),
    ...childrenOf(['rhovan-gwyllach'], ODRITH_IDS, 'marriage-odrith-spouse'),
    ...childrenOf(
      ['efael-gwyllach', 'talaneth-gwyllach', 'meredydd-gwyllach'],
      RHYDDERCH_IDS,
      'marriage-rhydderch-spouse'
    ),
    ...childrenOf(['drystan-gwyllach', 'anelen-gwyllach'], ROVAN_IDS, 'marriage-rhovan-spouse'),
    ...childrenOf(['meirawen-gwyllach', 'morwella-gwyllach'], EFAEL_IDS, 'marriage-efael-spouse'),
    ...childrenOf(['talyfer-gwyllach', 'saerwyn-gwyllach'], MEREDYDD_IDS, 'marriage-meredydd-spouse'),
    ...childrenOf(
      ['meirion-gwyllach', 'olyndor-gwyllach', 'rhufaed-gwyllach', 'eryndor-gwyllach', 'liora-gwyllach'],
      DRYSTAN_IDS,
      'marriage-drystan-spouse'
    )
  ],
  lineage: {
    founderPartnershipId: 'marriage-maelgoran-spouse',
    houseId: GWYLLACH_HOUSE_ID,
    crestSubtitle: '',
    crestEmblemScale: 0.8,
    // Bürgerliches Haus: eiserner statt goldener/silberner Wappenrahmen.
    crestFrame: 'iron',
    crestFrameScale: 1,
    timeGap: {
      enabled: true,
      years: 0,
      fromYear: '????',
      toYear: '1627',
      label: 'Nicht einzeln überlieferte Generationen'
    }
  },
  cadetBranches: [
    createMarriedAwayBranch({
      id: 'married-away-unbekannt-tochter',
      name: 'Unbekanntes Haus',
      parentPartnershipId: 'marriage-tochter-spouse',
      houseId: 'house-unbekannt-tochter-gwyllach',
      targetFamilyId: 'haus-unbekannt',
      crestFrame: 'gold',
      notes: 'Die namenlose Tochter Maelgorans wurde an ein nicht überliefertes Haus verheiratet.'
    }),
    createMarriedAwayBranch({
      id: 'married-away-unbekannt-mablen',
      name: 'Unbekanntes Haus',
      parentPartnershipId: 'marriage-mablen-spouse',
      houseId: 'house-unbekannt-mablen',
      targetFamilyId: 'haus-unbekannt',
      crestFrame: 'gold',
      notes: 'Mablen wurde an ein nicht überliefertes Haus verheiratet.'
    }),
    createMarriedAwayBranch({
      id: 'married-away-unbekannt-talaneth',
      name: 'Unbekanntes Haus',
      parentPartnershipId: 'marriage-talaneth-spouse',
      houseId: 'house-unbekannt-talaneth',
      targetFamilyId: 'haus-unbekannt',
      crestFrame: 'gold',
      notes: 'Talaneth wurde an ein nicht überliefertes Haus verheiratet.'
    }),
    createMarriedAwayBranch({
      id: 'married-away-unbekannt-anelen',
      name: 'Unbekanntes Haus',
      parentPartnershipId: 'marriage-anelen-spouse',
      houseId: 'house-unbekannt-anelen',
      targetFamilyId: 'haus-unbekannt',
      crestFrame: 'gold',
      notes: 'Anelen wurde an ein nicht überliefertes Haus verheiratet.'
    })
  ],
  timeJumps: [],
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'maelgoran-gwyllach',
    orientation: 'vertical',
    ancestorDepth: 10,
    descendantDepth: 10,
    showSiblings: true
  },
  extensions: {
    sourceNote: 'Die Quelltabelle überliefert drei feste Jahreszahlen (Rhydderch 1653, Mablen 1656, Rhovan 1659); alle übrigen Geburtsjahre wurden davon ausgehend mit einem gesunden Abstand von rund 25–30 Jahren zum jeweils ältesten Kind rückwärts (Elterngenerationen) bzw. vorwärts (jüngste, nach Aussehen datierte Generation) hochgerechnet. Anders als bei den Ritterhäusern vererbt sich die Kopfschaft bei diesem bürgerlichen Haus nicht nach starrer Erstgeburt, sondern nach Eignung (User-Vorgabe); daher wechselt sie zwischen Maelgorans zwei Söhnelinien hin und her: Tewrig und Odrith sind Geschwister, Rhydderch (Tewrigs Sohn) und Rhovan (Odriths Sohn) sind Cousins, dennoch folgen laut Hof-Tabelle beide unmittelbar aufeinander in der Erbfolge. Die Kette wurde per User-Vorgabe über die Quelltabelle hinaus fortgeschrieben: Rhovans vorgesehene Erbfolge ist Drystan, danach dessen Sohn Meirion (beide erhalten den Kopf-Kartenrahmen und einen entsprechenden Titel, obwohl Rhovan noch lebt und amtiert). Maelgorans dritter, namenloser Sohn/Tochter ist in der Quelle komplett ohne Namen und Portrait überliefert (nur ein unbeschriftetes „???"-Feld mit Dolch); das Geschlecht wurde mangels jeglicher Angabe angenommen. Cyrelle (Maelgorans Frau) und Mablen (Tewrigs Tochter) sind namentlich genannt, führen aber ebenfalls nur das unbeschriftete Platzhalterbild und bleiben daher portraitlos. Die beigefügte Grafik zeigt kein Baumdiagramm, sondern ein dekoratives Einzelporträt eines Familienmitglieds ohne Beschriftung und wurde daher nicht als Strukturquelle herangezogen; maßgeblich war die benannte Hof-/Hierarchietabelle. Wie bei den übrigen niederen Häusern wurden alle weiblichen Kernmitglieder mit unbenanntem, kinderlosem Ehepartner (die namenlose Tochter, Mablen, Talaneth, Anelen) systematisch als Wegverheiratete Linie mit Platzhalter „Unbekanntes Haus" markiert. Haus Gwyllach ist ein bürgerliches Haus (kein Rittergeschlecht) und sitzt daher außerhalb der LOWER_KNIGHT_HOUSE_DEFINITIONS, nutzt aber denselben generischen Gwynthor-Sitz wie die dortigen niederen Ritterhäuser. Es führt den eisernen Wappenrahmen; das Stand-Icon ist bis auf Weiteres ein Platzhalter (Page-Icon) laut ausdrücklicher User-Vorgabe. Externe Portraitquellen wurden als lokale Projektdateien gesichert.',
    blankFamily: false,
    sourceRevision: 1
  }
});
