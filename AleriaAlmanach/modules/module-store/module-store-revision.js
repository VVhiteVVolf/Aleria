// Firestore imports have used both epoch milliseconds and ISO timestamps.
// Normalize at the repository boundary before comparing online and cached data.
export function parseModuleStoreRevision(value) {
  let timestamp = 0;
  if (typeof value === 'number') timestamp = value;
  else if (typeof value === 'string' && value.trim()) {
    const text = value.trim();
    timestamp = /^\d+$/.test(text) ? Number(text)
      : /^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/.test(text) ? Date.parse(text) : 0;
  } else if (typeof value?.toMillis === 'function') timestamp = value.toMillis();
  return Number.isFinite(timestamp) && timestamp > 0 ? timestamp : 0;
}

export function getFirebaseModuleStoreRevision(config = {}) {
  return parseModuleStoreRevision(config.moduleStoreManifest?.updatedAtClient)
    || parseModuleStoreRevision(config.moduleStoreUpdatedAtClient)
    || parseModuleStoreRevision(config.moduleStoreUpdatedAt);
}
