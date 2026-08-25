import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { ARGALL_DRAIG_AFFAIR } from './argall-draig-affair.js';
import { createFounderTimeJumpPlaceholderHouseFamily } from './blank-house-family-factory.js';
import { LLYSFAEN_COMMONER_HOUSE_PROFILES } from './celtigerns-wacht-house-profiles.js';
import {
  createFamilyPerson,
  createMarriage,
  createParentages
} from './family-record-builders.js';
import { HOUSE_ARGALL_PORTRAITS } from './house-argall-portraits.js';
import { HOUSE_DRAIG_PORTRAITS } from './house-draig-portraits.js';

const ARGALL_HOUSE_ID = 'house-argall';
const DRAIG_HOUSE_ID = 'house-draig';
const ARGALL_EMBLEM = 'assets/images/houses/Llamreis Ankunft/Bürgerliche/Llysfaen/Argall.png';
const DRAIG_EMBLEM = 'assets/images/houses/Llamreis Ankunft/haus-draig.png';

const BASE_FAMILY = createFounderTimeJumpPlaceholderHouseFamily({
  id: 'haus-argall',
  title: 'Haus Argall',
  emblem: ARGALL_EMBLEM,
  houseProfile: LLYSFAEN_COMMONER_HOUSE_PROFILES.argall,
  description: 'Ein kleines bürgerliches Haus aus Llysfaen mit zwei Brüderlinien, einer schmalen Vetterlinie und Shylene Argalls Verbindung zu Owain Draig.',
  toYear: '1629',
  timeJumpLabel: 'Die belegte Argall-Linie setzt mit Cyran, dem Großvater Brinthans und Uthyrs, um 1629 wieder ein',
  pendingDescendantReview: false
});

function person(id, name, sex, birth, options = {}) {
  const houseId = options.houseId ?? ARGALL_HOUSE_ID;
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death: options.death || '',
    status: options.status || '',
    houseId,
    worldPersonId: options.worldPersonId || '',
    familyRole: options.familyRole || (houseId === ARGALL_HOUSE_ID ? 'core' : 'married'),
    lineageRole: options.lineageRole || 'branch',
    title: options.title || '',
    portrait: options.portrait || HOUSE_ARGALL_PORTRAITS[id] || '',
    tags: options.tags || [],
    notes: options.notes || ''
  });
}

function sharedPerson(definition, options = {}) {
  return person(definition.id, definition.name, definition.sex, definition.birth, {
    ...options,
    houseId: definition.houseId,
    worldPersonId: definition.worldPersonId
  });
}

const FOUNDER_IDS = BASE_FAMILY.partnerships[0].participantIds;
const TIME_JUMP_ID = BASE_FAMILY.timeJumps[0].id;
const GRANDPARENT_IDS = ['cyran-argall', 'gweneth-spouse-argall'];
const PARENT_IDS = ['brenar-argall', 'nerwen-spouse-argall'];
const UNCLE_IDS = ['iwrian-argall', 'avelyn-spouse-argall'];
const BRINTHAN_IDS = ['brinthan-argall', 'eris-argall'];
const UTHYR_IDS = ['uthyr-argall', 'rhewena-argall'];
const COUSIN_IDS = ['dyrwyn-argall', 'ellena-spouse-argall'];

export const HOUSE_ARGALL_FAMILY = Object.freeze({
  ...BASE_FAMILY,
  houses: Object.freeze([
    ...BASE_FAMILY.houses,
    Object.freeze({
      id: DRAIG_HOUSE_ID,
      name: 'Haus Draig',
      motto: '',
      emblem: DRAIG_EMBLEM,
      status: 'active'
    })
  ]),
  persons: Object.freeze([
    ...BASE_FAMILY.persons,

    // Höchste konkrete Generation: der ausdrückliche Großvater Brinthans und Uthyrs.
    person('cyran-argall', 'Cyran Argall', 'male', '1629', {
      death: '????',
      status: 'dead',
      lineageRole: 'mainline',
      title: 'Ältestes überliefertes Oberhaupt des Hauses Argall'
    }),
    person('gweneth-spouse-argall', 'Gweneth', 'female', '1633', {
      death: '????',
      status: 'dead',
      houseId: '',
      familyRole: 'married'
    }),

    // Elternlinie und der einzige Seitenzweig der Großelterngeneration.
    person('brenar-argall', 'Brenar Argall', 'male', '1659', {
      death: '????',
      status: 'dead',
      lineageRole: 'mainline',
      title: 'Vater Brinthans und Uthyrs'
    }),
    person('nerwen-spouse-argall', 'Nerwen', 'female', '1663', {
      death: '????',
      status: 'dead',
      houseId: '',
      familyRole: 'married'
    }),
    person('iwrian-argall', 'Iwrian Argall', 'male', '1662', {
      title: 'Begründer der kleinen Vetterlinie · Einziger Überlebender seiner Generation'
    }),
    person('avelyn-spouse-argall', 'Avelyn', 'female', '1666', {
      death: '????',
      status: 'dead',
      houseId: '',
      familyRole: 'married'
    }),

    // Gegenwärtige Brüderlinie.
    person('brinthan-argall', 'Brinthan Argall', 'male', '1687', {
      lineageRole: 'head',
      title: 'Oberhaupt des Hauses Argall',
      tags: ['53 Jahre']
    }),
    person('eris-argall', 'Eris Argall', 'female', '1691', {
      houseId: '',
      familyRole: 'married',
      title: 'Ehefrau Brinthan Argalls',
      tags: ['49 Jahre']
    }),
    person('uthyr-argall', 'Uthyr Argall', 'male', '1688', {
      title: 'Jüngerer Bruder Brinthan Argalls',
      tags: ['52 Jahre']
    }),
    person('rhewena-argall', 'Rhewena', 'female', '1690', {
      houseId: '',
      familyRole: 'married',
      title: 'Ehefrau Uthyr Argalls',
      tags: ['50 Jahre'],
      notes: 'Der Vorname Rhewena ist aus dem weiblichen Rheunwaith-Präfix Rhew und der Endung -ena gebildet.'
    }),

    // Shylene und Iolo behalten ihre bereits in Haus Draig geführten Jahrgänge.
    sharedPerson(ARGALL_DRAIG_AFFAIR.shylene, {
      familyRole: 'core',
      title: 'Tochter Brinthan und Eris Argalls · Affäre Owain Draigs',
      tags: ['30 Jahre'],
      notes: 'Ihre geheime Affäre mit Owain Draig wird in beiden Familienakten unter derselben Verbindungs-ID geführt.'
    }),
    sharedPerson(ARGALL_DRAIG_AFFAIR.owain, {
      familyRole: 'affair',
      title: 'Geheime Affäre Shylene Argalls',
      portrait: HOUSE_DRAIG_PORTRAITS[ARGALL_DRAIG_AFFAIR.owain.id]
    }),
    sharedPerson(ARGALL_DRAIG_AFFAIR.child, {
      familyRole: 'bastard',
      title: 'Unehelicher Sohn Shylene Argalls und Owain Draigs',
      tags: ['5 Jahre']
    }),

    // Uthyrs vier Kinder; alle unter 28 bleiben ohne Ehe oder Verlobung.
    person('maelric-argall', 'Maelric Argall', 'male', '1715', {
      title: 'Ältester Sohn Uthyr und Rhewena Argalls',
      tags: ['25 Jahre'],
      notes: 'Unverheiratet und ohne Verlobung.'
    }),
    person('sairwen-argall', 'Sairwen Argall', 'female', '1719', {
      title: 'Älteste Tochter Uthyr und Rhewena Argalls',
      tags: ['21 Jahre'],
      notes: 'Unverheiratet und ohne Verlobung.'
    }),
    person('ellian-argall', 'Ellian Argall', 'male', '1724', {
      title: 'Jüngerer Sohn Uthyr und Rhewena Argalls',
      tags: ['16 Jahre'],
      notes: 'Unverheiratet und ohne Verlobung.'
    }),
    person('avelys-argall', 'Avelys Argall', 'female', '1728', {
      title: 'Jüngste Tochter Uthyr und Rhewena Argalls',
      tags: ['12 Jahre'],
      notes: 'Unverheiratet und ohne Verlobung.'
    }),

    // Eine einzige Vetterlinie hält das Bürgerhaus klein.
    person('dyrwyn-argall', 'Dyrwyn Argall', 'male', '1689', {
      title: 'Vetter Brinthan und Uthyr Argalls'
    }),
    person('ellena-spouse-argall', 'Ellena', 'female', '1693', {
      houseId: '',
      familyRole: 'married',
      title: 'Ehefrau Dyrwyn Argalls'
    }),
    person('thalwyn-argall', 'Thalwyn Argall', 'male', '1717', {
      title: 'Sohn der Argall-Vetterlinie',
      tags: ['23 Jahre'],
      notes: 'Unverheiratet und ohne Verlobung.'
    })
  ]),
  partnerships: Object.freeze([
    ...BASE_FAMILY.partnerships,
    createMarriage('marriage-cyran-gweneth-argall', ...GRANDPARENT_IDS),
    createMarriage('marriage-brenar-nerwen-argall', ...PARENT_IDS),
    createMarriage('marriage-iwrian-avelyn-argall', ...UNCLE_IDS),
    createMarriage('marriage-brinthan-eris-argall', ...BRINTHAN_IDS),
    createMarriage('marriage-uthyr-rhewena-argall', ...UTHYR_IDS),
    createMarriage('marriage-dyrwyn-ellena-argall', ...COUSIN_IDS),
    createMarriage(ARGALL_DRAIG_AFFAIR.id, ...ARGALL_DRAIG_AFFAIR.participantIds, {
      type: 'affair',
      status: 'secret',
      notes: 'Geheime Affäre zwischen Owain Draig und Shylene Argall.'
    })
  ]),
  parentages: Object.freeze([
    ...createParentages(['cyran-argall'], FOUNDER_IDS, BASE_FAMILY.lineage.founderPartnershipId, {
      type: 'claimed',
      certainty: 'probable',
      notes: 'Nicht einzeln überlieferte Generationen verbinden das Gründerpaar mit Cyran Argall.',
      extensions: { timeJumpId: TIME_JUMP_ID }
    }),
    ...createParentages(['brenar-argall', 'iwrian-argall'], GRANDPARENT_IDS, 'marriage-cyran-gweneth-argall'),
    ...createParentages(['brinthan-argall', 'uthyr-argall'], PARENT_IDS, 'marriage-brenar-nerwen-argall'),
    ...createParentages(['dyrwyn-argall'], UNCLE_IDS, 'marriage-iwrian-avelyn-argall'),
    ...createParentages(['shylene-argall'], BRINTHAN_IDS, 'marriage-brinthan-eris-argall'),
    ...createParentages(
      [ARGALL_DRAIG_AFFAIR.child.id],
      ARGALL_DRAIG_AFFAIR.participantIds,
      ARGALL_DRAIG_AFFAIR.id,
      {
        legitimacy: 'illegitimate',
        notes: 'Iolo Argall ist der uneheliche Sohn aus Shylenes geheimer Affäre mit Owain Draig.'
      }
    ),
    ...createParentages(
      ['maelric-argall', 'sairwen-argall', 'ellian-argall', 'avelys-argall'],
      UTHYR_IDS,
      'marriage-uthyr-rhewena-argall'
    ),
    ...createParentages(['thalwyn-argall'], COUSIN_IDS, 'marriage-dyrwyn-ellena-argall')
  ]),
  cadetBranches: Object.freeze([]),
  timeJumps: Object.freeze([
    Object.freeze({
      ...BASE_FAMILY.timeJumps[0],
      childIds: Object.freeze(['cyran-argall']),
      toYear: '1629',
      label: 'Die belegte Argall-Linie setzt mit Cyran, dem Großvater Brinthans und Uthyrs, um 1629 wieder ein',
      notes: 'Der Zeitsprung ist der einzige absolute Generationentrenner und führt direkt zur höchsten konkret ausgearbeiteten Generation.',
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
  lineage: Object.freeze({
    ...BASE_FAMILY.lineage,
    crestSubtitle: 'Bürgerliches Haus aus Llysfaen'
  }),
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
    sourceNote: 'Haus Argall ist als kleines Bürgerhaus von Llysfaen angelegt. Auf unbekanntes Gründerpaar, eisernen Hausknoten und genau einen seriellen Zeitsprung folgt Cyran Argall als Großvater Brinthans und Uthyrs. Brinthan ist gegenwärtiges Oberhaupt; seine Tochter Shylene und ihr Sohn Iolo behalten die bereits in Haus Draig geführten Jahrgänge 1710 und 1735. Owain, Shylene, Iolo und ihre Affäre verwenden in beiden Akten dieselben Weltpersonen- und Verbindungs-IDs. Uthyrs Ehefrau Rhewena sowie alle weiteren erfundenen Vornamen folgen dem Rheunwaith-Namensschema des Aleria Almanachs. Maelric, Sairwen, Ellian, Avelys, Thalwyn und Iolo sind unter 28 und bleiben unverheiratet. Brenar, Nerwen und Avelyn aus der Elterngeneration sind verstorben; Iwrian lebt als einzige Ausnahme noch. Iwrians einziger Sohn Dyrwyn bildet mit einem einzigen unverheirateten Nachkommen die bewusst schmale Vetterlinie. Die zwölf vorgegebenen Porträts und das Hauswappen wurden lokal gesichert.'
  })
});
