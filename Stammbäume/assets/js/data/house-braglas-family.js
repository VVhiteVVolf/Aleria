import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { AELMOR_BRAGLAS_MARRIAGE } from './aelmor-braglas-marriage.js';
import { createFounderTimeJumpPlaceholderHouseFamily } from './blank-house-family-factory.js';
import { GWYNTHOR_COMMONER_HOUSE_PROFILES } from './celtigerns-wacht-house-profiles.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';

const BRAGLAS_HOUSE_ID = 'house-braglas';
const BRAGLAS_EMBLEM = 'assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Braglas.png';
const UNKNOWN_ELEN_HOUSE_ID = 'house-unbekannt-elen-braglas';
const ELEN_MARRIAGE_ID = 'marriage-elen-unknown-braglas';

const BASE_FAMILY = createFounderTimeJumpPlaceholderHouseFamily({
  id: 'haus-braglas',
  title: 'Haus Braglas',
  emblem: BRAGLAS_EMBLEM,
  houseProfile: GWYNTHOR_COMMONER_HOUSE_PROFILES.braglas,
  description: 'Ein kleines bürgerliches Haus aus Gwynthor mit höchstens drei Linien unter der Großelterngeneration.',
  toYear: '1664',
  timeJumpLabel: 'Die belegte Braglas-Linie setzt mit Ifor und Elen um 1664 wieder ein',
  pendingDescendantReview: false
});

function person(id, name, sex, birth = '????', houseId = BRAGLAS_HOUSE_ID, options = {}) {
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death: options.death || '',
    status: options.status || '',
    houseId,
    familyRole: options.familyRole || (houseId === BRAGLAS_HOUSE_ID ? 'core' : 'married'),
    lineageRole: options.lineageRole || 'branch',
    title: options.title || '',
    portrait: options.portrait || '',
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
const GRANDPARENT_IDS = ['ifor-braglas', 'morfydd-spouse-braglas'];
const PARENT_IDS = ['cadfan-braglas', 'tegwen-spouse-braglas'];

export const HOUSE_BRAGLAS_FAMILY = Object.freeze({
  ...BASE_FAMILY,
  houses: Object.freeze([
    ...BASE_FAMILY.houses,
    Object.freeze({
      id: 'house-aelmor',
      name: 'Haus Aelmor',
      motto: '',
      emblem: 'assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Aelmor.png',
      status: 'active'
    }),
    Object.freeze({
      id: UNKNOWN_ELEN_HOUSE_ID,
      name: 'Unbekanntes Haus',
      motto: '',
      emblem: '',
      status: 'active'
    })
  ]),
  persons: Object.freeze([
    ...BASE_FAMILY.persons,

    // Höchste konkrete Generation: Großeltern und eine wegverheiratete Großtante.
    person('ifor-braglas', 'Ifor Braglas', 'male', '1664', BRAGLAS_HOUSE_ID, {
      lineageRole: 'head',
      title: 'Ältestes überliefertes Oberhaupt des Hauses Braglas'
    }),
    person('morfydd-spouse-braglas', 'Morfydd', 'female', '1668', '', {
      familyRole: 'married'
    }),
    person('elen-braglas', 'Elen Braglas', 'female', '1667', BRAGLAS_HOUSE_ID, {
      title: 'Wegverheiratete Großtante der jüngsten Braglas-Generation',
      notes: 'Schwester Ifor Braglas’; wurde an ein nicht überliefertes Haus verheiratet.'
    }),
    person('unknown-spouse-elen-braglas', 'Unbekannter Ehemann', 'male', '????', UNKNOWN_ELEN_HOUSE_ID, {
      familyRole: 'married',
      status: 'unknown',
      title: 'Ehemann Elen Braglas’'
    }),

    // Genau drei männliche Geschwisterlinien unter Ifor und Morfydd.
    person('cadfan-braglas', 'Cadfan Braglas', 'male', '1689', BRAGLAS_HOUSE_ID, {
      title: 'Fortführer der Braglas-Hauptlinie'
    }),
    person('tegwen-spouse-braglas', 'Tegwen', 'female', '1692', '', {
      familyRole: 'married'
    }),
    sharedPerson(AELMOR_BRAGLAS_MARRIAGE.first, 'core'),
    sharedPerson(AELMOR_BRAGLAS_MARRIAGE.second, 'married'),
    person('meurig-braglas', 'Meurig Braglas', 'male', '1695', BRAGLAS_HOUSE_ID, {
      title: 'Lediger Seitenzweig des Hauses Braglas',
      notes: 'Blieb unverheiratet und ohne Kinder.'
    }),

    // Junge Sprösslinge der Hauptlinie.
    person('geraint-braglas', 'Geraint Braglas', 'male', '1714', BRAGLAS_HOUSE_ID, {
      title: 'Ältester Sohn Cadfan Braglas’',
      tags: ['26 Jahre'],
      notes: 'Unverheiratet und ohne Verlobung; führt die nächste Braglas-Generation an.'
    }),
    person('emyr-braglas', 'Emyr Braglas', 'male', '1723', BRAGLAS_HOUSE_ID, {
      title: 'Jüngerer Sohn Cadfan Braglas’',
      tags: ['17 Jahre'],
      notes: 'Unverheiratet und ohne Verlobung.'
    }),
    person('nerys-braglas', 'Nerys Braglas', 'female', '1731', BRAGLAS_HOUSE_ID, {
      title: 'Jüngste Tochter Cadfan Braglas’',
      tags: ['9 Jahre'],
      notes: 'Unverheiratet; ihre weitere Lebenslinie bleibt altersbedingt offen.'
    }),

    // Bryns männlicher Seitenzweig mit zwei unverheirateten Söhnen.
    person('madoc-braglas', 'Madoc Braglas', 'male', '1719', BRAGLAS_HOUSE_ID, {
      title: 'Sohn Bryn Braglas’ und Anwen Aelmors',
      tags: ['21 Jahre'],
      notes: 'Unverheiratet und ohne Verlobung.'
    }),
    person('iestyn-braglas', 'Iestyn Braglas', 'male', '1728', BRAGLAS_HOUSE_ID, {
      title: 'Jüngerer Sohn Bryn Braglas’ und Anwen Aelmors',
      tags: ['12 Jahre'],
      notes: 'Unverheiratet; seine weitere Lebenslinie bleibt altersbedingt offen.'
    })
  ]),
  partnerships: Object.freeze([
    ...BASE_FAMILY.partnerships,
    createMarriage('marriage-ifor-morfydd-braglas', ...GRANDPARENT_IDS),
    createMarriage(ELEN_MARRIAGE_ID, 'elen-braglas', 'unknown-spouse-elen-braglas'),
    createMarriage('marriage-cadfan-tegwen-braglas', ...PARENT_IDS),
    createMarriage(AELMOR_BRAGLAS_MARRIAGE.id, ...AELMOR_BRAGLAS_MARRIAGE.participantIds)
  ]),
  parentages: Object.freeze([
    ...createParentages(
      ['ifor-braglas', 'elen-braglas'],
      FOUNDER_IDS,
      BASE_FAMILY.lineage.founderPartnershipId,
      {
        type: 'claimed',
        certainty: 'probable',
        notes: 'Nicht einzeln überlieferte Generationen verbinden das Gründerpaar mit Ifor und Elen.',
        extensions: { timeJumpId: TIME_JUMP_ID }
      }
    ),
    ...createParentages(
      ['cadfan-braglas', 'bryn-braglas', 'meurig-braglas'],
      GRANDPARENT_IDS,
      'marriage-ifor-morfydd-braglas'
    ),
    ...createParentages(
      ['geraint-braglas', 'emyr-braglas', 'nerys-braglas'],
      PARENT_IDS,
      'marriage-cadfan-tegwen-braglas'
    ),
    ...createParentages(
      ['madoc-braglas', 'iestyn-braglas'],
      AELMOR_BRAGLAS_MARRIAGE.participantIds,
      AELMOR_BRAGLAS_MARRIAGE.id
    )
  ]),
  cadetBranches: Object.freeze([
    createMarriedAwayBranch({
      id: 'married-away-unknown-elen-braglas',
      name: 'Unbekanntes Haus',
      parentPartnershipId: ELEN_MARRIAGE_ID,
      houseId: UNKNOWN_ELEN_HOUSE_ID,
      targetFamilyId: 'haus-unbekannt',
      crestFrame: 'gold',
      notes: 'Elen Braglas wurde an ein nicht überliefertes Haus verheiratet.'
    })
  ]),
  timeJumps: Object.freeze([
    Object.freeze({
      ...BASE_FAMILY.timeJumps[0],
      childIds: Object.freeze(['ifor-braglas', 'elen-braglas']),
      toYear: '1664',
      label: 'Die belegte Braglas-Linie setzt mit Ifor und Elen um 1664 wieder ein',
      notes: 'Der Zeitsprung bleibt der alleinige absolute Generationentrenner unter dem Braglas-Wappen; Ifor und seine Schwester Elen folgen erst geschlossen dahinter.',
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
    sourceNote: 'Haus Braglas bleibt mit 16 Personen und genau drei männlichen Linien unter der Großelterngeneration kompakt. Cadfan führt die Hauptlinie über Geraint, Emyr und Nerys fort; Bryn und die aus Haus Aelmor eingeheiratete Anwen haben Madoc und Iestyn. Alle jungen Sprösslinge sind im Jahr 1740 zwischen neun und sechsundzwanzig Jahre alt und unverheiratet. Meurig ist ein lediger, kinderloser Seitenzweig. Elen führt als wegverheiratete Großtante zu einem unbekannten Haus.'
  })
});
