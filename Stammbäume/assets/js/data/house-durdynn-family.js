import { createFounderTimeJumpPlaceholderHouseFamily } from './blank-house-family-factory.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_DURDYNN_PORTRAITS } from './house-durdynn-portraits.js';
import { HOUSE_SLIABH_LOCAL_PORTRAITS } from './house-sliabh-local-portraits.js';
import {
  TAL_DER_MILANE_HOUSE_EMBLEMS,
  TAL_DER_MILANE_HOUSE_PROFILES
} from './tal-der-milane-house-profiles.js';

const DURDYNN_HOUSE_ID = 'house-durdynn';
const BASE_FAMILY = createFounderTimeJumpPlaceholderHouseFamily({
  id: 'haus-durdynn',
  title: 'Haus Durdynn',
  emblem: TAL_DER_MILANE_HOUSE_EMBLEMS.durdynn,
  houseProfile: TAL_DER_MILANE_HOUSE_PROFILES.durdynn,
  description: 'Teilweise belegte Familienakte des niederen Ritterhauses Durdynn aus Penbryn.',
  toYear: 'unbekannt',
  timeJumpLabel: 'Die spätere belegte Durdynn-Linie setzt mit Caryl wieder ein'
});
const FOUNDER_IDS = BASE_FAMILY.partnerships[0].participantIds;
const TIME_JUMP_ID = BASE_FAMILY.timeJumps[0].id;

const SOURCE_MANAGED_PERSON_FIELDS = Object.freeze([
  'worldPersonId',
  'name',
  'title',
  'sex',
  'status',
  'birth',
  'death',
  'portrait',
  'portraitPlaceholder',
  'houseId',
  'familyRole',
  'lineageRole',
  'tags',
  'notes'
]);

function person(id, name, sex, houseId, options = {}) {
  return createFamilyPerson({
    id,
    name,
    sex,
    birth: options.birth || '????',
    death: options.death || '',
    status: options.status || '',
    houseId,
    portrait: options.portrait || '',
    familyRole: options.familyRole || (houseId === DURDYNN_HOUSE_ID ? 'core' : 'married'),
    lineageRole: options.lineageRole || 'branch',
    title: options.title || '',
    tags: options.tags || [],
    notes: options.notes || '',
    extensions: {
      ...(options.extensions || {}),
      registryManagedFields: SOURCE_MANAGED_PERSON_FIELDS
    }
  });
}

export const HOUSE_DURDYNN_FAMILY = Object.freeze({
  ...BASE_FAMILY,
  houses: [
    ...BASE_FAMILY.houses,
    {
      id: 'house-sliabh',
      name: "Haus Sliabh O'Caer Gwennol",
      motto: '',
      emblem: TAL_DER_MILANE_HOUSE_EMBLEMS.sliabh,
      status: 'active'
    }
  ],
  persons: [
    ...BASE_FAMILY.persons,
    person('caryl-durdynn', 'Caryl Durdynn', 'female', DURDYNN_HOUSE_ID, {
      portrait: HOUSE_DURDYNN_PORTRAITS['caryl-durdynn'],
      title: 'Wegverlobt an Haus Sliabh',
      tags: ['Wegverlobt'],
      notes: 'Bislang einzige namentlich belegte Person dieses Durdynn-Zweigs; ihre genaue Abstammung und ihr Geburtsjahr sind nicht überliefert.'
    }),
    person('conan-sliabh', 'Cónán Sliabh', 'male', 'house-sliabh', {
      birth: '1720',
      portrait: HOUSE_SLIABH_LOCAL_PORTRAITS['conan-sliabh'],
      title: 'Verlobter Caryl Durdynns',
      tags: ['Verlobt']
    })
  ],
  partnerships: [
    ...BASE_FAMILY.partnerships,
    createMarriage('engagement-conan-caryl-durdynn', 'conan-sliabh', 'caryl-durdynn', {
      type: 'engagement'
    })
  ],
  parentages: [
    ...createParentages(
      ['caryl-durdynn'],
      FOUNDER_IDS,
      BASE_FAMILY.lineage.founderPartnershipId,
      {
        idPrefix: 'durdynn-parentage',
        type: 'claimed',
        certainty: 'probable',
        notes: 'Nicht einzeln überlieferte Generationen verbinden das Platzhalter-Gründerpaar nur abstrakt mit dem bekannten Caryl-Zweig.',
        extensions: { timeJumpId: TIME_JUMP_ID }
      }
    )
  ],
  cadetBranches: [
    createMarriedAwayBranch({
      id: 'engaged-away-caryl-durdynn-sliabh',
      name: 'Haus Sliabh',
      subtitle: 'Wegverlobt an Haus Sliabh',
      parentPartnershipId: 'engagement-conan-caryl-durdynn',
      houseId: 'house-sliabh',
      targetFamilyId: 'haus-sliabh',
      emblem: TAL_DER_MILANE_HOUSE_EMBLEMS.sliabh,
      crestFrame: 'silver',
      notes: 'Caryl Durdynn ist mit Cónán Sliabh verlobt; die Verbindung wird nicht als geschlossene Ehe dargestellt.'
    })
  ],
  timeJumps: [
    {
      ...BASE_FAMILY.timeJumps[0],
      childIds: ['caryl-durdynn'],
      toYear: '????',
      label: 'Die spätere belegte Durdynn-Linie setzt mit Caryl wieder ein',
      notes: 'Der serielle Zeitsprung bewahrt die unbekannte Abstammung zwischen dem vorbereiteten Ursprungshaus und Caryl; er steht niemals parallel zu einer anderen Fortsetzung.'
    }
  ],
  view: {
    ...BASE_FAMILY.view,
    focusPersonId: 'caryl-durdynn',
    limitGenerations: false
  },
  extensions: {
    ...BASE_FAMILY.extensions,
    blankFamily: false,
    preparedTimeJump: false,
    documentedFragment: true,
    sourceRevision: 1,
    sourceModule: 'Haus Sliabh (bereitgestellte Altdaten; Caryl-Durdynn-Gegenverbindung)',
    sourceNote: 'Die Durdynn-Quelle selbst liegt noch nicht vor. Deshalb wird keine konkrete Elternschaft für Caryl erfunden: Das vorhandene unbekannte Gründerpaar führt ausschließlich über einen seriellen, als wahrscheinlich markierten Überlieferungssprung zu ihr. Belegt und beidseitig gespiegelt ist nur ihre Verlobung mit Cónán Sliabh. Eine spätere vollständige Durdynn-Quelle kann diese Teilakte revisionsgebunden ersetzen.',
    registryManagedExtensionFields: ['sourceNote'],
    registryManagedHouseProfileFields: [
      'rankId',
      'seat',
      'barony',
      'county',
      'kingdom',
      'liegeHouseId',
      'liegeHouseName',
      'secondarySeats',
      'regionEmblems'
    ],
    registryManagedRecordFields: ['folderPath']
  }
});
