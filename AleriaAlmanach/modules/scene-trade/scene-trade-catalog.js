// Index only when the immutable offers snapshot changes. Typing searches the
// selected merchant's normalized strings, never every merchant or definition.
const indexes = new WeakMap();
const EMPTY = Object.freeze([]);
const MAX_PAGE_SIZE = 96;
const QUERY_CACHE_SIZE = 24;

export function normalizeSceneTradeSearch(value) {
  return String(value ?? '').trim().toLocaleLowerCase('de').normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '').replace(/ß/g, 'ss');
}
function indexFor(data) {
  const offers = Array.isArray(data?.offers) ? data.offers : EMPTY;
  let index = indexes.get(offers);
  if (index) return index;
  const merchants = new Map(), byId = new Map();
  for (const product of offers) {
    const merchantId = String(product.listId || '');
    const merchant = merchants.get(merchantId) || { rows: [], byId: new Map(), queries: new Map() };
    merchant.rows.push(Object.freeze({ product, search: normalizeSceneTradeSearch([product.title, product.name, product.type, product.category].filter(Boolean).join(' ')) }));
    if (!merchant.byId.has(product.id)) merchant.byId.set(product.id, product);
    if (!byId.has(product.id)) byId.set(product.id, product);
    merchants.set(merchantId, merchant);
  }
  for (const merchant of merchants.values()) Object.freeze(merchant.rows);
  index = { merchants, byId };
  indexes.set(offers, index);
  return index;
}
export function findSceneTradeProduct(data, productId, merchantId = '') {
  const index = indexFor(data);
  return (merchantId ? index.merchants.get(merchantId)?.byId.get(productId) : index.byId.get(productId)) || null;
}
export function querySceneTradeCatalog(data, { merchantId = '', search = '', category = '', limit = 24, offset = 0 } = {}) {
  const merchant = indexFor(data).merchants.get(merchantId);
  const query = normalizeSceneTradeSearch(search), categoryId = String(category || '');
  const count = Number.isSafeInteger(limit) && limit > 0 ? Math.min(limit, MAX_PAGE_SIZE) : 24;
  const start = Number.isSafeInteger(offset) && offset >= 0 ? offset : 0;
  let rows = merchant?.rows || EMPTY;
  if (merchant && (query || categoryId)) {
    const key = JSON.stringify([query, categoryId]);
    let matches = merchant.queries.get(key);
    if (!matches) {
      matches = Object.freeze(rows.filter(row => (!query || row.search.includes(query)) && (!categoryId || row.product.category === categoryId)));
      if (merchant.queries.size >= QUERY_CACHE_SIZE) merchant.queries.delete(merchant.queries.keys().next().value);
      merchant.queries.set(key, matches);
    }
    rows = matches;
  }
  return Object.freeze({ items: Object.freeze(rows.slice(start, start + count).map(row => row.product)),
    total: rows.length, hasMore: start + count < rows.length, offset: start, limit: count });
}
