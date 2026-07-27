import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { GWENDOLYNS_UFER_VASSAL_PROFILES } from './celtigerns-wacht-house-profiles.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_SELDRYN_PORTRAITS } from './house-seldryn-portraits.js';

const SELDRYN_EMBLEM = 'assets/images/houses/Gwendolyns Ufer/Ritterliche/Seldryn.png';
const BALCHDER_EMBLEM = 'assets/images/houses/Llamreis Ankunft/haus-balchder.png';
const SELDRYN_HOUSE_ID = 'house-seldryn';

const HOUSE_HEAD_IDS = new Set([
  'lugh-seldryn',
  'braint-seldryn'
]);

const MAIN_LINE_IDS = new Set([
  'cynon-seldryn',
  'hirlas-seldryn',
  'maelron-seldryn'
]);

function lineageRoleFor(personId) {
  if (HOUSE_HEAD_IDS.has(personId)) return 'head';
  return MAIN_LINE_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', houseId = SELDRYN_HOUSE_ID, options = {}) {
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    houseId,
    portrait: HOUSE_SELDRYN_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === SELDRYN_HOUSE_ID ? 'core' : 'married'),
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

function unknownSpouse(id, sex, notes) {
  return spouse(id, '???', sex, '????', '', '', {
    status: 'unknown',
    notes
  });
}

function house(id, name, emblem = '') {
  return { id, name, motto: '', emblem, status: 'active' };
}

function childrenOf(childIds, parentIds, partnershipId) {
  return createParentages(childIds, parentIds, partnershipId);
}

const LUGH_IDS = ['bronwen-balchder', 'lugh-seldryn'];
const BRAINT_IDS = ['braint-seldryn', 'unknown-spouse-braint-seldryn'];
const AELWEN_IDS = ['aelwen-seldryn', 'unknown-spouse-aelwen-seldryn'];
const YWAIN_IDS = ['ywain-seldryn', 'annarietta-schoenbergen'];
const CYNON_IDS = ['cynon-seldryn', 'unknown-spouse-cynon-seldryn'];
const CELYNNEN_IDS = ['celynnen-seldryn', 'unknown-spouse-celynnen-seldryn'];
const TAVIAN_IDS = ['tavian-seldryn', 'unknown-spouse-tavian-seldryn'];
const YSGAR_IDS = ['ysgar-seldryn', 'unknown-spouse-ysgar-seldryn'];
const HIRLAS_IDS = ['hirlas-seldryn', 'unknown-spouse-hirlas-seldryn'];

export const HOUSE_SELDRYN_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-seldryn',
    title: 'Haus Seldryn',
    motto: '',
    description: 'Das junge Ritterhaus Seldryn aus Abergwint verbindet den Dienst am Schwert mit der Gelehrten- und Forschertradition des Lebenszirkels.',
    emblem: SELDRYN_EMBLEM,
    houseProfile: GWENDOLYNS_UFER_VASSAL_PROFILES.seldryn
  },
  houses: [
    house(SELDRYN_HOUSE_ID, 'Haus Seldryn', SELDRYN_EMBLEM),
    house('house-balchder', 'Haus Balchder', BALCHDER_EMBLEM),
    house('house-schoenbergen', 'Haus Schönbergen'),
    house('house-unbekannt-aelwen-seldryn', 'Unbekanntes Haus'),
    house('house-unbekannt-celynnen-seldryn', 'Unbekanntes Haus')
  ],
  persons: [
    person('lugh-seldryn', 'Lugh Seldryn', 'male', '1650', '1720', SELDRYN_HOUSE_ID, {
      title: 'Gründer und erster Ritterherr des Hauses Seldryn',
      notes: 'Begründete Haus Seldryn durch seinen Ritterschlag im Dienst Haus Gwyverns; fiel 1720 im großen Krieg in Ceitheach.',
      extensions: { registryManagedFields: ['portrait', 'title', 'notes'] }
    }),
    spouse('bronwen-balchder', 'Bronwen Balchder', 'female', '1653', '1719', 'house-balchder'),

    person('braint-seldryn', 'Braint Seldryn', 'male', '1673', '', SELDRYN_HOUSE_ID, {
      title: 'Ritterherr des Hauses Seldryn',
      notes: 'Wurde von seinem Vater im ritterlichen Handwerk ausgebildet und verkörpert den Schwertdienst innerhalb des Hauses.'
    }),
    unknownSpouse(
      'unknown-spouse-braint-seldryn',
      'female',
      'Braints Ehefrau ist in der Quelle nur als namenlose Partnerin überliefert.'
    ),
    person('aelwen-seldryn', 'Aelwen Seldryn', 'female', '1675', '', SELDRYN_HOUSE_ID, {
      notes: 'Aelwen wurde an einen unbekannten Mann aus einem nicht überlieferten Haus verheiratet und führt die Seldryn-Linie nicht fort.'
    }),
    unknownSpouse(
      'unknown-spouse-aelwen-seldryn',
      'male',
      'Aelwens Ehemann und dessen Haus sind nicht überliefert.'
    ),
    person('ywain-seldryn', 'Ywain Seldryn', 'male', '1676', '', SELDRYN_HOUSE_ID, {
      title: 'Direktor des Lebenszirkels in Abergwint',
      notes: 'Studierte seit seinem zehnten Lebensjahr in Goldmund und leitet später den großen Standort des Lebenszirkels in Abergwint.'
    }),
    spouse('annarietta-schoenbergen', 'Annarietta Schönbergen', 'female', '????', '', 'house-schoenbergen', {
      title: 'Professorin am Lebenszirkel in Abergwint',
      notes: 'Stammt aus Goldmund auf Lothir, schloss als Beste ihres Jahrgangs ab und folgte Ywain nach Abergwint.'
    }),

    person('cynon-seldryn', 'Cynon Seldryn', 'male', '1697', '', SELDRYN_HOUSE_ID, {
      title: 'Erster Erbe des Hauses Seldryn'
    }),
    unknownSpouse(
      'unknown-spouse-cynon-seldryn',
      'female',
      'Cynons Ehefrau ist in der Quelle nur als namenlose Partnerin überliefert.'
    ),
    person('celynnen-seldryn', 'Celynnen Seldryn', 'female', '1698', '', SELDRYN_HOUSE_ID, {
      notes: 'Celynnen wurde an einen unbekannten Mann aus einem nicht überlieferten Haus verheiratet und führt die Seldryn-Linie nicht fort.'
    }),
    unknownSpouse(
      'unknown-spouse-celynnen-seldryn',
      'male',
      'Celynnens Ehemann und dessen Haus sind nicht überliefert.'
    ),
    person('tavian-seldryn', 'Tavian Seldryn', 'male', '1699'),
    unknownSpouse(
      'unknown-spouse-tavian-seldryn',
      'female',
      'Tavians Ehefrau ist in der Quelle nur als namenlose Partnerin überliefert.'
    ),
    person('ysgar-seldryn', 'Ysgar Seldryn', 'male', '1701', '', SELDRYN_HOUSE_ID, {
      notes: 'Studierte am Lebenszirkel in Abergwint, näher am Haus und dessen Verpflichtungen.'
    }),
    unknownSpouse(
      'unknown-spouse-ysgar-seldryn',
      'female',
      'Ysgars Ehefrau ist in der Quelle nur als namenlose Partnerin überliefert.'
    ),

    person('hirlas-seldryn', 'Hirlas Seldryn', 'male', '1716', '', SELDRYN_HOUSE_ID, {
      title: 'Zweiter Erbe des Hauses Seldryn'
    }),
    unknownSpouse(
      'unknown-spouse-hirlas-seldryn',
      'female',
      'Hirlas Ehefrau ist in der Quelle nur als namenlose Partnerin überliefert.'
    ),
    person('elaine-seldryn', 'Elaine Seldryn', 'female', '1719'),
    person('maelron-seldryn', 'Maelron Seldryn', 'male', '1722', '', SELDRYN_HOUSE_ID, {
      title: 'Dritter Erbe des Hauses Seldryn'
    }),
    person('seith-seldryn', 'Seith Seldryn', 'male', '1722'),
    person('anest-seldryn', 'Anest Seldryn', 'female', '1726'),
    person('urien-seldryn', 'Urien Seldryn', 'male', '1728'),
    person('gwenfair-seldryn', 'Gwenfair Seldryn', 'female', '1732'),
    person('hefin-seldryn', 'Hefin Seldryn', 'male', '1735')
  ],
  partnerships: [
    createMarriage('marriage-bronwen-lugh', ...LUGH_IDS, {
      status: 'ended',
      extensions: { registryManagedFields: ['status'] }
    }),
    createMarriage('marriage-braint-unknown-seldryn', ...BRAINT_IDS),
    createMarriage('marriage-aelwen-unknown-seldryn', ...AELWEN_IDS),
    createMarriage('marriage-ywain-annarietta', ...YWAIN_IDS),
    createMarriage('marriage-cynon-unknown-seldryn', ...CYNON_IDS),
    createMarriage('marriage-celynnen-unknown-seldryn', ...CELYNNEN_IDS),
    createMarriage('marriage-tavian-unknown-seldryn', ...TAVIAN_IDS),
    createMarriage('marriage-ysgar-unknown-seldryn', ...YSGAR_IDS),
    createMarriage('marriage-hirlas-unknown-seldryn', ...HIRLAS_IDS)
  ],
  parentages: [
    ...childrenOf(['braint-seldryn', 'aelwen-seldryn', 'ywain-seldryn'], LUGH_IDS, 'marriage-bronwen-lugh'),
    ...childrenOf(['cynon-seldryn', 'celynnen-seldryn', 'tavian-seldryn'], BRAINT_IDS, 'marriage-braint-unknown-seldryn'),
    ...childrenOf(['ysgar-seldryn'], YWAIN_IDS, 'marriage-ywain-annarietta'),
    ...childrenOf(['hirlas-seldryn', 'elaine-seldryn', 'maelron-seldryn'], CYNON_IDS, 'marriage-cynon-unknown-seldryn'),
    ...childrenOf(['seith-seldryn', 'anest-seldryn'], TAVIAN_IDS, 'marriage-tavian-unknown-seldryn'),
    ...childrenOf(['urien-seldryn', 'gwenfair-seldryn'], YSGAR_IDS, 'marriage-ysgar-unknown-seldryn'),
    ...childrenOf(['hefin-seldryn'], HIRLAS_IDS, 'marriage-hirlas-unknown-seldryn')
  ],
  lineage: {
    founderPartnershipId: 'marriage-bronwen-lugh',
    houseId: SELDRYN_HOUSE_ID,
    crestSubtitle: 'Ritterhaus aus Abergwint',
    crestEmblemScale: 0.82,
    crestFrame: 'silver',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  cadetBranches: [
    createMarriedAwayBranch({
      id: 'married-away-unknown-aelwen-seldryn',
      name: 'Unbekanntes Haus',
      parentPartnershipId: 'marriage-aelwen-unknown-seldryn',
      houseId: 'house-unbekannt-aelwen-seldryn',
      targetFamilyId: 'haus-unbekannt',
      crestFrame: 'gold',
      notes: 'Aelwen Seldryn wurde an ein nicht näher überliefertes Haus verheiratet und führt die Seldryn-Linie nicht fort.'
    }),
    createMarriedAwayBranch({
      id: 'married-away-unknown-celynnen-seldryn',
      name: 'Unbekanntes Haus',
      parentPartnershipId: 'marriage-celynnen-unknown-seldryn',
      houseId: 'house-unbekannt-celynnen-seldryn',
      targetFamilyId: 'haus-unbekannt',
      crestFrame: 'gold',
      notes: 'Celynnen Seldryn wurde an ein nicht näher überliefertes Haus verheiratet und führt die Seldryn-Linie nicht fort.'
    })
  ],
  timeJumps: [],
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'lugh-seldryn',
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    sourceNote: 'Genealogie, Hausdaten, Rollen und Portraitquellen nach der bereitgestellten Seldryn-Hausseite samt Stammbaumgrafik. Die Linie ist von Lugh und Bronwen bis Hefin lückenlos überliefert und enthält daher keinen Zeitsprung. Die Hofübersicht nennt für Lugh abweichend das Geburtsjahr 1680; Hierarchie, Balchder-Gegenakte und die Geburt Braints 1673 belegen 1650. Die Schreibweise „Browen“ in einer Tabellenzeile wurde zur mehrfach belegten Form Bronwen normalisiert. Der historische Figurenkopf schreibt einmal „Yvain“, während Hierarchie und Beschreibung Ywain verwenden. Aelwen und Celynnen führen keine Seldryn-Nachkommen und besitzen deshalb an ihren Ehen direkte Wegverheiratet-Knoten zu unbekannten Häusern. Die jüngste Generation bleibt ohne erfundene Partnerschaften. Lugh und Bronwen verwenden dieselben Weltpersonen und dieselbe Ehe wie Haus Balchder; Lughs neueres, ausdrücklich in der Seldryn-Quelle zugeordnetes Portrait wird in beiden Akten synchron verwendet. Generische Silhouetten und unbeschriftete Dienerschaft werden nicht als individuelle Portraits oder Personen importiert.',
    houseLore: {
      seat: 'Abergwint',
      estate: 'Anwesen im Adelsdistrikt von Abergwint',
      liegeHouse: 'Haus Gwyvern',
      benefactor: 'Haus Gwyvern',
      knightFather: 'Nicht namentlich überlieferter Baron von Abergwint',
      ethnicity: 'Cenyri',
      wealth: 'Beschaulich',
      religion: 'Die Alerische Kirche',
      patrons: ['Der Mentor', 'Der Templer'],
      feud: 'Spannungen mit traditionellen Ritterhäusern, die Gelehrsamkeit als Schwäche betrachten.',
      trade: ['Naturforschung', 'Kartographie', 'Fachliteratur', 'Expeditionsplanung', 'Leitung des Lebenszirkels in Abergwint'],
      tradition: 'Eignung steht über Herkunft. Ritterlicher und wissenschaftlicher Weg gelten als gleichwertig; Wissen wird als Werkzeug zum Schutz und zur Ordnung der Welt verstanden.'
    },
    blankFamily: false,
    sourceRevision: 1
  }
});
