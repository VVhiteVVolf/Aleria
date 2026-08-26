import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createMarriage,
  createParentages
} from './family-record-builders.js';
import { HOUSE_SUEDSTAHL_PORTRAITS } from './house-suedstahl-portraits.js';
import {
  KRONENTAL_HOUSE_EMBLEMS,
  KRONENTAL_HOUSE_PROFILES
} from './kronental-house-profiles.js';

const SUEDSTAHL_HOUSE_ID = 'house-suedstahl';

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

function person(id, name, sex, birth, death = '', options = {}) {
  const houseId = options.houseId === undefined ? SUEDSTAHL_HOUSE_ID : options.houseId;
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_SUEDSTAHL_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === SUEDSTAHL_HOUSE_ID ? 'core' : 'married'),
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

function spouse(id, name, sex, birth, death, houseId, options = {}) {
  return person(id, name, sex, birth, death, {
    ...options,
    houseId,
    familyRole: 'married'
  });
}

function house(id, name, emblem = '') {
  return {
    id,
    name,
    motto: '',
    emblem,
    status: 'active',
    extensions: { registryManagedFields: ['name', 'emblem', 'status'] }
  };
}

function marriage(id, firstId, secondId, options = {}) {
  return createMarriage(id, firstId, secondId, options);
}

function withManagedLayoutExtension(record, extensionName, extensionValue) {
  return {
    ...record,
    extensions: {
      ...record.extensions,
      [extensionName]: extensionValue,
      registryManagedExtensionFields: [
        ...(record.extensions?.registryManagedExtensionFields || []),
        extensionName
      ]
    }
  };
}

function clearManagedLayoutExtension(record, extensionName) {
  return {
    ...record,
    extensions: {
      ...record.extensions,
      registryManagedExtensionFields: [
        ...(record.extensions?.registryManagedExtensionFields || []),
        extensionName
      ]
    }
  };
}

function alignChildrenBelowPair(id, firstId, secondId, options = {}) {
  return withManagedLayoutExtension(
    marriage(id, firstId, secondId, options),
    'chartAlignChildGroupBelowParentPair',
    true
  );
}

function childrenOf(childIds, partnershipId, parentIds) {
  return createParentages(childIds, parentIds, partnershipId, {
    idPrefix: 'suedstahl-parentage'
  });
}

export const HOUSE_SUEDSTAHL_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-suedstahl',
    title: 'Clan Südstahl',
    motto: 'Loyalität vor Blut',
    description: 'Junger Huskarlclan von Heldenwacht, 1691 durch Salah aus Istharan und Gormlaith Frisealach gegründet. Südstahl verbindet südliche Schwertkunst und Seefahrt mit albischem Erbe, Gelehrsamkeit und unverbrüchlicher Treue zu Clan Vaeren.',
    emblem: KRONENTAL_HOUSE_EMBLEMS.suedstahl,
    houseProfile: KRONENTAL_HOUSE_PROFILES.suedstahl
  },
  houses: [
    house(SUEDSTAHL_HOUSE_ID, 'Clan Südstahl', KRONENTAL_HOUSE_EMBLEMS.suedstahl),
    house('house-frisealach', 'Clan Frisealach'),
    house('house-tauwind', 'Clan Tauwind', KRONENTAL_HOUSE_EMBLEMS.tauwind),
    house('house-donnerblut', 'Clan Donnerblut', KRONENTAL_HOUSE_EMBLEMS.donnerblut)
  ],
  persons: [
    person('salah-suedstahl', 'Salah „Südstahl“ aus Istharan', 'male', '1651', '1719', {
      lineageRole: 'head',
      title: 'Gründer des Clans Südstahl · Justiziar König Rag Blauzahns',
      tags: ['Gründer'],
      notes: 'Südländischer Seefahrer, Schwertkämpfer und Veteran der Gilde Wintersonne.'
    }),
    spouse('gormlaith-frisealach', 'Gormlaith Frisealach', 'female', '1652', '1727', 'house-frisealach', {
      title: 'Mitgründerin des Clans Südstahl · Veteranin der Gilde Wintersonne',
      tags: ['Gründerin']
    }),

    person('malak-suedstahl', 'Malak Südstahl', 'male', '1690', '', {
      lineageRole: 'head',
      title: 'Oberhaupt des Clans seit 1719 · Leiter der Schwertschule Südstahl'
    }),
    person('raghan-suedstahl', 'Raghan Südstahl', 'male', '1693', '', {
      title: 'Verwalter der Clanfinanzen · Diener des Oberkämmerers'
    }),
    spouse('freydis-tauwind', 'Freydis Tauwind', 'female', '1692', '', 'house-tauwind', {
      title: 'Handelsbeauftragte des Clans · Verbindung zu Clan Tauwind'
    }),
    spouse('astrid-donnerblut', 'Astrid Donnerblut', 'female', '1695', '', 'house-donnerblut'),

    person('lydia-suedstahl', 'Lydia Südstahl', 'female', '1715', '', {
      title: 'Schwertkämpferin des Clans'
    }),
    person('maela-suedstahl', 'Maela Südstahl', 'female', '1717', '', {
      title: 'Studentin und Poetin'
    }),
    person('salah-ii-suedstahl', 'Salah II. Südstahl', 'male', '1722', '', {
      lineageRole: 'heir',
      title: 'Vorgesehener Erbe des Clans Südstahl'
    }),
    person('raghild-suedstahl', 'Raghild Südstahl', 'female', '1717', '', {
      title: 'Angehende Kauffrau'
    }),
    person('diarmuid-suedstahl', 'Diarmuid Südstahl', 'male', '1725', '', {
      title: 'Junger Krieger des Clans'
    })
  ],
  partnerships: [
    clearManagedLayoutExtension(
      marriage('marriage-salah-gormlaith-suedstahl', 'salah-suedstahl', 'gormlaith-frisealach', {
        start: '1690',
        status: 'ended',
        end: '1719'
      }),
      'chartAlignChildGroupBelowParentPair'
    ),
    alignChildrenBelowPair('marriage-malak-freydis-suedstahl', 'malak-suedstahl', 'freydis-tauwind'),
    alignChildrenBelowPair('marriage-raghan-astrid-suedstahl', 'raghan-suedstahl', 'astrid-donnerblut')
  ],
  parentages: [
    ...childrenOf(
      ['malak-suedstahl', 'raghan-suedstahl'],
      'marriage-salah-gormlaith-suedstahl',
      ['salah-suedstahl', 'gormlaith-frisealach']
    ),
    ...childrenOf(
      ['lydia-suedstahl', 'maela-suedstahl', 'salah-ii-suedstahl'],
      'marriage-malak-freydis-suedstahl',
      ['malak-suedstahl', 'freydis-tauwind']
    ),
    ...childrenOf(
      ['raghild-suedstahl', 'diarmuid-suedstahl'],
      'marriage-raghan-astrid-suedstahl',
      ['raghan-suedstahl', 'astrid-donnerblut']
    )
  ],
  cadetBranches: [],
  timeJumps: [],
  lineage: {
    founderPartnershipId: 'marriage-salah-gormlaith-suedstahl',
    houseId: SUEDSTAHL_HOUSE_ID,
    crestSubtitle: 'Huskarlclan von Heldenwacht · Königliches Jarltum Kronental',
    crestEmblemScale: 0.86,
    crestFrame: 'silver',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'salah-suedstahl',
    orientation: 'vertical',
    ancestorDepth: 8,
    descendantDepth: 8,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    preparedMainLine: true,
    chartLayoutPolicy: 'strict-v1',
    sourceRevision: 5,
    sourceModule: 'Clan Südstahl (überlieferte HTML-Familienakte)',
    sourceNote: 'Vollständiger überlieferter Stammbaum von Salah und Gormlaith bis zu ihren fünf Enkelkindern. Die einmalige Nennung „Südwind“ in der allgemeinen Quelltabelle wurde wegen der durchgehend belegten Bezeichnung Südstahl als Tippfehler verworfen. Namenlose Verlobten-Platzhalter wurden nicht importiert.',
    registryManagedExtensionFields: ['blankFamily', 'sourceNote', 'chartLayoutPolicy'],
    registryManagedHouseProfileFields: [
      'rankId', 'seat', 'barony', 'county', 'kingdom', 'secondarySeats',
      'liegeHouseId', 'liegeHouseName', 'folderIcons', 'regionEmblems'
    ],
    registryManagedRecordFields: ['folderPath'],
    registryTombstones: {
      persons: ['haus-suedstahl-gruender', 'haus-suedstahl-gruenderin'],
      partnerships: ['haus-suedstahl-gruenderbund'],
      parentages: [],
      cadetBranches: [],
      timeJumps: []
    }
  },
  folderPath: KRONENTAL_HOUSE_PROFILES.suedstahl.folderPath
});
