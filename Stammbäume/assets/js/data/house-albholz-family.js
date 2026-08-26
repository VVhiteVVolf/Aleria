import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createMarriage,
  createParentages
} from './family-record-builders.js';
import { HOUSE_ALBHOLZ_PORTRAITS } from './house-albholz-portraits.js';
import {
  KRONENTAL_HOUSE_EMBLEMS,
  KRONENTAL_HOUSE_PROFILES
} from './kronental-house-profiles.js';

const ALBHOLZ_HOUSE_ID = 'house-albholz';

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
  const houseId = options.houseId === undefined ? ALBHOLZ_HOUSE_ID : options.houseId;
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_ALBHOLZ_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === ALBHOLZ_HOUSE_ID ? 'core' : 'married'),
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

function alignChildrenBelowPair(record) {
  return {
    ...record,
    extensions: {
      ...record.extensions,
      chartAlignChildGroupBelowParentPair: true,
      registryManagedExtensionFields: [
        ...(record.extensions?.registryManagedExtensionFields || []),
        'chartAlignChildGroupBelowParentPair'
      ]
    }
  };
}

function childrenOf(childIds, partnershipId, parentIds) {
  return createParentages(childIds, parentIds, partnershipId, {
    idPrefix: 'albholz-parentage'
  });
}

export const HOUSE_ALBHOLZ_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-albholz',
    title: 'Clan Albholz',
    motto: '',
    description: 'Junger Huskarlclan von Heldenwacht, 1691 durch Albhric „Alberick“ Albholz gegründet. Der Clan verbindet die Kräuter- und Schattenkünste des Druidenhains mit nordischer Bodenständigkeit und loyalem Dienst an Clan Vaeren.',
    emblem: KRONENTAL_HOUSE_EMBLEMS.albholz,
    houseProfile: KRONENTAL_HOUSE_PROFILES.albholz
  },
  houses: [
    house(ALBHOLZ_HOUSE_ID, 'Clan Albholz', KRONENTAL_HOUSE_EMBLEMS.albholz),
    house('house-gruenhand', 'Clan Grünhand'),
    house('house-moorbrand', 'Clan Moorbrand', KRONENTAL_HOUSE_EMBLEMS.moorbrand),
    house('house-bjarnvarg', 'Clan Bjarnvarg', KRONENTAL_HOUSE_EMBLEMS.bjarnvarg)
  ],
  persons: [
    person('albhric-albholz', 'Albhric „Alberick“ Albholz', 'male', '1660', '1738', {
      lineageRole: 'head',
      title: 'Gründer des Clans Albholz · Meister der Schatten · Oberster Netzweber',
      tags: ['Gründer', 'Wintersonne'],
      notes: 'Schurke aus dem Druidenhain, enger Gefährte Rag Blauzahns und Begründer des Albholz-Spionagenetzes.'
    }),
    spouse('liorain-gruenhand', 'Liorain Grünhand', 'female', '1670', '', 'house-gruenhand', {
      title: 'Mitgründerin des Clans Albholz',
      tags: ['Gründerin'],
      notes: 'Die arrangierte Verbindung mit Albhric entwickelte sich zu einer ruhigen, beständigen Ehe.'
    }),

    person('branoc-albholz', 'Branoc Albholz', 'male', '1693', '', {
      lineageRole: 'head',
      title: 'Oberhaupt des Clans seit 1738',
      tags: ['Oberhaupt'],
      notes: 'Pflichtbewusster Erstgeborener und geradliniger Krieger.'
    }),
    person('toran-albholz', 'Toran Albholz', 'male', '1695', '', {
      title: 'Schatten des Jarls · Leiter des Spionagenetzwerks',
      notes: 'Übernahm Albhrics Netz und dient dem amtierenden König Sigurd. Die Figurenbeschreibung der Quelle nennt ihn abweichend Tolan.'
    }),
    person('eiran-albholz', 'Eiran Albholz', 'female', '1698', '', {
      title: 'In Clan Bjarnvarg verheiratet',
      tags: ['Wegverheiratet'],
      notes: 'Lebt nach ihrer arrangierten Ehe mit Sven weitgehend im Clan Bjarnvarg.'
    }),
    person('liora-albholz', 'Liora Albholz', 'female', '1700', '1700', {
      title: 'Totgeborene Tochter Albhrics und Liorains',
      tags: ['Totgeburt']
    }),

    spouse('mornhild-moorbrand', 'Mornhild Moorbrand', 'female', '1695', '', 'house-moorbrand', {
      title: 'Ehefrau Branocs · Hüterin der Hausordnung'
    }),
    person('saga-toran-affair', 'Saga', 'female', '1715', '', {
      houseId: '',
      familyRole: 'affair',
      title: 'Affäre Torans',
      tags: ['Affäre'],
      notes: 'Ihre Herkunft ist nicht überliefert; sie wird innerhalb des Clans lediglich geduldet.'
    }),
    spouse('sven-bjarnvarg', 'Sven Bjarnvarg', 'male', '1691', '', 'house-bjarnvarg', {
      title: 'Krieger des Clans Bjarnvarg · Ehemann Eirans'
    }),

    person('albhrin-albholz', 'Albhrin Albholz', 'male', '1716', '', {
      lineageRole: 'heir',
      title: 'Vorgesehener Erbe des Clans Albholz',
      tags: ['Erbe']
    }),
    person('maelaith-albholz', 'Maelaith Albholz', 'female', '1719'),
    person('elbric-albholz', 'Elbric Albholz', 'male', '1721'),
    person('torwynn-albholz', 'Torwynn Albholz', 'female', '1722'),
    person('lorcan-albholz', 'Lorcan Albholz', 'male', '1725')
  ],
  partnerships: [
    marriage('marriage-albhric-liorain-albholz', 'albhric-albholz', 'liorain-gruenhand', {
      start: '1692',
      status: 'ended',
      end: '1738'
    }),
    alignChildrenBelowPair(
      marriage('marriage-branoc-mornhild-albholz', 'branoc-albholz', 'mornhild-moorbrand')
    ),
    marriage('affair-toran-saga-albholz', 'toran-albholz', 'saga-toran-affair', {
      type: 'affair',
      status: 'active',
      notes: 'Andauernde Affäre ohne überlieferte Kinder.'
    }),
    marriage('marriage-eiran-sven-bjarnvarg', 'eiran-albholz', 'sven-bjarnvarg')
  ],
  parentages: [
    ...childrenOf(
      ['branoc-albholz', 'toran-albholz', 'eiran-albholz', 'liora-albholz'],
      'marriage-albhric-liorain-albholz',
      ['albhric-albholz', 'liorain-gruenhand']
    ),
    ...childrenOf(
      ['albhrin-albholz', 'maelaith-albholz', 'elbric-albholz', 'torwynn-albholz', 'lorcan-albholz'],
      'marriage-branoc-mornhild-albholz',
      ['branoc-albholz', 'mornhild-moorbrand']
    )
  ],
  cadetBranches: [],
  timeJumps: [],
  lineage: {
    founderPartnershipId: 'marriage-albhric-liorain-albholz',
    houseId: ALBHOLZ_HOUSE_ID,
    crestSubtitle: 'Huskarlclan von Heldenwacht · Königliches Jarltum Kronental',
    crestEmblemScale: 0.86,
    crestFrame: 'silver',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'albhric-albholz',
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
    sourceRevision: 4,
    sourceModule: 'Clan Albholz (überlieferte HTML-Familienakte)',
    sourceNote: 'Vollständiger benannter Stammbaum von Albhric und Liorain bis zu Branocs fünf Kindern. Albhrics Geburtsjahr 1660 stammt aus der genealogischen Hierarchietabelle; die einmalige Angabe 1691 in der Hofübersicht bezeichnet erkennbar die Clangründung. Die Namensvariante „Tolan“ in den Figurenbeschreibungen wurde zugunsten des mehrfach belegten „Toran“ verworfen. Namenlose Verlobten-Platzhalter wurden nicht importiert.',
    jarltum: 'Kronental',
    aldrimarRank: 'Huskarl',
    registryManagedExtensionFields: [
      'blankFamily',
      'sourceNote',
      'chartLayoutPolicy',
      'jarltum',
      'aldrimarRank'
    ],
    registryManagedHouseProfileFields: [
      'rankId', 'seat', 'barony', 'county', 'kingdom', 'secondarySeats',
      'liegeHouseId', 'liegeHouseName', 'folderIcons', 'regionEmblems'
    ],
    registryManagedRecordFields: ['folderPath'],
    registryTombstones: {
      persons: ['haus-albholz-gruender', 'haus-albholz-gruenderin'],
      partnerships: ['haus-albholz-gruenderbund'],
      parentages: [],
      cadetBranches: [],
      timeJumps: []
    }
  },
  folderPath: KRONENTAL_HOUSE_PROFILES.albholz.folderPath
});
