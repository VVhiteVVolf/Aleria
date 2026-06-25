const ITEM_DB_OVERRIDE_KEY = 'aleria-item-db-overrides-v1';
const ITEM_DB_CUSTOM_KEY = 'aleria-item-db-custom-items-v1';
const ITEM_DB_DELETED_KEY = 'aleria-item-db-deleted-items-v1';
const ITEM_DB_SCAN_CACHE_KEY = 'aleria-item-db-scan-cache-v1';
const ITEM_DB_CONFIG_KEY = 'aleria-item-db-config-v1';

function itemDbReadJsonStore(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : fallback;
    return parsed ?? fallback;
  } catch (error) {
    console.warn('Item database store could not be read:', key, error);
    return fallback;
  }
}

function itemDbWriteJsonStore(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function itemDbReadOverrides() {
  try {
    const raw = localStorage.getItem(ITEM_DB_OVERRIDE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (error) {
    console.warn('Item database overrides could not be read:', error);
    return {};
  }
}

function itemDbWriteOverrides(overrides = {}) {
  localStorage.setItem(ITEM_DB_OVERRIDE_KEY, JSON.stringify(overrides));
}

function itemDbReadCustomItems() {
  const items = itemDbReadJsonStore(ITEM_DB_CUSTOM_KEY, []);
  return Array.isArray(items) ? items.filter(item => item && typeof item === 'object') : [];
}

function itemDbWriteCustomItems(items = []) {
  itemDbWriteJsonStore(ITEM_DB_CUSTOM_KEY, Array.isArray(items) ? items : []);
}

function itemDbReadDeletedKeys() {
  const keys = itemDbReadJsonStore(ITEM_DB_DELETED_KEY, []);
  return new Set(Array.isArray(keys) ? keys.map(key => String(key || '').trim()).filter(Boolean) : []);
}

function itemDbWriteDeletedKeys(keys) {
  itemDbWriteJsonStore(ITEM_DB_DELETED_KEY, Array.from(keys || []).filter(Boolean));
}

function itemDbReadScanCache() {
  const items = itemDbReadJsonStore(ITEM_DB_SCAN_CACHE_KEY, []);
  return Array.isArray(items) ? items.filter(item => item && typeof item === 'object') : [];
}

function itemDbWriteScanCache(items = []) {
  itemDbWriteJsonStore(ITEM_DB_SCAN_CACHE_KEY, Array.isArray(items) ? items : []);
}

function itemDbReadConfig() {
  const config = itemDbReadJsonStore(ITEM_DB_CONFIG_KEY, {});
  return config && typeof config === 'object' ? {
    customCategories: Array.isArray(config.customCategories) ? config.customCategories : [],
    categorySettings: config.categorySettings && typeof config.categorySettings === 'object' ? config.categorySettings : {},
    tags: Array.isArray(config.tags) ? config.tags : []
  } : { customCategories: [], categorySettings: {}, tags: [] };
}

function itemDbWriteConfig(config = {}) {
  itemDbWriteJsonStore(ITEM_DB_CONFIG_KEY, {
    customCategories: Array.isArray(config.customCategories) ? config.customCategories : [],
    categorySettings: config.categorySettings && typeof config.categorySettings === 'object' ? config.categorySettings : {},
    tags: Array.isArray(config.tags) ? config.tags : []
  });
}

function itemDbGetCategories() {
  const config = itemDbReadConfig();
  const defaults = Array.isArray(ITEM_DB_CATEGORIES) ? ITEM_DB_CATEGORIES : [];
  const usedIds = new Set(defaults.map(category => category.id));
  const customCategories = config.customCategories
    .map(category => ({
      id: itemDbSlugify(category?.id || category?.label || '', ''),
      label: String(category?.label || '').trim()
    }))
    .filter(category => category.id && category.label && !usedIds.has(category.id));
  return [...defaults, ...customCategories];
}

function itemDbGetCategorySettings(categoryId) {
  const key = String(categoryId || '').trim();
  const settings = itemDbReadConfig().categorySettings[key] || {};
  return {
    columns: itemDbNormalizeTags(settings.columns),
    tags: itemDbNormalizeTags(settings.tags)
  };
}

function itemDbGetDefinedTags() {
  const config = itemDbReadConfig();
  const configured = new Set(itemDbNormalizeTags(config.tags));
  Object.values(config.categorySettings || {}).forEach(settings => {
    itemDbNormalizeTags(settings?.tags).forEach(tag => configured.add(tag));
  });
  return Array.from(configured).sort((a, b) => a.localeCompare(b, 'de', { sensitivity: 'base' }));
}

function itemDbAddCustomCategory(values = {}) {
  const label = String(values.label || '').trim();
  if (!label) throw new Error('Ein Kategoriename ist erforderlich.');
  const config = itemDbReadConfig();
  const categories = itemDbGetCategories();
  let id = itemDbSlugify(values.id || label, '');
  if (!id) throw new Error('Aus diesem Kategorienamen kann keine ID gebildet werden.');
  const usedIds = new Set(categories.map(category => category.id));
  const baseId = id;
  let index = 2;
  while (usedIds.has(id)) {
    id = `${baseId}-${index}`;
    index += 1;
  }
  config.customCategories.push({ id, label });
  config.categorySettings[id] = {
    columns: itemDbNormalizeTags(values.columns),
    tags: itemDbNormalizeTags(values.tags)
  };
  itemDbWriteConfig(config);
  return id;
}

function itemDbSaveCategoryConfig(rows = [], tags = []) {
  const config = itemDbReadConfig();
  const defaultIds = new Set((Array.isArray(ITEM_DB_CATEGORIES) ? ITEM_DB_CATEGORIES : []).map(category => category.id));
  const customCategories = [];
  const categorySettings = {};

  rows.forEach(row => {
    const id = itemDbSlugify(row?.id || row?.label || '', '');
    if (!id || id === 'alle') return;
    const label = String(row?.label || '').trim();
    if (!defaultIds.has(id) && label) customCategories.push({ id, label });
    categorySettings[id] = {
      columns: itemDbNormalizeTags(row?.columns),
      tags: itemDbNormalizeTags(row?.tags)
    };
  });

  itemDbWriteConfig({
    customCategories,
    categorySettings,
    tags: itemDbNormalizeTags(tags)
  });
}

function itemDbDeleteCustomCategory(categoryId) {
  const id = String(categoryId || '').trim();
  if (!id) return;
  const config = itemDbReadConfig();
  config.customCategories = config.customCategories.filter(category => String(category?.id || '') !== id);
  delete config.categorySettings[id];
  itemDbWriteConfig(config);
}

function itemDbGetSourceSnapshotItems() {
  return itemDbReadScanCache()
    .map(item => itemDbNormalizeItem(item))
    .filter(Boolean);
}

function itemDbAppendScanCandidates(candidates = []) {
  const cache = itemDbReadScanCache();
  const existingKeys = new Set(cache.map(item => String(item?.canonicalKey || '').trim()).filter(Boolean));
  let added = 0;

  candidates.forEach(candidate => {
    const normalized = itemDbNormalizeItem(candidate);
    if (!normalized || existingKeys.has(normalized.canonicalKey)) return;
    existingKeys.add(normalized.canonicalKey);
    cache.push({
      ...normalized,
      canonicalKey: normalized.canonicalKey,
      sourceRefs: normalized.sourceRefs || [],
      hiddenMeta: normalized.hiddenMeta || {},
      scannedAt: Date.now()
    });
    added += 1;
  });

  if (added) itemDbWriteScanCache(cache);
  return { added, total: cache.length };
}

function itemDbApplyOverride(item, override = {}) {
  if (!item || !override || typeof override !== 'object') return item;
  const normalizedOverride = itemDbNormalizeItem({
    ...item,
    ...override,
    canonicalKey: item.canonicalKey,
    sourceRefs: item.sourceRefs
  });
  return normalizedOverride ? {
    ...item,
    ...normalizedOverride,
    canonicalKey: item.canonicalKey,
    id: item.id,
    sourceRefs: item.sourceRefs,
    hiddenMeta: { ...(item.hiddenMeta || {}), ...(normalizedOverride.hiddenMeta || {}) },
    editedLocally: true
  } : item;
}

function itemDbBuildIndex() {
  const merged = new Map();
  itemDbGetSourceSnapshotItems().forEach(candidate => {
    const normalized = itemDbNormalizeItem(candidate);
    if (!normalized) return;
    const existing = merged.get(normalized.canonicalKey);
    merged.set(normalized.canonicalKey, itemDbMergeItems(existing, normalized));
  });

  itemDbReadCustomItems().forEach(customItem => {
    const normalized = itemDbNormalizeItem(customItem);
    const canonicalKey = String(customItem.canonicalKey || '').trim();
    if (!normalized || !canonicalKey) return;
    merged.set(canonicalKey, {
      ...normalized,
      id: `item-${canonicalKey.replace(/[^a-z0-9-]+/g, '-')}`,
      canonicalKey,
      sourceRefs: [{ kind: 'local-item', moduleTitle: 'Items und Güter' }],
      editedLocally: true,
      locallyCreated: true
    });
  });

  const overrides = itemDbReadOverrides();
  Object.entries(overrides).forEach(([canonicalKey, override]) => {
    const base = merged.get(canonicalKey);
    if (base) merged.set(canonicalKey, itemDbApplyOverride(base, override));
  });

  const deletedKeys = itemDbReadDeletedKeys();
  return Array.from(merged.values())
    .filter(item => !deletedKeys.has(item.canonicalKey))
    .sort((a, b) => a.categoryLabel.localeCompare(b.categoryLabel, 'de') || a.title.localeCompare(b.title, 'de'));
}

function itemDbGetSummary(items = itemDbBuildIndex()) {
  return {
    itemCount: items.length,
    sourceCount: items.reduce((sum, item) => sum + (item.sourceRefs?.length || 0), 0),
    duplicateCount: items.filter(item => (item.sourceRefs?.length || 0) > 1).length
  };
}

function itemDbSaveOverride(canonicalKey, updates = {}) {
  const key = String(canonicalKey || '').trim();
  if (!key) return;
  const overrides = itemDbReadOverrides();
  const existing = overrides[key] || {};
  overrides[key] = {
    ...existing,
    title: String(updates.title || '').trim(),
    category: String(updates.category || ITEM_DB_DEFAULT_CATEGORY).trim(),
    type: String(updates.type || '').trim(),
    description: String(updates.description || '').trim(),
    details: String(updates.details || '').trim(),
    price: String(updates.price || '').trim(),
    currency: String(updates.currency || '').trim(),
    image: String(updates.image || '').trim(),
    tags: itemDbNormalizeTags(updates.tags),
    attributes: Object.prototype.hasOwnProperty.call(updates, 'attributes')
      ? itemDbNormalizeAttributes(updates.attributes)
      : (existing.attributes || []),
    hiddenMeta: {
      ...(existing.hiddenMeta || {}),
      ...(updates.hiddenMeta && typeof updates.hiddenMeta === 'object' ? updates.hiddenMeta : {})
    },
    updatedAt: Date.now()
  };
  itemDbWriteOverrides(overrides);
}

function itemDbClearOverride(canonicalKey) {
  const key = String(canonicalKey || '').trim();
  if (!key) return;
  const overrides = itemDbReadOverrides();
  delete overrides[key];
  itemDbWriteOverrides(overrides);
}

function itemDbCreateCustomItem(updates = {}) {
  const normalized = itemDbNormalizeItem(updates);
  if (!normalized) throw new Error('Ein Titel ist erforderlich.');
  const canonicalKey = `custom:${itemDbSlugify(normalized.title)}-${Date.now().toString(36)}`;
  const customItems = itemDbReadCustomItems();
  customItems.push({ ...normalized, ...updates, canonicalKey, createdAt: Date.now(), updatedAt: Date.now() });
  itemDbWriteCustomItems(customItems);
  return canonicalKey;
}

function itemDbUpdateCustomItem(canonicalKey, updates = {}) {
  const key = String(canonicalKey || '').trim();
  const customItems = itemDbReadCustomItems();
  const index = customItems.findIndex(item => String(item?.canonicalKey || '') === key);
  if (index < 0) return false;
  const normalized = itemDbNormalizeItem({ ...customItems[index], ...updates });
  if (!normalized) throw new Error('Ein Titel ist erforderlich.');
  customItems[index] = { ...customItems[index], ...normalized, ...updates, canonicalKey: key, updatedAt: Date.now() };
  itemDbWriteCustomItems(customItems);
  return true;
}

function itemDbSaveItem(canonicalKey, updates = {}) {
  if (String(canonicalKey || '').startsWith('custom:') && itemDbUpdateCustomItem(canonicalKey, updates)) return;
  itemDbSaveOverride(canonicalKey, updates);
}

function itemDbDeleteItem(canonicalKey) {
  const key = String(canonicalKey || '').trim();
  if (!key) return;
  if (key.startsWith('custom:')) {
    itemDbWriteCustomItems(itemDbReadCustomItems().filter(item => String(item?.canonicalKey || '') !== key));
  }
  const deletedKeys = itemDbReadDeletedKeys();
  deletedKeys.add(key);
  itemDbWriteDeletedKeys(deletedKeys);
  const overrides = itemDbReadOverrides();
  delete overrides[key];
  itemDbWriteOverrides(overrides);
}

function itemDbExportDatabasePayload() {
  return {
    schema: 'aleria-item-db-export-v1',
    exportedAt: new Date().toISOString(),
    scanCache: itemDbReadScanCache(),
    customItems: itemDbReadCustomItems(),
    overrides: itemDbReadOverrides(),
    deletedKeys: Array.from(itemDbReadDeletedKeys()),
    config: itemDbReadConfig()
  };
}

function itemDbImportDatabasePayload(payload = {}) {
  if (!payload || typeof payload !== 'object' || payload.schema !== 'aleria-item-db-export-v1') {
    throw new Error('Diese Datei ist kein gueltiger Items-und-Gueter-Datenbankexport.');
  }
  itemDbWriteScanCache(Array.isArray(payload.scanCache) ? payload.scanCache : []);
  itemDbWriteCustomItems(Array.isArray(payload.customItems) ? payload.customItems : []);
  itemDbWriteOverrides(payload.overrides && typeof payload.overrides === 'object' ? payload.overrides : {});
  itemDbWriteDeletedKeys(new Set(Array.isArray(payload.deletedKeys) ? payload.deletedKeys : []));
  itemDbWriteConfig(payload.config && typeof payload.config === 'object' ? payload.config : {});
}
