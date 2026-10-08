export function sourceManagedFields(extensions = {}, fields, revision) {
  return {
    ...extensions,
    registryManagedFields: [...new Set([...(extensions.registryManagedFields || []), ...fields])],
    registryManagedFieldRevisions: {
      ...extensions.registryManagedFieldRevisions,
      ...Object.fromEntries(fields.map(field => [field, revision]))
    }
  };
}

export function preserveSourceEntityBoundaries(family) {
  const boundary = Number.isInteger(family.extensions.registryManagedEntitySourceRevision)
    ? family.extensions.registryManagedEntitySourceRevision : Number(family.extensions.sourceRevision) || 0;
  const collections = ['persons', 'partnerships', 'parentages', 'houses', 'cadetBranches', 'timeJumps'];
  return {
    ...family,
    ...Object.fromEntries(collections.map(key => [key, family[key].map(entity => {
      const extensions = entity.extensions || {};
      const revision = extensions.registryManagedSourceRevision ?? boundary;
      return {
        ...entity,
        extensions: {
          ...extensions, registryManagedSourceRevision: revision,
          registryManagedFieldRevisions: {
            ...Object.fromEntries((extensions.registryManagedFields || []).map(field => [field, revision])),
            ...extensions.registryManagedFieldRevisions
          }
        }
      };
    })]))
  };
}

/** Correct explicit source fields without reopening earlier genealogy revisions. */
export function withSourceFamilyFieldUpgrade(family, patch, { inventory, marker }) {
  if (!patch || family.extensions[marker] === inventory && family.extensions.sourceRevision >= patch.revision) return family;
  const previous = family;
  const bounded = preserveSourceEntityBoundaries(family);
  const houseIds = new Set(bounded.houses.map(house => house.id));
  const additionalHouses = (patch.additionalHouses || []).filter(house => !houseIds.has(house.id));
  const branchIds = new Set(bounded.cadetBranches.map(branch => branch.id));
  const additionalBranches = (patch.additionalCadetBranches || []).filter(branch => {
    if (branchIds.has(branch.id)) return false;
    branchIds.add(branch.id);
    return true;
  });
  let changed = additionalHouses.length > 0 || additionalBranches.length > 0;
  const collections = Object.fromEntries(Object.entries(patch.collections).map(([collection, entities]) => [
    collection,
    bounded[collection].map(entity => {
      const fields = entities[entity.id];
      if (!fields || Object.entries(fields).every(([field, value]) => JSON.stringify(entity[field]) === JSON.stringify(value))) return entity;
      if (fields.worldPersonId && fields.worldPersonId !== entity.worldPersonId) throw new Error(`Abweichende Quellenidentität ${entity.id}.`);
      changed = true;
      return { ...entity, ...fields, extensions: sourceManagedFields(entity.extensions, Object.keys(fields), patch.revision) };
    })
  ]));
  if (!changed) return previous;
  return {
    ...bounded, ...collections,
    houses: [...(collections.houses || bounded.houses), ...additionalHouses.map(house => ({
      ...house,
      extensions: {
        ...sourceManagedFields(house.extensions, ['name', 'emblem', 'motto', 'status'], patch.revision),
        registryManagedSourceRevision: patch.revision
      }
    }))],
    cadetBranches: [...(collections.cadetBranches || bounded.cadetBranches), ...additionalBranches.map(branch => ({
      ...branch,
      extensions: {
        ...sourceManagedFields(branch.extensions, Object.keys(branch).filter(key => !['id', 'extensions'].includes(key)), patch.revision),
        registryManagedSourceRevision: patch.revision
      }
    }))],
    extensions: {
      ...bounded.extensions,
      sourceRevision: Math.max(Number(bounded.extensions.sourceRevision) || 0, patch.revision),
      registryManagedEntitySourceRevision: Number.isInteger(previous.extensions.registryManagedEntitySourceRevision)
        ? previous.extensions.registryManagedEntitySourceRevision : Number(previous.extensions.sourceRevision) || 0,
      [marker]: inventory,
      registryManagedExtensionFields: [...new Set([...(bounded.extensions.registryManagedExtensionFields || []), marker])]
    }
  };
}
