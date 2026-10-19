// Entry-content upgrades are owned by their features. The shared normalizer
// uses this boundary for local caches, remote records, imports and editor drafts.
function migrateModuleEntryContent(entry) {
  const migrated = typeof migrateMorgarLanguageEntry === 'function'
    ? migrateMorgarLanguageEntry(entry)
    : entry;
  const landing = typeof AleriaLandingModel !== 'undefined'
    ? AleriaLandingModel.migrateGroupLandingEntry(migrated)
    : migrated;
  return globalThis.AleriaEconomy?.applyPriceReview(landing) || landing;
}

function migrateModuleEntryForSection(entry, section) {
  const migrated = typeof AleriaLandingModel !== 'undefined'
    ? AleriaLandingModel.migrateGroupLandingEntry(entry, { tab: section?.tab || section?.key || '' })
    : entry;
  return globalThis.AleriaEconomy?.upgradeEntry(migrated, section) || migrated;
}
