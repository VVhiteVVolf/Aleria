import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { createWorldPersonId } from '../domain/family-schema.js';
import {
  createFamilyPerson,
  createMarriage,
  createParentages
} from './family-record-builders.js';
import { HOUSE_FROSTGEBORENE_PORTRAITS } from './house-frostgeborene-portraits.js';
import {
  RORIKSHEIM_HOUSE_EMBLEMS,
  RORIKSHEIM_HOUSE_PROFILES
} from './roriksheim-house-profiles.js';

const FROSTGEBORENE_HOUSE_ID = 'house-frostgeborene';

const SOURCE_MANAGED_PERSON_FIELDS = Object.freeze([
  'worldPersonId', 'name', 'title', 'sex', 'status', 'birth', 'death',
  'portrait', 'portraitPlaceholder', 'houseId', 'familyRole',
  'lineageRole', 'tags', 'notes'
]);

const HEAD_IDS = new Set([
  'thorim-frostgeborene',
  'eirik-frostgeborene',
  'bjorn-frostgeborene'
]);

function lineageRoleFor(personId) {
  if (HEAD_IDS.has(personId)) return 'head';
  return personId === 'kjalt-frostgeborene' ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', options = {}) {
  const houseId = options.houseId === undefined ? FROSTGEBORENE_HOUSE_ID : options.houseId;
  return createFamilyPerson({
    id,
    worldPersonId: options.worldPersonId || '',
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_FROSTGEBORENE_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === FROSTGEBORENE_HOUSE_ID ? 'core' : 'married'),
    lineageRole: options.lineageRole || lineageRoleFor(id),
    title: options.title || '',
    tags: options.tags || [],
    notes: options.notes || '',
    extensions: {
      ...(options.extensions || {}),
      registryManagedFields: SOURCE_MANAGED_PERSON_FIELDS
    }
  });
}

function spouse(id, name, sex, birth = '????', death = '', houseId = '', options = {}) {
  return person(id, name, sex, birth, death, {
    ...options,
    houseId,
    familyRole: options.familyRole || 'married',
    lineageRole: 'branch'
  });
}

function house(id, name, emblem = '') {
  return {
    id,
    name,
    motto: '',
    emblem,
    status: 'active',
    extensions: { registryManagedFields: ['name', 'emblem'] }
  };
}

const COUPLES = Object.freeze({
  origin: ['jokul-kampfgeborene', 'hilda'],
  founders: ['thorim-frostgeborene', 'freydis'],
  eirik: ['eirik-frostgeborene', 'sigrid'],
  hallvard: ['hallvard-frostgeborene', 'svenja'],
  bjorn: ['bjorn-frostgeborene', 'gwelda'],
  tormod: ['tormod-frostgeborene', 'gudrun']
});

const PARTNERS_BY_ID = Object.freeze({
  'affair-jokul-hilda-kampfgeborene': COUPLES.origin,
  'marriage-thorim-freydis-frostgeborene': COUPLES.founders,
  'marriage-eirik-sigrid-frostgeborene': COUPLES.eirik,
  'marriage-hallvard-svenja-frostgeborene': COUPLES.hallvard,
  'marriage-bjorn-gwelda-frostgeborene': COUPLES.bjorn,
  'marriage-tormod-gudrun-frostgeborene': COUPLES.tormod
});

function marriage(partnershipId, options = {}) {
  return createMarriage(partnershipId, ...PARTNERS_BY_ID[partnershipId], options);
}

function childrenOf(childIds, partnershipId, options = {}) {
  return createParentages(childIds, PARTNERS_BY_ID[partnershipId], partnershipId, {
    idPrefix: 'frostgeborene-parentage',
    ...options
  });
}

export const HOUSE_FROSTGEBORENE_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-frostgeborene',
    title: 'Haus Frostgeborene',
    motto: '',
    description: 'Bürgerliches Bastardhaus in Rorikshall, hervorgegangen aus Jokul Kampfgeboreners unehelichem Sohn Thorim.',
    emblem: RORIKSHEIM_HOUSE_EMBLEMS.frostgeborene,
    houseProfile: RORIKSHEIM_HOUSE_PROFILES.frostgeborene
  },
  houses: [
    house(FROSTGEBORENE_HOUSE_ID, 'Haus Frostgeborene', RORIKSHEIM_HOUSE_EMBLEMS.frostgeborene),
    house('house-kampfgeborene', 'Clan Kampfgeborene', RORIKSHEIM_HOUSE_EMBLEMS.kampfgeborene)
  ],
  persons: [
    person('jokul-kampfgeborene', 'Jokul Kampfgeborener', 'male', '1627', '1645', {
      houseId: 'house-kampfgeborene',
      familyRole: 'core',
      title: 'Vater Thorims'
    }),
    spouse('hilda', 'Hilda', 'female', '1628', '1646', '', {
      familyRole: 'affair',
      title: 'Affäre Jokuls · Mutter Thorims'
    }),
    person('thorim-frostgeborene', 'Thorim der Bastard', 'male', '1646', '1705', {
      worldPersonId: createWorldPersonId('haus-kampfgeborene', 'thorim-frostgeborene'),
      familyRole: 'founder',
      title: 'Gründer des bürgerlichen Hauses Frostgeborene',
      tags: ['Bastard', 'Hausgründer'],
      notes: 'Thorim ist der uneheliche Sohn Jokuls und Hildas. Er gründete das nichtadelige Bastardhaus Frostgeborene.'
    }),
    spouse('freydis', 'Freydis', 'female', '1647', '1712'),
    person('eirik-frostgeborene', 'Eirik Frostgeborener', 'male', '1669', '1738', { title: 'Oberhaupt des Hauses Frostgeborene 1705–1738' }),
    person('hallvard-frostgeborene', 'Hallvard Frostgeborener', 'male', '1671', ''),
    spouse('sigrid', 'Sigrid', 'female', '1670', '1735'),
    spouse('svenja', 'Svenja', 'female', '1672', '1739'),
    person('bjorn-frostgeborene', 'Bjorn Frostgeborener', 'male', '1691', '', { title: 'Oberhaupt des Hauses Frostgeborene seit 1738' }),
    person('tormod-frostgeborene', 'Tormod Frostgeborener', 'male', '1693', ''),
    spouse('gwelda', 'Gwelda', 'female', '1697', ''),
    spouse('gudrun', 'Gudrun', 'female', '1695', ''),
    person('yrsa-frostgeborene', 'Yrsa Frostgeborene', 'female', '1718', ''),
    person('estridd-frostgeborene', 'Estridd Frostgeborene', 'female', '1720', ''),
    person('kjalt-frostgeborene', 'Kjalt Frostgeborener', 'male', '1722', '', { title: 'Erbe des Hauses Frostgeborene' }),
    person('hjalti-frostgeborene', 'Hjalti Frostgeborener', 'male', '1720', ''),
    person('sjoring-frostgeborene', 'Sjoring Frostgeborener', 'male', '1722', '')
  ],
  partnerships: [
    marriage('affair-jokul-hilda-kampfgeborene', {
      type: 'affair',
      status: 'ended',
      end: '1645',
      visibility: 'restricted',
      notes: 'Thorim entstammt ausschließlich Jokuls Affäre mit Hilda.'
    }),
    marriage('marriage-thorim-freydis-frostgeborene', { status: 'ended', end: '1705' }),
    marriage('marriage-eirik-sigrid-frostgeborene', { status: 'ended', end: '1735' }),
    marriage('marriage-hallvard-svenja-frostgeborene', { status: 'ended', end: '1739' }),
    marriage('marriage-bjorn-gwelda-frostgeborene'),
    marriage('marriage-tormod-gudrun-frostgeborene')
  ],
  parentages: [
    ...childrenOf(['thorim-frostgeborene'], 'affair-jokul-hilda-kampfgeborene', {
      legitimacy: 'illegitimate',
      notes: 'Thorim ist Jokuls unehelicher Sohn mit Hilda.'
    }),
    ...childrenOf(['eirik-frostgeborene', 'hallvard-frostgeborene'], 'marriage-thorim-freydis-frostgeborene'),
    ...childrenOf(['bjorn-frostgeborene'], 'marriage-eirik-sigrid-frostgeborene'),
    ...childrenOf(['tormod-frostgeborene'], 'marriage-hallvard-svenja-frostgeborene'),
    ...childrenOf(['yrsa-frostgeborene', 'estridd-frostgeborene', 'kjalt-frostgeborene'], 'marriage-bjorn-gwelda-frostgeborene'),
    ...childrenOf(['hjalti-frostgeborene', 'sjoring-frostgeborene'], 'marriage-tormod-gudrun-frostgeborene')
  ],
  cadetBranches: [],
  timeJumps: [],
  lineage: {
    founderPartnershipId: 'marriage-thorim-freydis-frostgeborene',
    houseId: FROSTGEBORENE_HOUSE_ID,
    crestSubtitle: 'Bürgerliches Bastardhaus von Rorikshall · nichtadelig',
    crestEmblemScale: 0.86,
    crestFrame: 'iron',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'jokul-kampfgeborene',
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    sourceRevision: 1,
    sourceFamilyId: 'haus-kampfgeborene',
    sourcePartnershipId: 'affair-jokul-hilda-kampfgeborene',
    sourceNote: 'Haus Frostgeborene ist bewusst als eigene bürgerliche, nichtadelige Familienakte in Rorikshall registriert. Jokul Kampfgeborener und Hilda stehen als Herkunft über Thorim; der eiserne Hausknoten folgt erst direkt unter Thorim und Freydis. Die in der Quelle wiederholten Standardsilhouetten wurden nicht als Individualporträts übernommen.',
    registryManagedExtensionFields: ['blankFamily', 'sourceNote'],
    registryManagedHouseProfileFields: [
      'rankId', 'seat', 'barony', 'county', 'kingdom', 'liegeHouseId',
      'liegeHouseName', 'secondarySeats', 'regionEmblems'
    ],
    registryManagedRecordFields: ['folderPath'],
    registryManagedViewFields: ['focusPersonId', 'limitGenerations']
  }
});
