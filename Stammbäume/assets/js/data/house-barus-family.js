import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { GWENDOLYNS_UFER_VASSAL_PROFILES } from './celtigerns-wacht-house-profiles.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_BARUS_PORTRAITS } from './house-barus-portraits.js';

const BARUS_EMBLEM = 'assets/images/houses/Gwendolyns Ufer/Ritterliche/Barus.png';
const BALCHDER_EMBLEM = 'assets/images/houses/Llamreis Ankunft/haus-balchder.png';
const BARUS_HOUSE_ID = 'house-barus';

const HOUSE_HEAD_IDS = new Set(['martyn-barus', 'macsen-barus']);
const MAIN_LINE_IDS = new Set(['wyett-barus']);

function lineageRoleFor(personId) {
  if (HOUSE_HEAD_IDS.has(personId)) return 'head';
  return MAIN_LINE_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', houseId = BARUS_HOUSE_ID, options = {}) {
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    houseId,
    portrait: HOUSE_BARUS_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === BARUS_HOUSE_ID ? 'core' : 'married'),
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

const MARTYN_IDS = ['martyn-barus', 'unknown-spouse-martyn-barus'];
const MACSEN_IDS = ['macsen-barus', 'unknown-spouse-macsen-barus'];
const ARIANWEN_IDS = ['arianwen-barus', 'unknown-spouse-arianwen-barus'];
const MADOC_IDS = ['madoc-barus', 'unknown-spouse-madoc-barus'];
// Reihenfolge und ID entsprechen der kanonischen Balchder-Gegenakte.
const WYETT_IDS = ['cerrin-balchder', 'wyett-barus'];
const ISOLDE_IDS = ['isolde-barus', 'unknown-spouse-isolde-barus'];
const LLAWEN_IDS = ['llawen-barus', 'unknown-spouse-llawen-barus'];
const MABON_IDS = ['mabon-barus', 'unknown-spouse-mabon-barus'];

export const HOUSE_BARUS_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-barus',
    title: 'Haus Barus',
    motto: '',
    description: 'Das maritime Ritterhaus Barus aus Abergwint gründet seinen Einfluss auf Handel, Flotte, Kapital und verlässlich erfüllte Verträge.',
    emblem: BARUS_EMBLEM,
    houseProfile: GWENDOLYNS_UFER_VASSAL_PROFILES.barus
  },
  houses: [
    house(BARUS_HOUSE_ID, 'Haus Barus', BARUS_EMBLEM),
    house('house-balchder', 'Haus Balchder', BALCHDER_EMBLEM),
    house('house-unbekannt-arianwen-barus', 'Unbekanntes Haus'),
    house('house-unbekannt-isolde-barus', 'Unbekanntes Haus'),
    house('house-unbekannt-llawen-barus', 'Unbekanntes Haus')
  ],
  persons: [
    person('martyn-barus', 'Martyn Barus', 'male', '????', '????', BARUS_HOUSE_ID, {
      status: 'dead',
      title: 'Gründer und erster Ritterherr des Hauses Barus',
      notes: 'Begründete das aus einer wohlhabenden Abergwinter Kaufmannsfamilie hervorgegangene Ritterhaus Barus.'
    }),
    unknownSpouse(
      'unknown-spouse-martyn-barus',
      'female',
      'Martyns Ehefrau ist nur als verstorbene, namenlose Gründerin überliefert.'
    ),

    person('macsen-barus', 'Macsen Barus', 'male', '????', '', BARUS_HOUSE_ID, {
      title: 'Ritterherr des Hauses Barus · Oberkaufmann und oberster Verwalter',
      notes: 'Vertritt die Interessen der Klingenden Münze in weiten Teilen der Baronie und verbindet Adelstitel, Handel, Verwaltung und Vertragswesen.'
    }),
    unknownSpouse(
      'unknown-spouse-macsen-barus',
      'female',
      'Macsens Ehefrau ist nur als verstorbene, namenlose Partnerin überliefert.'
    ),
    person('arianwen-barus', 'Arianwen Barus', 'female', '????', '????', BARUS_HOUSE_ID, {
      status: 'dead',
      notes: 'Arianwen heiratete einen namentlich nicht überlieferten Mann und führt die Barus-Linie nicht fort.'
    }),
    unknownSpouse(
      'unknown-spouse-arianwen-barus',
      'male',
      'Arianwens Ehemann und dessen Herkunftshaus sind nicht überliefert.'
    ),
    person('madoc-barus', 'Madoc Barus', 'male', '????', '', BARUS_HOUSE_ID, {
      title: 'Ritter und Ausbilder des Hauses Barus',
      notes: 'Macsens jüngerer Bruder wahrt die ritterlichen Pflichten des Hauses und bildet dessen Nachwuchs in Disziplin und Waffenhandwerk aus.'
    }),
    unknownSpouse(
      'unknown-spouse-madoc-barus',
      'female',
      'Madocs Ehefrau ist nur als verstorbene, namenlose Partnerin überliefert.'
    ),

    person('wyett-barus', 'Wyett Barus', 'male', '1691', '', BARUS_HOUSE_ID, {
      title: 'Erster Erbe des Hauses Barus · Kriegsveteran',
      notes: 'Der Krieg hat ihn sichtbar gezeichnet; dennoch gilt er als kluger Kopf.'
    }),
    spouse('cerrin-balchder', 'Cerrin Balchder', 'female', '1697', '', 'house-balchder', {
      notes: 'Cerrin heiratete Wyett Barus. Ihre Nachkommen werden in der Barus-Akte geführt.'
    }),
    person('isolde-barus', 'Isolde Barus', 'female', '????', '', BARUS_HOUSE_ID, {
      notes: 'Isolde heiratete einen namentlich nicht überlieferten Mann und führt die Barus-Linie nicht fort.'
    }),
    unknownSpouse(
      'unknown-spouse-isolde-barus',
      'male',
      'Isoldes Ehemann und dessen Herkunftshaus sind nicht überliefert.'
    ),
    person('llawen-barus', 'Llawen Barus', 'female', '????', '', BARUS_HOUSE_ID, {
      notes: 'Llawen heiratete einen namentlich nicht überlieferten Mann und führt die Barus-Linie nicht fort.'
    }),
    unknownSpouse(
      'unknown-spouse-llawen-barus',
      'male',
      'Llawens Ehemann und dessen Herkunftshaus sind nicht überliefert.'
    ),
    person('mabon-barus', 'Mabon Barus', 'male', '????', '', BARUS_HOUSE_ID, {
      title: 'Stellvertreter Macsen Barus’ in der Klingenden Münze',
      notes: 'Macsens Neffe führt Geschäfte, Verhandlungen und sensible Übergaben als beweglicher Arm des Oberkaufmanns.'
    }),
    unknownSpouse(
      'unknown-spouse-mabon-barus',
      'female',
      'Mabons Ehefrau ist nur als verstorbene, namenlose Partnerin überliefert.'
    ),

    person('haulwen-barus', 'Haulwen Barus', 'female', '1717'),
    person('ystwyth-barus', 'Ystwyth Barus', 'female', '1720'),
    person('math-barus', 'Math Barus', 'male', '1720'),
    person('lloyd-barus', 'Lloyd Barus', 'male', '1724')
  ],
  partnerships: [
    createMarriage('marriage-martyn-unknown-barus', ...MARTYN_IDS, { status: 'ended' }),
    createMarriage('marriage-macsen-unknown-barus', ...MACSEN_IDS, { status: 'widowed' }),
    createMarriage('marriage-arianwen-unknown-barus', ...ARIANWEN_IDS, { status: 'ended' }),
    createMarriage('marriage-madoc-unknown-barus', ...MADOC_IDS, { status: 'widowed' }),
    createMarriage('marriage-cerrin-wyett', ...WYETT_IDS),
    createMarriage('marriage-isolde-unknown-barus', ...ISOLDE_IDS, { status: 'widowed' }),
    createMarriage('marriage-llawen-unknown-barus', ...LLAWEN_IDS, { status: 'widowed' }),
    createMarriage('marriage-mabon-unknown-barus', ...MABON_IDS, { status: 'widowed' })
  ],
  parentages: [
    ...childrenOf(
      ['macsen-barus', 'arianwen-barus', 'madoc-barus'],
      MARTYN_IDS,
      'marriage-martyn-unknown-barus',
      {
        type: 'claimed',
        certainty: 'probable',
        notes: 'Mehrere nicht einzeln überlieferte Generationen verbinden das Gründerpaar mit Macsen, Arianwen und Madoc.',
        extensions: { timeJumpId: 'gap-martyn-macsen-barus' }
      }
    ),
    ...childrenOf(['wyett-barus', 'isolde-barus'], MACSEN_IDS, 'marriage-macsen-unknown-barus'),
    ...childrenOf(['llawen-barus', 'mabon-barus'], MADOC_IDS, 'marriage-madoc-unknown-barus'),
    ...childrenOf(['haulwen-barus', 'ystwyth-barus'], WYETT_IDS, 'marriage-cerrin-wyett'),
    ...childrenOf(['math-barus', 'lloyd-barus'], MABON_IDS, 'marriage-mabon-unknown-barus')
  ],
  lineage: {
    founderPartnershipId: 'marriage-martyn-unknown-barus',
    houseId: BARUS_HOUSE_ID,
    crestSubtitle: 'Maritimes Ritterhaus aus Abergwint',
    crestEmblemScale: 0.82,
    crestFrame: 'silver',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  cadetBranches: [
    createMarriedAwayBranch({
      id: 'married-away-unknown-arianwen-barus',
      name: 'Unbekanntes Haus',
      parentPartnershipId: 'marriage-arianwen-unknown-barus',
      houseId: 'house-unbekannt-arianwen-barus',
      targetFamilyId: 'haus-unbekannt',
      crestFrame: 'gold',
      notes: 'Arianwen Barus wurde an ein nicht näher überliefertes Haus verheiratet und führt die Barus-Linie nicht fort.'
    }),
    createMarriedAwayBranch({
      id: 'married-away-unknown-isolde-barus',
      name: 'Unbekanntes Haus',
      parentPartnershipId: 'marriage-isolde-unknown-barus',
      houseId: 'house-unbekannt-isolde-barus',
      targetFamilyId: 'haus-unbekannt',
      crestFrame: 'gold',
      notes: 'Isolde Barus wurde an ein nicht näher überliefertes Haus verheiratet und führt die Barus-Linie nicht fort.'
    }),
    createMarriedAwayBranch({
      id: 'married-away-unknown-llawen-barus',
      name: 'Unbekanntes Haus',
      parentPartnershipId: 'marriage-llawen-unknown-barus',
      houseId: 'house-unbekannt-llawen-barus',
      targetFamilyId: 'haus-unbekannt',
      crestFrame: 'gold',
      notes: 'Llawen Barus wurde an ein nicht näher überliefertes Haus verheiratet und führt die Barus-Linie nicht fort.'
    })
  ],
  timeJumps: [
    {
      id: 'gap-martyn-macsen-barus',
      parentPartnershipId: 'marriage-martyn-unknown-barus',
      parentPersonId: '',
      childIds: ['macsen-barus', 'arianwen-barus', 'madoc-barus'],
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
    focusPersonId: 'martyn-barus',
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    sourceNote: 'Genealogie, Lebensdaten, Hausdaten, Rollen und Portraitquellen nach der bereitgestellten Barus-Hausseite samt Stammbaumgrafik. Unter Martyns silbern gerahmtem Gründerwappen folgt genau ein absoluter serieller Überlieferungssprung zu Macsen, Arianwen und Madoc; er steht niemals parallel zu einem Personen- oder Hausknoten. Martyn und Macsen bilden die belegte Kopfschaft, Wyett die ausdrückliche Erbfolge. Ein einzelnes Kreuz bei Macsen in der Hierarchieleiste widerspricht der kreuzlosen Genealogie und seiner ausführlichen Gegenwartsbeschreibung als Ritterherr und Oberkaufmann; deshalb wird er als lebendes Oberhaupt geführt. Macsen ist Vater von Wyett und Isolde, Madoc Vater von Llawen und Mabon. Arianwen, Isolde und Llawen besitzen jeweils an ihrer belegten Ehe einen direkten Wegverheiratet-Knoten zu einem unbekannten Haus. Cerrin Balchder und Wyett Barus verwenden dieselben Weltpersonen, dieselbe Ehe und dieselben aktualisierten Portraitdateien wie in der Balchder-Gegenakte; ihre Kinder Haulwen und Ystwyth werden ausschließlich in der Barus-Akte geführt. Cerrins Herkunftswappen wird nicht als paralleler Kadetten- oder Wegverheiratet-Knoten dupliziert. Die vier Kinder der jüngsten Generation besitzen keine belegten Ehen oder Verlobungen und bleiben daher unverheiratet. Das Mottofeld und die Patronatsangabe sind nur Vorlagenplatzhalter und werden nicht als Hausdaten übernommen. Generische Silhouetten werden nicht als individuelle Portraitquellen importiert.',
    houseLore: {
      seat: 'Abergwint',
      estate: 'Großes Anwesen mit Lagerhallen und Docks im Hafendistrikt Abergwints; Handelskontor der Klingenden Münze, Garnison der Roten Kompanie, Komplex der Roten Bank und umfangreiche Handelsflotte',
      liegeHouse: 'Haus Gwyvern',
      benefactor: 'Haus Gwyvern',
      knightFather: 'Haus Draig',
      origin: 'Wohlhabende Abergwinter Kaufmannsfamilie, die ihren Aufstieg in den Ritterstand durch Landkauf, Bürgschaften und Verpflichtungen absicherte',
      ethnicity: 'Cenyri',
      wealth: 'Beschaulich',
      religion: 'Die Alerische Kirche',
      patrons: [],
      friends: [],
      feud: 'Keine offene Hausfehde; wirtschaftliche Konkurrenz mit dem Markt der Fortuna.',
      trade: ['Fernhandel', 'Reedereien', 'Hafenrechte', 'Lagerhäuser', 'Kreditlinien', 'Vertragswesen'],
      organizations: ['Klingende Münze', 'Rote Kompanie', 'Rote Bank'],
      tradition: 'Alle Sprösslinge erhalten eine ritterliche Ausbildung und den Ritterschlag, dienen dem Haus danach jedoch meist in verwaltenden, kaufmännischen oder maritimen Ämtern.'
    },
    blankFamily: false,
    sourceRevision: 1
  }
});
