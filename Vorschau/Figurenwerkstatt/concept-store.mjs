import { decodeConcepts, encodeConcepts } from './concept-drafts.mjs';

// The key also locates drafts created before the versioned export gained decisions.
export const CONCEPT_STORAGE_KEY = 'aleria.preparation.concepts.v1';

export function createConceptStore({
  getStorage = () => globalThis.localStorage,
  locks = globalThis.navigator?.locks
} = {}) {
  let drafts = [];
  let saved;
  let error = '';
  let recover = false;

  function refresh() {
    if (recover) return drafts;
    try {
      const value = getStorage().getItem(CONCEPT_STORAGE_KEY);
      if (value !== saved) {
        drafts = value === null ? [] : decodeConcepts(value);
        saved = value;
      }
      error = '';
    } catch {
      error = 'Die gespeicherte Mappe ist hier nicht lesbar. Sichern kannst du deine Arbeit per JSON-Export.';
    }
    return drafts;
  }

  function transact(update) {
    const save = () => {
      const current = refresh();
      const next = update(current);
      if (next === current) return current;
      drafts = next;
      if (error && !recover) {
        recover = true;
        return drafts;
      }
      try {
        const value = encodeConcepts(drafts);
        const storage = getStorage();
        if (recover && storage.getItem(CONCEPT_STORAGE_KEY) !== saved) return drafts;
        storage.setItem(CONCEPT_STORAGE_KEY, value);
        saved = value;
        recover = false;
        error = '';
      } catch {
        recover = true;
        error = 'Der Browser konnte die Mappe nicht speichern. Sichere deine Arbeit per JSON-Export.';
      }
      return drafts;
    };
    return locks ? locks.request(CONCEPT_STORAGE_KEY, save) : Promise.resolve().then(save);
  }

  return { refresh, transact, get error() { return error; } };
}
