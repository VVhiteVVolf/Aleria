// Entry-content upgrades are owned by their features. The shared normalizer
// uses this boundary for local caches, remote records, imports and editor drafts.
function migrateModuleEntryContent(entry) {
  const migrated = typeof migrateMorgarLanguageEntry === 'function'
    ? migrateMorgarLanguageEntry(entry)
    : entry;
  return typeof AleriaLandingModel !== 'undefined'
    ? AleriaLandingModel.migrateGroupLandingEntry(migrated)
    : migrated;
}

function migrateModuleEntryForSection(entry, section) {
  return typeof AleriaLandingModel !== 'undefined'
    ? AleriaLandingModel.migrateGroupLandingEntry(entry, { tab: section?.tab || section?.key || '' })
    : entry;
}
