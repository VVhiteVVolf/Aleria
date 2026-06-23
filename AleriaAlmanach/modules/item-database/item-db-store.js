const ITEM_DB_OVERRIDE_KEY = 'aleria-item-db-overrides-v1';
const ITEM_DB_CUSTOM_KEY = 'aleria-item-db-custom-items-v1';
const ITEM_DB_DELETED_KEY = 'aleria-item-db-deleted-items-v1';

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
  itemDbCollectSourceCandidates().forEach(candidate => {
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
