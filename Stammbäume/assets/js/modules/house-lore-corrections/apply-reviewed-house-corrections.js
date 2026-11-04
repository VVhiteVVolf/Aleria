import { preserveSourceEntityBoundaries, preserveSourceMetadataBoundaries, withSourceFamilyFieldUpgrade } from '../../data/source-family-field-upgrade.js?v=20261104-content-lore-v1';

function withMetadataBoundaries(family, definition, marker) {
  const { extensions } = preserveSourceMetadataBoundaries(family, definition.revision - 1);
  extensions.registryManagedExtensionFieldRevisions = {
    ...extensions.registryManagedExtensionFieldRevisions,
    ...Object.fromEntries([marker, ...(definition.extensionFields || [])].map(field => [field, definition.revision]))
  };
  return { ...family, extensions };
}

function canonicalCollections(family, definition) {
  return Object.fromEntries(Object.entries(definition.collections || {}).map(([collection, entities]) => {
    const byId = new Map(family[collection].map(entity => [entity.id, entity]));
    return [collection, Object.fromEntries(Object.entries(entities).map(([id, fields]) => {
      const entity = byId.get(id);
      if (!entity) throw new Error(`Unbekannte Lore-Korrektur: ${family.document.id}/${collection}/${id}`);
      return [id, Object.fromEntries(fields.map(field => {
        if (['id', 'worldPersonId', 'extensions'].includes(field) || !Object.hasOwn(entity, field)) {
          throw new Error(`Unzulässiges Lore-Korrekturfeld: ${id}/${field}`);
        }
        return [field, entity[field]];
      }))];
    }))];
  }));
}

function withPreviousDefaultGuards(family, defaults = {}) {
  return { ...family, ...Object.fromEntries(Object.entries(defaults).map(([collection, entities]) => [
    collection, family[collection].map(entity => !entities[entity.id] ? entity : {
      ...entity, extensions: { ...entity.extensions, registryManagedFieldPreviousValues: {
        ...entity.extensions.registryManagedFieldPreviousValues, ...entities[entity.id]
      } }
    })
  ])) };
}

function withDocumentFields(family, definition, inventory, marker) {
  const fields = definition.documentFields || [];
  if (!fields.length) return family;
  const bounded = preserveSourceEntityBoundaries(family);
  return { ...bounded, extensions: { ...bounded.extensions,
    sourceRevision: Math.max(bounded.extensions.sourceRevision || 0, definition.revision),
    registryManagedEntitySourceRevision: bounded.extensions.registryManagedEntitySourceRevision
      ?? family.extensions.sourceRevision ?? 0,
    registryManagedDocumentFields: [...new Set([...(bounded.extensions.registryManagedDocumentFields || []), ...fields])],
    registryManagedDocumentFieldRevisions: { ...bounded.extensions.registryManagedDocumentFieldRevisions,
      ...Object.fromEntries(fields.map(field => [field, definition.revision])) },
    [marker]: inventory,
    registryManagedExtensionFields: [...new Set([...(bounded.extensions.registryManagedExtensionFields || []), marker])]
  } };
}

/** Apply one separately reviewed correction set without replaying older fields. */
export function applyReviewedHouseCorrections(family, definition, { inventory, marker }) {
  if (!definition || family.extensions[marker] === inventory
    && family.extensions.sourceRevision >= definition.revision) return family;
  const bounded = withMetadataBoundaries(family, definition, marker);
  const patch = { revision: definition.revision, collections: canonicalCollections(bounded, definition) };
  const upgraded = withSourceFamilyFieldUpgrade(bounded, patch, {
    inventory, marker, confirmUnchangedFields: true
  });
  return withPreviousDefaultGuards(
    withDocumentFields(upgraded, definition, inventory, marker), definition.previousDefaultValues
  );
}
