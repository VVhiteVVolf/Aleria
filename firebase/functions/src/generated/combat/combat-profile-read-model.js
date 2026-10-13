// Calculation snapshots are detached and immutable. They can skip repeated
// defensive normalization without caching values from mutable character sheets.
const readModels = new WeakSet();

export function isCombatProfileReadModel(profile) {
  return profile != null && typeof profile === 'object' && readModels.has(profile);
}

export function freezeCombatProfileReadModel(profile) {
  const snapshot = structuredClone(profile);
  const seen = new WeakSet();
  const freeze = value => {
    if (!value || typeof value !== 'object' || seen.has(value)) return;
    seen.add(value);
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  };
  freeze(snapshot);
  readModels.add(snapshot);
  return snapshot;
}
