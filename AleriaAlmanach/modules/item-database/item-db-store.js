// Read-only compatibility for historic exports. New shared state and transactions
// are owned by item-register-store / item-register-firebase.
const ITEM_DB_EXPORT_SCHEMA = 'aleria-item-db-export-v1';
function itemDbReadJsonStore(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; }
  catch { return fallback; }
}
function itemDbReadConfig() {
  return itemDbReadJsonStore('aleria-item-db-config-v1', { customCategories: [], categorySettings: {}, tags: [] });
}
function itemDbGetCategories() {
  return [...ITEM_DB_CATEGORIES, ...(itemDbReadConfig().customCategories || [])];
}
function itemDbGetCategorySettings(id) { return itemDbReadConfig().categorySettings?.[id] || { columns: [], tags: [] }; }
function itemDbGetDefinedTags() { return itemDbReadConfig().tags || []; }
function itemDbReadScanCache() { return itemDbReadJsonStore('aleria-item-db-scan-cache-v1', []); }
function itemDbReadCustomItems() { return itemDbReadJsonStore('aleria-item-db-custom-items-v1', []); }
function itemDbReadOverrides() { return itemDbReadJsonStore('aleria-item-db-overrides-v1', {}); }
function itemDbReadDeletedKeys() { return new Set(itemDbReadJsonStore('aleria-item-db-deleted-items-v1', [])); }
function itemDbExportDatabasePayload() {
  return { schema: ITEM_DB_EXPORT_SCHEMA, scanCache: itemDbReadScanCache(),
    customItems: itemDbReadCustomItems(), overrides: itemDbReadOverrides(),
    deletedKeys: [...itemDbReadDeletedKeys()], config: itemDbReadConfig() };
}
function itemDbBuildIndex() { return window.AleriaItemRegister?.getItems() || []; }
function itemDbEnsureGlobalSync() {
  if (window.AleriaItemRegister) return Promise.resolve(window.AleriaItemRegister.ensure());
  return import('../item-register/item-register-ui.js?v=20260912-register-v2').then(() => window.AleriaItemRegister?.ensure());
}
