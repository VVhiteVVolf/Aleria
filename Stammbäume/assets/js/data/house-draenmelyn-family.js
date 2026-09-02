import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { createFounderTimeJumpPlaceholderHouseFamily } from './blank-house-family-factory.js';
import { GWYNTHOR_COMMONER_HOUSE_PROFILES } from './celtigerns-wacht-house-profiles.js';
import { DRAENMELYN_SWYLL_MARRIAGE } from './draenmelyn-swyll-marriage.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_DRAENMELYN_PORTRAITS } from './house-draenmelyn-portraits.js';
import { PENDRWN_DRAENMELYN_MARRIAGE } from './pendrwn-cross-family-marriages.js';

const DRAENMELYN_HOUSE_ID = 'house-draenmelyn';
const DRAENMELYN_EMBLEM = 'assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Draenmelyn.png';
const SWYLL_EMBLEM = 'assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Swyll.png';
const PENDRWN_EMBLEM = 'assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Pendrwn.png';

const BASE_FAMILY = createFounderTimeJumpPlaceholderHouseFamily({
  id: 'haus-draenmelyn',
  title: 'Haus Draenmelyn',
  emblem: DRAENMELYN_EMBLEM,
  houseProfile: GWYNTHOR_COMMONER_HOUSE_PROFILES.draenmelyn,
  description: 'Ein kleines bürgerliches Geschlecht aus Gwynthor, dessen Angehörige seit Generationen als Diener und Bedienstete im Haushalt des Hauses Draig stehen.',
  toYear: '1665',
  timeJumpLabel: 'Die belegte Linie setzt mit der Großelterngeneration um 1665 ein',
  pendingDescendantReview: false
});

function person(id, name, sex, birth, options = {}) {
  const houseId = options.houseId ?? DRAENMELYN_HOUSE_ID;
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death: options.death || '',
    status: options.status || '',
    houseId,
    familyRole: options.familyRole || (houseId === DRAENMELYN_HOUSE_ID ? 'core' : 'married'),
    lineageRole: options.lineageRole || 'branch',
    title: options.title || '',
    portrait: options.portrait || HOUSE_DRAENMELYN_PORTRAITS[id] || '',
    tags: options.tags || [],
    notes: options.notes || '',
    extensions: options.extensions || {}
  });
}

function sharedMarriagePerson(definition, familyRole) {
  return person(definition.id, definition.name, definition.sex, definition.birth, {
    houseId: definition.houseId,
    familyRole,
    title: definition.title,
    portrait: definition.portrait,
    notes: definition.notes,
    extensions: definition.extensions
  });
}

const GRANDPARENT_IDS = ['ifor-draenmelyn', 'nest-spouse-draenmelyn'];
const AFAN_IDS = ['afan-draenmelyn', 'elen-spouse-draenmelyn'];
const MEURIG_IDS = ['meurig-draenmelyn', 'catrin-spouse-draenmelyn'];

const DESCENDANT_PERSONS = Object.freeze([
  // Großelterngeneration: die höchste konkret ausgearbeitete Generation.
  person('ifor-draenmelyn', 'Ifor Draenmelyn', 'male', '1665', {
    lineageRole: 'head',
    title: 'Altgedienter Hausdiener der Draigs'
  }),
  person('nest-spouse-draenmelyn', 'Nest', 'female', '1668', {
    houseId: '',
    familyRole: 'married',
    title: 'Altgediente Bedienstete im Draig-Haushalt'
  }),

  // Zwei Elternzweige für Taliesin und Myfanwy.
  person('afan-draenmelyn', 'Afan Draenmelyn', 'male', '1694', {
    title: 'Hausdiener der Draigs'
  }),
  person('elen-spouse-draenmelyn', 'Elen', 'female', '1697', {
    houseId: '',
    familyRole: 'married',
    title: 'Bedienstete im Draig-Haushalt'
  }),
  person('meurig-draenmelyn', 'Meurig Draenmelyn', 'male', '1697', {
    title: 'Hausdiener der Draigs'
  }),
  person('catrin-spouse-draenmelyn', 'Catrin', 'female', '1700', {
    houseId: '',
    familyRole: 'married',
    title: 'Bedienstete im Draig-Haushalt'
  }),

  // Die zwei ausdrücklich gewünschten, möglichst knappen Seitenlinien.
  sharedMarriagePerson(PENDRWN_DRAENMELYN_MARRIAGE.second, 'core'),
  sharedMarriagePerson(PENDRWN_DRAENMELYN_MARRIAGE.first, 'married'),
  sharedMarriagePerson(DRAENMELYN_SWYLL_MARRIAGE.rhiannon, 'core'),
  sharedMarriagePerson(DRAENMELYN_SWYLL_MARRIAGE.iestyn, 'married'),

  // Taliesins Kernfamilie: zwei Geschwister, keine weitere Nebenlinie.
  person('sioned-draenmelyn', 'Sioned Draenmelyn', 'female', '1720', {
    title: 'Bedienstete des Hauses Draig',
    notes: 'Schwester Taliesin Draenmelyns; unverheiratet und ohne Verlobung.'
  }),
  person('taliesin-draenmelyn', 'Taliesin Draenmelyn', 'male', '1722', {
    title: 'Bediensteter des Hauses Draig',
    tags: ['18 Jahre'],
    notes: 'Achtzehnjähriger Vetter Myfanwy Draenmelyns.'
  }),
  person('gethin-draenmelyn', 'Gethin Draenmelyn', 'male', '1725', {
    title: 'Junger Bediensteter des Hauses Draig'
  }),

  // Myfanwys Kernfamilie: ebenfalls zwei Geschwister.
  person('owain-draenmelyn', 'Owain Draenmelyn', 'male', '1720', {
    title: 'Bediensteter des Hauses Draig'
  }),
  person('myfanwy-draenmelyn', 'Myfanwy Draenmelyn', 'female', '1723', {
    title: 'Bedienstete des Hauses Draig',
    tags: ['17 Jahre'],
    notes: 'Siebzehnjährige Cousine Taliesin Draenmelyns.'
  }),
  person('eleri-draenmelyn', 'Eleri Draenmelyn', 'female', '1726', {
    title: 'Junge Bedienstete des Hauses Draig'
  })
]);

const FOUNDER_IDS = BASE_FAMILY.partnerships[0].participantIds;
const TIME_JUMP_ID = BASE_FAMILY.timeJumps[0].id;

export const HOUSE_DRAENMELYN_FAMILY = Object.freeze({
  ...BASE_FAMILY,
  houses: Object.freeze([
    ...BASE_FAMILY.houses,
    Object.freeze({ id: 'house-swyll', name: 'Haus Swyll', motto: '', emblem: SWYLL_EMBLEM, status: 'active' }),
    Object.freeze({ id: 'house-pendrwn', name: 'Haus Pendrwn', motto: '', emblem: PENDRWN_EMBLEM, status: 'active' })
  ]),
  persons: Object.freeze([
    ...BASE_FAMILY.persons,
    ...DESCENDANT_PERSONS
  ]),
  partnerships: Object.freeze([
    ...BASE_FAMILY.partnerships,
    createMarriage('marriage-ifor-nest-draenmelyn', ...GRANDPARENT_IDS),
    createMarriage('marriage-afan-elen-draenmelyn', ...AFAN_IDS),
    createMarriage('marriage-meurig-catrin-draenmelyn', ...MEURIG_IDS),
    createMarriage(
      DRAENMELYN_SWYLL_MARRIAGE.id,
      ...DRAENMELYN_SWYLL_MARRIAGE.participantIds
    ),
    createMarriage(
      PENDRWN_DRAENMELYN_MARRIAGE.id,
      ...PENDRWN_DRAENMELYN_MARRIAGE.participantIds
    )
  ]),
  parentages: Object.freeze([
    ...createParentages(['ifor-draenmelyn'], FOUNDER_IDS, BASE_FAMILY.lineage.founderPartnershipId, {
      type: 'claimed',
      certainty: 'probable',
      notes: 'Nicht einzeln überlieferte Generationen verbinden das Gründerpaar mit Ifors Großelterngeneration.',
      extensions: { timeJumpId: TIME_JUMP_ID }
    }),
    ...createParentages(
      ['afan-draenmelyn', 'meurig-draenmelyn', 'caradog-draenmelyn', 'rhiannon-draenmelyn'],
      GRANDPARENT_IDS,
      'marriage-ifor-nest-draenmelyn'
    ),
    ...createParentages(
      ['sioned-draenmelyn', 'taliesin-draenmelyn', 'gethin-draenmelyn'],
      AFAN_IDS,
      'marriage-afan-elen-draenmelyn'
    ),
    ...createParentages(
      ['owain-draenmelyn', 'myfanwy-draenmelyn', 'eleri-draenmelyn'],
      MEURIG_IDS,
      'marriage-meurig-catrin-draenmelyn'
    )
  ]),
  cadetBranches: Object.freeze([
    createMarriedAwayBranch({
      id: 'married-away-swyll-rhiannon-draenmelyn',
      name: 'Haus Swyll',
      parentPartnershipId: DRAENMELYN_SWYLL_MARRIAGE.id,
      houseId: 'house-swyll',
      targetFamilyId: 'haus-swyll',
      emblem: SWYLL_EMBLEM,
      crestFrame: 'iron',
      notes: 'Rhiannon Draenmelyn wurde an Iestyn Swyll verheiratet und führt ihre gemeinsame Linie im Haus Swyll fort.'
    })
  ]),
  timeJumps: Object.freeze([
    Object.freeze({
      ...BASE_FAMILY.timeJumps[0],
      childIds: Object.freeze(['ifor-draenmelyn']),
      toYear: '1665',
      label: 'Die belegte Linie setzt mit der Großelterngeneration um 1665 ein',
      notes: 'Der Zeitsprung bleibt der alleinige absolute Generationentrenner unter dem Draenmelyn-Wappen; erst danach beginnt Ifors kompakte Familienlinie.',
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
    sourceRevision: 8,
    registryManagedViewFields: Object.freeze(['focusPersonId', 'limitGenerations']),
    registryTombstones: Object.freeze({
      persons: Object.freeze(['floyd-ysgrif']),
      partnerships: Object.freeze(['marriage-floyd-ysgrif-sioned-draenmelyn']),
      houses: Object.freeze(['house-ysgrif']),
      cadetBranches: Object.freeze(['married-away-ysgrif-sioned-draenmelyn'])
    }),
    sourceNote: 'Taliesin (18) und Myfanwy (17) wurden nach der ergänzenden Vorgabe als Vetter und Cousine in zwei Geschwisterzweigen derselben Großeltern angelegt. Beide besitzen jeweils genau zwei Geschwister. Die einzige zusätzliche Onkellinie ist Caradog, der als Söldner lebt und mit Gwenith Pendrwn verheiratet ist; dieselbe Ehe wird in der Pendrwn-Gegenakte geführt. Rhiannon ist direkt an Iestyn Swyll wegverheiratet. Sioned bleibt unverheiratet und ohne Verlobung. Damit endet die konkret ausgearbeitete Abstammung oberhalb der Eltern bei genau einer Großelterngeneration. Das gesamte Bürgerhaus steht traditionell als Diener- und Bedienstetengeschlecht im Haushalt Haus Draigs. Die drei vorgegebenen Portraitquellen wurden lokal gesichert.'
  })
});
