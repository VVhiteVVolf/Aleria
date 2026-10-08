import { normalizeFamily } from '../assets/js/domain/family-schema.js';

// The portrait pass may only change portraits and their upgrade bookkeeping.
// Names, identities, dates, genealogy, notes, layout and biographies remain exact.
export function portraitInvariantFamily(family) {
  const value = normalizeFamily(family);
  for (const key of ['persons', 'partnerships', 'parentages', 'houses', 'cadetBranches', 'timeJumps']) {
    for (const entity of value[key]) {
      if (key === 'persons') delete entity.portrait;
      for (const field of ['registryManagedFields', 'registryManagedSourceRevision', 'registryManagedFieldRevisions', 'registryManagedFieldFillOnlyRevisions']) {
        if (entity.extensions) delete entity.extensions[field];
      }
      if (entity.extensions && !Object.keys(entity.extensions).length) delete entity.extensions;
    }
  }
  for (const field of ['sourceRevision', 'registryManagedEntitySourceRevision', 'registryManagedExtensionFields', 'albenSourcePortraitInventory']) {
    delete value.extensions[field];
  }
  return value;
}
