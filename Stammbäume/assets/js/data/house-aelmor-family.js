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

const AELMOR_HOUSE_ID = 'house-aelmor';
const AELMOR_EMBLEM = 'assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Aelmor.png';
const BRAGLAS_EMBLEM = 'assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Braglas.png';
const UNKNOWN_EIRLYS_HOUSE_ID = 'house-unbekannt-eirlys-aelmor';
const EIRLYS_MARRIAGE_ID = 'marriage-eirlys-unknown-aelmor';

const BASE_FAMILY = createFounderTimeJumpPlaceholderHouseFamily({
  id: 'haus-aelmor',
  title: 'Haus Aelmor',
  emblem: AELMOR_EMBLEM,
  houseProfile: GWYNTHOR_COMMONER_HOUSE_PROFILES.aelmor,
  description: 'Ein kleines bürgerliches Haus aus Gwynthor mit höchstens drei Linien unter der Großelterngeneration.',
  toYear: '1663',
  timeJumpLabel: 'Die belegte Aelmor-Linie setzt mit Bledri und Eirlys um 1663 wieder ein',
  pendingDescendantReview: false
});

function person(id, name, sex, birth = '????', houseId = AELMOR_HOUSE_ID, options = {}) {
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death: options.death || '',
    status: options.status || '',
    houseId,
    familyRole: options.familyRole || (houseId === AELMOR_HOUSE_ID ? 'core' : 'married'),
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
const GRANDPARENT_IDS = ['bledri-aelmor', 'nest-spouse-aelmor'];
const PARENT_IDS = ['goronwy-aelmor', 'catrin-spouse-aelmor'];

export const HOUSE_AELMOR_FAMILY = Object.freeze({
  ...BASE_FAMILY,
  houses: Object.freeze([
    ...BASE_FAMILY.houses,
    Object.freeze({
      id: 'house-braglas',
      name: 'Haus Braglas',
      motto: '',
      emblem: BRAGLAS_EMBLEM,
      status: 'active'
    }),
    Object.freeze({
      id: UNKNOWN_EIRLYS_HOUSE_ID,
      name: 'Unbekanntes Haus',
      motto: '',
      emblem: '',
      status: 'active'
    })
  ]),
  persons: Object.freeze([
    ...BASE_FAMILY.persons,

    // Höchste konkrete Generation: Großeltern und eine wegverheiratete Großtante.
    person('bledri-aelmor', 'Bledri Aelmor', 'male', '1663', AELMOR_HOUSE_ID, {
      lineageRole: 'head',
      title: 'Ältestes überliefertes Oberhaupt des Hauses Aelmor'
    }),
    person('nest-spouse-aelmor', 'Nest', 'female', '1667', '', {
      familyRole: 'married'
    }),
    person('eirlys-aelmor', 'Eirlys Aelmor', 'female', '1666', AELMOR_HOUSE_ID, {
      title: 'Wegverheiratete Großtante der jüngsten Aelmor-Generation',
      notes: 'Schwester Bledri Aelmors; wurde an ein nicht überliefertes Haus verheiratet.'
    }),
    person('unknown-spouse-eirlys-aelmor', 'Unbekannter Ehemann', 'male', '????', UNKNOWN_EIRLYS_HOUSE_ID, {
      familyRole: 'married',
      status: 'unknown',
      title: 'Ehemann Eirlys Aelmors'
    }),

    // Genau drei Geschwisterlinien unter Bledri und Nest.
    person('goronwy-aelmor', 'Goronwy Aelmor', 'male', '1689', AELMOR_HOUSE_ID, {
      title: 'Fortführer der Aelmor-Hauptlinie'
    }),
    person('catrin-spouse-aelmor', 'Catrin', 'female', '1692', '', {
      familyRole: 'married'
    }),
    person('madoc-aelmor', 'Madoc Aelmor', 'male', '1693', AELMOR_HOUSE_ID, {
      title: 'Lediger Seitenzweig des Hauses Aelmor',
      notes: 'Blieb unverheiratet und ohne Kinder.'
    }),
    sharedPerson(AELMOR_BRAGLAS_MARRIAGE.second, 'core'),
    sharedPerson(AELMOR_BRAGLAS_MARRIAGE.first, 'married'),

    // Junge Sprösslinge bleiben im Alter von acht bis sechsundzwanzig unverheiratet.
    person('owain-aelmor', 'Owain Aelmor', 'male', '1714', AELMOR_HOUSE_ID, {
      title: 'Ältester Sohn Goronwy Aelmors',
      tags: ['26 Jahre'],
      notes: 'Unverheiratet und ohne Verlobung; führt die nächste Aelmor-Generation an.'
    }),
    person('rhodri-aelmor', 'Rhodri Aelmor', 'male', '1720', AELMOR_HOUSE_ID, {
      title: 'Jüngerer Sohn Goronwy Aelmors',
      tags: ['20 Jahre'],
      notes: 'Unverheiratet und ohne Verlobung.'
    }),
    person('tegan-aelmor', 'Tegan Aelmor', 'female', '1732', AELMOR_HOUSE_ID, {
      title: 'Jüngste Tochter Goronwy Aelmors',
      tags: ['8 Jahre'],
      notes: 'Unverheiratet; ihre weitere Lebenslinie bleibt altersbedingt offen.'
    })
  ]),
  partnerships: Object.freeze([
    ...BASE_FAMILY.partnerships,
    createMarriage('marriage-bledri-nest-aelmor', ...GRANDPARENT_IDS),
    createMarriage(EIRLYS_MARRIAGE_ID, 'eirlys-aelmor', 'unknown-spouse-eirlys-aelmor'),
    createMarriage('marriage-goronwy-catrin-aelmor', ...PARENT_IDS),
    createMarriage(AELMOR_BRAGLAS_MARRIAGE.id, ...AELMOR_BRAGLAS_MARRIAGE.participantIds)
  ]),
  parentages: Object.freeze([
    ...createParentages(
      ['bledri-aelmor', 'eirlys-aelmor'],
      FOUNDER_IDS,
      BASE_FAMILY.lineage.founderPartnershipId,
      {
        type: 'claimed',
        certainty: 'probable',
        notes: 'Nicht einzeln überlieferte Generationen verbinden das Gründerpaar mit Bledri und Eirlys.',
        extensions: { timeJumpId: TIME_JUMP_ID }
      }
    ),
    ...createParentages(
      ['goronwy-aelmor', 'madoc-aelmor', 'anwen-aelmor'],
      GRANDPARENT_IDS,
      'marriage-bledri-nest-aelmor'
    ),
    ...createParentages(
      ['owain-aelmor', 'rhodri-aelmor', 'tegan-aelmor'],
      PARENT_IDS,
      'marriage-goronwy-catrin-aelmor'
    )
  ]),
  cadetBranches: Object.freeze([
    createMarriedAwayBranch({
      id: 'married-away-unknown-eirlys-aelmor',
      name: 'Unbekanntes Haus',
      parentPartnershipId: EIRLYS_MARRIAGE_ID,
      houseId: UNKNOWN_EIRLYS_HOUSE_ID,
      targetFamilyId: 'haus-unbekannt',
      crestFrame: 'gold',
      notes: 'Eirlys Aelmor wurde an ein nicht überliefertes Haus verheiratet.'
    }),
    createMarriedAwayBranch({
      id: 'married-away-braglas-anwen-aelmor',
      name: 'Haus Braglas',
      parentPartnershipId: AELMOR_BRAGLAS_MARRIAGE.id,
      houseId: 'house-braglas',
      targetFamilyId: 'haus-braglas',
      emblem: BRAGLAS_EMBLEM,
      crestFrame: 'iron',
      notes: 'Anwen Aelmor wurde an Bryn Braglas verheiratet; dieselbe Ehe wird in der Braglas-Gegenakte geführt.'
    })
  ]),
  timeJumps: Object.freeze([
    Object.freeze({
      ...BASE_FAMILY.timeJumps[0],
      childIds: Object.freeze(['bledri-aelmor', 'eirlys-aelmor']),
      toYear: '1663',
      label: 'Die belegte Aelmor-Linie setzt mit Bledri und Eirlys um 1663 wieder ein',
      notes: 'Der Zeitsprung bleibt der alleinige absolute Generationentrenner unter dem Aelmor-Wappen; Bledri und seine Schwester Eirlys folgen erst geschlossen dahinter.',
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
    sourceNote: 'Haus Aelmor bleibt mit 14 Personen und genau drei Linien unter der Großelterngeneration kompakt. Goronwy führt die Hauptlinie über die unverheirateten Sprösslinge Owain, Rhodri und Tegan fort; alle sind im Jahr 1740 zwischen acht und sechsundzwanzig Jahre alt. Madoc ist ein lediger, kinderloser Seitenzweig. Eirlys führt als wegverheiratete Großtante zu einem unbekannten Haus; Anwen ist an Bryn Braglas verheiratet und ihre Ehe wird beidseitig registriert.'
  })
});
