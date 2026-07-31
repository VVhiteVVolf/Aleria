import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_SLIABH_PORTRAITS } from './house-sliabh-portraits.js';
import {
  TAL_DER_MILANE_HOUSE_EMBLEMS,
  TAL_DER_MILANE_HOUSE_PROFILES
} from './tal-der-milane-house-profiles.js';

const SLIABH_HOUSE_ID = 'house-sliabh';
const SLIABH_EMBLEM = TAL_DER_MILANE_HOUSE_EMBLEMS.sliabh;

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

const SUCCESSION_TITLES = Object.freeze({
  'odhran-sliabh': 'Gründer und Ritterherr des Hauses Sliabh seit 1720',
  'gorman-sliabh': 'Erster Erbe des Hauses Sliabh',
  'haodh-sliabh': 'Zweiter Erbe des Hauses Sliabh'
});

function person(id, name, sex, birth = '????', options = {}) {
  const houseId = options.houseId === undefined ? SLIABH_HOUSE_ID : options.houseId;
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death: options.death || '',
    status: options.status || '',
    houseId,
    portrait: HOUSE_SLIABH_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === SLIABH_HOUSE_ID ? 'core' : 'married'),
    lineageRole: options.lineageRole || 'branch',
    title: options.title === undefined ? SUCCESSION_TITLES[id] || '' : options.title,
    tags: options.tags || [],
    notes: options.notes || '',
    extensions: {
      ...(options.extensions || {}),
      registryManagedFields: SOURCE_MANAGED_PERSON_FIELDS
    }
  });
}

function spouse(id, name, sex, birth, houseId, options = {}) {
  return person(id, name, sex, birth, {
    ...options,
    houseId,
    familyRole: 'married',
    lineageRole: 'branch'
  });
}

function house(id, name, emblem) {
  return { id, name, motto: '', emblem, status: 'active' };
}

const COUPLES = Object.freeze({
  founders: ['odhran-sliabh', 'labhoise-sliabh'],
  gorman: ['gorman-sliabh', 'oideach-sliabh'],
  ciara: ['bogus-ilyuncu', 'ciara-sliabh'],
  lomhan: ['lomhan-sliabh', 'wiorna-sliabh'],
  conan: ['conan-sliabh', 'caryl-durdynn']
});

const PARTNERS_BY_ID = Object.freeze({
  'marriage-odhran-labhoise-sliabh': COUPLES.founders,
  'marriage-gorman-oideach-sliabh': COUPLES.gorman,
  'engagement-bogus-ciara-sliabh': COUPLES.ciara,
  'marriage-lomhan-wiorna-sliabh': COUPLES.lomhan,
  'engagement-conan-caryl-durdynn': COUPLES.conan
});

function childrenOf(childIds, partnershipId) {
  return createParentages(childIds, PARTNERS_BY_ID[partnershipId], partnershipId, {
    idPrefix: 'sliabh-parentage'
  });
}

export const HOUSE_SLIABH_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-sliabh',
    title: "Haus Sliabh O'Caer Gwennol",
    motto: "Tannau'n Clymu Popeth",
    description: 'Ein aus Ceitheach stammendes Bergarbeitergeschlecht, das Merfyn Aderyn nach Cenyr führte und 1720 als niederes Ritterherrenhaus unter Haus Ilyuncu in Caer Gwennol begründet wurde.',
    emblem: SLIABH_EMBLEM,
    houseProfile: TAL_DER_MILANE_HOUSE_PROFILES.sliabh
  },
  houses: [
    house(SLIABH_HOUSE_ID, "Haus Sliabh O'Caer Gwennol", SLIABH_EMBLEM),
    house('house-ilyuncu', "Haus Ilyuncu O'Caer Gwennol", TAL_DER_MILANE_HOUSE_EMBLEMS.ilyuncu),
    house('house-durdynn', 'Haus Durdynn', TAL_DER_MILANE_HOUSE_EMBLEMS.durdynn)
  ],
  persons: [
    person('odhran-sliabh', 'Odhran Sliabh', 'male', '1670', {
      lineageRole: 'head',
      notes: 'Einst Bergmann in Ceitheach; von Merfyn Aderyn nach Cenyr geführt und 1720 zum Gründer des Hauses Sliabh erhoben.'
    }),
    person('labhoise-sliabh', 'Labhoise Sliabh', 'female', '1675', {
      familyRole: 'married'
    }),

    person('gorman-sliabh', 'Gormán Sliabh', 'male', '1697', { lineageRole: 'mainline' }),
    person('ciara-sliabh', 'Ciara Sliabh', 'female', '1702', {
      title: 'Wegverlobt an Haus Ilyuncu',
      tags: ['Wegverlobt']
    }),
    person('lomhan-sliabh', 'Lomhán Sliabh', 'male', '1700'),
    spouse('oideach-sliabh', 'Oideach', 'female', '1698', ''),
    spouse('bogus-ilyuncu', 'Bogus Ilyuncu', 'male', '1700', 'house-ilyuncu', {
      title: 'Verlobter Ciara Sliabhs',
      tags: ['Verlobt']
    }),
    spouse('wiorna-sliabh', 'Wiórna', 'female', '1702', ''),

    person('haodh-sliabh', 'Haodh Sliabh', 'male', '1716', { lineageRole: 'mainline' }),
    person('latharna-sliabh', 'Latharna Sliabh', 'female', '1721'),
    person('alwyn-sliabh', 'Alwyn Sliabh', 'male', '1735'),
    person('conan-sliabh', 'Cónán Sliabh', 'male', '1720'),
    person('brinley-sliabh', 'Brinley Sliabh', 'female', '1728'),
    spouse('caryl-durdynn', 'Caryl Durdynn', 'female', '????', 'house-durdynn', {
      title: 'Verlobte Cónán Sliabhs',
      tags: ['Verlobt']
    })
  ],
  partnerships: [
    createMarriage('marriage-odhran-labhoise-sliabh', ...COUPLES.founders),
    createMarriage('marriage-gorman-oideach-sliabh', ...COUPLES.gorman),
    createMarriage('engagement-bogus-ciara-sliabh', ...COUPLES.ciara, { type: 'engagement' }),
    createMarriage('marriage-lomhan-wiorna-sliabh', ...COUPLES.lomhan),
    createMarriage('engagement-conan-caryl-durdynn', ...COUPLES.conan, { type: 'engagement' })
  ],
  parentages: [
    ...childrenOf(['gorman-sliabh', 'ciara-sliabh', 'lomhan-sliabh'], 'marriage-odhran-labhoise-sliabh'),
    ...childrenOf(['haodh-sliabh', 'latharna-sliabh', 'alwyn-sliabh'], 'marriage-gorman-oideach-sliabh'),
    ...childrenOf(['conan-sliabh', 'brinley-sliabh'], 'marriage-lomhan-wiorna-sliabh')
  ],
  cadetBranches: [
    createMarriedAwayBranch({
      id: 'engaged-away-ciara-sliabh-ilyuncu',
      name: 'Haus Ilyuncu',
      subtitle: 'Wegverlobt an Haus Ilyuncu',
      parentPartnershipId: 'engagement-bogus-ciara-sliabh',
      houseId: 'house-ilyuncu',
      targetFamilyId: 'haus-ilyuncu',
      emblem: TAL_DER_MILANE_HOUSE_EMBLEMS.ilyuncu,
      notes: 'Ciara Sliabh ist mit Bogus Ilyuncu verlobt; die Verbindung wird nicht als geschlossene Ehe dargestellt.'
    })
  ],
  timeJumps: [],
  lineage: {
    founderPartnershipId: 'marriage-odhran-labhoise-sliabh',
    houseId: SLIABH_HOUSE_ID,
    crestSubtitle: 'Niederes Ritterherrenhaus von Caer Gwennol · Vasallen des Hauses Ilyuncu · gegründet 1720',
    crestEmblemScale: 0.86,
    crestFrame: 'silver',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'odhran-sliabh',
    orientation: 'vertical',
    ancestorDepth: 8,
    descendantDepth: 8,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    sourceRevision: 1,
    sourceModule: "Haus Sliabh O'Caer Gwennol (bereitgestellte Altdaten)",
    sourceNote: 'Die ausdrückliche Ortsvorgabe Caer Gwennol hat Vorrang vor dem widersprüchlichen Glyndraith-Feld der alten Hausvorlage. Sliabh ist ein niederes Ritterherrenhaus und unmittelbarer Vasall Ilyuncus. Odhran und Labhoise begründen 1720 das Haus; Gormán, Ciara und Lomhán sind ihre Kinder. Haodh, Latharna und Alwyn stammen ausschließlich von Gormán und Oideach, Cónán und Brinley ausschließlich von Lomhán und Wiórna. Ciara/Bogus und Cónán/Caryl bleiben Verlobungen. Die vier generischen unbekannten Verlobtenkarten der Vorlage werden nicht als Personen erfunden. Die Schreibweisen Ilyuncu und Durdynn folgen den kanonischen Registerhäusern.',
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
