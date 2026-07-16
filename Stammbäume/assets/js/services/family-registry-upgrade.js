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

function mergeEntities(registeredEntities = [], localEntities = []) {
  const localById = new Map(localEntities.map(entity => [entity.id, entity]));
  const merged = registeredEntities.map(entity => localById.get(entity.id) || entity);
  const registeredIds = new Set(registeredEntities.map(entity => entity.id));
  localEntities.forEach(entity => {
    if (!registeredIds.has(entity.id)) merged.push(entity);
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
    return (registeredFamily[collection] || []).some(entity => !localIds.has(entity.id));
  });
}

export function isUntouchedBlankFamily(record) {
  const family = record?.family;
  return family?.extensions?.blankFamily === true
    && (family.persons || []).length === 0
    && (family.partnerships || []).length === 0
    && (family.parentages || []).length === 0;
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

  const mergedCollections = Object.fromEntries(ENTITY_COLLECTIONS.map(collection => [
    collection,
    mergeEntities(registered[collection], local[collection])
  ]));

  return normalizeFamily({
    ...registered,
    ...local,
    ...mergedCollections,
    document: {
      ...registered.document,
      ...local.document,
      houseProfile: {
        ...registered.document.houseProfile,
        ...local.document.houseProfile
      }
    },
    lineage: {
      ...registered.lineage,
      ...local.lineage
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
      ...registered.view,
      ...local.view,
      ancestorDepth: Math.max(registered.view.ancestorDepth, local.view.ancestorDepth),
      descendantDepth: Math.max(registered.view.descendantDepth, local.view.descendantDepth)
    },
    extensions: {
      ...registered.extensions,
      ...local.extensions,
      sourceRevision: registeredRevision,
      registryUpgrade: {
        fromRevision: localRevision,
        toRevision: registeredRevision
      }
    }
  });
}
