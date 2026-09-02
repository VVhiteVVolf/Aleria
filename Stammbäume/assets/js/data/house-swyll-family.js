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
import { HOUSE_SWYLL_PORTRAITS } from './house-swyll-portraits.js';
import { MAERLLYS_SWYLL_MARRIAGE } from './maerllys-cross-family-marriages.js';
import { PENDRWN_SWYLL_MARRIAGE } from './pendrwn-cross-family-marriages.js';

const SWYLL_HOUSE_ID = 'house-swyll';
const SWYLL_EMBLEM = 'assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Swyll.png';
const DRAENMELYN_EMBLEM = 'assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Draenmelyn.png';
const MAERLLYS_EMBLEM = 'assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Maerllys.png';
const PENDRWN_EMBLEM = 'assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Pendrwn.png';

const BASE_FAMILY = createFounderTimeJumpPlaceholderHouseFamily({
  id: 'haus-swyll',
  title: 'Haus Swyll',
  emblem: SWYLL_EMBLEM,
  houseProfile: GWYNTHOR_COMMONER_HOUSE_PROFILES.swyll,
  description: 'Ein weit verzweigtes bürgerliches Geschlecht aus Gwynthor. Die jüngste Generation gruppiert sich um Meredith Swyll, ohne sie zum technischen Stammbaumknoten zu machen.',
  toYear: '1663',
  timeJumpLabel: 'Die belegte Swyll-Linie setzt mit Emyrs Generation um 1663 wieder ein',
  pendingDescendantReview: false
});

function person(id, name, sex, birth = '????', death = '', houseId = SWYLL_HOUSE_ID, options = {}) {
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    familyRole: options.familyRole || (houseId === SWYLL_HOUSE_ID ? 'core' : 'married'),
    lineageRole: options.lineageRole || 'branch',
    title: options.title || '',
    portrait: options.portrait || HOUSE_SWYLL_PORTRAITS[id] || '',
    tags: options.tags || [],
    notes: options.notes || '',
    extensions: options.extensions || {}
  });
}

function sharedPerson(definition, familyRole) {
  return person(definition.id, definition.name, definition.sex, definition.birth, '', definition.houseId, {
    familyRole,
    title: definition.title,
    portrait: definition.portrait,
    notes: definition.notes,
    extensions: definition.extensions
  });
}

function unknownHusband(id, houseId, wifeName) {
  return person(id, 'Unbekannter Ehemann', 'male', '????', '', houseId, {
    familyRole: 'married',
    status: 'unknown',
    title: `Ehemann von ${wifeName}`,
    notes: `Name und genaue Herkunft des Ehemanns von ${wifeName} sind nicht überliefert.`
  });
}

function house(id, name, emblem = '') {
  return Object.freeze({ id, name, motto: '', emblem, status: 'active' });
}

function marriedAway(id, partnershipId, notes) {
  const houseId = `house-unbekannt-${id}`;
  return createMarriedAwayBranch({
    id: `married-away-${id}`,
    name: 'Unbekanntes Haus',
    parentPartnershipId: partnershipId,
    houseId,
    targetFamilyId: 'haus-unbekannt',
    crestFrame: 'gold',
    notes
  });
}

const FOUNDER_IDS = BASE_FAMILY.partnerships[0].participantIds;
const TIME_JUMP_ID = BASE_FAMILY.timeJumps[0].id;
const GRANDPARENT_IDS = ['emyr-swyll', 'tegwen-spouse-swyll'];
const OWAIN_IDS = ['owain-swyll', 'eluned-spouse-swyll'];
const RHODRI_AFFAIR_IDS = ['rhodri-swyll', 'morwen-affair-swyll'];

const MARRIED_AWAY_RELATIONS = Object.freeze([
  Object.freeze({
    id: 'gross-tante-gwenifer-swyll',
    personId: 'gwenifer-swyll',
    spouseId: 'unknown-spouse-gwenifer-swyll',
    partnershipId: 'marriage-gwenifer-unknown-swyll',
    name: 'Gwenifer Swyll',
    birth: '1666',
    note: 'Merediths Großtante Gwenifer wurde an ein nicht überliefertes Haus verheiratet.'
  }),
  Object.freeze({
    id: 'carys-swyll',
    personId: 'carys-swyll',
    spouseId: 'unknown-spouse-carys-swyll',
    partnershipId: 'marriage-carys-unknown-swyll',
    name: 'Carys Swyll',
    birth: '1694',
    note: 'Merediths Tante Carys wurde an ein nicht überliefertes Haus verheiratet.'
  }),
  Object.freeze({
    id: 'llio-swyll',
    personId: 'llio-swyll',
    spouseId: 'unknown-spouse-llio-swyll',
    partnershipId: 'marriage-llio-unknown-swyll',
    name: 'Llio Swyll',
    birth: '1704',
    note: 'Merediths Tante Llio wurde an ein nicht überliefertes Haus verheiratet.'
  }),
  Object.freeze({
    id: 'nerys-swyll',
    personId: 'nerys-swyll',
    spouseId: 'unknown-spouse-nerys-swyll',
    partnershipId: 'marriage-nerys-unknown-swyll',
    name: 'Nerys Swyll',
    birth: '1706',
    note: 'Merediths Tante Nerys wurde an ein nicht überliefertes Haus verheiratet.'
  })
]);

const MARRIED_AWAY_PEOPLE = Object.freeze(MARRIED_AWAY_RELATIONS.flatMap(relation => {
  const houseId = `house-unbekannt-${relation.id}`;
  return [
    person(relation.personId, relation.name, 'female', relation.birth, '', SWYLL_HOUSE_ID, {
      notes: relation.note
    }),
    unknownHusband(relation.spouseId, houseId, relation.name)
  ];
}));

const SWYLL_PEOPLE = Object.freeze([
  // Merediths Großeltern und deren Geschwister: höchste konkrete Generation.
  person('emyr-swyll', 'Emyr Swyll', 'male', '1663', '', SWYLL_HOUSE_ID, {
    lineageRole: 'head',
    title: 'Ältestes überliefertes Oberhaupt des Hauses Swyll'
  }),
  person('tegwen-spouse-swyll', 'Tegwen', 'female', '1667', '', '', {
    familyRole: 'married'
  }),
  ...MARRIED_AWAY_PEOPLE.slice(0, 2),
  person('madryn-swyll', 'Madryn Swyll', 'male', '1669', '1720', SWYLL_HOUSE_ID, {
    title: 'Im Krieg gefallener Großonkel',
    notes: 'Merediths Großonkel; fiel 1720 im Krieg und hinterließ weder Ehefrau noch Kinder.'
  }),

  // Iestyn und seine acht Geschwister.
  ...MARRIED_AWAY_PEOPLE.slice(2, 8),
  sharedPerson(PENDRWN_SWYLL_MARRIAGE.second, 'core'),
  sharedPerson(PENDRWN_SWYLL_MARRIAGE.first, 'married'),
  sharedPerson(MAERLLYS_SWYLL_MARRIAGE.second, 'core'),
  sharedPerson(MAERLLYS_SWYLL_MARRIAGE.first, 'married'),
  person('owain-swyll', 'Owain Swyll', 'male', '1696', '', SWYLL_HOUSE_ID, {
    title: 'Onkel Merediths'
  }),
  person('eluned-spouse-swyll', 'Eluned', 'female', '1698', '', '', {
    familyRole: 'married'
  }),
  sharedPerson(DRAENMELYN_SWYLL_MARRIAGE.iestyn, 'core'),
  sharedPerson(DRAENMELYN_SWYLL_MARRIAGE.rhiannon, 'married'),
  person('cadfan-swyll', 'Cadfan Swyll', 'male', '1700', '1719', SWYLL_HOUSE_ID, {
    title: 'Im Krieg gefallener Onkel',
    notes: 'Merediths Onkel; fiel 1719 im Krieg, unverheiratet und ohne Kinder.'
  }),
  person('rhodri-swyll', 'Rhodri Swyll', 'male', '1702', '', SWYLL_HOUSE_ID, {
    title: 'Lebemann des Hauses Swyll',
    notes: 'Merediths Onkel; unterhielt eine Affäre mit Morwen, aus der zwei nicht eheliche Kinder hervorgingen.'
  }),
  person('morwen-affair-swyll', 'Morwen', 'female', '1703', '', '', {
    familyRole: 'affair',
    title: 'Affäre Rhodri Swylls',
    notes: 'Mutter von Rhodris zwei nicht ehelichen Kindern.'
  }),
  ...MARRIED_AWAY_PEOPLE.slice(8),

  // Meredith und ihre beiden Geschwister; Meredith ist das mittlere Kind.
  person('gareth-swyll', 'Gareth Swyll', 'male', '1720', '', SWYLL_HOUSE_ID, {
    title: 'Älterer Bruder Meredith Swylls',
    notes: 'Unverheiratet und ohne Verlobung; seine weitere Lebenslinie bleibt bewusst offen.'
  }),
  person('meredith-swyll', 'Meredith Swyll', 'female', '1722', '', SWYLL_HOUSE_ID, {
    title: 'Mittleres Kind Iestyns und Rhiannons',
    tags: ['18 Jahre'],
    notes: 'Achtzehnjährige Tochter von Iestyn Swyll und Rhiannon Draenmelyn; zwischen Gareth und Rhydwen geboren.'
  }),
  person('rhydwen-swyll', 'Rhydwen Swyll', 'female', '1725', '', SWYLL_HOUSE_ID, {
    title: 'Jüngere Schwester Merediths'
  }),

  // Zwei Kinder des Familienonkels Owain.
  person('aled-swyll', 'Aled Swyll', 'male', '1720', '', SWYLL_HOUSE_ID, {
    title: 'Vetter Merediths'
  }),
  person('enid-swyll', 'Enid Swyll', 'female', '1724', '', SWYLL_HOUSE_ID, {
    title: 'Cousine Merediths'
  }),

  // Zwei altersnahe Bastarde aus Rhodris einziger belegter Affäre.
  person('carwyn-swyll', 'Carwyn Swyll', 'male', '1721', '', SWYLL_HOUSE_ID, {
    familyRole: 'bastard',
    title: 'Bastard aus Rhodris Affäre mit Morwen',
    notes: 'Nicht ehelicher Sohn Rhodri Swylls und Morwens; ungefähr in Merediths Alter.'
  }),
  person('lowri-swyll', 'Lowri Swyll', 'female', '1723', '', SWYLL_HOUSE_ID, {
    familyRole: 'bastard',
    title: 'Bastard aus Rhodris Affäre mit Morwen',
    notes: 'Nicht eheliche Tochter Rhodri Swylls und Morwens; ungefähr in Merediths Alter.'
  })
]);

const EMYR_CHILD_IDS = Object.freeze([
  'eirwen-swyll',
  'bronwen-swyll',
  'carys-swyll',
  'owain-swyll',
  'iestyn-swyll',
  'cadfan-swyll',
  'rhodri-swyll',
  'llio-swyll',
  'nerys-swyll'
]);

export const HOUSE_SWYLL_FAMILY = Object.freeze({
  ...BASE_FAMILY,
  houses: Object.freeze([
    ...BASE_FAMILY.houses,
    house('house-draenmelyn', 'Haus Draenmelyn', DRAENMELYN_EMBLEM),
    house('house-maerllys', 'Haus Maerllys', MAERLLYS_EMBLEM),
    house('house-pendrwn', 'Haus Pendrwn', PENDRWN_EMBLEM),
    ...MARRIED_AWAY_RELATIONS.map(relation => (
      house(`house-unbekannt-${relation.id}`, 'Unbekanntes Haus')
    ))
  ]),
  persons: Object.freeze([
    ...BASE_FAMILY.persons,
    ...SWYLL_PEOPLE
  ]),
  partnerships: Object.freeze([
    ...BASE_FAMILY.partnerships,
    createMarriage('marriage-emyr-tegwen-swyll', ...GRANDPARENT_IDS),
    ...MARRIED_AWAY_RELATIONS.map(relation => (
      createMarriage(relation.partnershipId, relation.personId, relation.spouseId)
    )),
    createMarriage('marriage-owain-eluned-swyll', ...OWAIN_IDS),
    createMarriage(
      DRAENMELYN_SWYLL_MARRIAGE.id,
      ...DRAENMELYN_SWYLL_MARRIAGE.participantIds
    ),
    createMarriage(
      PENDRWN_SWYLL_MARRIAGE.id,
      ...PENDRWN_SWYLL_MARRIAGE.participantIds
    ),
    createMarriage(
      MAERLLYS_SWYLL_MARRIAGE.id,
      ...MAERLLYS_SWYLL_MARRIAGE.participantIds
    ),
    createMarriage('affair-rhodri-morwen-swyll', ...RHODRI_AFFAIR_IDS, {
      type: 'affair',
      status: 'ended',
      notes: 'Rhodris Affäre mit Morwen; aus ihr gingen Carwyn und Lowri hervor.'
    })
  ]),
  parentages: Object.freeze([
    ...createParentages(
      ['emyr-swyll', 'gwenifer-swyll', 'madryn-swyll'],
      FOUNDER_IDS,
      BASE_FAMILY.lineage.founderPartnershipId,
      {
        type: 'claimed',
        certainty: 'probable',
        notes: 'Nicht einzeln überlieferte Generationen verbinden das Gründerpaar mit Emyr, Gwenifer und Madryn.',
        extensions: { timeJumpId: TIME_JUMP_ID }
      }
    ),
    ...createParentages(EMYR_CHILD_IDS, GRANDPARENT_IDS, 'marriage-emyr-tegwen-swyll', {
      idPrefix: 'parentage-emyr'
    }),
    ...createParentages(
      ['gareth-swyll', 'meredith-swyll', 'rhydwen-swyll'],
      DRAENMELYN_SWYLL_MARRIAGE.participantIds,
      DRAENMELYN_SWYLL_MARRIAGE.id
    ),
    ...createParentages(['aled-swyll', 'enid-swyll'], OWAIN_IDS, 'marriage-owain-eluned-swyll'),
    ...createParentages(
      ['carwyn-swyll', 'lowri-swyll'],
      RHODRI_AFFAIR_IDS,
      'affair-rhodri-morwen-swyll',
      {
        legitimacy: 'illegitimate',
        notes: 'Nicht eheliches Kind aus Rhodri Swylls Affäre mit Morwen.'
      }
    )
  ]),
  cadetBranches: Object.freeze([
    ...MARRIED_AWAY_RELATIONS.map(relation => (
      marriedAway(relation.id, relation.partnershipId, relation.note)
    )),
    createMarriedAwayBranch({
      id: 'married-away-pendrwn-eirwen-swyll',
      name: 'Haus Pendrwn',
      parentPartnershipId: PENDRWN_SWYLL_MARRIAGE.id,
      houseId: 'house-pendrwn',
      targetFamilyId: 'haus-pendrwn',
      emblem: PENDRWN_EMBLEM,
      crestFrame: 'iron',
      notes: 'Eirwen Swyll wurde an Meilyr Pendrwn verheiratet; dieselbe Ehe wird in der Pendrwn-Gegenakte geführt.'
    }),
    createMarriedAwayBranch({
      id: 'married-away-maerllys-bronwen-swyll',
      name: 'Haus Maerllys',
      parentPartnershipId: MAERLLYS_SWYLL_MARRIAGE.id,
      houseId: 'house-maerllys',
      targetFamilyId: 'haus-maerllys',
      emblem: MAERLLYS_EMBLEM,
      crestFrame: 'iron',
      notes: 'Bronwen Swyll wurde an Iorwerth Maerllys verheiratet; dieselbe Ehe wird in der Maerllys-Gegenakte geführt.'
    })
  ]),
  timeJumps: Object.freeze([
    Object.freeze({
      ...BASE_FAMILY.timeJumps[0],
      childIds: Object.freeze(['emyr-swyll', 'gwenifer-swyll', 'madryn-swyll']),
      toYear: '1663',
      label: 'Die belegte Swyll-Linie setzt mit Emyrs Generation um 1663 wieder ein',
      notes: 'Der Zeitsprung bleibt der alleinige absolute Generationentrenner unter dem Swyll-Wappen; alle drei Geschwister der ältesten konkreten Generation folgen geschlossen dahinter.',
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
    // Meredith ist absichtlich keine Diagrammwurzel: Vom Gründerpfad aus kann
    // Family Chart sämtliche Geschwister-, Affären- und Wegverheiratungszweige laden.
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
    sourceRevision: 9,
    registryManagedViewFields: Object.freeze(['focusPersonId', 'limitGenerations']),
    registryTombstones: Object.freeze({
      persons: Object.freeze([
        'mair-ysgrif',
        'unknown-spouse-eirwen-swyll',
        'unknown-spouse-bronwen-swyll'
      ]),
      partnerships: Object.freeze([
        'marriage-mair-ysgrif-gareth-swyll',
        'marriage-eirwen-unknown-swyll',
        'marriage-bronwen-unknown-swyll'
      ]),
      parentages: Object.freeze(['parentage-iestyn-swyll']),
      houses: Object.freeze([
        'house-ysgrif',
        'house-unbekannt-eirwen-swyll',
        'house-unbekannt-bronwen-swyll'
      ]),
      cadetBranches: Object.freeze([
        'married-away-eirwen-swyll',
        'married-away-bronwen-swyll'
      ])
    }),
    sourceNote: 'Meredith Swyll ist im Jahr 1740 achtzehn Jahre alt und das mittlere von drei Kindern Iestyn Swylls und Rhiannon Draenmelyns. Sie ist eine gewöhnliche Personenkarte, niemals Diagrammwurzel oder Zeitsprunganker. Iestyn und Rhiannon sowie ihre Ehe bleiben mit der Draenmelyn-Gegenakte synchron; ihre Kinder werden ausschließlich im Zielhaus Swyll geführt. Merediths Bruder Gareth bleibt unverheiratet und ohne Verlobung. Iestyn besitzt fünf wegverheiratete Schwestern: Eirwens Ehe mit Meilyr Pendrwn und Bronwens Ehe mit Iorwerth Maerllys werden in den jeweiligen Gegenakten gespiegelt; nur Carys, Llio und Nerys führen noch zu unbekannten Häusern. Hinzu kommen der kinderreiche Bruder Owain, der 1719 kinderlos im Krieg gefallene Cadfan und der Lebemann Rhodri. Rhodris Affäre mit Morwen führt eindeutig zu den altersnahen Bastarden Carwyn und Lowri. Emyrs Schwester Gwenifer ist als wegverheiratete Großtante verknüpft; sein Bruder Madryn fiel 1720 kinderlos im Krieg. Das vorgegebene Meredith-Porträt wurde lokal gesichert.'
  })
});
