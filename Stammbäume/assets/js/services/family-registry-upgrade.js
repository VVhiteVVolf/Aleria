import { normalizeFamily } from '../domain/family-schema.js';
import { withCwingodHouseNameUpgrade } from '../data/cwingod-house-name-upgrade.js';
import { houseBiographyDefaultUpgrade } from '../modules/house-biography/house-biography-default-upgrade.js?v=gwendolyn-20260911h';

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

function shouldApplyManagedEntityFields(registeredFamily, localFamily) {
  // Eine spätere reine Metadatenrevision darf bereits übernommene Genealogie
  // nicht erneut überschreiben. Ohne explizite Grenze gilt das bisherige Verhalten.
  const entitySourceRevision = registeredFamily.extensions?.registryManagedEntitySourceRevision;
  return !Number.isInteger(entitySourceRevision) || sourceRevision(localFamily) < entitySourceRevision;
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

function mergeEntityExtensions(registeredExtensions = {}, localExtensions = {}) {
  const result = { ...registeredExtensions, ...localExtensions };
  const managedExtensionFields = Array.isArray(registeredExtensions.registryManagedExtensionFields)
    ? registeredExtensions.registryManagedExtensionFields
    : [];

  managedExtensionFields.forEach(fieldName => {
    if (Object.hasOwn(registeredExtensions, fieldName)) {
      result[fieldName] = registeredExtensions[fieldName];
      return;
    }
    delete result[fieldName];
  });
  return result;
}

function mergeEntities(registeredEntities = [], localEntities = [], tombstones = new Set(), applyManagedFields = true, localSourceRevision = 0) {
  const localById = new Map(localEntities.map(entity => [entity.id, entity]));
  const merged = registeredEntities.filter(entity => !tombstones.has(entity.id)).map(entity => {
    const localEntity = localById.get(entity.id);
    if (!localEntity) return entity;

    // Einzelne Quellenkorrekturen dürfen bereits übernommene Nachbardaten erhalten.
    const entityRevision = entity.extensions?.registryManagedSourceRevision;
    const applyEntityFields = Number.isInteger(entityRevision)
      ? localSourceRevision < entityRevision : applyManagedFields;
    const fieldRevisions = entity.extensions?.registryManagedFieldRevisions || {};
    // Feldgenaue spätere Korrekturen gelten auch nach der strukturellen Revision;
    // bereits übernommene Nachbardaten und Ansichtseinstellungen bleiben lokal.
    const registryManagedFields = Array.isArray(entity.extensions?.registryManagedFields)
      ? entity.extensions.registryManagedFields.filter(field => Number.isInteger(fieldRevisions[field])
        ? localSourceRevision < fieldRevisions[field] : applyManagedFields && applyEntityFields)
      : [];
    const result = {
      ...entity,
      ...localEntity,
      extensions: applyEntityFields
        ? mergeEntityExtensions(entity.extensions, localEntity.extensions)
        : { ...entity.extensions, ...localEntity.extensions }
    };
    registryManagedFields.forEach(fieldName => {
      if (fieldName !== 'id' && fieldName !== 'extensions' && Object.hasOwn(entity, fieldName)) {
        // A source revision that only fills missing data preserves locally
        // supplied values. Later explicit corrections keep their usual rules.
        const fillOnlyRevision = entity.extensions?.registryManagedFieldFillOnlyRevisions?.[fieldName];
        if (Number.isInteger(fillOnlyRevision) && fillOnlyRevision === fieldRevisions[fieldName] && localEntity[fieldName]) return;
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
    || (shouldApplyManagedEntityFields(registeredFamily, localFamily) && (
      Number(localFamily.view?.ancestorDepth || 0) < Number(registeredFamily.view?.ancestorDepth || 0)
      || Number(localFamily.view?.descendantDepth || 0) < Number(registeredFamily.view?.descendantDepth || 0)
    ));
}

export function resolveRegisteredFamilyUpgrade(registeredInput, localInput) {
  const registered = withCwingodHouseNameUpgrade(normalizeFamily(registeredInput));
  const local = normalizeFamily(localInput);
  const registeredRevision = sourceRevision(registered);
  const localRevision = sourceRevision(local);
  if (!needsRegisteredFamilyUpgrade(registered, local)) return local;

  const applyManagedEntityFields = shouldApplyManagedEntityFields(registered, local);

  const mergedTombstones = Object.fromEntries(ENTITY_COLLECTIONS.map(collection => [
    collection,
    mergedTombstonesFor(registered, local, collection)
  ]));
  const mergedCollections = Object.fromEntries(ENTITY_COLLECTIONS.map(collection => [
    collection,
    mergeEntities(registered[collection], local[collection], mergedTombstones[collection], applyManagedEntityFields, localRevision)
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
  const mergedDocument = mergeRegisteredManagedFields(
    registered.document,
    local.document,
    registryManagedFieldNames(registered, 'registryManagedDocumentFields')
  );
  const mergedView = mergeRegisteredManagedFields(
    registered.view,
    local.view,
    applyManagedEntityFields ? registryManagedFieldNames(registered, 'registryManagedViewFields') : []
  );
  const mergedLineage = mergeRegisteredManagedFields(
    registered.lineage,
    local.lineage,
    applyManagedEntityFields ? registryManagedFieldNames(registered, 'registryManagedLineageFields') : []
  );
  const mergedExtensions = mergeRegisteredManagedFields(
    registered.extensions,
    local.extensions,
    registryManagedFieldNames(registered, 'registryManagedExtensionFields')
  );
  const registryManagedUpgradeMetadata = Object.fromEntries([
    'registryManagedDocumentFields',
    'registryManagedEntitySourceRevision',
    'registryManagedExtensionFields',
    'registryManagedHouseProfileFields',
    'registryManagedLineageFields',
    'registryManagedRecordFields',
    'registryManagedViewFields'
  ].flatMap(extensionKey => {
    const fieldNames = registered.extensions?.[extensionKey];
    if (extensionKey === 'registryManagedEntitySourceRevision') {
      return Number.isInteger(fieldNames) ? [[extensionKey, fieldNames]] : [];
    }
    return Array.isArray(fieldNames) ? [[extensionKey, [...fieldNames]]] : [];
  }));

  return normalizeFamily({
    ...registered,
    ...local,
    ...mergedCollections,
    document: {
      ...mergedDocument,
      houseProfile: mergedHouseProfile
    },
    lineage: {
      ...mergedLineage,
      originHouse: registeredRevision > localRevision && applyManagedEntityFields
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
      ancestorDepth: applyManagedEntityFields
        ? Math.max(registered.view.ancestorDepth, local.view.ancestorDepth) : mergedView.ancestorDepth,
      descendantDepth: applyManagedEntityFields
        ? Math.max(registered.view.descendantDepth, local.view.descendantDepth) : mergedView.descendantDepth
    },
    extensions: {
      ...mergedExtensions,
      ...houseBiographyDefaultUpgrade(registered, local),
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
