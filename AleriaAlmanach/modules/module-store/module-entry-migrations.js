// Entry-content upgrades are owned by their features. The shared normalizer
// uses this boundary for local caches, remote records, imports and editor drafts.
function migrateModuleEntryContent(entry) {
  return typeof migrateMorgarLanguageEntry === 'function'
    ? migrateMorgarLanguageEntry(entry)
    : entry;
}
