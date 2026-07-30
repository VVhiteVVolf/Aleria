import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import {
  AEHRENTAL_HOUSE_EMBLEMS,
  AEHRENTAL_HOUSE_PROFILES
} from './aehrental-house-profiles.js';
import { HOUSE_MORCANHUC_PORTRAITS } from './house-morcanhuc-portraits.js';

const MORCANHUC_HOUSE_ID = 'house-morcanhuc';
const MORCANHUC_EMBLEM = AEHRENTAL_HOUSE_EMBLEMS.morcanhuc;

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
  'arthos-morcanhuc': 'Ritterfürst von Glyndraith · Gründer und Oberhaupt',
  'charlton-1724-morcanhuc': 'Erster Erbe des Hauses Morcanhuc',
  'ianto-morcanhuc': 'Zweiter Erbe des Hauses Morcanhuc',
  'iorwerth-morcanhuc': 'Dritter Erbe des Hauses Morcanhuc'
});

function lineageRoleFor(personId) {
  if (personId === 'arthos-morcanhuc') return 'head';
  return SUCCESSION_TITLES[personId] ? 'mainline' : 'branch';
}

function person(id, name, sex, birth, death = '', options = {}) {
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId: options.houseId === undefined ? MORCANHUC_HOUSE_ID : options.houseId,
    portrait: HOUSE_MORCANHUC_PORTRAITS[id] || '',
    familyRole: options.familyRole || 'core',
    lineageRole: options.lineageRole || lineageRoleFor(id),
    title: options.title === undefined ? SUCCESSION_TITLES[id] || '' : options.title,
    tags: options.tags || [],
    notes: options.notes || '',
    extensions: {
      ...(options.extensions || {}),
      registryManagedFields: SOURCE_MANAGED_PERSON_FIELDS
    }
  });
}

function spouse(id, name, sex, birth, death = '', houseId = '', options = {}) {
  return person(id, name, sex, birth, death, {
    ...options,
    houseId,
    familyRole: options.familyRole || 'married',
    lineageRole: 'branch'
  });
}

function house(id, name, emblem = '') {
  return { id, name, motto: '', emblem, status: 'active' };
}

const COUPLES = Object.freeze({
  parents: ['charlton-1685-morcanhuc', 'deidrie-1687-morcanhuc'],
  arthos: ['ywen-grawn', 'arthos-morcanhuc'],
  bricelyn: ['imanie-marchog', 'bricelyn-morcanhuc'],
  barwyn: ['barwyn-morcanhuc', 'lowri-morcanhuc']
});

const PARENTS_BY_PARTNERSHIP = Object.freeze({
  'marriage-charlton-deidrie-morcanhuc': COUPLES.parents,
  'marriage-ywen-arthos': COUPLES.arthos,
  'marriage-imanie-bricelyn-marchog': COUPLES.bricelyn,
  'marriage-barwyn-lowri-morcanhuc': COUPLES.barwyn
});

function childrenOf(childIds, partnershipId) {
  return createParentages(
    childIds,
    PARENTS_BY_PARTNERSHIP[partnershipId],
    partnershipId,
    { idPrefix: 'morcanhuc-parentage' }
  );
}

export const HOUSE_MORCANHUC_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-morcanhuc',
    title: "Haus Morcanhuc O'Glyndraith",
    motto: '',
    description: 'Altes Teulu-Ritterhaus aus Glyndraith, das 1720 unter Sir Arthos Morcanhuc in den Rang eines Ritterfürstenhauses erhoben wurde.',
    emblem: MORCANHUC_EMBLEM,
    houseProfile: AEHRENTAL_HOUSE_PROFILES.morcanhuc
  },
  houses: [
    house(MORCANHUC_HOUSE_ID, "Haus Morcanhuc O'Glyndraith", MORCANHUC_EMBLEM),
    house('house-grawn', "Haus Grawn O'Glyndraith", AEHRENTAL_HOUSE_EMBLEMS.grawn),
    house('house-marchog', "Haus Marchog O'Glyndraith", AEHRENTAL_HOUSE_EMBLEMS.marchog)
  ],
  persons: [
    person('charlton-1685-morcanhuc', 'Charlton', 'male', '1685', '1720', {
      title: 'Vater der Gründergeneration'
    }),
    person('deidrie-1687-morcanhuc', 'Deidrie', 'female', '1687', '1720', {
      title: 'Mutter der Gründergeneration'
    }),

    person('arthos-morcanhuc', 'Arthos Morcanhuc', 'male', '1705', '', {
      notes: 'Ehemaliger Knappe Sir Iorwerths. Nach seiner Rückkehr wurde er 1720 zum Ritter geschlagen und zum Ritterfürsten erhoben.'
    }),
    person('bricelyn-morcanhuc', 'Bricelyn Morcanhuc', 'female', '1707', '', {
      title: 'Wegverheiratet an Haus Marchog',
      tags: ['Wegverheiratet']
    }),
    person('barwyn-morcanhuc', 'Barwyn Morcanhuc', 'male', '1709'),
    spouse('ywen-grawn', 'Ywen Grawn', 'female', '1700', '', 'house-grawn'),
    spouse('imanie-marchog', 'Imanie Marchog', 'male', '1699', '', 'house-marchog'),
    spouse('lowri-morcanhuc', 'Lowri', 'female', '1710'),

    person('charlton-1724-morcanhuc', 'Charlton Morcanhuc', 'male', '1724'),
    person('deidrie-1726-morcanhuc', 'Deidrie Morcanhuc', 'female', '1726'),
    person('ianto-morcanhuc', 'Ianto Morcanhuc', 'male', '1729'),
    person('iorwerth-morcanhuc', 'Iorwerth Morcanhuc', 'male', '1731'),
    person('ellanah-morcanhuc', 'Ellanah Morcanhuc', 'female', '1727')
  ],
  partnerships: [
    createMarriage('marriage-charlton-deidrie-morcanhuc', ...COUPLES.parents, {
      status: 'ended',
      end: '1720'
    }),
    createMarriage('marriage-ywen-arthos', ...COUPLES.arthos),
    createMarriage('marriage-imanie-bricelyn-marchog', ...COUPLES.bricelyn),
    createMarriage('marriage-barwyn-lowri-morcanhuc', ...COUPLES.barwyn)
  ],
  parentages: [
    ...childrenOf(
      ['arthos-morcanhuc', 'bricelyn-morcanhuc', 'barwyn-morcanhuc'],
      'marriage-charlton-deidrie-morcanhuc'
    ),
    ...childrenOf(
      [
        'charlton-1724-morcanhuc',
        'deidrie-1726-morcanhuc',
        'ianto-morcanhuc',
        'iorwerth-morcanhuc'
      ],
      'marriage-ywen-arthos'
    ),
    ...childrenOf(['ellanah-morcanhuc'], 'marriage-barwyn-lowri-morcanhuc')
  ],
  cadetBranches: [
    createMarriedAwayBranch({
      id: 'married-away-marchog-bricelyn',
      name: 'Haus Marchog',
      parentPartnershipId: 'marriage-imanie-bricelyn-marchog',
      houseId: 'house-marchog',
      targetFamilyId: 'haus-marchog',
      emblem: AEHRENTAL_HOUSE_EMBLEMS.marchog,
      subtitle: 'Wegverheiratet an Haus Marchog'
    })
  ],
  timeJumps: [],
  lineage: {
    founderPartnershipId: 'marriage-charlton-deidrie-morcanhuc',
    houseId: MORCANHUC_HOUSE_ID,
    crestSubtitle: 'Ritterfürstliches Haus von Glyndraith · gegründet 1720',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'charlton-1685-morcanhuc',
    orientation: 'vertical',
    ancestorDepth: 12,
    descendantDepth: 12,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    sourceRevision: 1,
    sourceNote: 'Genealogie, Lebensdaten, Erbfolge und Porträts folgen der bereitgestellten Morcanhuc-Haustabelle. Der Hausknoten liegt zwischen Charlton/Deidrie und ihren drei Kindern; Arthos bleibt durch Titel und Gründungsjahr der ausdrückliche Gründer der 1720 erhobenen Ritterfürstenlinie. Die vorhandenen Weltpersonen-, Beziehungs-IDs und Teilnehmerreihenfolgen von Arthos/Ywen in Grawn sowie Bricelyn/Imanie in Marchog werden unverändert wiederverwendet. Die vier Morcanhuc-Kinder von Arthos und Ywen stehen ausschließlich hier. Bricelyn wird an Marchog wegverheiratet; Rhon und Corryn bleiben ausschließlich in der fortführenden Marchog-Akte. Da alle Generationen unmittelbar belegt sind, wird kein Zeitsprung erfunden.',
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
