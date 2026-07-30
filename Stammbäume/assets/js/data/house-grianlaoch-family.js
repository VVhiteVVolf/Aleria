import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createMarriage,
  createParentages,
  createWardAwayBranch
} from './family-record-builders.js';
import { HOUSE_GRIANLAOCH_PORTRAITS } from './house-grianlaoch-portraits.js';
import {
  SONNENKUESTE_HOUSE_EMBLEMS,
  SONNENKUESTE_HOUSE_PROFILES
} from './sonnenkueste-house-profiles.js';

const GRIANLAOCH_HOUSE_ID = 'house-grianlaoch';
const GRIANLAOCH_EMBLEM = SONNENKUESTE_HOUSE_EMBLEMS.grianlaoch;
const ILLEWOD_HOUSE_ID = 'house-illewod';
const ILLEWOD_EMBLEM = SONNENKUESTE_HOUSE_EMBLEMS.illewod;
const FOUNDER_PARTNERSHIP_ID = 'marriage-anali-tynan';

// Die Weltidentitäten stammen aus der bereits vorhandenen Illewod-Akte. Sie
// bleiben auch dann stabil, wenn die Kinder sichtbar den neuen Hausnamen tragen.
const WORLD_PERSON_IDS = Object.freeze({
  'tynan-gallchobhair': 'person:haus-gallchobhair:tynan-gallchobhair',
  'anali-illewod': 'person:haus-illewod:anali-illewod',
  'dymphna-gallchobhair': 'person:haus-gallchobhair:dymphna-gallchobhair',
  'deaglan-gallchobhair': 'person:haus-gallchobhair:deaglan-gallchobhair'
});

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

function person(id, name, sex, birth, options = {}) {
  return createFamilyPerson({
    id,
    worldPersonId: WORLD_PERSON_IDS[id],
    name,
    sex,
    birth,
    death: options.death || '',
    status: options.status || '',
    portrait: HOUSE_GRIANLAOCH_PORTRAITS[id] || '',
    houseId: options.houseId || GRIANLAOCH_HOUSE_ID,
    familyRole: options.familyRole || 'core',
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

function house(id, name, emblem = '') {
  return { id, name, motto: '', emblem, status: 'active' };
}

export const HOUSE_GRIANLAOCH_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-grianlaoch',
    title: 'Haus Grianlaoch',
    motto: '',
    description: 'Junges Ritterhaus in Gallchofaen bei Aberon. Tynan Gallchobhair zog nach den Bränden von Dun Laog mit albischen Kriegern und Siedlern an die Sonnenküste und begründete dort das Haus Grianlaoch, das Haus Illewod lehns- und ritterdienstpflichtig ist.',
    emblem: GRIANLAOCH_EMBLEM,
    houseProfile: SONNENKUESTE_HOUSE_PROFILES.grianlaoch
  },
  houses: [
    house(GRIANLAOCH_HOUSE_ID, 'Haus Grianlaoch', GRIANLAOCH_EMBLEM),
    house(ILLEWOD_HOUSE_ID, "Haus Illewod O'Aberon", ILLEWOD_EMBLEM),
    house('house-gallchobhair', 'Clan Gallchobhair', 'assets/images/houses/clan-gallchobhair.svg')
  ],
  persons: [
    person('tynan-gallchobhair', 'Tynan Gallchobhair', 'male', '1696', {
      title: 'Gründer und Ritterherr des Hauses Grianlaoch',
      lineageRole: 'head',
      notes: 'Tynan kam nach den Bränden von Dun Laog mit Gallchobhair-Kriegern und albischen Siedlern nach Aberon. In Gallchofaen begründete er das junge Ritterhaus Grianlaoch unter der Lehnshoheit Graf Merwin Illewods.'
    }),
    person('anali-illewod', 'Anali Illewod', 'female', '1697', {
      houseId: ILLEWOD_HOUSE_ID,
      familyRole: 'married',
      title: 'Ehefrau Tynans und Mitgründerin des Hauses Grianlaoch',
      notes: 'Anali gehört dem Haus Illewod an. Ihre Ehe mit Tynan verbindet das junge Grianlaoch-Geschlecht unmittelbar mit den Grafen von Aberon.'
    }),
    person('dymphna-gallchobhair', 'Dymphna Grianlaoch', 'female', '1724', {
      familyRole: 'ward-away',
      title: 'Weggegebenes Mündel bei Haus Illewod',
      tags: ['Fortgegebenes Mündel'],
      notes: 'Dymphna ist das leibliche Kind Tynans und Analis. Sie wurde zur Festigung der Verbindung als Mündel an Graf Merwin Illewod gegeben und bleibt dynastisch ein Spross des Hauses Grianlaoch.'
    }),
    person('deaglan-gallchobhair', 'Deaglan Grianlaoch', 'male', '1724', {
      familyRole: 'ward-away',
      lineageRole: 'mainline',
      title: 'Erbe des Hauses Grianlaoch · Weggegebenes Mündel bei Haus Illewod',
      tags: ['Fortgegebenes Mündel'],
      notes: 'Deaglan ist das leibliche Kind Tynans und Analis sowie der in der Quelle genannte Erbe des Hauses. Er wurde gemeinsam mit Dymphna als Mündel an Graf Merwin Illewod gegeben.'
    })
  ],
  partnerships: [
    createMarriage(FOUNDER_PARTNERSHIP_ID, 'anali-illewod', 'tynan-gallchobhair')
  ],
  parentages: createParentages(
    ['dymphna-gallchobhair', 'deaglan-gallchobhair'],
    ['anali-illewod', 'tynan-gallchobhair'],
    FOUNDER_PARTNERSHIP_ID,
    {
      idPrefix: 'parentage-biological',
      notes: 'Leibliche Kinder Anali Illewods und Tynan Gallchobhairs.'
    }
  ),
  cadetBranches: [
    createWardAwayBranch({
      id: 'ward-away-dymphna-illewod',
      name: "Haus Illewod O'Aberon",
      parentPersonId: 'dymphna-gallchobhair',
      houseId: ILLEWOD_HOUSE_ID,
      targetFamilyId: 'haus-illewod',
      emblem: ILLEWOD_EMBLEM,
      crestFrame: 'gold',
      notes: 'Dymphna Grianlaoch wurde als Mündel an Graf Merwin Illewod vermittelt.'
    }),
    createWardAwayBranch({
      id: 'ward-away-deaglan-illewod',
      name: "Haus Illewod O'Aberon",
      parentPersonId: 'deaglan-gallchobhair',
      houseId: ILLEWOD_HOUSE_ID,
      targetFamilyId: 'haus-illewod',
      emblem: ILLEWOD_EMBLEM,
      crestFrame: 'gold',
      notes: 'Deaglan Grianlaoch wurde als Mündel an Graf Merwin Illewod vermittelt.'
    })
  ],
  timeJumps: [],
  lineage: {
    founderPartnershipId: FOUNDER_PARTNERSHIP_ID,
    houseId: GRIANLAOCH_HOUSE_ID,
    crestSubtitle: 'Junges Ritterhaus aus Gallchofaen · Kadettenhaus des Clan Gallchobhair',
    crestEmblemScale: 0.86,
    crestFrame: 'silver',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' },
    originHouse: { enabled: false }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'tynan-gallchobhair',
    orientation: 'vertical',
    ancestorDepth: 4,
    descendantDepth: 4,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    sourceRevision: 1,
    sourceModule: 'Haus Grianlaoch (bereitgestellte Altdaten)',
    sourceNote: 'Die Akte verwendet die vier bereits in Haus Illewod angelegten Weltpersonen, die dort vorhandene Ehe sowie dieselben biologischen Elternschafts-IDs. Tynan Gallchobhair und Anali Illewod bilden das Gründerpaar; das Grianlaoch-Wappen steht seriell zwischen ihnen und ihren beiden Kindern. Dymphna und Deaglan tragen im Herkunftsbaum den dunkelblauen ward-away-Rahmen und besitzen jeweils einen direkten Vermittlungsknoten zu Haus Illewod. In der Illewod-Gegenakte bleiben sie aufgenommene ward-Mündel Graf Merwins. Der im Infokasten ausdrücklich als Sitz genannte Name Gallchofaen wird gegenüber der Fließtextvariante Gallochfaen normalisiert.',
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
    registryManagedRecordFields: ['folderPath'],
    chartViewport: { initialPosition: 'focus', initialScale: 0.72 }
  }
});
