import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { createFounderTimeJumpPlaceholderHouseFamily } from './blank-house-family-factory.js';
import { GWYNTHOR_COMMONER_HOUSE_PROFILES } from './celtigerns-wacht-house-profiles.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_TONNARTH_PORTRAITS } from './house-tonnarth-portraits.js';
import { TONNARTH_MAERLLYS_MARRIAGE } from './tonnarth-maerllys-marriage.js';

const TONNARTH_HOUSE_ID = 'house-tonnarth';
const TONNARTH_EMBLEM = 'assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Tonnarth.png';
const MAERLLYS_EMBLEM = 'assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Maerllys.png';

const BASE_FAMILY = createFounderTimeJumpPlaceholderHouseFamily({
  id: 'haus-tonnarth',
  title: 'Haus Tonnarth',
  emblem: TONNARTH_EMBLEM,
  houseProfile: GWYNTHOR_COMMONER_HOUSE_PROFILES.tonnarth,
  description: 'Ein kleines bürgerliches Haus aus Gwynthor, dessen jüngste Generation sich um Llewarch Tonnarth gruppiert.',
  toYear: '1663',
  timeJumpLabel: 'Die belegte Tonnarth-Linie setzt mit Idris und seinen Schwestern um 1663 wieder ein',
  pendingDescendantReview: false
});

function person(id, name, sex, birth = '????', houseId = TONNARTH_HOUSE_ID, options = {}) {
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death: options.death || '',
    status: options.status || '',
    houseId,
    familyRole: options.familyRole || (houseId === TONNARTH_HOUSE_ID ? 'core' : 'married'),
    lineageRole: options.lineageRole || 'branch',
    title: options.title || '',
    portrait: options.portrait || HOUSE_TONNARTH_PORTRAITS[id] || '',
    tags: options.tags || [],
    notes: options.notes || ''
  });
}

function sharedPerson(definition, familyRole) {
  return person(definition.id, definition.name, definition.sex, definition.birth, definition.houseId, {
    familyRole,
    title: definition.title,
    portrait: definition.portrait,
    notes: definition.notes
  });
}

function unknownHusband(id, houseId, wifeName) {
  return person(id, 'Unbekannter Ehemann', 'male', '????', houseId, {
    familyRole: 'married',
    status: 'unknown',
    title: `Ehemann von ${wifeName}`,
    notes: `Name und genaue Herkunft des Ehemanns von ${wifeName} sind nicht überliefert.`
  });
}

function house(id, name, emblem = '') {
  return Object.freeze({ id, name, motto: '', emblem, status: 'active' });
}

const FOUNDER_IDS = BASE_FAMILY.partnerships[0].participantIds;
const TIME_JUMP_ID = BASE_FAMILY.timeJumps[0].id;
const GRANDPARENT_IDS = ['idris-tonnarth', 'lowri-spouse-tonnarth'];
const PARENT_IDS = ['cadell-tonnarth', 'ceridwen-spouse-tonnarth'];
const GARETH_AFFAIR_IDS = ['gareth-tonnarth', 'mair-affair-tonnarth'];

const MARRIED_AWAY_RELATIONS = Object.freeze([
  Object.freeze({
    id: 'great-aunt-eira-tonnarth',
    personId: 'eira-tonnarth',
    spouseId: 'unknown-spouse-eira-tonnarth',
    partnershipId: 'marriage-eira-unknown-tonnarth',
    name: 'Eira Tonnarth',
    birth: '1665',
    note: 'Llewarchs Großtante Eira wurde an ein nicht überliefertes Haus verheiratet.'
  }),
  Object.freeze({
    id: 'great-aunt-tegwen-tonnarth',
    personId: 'tegwen-tonnarth',
    spouseId: 'unknown-spouse-tegwen-tonnarth',
    partnershipId: 'marriage-tegwen-unknown-tonnarth',
    name: 'Tegwen Tonnarth',
    birth: '1668',
    note: 'Llewarchs Großtante Tegwen wurde an ein nicht überliefertes Haus verheiratet.'
  }),
  Object.freeze({
    id: 'aunt-anwen-tonnarth',
    personId: 'anwen-tonnarth',
    spouseId: 'unknown-spouse-anwen-tonnarth',
    partnershipId: 'marriage-anwen-unknown-tonnarth',
    name: 'Anwen Tonnarth',
    birth: '1690',
    note: 'Llewarchs Tante Anwen wurde an ein nicht überliefertes Haus verheiratet.'
  })
]);

const MARRIED_AWAY_PEOPLE = Object.freeze(MARRIED_AWAY_RELATIONS.flatMap(relation => {
  const houseId = `house-unbekannt-${relation.id}`;
  return [
    person(relation.personId, relation.name, 'female', relation.birth, TONNARTH_HOUSE_ID, {
      notes: relation.note
    }),
    unknownHusband(relation.spouseId, houseId, relation.name)
  ];
}));

export const HOUSE_TONNARTH_FAMILY = Object.freeze({
  ...BASE_FAMILY,
  houses: Object.freeze([
    ...BASE_FAMILY.houses,
    house('house-maerllys', 'Haus Maerllys', MAERLLYS_EMBLEM),
    ...MARRIED_AWAY_RELATIONS.map(relation => (
      house(`house-unbekannt-${relation.id}`, 'Unbekanntes Haus')
    ))
  ]),
  persons: Object.freeze([
    ...BASE_FAMILY.persons,

    // Llewarchs Großeltern und zwei wegverheiratete Großtanten.
    person('idris-tonnarth', 'Idris Tonnarth', 'male', '1663', TONNARTH_HOUSE_ID, {
      lineageRole: 'head',
      title: 'Ältestes überliefertes Oberhaupt des Hauses Tonnarth'
    }),
    person('lowri-spouse-tonnarth', 'Lowri', 'female', '1666', '', {
      familyRole: 'married',
      title: 'Großmutter Llewarch Tonnarths'
    }),
    ...MARRIED_AWAY_PEOPLE.slice(0, 4),

    // Eltern, eine wegverheiratete Tante und zwei Onkel.
    person('cadell-tonnarth', 'Cadell Tonnarth', 'male', '1688', TONNARTH_HOUSE_ID, {
      title: 'Vater Llewarch Tonnarths'
    }),
    person('ceridwen-spouse-tonnarth', 'Ceridwen', 'female', '1690', '', {
      familyRole: 'married',
      title: 'Mutter Llewarch Tonnarths'
    }),
    ...MARRIED_AWAY_PEOPLE.slice(4),
    sharedPerson(TONNARTH_MAERLLYS_MARRIAGE.first, 'core'),
    sharedPerson(TONNARTH_MAERLLYS_MARRIAGE.second, 'married'),
    person('gareth-tonnarth', 'Gareth Tonnarth', 'male', '1695', TONNARTH_HOUSE_ID, {
      title: 'Lediger Onkel Llewarchs',
      notes: 'Blieb unverheiratet; aus seiner beendeten Affäre mit Mair ging ein nicht ehelicher Sohn hervor.'
    }),
    person('mair-affair-tonnarth', 'Mair', 'female', '1697', '', {
      familyRole: 'affair',
      title: 'Affäre Gareth Tonnarths',
      notes: 'Mutter von Gareths nicht ehelichem Sohn Caradog.'
    }),

    // Llewarch und seine vier unverheirateten Geschwister.
    person('iorwerth-tonnarth', 'Iorwerth Tonnarth', 'male', '1712', TONNARTH_HOUSE_ID, {
      title: 'Älterer Bruder Llewarchs',
      notes: 'Unverheiratet und ohne Verlobung.'
    }),
    person('llewarch-tonnarth', 'Llewarch Tonnarth', 'male', '1715', TONNARTH_HOUSE_ID, {
      title: 'Angehöriger des Hauses Tonnarth',
      tags: ['25 Jahre'],
      notes: 'Im Jahr 1740 fünfundzwanzig Jahre alt; unverheiratet und ohne Verlobung.'
    }),
    person('gwenllian-tonnarth', 'Gwenllian Tonnarth', 'female', '1717', TONNARTH_HOUSE_ID, {
      title: 'Jüngere Schwester Llewarchs',
      notes: 'Unverheiratet und ohne Verlobung.'
    }),
    person('elowen-tonnarth', 'Elowen Tonnarth', 'female', '1720', TONNARTH_HOUSE_ID, {
      title: 'Jüngere Schwester Llewarchs',
      notes: 'Unverheiratet und ohne Verlobung.'
    }),
    person('rhys-tonnarth', 'Rhys Tonnarth', 'male', '1722', TONNARTH_HOUSE_ID, {
      title: 'Jüngerer Bruder Llewarchs',
      notes: 'Unverheiratet und ohne Verlobung.'
    }),

    // Drei Vettern aus Madocs Ehe mit Rhoswen Maerllys.
    person('bryn-tonnarth', 'Bryn Tonnarth', 'male', '1714', TONNARTH_HOUSE_ID, {
      title: 'Vetter Llewarchs'
    }),
    person('emrys-tonnarth', 'Emrys Tonnarth', 'male', '1717', TONNARTH_HOUSE_ID, {
      title: 'Vetter Llewarchs'
    }),
    person('aled-tonnarth', 'Aled Tonnarth', 'male', '1720', TONNARTH_HOUSE_ID, {
      title: 'Vetter Llewarchs'
    }),

    // Gareths Bastard ist eindeutig seiner einzigen belegten Affäre zugeordnet.
    person('caradog-bastard-tonnarth', 'Caradog Tonnarth', 'male', '1718', TONNARTH_HOUSE_ID, {
      familyRole: 'bastard',
      title: 'Bastard aus Gareths Affäre mit Mair',
      notes: 'Nicht ehelicher Sohn Gareth Tonnarths und Mairs.'
    })
  ]),
  partnerships: Object.freeze([
    ...BASE_FAMILY.partnerships,
    createMarriage('marriage-idris-lowri-tonnarth', ...GRANDPARENT_IDS),
    ...MARRIED_AWAY_RELATIONS.map(relation => (
      createMarriage(relation.partnershipId, relation.personId, relation.spouseId)
    )),
    createMarriage('marriage-cadell-ceridwen-tonnarth', ...PARENT_IDS),
    createMarriage(TONNARTH_MAERLLYS_MARRIAGE.id, ...TONNARTH_MAERLLYS_MARRIAGE.participantIds),
    createMarriage('affair-gareth-mair-tonnarth', ...GARETH_AFFAIR_IDS, {
      type: 'affair',
      status: 'ended',
      notes: 'Gareths beendete Affäre mit Mair; aus ihr ging Caradog hervor.'
    })
  ]),
  parentages: Object.freeze([
    ...createParentages(
      ['idris-tonnarth', 'eira-tonnarth', 'tegwen-tonnarth'],
      FOUNDER_IDS,
      BASE_FAMILY.lineage.founderPartnershipId,
      {
        type: 'claimed',
        certainty: 'probable',
        notes: 'Nicht einzeln überlieferte Generationen verbinden das Gründerpaar mit Idris, Eira und Tegwen.',
        extensions: { timeJumpId: TIME_JUMP_ID }
      }
    ),
    ...createParentages(
      ['cadell-tonnarth', 'anwen-tonnarth', 'madoc-tonnarth', 'gareth-tonnarth'],
      GRANDPARENT_IDS,
      'marriage-idris-lowri-tonnarth'
    ),
    ...createParentages(
      ['iorwerth-tonnarth', 'llewarch-tonnarth', 'gwenllian-tonnarth', 'elowen-tonnarth', 'rhys-tonnarth'],
      PARENT_IDS,
      'marriage-cadell-ceridwen-tonnarth'
    ),
    ...createParentages(
      ['bryn-tonnarth', 'emrys-tonnarth', 'aled-tonnarth'],
      TONNARTH_MAERLLYS_MARRIAGE.participantIds,
      TONNARTH_MAERLLYS_MARRIAGE.id
    ),
    ...createParentages(
      ['caradog-bastard-tonnarth'],
      GARETH_AFFAIR_IDS,
      'affair-gareth-mair-tonnarth',
      {
        legitimacy: 'illegitimate',
        notes: 'Nicht eheliches Kind aus Gareth Tonnarths Affäre mit Mair.'
      }
    )
  ]),
  cadetBranches: Object.freeze(MARRIED_AWAY_RELATIONS.map(relation => (
    createMarriedAwayBranch({
      id: `married-away-${relation.id}`,
      name: 'Unbekanntes Haus',
      parentPartnershipId: relation.partnershipId,
      houseId: `house-unbekannt-${relation.id}`,
      targetFamilyId: 'haus-unbekannt',
      crestFrame: 'gold',
      notes: relation.note
    })
  ))),
  timeJumps: Object.freeze([
    Object.freeze({
      ...BASE_FAMILY.timeJumps[0],
      childIds: Object.freeze(['idris-tonnarth', 'eira-tonnarth', 'tegwen-tonnarth']),
      toYear: '1663',
      label: 'Die belegte Tonnarth-Linie setzt mit Idris und seinen Schwestern um 1663 wieder ein',
      notes: 'Der Zeitsprung bleibt der alleinige absolute Generationentrenner unter dem Tonnarth-Wappen; Idris und seine beiden Schwestern folgen erst geschlossen dahinter.',
      extensions: Object.freeze({
        ...BASE_FAMILY.timeJumps[0].extensions,
        registryManagedFields: Object.freeze([
          'parentPartnershipId',
          'parentPersonId',
          'childIds',
          'fromYear',
          'toYear',
          'label',
          'notes'
        ])
      })
    })
  ]),
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: BASE_FAMILY.view.focusPersonId,
    orientation: 'vertical',
    ancestorDepth: 24,
    descendantDepth: 24,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: Object.freeze({
    ...BASE_FAMILY.extensions,
    blankFamily: false,
    pendingDescendantReview: false,
    sourceRevision: 1,
    registryManagedViewFields: Object.freeze(['focusPersonId', 'limitGenerations']),
    sourceNote: 'Llewarch Tonnarth ist im Jahr 1740 fünfundzwanzig Jahre alt und besitzt vier unverheiratete Geschwister. Die konkrete Linie reicht nur bis zu seinem Großvater Idris; dessen Schwestern Eira und Tegwen sowie Llewarchs Tante Anwen sind mit direkten Zielhausknoten wegverheiratet. Madoc Tonnarth und Rhoswen Maerllys haben die drei Söhne Bryn, Emrys und Aled; ihre Ehe wird in der Maerllys-Gegenakte gespiegelt. Der ledige Onkel Gareth besitzt ausschließlich eine beendete Affäre mit Mair, aus der der eindeutig zugeordnete Bastard Caradog hervorging. Das vorgegebene Llewarch-Porträt wurde lokal gesichert.'
  })
});
