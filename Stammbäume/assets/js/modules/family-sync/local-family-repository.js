import { loadFamilyById, saveFamilyToLibrary } from '../../services/family-library.js';
import { loadPersistedFamily, persistFamily } from '../../services/family-persistence.js';

export function createLocalFamilyRepository(storage = globalThis.localStorage) {
  return Object.freeze({
    kind: 'local',
    loadCurrent: () => loadPersistedFamily(storage),
    loadFamily: familyId => loadFamilyById(familyId, storage)?.family || null,
    persistCurrent: family => persistFamily(family, storage),
    saveToLibrary: values => saveFamilyToLibrary(values, storage)
  });
}
