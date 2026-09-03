import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { createFounderTimeJumpPlaceholderHouseFamily } from './blank-house-family-factory.js';
import { GWYNTHOR_COMMONER_HOUSE_PROFILES } from './celtigerns-wacht-house-profiles.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_MAERLLYS_PORTRAITS } from './house-maerllys-portraits.js';
import { FALCHDYN_MAERLLYS_MARRIAGE } from './falchdyn-maerllys-marriage.js';
import {
  MAERLLYS_SWYLL_MARRIAGE,
  MAERLLYS_YSGRIF_MARRIAGE
} from './maerllys-cross-family-marriages.js';
import { TONNARTH_MAERLLYS_MARRIAGE } from './tonnarth-maerllys-marriage.js';

const MAERLLYS_HOUSE_ID = 'house-maerllys';
const MAERLLYS_EMBLEM = 'assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Maerllys.png';
const SWYLL_EMBLEM = 'assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Swyll.png';
const TONNARTH_EMBLEM = 'assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Tonnarth.png';
const YSGRIF_EMBLEM = 'assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Ysgrif.png';
const FALCHDYN_EMBLEM = 'assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/Falchdyn.png';

const BASE_FAMILY = createFounderTimeJumpPlaceholderHouseFamily({
  id: 'haus-maerllys',
  title: 'Haus Maerllys',
  emblem: MAERLLYS_EMBLEM,
  houseProfile: GWYNTHOR_COMMONER_HOUSE_PROFILES.maerllys,
  description: 'Ein kleines bürgerliches Haus aus Gwynthor, dessen jüngste Generation um Nia Maerllys bewusst unverheiratet bleibt.',
  toYear: '1662',
  timeJumpLabel: 'Die belegte Maerllys-Linie setzt mit Cadfan und Owain um 1662 wieder ein',
  pendingDescendantReview: false
});

function person(id, name, sex, birth = '????', houseId = MAERLLYS_HOUSE_ID, options = {}) {
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death: options.death || '',
    status: options.status || '',
    houseId,
    familyRole: options.familyRole || (houseId === MAERLLYS_HOUSE_ID ? 'core' : 'married'),
    lineageRole: options.lineageRole || 'branch',
    title: options.title || '',
    portrait: options.portrait || HOUSE_MAERLLYS_PORTRAITS[id] || '',
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

function house(id, name, emblem) {
  return Object.freeze({ id, name, motto: '', emblem, status: 'active' });
}

const FOUNDER_IDS = BASE_FAMILY.partnerships[0].participantIds;
const TIME_JUMP_ID = BASE_FAMILY.timeJumps[0].id;
const GRANDPARENT_IDS = ['cadfan-maerllys', 'eira-spouse-maerllys'];

export const HOUSE_MAERLLYS_FAMILY = Object.freeze({
  ...BASE_FAMILY,
  houses: Object.freeze([
    ...BASE_FAMILY.houses,
    house('house-swyll', 'Haus Swyll', SWYLL_EMBLEM),
    house('house-tonnarth', 'Haus Tonnarth', TONNARTH_EMBLEM),
    house('house-ysgrif', 'Haus Ysgrif', YSGRIF_EMBLEM),
    house('house-falchdyn', 'Haus Falchdyn', FALCHDYN_EMBLEM)
  ]),
  persons: Object.freeze([
    ...BASE_FAMILY.persons,

    // Nias Großeltern und Cadfans Bruder: höchste konkrete Generation.
    person('cadfan-maerllys', 'Cadfan Maerllys', 'male', '1662', MAERLLYS_HOUSE_ID, {
      lineageRole: 'head',
      title: 'Ältestes überliefertes Oberhaupt des Hauses Maerllys'
    }),
    person('eira-spouse-maerllys', 'Eira', 'female', '1666', '', {
      familyRole: 'married',
      title: 'Großmutter Nia Maerllys’'
    }),
    sharedPerson(MAERLLYS_YSGRIF_MARRIAGE.first, 'core'),
    sharedPerson(MAERLLYS_YSGRIF_MARRIAGE.second, 'married'),

    // Owains und Gwenllians Seitenzweig bleibt bewusst klein.
    sharedPerson(FALCHDYN_MAERLLYS_MARRIAGE.first, 'core'),
    sharedPerson(FALCHDYN_MAERLLYS_MARRIAGE.second, 'married'),
    sharedPerson(TONNARTH_MAERLLYS_MARRIAGE.second, 'core'),
    sharedPerson(TONNARTH_MAERLLYS_MARRIAGE.first, 'married'),

    // Elternlinie mit einer in Haus Swyll gespiegelten Ehe.
    sharedPerson(MAERLLYS_SWYLL_MARRIAGE.first, 'core'),
    sharedPerson(MAERLLYS_SWYLL_MARRIAGE.second, 'married'),

    // Jüngste Generation: alle ausdrücklich ohne Ehe oder Verlobung.
    person('elowen-maerllys', 'Elowen Maerllys', 'female', '1713', MAERLLYS_HOUSE_ID, {
      title: 'Ältere Schwester Nia Maerllys’',
      notes: 'Unverheiratet und ohne Verlobung.'
    }),
    person('nia-maerllys', 'Nia Maerllys', 'female', '1716', MAERLLYS_HOUSE_ID, {
      title: 'Angehörige des Hauses Maerllys',
      tags: ['24 Jahre'],
      notes: 'Im Jahr 1740 vierundzwanzig Jahre alt; unverheiratet und ohne Verlobung.'
    }),
    person('rhys-maerllys', 'Rhys Maerllys', 'male', '1719', MAERLLYS_HOUSE_ID, {
      title: 'Jüngerer Bruder Nia Maerllys’',
      notes: 'Unverheiratet und ohne Verlobung.'
    })
  ]),
  partnerships: Object.freeze([
    ...BASE_FAMILY.partnerships,
    createMarriage('marriage-cadfan-eira-maerllys', ...GRANDPARENT_IDS),
    createMarriage(MAERLLYS_YSGRIF_MARRIAGE.id, ...MAERLLYS_YSGRIF_MARRIAGE.participantIds),
    createMarriage(FALCHDYN_MAERLLYS_MARRIAGE.id, ...FALCHDYN_MAERLLYS_MARRIAGE.participantIds),
    createMarriage(MAERLLYS_SWYLL_MARRIAGE.id, ...MAERLLYS_SWYLL_MARRIAGE.participantIds),
    createMarriage(TONNARTH_MAERLLYS_MARRIAGE.id, ...TONNARTH_MAERLLYS_MARRIAGE.participantIds)
  ]),
  parentages: Object.freeze([
    ...createParentages(
      ['cadfan-maerllys', 'owain-maerllys'],
      FOUNDER_IDS,
      BASE_FAMILY.lineage.founderPartnershipId,
      {
        type: 'claimed',
        certainty: 'probable',
        notes: 'Nicht einzeln überlieferte Generationen verbinden das Gründerpaar mit Cadfan und Owain Maerllys.',
        extensions: { timeJumpId: TIME_JUMP_ID }
      }
    ),
    ...createParentages(
      ['iorwerth-maerllys'],
      GRANDPARENT_IDS,
      'marriage-cadfan-eira-maerllys'
    ),
    ...createParentages(
      ['geraint-maerllys', 'rhoswen-maerllys'],
      MAERLLYS_YSGRIF_MARRIAGE.participantIds,
      MAERLLYS_YSGRIF_MARRIAGE.id
    ),
    ...createParentages(
      ['elowen-maerllys', 'nia-maerllys', 'rhys-maerllys'],
      MAERLLYS_SWYLL_MARRIAGE.participantIds,
      MAERLLYS_SWYLL_MARRIAGE.id
    )
  ]),
  cadetBranches: Object.freeze([
    createMarriedAwayBranch({
      id: 'married-away-tonnarth-rhoswen-maerllys',
      name: 'Haus Tonnarth',
      parentPartnershipId: TONNARTH_MAERLLYS_MARRIAGE.id,
      houseId: 'house-tonnarth',
      targetFamilyId: 'haus-tonnarth',
      emblem: TONNARTH_EMBLEM,
      crestFrame: 'iron',
      notes: 'Rhoswen Maerllys wurde an Madoc Tonnarth verheiratet; dieselbe Ehe wird in der Tonnarth-Gegenakte geführt.'
    })
  ]),
  timeJumps: Object.freeze([
    Object.freeze({
      ...BASE_FAMILY.timeJumps[0],
      childIds: Object.freeze(['cadfan-maerllys', 'owain-maerllys']),
      toYear: '1662',
      label: 'Die belegte Maerllys-Linie setzt mit Cadfan und Owain um 1662 wieder ein',
      notes: 'Der Zeitsprung bleibt der alleinige absolute Generationentrenner unter dem Maerllys-Wappen; Cadfan und sein Bruder Owain folgen erst geschlossen dahinter.',
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
    sourceNote: 'Die konkrete Maerllys-Linie reicht nur bis zu Nias Großvater Cadfan und dessen Bruder Owain. Owain und Gwenllian Ysgrif haben Geraint sowie Rhoswen, die an Madoc Tonnarth verheiratet ist; ihre Ehe und der direkte Tonnarth-Zielknoten werden in beiden Gegenakten geführt, während die drei Kinder ausschließlich im Zielhaus Tonnarth erscheinen. Geraints Ehe mit Llio Falchdyn wird als dieselbe Weltperson und dieselbe Partnerschaft auch in der neuen Falchdyn-Gegenakte geführt; mangels vorgegebener Kinder entsteht daraus in keiner Akte eine zusätzliche Nachkommenslinie. Nia ist mangels vorgegebener Altersangabe im Jahr 1740 vorläufig vierundzwanzig Jahre alt; sie sowie Elowen und Rhys bleiben unverheiratet und ohne Verlobung. Nias Mutter Bronwen Swyll und Großonkel Owains Ehe mit Gwenllian Ysgrif werden mit gemeinsamen Weltpersonen- und Partnerschafts-IDs in den jeweiligen Gegenstammbäumen geführt. Das vorgegebene Nia-Porträt wurde lokal gesichert.'
  })
});
