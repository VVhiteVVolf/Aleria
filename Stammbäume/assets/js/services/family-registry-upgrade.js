import { normalizeFamily } from '../domain/family-schema.js';

const ENTITY_COLLECTIONS = Object.freeze([
  'persons',
  'partnerships',
  'parentages',
  'houses',
  'cadetBranches',
  'timeJumps'
]);

function sourceRevision(family) {
  const revision = Number(family?.extensions?.sourceRevision);
  return Number.isInteger(revision) && revision >= 0 ? revision : 0;
}

function tombstonesFor(family, collection) {
  return new Set(family?.extensions?.registryTombstones?.[collection] || []);
}

function mergedTombstonesFor(registeredFamily, localFamily, collection) {
  return new Set([
    ...tombstonesFor(registeredFamily, collection),
    ...tombstonesFor(localFamily, collection)
  ]);
}

function registryManagedFieldNames(family, extensionKey) {
  const fieldNames = family?.extensions?.[extensionKey];
  return Array.isArray(fieldNames) ? fieldNames : [];
}

function mergeRegisteredManagedFields(registeredValue = {}, localValue = {}, fieldNames = []) {
  const result = { ...registeredValue, ...localValue };
  fieldNames.forEach(fieldName => {
    if (Object.hasOwn(registeredValue, fieldName)) result[fieldName] = registeredValue[fieldName];
  });
  return result;
}

function mergeEntities(registeredEntities = [], localEntities = [], tombstones = new Set()) {
  const localById = new Map(localEntities.map(entity => [entity.id, entity]));
  const merged = registeredEntities.filter(entity => !tombstones.has(entity.id)).map(entity => {
    const localEntity = localById.get(entity.id);
    if (!localEntity) return entity;

    const registryManagedFields = Array.isArray(entity.extensions?.registryManagedFields)
      ? entity.extensions.registryManagedFields
      : [];
    const result = {
      ...entity,
      ...localEntity,
      extensions: {
        ...(entity.extensions || {}),
        ...(localEntity.extensions || {})
      }
    };
    registryManagedFields.forEach(fieldName => {
      if (fieldName !== 'id' && fieldName !== 'extensions' && Object.hasOwn(entity, fieldName)) {
        result[fieldName] = entity[fieldName];
      }
    });
    return result;
  });
  const registeredIds = new Set(registeredEntities.map(entity => entity.id));
  localEntities.forEach(entity => {
    if (!registeredIds.has(entity.id) && !tombstones.has(entity.id)) merged.push(entity);
  });
  return merged;
}

function resemblesRegisteredSnapshot(registeredFamily, localFamily) {
  if (registeredFamily?.document?.id !== localFamily?.document?.id) return false;
  const founderPartnership = (registeredFamily.partnerships || []).find(partnership => (
    partnership.id === registeredFamily.lineage?.founderPartnershipId
  ));
  if (!founderPartnership?.participantIds?.length) return false;
  const localPersonIds = new Set((localFamily.persons || []).map(person => person.id));
  return founderPartnership.participantIds.every(personId => localPersonIds.has(personId));
}

function missesRegisteredStructure(registeredFamily, localFamily) {
  return ENTITY_COLLECTIONS.some(collection => {
    const localIds = new Set((localFamily[collection] || []).map(entity => entity.id));
    const tombstones = tombstonesFor(localFamily, collection);
    return (registeredFamily[collection] || []).some(entity => !localIds.has(entity.id) && !tombstones.has(entity.id));
  });
}

export function isUntouchedBlankFamily(record) {
  const family = record?.family;
  if (family?.extensions?.blankFamily !== true) return false;

  const persons = family.persons || [];
  const partnerships = family.partnerships || [];
  const parentages = family.parentages || [];
  if (!persons.length && !partnerships.length && !parentages.length) return true;

  const familyId = family.document?.id || record?.id || '';
  const founderIds = [`${familyId}-gruender`, `${familyId}-gruenderin`];
  const founderPartnershipId = `marriage-${familyId}-founders`;
  const onlyFactoryFounders = persons.length === 2
    && persons.every(person => founderIds.includes(person.id) && person.name === '???');
  const onlyFactoryPartnership = partnerships.length === 1
    && partnerships[0].id === founderPartnershipId
    && founderIds.every(personId => partnerships[0].participantIds?.includes(personId));

  return onlyFactoryFounders
    && onlyFactoryPartnership
    && !parentages.length
    && !(family.cadetBranches || []).length
    && !(family.timeJumps || []).length
    && family.lineage?.founderPartnershipId === founderPartnershipId;
}

export function needsRegisteredFamilyUpgrade(registeredFamily, localFamily) {
  const localRevision = sourceRevision(localFamily);
  const registeredRevision = sourceRevision(registeredFamily);
  if (registeredRevision <= 0) return false;
  const knownRegistrySnapshot = localRevision > 0 || resemblesRegisteredSnapshot(registeredFamily, localFamily);
  if (!knownRegistrySnapshot) return false;
  return registeredRevision > localRevision
    || missesRegisteredStructure(registeredFamily, localFamily)
    || Number(localFamily.view?.ancestorDepth || 0) < Number(registeredFamily.view?.ancestorDepth || 0)
    || Number(localFamily.view?.descendantDepth || 0) < Number(registeredFamily.view?.descendantDepth || 0);
}

export function resolveRegisteredFamilyUpgrade(registeredInput, localInput) {
  const registered = normalizeFamily(registeredInput);
  const local = normalizeFamily(localInput);
  const registeredRevision = sourceRevision(registered);
  const localRevision = sourceRevision(local);
  if (!needsRegisteredFamilyUpgrade(registered, local)) return local;

  const mergedTombstones = Object.fromEntries(ENTITY_COLLECTIONS.map(collection => [
    collection,
    mergedTombstonesFor(registered, local, collection)
  ]));
  const mergedCollections = Object.fromEntries(ENTITY_COLLECTIONS.map(collection => [
    collection,
    mergeEntities(registered[collection], local[collection], mergedTombstones[collection])
  ]));
  const mergedRegistryTombstones = Object.fromEntries(ENTITY_COLLECTIONS.flatMap(collection => {
    const ids = [...mergedTombstones[collection]];
    return ids.length ? [[collection, ids]] : [];
  }));
  const mergedHouseProfile = mergeRegisteredManagedFields(
    registered.document.houseProfile,
    local.document.houseProfile,
    registryManagedFieldNames(registered, 'registryManagedHouseProfileFields')
  );
  const mergedView = mergeRegisteredManagedFields(
    registered.view,
    local.view,
    registryManagedFieldNames(registered, 'registryManagedViewFields')
  );
  const mergedExtensions = mergeRegisteredManagedFields(
    registered.extensions,
    local.extensions,
    registryManagedFieldNames(registered, 'registryManagedExtensionFields')
  );
  const registryManagedUpgradeMetadata = Object.fromEntries([
    'registryManagedExtensionFields',
    'registryManagedHouseProfileFields',
    'registryManagedRecordFields',
    'registryManagedViewFields'
  ].flatMap(extensionKey => {
    const fieldNames = registered.extensions?.[extensionKey];
    return Array.isArray(fieldNames) ? [[extensionKey, [...fieldNames]]] : [];
  }));

  return normalizeFamily({
    ...registered,
    ...local,
    ...mergedCollections,
    document: {
      ...registered.document,
      ...local.document,
      houseProfile: mergedHouseProfile
    },
    lineage: {
      ...registered.lineage,
      ...local.lineage,
      originHouse: registeredRevision > localRevision
        ? registered.lineage.originHouse
        : {
            ...registered.lineage.originHouse,
            ...local.lineage.originHouse
          }
    },
    presentation: {
      ...registered.presentation,
      ...local.presentation,
      relationshipColors: {
        ...registered.presentation.relationshipColors,
        ...local.presentation.relationshipColors
      }
    },
    view: {
      ...mergedView,
      ancestorDepth: Math.max(registered.view.ancestorDepth, local.view.ancestorDepth),
      descendantDepth: Math.max(registered.view.descendantDepth, local.view.descendantDepth)
    },
    extensions: {
      ...mergedExtensions,
      ...registryManagedUpgradeMetadata,
      registryTombstones: mergedRegistryTombstones,
      sourceRevision: registeredRevision,
      registryUpgrade: {
        fromRevision: localRevision,
        toRevision: registeredRevision
      }
    }
  });
}
