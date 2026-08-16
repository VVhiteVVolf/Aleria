import { assertValidFamily } from '../domain/family-schema.js';

const DEFAULT_MANAGED_PERSON_FIELDS = Object.freeze([
  'name',
  'sex',
  'birth',
  'death',
  'status',
  'title',
  'house',
  'houseId',
  'portrait',
  'frameType',
  'familyRole',
  'legitimacy',
  'worldPersonId'
]);

const deepClone = (value) => JSON.parse(JSON.stringify(value));

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  Object.values(value).forEach(deepFreeze);
  return value;
}

function withManagedFields(entity, fields) {
  return {
    ...entity,
    extensions: {
      ...(entity.extensions || {}),
      registryManagedFields: [...fields]
    }
  };
}

function applyEntityPatches(entities, patches = {}) {
  return entities.map((entity) => {
    const patch = patches[entity.id];
    if (!patch) return entity;
    return {
      ...entity,
      ...patch,
      extensions: {
        ...(entity.extensions || {}),
        ...(patch.extensions || {})
      }
    };
  });
}

function remapPartnershipReferences(family, partnershipIdMap = {}) {
  if (!Object.keys(partnershipIdMap).length) return;

  family.partnerships = family.partnerships.map((partnership) => ({
    ...partnership,
    id: partnershipIdMap[partnership.id] || partnership.id
  }));

  const remap = (partnershipId) => partnershipIdMap[partnershipId] || partnershipId;
  family.parentages = family.parentages.map((parentage) => ({
    ...parentage,
    partnershipId: remap(parentage.partnershipId)
  }));
  family.cadetBranches = family.cadetBranches.map((branch) => ({
    ...branch,
    parentPartnershipId: remap(branch.parentPartnershipId)
  }));
  family.timeJumps = family.timeJumps.map((jump) => ({
    ...jump,
    parentPartnershipId: remap(jump.parentPartnershipId),
    sharedParentPartnershipIds: (jump.sharedParentPartnershipIds || []).map(remap)
  }));
  family.lineage = {
    ...family.lineage,
    founderPartnershipId: remap(family.lineage.founderPartnershipId)
  };
}

function createHouseRecord({ id, name, emblem = '' }) {
  return withManagedFields(
    {
      id,
      name,
      motto: '',
      emblem,
      status: 'active',
      extensions: {}
    },
    ['name', 'motto', 'emblem', 'status']
  );
}

/**
 * Adapts a manually exported family to the immutable registry data used by
 * Aeldrunmar. Corrections stay explicit in the per-house configuration, while
 * schema and registry metadata remain centralized here.
 */
export function prepareAeldrunmarExportFamily(sourceFamily, config) {
  const family = deepClone(assertValidFamily(sourceFamily).family);
  const originalHouseId = family.houses[0]?.id || '';
  const primaryHouseId = config.house.id;

  family.document = {
    ...family.document,
    id: config.familyId,
    title: config.title,
    description: config.description,
    emblem: config.house.emblem,
    houseProfile: config.houseProfile,
    createdAt: '',
    updatedAt: ''
  };

  family.houses = [
    createHouseRecord(config.house),
    ...(config.externalHouses || []).map(createHouseRecord)
  ];

  family.persons = family.persons.map((person) => {
    // Manual exports occasionally lose the houseId on newly added descendants.
    // Their familyRole still identifies them as members of the exported house.
    const belongsToPrimaryHouse = person.houseId === originalHouseId
      || person.familyRole !== 'married';
    const next = {
      ...person,
      house: belongsToPrimaryHouse ? config.house.name : person.house,
      houseId: belongsToPrimaryHouse ? primaryHouseId : person.houseId,
      worldPersonId: belongsToPrimaryHouse
        ? `person--${config.familyId}--${person.id}`
        : person.worldPersonId
    };
    if (String(next.death || '').trim()) next.status = 'dead';
    return next;
  });
  family.persons = applyEntityPatches(family.persons, config.personPatches);
  family.persons.push(...deepClone(config.extraPersons || []));
  family.persons = family.persons.map((person) =>
    withManagedFields(person, DEFAULT_MANAGED_PERSON_FIELDS)
  );

  remapPartnershipReferences(family, config.partnershipIdMap);
  family.partnerships = applyEntityPatches(family.partnerships, config.partnershipPatches);
  family.partnerships.push(...deepClone(config.extraPartnerships || []));
  family.partnerships = family.partnerships.map((partnership) =>
    withManagedFields(partnership, [
      'participantIds',
      'type',
      'status',
      'start',
      'end',
      'certainty',
      'visibility',
      'notes',
    ])
  );

  family.parentages = applyEntityPatches(family.parentages, config.parentagePatches);
  family.parentages.push(...deepClone(config.extraParentages || []));
  family.parentages = family.parentages.map((parentage) =>
    withManagedFields(parentage, [
      'partnershipId',
      'parentIds',
      'childId',
      'type',
      'legitimacy',
      'certainty',
      'visibility',
      'notes'
    ])
  );

  const removedBranchIds = new Set(config.removeCadetBranchIds || []);
  family.cadetBranches = family.cadetBranches.filter(
    (branch) => !removedBranchIds.has(branch.id)
  );
  family.cadetBranches = applyEntityPatches(family.cadetBranches, config.cadetBranchPatches);
  family.cadetBranches.push(...deepClone(config.extraCadetBranches || []));
  family.cadetBranches = family.cadetBranches.map((branch) =>
    withManagedFields(branch, [
      'parentPartnershipId',
      'parentPersonId',
      'name',
      'emblem',
      'subtitle',
      'targetFamilyId',
      'linkType',
      'anchorMode',
      'founded',
      'ended'
    ])
  );

  family.timeJumps = family.timeJumps.map((jump) =>
    withManagedFields(jump, [
      'parentPersonId',
      'parentPartnershipId',
      'sharedParentPartnershipIds',
      'childIds',
      'years',
      'label',
      'fromYear',
      'toYear',
      'notes'
    ])
  );
  family.lineage = {
    ...family.lineage,
    houseId: primaryHouseId,
    crestSubtitle: config.crestSubtitle
  };

  const founderPartnership = family.partnerships.find(
    (partnership) => partnership.id === family.lineage.founderPartnershipId
  );

  family.view = {
    ...(family.view || {}),
    focusPersonId: founderPartnership?.participantIds?.[0] || family.persons[0]?.id || '',
    ancestorDepth: 99,
    descendantDepth: 99,
    limitGenerations: false,
    showSiblings: true
  };

  family.extensions = {
    ...(family.extensions || {}),
    sourceRevision: config.sourceRevision || 1,
    sourceNote: config.sourceNote,
    sourceFamilyId: config.familyId,
    registryManagedViewFields: [
      'focusPersonId',
      'ancestorDepth',
      'descendantDepth',
      'limitGenerations',
      'showSiblings'
    ],
    registryTombstones: { persons: [], partnerships: [], parentages: [], cadetBranches: [] }
  };

  return deepFreeze(assertValidFamily(family).family);
}
