const STORAGE_KEY = 'aleria_bestiarium_horse_breeding_v1';
const MAX_RECORDS = 120;

const cleanText = (value, maximum = 80) => String(value || '').trim().slice(0, maximum);
const emptyState = () => ({ records: [], customCrossNames: {} });

function normalizeState(value) {
  const state = value && typeof value === 'object' ? value : emptyState();
  const records = Array.isArray(state.records) ? state.records.slice(0, MAX_RECORDS) : [];
  const customCrossNames = state.customCrossNames && typeof state.customCrossNames === 'object'
    ? Object.fromEntries(Object.entries(state.customCrossNames).map(([key, name]) => [key, cleanText(name)]).filter(([, name]) => name))
    : {};
  return { records, customCrossNames };
}

export function createHorseBreedingStore(storage) {
  let memoryState = emptyState();
  const read = () => {
    try {
      const persisted = storage.getItem(STORAGE_KEY);
      if (persisted == null) return memoryState;
      memoryState = normalizeState(JSON.parse(persisted));
      return memoryState;
    } catch {
      return memoryState;
    }
  };
  const write = state => {
    const normalized = normalizeState(state);
    memoryState = normalized;
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    } catch {
      // A private or full browser storage must not make the calculator unusable.
    }
    return normalized;
  };

  return {
    read,
    addRecord(record) {
      const state = read();
      const saved = {
        ...record,
        id: cleanText(record.id, 120),
        foalName: cleanText(record.foalName),
        crossName: cleanText(record.crossName),
        notes: cleanText(record.notes, 500)
      };
      state.records = [saved, ...state.records.filter(entry => entry.id !== saved.id)].slice(0, MAX_RECORDS);
      return write(state);
    },
    removeRecord(recordId) {
      const state = read();
      state.records = state.records.filter(record => record.id !== recordId);
      return write(state);
    },
    setCustomCrossName(pairKey, name) {
      const state = read();
      const cleaned = cleanText(name);
      if (cleaned) state.customCrossNames[pairKey] = cleaned;
      else delete state.customCrossNames[pairKey];
      return write(state);
    },
    mergeCustomCrossNames(crossNames) {
      const state = read();
      for (const [pairKey, name] of Object.entries(crossNames || {})) {
        const cleaned = cleanText(name);
        if (pairKey && cleaned && !state.customCrossNames[pairKey]) state.customCrossNames[pairKey] = cleaned;
      }
      return write(state);
    }
  };
}
