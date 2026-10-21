// Entry-content upgrades are owned by their features. The shared normalizer
// uses this boundary for local caches, remote records, imports and editor drafts.
function migrateModuleEntryContent(entry) {
  const migrated = typeof migrateMorgarLanguageEntry === 'function'
    ? migrateMorgarLanguageEntry(entry)
    : entry;
  const landing = typeof AleriaLandingModel !== 'undefined'
    ? AleriaLandingModel.migrateGroupLandingEntry(migrated)
    : migrated;
  const gang = typeof migrateZitteraaleEntry === 'function' ? migrateZitteraaleEntry(landing) : landing;
  const household = typeof migrateHouseholdWorkplaceEntry === 'function'
    ? migrateHouseholdWorkplaceEntry(gang) : gang;
  return globalThis.AleriaEconomy?.applyPriceReview(household) || household;
}

function migrateModuleEntryForSection(entry, section) {
  const migrated = typeof AleriaLandingModel !== 'undefined'
    ? AleriaLandingModel.migrateGroupLandingEntry(entry, { tab: section?.tab || section?.key || '' })
    : entry;
  const gang = typeof migrateZitteraaleEntry === 'function' ? migrateZitteraaleEntry(migrated) : migrated;
  const household = typeof migrateHouseholdWorkplaceEntry === 'function'
    ? migrateHouseholdWorkplaceEntry(gang) : gang;
  return globalThis.AleriaEconomy?.upgradeEntry(household, section) || household;
}
