const ITEM_DB_OVERRIDE_KEY = 'aleria-item-db-overrides-v1';
const ITEM_DB_CUSTOM_KEY = 'aleria-item-db-custom-items-v1';
const ITEM_DB_DELETED_KEY = 'aleria-item-db-deleted-items-v1';
const ITEM_DB_SCAN_CACHE_KEY = 'aleria-item-db-scan-cache-v1';
const ITEM_DB_CONFIG_KEY = 'aleria-item-db-config-v1';
const ITEM_DB_META_KEY = 'aleria-item-db-meta-v1';
const ITEM_DB_EXPORT_SCHEMA = 'aleria-item-db-export-v1';
let _itemDbApplyingRemote = false;
let _itemDbGlobalSyncReady = false;
let _itemDbGlobalSyncStarted = false;
let _itemDbGlobalUnsubscribe = null;
let _itemDbGlobalSaveTimer = null;
let _itemDbGlobalSavePromise = Promise.resolve();

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

function itemDbReadMeta() {
  const meta = itemDbReadJsonStore(ITEM_DB_META_KEY, {});
  return meta && typeof meta === 'object' ? {
    updatedAtClient: Number(meta.updatedAtClient) || 0,
    remoteUpdatedAtClient: Number(meta.remoteUpdatedAtClient) || 0,
    pendingSync: !!meta.pendingSync
  } : { updatedAtClient: 0, remoteUpdatedAtClient: 0, pendingSync: false };
}

function itemDbWriteMeta(meta = {}) {
  localStorage.setItem(ITEM_DB_META_KEY, JSON.stringify({
    updatedAtClient: Number(meta.updatedAtClient) || 0,
    remoteUpdatedAtClient: Number(meta.remoteUpdatedAtClient) || 0,
    pendingSync: !!meta.pendingSync
  }));
}

function itemDbMarkLocalChanged() {
  if (_itemDbApplyingRemote) return;
  const previous = itemDbReadMeta();
  itemDbWriteMeta({
    ...previous,
    updatedAtClient: Date.now(),
    pendingSync: true
  });
  itemDbScheduleGlobalSave('local-change');
}

function itemDbWriteJsonStore(key, value, options = {}) {
  localStorage.setItem(key, JSON.stringify(value));
  if (options.markDirty !== false && key !== ITEM_DB_META_KEY) itemDbMarkLocalChanged();
}

function itemDbIsPayloadPopulated(payload = {}) {
  if (!payload || typeof payload !== 'object') return false;
  if (Array.isArray(payload.scanCache) && payload.scanCache.length) return true;
  if (Array.isArray(payload.customItems) && payload.customItems.length) return true;
  if (payload.overrides && typeof payload.overrides === 'object' && Object.keys(payload.overrides).length) return true;
  if (Array.isArray(payload.deletedKeys) && payload.deletedKeys.length) return true;
  const config = payload.config && typeof payload.config === 'object' ? payload.config : {};
  return !!(
    (Array.isArray(config.customCategories) && config.customCategories.length) ||
    (config.categorySettings && typeof config.categorySettings === 'object' && Object.keys(config.categorySettings).length) ||
    (Array.isArray(config.tags) && config.tags.length)
  );
}

function itemDbNormalizeDatabasePayload(payload = {}) {
  if (!payload || typeof payload !== 'object' || payload.schema !== ITEM_DB_EXPORT_SCHEMA) {
    throw new Error('Diese Datei ist kein gueltiger Items-und-Gueter-Datenbankexport.');
  }
  return {
    schema: ITEM_DB_EXPORT_SCHEMA,
    exportedAt: payload.exportedAt || new Date().toISOString(),
    updatedAtClient: Number(payload.updatedAtClient) || 0,
    scanCache: Array.isArray(payload.scanCache) ? payload.scanCache : [],
    customItems: Array.isArray(payload.customItems) ? payload.customItems : [],
    overrides: payload.overrides && typeof payload.overrides === 'object' ? payload.overrides : {},
    deletedKeys: Array.isArray(payload.deletedKeys) ? payload.deletedKeys : [],
    config: payload.config && typeof payload.config === 'object' ? payload.config : {}
  };
}

function itemDbApplyDatabasePayload(payload = {}, options = {}) {
  const normalized = itemDbNormalizeDatabasePayload(payload);
  const markDirty = options.markDirty === true;
  itemDbWriteScanCache(normalized.scanCache, { markDirty });
  itemDbWriteCustomItems(normalized.customItems, { markDirty });
  itemDbWriteOverrides(normalized.overrides, { markDirty });
  itemDbWriteDeletedKeys(new Set(normalized.deletedKeys), { markDirty });
  itemDbWriteConfig(normalized.config, { markDirty });
  return normalized;
}

function itemDbNotifyStoreUpdated(reason = 'store-updated') {
  window.dispatchEvent(new CustomEvent('item-db-store-updated', { detail: { reason } }));
}

function itemDbGetFirebaseApi() {
  return window._fb && typeof window._fb.loadItemDatabase === 'function' && typeof window._fb.saveItemDatabase === 'function'
    ? window._fb
    : null;
}

function itemDbWaitForFirebase(timeoutMs = 8000) {
  if (itemDbGetFirebaseApi()) return Promise.resolve(itemDbGetFirebaseApi());
  return new Promise(resolve => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      window.removeEventListener('fb-ready', handleReady);
      resolve(itemDbGetFirebaseApi());
    };
    const handleReady = () => finish();
    window.addEventListener('fb-ready', handleReady, { once: true });
    window.setTimeout(finish, timeoutMs);
  });
}

function itemDbBuildGlobalPayload() {
  return {
    ...itemDbExportDatabasePayload(),
    updatedAtClient: Date.now()
  };
}

function itemDbGetUtf8Bytes(value) {
  const text = typeof value === 'string' ? value : JSON.stringify(value ?? null);
  return typeof TextEncoder !== 'undefined'
    ? new TextEncoder().encode(text).length
    : unescape(encodeURIComponent(text)).length;
}

function itemDbFormatBytes(bytes) {
  const value = Number(bytes) || 0;
  if (value >= 1024 * 1024) return `${(value / 1024 / 1024).toFixed(2)} MB`;
  if (value >= 1024) return `${Math.round(value / 1024)} KB`;
  return `${value} B`;
}

function itemDbGetStorageMetrics(payload = itemDbExportDatabasePayload()) {
  const records = [];
  (payload.scanCache || []).forEach((item, index) => records.push({ label: item?.title || item?.canonicalKey || `Scan ${index + 1}`, value: item }));
  (payload.customItems || []).forEach((item, index) => records.push({ label: item?.title || item?.canonicalKey || `Eigenes Item ${index + 1}`, value: item }));
  Object.entries(payload.overrides || {}).forEach(([key, value]) => records.push({ label: `Überschreibung ${key}`, value }));
  records.push({
    label: 'Konfiguration',
    value: { deletedKeys: payload.deletedKeys || [], config: payload.config || {} }
  });
  const measured = records.map(record => ({ ...record, bytes: itemDbGetUtf8Bytes(record.value) }));
  const largest = measured.reduce((current, record) => record.bytes > (current?.bytes || 0) ? record : current, null);
  return {
    totalBytes: itemDbGetUtf8Bytes(payload),
    largestEntryBytes: largest?.bytes || 0,
    largestEntryLabel: largest?.label || 'Keine Einträge',
    documentCount: measured.length
  };
}

function itemDbScheduleGlobalSave(reason = 'change') {
  if (_itemDbApplyingRemote || !_itemDbGlobalSyncReady) return;
  window.clearTimeout(_itemDbGlobalSaveTimer);
  _itemDbGlobalSaveTimer = window.setTimeout(() => {
    itemDbSaveGlobalDatabase(reason).catch(error => {
      console.error('Item database global save failed:', error);
    });
  }, 700);
}

async function itemDbSaveGlobalDatabase(reason = 'manual') {
  const fb = await itemDbWaitForFirebase();
  if (!fb || typeof fb.saveItemDatabase !== 'function') return false;
  const payload = itemDbBuildGlobalPayload();
  _itemDbGlobalSavePromise = _itemDbGlobalSavePromise.then(async () => {
    if (typeof updateFirebaseSyncStatus === 'function') updateFirebaseSyncStatus('syncing', 'Item-Register wird gespeichert...');
    await fb.saveItemDatabase(payload);
    const meta = itemDbReadMeta();
    itemDbWriteMeta({
      ...meta,
      updatedAtClient: payload.updatedAtClient,
      remoteUpdatedAtClient: payload.updatedAtClient,
      pendingSync: false
    });
    if (typeof updateFirebaseSyncStatus === 'function') updateFirebaseSyncStatus('synced', 'Item-Register global gespeichert.');
    return true;
  }).catch(error => {
    const meta = itemDbReadMeta();
    itemDbWriteMeta({ ...meta, pendingSync: true });
    if (typeof updateFirebaseSyncStatus === 'function') updateFirebaseSyncStatus('error', 'Item-Register konnte nicht gespeichert werden.');
    throw error;
  });
  return _itemDbGlobalSavePromise;
}

async function itemDbEnsureGlobalSync() {
  if (_itemDbGlobalSyncStarted) return;
  _itemDbGlobalSyncStarted = true;
  const fb = await itemDbWaitForFirebase();
  if (!fb || typeof fb.loadItemDatabase !== 'function') {
    if (typeof updateFirebaseSyncStatus === 'function') updateFirebaseSyncStatus('local', 'Item-Register bleibt lokal.');
    return;
  }

  try {
    if (typeof updateFirebaseSyncStatus === 'function') updateFirebaseSyncStatus('syncing', 'Item-Register wird geladen...');
    const remotePayload = await fb.loadItemDatabase();
    const localPayload = itemDbExportDatabasePayload();
    const localHasData = itemDbIsPayloadPopulated(localPayload);
    if (remotePayload && itemDbIsPayloadPopulated(remotePayload)) {
      _itemDbApplyingRemote = true;
      const normalized = itemDbApplyDatabasePayload(remotePayload, { markDirty: false });
      _itemDbApplyingRemote = false;
      itemDbWriteMeta({
        updatedAtClient: Number(normalized.updatedAtClient) || Date.now(),
        remoteUpdatedAtClient: Number(normalized.updatedAtClient) || Date.now(),
        pendingSync: false
      });
      itemDbNotifyStoreUpdated('remote-load');
    } else if (localHasData) {
      _itemDbGlobalSyncReady = true;
      await itemDbSaveGlobalDatabase('bootstrap-local');
    }

    _itemDbGlobalSyncReady = true;
    if (typeof fb.subscribeItemDatabase === 'function' && !_itemDbGlobalUnsubscribe) {
      _itemDbGlobalUnsubscribe = fb.subscribeItemDatabase(payload => {
        if (!payload || !itemDbIsPayloadPopulated(payload)) return;
        const remoteUpdatedAt = Number(payload.updatedAtClient) || 0;
        const meta = itemDbReadMeta();
        if (remoteUpdatedAt && remoteUpdatedAt <= meta.remoteUpdatedAtClient) return;
        if (meta.pendingSync && meta.updatedAtClient > remoteUpdatedAt) {
          itemDbScheduleGlobalSave('local-newer-than-remote');
          return;
        }
        try {
          _itemDbApplyingRemote = true;
          const normalized = itemDbApplyDatabasePayload(payload, { markDirty: false });
          _itemDbApplyingRemote = false;
          const appliedAt = Number(normalized.updatedAtClient) || Date.now();
          itemDbWriteMeta({
            updatedAtClient: appliedAt,
            remoteUpdatedAtClient: appliedAt,
            pendingSync: false
          });
          itemDbNotifyStoreUpdated('remote-update');
        } catch (error) {
          _itemDbApplyingRemote = false;
          console.error('Item database remote update failed:', error);
        }
      }, error => {
        console.error('Item database subscription failed:', error);
      });
    }
    if (typeof updateFirebaseSyncStatus === 'function') updateFirebaseSyncStatus('synced', 'Item-Register verbunden.');
  } catch (error) {
    _itemDbApplyingRemote = false;
    _itemDbGlobalSyncReady = true;
    if (typeof updateFirebaseSyncStatus === 'function') updateFirebaseSyncStatus('error', 'Item-Register-Sync fehlgeschlagen.');
    throw error;
  }
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

function itemDbWriteOverrides(overrides = {}, options = {}) {
  itemDbWriteJsonStore(ITEM_DB_OVERRIDE_KEY, overrides, options);
}

function itemDbReadCustomItems() {
  const items = itemDbReadJsonStore(ITEM_DB_CUSTOM_KEY, []);
  return Array.isArray(items) ? items.filter(item => item && typeof item === 'object') : [];
}

function itemDbWriteCustomItems(items = [], options = {}) {
  itemDbWriteJsonStore(ITEM_DB_CUSTOM_KEY, Array.isArray(items) ? items : [], options);
}

function itemDbReadDeletedKeys() {
  const keys = itemDbReadJsonStore(ITEM_DB_DELETED_KEY, []);
  return new Set(Array.isArray(keys) ? keys.map(key => String(key || '').trim()).filter(Boolean) : []);
}

function itemDbWriteDeletedKeys(keys, options = {}) {
  itemDbWriteJsonStore(ITEM_DB_DELETED_KEY, Array.from(keys || []).filter(Boolean), options);
}

function itemDbReadScanCache() {
  const items = itemDbReadJsonStore(ITEM_DB_SCAN_CACHE_KEY, []);
  return Array.isArray(items) ? items.filter(item => item && typeof item === 'object') : [];
}

function itemDbWriteScanCache(items = [], options = {}) {
  itemDbWriteJsonStore(ITEM_DB_SCAN_CACHE_KEY, Array.isArray(items) ? items : [], options);
}

function itemDbReadConfig() {
  const config = itemDbReadJsonStore(ITEM_DB_CONFIG_KEY, {});
  return config && typeof config === 'object' ? {
    customCategories: Array.isArray(config.customCategories) ? config.customCategories : [],
    categorySettings: config.categorySettings && typeof config.categorySettings === 'object' ? config.categorySettings : {},
    tags: Array.isArray(config.tags) ? config.tags : []
  } : { customCategories: [], categorySettings: {}, tags: [] };
}

function itemDbWriteConfig(config = {}, options = {}) {
  itemDbWriteJsonStore(ITEM_DB_CONFIG_KEY, {
    customCategories: Array.isArray(config.customCategories) ? config.customCategories : [],
    categorySettings: config.categorySettings && typeof config.categorySettings === 'object' ? config.categorySettings : {},
    tags: Array.isArray(config.tags) ? config.tags : []
  }, options);
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
    schema: ITEM_DB_EXPORT_SCHEMA,
    exportedAt: new Date().toISOString(),
    updatedAtClient: itemDbReadMeta().updatedAtClient || Date.now(),
    scanCache: itemDbReadScanCache(),
    customItems: itemDbReadCustomItems(),
    overrides: itemDbReadOverrides(),
    deletedKeys: Array.from(itemDbReadDeletedKeys()),
    config: itemDbReadConfig()
  };
}

function itemDbImportDatabasePayload(payload = {}) {
  itemDbApplyDatabasePayload(payload, { markDirty: true });
}
