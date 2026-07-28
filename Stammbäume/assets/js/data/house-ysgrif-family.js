import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { createFounderTimeJumpPlaceholderHouseFamily } from './blank-house-family-factory.js';
import { GWYNTHOR_COMMONER_HOUSE_PROFILES } from './celtigerns-wacht-house-profiles.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_YSGRIF_PORTRAITS } from './house-ysgrif-portraits.js';
import { MAERLLYS_YSGRIF_MARRIAGE } from './maerllys-cross-family-marriages.js';

const YSGRIF_HOUSE_ID = 'house-ysgrif';
const YSGRIF_EMBLEM = 'assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Ysgrif.png';
const MAERLLYS_EMBLEM = 'assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Maerllys.png';

const BASE_FAMILY = createFounderTimeJumpPlaceholderHouseFamily({
  id: 'haus-ysgrif',
  title: 'Haus Ysgrif',
  emblem: YSGRIF_EMBLEM,
  houseProfile: GWYNTHOR_COMMONER_HOUSE_PROFILES.ysgrif,
  description: 'Ein kleines bürgerliches Haus aus Gwynthor, dessen jüngste Generation um Floyd Ysgrif bewusst offen bleibt.',
  toYear: '1666',
  timeJumpLabel: 'Die belegte Ysgrif-Linie setzt mit Idris und Gwenllian um 1666 wieder ein',
  pendingDescendantReview: false
});

function person(id, name, sex, birth = '????', death = '', houseId = YSGRIF_HOUSE_ID, options = {}) {
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    familyRole: options.familyRole || (houseId === YSGRIF_HOUSE_ID ? 'core' : 'married'),
    lineageRole: options.lineageRole || 'branch',
    title: options.title || '',
    portrait: options.portrait || HOUSE_YSGRIF_PORTRAITS[id] || '',
    tags: options.tags || [],
    notes: options.notes || ''
  });
}

function sharedPerson(definition, familyRole) {
  return person(definition.id, definition.name, definition.sex, definition.birth, '', definition.houseId, {
    familyRole,
    title: definition.title,
    portrait: definition.portrait,
    notes: definition.notes
  });
}

const FOUNDER_IDS = BASE_FAMILY.partnerships[0].participantIds;
const TIME_JUMP_ID = BASE_FAMILY.timeJumps[0].id;
const GRANDPARENT_IDS = ['idris-ysgrif', 'efa-spouse-ysgrif'];
const PARENT_IDS = ['aneirin-ysgrif', 'catrin-spouse-ysgrif'];
const BRYN_IDS = ['bryn-ysgrif', 'elen-spouse-ysgrif'];

export const HOUSE_YSGRIF_FAMILY = Object.freeze({
  ...BASE_FAMILY,
  houses: Object.freeze([
    ...BASE_FAMILY.houses,
    Object.freeze({
      id: 'house-maerllys',
      name: 'Haus Maerllys',
      motto: '',
      emblem: MAERLLYS_EMBLEM,
      status: 'active'
    })
  ]),
  persons: Object.freeze([
    ...BASE_FAMILY.persons,

    // Floyds Großvater und dessen wegverheiratete Schwester.
    person('idris-ysgrif', 'Idris Ysgrif', 'male', '1666', '', YSGRIF_HOUSE_ID, {
      lineageRole: 'head',
      title: 'Ältestes überliefertes Oberhaupt des Hauses Ysgrif'
    }),
    person('efa-spouse-ysgrif', 'Efa', 'female', '1670', '', '', {
      familyRole: 'married'
    }),
    sharedPerson(MAERLLYS_YSGRIF_MARRIAGE.second, 'core'),
    sharedPerson(MAERLLYS_YSGRIF_MARRIAGE.first, 'married'),

    // Floyds Eltern und seine beiden Onkel.
    person('aneirin-ysgrif', 'Aneirin Ysgrif', 'male', '1693', '', YSGRIF_HOUSE_ID, {
      title: 'Vater Floyd Ysgrifs'
    }),
    person('catrin-spouse-ysgrif', 'Catrin', 'female', '1696', '', '', {
      familyRole: 'married',
      title: 'Mutter Floyd Ysgrifs'
    }),
    person('bryn-ysgrif', 'Bryn Ysgrif', 'male', '1695', '', YSGRIF_HOUSE_ID, {
      title: 'Onkel Floyds · Vater dreier Söhne'
    }),
    person('elen-spouse-ysgrif', 'Elen', 'female', '1697', '', '', {
      familyRole: 'married'
    }),
    person('madoc-ysgrif', 'Madoc Ysgrif', 'male', '1698', '', YSGRIF_HOUSE_ID, {
      title: 'Söldner',
      notes: 'Floyds zweiter Onkel; arbeitet als Söldner, blieb unverheiratet und kinderlos.'
    }),

    // Floyd und seine zwei unverheirateten Schwestern.
    person('floyd-ysgrif', 'Floyd Ysgrif', 'male', '1719', '', YSGRIF_HOUSE_ID, {
      title: 'Angehöriger des Hauses Ysgrif',
      tags: ['21 Jahre'],
      notes: 'Einundzwanzigjähriger Sohn Aneirin Ysgrifs; unverheiratet und ohne Verlobung.'
    }),
    person('mair-ysgrif', 'Mair Ysgrif', 'female', '1720', '', YSGRIF_HOUSE_ID, {
      title: 'Schwester Floyd Ysgrifs',
      notes: 'Unverheiratet und ohne Verlobung; ihre weitere Lebenslinie bleibt bewusst offen.'
    }),
    person('eleri-ysgrif', 'Eleri Ysgrif', 'female', '1723', '', YSGRIF_HOUSE_ID, {
      title: 'Jüngere Schwester Floyds',
      notes: 'Unverheiratet; ihre weitere Lebenslinie bleibt bewusst offen.'
    }),

    // Drei unverheiratete Vettern aus Bryns Linie.
    person('cadell-ysgrif', 'Cadell Ysgrif', 'male', '1718', '', YSGRIF_HOUSE_ID, {
      title: 'Vetter Floyds'
    }),
    person('huw-ysgrif', 'Huw Ysgrif', 'male', '1721', '', YSGRIF_HOUSE_ID, {
      title: 'Vetter Floyds'
    }),
    person('emrys-ysgrif', 'Emrys Ysgrif', 'male', '1724', '', YSGRIF_HOUSE_ID, {
      title: 'Vetter Floyds'
    })
  ]),
  partnerships: Object.freeze([
    ...BASE_FAMILY.partnerships,
    createMarriage('marriage-idris-efa-ysgrif', ...GRANDPARENT_IDS),
    createMarriage(MAERLLYS_YSGRIF_MARRIAGE.id, ...MAERLLYS_YSGRIF_MARRIAGE.participantIds),
    createMarriage('marriage-aneirin-catrin-ysgrif', ...PARENT_IDS),
    createMarriage('marriage-bryn-elen-ysgrif', ...BRYN_IDS)
  ]),
  parentages: Object.freeze([
    ...createParentages(
      ['idris-ysgrif', 'gwenllian-ysgrif'],
      FOUNDER_IDS,
      BASE_FAMILY.lineage.founderPartnershipId,
      {
        type: 'claimed',
        certainty: 'probable',
        notes: 'Nicht einzeln überlieferte Generationen verbinden das Gründerpaar mit Idris und Gwenllian.',
        extensions: { timeJumpId: TIME_JUMP_ID }
      }
    ),
    ...createParentages(
      ['aneirin-ysgrif', 'bryn-ysgrif', 'madoc-ysgrif'],
      GRANDPARENT_IDS,
      'marriage-idris-efa-ysgrif'
    ),
    ...createParentages(
      ['floyd-ysgrif', 'mair-ysgrif', 'eleri-ysgrif'],
      PARENT_IDS,
      'marriage-aneirin-catrin-ysgrif'
    ),
    ...createParentages(
      ['cadell-ysgrif', 'huw-ysgrif', 'emrys-ysgrif'],
      BRYN_IDS,
      'marriage-bryn-elen-ysgrif'
    )
  ]),
  cadetBranches: Object.freeze([
    createMarriedAwayBranch({
      id: 'married-away-maerllys-gwenllian-ysgrif',
      name: 'Haus Maerllys',
      parentPartnershipId: MAERLLYS_YSGRIF_MARRIAGE.id,
      houseId: 'house-maerllys',
      targetFamilyId: 'haus-maerllys',
      emblem: MAERLLYS_EMBLEM,
      crestFrame: 'iron',
      notes: 'Floyds Großtante Gwenllian wurde an Owain Maerllys verheiratet; dieselbe Ehe wird in der Maerllys-Gegenakte geführt.'
    })
  ]),
  timeJumps: Object.freeze([
    Object.freeze({
      ...BASE_FAMILY.timeJumps[0],
      childIds: Object.freeze(['idris-ysgrif', 'gwenllian-ysgrif']),
      toYear: '1666',
      label: 'Die belegte Ysgrif-Linie setzt mit Idris und Gwenllian um 1666 wieder ein',
      notes: 'Der Zeitsprung bleibt der alleinige absolute Generationentrenner unter dem Ysgrif-Wappen; Idris und seine Schwester Gwenllian folgen gemeinsam dahinter.',
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
    sourceRevision: 4,
    registryManagedViewFields: Object.freeze(['focusPersonId', 'limitGenerations']),
    registryTombstones: Object.freeze({
      persons: Object.freeze([
        'sioned-draenmelyn',
        'gareth-swyll',
        'unknown-spouse-gwenllian-ysgrif'
      ]),
      partnerships: Object.freeze([
        'marriage-floyd-ysgrif-sioned-draenmelyn',
        'marriage-mair-ysgrif-gareth-swyll',
        'marriage-gwenllian-unknown-ysgrif'
      ]),
      houses: Object.freeze([
        'house-draenmelyn',
        'house-swyll',
        'house-unbekannt-gwenllian-ysgrif'
      ]),
      cadetBranches: Object.freeze([
        'married-away-swyll-mair-ysgrif',
        'married-away-unknown-gwenllian-ysgrif'
      ])
    }),
    sourceNote: 'Floyd Ysgrif ist im Jahr 1740 einundzwanzig Jahre alt, unverheiratet und besitzt zwei ebenfalls unverheiratete Schwestern. Ihre weiteren Lebenslinien bleiben bewusst offen. Bryn hat drei unverheiratete Söhne; Madoc lebt als kinderloser Söldner. Idris ist der einzige konkret ausgearbeitete Großvater; seine Schwester Gwenllian ist an Owain Maerllys verheiratet und führt einen direkten, beidseitig registrierten Wegverheiratet-Knoten zu Haus Maerllys. Das eigene Ysgrif-Wappen und Floyds Portrait wurden lokal aus den vorgegebenen Quellen gesichert.'
  })
});
