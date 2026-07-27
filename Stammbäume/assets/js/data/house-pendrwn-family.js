import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { createFounderTimeJumpPlaceholderHouseFamily } from './blank-house-family-factory.js';
import { GWYNTHOR_COMMONER_HOUSE_PROFILES } from './celtigerns-wacht-house-profiles.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_PENDRWN_PORTRAITS } from './house-pendrwn-portraits.js';
import {
  PENDRWN_DRAENMELYN_MARRIAGE,
  PENDRWN_SWYLL_MARRIAGE
} from './pendrwn-cross-family-marriages.js';

const PENDRWN_HOUSE_ID = 'house-pendrwn';
const PENDRWN_EMBLEM = 'assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Pendrwn.png';
const DRAENMELYN_EMBLEM = 'assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Draenmelyn.png';

const BASE_FAMILY = createFounderTimeJumpPlaceholderHouseFamily({
  id: 'haus-pendrwn',
  title: 'Haus Pendrwn',
  emblem: PENDRWN_EMBLEM,
  houseProfile: GWYNTHOR_COMMONER_HOUSE_PROFILES.pendrwn,
  description: 'Ein kleines bürgerliches Haus aus Gwynthor, dessen konkrete Linie nur bis zu Tudwal Pendrwns Großvater zurückreicht.',
  toYear: '1661',
  timeJumpLabel: 'Die belegte Pendrwn-Linie setzt mit Idwals Generation um 1661 wieder ein',
  pendingDescendantReview: false
});

function person(id, name, sex, birth = '????', houseId = PENDRWN_HOUSE_ID, options = {}) {
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death: options.death || '',
    status: options.status || '',
    houseId,
    familyRole: options.familyRole || (houseId === PENDRWN_HOUSE_ID ? 'core' : 'married'),
    lineageRole: options.lineageRole || 'branch',
    title: options.title || '',
    portrait: options.portrait || HOUSE_PENDRWN_PORTRAITS[id] || '',
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

const FOUNDER_IDS = BASE_FAMILY.partnerships[0].participantIds;
const TIME_JUMP_ID = BASE_FAMILY.timeJumps[0].id;
const GRANDPARENT_IDS = ['idwal-pendrwn', 'bronwen-spouse-pendrwn'];

export const HOUSE_PENDRWN_FAMILY = Object.freeze({
  ...BASE_FAMILY,
  houses: Object.freeze([
    ...BASE_FAMILY.houses,
    Object.freeze({
      id: 'house-swyll',
      name: 'Haus Swyll',
      motto: '',
      emblem: 'assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Swyll.png',
      status: 'active'
    }),
    Object.freeze({
      id: 'house-draenmelyn',
      name: 'Haus Draenmelyn',
      motto: '',
      emblem: DRAENMELYN_EMBLEM,
      status: 'active'
    })
  ]),
  persons: Object.freeze([
    ...BASE_FAMILY.persons,

    // Höchste konkrete Generation: Tudwals Großeltern.
    person('idwal-pendrwn', 'Idwal Pendrwn', 'male', '1661', PENDRWN_HOUSE_ID, {
      lineageRole: 'head',
      title: 'Ältestes überliefertes Oberhaupt des Hauses Pendrwn'
    }),
    person('bronwen-spouse-pendrwn', 'Bronwen', 'female', '1665', '', {
      familyRole: 'married'
    }),

    // Elternlinie und eine kleine, beidseitig verknüpfte Tante.
    sharedPerson(PENDRWN_SWYLL_MARRIAGE.first, 'core'),
    sharedPerson(PENDRWN_SWYLL_MARRIAGE.second, 'married'),
    sharedPerson(PENDRWN_DRAENMELYN_MARRIAGE.first, 'core'),
    sharedPerson(PENDRWN_DRAENMELYN_MARRIAGE.second, 'married'),

    // Jüngste Generation: alle ausdrücklich ohne Ehe oder Verlobung.
    person('tudwal-pendrwn', 'Tudwal Pendrwn', 'male', '1717', PENDRWN_HOUSE_ID, {
      title: 'Dreiundzwanzigjähriger Angehöriger des Hauses Pendrwn',
      tags: ['23 Jahre'],
      notes: 'Unverheiratet und ohne Verlobung; zentrale Person der jüngsten Pendrwn-Generation.'
    }),
    person('enid-pendrwn', 'Enid Pendrwn', 'female', '1720', PENDRWN_HOUSE_ID, {
      title: 'Jüngere Schwester Tudwals',
      notes: 'Unverheiratet und ohne Verlobung.'
    }),
    person('cadell-pendrwn', 'Cadell Pendrwn', 'male', '1723', PENDRWN_HOUSE_ID, {
      title: 'Jüngerer Bruder Tudwals',
      notes: 'Unverheiratet und ohne Verlobung.'
    })
  ]),
  partnerships: Object.freeze([
    ...BASE_FAMILY.partnerships,
    createMarriage('marriage-idwal-bronwen-pendrwn', ...GRANDPARENT_IDS),
    createMarriage(PENDRWN_SWYLL_MARRIAGE.id, ...PENDRWN_SWYLL_MARRIAGE.participantIds),
    createMarriage(PENDRWN_DRAENMELYN_MARRIAGE.id, ...PENDRWN_DRAENMELYN_MARRIAGE.participantIds)
  ]),
  parentages: Object.freeze([
    ...createParentages(['idwal-pendrwn'], FOUNDER_IDS, BASE_FAMILY.lineage.founderPartnershipId, {
      type: 'claimed',
      certainty: 'probable',
      notes: 'Nicht einzeln überlieferte Generationen verbinden das Gründerpaar mit Idwal Pendrwn.',
      extensions: { timeJumpId: TIME_JUMP_ID }
    }),
    ...createParentages(
      ['meilyr-pendrwn', 'gwenith-pendrwn'],
      GRANDPARENT_IDS,
      'marriage-idwal-bronwen-pendrwn'
    ),
    ...createParentages(
      ['tudwal-pendrwn', 'enid-pendrwn', 'cadell-pendrwn'],
      PENDRWN_SWYLL_MARRIAGE.participantIds,
      PENDRWN_SWYLL_MARRIAGE.id
    )
  ]),
  cadetBranches: Object.freeze([
    createMarriedAwayBranch({
      id: 'married-away-draenmelyn-gwenith-pendrwn',
      name: 'Haus Draenmelyn',
      parentPartnershipId: PENDRWN_DRAENMELYN_MARRIAGE.id,
      houseId: 'house-draenmelyn',
      targetFamilyId: 'haus-draenmelyn',
      emblem: DRAENMELYN_EMBLEM,
      crestFrame: 'iron',
      notes: 'Gwenith Pendrwn wurde an Caradog Draenmelyn verheiratet; dieselbe Ehe wird in der Draenmelyn-Gegenakte geführt.'
    })
  ]),
  timeJumps: Object.freeze([
    Object.freeze({
      ...BASE_FAMILY.timeJumps[0],
      childIds: Object.freeze(['idwal-pendrwn']),
      toYear: '1661',
      label: 'Die belegte Pendrwn-Linie setzt mit Idwals Generation um 1661 wieder ein',
      notes: 'Der Zeitsprung bleibt der alleinige absolute Generationentrenner unter dem Pendrwn-Wappen; die konkrete Linie beginnt erst mit Tudwals Großvater Idwal.',
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
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: Object.freeze({
    ...BASE_FAMILY.extensions,
    blankFamily: false,
    pendingDescendantReview: false,
    sourceRevision: 1,
    registryManagedViewFields: Object.freeze(['focusPersonId', 'limitGenerations']),
    sourceNote: 'Die konkrete Pendrwn-Linie reicht nur bis zu Tudwals Großvater Idwal. Tudwal ist im Jahr 1740 dreiundzwanzig Jahre alt; er und seine beiden jüngeren Geschwister bleiben unverheiratet und ohne Verlobung. Seine Mutter Eirwen Swyll und seine Tante Gweniths Ehe mit Caradog Draenmelyn werden mit gemeinsamen Weltpersonen- und Partnerschafts-IDs in den jeweiligen Gegenstammbäumen geführt. Das vorgegebene Portrait wurde lokal gesichert.'
  })
});
